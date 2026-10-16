# ADR 0001: Board item finder

- Status: Accepted
- Date: 2026-10-16

## Context

Boards can contain many placed items, making it difficult to find a particular
item by looking at the board alone. The existing add-item library lists item
templates, not the live item instances on the current board. Selecting an item
through the finder must also use the board's selection state so that existing
selection actions and controls continue to work.

## Decision

Add an item finder pane to the board navigation bar. It reads the current item
instances from `useItems()`, including unnamed and locked items, and filters
their resolved display names case- and diacritic-insensitively. Names prefer
`label`, then `text`, then the translated item-template name.

Render compact previews in a virtualized list so large boards do not mount a
component for every item. Image previews preserve their aspect ratio and show
an animated tombstone while their media loads. Keep text input updates urgent
and use React `useTransition` for the result filter update.

Activating a result selects only that item and centers the board on its measured
bounds. The finder stays open. The selection operation is exposed through the
`useSetSelectedItems()` hook in `react-sync-board`, rather than simulating a
pointer gesture or reaching into internal library state.

## Consequences

- The finder reflects live board state and needs no additional persistence or
  schema changes.
- Virtualization keeps preview rendering bounded as item counts grow.
- The finder depends on the public selection setter in `react-sync-board`.
  Consumers must use a version that exports `useSetSelectedItems()`.
- The pane is available in both play sessions and Studio editing.
