# ADR 0001: Rotate held item stacks with their holder

- Status: Accepted
- Date: 2026-10-16

## Decisions

- Keep `linkedItems` unchanged so existing games remain compatible.
- Only items with `holdItems: true` can act as physical holders.
- Ignore generator and other non-physical `linkedItems` relationships.
- Store optional `heldBy`, `heldOffset`, and `heldAngle` metadata on held items.
- Use the visually topmost holder as an item's direct owner.
- Rotate nested stacks through direct ownership so every item rotates once.
- Apply the same angle delta for action, random, tap, and editor rotations.
- Keep all rotations continuous: `270° + 90°` becomes `360°`, not `0°`.
- Disable transitions on held descendants to prevent stack distortion.
- Use relative rotation controls when editing multiple selected items.
- Never persist form identity fields or undefined shared values.
- Use rendered item dimensions for rotation geometry.
- Share placement logic through `useHeldItemPlacement`.

This avoids data migration and keeps generator links separate from physical
holding. Rotation requires held items to be rendered and measurable.
