# Overview

## Doel

PROlitics is een visuele modelleringsapplicatie voor bedrijfsprocessen. Een gebruiker bouwt een proces op uit stappen en verbindingen. Iedere stap kan parameters bevatten zoals doorlooptijd, uitval, herstelwerk, kosten en capaciteit.

De applicatie geeft een eerste inschatting van:

- verwachte totale doorlooptijd;
- totale proceskosten;
- cumulatieve yield;
- verwachte uitvoeringsfrequentie per stap;
- primaire bottleneck.

Een proces mag terugkoppelingen bevatten. Daarmee kunnen herstelwerk, afkeur, correcties en andere loops worden gemodelleerd.

## Current status

De huidige versie is een client-side prototype. Alle gegevens staan tijdens de sessie in React state in de browser.

### Werkt nu

- processtappen toevoegen, selecteren, bewerken, verplaatsen en verwijderen;
- lijnen tussen nodes toevoegen, selecteren, bewerken en verwijderen;
- probabilities and feedback routes with automatic row conservation;
- aparte uitval- en reworkpercentages per stap;
- wisselen tussen Proces- en Matrix-weergave;
- live analysis of the process model;
- grid-snapped node movement and pointer-positioned drag-and-drop;
- inline route editing in the matrix and contextual step editing on the canvas;
- validation feedback, local persistence, and undo.

### Nog niet aanwezig

- database, gebruikersaccounts en autorisatie;
- undo/redo-logica;
- exacte fundamentele Markov-matrixberekening;
- Monte Carlo-simulaties;
- optimalisatie onder budget- of capaciteitsbeperkingen;
- server-side storage, users, and authorization;
- exact fundamental-matrix Markov analysis;
- Monte Carlo simulation and optimization.

## Technische architectuur

```text
Browser
  |
  +-- React UI (`src/App.tsx`)
  |     +-- procescanvas
  |     +-- matrixweergave
  |     +-- contextual node/edge editor
  |     +-- process grid and transition matrix
  |
  +-- React state
  |     +-- ProcessNode[]
  |     +-- ProcessEdge[]
  |     +-- geselecteerde node/edge
  |     +-- actieve view
  |
  +-- analysefunctie (`src/engine.ts`)
        +-- gewogen graafverkenning
        +-- doorlooptijd, kosten en yield
        +-- uitvoeringsfrequenties en bottleneck
```

## Bestanden en technologie

| Bestand | Verantwoordelijkheid |
|---|---|
| `src/App.tsx` | UI, lokale state, canvasinteractie en formulieren |
| `src/engine.ts` | domeintypes en analyseberekening |
| `src/styles.css` | layout, kleuren, canvas en matrixstyling |
| `src/main.tsx` | React entrypoint |

De applicatie gebruikt React, TypeScript, Vite, SVG en `lucide-react`. De editor kan later worden gemigreerd naar React Flow als geavanceerde routing, zooming, handles en automatische layouts nodig worden.
