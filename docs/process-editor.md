# Proceseditor

## Procesweergave

De procesweergave bestaat uit drie kolommen:

1. Links staat de procesbibliotheek.
2. In het midden staat het SVG-canvas.
3. Rechts staat de editor voor de geselecteerde node of edge.

## Node bewerken

1. Klik op een node.
2. Pas rechts de naam of parameters aan.
3. De React state wordt direct bijgewerkt.
4. `analysis` wordt opnieuw berekend via `useMemo`.
5. De cijfers in het analysepaneel worden direct vernieuwd.

## Node bewegen

Een node gebruikt pointer-events. Bij `pointerdown` wordt het verschil tussen de pointerpositie en de nodepositie opgeslagen. Tijdens `pointermove` wordt de nodepositie aangepast. De positie wordt begrensd binnen het canvas.

## Verbinding maken

1. Klik op `Verbind stappen`.
2. De geselecteerde node is de bron.
3. Klik op een andere node.
4. Er wordt een nieuwe edge met standaard probability `100` aangemaakt.
5. Selecteer daarna de lijn om de probability en het type aan te passen.

Een dubbele verbinding met dezelfde bron en hetzelfde doel wordt momenteel niet toegevoegd via de procesweergave.

## Edge bewerken

Klik op een lijn of op het percentagelabel. Het rechterpaneel toont de bron, het doel, de probability, de feedback-optie en de verwijderactie. De geselecteerde edge krijgt een oranje markering. Feedback-edges worden rood en gestippeld getoond.
