import { useMemo, useState, type PointerEvent } from 'react'
import { Activity, Check, CircleDot, GitBranch, Layers3, Link2, Play, Plus, RotateCcw, Save, Settings2, Target, Trash2, X, Zap } from 'lucide-react'
import { analyzeProcess, type NodeType, type ProcessEdge, type ProcessNode } from './engine'

type Tool = { type: NodeType; label: string; icon: typeof CircleDot }
const tools: Tool[] = [
  { type: 'process', label: 'Processtap', icon: Settings2 },
  { type: 'decision', label: 'Beslissing', icon: GitBranch },
  { type: 'parallel', label: 'Parallel', icon: Layers3 },
]
const nodeColors: Record<NodeType, string> = { start: '#2e7d66', process: '#e88943', decision: '#1e6b73', parallel: '#7259a8', end: '#30383b' }
const nodeLabels: Record<NodeType, string> = { start: 'START', process: 'STAP', decision: 'KEUZE', parallel: 'PARALLEL', end: 'EIND' }
const initialNodes: ProcessNode[] = [
  { id: 'start', type: 'start', name: 'Nieuwe aanvraag', x: 86, y: 190, duration: 2, failureRate: 0, reworkRate: 0, cost: 0, capacity: 1 },
  { id: 'check', type: 'process', name: 'Controle & validatie', x: 300, y: 120, duration: 14, failureRate: 4, reworkRate: 15, cost: 8.5, capacity: 2 },
  { id: 'decision', type: 'decision', name: 'Gegevens compleet?', x: 550, y: 190, duration: 1, failureRate: 0, reworkRate: 0, cost: 0, capacity: 1 },
  { id: 'approve', type: 'process', name: 'Goedkeuren', x: 750, y: 100, duration: 9, failureRate: 2, reworkRate: 0, cost: 14, capacity: 1 },
  { id: 'end', type: 'end', name: 'Afgerond', x: 1000, y: 190, duration: 0, failureRate: 0, reworkRate: 0, cost: 0, capacity: 1 },
]
const initialEdges: ProcessEdge[] = [
  { id: 'e1', source: 'start', target: 'check', probability: 100 }, { id: 'e2', source: 'check', target: 'decision', probability: 100 },
  { id: 'e3', source: 'decision', target: 'approve', probability: 85 }, { id: 'e4', source: 'approve', target: 'end', probability: 100 },
  { id: 'e5', source: 'decision', target: 'check', probability: 15, isFeedback: true },
]

