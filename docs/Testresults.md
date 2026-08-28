# Testfile

This file contains all bugs and issues based on testing. These conclussions should be checked at every release to fix the bugs everytime. When changes are made this file is update with the changes so after retesting they can be put on done.

### Testing bugs to fix

Implementation status after the 2026-08-28 remediation pass: BUG-01 through BUG-09 are addressed in the current editor. Automated unit coverage and exact engine-level failure-state math remain outstanding.

Test run: 2026-08-28, local Vite app, browser viewport approximately 1047 x 613 px. Scope: process canvas, inline editor, transition matrix, probability editing, connection creation, failure route creation, deletion affordances, and visual layout.

#### Critical / high priority

- **BUG-01: Step/connection editor cannot be closed.** Reproduction: select a step, click `Sluiten`; or select a matrix connection, switch to `Proces`, then click `Sluiten`. Result: the editor remains open and changes to the first node (`Nieuwe aanvraag`). Cause indicated by behavior: clearing `selectedId` falls back to `nodes[0]` during render. Expected: the editor disappears and no item is selected. Acceptance test: after closing, `.canvas-inspector` is absent until a node or edge is selected.
- **BUG-02: Process connections are too faint and are partly hidden by the editor.** In the process screenshot, the grey route lines have low contrast against the dotted canvas and the right-side routes disappear behind the floating editor. Result: users cannot reliably follow the process or select a line. Expected: routes remain clearly visible, have sufficient contrast, and the editor does not cover the active route. Acceptance test: every route is visually traceable from source to target at normal zoom.
- **BUG-03: Failure action can attach to the wrong source.** Reproduction: select a connection in Matrix, then click `Failure naar defect`. Result: an extra edge is created from `Nieuwe aanvraag` to `Defect / afgewezen`, because the cleared selection falls back to the first node. Expected: require a selected source, or provide a source-node chooser, and never silently attach to another node.
- **BUG-04: Terminal rows contradict the 100% Markov rule.** `Afgerond` and `Defect / afgewezen` show `geen routes` and `0%`, while the footer says rows must total 100%. Expected: terminal states are explicitly absorbing states with a 100% self-transition, or are excluded from editable transition rows and clearly marked as terminal. Acceptance test: a valid model has no unexplained 0% terminal rows.

#### Medium priority

- **BUG-05: Matrix connection settings button has no immediate visible result.** Reproduction: click the settings icon on a matrix edge. Result: the edge is selected internally, but no editor opens in Matrix and there is no feedback; the editor only appears after switching to Process. Expected: edit/delete controls open in the current view, or the UI clearly switches view and focuses the selected edge.
- **BUG-06: Adding a matrix edge creates a 0% transition.** Result: a dead connection is added and the user must discover and edit it separately. Expected: ask for a probability, use a valid remaining probability, or show the new edge as incomplete and block model validation until it is assigned.
- **BUG-07: Matrix is clipped at normal laptop width.** At the tested viewport, the transition table requires both horizontal and vertical scrolling; the defect column is partially outside the visible area. Expected: sticky row/column headers, a compact responsive matrix, or a clear scroll treatment that keeps the active row and source labels visible.
- **BUG-08: Drag-and-drop placement does not use the drop position.** The library drag handler adds the new node at a fixed canvas position (`x=420`, `y=320`) instead of where the user dropped it. Multiple drops overlap and the interaction does not match the instruction shown in the library.
- **BUG-09: Markov redistribution needs a rounding test.** The current automatic redistribution uses `Math.round` independently for peer edges. With three or more outgoing edges, the displayed probabilities can sum to 99% or 101%. Add a deterministic remainder allocation and a test for 3+ outgoing transitions.

#### Passed checks

Retest after implementation, 2026-08-28:

- Process and Matrix tabs switch successfully.
- Existing process nodes and connections render in both views.
- Node selection opens the inline editor; node name and numeric fields update.
- Nodes can be dragged within the process canvas.
- Connection mode creates a new edge when source and target are selected.
- Changing the decision split from 85/15 to 60/40 automatically produced 60/40 and preserved a 100% row total.
- Matrix rows display a running total and identify invalid totals.
- Closing the contextual editor removes it without selecting a fallback node.
- Matrix route edit opens the process editor and matrix route delete removes the clicked route.
- Failure creation is disabled without a selected process source and creates a visible route from the selected source to the failed state.
- Terminal rows are marked `terminal`; outgoing route controls are disabled for completed and failed states.
- Library blocks can be dropped at the pointer location and node movement snaps to the 24 px grid.
- Undo restores a prior model snapshot and Save/reload uses local storage.
- Normal, feedback, and failure connectors are visually distinct and legible in the process screenshot.
- Production build passes with `npm.cmd run build` and the current source has no reported TypeScript/CSS errors.



### Further development ideas
Change the free drag and drop functionality to a more 'grid' like drag and drop. This must ensure that the proces blocks are more aligned and it looks more consistent. 
Adding plus signs between nodes to add steps between steps.
Change language to english

- Add a real model validation state: block `Controleer` when any non-terminal row is not exactly 100%, flag orphan nodes, duplicate routes, self-loops, unreachable nodes, and invalid start/end structure.
- Add a clear distinction between normal transitions, feedback/rework transitions, and failure transitions. Failure rate on a process step should optionally generate a failure edge automatically, with the residual probability shown explicitly.
- Add an absorbing-state convention for completed and failed states, and document whether their self-transition is stored or implicit.
- Keep editing local to the active view: matrix cells should support add, edit, feedback marking, and delete without requiring a view switch.
- Add undo/redo behavior. The current undo icon is visible but has no action.
- Persist the workflow in local storage or a backend. The current save action only changes a status message.
- Place dropped nodes at the actual pointer location and add snap-to-grid plus collision avoidance.
- Add connector handles or plus targets between nodes so users do not need to activate a separate connection mode for every transition.
- Add focused automated tests for probability conservation, failure routing, terminal-state handling, close behavior, deletion, duplicate edges, and 3+ outgoing-edge rounding.
- Replace the floating editor with a collapsible bottom or contextual popover that never obscures routes; keep the selected node/edge highlighted while editing.
- Complete the language migration to English consistently; current labels and documentation are mixed in intent and terminology.

