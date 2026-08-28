# Markov model

## Current implementation

Een proces met nodes als toestanden kan als absorbing Markov chain worden beschreven:

- transient states: processtappen;
- absorbing states: `Completed` and `Failed / rejected`;
- overgangskansen: edge probabilities;
- feedback-edges: overgangen terug naar een eerdere transient state.

Wanneer $Q$ de matrix is met overgangen tussen transient states, is de fundamentele matrix:

$$
N = (I - Q)^{-1}
$$

`N[i][j]` geeft het verwachte aantal bezoeken aan toestand `j`, gegeven start in toestand `i`.

The editor enforces exact 100% outgoing probability rows for non-terminal states. Terminal states have no editable outgoing routes. Failure and feedback routes remain separate classifications in the UI.

## Why the engine is not exact yet

De huidige engine bouwt geen matrix en voert geen matrixinversie uit. Hij verkent de graaf met gewichten en begrenst de cyclus via drempels. Daardoor kunnen meerdere loops worden afgekapt, worden padkansen niet volledig genormaliseerd en hebben parallelle stappen nog geen join-semantiek.

De critical path is nu de volgorde waarin nodes voor het eerst worden bezocht, geen exact langste pad. Uitval heeft nog geen expliciete fouttoestand.

## Geplande exacte engine

1. Valideer precies een start en minimaal een eindstate.
2. Normaliseer uitgaande probabilities per beslispunt.
3. Splits transient en absorbing states.
4. Bouw `Q` en de overgangsmatrix naar eindstates.
5. Bereken `N = (I - Q)^-1`.
6. Bereken verwachte nodebezoeken uit de startvector.
7. Bereken tijd, kosten en resourcebelasting uit die bezoeken.
8. Rapporteer niet-convergentie wanneer `I - Q` singulier of numeriek instabiel is.
