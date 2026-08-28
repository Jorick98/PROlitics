# Transition matrix

The matrix uses the same `nodes` and `edges` arrays as the process canvas. Rows are source nodes and columns are target nodes.

- Existing route: edit its probability, open it in the process editor, or delete it.
- `+`: add a legal route. Its initial probability is the remaining percentage in the source row.
- Every non-terminal source row displays a total and must equal exactly `100%`.
- `Completed` and `Failed / rejected` are terminal states; their rows are marked `terminal` and cannot create outgoing routes.
- Routes into `START` are disabled.

Changing a matrix cell updates the shared edge data used by the canvas. Changing one route redistributes the remaining percentage over sibling routes. The matrix is intentionally scrollable for larger models; source labels and totals remain the validation reference.
