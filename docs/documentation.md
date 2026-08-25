# PROlitics - functionele en technische documentatie

Versie: `0.1`  
Status: eerste werkende frontend-slice

## 1. Doel van de applicatie

PROlitics is een visuele modelleringsapplicatie voor bedrijfsprocessen. Een gebruiker bouwt een proces op uit stappen en verbindingen. Iedere stap kan parameters bevatten zoals doorlooptijd, uitval, herstelwerk, kosten en capaciteit.

De applicatie geeft vervolgens een eerste inschatting van:

- verwachte totale doorlooptijd;
- totale proceskosten;
- cumulatieve yield;
- verwachte uitvoeringsfrequentie per stap;
- primaire bottleneck.

Een proces mag terugkoppelingen bevatten. Daarmee kunnen herstelwerk, afkeur, correcties en andere loops worden gemodelleerd.

## 2. Huidige status

De huidige versie is een client-side prototype. Alle gegevens staan tijdens de sessie in React state in de browser.

### Werkt nu

- processtappen toevoegen;
- processtappen selecteren en bewerken;
- nodes verplaatsen met slepen;
- nodes verwijderen;
- lijnen tussen nodes toevoegen via `Verbind stappen`;
- lijnen selecteren door erop te klikken;
- probability van een lijn aanpassen;
- lijn verwijderen;
- lijn markeren als `Terugkoppeling / herstelroute`;
- aparte `Uitvalpercentage` en `Herstelwerk / terugkans` per stap;
- wisselen tussen Proces- en Matrix-weergave;
- probabilities bewerken en verbindingen toevoegen vanuit de matrix;
- live analyse van het procesmodel.

### Nog niet aanwezig

- opslaan naar een database;
- gebruikersaccounts en autorisatie;
- undo/redo-logica;
- exacte fundamentele Markov-matrixberekening;
- Monte Carlo-simulaties;
- optimalisatie onder budget- of capaciteitsbeperkingen;
- formele validatiemeldingen in de gebruikersinterface;
- drag-and-drop vanuit de bibliotheek naar een precieze canvaspositie.

## 3. Technische architectuur

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
        +-- doorlooptijd
        +-- kosten
        +-- yield
        +-- uitvoeringsfrequenties
        +-- bottleneck
```

### Bestanden

| Bestand | Verantwoordelijkheid |
|---|---|
| `src/App.tsx` | UI, lokale state, canvasinteractie en formulieren |
| `src/engine.ts` | domeintypes en analyseberekening |
| `src/styles.css` | layout, kleuren, canvas en matrixstyling |
| `src/main.tsx` | React entrypoint |
| `docs/documentation.md` | deze documentatie |

### Technologie

- React voor de gebruikersinterface;
- TypeScript voor types en compile-time controle;
- Vite voor lokale ontwikkeling en productie-builds;
- SVG voor het procescanvas;
- `lucide-react` voor interface-iconen.

Deze keuze houdt de eerste iteraties klein. De editor kan later worden vervangen door of gemigreerd naar React Flow als geavanceerde routing, zooming, handles en automatische layouts nodig worden.

## 4. Datamodel

### 4.1 Node

Een node representeert een procesonderdeel.

```ts
type NodeType = 'start' | 'process' | 'decision' | 'parallel' | 'end'

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
| `type` | enum | soort node | start, proces, beslissing, parallel of eind |
| `name` | string | zichtbare naam | vrij tekstveld |
| `x`, `y` | number | canvaspositie | SVG-coordinaten |
| `duration` | number | gemiddelde verwerkingstijd | minuten in de huidige demo |
| `failureRate` | number | kans dat uitvoering faalt | percentage, 0-100 |
| `reworkRate` | number | kans op terugkoppeling naar deze stap | percentage, 0-100 |
| `cost` | number | kosten per uitvoering | huidige UI toont EUR |
| `capacity` | number | beschikbare capaciteit | FTE/machines, positief getal |

