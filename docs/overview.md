# Overzicht

## Doel

PROlitics is een visuele modelleringsapplicatie voor bedrijfsprocessen. Een gebruiker bouwt een proces op uit stappen en verbindingen. Iedere stap kan parameters bevatten zoals doorlooptijd, uitval, herstelwerk, kosten en capaciteit.

De applicatie geeft een eerste inschatting van:

- verwachte totale doorlooptijd;
- totale proceskosten;
- cumulatieve yield;
- verwachte uitvoeringsfrequentie per stap;
- primaire bottleneck.

Een proces mag terugkoppelingen bevatten. Daarmee kunnen herstelwerk, afkeur, correcties en andere loops worden gemodelleerd.

## Huidige status

De huidige versie is een client-side prototype. Alle gegevens staan tijdens de sessie in React state in de browser.

### Werkt nu

- processtappen toevoegen, selecteren, bewerken, verplaatsen en verwijderen;
- lijnen tussen nodes toevoegen, selecteren, bewerken en verwijderen;
- probabilities en feedback-routes aanpassen;
- aparte uitval- en reworkpercentages per stap;
- wisselen tussen Proces- en Matrix-weergave;
- live analyse van het procesmodel.

### Nog niet aanwezig

- database, gebruikersaccounts en autorisatie;
- undo/redo-logica;
- exacte fundamentele Markov-matrixberekening;
- Monte Carlo-simulaties;
- optimalisatie onder budget- of capaciteitsbeperkingen;
- formele validatiemeldingen in de gebruikersinterface;
- drag-and-drop vanuit de bibliotheek naar een precieze canvaspositie.

## Technische architectuur

```text
Browser
  |
  +-- React UI (`src/App.tsx`)
  |     +-- procescanvas
  |     +-- matrixweergave
  |     +-- node- en edge-editor
  |     +-- analysepaneel
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
