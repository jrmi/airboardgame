import React from "react";
import { act, render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const board = {
  batchUpdateItems: vi.fn(),
  getItems: vi.fn(),
  pushItem: vi.fn(),
  removeItems: vi.fn(),
};
const interactions = { place: null, delete: null };
let nextId = 0;
let setOwner;
let generatedType = "rect";
let ownerType = "rect";

vi.mock("react-sync-board", () => ({
  useItemActions: () => board,
  useUsers: () => ({ isSpaceMaster: true }),
  useItemInteraction: (name) => ({
    register: (callback) => {
      interactions[name] = callback;
      return () => {
        if (interactions[name] === callback) interactions[name] = null;
      };
    },
  }),
}));

vi.mock("../../utils", () => ({
  uid: () => `generated-${++nextId}`,
  getItemElement: () => ({}),
}));

vi.mock("../../utils/item", () => ({
  isItemCenterInsideElement: () => false,
}));

import useGeneratedItem from "./useGeneratedItem";

const Harness = ({ item, currentItemId = undefined }) => {
  const [ownerState, updateOwner] = React.useState({
    currentItemId,
    linkedItems: currentItemId ? [currentItemId] : [],
  });
  setOwner = updateOwner;
  const result = useGeneratedItem({
    id: "generator",
    item,
    currentItemId: ownerState.currentItemId,
    setState: (updater) => updateOwner(updater),
    generatorElement: { current: {} },
    centerRef: { current: { top: 0, left: 0 } },
  });
  return <output data-testid="current">{result.currentItemId || ""}</output>;
};

const ownerItem = (type = "rect") => ({
  type,
  width: 40,
  height: 40,
});

describe("useGeneratedItem", () => {
  beforeEach(() => {
    nextId = 0;
    generatedType = "rect";
    ownerType = "rect";
    interactions.place = null;
    interactions.delete = null;
    vi.clearAllMocks();
    board.getItems.mockImplementation(async ([id]) => {
      if (id === "generator") {
        return [{ id, x: 10, y: 20, layer: 2, item: ownerItem(ownerType) }];
      }
      return [{ id, type: generatedType }];
    });
    board.pushItem.mockImplementation(async ({ type }) => {
      generatedType = type;
    });
  });

  it("creates one initial child", async () => {
    render(
      <React.StrictMode>
        <Harness item={ownerItem()} />
      </React.StrictMode>
    );

    await act(async () => {});

    expect(board.pushItem).toHaveBeenCalledTimes(1);
    expect(board.pushItem.mock.calls[0][0]).toMatchObject({
      id: "generated-1",
      x: 13,
      y: 23,
      layer: 3,
      editable: false,
    });

    await act(async () => {
      await interactions.place(["generated-1"]);
    });

    expect(board.batchUpdateItems).toHaveBeenCalledWith(
      ["generated-1"],
      expect.any(Function)
    );
    const restorePosition = board.batchUpdateItems.mock.calls.at(-1)[1];
    expect(restorePosition({ type: "rect", color: "red" })).toEqual({
      type: "rect",
      color: "red",
      x: 13,
      y: 23,
    });
  });

  it("does not create twice for concurrent place events", async () => {
    render(<Harness item={ownerItem()} currentItemId="existing" />);
    await act(async () => {});

    // Consume the insertion event, then simulate two simultaneous moves.
    await act(async () => {
      await interactions.place(["existing"]);
      await Promise.all([
        interactions.place(["existing"]),
        interactions.place(["existing"]),
      ]);
    });

    expect(board.pushItem).toHaveBeenCalledTimes(1);
  });

  it("replaces a child when it is moved outside after insertion", async () => {
    render(<Harness item={ownerItem()} />);
    await act(async () => {});

    await act(async () => {
      // pushItem emits this first place event after applying grid snapping.
      await interactions.place(["generated-1"]);
      // This second event is the actual user movement.
      await interactions.place(["generated-1"]);
    });

    expect(board.pushItem).toHaveBeenCalledTimes(2);
    expect(board.pushItem.mock.calls[1][0]).toMatchObject({
      id: "generated-2",
    });
  });

  it("removes an empty generator child without recreating it", async () => {
    const view = render(
      <Harness item={ownerItem()} currentItemId="existing" />
    );
    await act(async () => {});

    view.rerender(<Harness item={{}} currentItemId="existing" />);
    await act(async () => {});

    expect(board.removeItems).toHaveBeenCalledWith(["existing"]);
    expect(board.pushItem).not.toHaveBeenCalled();
    expect(setOwner).toBeDefined();
  });

  it("replaces a child when its type changes", async () => {
    const view = render(
      <Harness item={ownerItem("rect")} currentItemId="existing" />
    );
    await act(async () => {});

    view.rerender(
      <Harness item={ownerItem("token")} currentItemId="existing" />
    );
    ownerType = "token";
    await act(async () => {});

    expect(board.removeItems).toHaveBeenCalledWith(["existing"]);
    expect(board.pushItem).toHaveBeenCalledWith(
      expect.objectContaining({ id: "generated-1", type: "token" })
    );
  });
});
