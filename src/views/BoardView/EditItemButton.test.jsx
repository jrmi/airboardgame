import React from "react";
import { act, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const board = vi.hoisted(() => ({
  items: [],
  submit: null,
  batchUpdateItems: vi.fn(),
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (text) => text }),
}));
vi.mock("react-sync-board", () => ({
  useDebouncedItems: () => board.items,
  useSelectedItems: () => ["holder"],
  useItemActions: () => ({
    getItems: (ids) => board.items.filter(({ id }) => ids.includes(id)),
    batchUpdateItems: board.batchUpdateItems,
  }),
}));
vi.mock("../../ui/SidePanel", () => ({
  default: ({ children }) => children,
}));
vi.mock("./ItemFormFactory", () => ({
  default: ({ onUpdate }) => {
    board.submit = onUpdate;
    return null;
  },
}));
vi.mock("../../gameComponents/useGameItemActions", async () => {
  const { getHeldRotationUpdates } = await import("../../utils/item");
  return {
    default: () => ({
      computeHeldRotationUpdates: (rootAngleDeltas) =>
        getHeldRotationUpdates({
          items: board.items,
          dimensions: {
            holder: { width: 100, height: 100 },
            token: { width: 10, height: 10 },
          },
          rootAngleDeltas,
        }),
    }),
  };
});

import EditItemButton from "./EditItemButton";

describe("editor rotation updates", () => {
  it("crosses zero continuously for both holder and child and preserves child content", async () => {
    board.items = [
      {
        id: "holder",
        x: 0,
        y: 0,
        rotation: 355,
        holdItems: true,
        linkedItems: ["token"],
        content: "board.png",
      },
      {
        id: "token",
        x: 70,
        y: 45,
        rotation: 355,
        heldBy: "holder",
        content: "token.png",
      },
    ];
    board.batchUpdateItems.mockImplementation((ids, update) => {
      board.items = board.items.map((item) =>
        ids.includes(item.id) ? { ...item, ...update(item) } : item
      );
    });
    render(<EditItemButton showEdit setShowEdit={() => {}} />);

    for (const [target, expected] of [
      [0, 360],
      [5, 365],
      [0, 360],
      [-5, 355],
    ]) {
      await act(async () => {
        await board.submit({ rotation: target, content: "updated-board.png" });
      });
      expect(board.items.map(({ rotation }) => rotation)).toEqual([
        expected,
        expected,
      ]);
      expect(board.items[1].content).toBe("token.png");
    }

    await act(async () => {
      await board.submit({ id: undefined, x: undefined, y: undefined });
    });
    expect(board.items[0]).toMatchObject({ id: "holder", x: 0, y: 0 });
  });
});
