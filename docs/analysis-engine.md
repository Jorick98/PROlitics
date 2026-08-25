# Analyse-engine

De analyse wordt aangeroepen als:

```ts
const analysis = useMemo(
  () => analyzeProcess(nodes, edges),
  [nodes, edges],
)
```

De functie retourneert:

```ts
type Analysis = {
  totalDuration: number
  totalCost: number
  yield: number
  bottleneck: ProcessNode | undefined
  executions: Record<string, number>
  criticalPath: string[]
}
```

## Voorbewerking

1. Zoek de eerste node met `type === 'start'`.
2. Maak voor elke node een uitvoeringscounter met beginwaarde `0`.
3. Zet de startnode in een queue met gewicht `1.0`.
4. Een gewicht betekent het verwachte aandeel van de processtromen dat deze node bereikt.

Ontbreekt een startnode, dan retourneert de engine nulwaarden en geen bottleneck.

## Gewogen graafverkenning

Voor elk queue-item verhoogt de engine de uitvoeringsteller, voegt hij verwerkingstijd en kosten gewogen toe en verwerkt hij de uitgaande edges.

$$
gewicht_{volgende} = gewicht_{huidige} \times \frac{probability}{100}
$$

Een route met probability 85% krijgt gewicht `0.85`. Routes met een gewicht kleiner dan `0.001` worden genegeerd. De queue-loop stopt bovendien zodra de queue meer dan 500 verwerkte posities zou bevatten.

## Herstelkans

Bij een feedback-edge wordt de `reworkRate` van de doel-node gebruikt wanneer die groter is dan nul:

$$
feedbackProbability =
\begin{cases}
reworkRate_{doel} & \text{als reworkRate > 0}\\
probability_{edge} & \text{anders}
\end{cases}
$$

## Doorlooptijd en kosten

$$
TotaalTijd = \sum_i duur_i \times verwachteUitvoeringen_i
$$

$$
TotaalKosten = \sum_i kosten_i \times verwachteUitvoeringen_i
$$

Start- en eindnodes dragen niet bij aan de doorlooptijd. Herstelrondes tellen opnieuw mee.

## Yield

$$
yield_i = 1 - \frac{failureRate_i}{100}
$$

$$
Yield = \prod_i yield_i^{verwachteUitvoeringen_i}
$$

Dit is een eerste deterministische benadering. Voor padafhankelijke yield, uitval naar specifieke vervolgstates en conditionele rework is een expliciet kansmodel nodig.

## Bottleneck

$$
score_i =
\frac{duur_i \times max(verwachteUitvoeringen_i, 1)}{max(capaciteit_i, 0.1)}
$$

De node met de hoogste score wordt als primaire bottleneck gekozen. Dit is nog geen volledige wachtrijtheorie: aankomstintensiteit, bezettingsgraad, wachtrijdiscipline en parallel resource pools worden niet berekend.