function App() {
  const [nodes, setNodes] = useState(initialNodes)
  const [edges, setEdges] = useState(initialEdges)
  const [selectedId, setSelectedId] = useState('check')
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null)
  const [connectFrom, setConnectFrom] = useState<string | null>(null)
  const [dragging, setDragging] = useState<{ id: string; offsetX: number; offsetY: number } | null>(null)
  const [view, setView] = useState<'process' | 'matrix'>('process')
  const [notice, setNotice] = useState('Wijzigingen worden lokaal bijgehouden')
  const analysis = useMemo(() => analyzeProcess(nodes, edges), [nodes, edges])
  const selected = nodes.find((node) => node.id === selectedId) ?? nodes[0]
  const selectedEdge = edges.find((edge) => edge.id === selectedEdgeId)
  const matrixNodes = nodes

  const updateSelected = (field: keyof ProcessNode, value: string) => {
    const numeric = ['duration', 'failureRate', 'reworkRate', 'cost', 'capacity'].includes(field)
    setNodes((current) => current.map((node) => node.id === selected.id ? { ...node, [field]: numeric ? Number(value) : value } : node))
  }
  const updateEdge = (field: keyof ProcessEdge, value: string | boolean) => {
    if (!selectedEdge) return
    setEdges((current) => current.map((edge) => edge.id === selectedEdge.id ? { ...edge, [field]: field === 'probability' ? Math.max(0, Math.min(100, Number(value))) : value } : edge))
  }
  const addEdge = (source: string, target: string) => setEdges((current) => [...current, { id: `e-${Date.now()}`, source, target, probability: 100 }])
  const addNode = (type: NodeType) => {
    const id = `${type}-${Date.now()}`
    setNodes((current) => [...current, { id, type, name: type === 'decision' ? 'Nieuw beslispunt' : 'Nieuwe processtap', x: 400, y: 320, duration: 10, failureRate: 0, reworkRate: 0, cost: 5, capacity: 1 }])
    setSelectedId(id); setNotice('Nieuwe stap toegevoegd')
  }
  const handleNodeClick = (id: string) => {
    if (connectFrom && connectFrom !== id) {
      if (!edges.some((edge) => edge.source === connectFrom && edge.target === id)) addEdge(connectFrom, id)
      setConnectFrom(null); setNotice('Verbinding toegevoegd')
    } else { setSelectedId(id); setSelectedEdgeId(null) }
  }
  const startDragging = (event: PointerEvent<SVGGElement>, node: ProcessNode) => {
    if (connectFrom) return
    const svg = event.currentTarget.ownerSVGElement
    if (!svg) return
    const bounds = svg.getBoundingClientRect()
    setDragging({ id: node.id, offsetX: event.clientX * 1120 / bounds.width - bounds.left * 1120 / bounds.width - node.x, offsetY: event.clientY * 520 / bounds.height - bounds.top * 520 / bounds.height - node.y })
  }
  const dragNode = (event: PointerEvent<SVGSVGElement>) => {
    if (!dragging) return
    const bounds = event.currentTarget.getBoundingClientRect()
    const x = event.clientX * 1120 / bounds.width - bounds.left * 1120 / bounds.width - dragging.offsetX
    const y = event.clientY * 520 / bounds.height - bounds.top * 520 / bounds.height - dragging.offsetY
    setNodes((current) => current.map((node) => node.id === dragging.id ? { ...node, x: Math.max(8, Math.min(950, x)), y: Math.max(8, Math.min(445, y)) } : node))
  }
  const deleteSelected = () => {
    if (selectedEdge) { setEdges((current) => current.filter((edge) => edge.id !== selectedEdge.id)); setSelectedEdgeId(null); return }
    if (selected.type === 'start' || selected.type === 'end') return
    setNodes((current) => current.filter((node) => node.id !== selected.id)); setEdges((current) => current.filter((edge) => edge.source !== selected.id && edge.target !== selected.id)); setSelectedId('check')
  }
  const matrixEdge = (source: string, target: string) => edges.find((edge) => edge.source === source && edge.target === target)

  return <div className="app-shell">
    <header className="topbar"><div className="brand"><div className="brand-mark"><Activity size={19} /></div><span>PRO<span className="brand-accent">litics</span></span></div><div className="workspace-title"><span className="eyebrow">WORKFLOW / 01</span><strong>Orderverwerking</strong><span className="status-dot" /><span className="saved">Laatst opgeslagen zojuist</span></div><div className="top-actions"><button className="icon-button" title="Ongedaan maken"><RotateCcw size={16} /></button><button className="secondary-button" onClick={() => setNotice('Workflow lokaal opgeslagen')}><Save size={15} /> Opslaan</button><button className="primary-button" onClick={() => setNotice('Analyse bijgewerkt')}><Play size={15} fill="currentColor" /> Bereken</button></div></header>
    <main className="main-grid">
      <aside className="left-panel"><div className="panel-heading"><div><span className="eyebrow">BOUWBLOKKEN</span><h2>Procesbibliotheek</h2></div><button className="small-icon" title="Instellingen"><Settings2 size={16} /></button></div><p className="muted intro">Voeg een blok toe en bewerk het rechts.</p><div className="tool-list">{tools.map(({ type, label, icon: Icon }) => <button className="tool-item" key={type} onClick={() => addNode(type)}><span className="tool-icon" style={{ backgroundColor: nodeColors[type] }}><Icon size={17} /></span><span>{label}</span><Plus size={15} className="tool-plus" /></button>)}</div><div className="legend"><span className="eyebrow">LEGENDA</span><div><i className="legend-line solid" />Hoofdroute</div><div><i className="legend-line dashed" />Terugkoppeling</div></div><div className="left-footer"><div className="avatar">JD</div><div><strong>Jan de Vries</strong><span>Analist</span></div></div></aside>
      <section className="canvas-section"><div className="canvas-toolbar"><div><span className="eyebrow">VISUELE MODELLER</span><h1>Orderverwerking <span>• concept</span></h1></div><div className="toolbar-actions"><div className="view-switch"><button className={view === 'process' ? 'view-button active' : 'view-button'} onClick={() => setView('process')}>Proces</button><button className={view === 'matrix' ? 'view-button active' : 'view-button'} onClick={() => setView('matrix')}>Matrix</button></div>{view === 'process' && <button className={connectFrom ? 'connect-button active' : 'connect-button'} onClick={() => setConnectFrom(connectFrom ? null : selectedId)}><Link2 size={15} />{connectFrom ? 'Kies doelstap' : 'Verbind stappen'}</button>}</div></div>
        {view === 'matrix' ? <div className="matrix-wrap"><div className="matrix-intro"><span className="eyebrow">TRANSITIEMATRIX</span><h2>Verbindingen & kansen</h2><p className="muted">Bewerk probabilities direct. Gebruik het potlood rechts om een verbinding te verwijderen.</p></div><table className="probability-matrix"><thead><tr><th>Van / Naar</th>{matrixNodes.map((node) => <th key={node.id}>{node.name}</th>)}</tr></thead><tbody>{matrixNodes.map((source) => <tr key={source.id}><th>{source.name}</th>{matrixNodes.map((target) => { const edge = matrixEdge(source.id, target.id); return <td key={target.id}>{edge ? <div className="matrix-cell"><input type="number" min="0" max="100" value={edge.probability} onChange={(event) => setEdges((current) => current.map((item) => item.id === edge.id ? { ...item, probability: Number(event.target.value) } : item))} /><span>%</span><button title="Selecteer verbinding" onClick={() => { setSelectedEdgeId(edge.id); setSelectedId('') }}><Settings2 size={12} /></button></div> : <button className="add-edge" title="Voeg verbinding toe" onClick={() => addEdge(source.id, target.id)}>+</button>}</td>})}</tr>)}</tbody></table></div> : <div className="canvas-wrap"><svg className="flow-canvas" viewBox="0 0 1120 520" onPointerMove={dragNode} onPointerUp={() => setDragging(null)} onClick={() => { setConnectFrom(null); setSelectedEdgeId(null) }}><defs><pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="1" fill="#d8d5ca" /></pattern><marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M 0 0 L 10 5 L 0 10 z" fill="#9ba09d" /></marker><marker id="arrow-red" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M 0 0 L 10 5 L 0 10 z" fill="#c86d55" /></marker></defs><rect width="1120" height="520" fill="url(#grid)" />{edges.map((edge) => { const source = nodes.find((node) => node.id === edge.source); const target = nodes.find((node) => node.id === edge.target); if (!source || !target) return null; const backwards = target.x < source.x; const path = backwards ? `M ${source.x + 5} ${source.y + 48} C ${source.x + 20} 485, ${target.x + 40} 485, ${target.x + 40} ${target.y + 48}` : `M ${source.x + 156} ${source.y + 30} C ${source.x + 190} ${source.y + 30}, ${target.x - 30} ${target.y + 30}, ${target.x} ${target.y + 30}`; return <g key={edge.id} className="edge-group" onClick={(event) => { event.stopPropagation(); setSelectedEdgeId(edge.id); setSelectedId('') }}><path d={path} className={`${edge.isFeedback ? 'edge feedback' : 'edge'} ${selectedEdgeId === edge.id ? 'edge-selected' : ''}`} markerEnd={edge.isFeedback ? 'url(#arrow-red)' : 'url(#arrow)'} /><text x={(source.x + target.x) / 2} y={backwards ? 475 : (source.y + target.y) / 2 + 18} className={edge.isFeedback ? 'edge-label feedback-label' : 'edge-label'}>{edge.probability}%</text></g> })}{nodes.map((node) => <g key={node.id} className="node" transform={`translate(${node.x},${node.y})`} onPointerDown={(event) => startDragging(event, node)} onClick={(event) => { event.stopPropagation(); handleNodeClick(node.id) }}><rect width="156" height="60" rx="5" fill="white" stroke={nodeColors[node.type]} strokeWidth={selectedId === node.id ? 2.5 : 1.5} /><rect width="6" height="60" rx="3" fill={nodeColors[node.type]} /><text x="18" y="20" className="node-type" fill={nodeColors[node.type]}>{nodeLabels[node.type]}</text><text x="18" y="42" className="node-name">{node.name.length > 20 ? `${node.name.slice(0, 19)}...` : node.name}</text></g>)}</svg><div className="canvas-hint"><Target size={14} />{connectFrom ? 'Klik op een node om de verbinding te voltooien' : 'Klik op een node of lijn om te bewerken'}</div></div>}
        <div className="canvas-footer"><span><span className="live-dot" />{notice}</span><span>{nodes.length} stappen&nbsp;&nbsp;•&nbsp;&nbsp;{edges.length} verbindingen</span></div></section>
      <aside className="right-panel"><div className="panel-heading"><div><span className="eyebrow">{selectedEdge ? 'VERBINDING' : 'PARAMETERS'}</span><h2>{selectedEdge ? 'Lijn bewerken' : 'Eigenschappen'}</h2></div><button className="small-icon danger" title="Verwijder geselecteerd element" onClick={deleteSelected}><Trash2 size={16} /></button></div>{selectedEdge ? <><div className="selected-node"><span className="selected-bar" style={{ backgroundColor: selectedEdge.isFeedback ? '#c86d55' : '#1e6b73' }} /><div><span className="eyebrow">{selectedEdge.isFeedback ? 'FEEDBACK' : 'HOOFDROUTE'}</span><strong>{nodes.find((node) => node.id === selectedEdge.source)?.name} naar {nodes.find((node) => node.id === selectedEdge.target)?.name}</strong></div></div><label>Probability (%)<input type="number" min="0" max="100" value={selectedEdge.probability} onChange={(event) => updateEdge('probability', event.target.value)} /></label><label className="toggle-label"><input type="checkbox" checked={Boolean(selectedEdge.isFeedback)} onChange={(event) => updateEdge('isFeedback', event.target.checked)} /> Terugkoppeling / herstelroute</label></> : <><div className="selected-node"><span className="selected-bar" style={{ backgroundColor: nodeColors[selected.type] }} /><div><span className="eyebrow" style={{ color: nodeColors[selected.type] }}>{nodeLabels[selected.type]}</span><strong>{selected.name}</strong></div></div><label>Naam<input value={selected.name} onChange={(event) => updateSelected('name', event.target.value)} /></label><div className="field-grid">{([['duration', 'Doorlooptijd', 'min'], ['failureRate', 'Uitvalpercentage', '%'], ['reworkRate', 'Herstelwerk / terugkans', '%'], ['cost', 'Kosten per run', 'EUR'], ['capacity', 'Capaciteit', 'FTE']] as const).map(([field, label, unit]) => <label key={field}>{label}<span className="input-unit"><input type="number" min="0" value={selected[field]} onChange={(event) => updateSelected(field, event.target.value)} /><em>{unit}</em></span></label>)}</div><div className="feedback-box"><div><RotateCcw size={16} /><strong>Terugkoppelingen</strong></div>{edges.filter((edge) => edge.target === selected.id && edge.isFeedback).map((edge) => <div className="feedback-row" key={edge.id}><span>Van {nodes.find((node) => node.id === edge.source)?.name}</span><strong>{edge.probability}%</strong></div>)}{!edges.some((edge) => edge.target === selected.id && edge.isFeedback) && <span className="muted">Geen terugkoppeling naar deze stap.</span>}</div><div className="analysis-card"><div className="analysis-title"><div><span className="eyebrow">LIVE ANALYSE</span><h2>Processtatus</h2></div><Zap size={18} /></div><div className="metric"><span>Verwachte doorlooptijd</span><strong>{analysis.totalDuration.toFixed(1)} min</strong></div><div className="metric"><span>Totale kosten</span><strong>EUR {analysis.totalCost.toFixed(2)}</strong></div><div className="metric"><span>Yield</span><strong className="green">{(analysis.yield * 100).toFixed(1)}%</strong></div><div className="bottleneck"><span className="eyebrow">PRIMAIRE BOTTLENECK</span><strong>{analysis.bottleneck?.name ?? 'Nog niet bepaald'}</strong></div></div></>}</aside>
    </main><footer className="app-footer"><span>PROlitics engine v0.1</span><span><Check size={13} /> Alle wijzigingen gevalideerd</span><span><Zap size={13} /> Markov-ready model</span></footer>
+  </div>
}
export default App
