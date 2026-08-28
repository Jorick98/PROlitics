import { useState, type ChangeEvent, type DragEvent, type PointerEvent } from 'react'
import { Activity, Check, CircleDot, GitBranch, Layers3, Link2, Play, Plus, RotateCcw, Save, Settings2, Trash2, X } from 'lucide-react'
import { analyzeProcess, type NodeType, type ProcessEdge, type ProcessNode } from './engine'

type Tool = { type: NodeType; label: string; icon: typeof CircleDot }
type Selection = { kind: 'node' | 'edge'; id: string } | null
type Model = { nodes: ProcessNode[]; edges: ProcessEdge[] }

const tools: Tool[] = [
  { type: 'process', label: 'Process step', icon: Settings2 },
  { type: 'decision', label: 'Decision', icon: GitBranch },
  { type: 'parallel', label: 'Parallel', icon: Layers3 },
]
const nodeColors: Record<NodeType, string> = { start: '#2e7d66', process: '#e88943', decision: '#1e6b73', parallel: '#7259a8', end: '#30383b', defect: '#bd6757' }
const nodeLabels: Record<NodeType, string> = { start: 'START', process: 'STEP', decision: 'DECISION', parallel: 'PARALLEL', end: 'DONE', defect: 'FAILED' }
const initialModel: Model = {
  nodes: [
    { id: 'start', type: 'start', name: 'New request', x: 72, y: 192, duration: 2, failureRate: 0, reworkRate: 0, cost: 0, capacity: 1 },
    { id: 'check', type: 'process', name: 'Check & validate', x: 288, y: 192, duration: 14, failureRate: 4, reworkRate: 15, cost: 8.5, capacity: 2 },
    { id: 'decision', type: 'decision', name: 'Data complete?', x: 504, y: 192, duration: 1, failureRate: 0, reworkRate: 0, cost: 0, capacity: 1 },
    { id: 'approve', type: 'process', name: 'Approve', x: 720, y: 96, duration: 9, failureRate: 2, reworkRate: 0, cost: 14, capacity: 1 },
    { id: 'end', type: 'end', name: 'Completed', x: 936, y: 192, duration: 0, failureRate: 0, reworkRate: 0, cost: 0, capacity: 1 },
    { id: 'defect', type: 'defect', name: 'Failed / rejected', x: 720, y: 360, duration: 0, failureRate: 0, reworkRate: 0, cost: 0, capacity: 1 },
  ],
  edges: [
    { id: 'e1', source: 'start', target: 'check', probability: 100 },
    { id: 'e2', source: 'check', target: 'decision', probability: 100 },
    { id: 'e3', source: 'decision', target: 'approve', probability: 85 },
    { id: 'e4', source: 'approve', target: 'end', probability: 100 },
    { id: 'e5', source: 'decision', target: 'check', probability: 15, isFeedback: true },
  ],
}

const loadModel = (): Model => {
  try { return JSON.parse(localStorage.getItem('prolitics-model') ?? '') as Model } catch { return initialModel }
}
const snap = (value: number) => Math.round(value / 24) * 24
const isTerminal = (node: ProcessNode) => node.type === 'end' || node.type === 'defect'