`failureRate` en `reworkRate` zijn bewust verschillende begrippen:

- `failureRate`: de uitvoering levert geen geslaagd resultaat op;
- `reworkRate`: de processtroom gaat terug naar een eerdere stap voor herstelwerk.

Een stap kan dus een uitvalpercentage hebben zonder teruglus, of een teruglus zonder uitvalpercentage.

### 4.2 Edge

Een edge representeert een overgang tussen twee nodes.

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
| `probability` | number | overgangskans in procenten |
| `isFeedback` | boolean | markeert een herstel-/terugkoppeling |

Voor een beslispunt horen de uitgaande kansen in principe samen 100% te zijn. De huidige versie controleert dit nog niet automatisch.

### 4.3 Voorbeeldmodel

```json
{
  "nodes": [
    {
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
    }
  ],
  "edges": [
    {
      "id": "e5",
      "source": "decision",
      "target": "check",
      "probability": 15,
      "isFeedback": true
    }
  ]
}
```

## 5. Gebruikersinterface

### 5.1 Procesweergave

De procesweergave bestaat uit drie kolommen:

1. Links staat de procesbibliotheek.
2. In het midden staat het SVG-canvas.
3. Rechts staat de editor voor de geselecteerde node of edge.

#### Node bewerken

1. Klik op een node.
2. Pas rechts de naam of parameters aan.
3. De React state wordt direct bijgewerkt.
4. `analysis` wordt opnieuw berekend via `useMemo`.
5. De cijfers in het analysepaneel worden direct vernieuwd.

#### Node bewegen

Een node gebruikt pointer-events. Bij `pointerdown` wordt het verschil tussen de pointerpositie en de nodepositie opgeslagen. Tijdens `pointermove` wordt de nodepositie aangepast. De positie wordt begrensd binnen het canvas, zodat nodes niet buiten het werkgebied verdwijnen.

#### Verbinding maken

1. Klik op `Verbind stappen`.
2. De geselecteerde node is de bron.
3. Klik op een andere node.
4. Er wordt een nieuwe edge met standaard probability `100` aangemaakt.
5. Selecteer daarna de lijn om de probability en het type aan te passen.

Een dubbele verbinding met dezelfde bron en hetzelfde doel wordt momenteel niet toegevoegd via de procesweergave.

#### Edge bewerken

Klik op een lijn of op het percentagelabel. Het rechterpaneel toont dan:

- bron en doel;
- probability;
- checkbox `Terugkoppeling / herstelroute`;
- verwijderactie.

De geselecteerde edge krijgt een oranje markering. Feedback-edges worden rood en gestippeld getoond.

### 5.2 Matrixweergave

De matrix gebruikt dezelfde `nodes`- en `edges`-arrays als het canvas. De rij is de bron-node en de kolom is de doel-node.

- bestaande verbinding: probability invoeren;
- knop met instellingen: edge selecteren voor verwijderen of feedback-markering;
- `+`: nieuwe verbinding toevoegen met probability `100`;
- start- en eindnodes worden ook getoond.

De matrix is daarmee geen tweede datamodel. Een wijziging in de matrix moet dezelfde edge-data aanpassen als een wijziging via het canvas.

## 6. Analyse-engine

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

### 6.1 Voorbewerking

1. Zoek de eerste node met `type === 'start'`.
2. Maak voor elke node een uitvoeringscounter met beginwaarde `0`.
3. Zet de startnode in een queue met gewicht `1.0`.
4. Een gewicht betekent: verwacht aandeel van de processtromen dat deze node bereikt.

Ontbreekt een startnode, dan retourneert de engine nulwaarden en geen bottleneck.

### 6.2 Gewogen graafverkenning

Voor elk queue-item:

1. zoek de node;
2. verhoog `executions[node.id]` met het huidige gewicht;
3. voeg verwerkingstijd en kosten gewogen toe;
4. verwerk de uitgaande edges;
5. bereken voor iedere edge:

