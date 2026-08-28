export type NodeType = 'start' | 'process' | 'decision' | 'parallel' | 'end' | 'defect'

export type ProcessNode = {
  id: string
  type: NodeType
  name: string
  x: number
  y: number
  duration: number
  failureRate: number
  reworkRate: number
  cost: number
  capacity: number
}

export type ProcessEdge = {
  id: string
  source: string
  target: string
  probability: number
  isFeedback?: boolean
}

export type Analysis = {
  totalDuration: number
  totalCost: number
  yield: number
  bottleneck: ProcessNode | undefined
  executions: Record<string, number>
  criticalPath: string[]
}

const clamp = (value: number, min = 0, max = 1) => Math.max(min, Math.min(max, value))

export function analyzeProcess(nodes: ProcessNode[], edges: ProcessEdge[]): Analysis {
  const start = nodes.find((node) => node.type === 'start')
  const activeNodes = nodes.filter((node) => node.type !== 'start' && node.type !== 'end')
  const executions: Record<string, number> = Object.fromEntries(nodes.map((node) => [node.id, 0]))
  if (!start) return { totalDuration: 0, totalCost: 0, yield: 1, bottleneck: undefined, executions, criticalPath: [] }

  const queue: Array<{ id: string; weight: number }> = [{ id: start.id, weight: 1 }]
  const visits = new Map<string, number>()
  let totalYield = 1
  let totalDuration = 0
  let totalCost = 0
  const criticalPath: string[] = []

  while (queue.length && queue.length < 500) {
    const current = queue.shift()!
    const node = nodes.find((item) => item.id === current.id)
    if (!node) continue
    const visitKey = `${node.id}:${Math.round(current.weight * 10000)}`
    if (visits.has(visitKey)) continue
    visits.set(visitKey, 1)

    executions[node.id] += current.weight
    if (node.type !== 'start' && node.type !== 'end') {
      totalDuration += node.duration * current.weight
      totalCost += node.cost * current.weight
      totalYield *= Math.pow(1 - clamp(node.failureRate / 100), current.weight)
      if (!criticalPath.includes(node.id)) criticalPath.push(node.id)
    }

    const outgoing = edges.filter((edge) => edge.source === node.id)
    outgoing.forEach((edge) => {
      const probability = clamp(edge.probability / 100)
      const nextWeight = current.weight * probability
      if (nextWeight < 0.001) return
      queue.push({ id: edge.target, weight: nextWeight })
    })
  }

  const bottleneck = activeNodes.reduce<ProcessNode | undefined>((best, node) => {
    const load = (node.duration * (executions[node.id] || 1)) / Math.max(node.capacity, 0.1)
    if (!best) return node
    const bestLoad = (best.duration * (executions[best.id] || 1)) / Math.max(best.capacity, 0.1)
    return load > bestLoad ? node : best
  }, undefined)

  return { totalDuration, totalCost, yield: totalYield, bottleneck, executions, criticalPath }
}
