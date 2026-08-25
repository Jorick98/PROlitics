# PROlitics documentatie

Versie: `0.1`  
Status: eerste werkende frontend-slice

De documentatie is per functie en onderwerp opgesplitst:

1. [Overzicht](overview.md) - doel, status, architectuur en technologie.
2. [Datamodel](data-model.md) - nodes, edges en voorbeeldmodel.
3. [Proceseditor](process-editor.md) - canvas, nodes, verbindingen en edge-bewerking.
4. [Matrixweergave](matrix-view.md) - probabilities en gedeelde edge-data.
5. [Analyse-engine](analysis-engine.md) - gewogen graafverkenning, tijd, kosten, yield en bottleneck.
6. [Markov-model](markov-model.md) - huidige beperkingen en doelarchitectuur.
7. [Validatie](validation.md) - gewenste controles voor invoer en modellen.
8. [Lokaal ontwikkelen en testen](local-development.md) - installatie, development server, build en preview.
9. [Roadmap en ontwerpprincipes](roadmap.md) - vervolgedits en ontwikkeliteraties.

De huidige analyse-implementatie staat in `src/engine.ts`; de React-gebruikersinterface staat in `src/App.tsx`.