$$
gewicht_{volgende} = gewicht_{huidige} \times \frac{probability}{100}
$$

Een route met probability 85% krijgt dus gewicht `0.85`. Een route met 15% krijgt gewicht `0.15`.

Routes met een gewicht kleiner dan `0.001` worden genegeerd. Dit voorkomt dat oneindig kleine staarten de queue blijven vullen.

### 6.3 Herstelkans

Bij een feedback-edge wordt de `reworkRate` van de doel-node gebruikt wanneer die groter is dan nul:

$$
feedbackProbability =
\begin{cases}
reworkRate_{doel} & \text{als reworkRate > 0}\\
probability_{edge} & \text{anders}
\end{cases}
$$

Dit betekent dat `reworkRate` centraal op de herstelstap kan worden ingesteld. De edge blijft de verbinding en kan als fallback een eigen probability bevatten.

### 6.4 Doorlooptijd

Voor iedere actieve node wordt de bijdrage berekend als:

$$
TotaalTijd = \sum_i duur_i \times verwachteUitvoeringen_i
$$

Start- en eindnodes dragen in de huidige engine niet bij aan de doorlooptijd. De waarde is een verwachting, geen simulatie van één specifiek traject.

### 6.5 Kosten

Dezelfde gewogen uitvoeringslogica wordt voor kosten gebruikt:

$$
TotaalKosten = \sum_i kosten_i \times verwachteUitvoeringen_i
$$

Hiermee tellen herstelrondes opnieuw mee. Als een stap gemiddeld 1.15 keer wordt uitgevoerd, wordt ook ongeveer 1.15 keer de kostenbijdrage meegenomen.

### 6.6 Yield

Voor iedere actieve node wordt de kans op geen fout verwerkt:

$$
yield_i = 1 - \frac{failureRate_i}{100}
$$

De huidige implementatie vermenigvuldigt die kans gewogen met de verwachte uitvoering:

$$
Yield = \prod_i yield_i^{verwachteUitvoeringen_i}
$$

Dit is een eerste deterministische benadering. Voor padafhankelijke yield, uitval naar specifieke vervolgstates en conditionele rework is een expliciet kansmodel nodig.

### 6.7 Bottleneck

De huidige bottleneckscore is:

$$
score_i =
\frac{duur_i \times max(verwachteUitvoeringen_i, 1)}{max(capaciteit_i, 0.1)}
$$

De node met de hoogste score wordt als primaire bottleneck gekozen. Dit combineert verwerkingstijd, verwachte belasting en capaciteit.

Dit is nog geen volledige wachtrijtheorie. Er wordt bijvoorbeeld nog geen aankomstintensiteit, bezettingsgraad, wachtrijdiscipline of parallel resource pool berekend.

### 6.8 Cyclusbeveiliging

De queue kan door feedback-routes blijven groeien. Daarom gebruikt de engine twee grenzen:

- routes onder gewicht `0.001` worden afgekapt;
- de queue-loop stopt zodra de queue meer dan 500 verwerkte posities zou bevatten.

Dit voorkomt vastlopen bij ongeldige modellen zoals een feedback probability van 100% zonder eindroute. De huidige beveiliging is een praktische grens, geen exacte convergentiecontrole.

## 7. Markov-model: huidige situatie en doelarchitectuur

### 7.1 Conceptueel model

Een proces met nodes als toestanden kan als absorbing Markov chain worden beschreven:

- transient states: processtappen;
- absorbing state: eindpunt;
- overgangskansen: edge probabilities;
- feedback-edges: overgangen terug naar een eerdere transient state.

Wanneer $Q$ de matrix is met overgangen tussen transient states, is de fundamentele matrix:

$$
N = (I - Q)^{-1}
$$

`N[i][j]` geeft dan het verwachte aantal bezoeken aan toestand `j`, gegeven start in toestand `i`.