function App() {
  const [model, setModel] = useState<Model>(loadModel)
  const [selection, setSelection] = useState<Selection>({ kind: 'node', id: 'check' })
  const [connectFrom, setConnectFrom] = useState<string | null>(null)
  const [dragging, setDragging] = useState<{ id: string; offsetX: number; offsetY: number } | null>(null)
  const [view, setView] = useState<'process' | 'matrix'>('process')
  const [notice, setNotice] = useState('Ready to edit')
  const [past, setPast] = useState<Model[]>([])
  const [future, setFuture] = useState<Model[]>([])
  const analysis = analyzeProcess(model.nodes, model.edges)
  const selectedNode = selection?.kind === 'node' ? model.nodes.find((node) => node.id === selection.id) : undefined
  const selectedEdge = selection?.kind === 'edge' ? model.edges.find((edge) => edge.id === selection.id) : undefined

  const commit = (next: Model, message: string) => {
    setPast((current) => [...current.slice(-19), model])
    setFuture([])
    setModel(next)
    localStorage.setItem('prolitics-model', JSON.stringify(next))
    setNotice(message)
  }
  const undo = () => {
    const previous = past.at(-1)
    if (!previous) return
    setFuture((current) => [model, ...current])
    setPast((current) => current.slice(0, -1))
    setModel(previous)
    setNotice('Undid last change')
  }
  const outgoing = (source: string) => model.edges.filter((edge) => edge.source === source)
  const total = (source: string) => outgoing(source).reduce((sum, edge) => sum + edge.probability, 0)
  const issues = model.nodes.flatMap((node) => {
    if (isTerminal(node)) return []
    const routes = outgoing(node.id)
    return routes.length === 0 ? [`${node.name} has no outgoing routes`] : total(node.id) !== 100 ? [`${node.name} routes total ${total(node.id)}%, expected 100%`] : []
  })
    .concat(model.edges.filter((edge) => edge.probability < 0 || edge.probability > 100).map((edge) => `Route ${edge.id} is outside 0-100%`))
    .concat(model.edges.filter((edge) => model.nodes.find((node) => node.id === edge.target)?.type === 'start').map(() => 'A route cannot return to START'))
  const validationLabel = issues.length ? `${issues.length} validation issue${issues.length === 1 ? '' : 's'}` : 'Model valid'

  const updateNode = (field: keyof ProcessNode, value: string) => {
    if (!selectedNode) return
    const numeric = ['duration', 'failureRate', 'reworkRate', 'cost', 'capacity'].includes(field)
    const nodes = model.nodes.map((node) => node.id === selectedNode.id ? { ...node, [field]: numeric ? Number(value) : value } : node)
    commit({ ...model, nodes }, 'Step updated')
  }
  const updateProbability = (edgeId: string, value: number) => {
    const edge = model.edges.find((item) => item.id === edgeId)
    if (!edge) return
    const next = Math.max(0, Math.min(100, Number.isFinite(value) ? value : 0))
    const peers = model.edges.filter((item) => item.source === edge.source && item.id !== edgeId)
    const remainder = Math.max(0, 100 - next)
    const peerBase = peers.length ? Math.floor(remainder / peers.length) : 0
    const remainderPoints = peers.length ? remainder - peerBase * peers.length : 0
    const edges = model.edges.map((item) => {
      if (item.id === edgeId) return { ...item, probability: next }
      if (item.source !== edge.source) return item
      const peerIndex = peers.findIndex((peer) => peer.id === item.id)
      return { ...item, probability: peerBase + (peerIndex < remainderPoints ? 1 : 0) }
    })
    commit({ ...model, edges }, `Probability updated; ${total(edge.source) === 100 ? 'row is valid' : 'check row total'}`)
  }
  const addEdge = (source: string, target: string, isFailure = false) => {
    if (!source || source === target || model.nodes.find((node) => node.id === source && isTerminal(node)) || model.nodes.find((node) => node.id === target && node.type === 'start') || model.edges.some((edge) => edge.source === source && edge.target === target)) return
    const remaining = Math.max(0, 100 - total(source))
    const sourceNode = model.nodes.find((node) => node.id === source)
    const targetNode = model.nodes.find((node) => node.id === target)
    const edge: ProcessEdge = { id: `e-${Date.now()}`, source, target, probability: remaining, isFeedback: !isFailure && Boolean(sourceNode && targetNode && targetNode.x <= sourceNode.x) }
    commit({ ...model, edges: [...model.edges, edge] }, isFailure ? 'Failure route added' : 'Route added')
    setSelection({ kind: 'edge', id: edge.id })
  }
  const addNode = (type: NodeType, x = 432, y = 312) => {
    const id = `${type}-${Date.now()}`
    const node: ProcessNode = { id, type, name: type === 'decision' ? 'New decision' : 'New process step', x: snap(x), y: snap(y), duration: 10, failureRate: 0, reworkRate: 0, cost: 5, capacity: 1 }
    commit({ ...model, nodes: [...model.nodes, node] }, 'Step added')
    setSelection({ kind: 'node', id })
  }
  const handleDrop = (event: DragEvent<SVGSVGElement>) => {
    event.preventDefault()
    const type = event.dataTransfer.getData('node-type') as NodeType
    if (!type) return
    const bounds = event.currentTarget.getBoundingClientRect()
    addNode(type, (event.clientX - bounds.left) * 1120 / bounds.width - 72, (event.clientY - bounds.top) * 520 / bounds.height - 28)
  }
  const startDragging = (event: PointerEvent<SVGGElement>, node: ProcessNode) => {
    const svg = event.currentTarget.ownerSVGElement
    if (!svg || connectFrom) return
    const bounds = svg.getBoundingClientRect()
    setDragging({ id: node.id, offsetX: (event.clientX - bounds.left) * 1120 / bounds.width - node.x, offsetY: (event.clientY - bounds.top) * 520 / bounds.height - node.y })
  }
  const dragNode = (event: PointerEvent<SVGSVGElement>) => {
    if (!dragging) return
    const bounds = event.currentTarget.getBoundingClientRect()
    const x = snap((event.clientX - bounds.left) * 1120 / bounds.width - dragging.offsetX)
    const y = snap((event.clientY - bounds.top) * 520 / bounds.height - dragging.offsetY)
    setModel((current) => ({ ...current, nodes: current.nodes.map((node) => node.id === dragging.id ? { ...node, x: Math.max(8, Math.min(960, x)), y: Math.max(8, Math.min(440, y)) } : node) }))
  }
  const deleteSelection = () => {
    if (!selection) return
    if (selection.kind === 'edge') commit({ ...model, edges: model.edges.filter((edge) => edge.id !== selection.id) }, 'Route deleted')
    else if (selectedNode && !['start', 'end', 'defect'].includes(selectedNode.type)) commit({ nodes: model.nodes.filter((node) => node.id !== selectedNode.id), edges: model.edges.filter((edge) => edge.source !== selectedNode.id && edge.target !== selectedNode.id) }, 'Step deleted')
    setSelection(null)
  }
  const selectNode = (id: string) => {
    if (connectFrom) { if (connectFrom !== id) addEdge(connectFrom, id); setConnectFrom(null); return }
    setSelection({ kind: 'node', id })
  }
  const onNumericChange = (event: ChangeEvent<HTMLInputElement>, field: keyof ProcessNode) => updateNode(field, event.target.value)

  return <div className="app-shell">
    <header className="topbar"><div className="brand"><div className="brand-mark"><Activity size={19} /></div><span>PRO<span className="brand-accent">litics</span></span></div><div className="workspace-title"><span className="eyebrow">WORKFLOW / 01</span><strong>Order processing</strong><span className="status-dot" /><span className="saved">Local draft</span></div><div className="top-actions"><button className="icon-button" title="Undo" onClick={undo} disabled={!past.length}><RotateCcw size={16} /></button><button className="secondary-button" onClick={() => { localStorage.setItem('prolitics-model', JSON.stringify(model)); setNotice('Saved locally') }}><Save size={15} /> Save</button><button className="primary-button" onClick={() => setNotice(issues.length ? validationLabel : 'Model checked successfully')}><Play size={15} fill="currentColor" /> Check model</button></div></header>
    <main className="main-grid">
      <aside className="left-panel"><div className="panel-heading"><div><span className="eyebrow">BUILDING BLOCKS</span><h2>Process library</h2></div><Settings2 size={16} /></div><p className="muted intro">Drag a block onto the grid or add it with the plus button.</p><div className="tool-list">{tools.map(({ type, label, icon: Icon }) => <button className="tool-item" draggable key={type} onClick={() => addNode(type)} onDragStart={(event) => event.dataTransfer.setData('node-type', type)}><span className="tool-icon" style={{ backgroundColor: nodeColors[type] }}><Icon size={17} /></span><span>{label}</span><Plus size={15} className="tool-plus" /></button>)}</div><button className="failure-button" disabled={!selectedNode || isTerminal(selectedNode)} onClick={() => selectedNode && addEdge(selectedNode.id, 'defect', true)}><span className="failure-mark">!</span><span>Failure to failed state</span><Plus size={15} /></button><div className="legend"><span className="eyebrow">LEGEND</span><div><i className="legend-line solid" />Normal route</div><div><i className="legend-line dashed" />Feedback / rework</div><div><i className="legend-line failure" />Failure route</div></div><div className="left-footer"><div className="avatar">JD</div><div><strong>Jan de Vries</strong><span>Analyst</span></div></div></aside>
      <section className="canvas-section"><div className="canvas-toolbar"><div><span className="eyebrow">PROCESS MODELLER</span><h1>Order processing <span>• draft</span></h1></div><div className="toolbar-actions"><div className="view-switch"><button className={view === 'process' ? 'view-button active' : 'view-button'} onClick={() => setView('process')}>Process</button><button className={view === 'matrix' ? 'view-button active' : 'view-button'} onClick={() => setView('matrix')}>Matrix</button></div>{view === 'process' && <button className={connectFrom ? 'connect-button active' : 'connect-button'} onClick={() => setConnectFrom(connectFrom ? null : selectedNode?.id ?? null)} disabled={!selectedNode}><Link2 size={15} />{connectFrom ? 'Select target' : 'Connect steps'}</button>}</div></div>
        {view === 'matrix' ? <div className="matrix-wrap"><div className="matrix-intro"><span className="eyebrow">TRANSITION MATRIX</span><h2>Routes and probabilities</h2><p className="muted">Every non-terminal row must total exactly 100%.</p></div><table className="probability-matrix"><thead><tr><th>From / To</th>{model.nodes.map((node) => <th key={node.id}>{node.name}</th>)}<th>Total</th></tr></thead><tbody>{model.nodes.map((source) => { const sourceTotal = total(source.id); const terminal = isTerminal(source); return <tr key={source.id}><th>{source.name}<small className={!terminal && sourceTotal !== 100 ? 'invalid-label' : ''}>{terminal ? 'terminal' : `${sourceTotal}%`}</small></th>{model.nodes.map((target) => { const edge = model.edges.find((item) => item.source === source.id && item.target === target.id); return <td key={target.id}>{edge ? <div className="matrix-cell"><input aria-label={`${source.name} to ${target.name} probability`} type="number" min="0" max="100" value={edge.probability} onChange={(event) => updateProbability(edge.id, Number(event.target.value))} /><span>%</span><button title="Edit route" onClick={() => { setSelection({ kind: 'edge', id: edge.id }); setView('process') }}><Settings2 size={12} /></button><button title="Delete route" onClick={() => commit({ ...model, edges: model.edges.filter((item) => item.id !== edge.id) }, 'Route deleted')}><Trash2 size={12} /></button></div> : <button className="add-edge" disabled={terminal || target.type === 'start'} title="Add route" onClick={() => addEdge(source.id, target.id)}>+</button>}</td>})}<td className={terminal || sourceTotal === 100 ? 'total-valid' : 'total-invalid'}>{terminal ? '—' : `${sourceTotal}%`}</td></tr>})}</tbody></table></div> : <div className="canvas-wrap"><svg className="flow-canvas" viewBox="0 0 1120 520" onPointerMove={dragNode} onPointerUp={() => setDragging(null)} onDragOver={(event) => event.preventDefault()} onDrop={handleDrop} onClick={() => setSelection(null)}><defs><pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse"><path d="M 24 0 L 0 0 0 24" fill="none" stroke="#d5d8d0" /></pattern><marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M 0 0 L 10 5 L 0 10 z" fill="#557378" /></marker><marker id="arrow-red" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M 0 0 L 10 5 L 0 10 z" fill="#bd6757" /></marker></defs><rect width="1120" height="520" fill="url(#grid)" />{model.edges.map((edge) => { const source = model.nodes.find((node) => node.id === edge.source); const target = model.nodes.find((node) => node.id === edge.target); if (!source || !target) return null; return <g key={edge.id} onClick={(event) => { event.stopPropagation(); setSelection({ kind: 'edge', id: edge.id }) }}><line x1={source.x + 144} y1={source.y + 28} x2={target.x} y2={target.y + 28} className={`${edge.isFeedback ? 'feedback-line' : 'flow-line'} ${edge.target === 'defect' ? 'failure-line' : ''} ${selection?.kind === 'edge' && selection.id === edge.id ? 'edge-selected' : ''}`} markerEnd={`url(#${edge.isFeedback || edge.target === 'defect' ? 'arrow-red' : 'arrow'})`} /><text x={(source.x + target.x + 144) / 2} y={(source.y + target.y) / 2 + 22} className="edge-label">{edge.probability}%</text></g>})}{model.nodes.map((node) => <g className="node" key={node.id} transform={`translate(${node.x},${node.y})`} onPointerDown={(event) => { event.stopPropagation(); startDragging(event, node) }} onClick={(event) => { event.stopPropagation(); selectNode(node.id) }}><rect width="144" height="56" rx="6" fill="#fffdf8" stroke={nodeColors[node.type]} strokeWidth={selection?.kind === 'node' && selection.id === node.id ? 3 : 1.5} /><rect width="6" height="56" rx="3" fill={nodeColors[node.type]} /><text x="18" y="20" className="node-type">{nodeLabels[node.type]}</text><text x="18" y="39" className="node-name">{node.name.length > 20 ? `${node.name.slice(0, 19)}...` : node.name}</text></g>)}</svg>{selection && <div className="canvas-inspector" onClick={(event) => event.stopPropagation()}>{selectedEdge ? <><div className="inspector-heading"><div><span className="eyebrow">ROUTE</span><strong>{model.nodes.find((node) => node.id === selectedEdge.source)?.name} to {model.nodes.find((node) => node.id === selectedEdge.target)?.name}</strong></div><button className="small-icon" title="Close" onClick={() => setSelection(null)}><X size={15} /></button></div><label>Probability (%)<input type="number" min="0" max="100" value={selectedEdge.probability} onChange={(event) => updateProbability(selectedEdge.id, Number(event.target.value))} /></label><label className="toggle-label"><input type="checkbox" checked={Boolean(selectedEdge.isFeedback)} onChange={(event) => commit({ ...model, edges: model.edges.map((edge) => edge.id === selectedEdge.id ? { ...edge, isFeedback: event.target.checked } : edge) }, 'Route type updated')} /> Feedback / rework route</label><button className="delete-action" onClick={deleteSelection}><Trash2 size={14} /> Delete route</button></> : selectedNode && <><div className="inspector-heading"><div><span className="eyebrow" style={{ color: nodeColors[selectedNode.type] }}>{nodeLabels[selectedNode.type]}</span><strong>Edit step</strong></div><button className="small-icon" title="Close" onClick={() => setSelection(null)}><X size={15} /></button></div><label>Name<input value={selectedNode.name} onChange={(event) => updateNode('name', event.target.value)} /></label><div className="field-grid">{([['duration', 'Duration', 'min'], ['failureRate', 'Failure rate', '%'], ['reworkRate', 'Rework rate', '%'], ['cost', 'Cost', 'EUR'], ['capacity', 'Capacity', 'FTE']] as const).map(([field, label, unit]) => <label key={field}>{label}<span className="input-unit"><input type="number" min="0" value={selectedNode[field]} onChange={(event) => onNumericChange(event, field)} /><em>{unit}</em></span></label>)}</div>{!['start', 'end', 'defect'].includes(selectedNode.type) && <button className="delete-action" onClick={deleteSelection}><Trash2 size={14} /> Delete step</button>}</>}</div>}</div>}
        <div className="canvas-footer"><span><span className={`live-dot ${issues.length ? 'warning-dot' : ''}`} />{issues.length ? validationLabel : notice}</span><span>{model.nodes.length} steps&nbsp;&nbsp;•&nbsp;&nbsp;{model.edges.length} routes&nbsp;&nbsp;•&nbsp;&nbsp;{Math.round(analysis.yield * 100)}% yield</span></div></section>
    </main><footer className="app-footer"><span>PROlitics engine v0.2</span><span><Check size={13} /> {issues.length ? validationLabel : 'Model valid'}</span><span>Grid snap 24 px</span></footer>
  </div>
}

export default App
