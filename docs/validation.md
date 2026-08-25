# Validatie

De applicatie moet uiteindelijk minimaal de volgende controles uitvoeren:

- precies een startnode;
- minimaal een eindnode;
- elke node bereikbaar vanaf start;
- geen edge naar een niet-bestaande node;
- probabilities tussen 0 en 100;
- uitgaande kansen per beslispunt samen maximaal of exact 100%;
- `duration >= 0`;
- `failureRate` en `reworkRate` tussen 0 en 100;
- `capacity > 0`;
- feedback-edges moeten een betekenisvolle terugroute hebben;
- een model met 100% oneindige feedback moet worden gemarkeerd.

Validatiefouten horen later voor analyse zichtbaar te zijn, met een uitleg per node of edge.
