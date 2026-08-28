# Validation

De applicatie moet uiteindelijk minimaal de volgende controles uitvoeren:

- precies een startnode;
- minimaal een eindnode;
- elke node bereikbaar vanaf start;
- geen edge naar een niet-bestaande node;
- probabilities between 0 and 100;
- outgoing probabilities per non-terminal node exactly 100%;
- no outgoing routes from terminal states;
- no routes into `START`;
- no duplicate source-target route;
- `duration >= 0`;
- `failureRate` en `reworkRate` tussen 0 en 100;
- `capacity > 0`;
- feedback-edges moeten een betekenisvolle terugroute hebben;
- a model with 100% infinite feedback should be marked before simulation.

The current UI implements the first four checks and shows the number of validation issues in the canvas footer. Formal reachability, duplicate detection, and infinite-loop detection remain planned engine checks.

Validatiefouten horen later voor analyse zichtbaar te zijn, met een uitleg per node of edge.