### 7.2 Waarom de huidige engine nog niet exact is

De huidige engine bouwt geen matrix en voert geen matrixinversie uit. Hij verkent de graaf met gewichten en begrenst de cyclus via drempels. Dat is geschikt voor de eerste UI-iteratie, maar heeft beperkingen:

- bij meerdere loops kan de uitkomst worden afgekapt;
- padkansen worden niet volledig genormaliseerd;
- parallelle stappen hebben nog geen join-semantiek;
- de critical path is nu de volgorde waarin nodes voor het eerst worden bezocht, geen exact langste pad;
- uitval heeft nog geen expliciete fouttoestand.

### 7.3 Geplande exacte engine

De volgende engine-iteratie kan deze stappen uitvoeren:

1. valideer precies één start en minimaal één eindstate;
2. normaliseer uitgaande probabilities per beslispunt;
3. splits transient en absorbing states;
4. bouw $Q$ en de overgangsmatrix naar eindstates;
5. bereken $N=(I-Q)^{-1}$;
6. bereken verwachte nodebezoeken uit de startvector;
7. bereken tijd, kosten en resourcebelasting uit die bezoeken;
8. rapporteer niet-convergentie wanneer $I-Q$ singulier of numeriek instabiel is.

## 8. Validatie van invoer

De applicatie moet uiteindelijk minimaal de volgende controles uitvoeren:

- precies één startnode;
- minimaal één eindnode;
- elke node bereikbaar vanaf start;
- geen edge naar een niet-bestaande node;
- probabilities tussen 0 en 100;
- uitgaande kansen per beslispunt samen maximaal of exact 100%;
- `duration >= 0`;
- `failureRate` en `reworkRate` tussen 0 en 100;
- `capacity > 0`;
- feedback-edges moeten een betekenisvolle terugroute hebben;
- een model met 100% oneindige feedback moet worden gemarkeerd.

Validatiefouten horen later vóór analyse zichtbaar te zijn, met een uitleg per node of edge.

## 9. Lokale installatie en testen

Vereisten:

- Node.js LTS;
- npm.

In PowerShell kan `npm.ps1` door de execution policy worden geblokkeerd. Gebruik dan `npm.cmd`.

### Development server

```powershell
cd C:\Users\joric\Documents\PROlitics
npm.cmd install
npm.cmd run dev
```

Open daarna:

```text
http://localhost:5173
```

### Productiebuild

```powershell
cd C:\Users\joric\Documents\PROlitics
npm.cmd run build
```

De build doet eerst TypeScript-controle en daarna Vite bundling.

### Productiebuild lokaal bekijken

```powershell
npm.cmd run preview
```

Open:

```text
http://localhost:4173
```

## 10. Iteratief ontwikkelplan

### Iteratie 1 - huidige basis

Canvas, nodes, edges, probabilities, feedbackmarkering, parameters en matrixweergave.

### Iteratie 2 - modelkwaliteit

- formele validaties;
- edge-editor met bron/doelkeuze;
- probability-normalisatie;
- undo/redo;
- persistente lokale opslag.

### Iteratie 3 - exacte Markov-analyse

- $Q$-matrix;
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

## 11. Ontwerpprincipes voor vervolgedits

1. Houd het procesmodel als één gedeeld domeinmodel; canvas en matrix mogen geen eigen kopieën van edges hebben.
2. Scheid uitval, rework en routekeuze; het zijn verschillende gebeurtenissen.
3. Geef elke berekende waarde een duidelijke betekenis en eenheid.
4. Valideer het model vóór matrixinversie of simulatie.
5. Houd snelle interacties client-side; verplaats zware simulaties naar een backend worker.
6. Voeg bij iedere rekenwijziging een klein testmodel toe met een handmatig controleerbare uitkomst.
7. Beschouw de huidige engine als eerste benadering totdat de fundamentele matrix is geïmplementeerd.
