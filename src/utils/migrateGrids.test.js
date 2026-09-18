import { describe, expect, it } from "vitest";
import { migrateBoardGrid, migrateGrids } from "./migrateGrids";

describe("grid migration at loading boundaries", () => {
  it("converts every legacy board field and removes them", () => {
    expect(
      migrateBoardGrid({
        name: "board",
        gridType: "hexH",
        gridSize: "12.5",
        gridOffset: { x: "3" },
        showGrid: false,
        gridColor: "red",
        gridOpacity: 0.4,
      })
    ).toEqual({
      name: "board",
      grid: {
        type: "hexH",
        size: "12.5",
        offset: { x: "3" },
        show: false,
        color: "red",
        opacity: 0.4,
      },
    });
  });
  it.each([
    null,
    {},
    { type: null },
    { type: "none" },
    { type: "hexV", size: 4 },
  ])("preserves an explicitly supplied canonical grid: %j", (grid) => {
    expect(migrateBoardGrid({ grid, gridType: "grid", gridSize: 20 })).toEqual({
      grid,
    });
  });
  it("retains size-only snapping without inventing a grid on empty boards", () => {
    expect(migrateBoardGrid({ gridSize: 12 })).toEqual({
      grid: { type: "grid", size: 12 },
    });
    expect(migrateBoardGrid({ gridSize: 0 }).grid.type).toBe("none");
    expect(
      migrateBoardGrid({ gridType: null, gridSize: 12 }).grid.type
    ).toBeNull();
    expect(migrateBoardGrid({})).toEqual({});
  });
  it("migrates nested collections and generator templates without losing preferences", () => {
    const legacy = {
      type: "token",
      grid: {
        type: "none",
        size: 4,
        offset: { x: 3 },
        show: false,
        color: "red",
        opacity: 0,
      },
    };
    const inherited = {
      type: "token",
      grid: { show: false, color: "red", opacity: 0 },
    };
    const input = {
      board: { gridType: "grid", gridSize: 10 },
      items: [{ type: "generator", item: legacy }, null],
      availableItems: [
        { name: "folder", items: [{ items: [legacy, { template: legacy }] }] },
      ],
      messages: [{ text: "unchanged" }],
    };
    const result = migrateGrids(input);
    expect(result.items[0].item).toEqual(inherited);
    expect(result.availableItems[0].items[0].items).toEqual([
      inherited,
      { template: inherited },
    ]);
    expect(input.items[0].item.grid.type).toBe("none");
    expect(result.messages).toEqual(input.messages);
    expect(migrateGrids(result)).toEqual(result);
    expect(migrateGrids(JSON.parse(JSON.stringify(result)))).toEqual(result);
  });
  it("preserves canonical custom templates", () => {
    const item = {
      type: "generator",
      grid: { type: "hexH", size: 3.5 },
      item: {
        type: "token",
        grid: { type: "hexV", size: "4", offset: { y: "2" } },
      },
    };
    expect(migrateGrids({ items: [item] }).items).toEqual([item]);
  });
});
