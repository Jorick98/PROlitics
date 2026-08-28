# Process editor

## Process view

The process view has two areas:

1. The process library is on the left.
2. The grid canvas and contextual editor occupy the main work area.

Nodes snap to a 24 px grid. Library blocks can be added with `+` or dragged onto the canvas; dropped blocks use the pointer location and are clamped to the canvas.

## Edit a node

1. Click a node.
2. Edit its name or parameters in the contextual canvas editor.
3. Close the editor with `Close`; no fallback node is selected.
4. Changes are stored in the shared model and persisted to local storage.

## Move a node

Pointer movement updates the node position and snaps it to the grid. Nodes remain inside the canvas bounds.

## Create a route

1. Select a source node.
2. Click `Connect steps`.
3. Click a different target node.
4. A new route receives the remaining probability from the source row. Duplicate routes, routes into `START`, and routes out of terminal states are rejected.

The route label shows its probability. Feedback routes are identified by a backward target or can be marked in the route editor.

## Edit a route

Click a line or its percentage label. The contextual editor exposes probability, feedback classification, and delete. Changing one probability redistributes the remaining percentage across sibling routes using integer allocation so the row stays at exactly 100%.

## Failure routes

Select a non-terminal node and click `Failure to failed state`. The action creates a route to the failed state and marks it visually. It is disabled when no valid source is selected.

## Undo and save

`Undo` restores up to 20 previous model snapshots. `Save` persists the current model to local storage. The prototype still has no server-side workflow storage.
