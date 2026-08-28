# Roadmap en ontwerpprincipes

## Iteratief ontwikkelplan

### Iteration 1 - current basis

Grid canvas, nodes, routes, probabilities, feedback classification, parameters, failure state, and matrix view.

### Iteration 2 - model quality

- formal reachability and loop validation;
- route editor with source/target selection;
- exact probability allocation for arbitrary route counts;
- redo and version comparison;
- server-side workflow persistence.

### Iteratie 3 - exacte Markov-analyse

- Q-matrix;
- fundamentele matrix;
- verwachte bezoeken;
- expliciete eind- en faalstates;
- numerieke stabiliteitsmeldingen.

### Iteratie 4 - backend

- PostgreSQL met workflowversies;
- API voor workflows en analyses;
- achtergrondtaken voor simulaties;
- gebruikers en rechten.

### Iteratie 5 - simulatie

- verdelingen in plaats van alleen gemiddelden;
- Monte Carlo-runs;
- betrouwbaarheidsintervallen;
- scenariovergelijking.

### Iteratie 6 - optimalisatie

- capaciteit als beslisvariabele;
- budgetrestricties;
- doelwaarde voor doorlooptijd of yield;
- voorstel met uitlegbare trade-offs.

## Ontwerpprincipes

1. Houd het procesmodel als een gedeeld domeinmodel; canvas en matrix mogen geen eigen kopieën van edges hebben.
2. Scheid uitval, rework en routekeuze; het zijn verschillende gebeurtenissen.
3. Geef elke berekende waarde een duidelijke betekenis en eenheid.
4. Valideer het model voor matrixinversie of simulatie.
5. Houd snelle interacties client-side; verplaats zware simulaties naar een backend worker.
6. Voeg bij iedere rekenwijziging een klein testmodel toe met een handmatig controleerbare uitkomst.
7. Beschouw de huidige engine als eerste benadering totdat de fundamentele matrix is geimplementeerd.
