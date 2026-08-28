# Data model

## Node

Een node representeert een procesonderdeel.

```ts
type NodeType = 'start' | 'process' | 'decision' | 'parallel' | 'end' | 'defect'

type ProcessNode = {
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
```

| Veld | Type | Betekenis | Eenheid/regel |
|---|---|---|---|
| `id` | string | unieke identificatie | uniek binnen workflow |
| `type` | enum | soort node | start, process, decision, parallel of end |
| `name` | string | zichtbare naam | vrij tekstveld |
| `x`, `y` | number | canvas position | SVG coordinates, snapped to a 24 px grid |
| `duration` | number | gemiddelde verwerkingstijd | minuten in de huidige demo |
| `failureRate` | number | kans dat uitvoering faalt | percentage, 0-100 |
| `reworkRate` | number | kans op terugkoppeling naar deze stap | percentage, 0-100 |
| `cost` | number | kosten per uitvoering | huidige UI toont EUR |
| `capacity` | number | beschikbare capaciteit | FTE/machines, positief getal |

`failureRate` en `reworkRate` zijn verschillende begrippen. Failure betekent dat de uitvoering geen geslaagd resultaat oplevert; rework betekent dat de processtroom teruggaat naar een eerdere stap.

## Edge

```ts
type ProcessEdge = {
  id: string
  source: string
  target: string
  probability: number
  isFeedback?: boolean
}
```

| Veld | Type | Betekenis |
|---|---|---|
| `id` | string | unieke identificatie van de lijn |
| `source` | string | id van de vertrek-node |
| `target` | string | id van de aankomst-node |
| `probability` | number | transition chance | integer percentage, 0-100 |
| `isFeedback` | boolean | markeert een herstel-/terugkoppeling |

For every non-terminal node, outgoing probabilities must sum to exactly 100%. The UI redistributes sibling routes when a probability changes and displays invalid totals. `end` and `defect` are terminal states and cannot have outgoing routes. Incoming routes to `start` are not allowed.

## Voorbeeldmodel

```json
{
  "nodes": [{
    "id": "check",
    "type": "process",
    "name": "Controle & validatie",
    "x": 300,
    "y": 120,
    "duration": 14,
    "failureRate": 4,
    "reworkRate": 15,
    "cost": 8.5,
    "capacity": 2
  }],
  "edges": [{
    "id": "e5",
    "source": "decision",
    "target": "check",
    "probability": 15,
    "isFeedback": true
  }]
}
```
