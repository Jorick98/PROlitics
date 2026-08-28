# PROlitics documentatie

Version: `0.2`  
Status: client-side grid editor with process and matrix views

De documentatie is per functie en onderwerp opgesplitst:

1. [Overview](overview.md) - purpose, status, architecture, and technology.
2. [Data model](data-model.md) - nodes, routes, and model rules.
3. [Process editor](process-editor.md) - grid canvas, nodes, routes, and inline editing.
4. [Transition matrix](matrix-view.md) - shared route data and probability conservation.
5. [Analysis engine](analysis-engine.md) - weighted graph traversal, time, cost, yield, and bottleneck.
6. [Markov model](markov-model.md) - assumptions and future exact analysis.
7. [Validation](validation.md) - model checks and remaining gaps.
8. [Local development](local-development.md) - installation, dev server, build, and manual testing.
9. [Roadmap](roadmap.md) - future iterations and design principles.

De huidige analyse-implementatie staat in `src/engine.ts`; de React-gebruikersinterface staat in `src/App.tsx`.