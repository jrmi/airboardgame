import React from "react";
import { act, render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const board = {
  batchUpdateItems: vi.fn(),
  removeItems: vi.fn(),
  pushItems: vi.fn(),
  reverseItemsOrder: vi.fn(),
  swapItems: vi.fn(),
  getItems: vi.fn(),
  callPlace: vi.fn(),
  selected: ["a", "b"],
};
const currentUser = { uid: "me" };
const setStorage = vi.fn();
let hookValue;

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (value) => value }),
  initReactI18next: { type: "3rdParty", init: () => {} },
}));

vi.mock("../hooks/useLocalStorage", () => ({
  default: () => [true, setStorage],
}));

vi.mock("react-toastify", () => ({ toast: { info: vi.fn() } }));

vi.mock("react-sync-board", () => ({
  useItemActions: () => ({
    batchUpdateItems: board.batchUpdateItems,
    removeItems: board.removeItems,
    pushItems: board.pushItems,
    reverseItemsOrder: board.reverseItemsOrder,
    swapItems: board.swapItems,
    getItems: board.getItems,
  }),
  useUsers: () => ({ currentUser }),
  useGetSelectedItems: () => () => board.selected,
  useItemInteraction: () => ({ call: board.callPlace }),
}));

vi.mock("../utils", () => ({
  shuffle: (items) => items.reverse(),
  randInt: (min) => min,
  uid: () => "clone-id",
  getItemElement: () => ({ clientWidth: 50, clientHeight: 50, firstChild: {} }),
  playAudio: vi.fn(),
}));

import useGameItemActions from "./useGameItemActions";

const Harness = () => {
  hookValue = useGameItemActions();
  return null;
};

const renderActions = () => render(<Harness />);

describe("useGameItemActions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    board.getItems.mockImplementation(async (ids) =>
      ids.map((id) => ({ id, type: "counter", value: 2, x: 10, y: 20 }))
    );
    renderActions();
  });

  it("publishes the complete centralized action map", () => {
    expect(Object.keys(hookValue.actionMap)).toEqual([
      "flip",
      "reveal",
      "hide",
      "flipSelf",
      "revealSelf",
      "hideSelf",
      "tap",
      "stackToCenter",
      "stack",
      "alignAsLine",
      "alignAsSquare",
      "roll",
      "rollLayer",
      "nextImage",
      "prevImage",
      "nextImageForLayer",
      "prevImageForLayer",
      "shuffle",
      "randomlyRotate",
      "randomlyRotate30",
      "randomlyRotate45",
      "randomlyRotate60",
      "randomlyRotate90",
      "randomlyRotate180",
      "rotate",
      "rotate30",
      "rotate45",
      "rotate60",
      "rotate90",
      "rotate180",
      "clone",
      "lock",
      "remove",
    ]);
    Object.values(hookValue.actionMap).forEach((definition) => {
      expect(definition.action).toEqual(expect.any(Function));
      expect(definition.label).toEqual(expect.any(Function));
    });
  });

  it("changes numeric values in both directions and handles invalid values", async () => {
    await hookValue.changeValue(["a"], { step: 1 });
    expect(board.batchUpdateItems).toHaveBeenCalledWith(
      ["a"],
      expect.any(Function),
      true
    );
    const updater = board.batchUpdateItems.mock.calls[0][1];
    expect(updater({ type: "counter", value: 2 })).toEqual({ value: 3 });
    expect(updater({ type: "counter", value: "bad" })).toEqual({ value: 0 });
    expect(updater({ type: "dice", value: 0, side: 6 })).toEqual({ value: 1 });
    expect(updater({ type: "dice", value: 0, side: 6 })).toEqual({ value: 1 });
  });

  it("wraps image values and updates only the requested advanced-image layer", async () => {
    await hookValue.changeValue(["a"], { step: -1, layer: 1 });
    const updater = board.batchUpdateItems.mock.calls[0][1];
    expect(
      updater({ type: "diceImage", value: 0, images: [{}, {}, {}] })
    ).toEqual({ value: 2 });
    const layers = [
      { images: [{}, {}], value: 1 },
      { images: [{}, {}, {}], value: 0 },
    ];
    expect(updater({ type: "advancedImage", layers })).toEqual({
      layers: [layers[0], { images: layers[1].images, value: 2 }],
    });
  });

  it("routes common action-map commands to their update operations", async () => {
    const commands = [
      ["rotate90", ["a"]],
      ["randomlyRotate180", ["a"]],
      ["tap", ["a"]],
      ["lock", ["a"]],
      ["remove", ["a"]],
      ["clone", ["a"]],
    ];
    board.getItems.mockResolvedValue([
      { id: "a", type: "counter", value: 1, rotation: 0, move: { x: 4 } },
    ]);
    for (const [name, ids] of commands) {
      await act(async () => {
        await hookValue.actionMap[name].action()(ids);
      });
    }
    expect(board.batchUpdateItems).toHaveBeenCalled();
    expect(board.removeItems).toHaveBeenCalledWith(["a"]);
    expect(board.pushItems).toHaveBeenCalledWith(
      [{ id: "clone-id", type: "counter", value: 1, rotation: 0 }],
      null
    );
  });

  it("flips only eligible items, reverses order, and supports player-only reveal", async () => {
    board.getItems.mockReturnValue([
      { id: "a", type: "rect", flipped: false },
      { id: "b", type: "rect", flipped: true },
    ]);
    await hookValue.setFlip(["a", "b"], { flip: true });
    expect(board.batchUpdateItems).toHaveBeenCalledWith(
      ["a"],
      expect.any(Function),
      true
    );
    expect(board.reverseItemsOrder).toHaveBeenCalledWith(["a"]);
    expect(board.callPlace).toHaveBeenCalledWith(["a", "b"]);

    board.getItems.mockReturnValue([
      { id: "a", type: "rect", unflippedFor: [] },
    ]);
    await hookValue.setFlipSelf(["a"]);
    const updater = board.batchUpdateItems.mock.calls.at(-1)[1];
    expect(updater({ id: "a", type: "rect", unflippedFor: [] })).toMatchObject({
      flipped: true,
      unflippedFor: ["me"],
    });
  });

  it("does not update an empty selection and clones without move metadata", async () => {
    board.getItems.mockResolvedValue([]);
    await hookValue.remove([]);
    expect(board.removeItems).toHaveBeenCalledWith([]);
    await hookValue.actionMap.clone.action()([]);
    expect(board.pushItems).not.toHaveBeenCalled();
  });

  it("clones generators without sharing their generated item", async () => {
    board.getItems.mockResolvedValue([
      {
        id: "generator",
        type: "generator",
        currentItemId: "generated",
        linkedItems: ["generated"],
      },
    ]);

    await hookValue.actionMap.clone.action()(["generator"]);

    expect(board.pushItems).toHaveBeenCalledWith(
      [
        {
          id: "clone-id",
          type: "generator",
        },
      ],
      null
    );
  });
});
