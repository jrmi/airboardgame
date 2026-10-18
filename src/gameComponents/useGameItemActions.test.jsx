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
  allItems: [],
};
const currentUser = { uid: "me" };
const setStorage = vi.fn();
const random = vi.hoisted(() => ({
  int: vi.fn((min) => min),
}));
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
  useBoardConfig: () => [{ groupAssignments: { me: "blue" } }],
  useItems: () => board.allItems,
  useUsers: () => ({ currentUser }),
  useGetSelectedItems: () => () => board.selected,
  useItemInteraction: () => ({ call: board.callPlace }),
}));

vi.mock("../utils", () => ({
  shuffle: (items) => items.reverse(),
  randInt: random.int,
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
    board.selected = ["a", "b"];
    board.allItems = [];
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
      "hideForMyGroup",
      "makePublic",
      "toggleGroupVisibility",
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

  it("hides linked items for the current camp and can make them public", async () => {
    board.allItems = [
      { id: "a", linkedItems: ["b"] },
      { id: "b", linkedItems: ["c"] },
      { id: "c" },
    ];
    renderActions();

    await hookValue.actionMap.hideForMyGroup.action()(["a"]);
    expect(board.batchUpdateItems).toHaveBeenCalledWith(
      ["a", "b", "c"],
      expect.any(Function),
      true
    );
    expect(board.batchUpdateItems.mock.calls[0][1]({ id: "a" })).toEqual({
      hidden: true,
      hiddenByGroup: "blue",
    });

    board.batchUpdateItems.mockClear();
    await hookValue.actionMap.makePublic.action()(["a"]);
    expect(board.batchUpdateItems.mock.calls[0][1]({ id: "a" })).toEqual({
      hidden: false,
      hiddenByGroup: null,
    });
    board.allItems = [];
  });

  it("toggles the selected items between hidden and public", async () => {
    board.selected = ["a"];
    board.allItems = [{ id: "a", hidden: false }];
    renderActions();

    expect(hookValue.actionMap.toggleGroupVisibility.label()).toBe(
      "Hide for my group / make public"
    );
    await hookValue.actionMap.toggleGroupVisibility.action()();
    expect(board.batchUpdateItems).toHaveBeenLastCalledWith(
      ["a"],
      expect.any(Function),
      true
    );
    expect(board.batchUpdateItems.mock.calls.at(-1)[1]({ id: "a" })).toEqual({
      hidden: true,
      hiddenByGroup: "blue",
    });

    board.allItems = [{ id: "a", hidden: true }];
    renderActions();
    expect(hookValue.actionMap.toggleGroupVisibility.label()).toBe(
      "Hide for my group / make public"
    );
    await hookValue.actionMap.toggleGroupVisibility.action()();
    expect(board.batchUpdateItems.mock.calls.at(-1)[1]({ id: "a" })).toEqual({
      hidden: false,
      hiddenByGroup: null,
    });
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
    board.getItems.mockReturnValue([
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

  it("rotates held items around their holder's center", async () => {
    const items = {
      holder: {
        id: "holder",
        x: 0,
        y: 0,
        rotation: 0,
        holdItems: true,
        linkedItems: ["token"],
      },
      token: { id: "token", x: 50, y: 0, rotation: 0 },
    };
    board.getItems.mockImplementation((ids) => ids.map((id) => items[id]));

    await hookValue.rotate(["holder"], { angle: 90 });

    const [ids, updater] = board.batchUpdateItems.mock.calls.at(-1);
    expect(ids).toEqual(["holder", "token"]);
    expect(updater(items.holder)).toEqual({ rotation: 90 });
    // Token center (75, 25) turns 90° around holder center (25, 25).
    expect(updater(items.token)).toEqual({ x: 0, y: 50, rotation: 90 });
  });

  it("rotates a selected held item only through its selected holder", async () => {
    const items = {
      holder: {
        id: "holder",
        x: 0,
        y: 0,
        rotation: 0,
        holdItems: true,
        linkedItems: ["token"],
      },
      token: { id: "token", x: 50, y: 0, rotation: 30 },
    };
    board.getItems.mockImplementation((ids) => ids.map((id) => items[id]));

    await hookValue.rotate(["holder", "token"], { angle: 90 });

    const [ids, updater] = board.batchUpdateItems.mock.calls.at(-1);
    expect(ids).toEqual(["holder", "token"]);
    expect(updater(items.holder)).toEqual({ rotation: 90 });
    expect(updater(items.token)).toEqual({ x: 0, y: 50, rotation: 120 });
  });

  it("resets every selected angle while preserving held-stack geometry", async () => {
    const items = {
      holder: {
        id: "holder",
        x: 0,
        y: 0,
        rotation: 10,
        holdItems: true,
        linkedItems: ["token"],
      },
      token: { id: "token", x: 50, y: 0, rotation: 40 },
    };
    board.getItems.mockImplementation((ids) => ids.map((id) => items[id]));

    await hookValue.resetRotation(["holder", "token"]);

    const [ids, updater] = board.batchUpdateItems.mock.calls.at(-1);
    expect(ids).toEqual(["holder", "token"]);
    expect(updater(items.holder)).toEqual({ rotation: 0 });
    expect(updater(items.token)).toMatchObject({ rotation: 0 });
    expect(updater(items.token)).toHaveProperty("x");
    expect(updater(items.token)).toHaveProperty("y");
  });

  it("keeps action rotations continuous when crossing zero", async () => {
    const items = {
      holder: {
        id: "holder",
        x: 0,
        y: 0,
        rotation: 270,
        holdItems: true,
        linkedItems: ["token"],
      },
      token: {
        id: "token",
        x: 50,
        y: 0,
        rotation: 270,
      },
    };
    board.getItems.mockImplementation((ids) => ids.map((id) => items[id]));

    await hookValue.rotate(["holder"], { angle: 90 });

    const [, updater] = board.batchUpdateItems.mock.calls.at(-1);
    expect(updater(items.holder).rotation).toBe(360);
    expect(updater(items.token).rotation).toBe(360);
  });

  it("keeps random rotations continuous for holders and held items", async () => {
    const items = {
      holder: {
        id: "holder",
        x: 0,
        y: 0,
        rotation: 270,
        holdItems: true,
        linkedItems: ["token"],
      },
      token: {
        id: "token",
        x: 50,
        y: 0,
        rotation: 270,
      },
    };
    board.getItems.mockImplementation((ids) => ids.map((id) => items[id]));
    random.int.mockReturnValueOnce(1);

    await hookValue.randomlyRotate(["holder"], {
      angle: 90,
      maxRotateCount: 4,
    });

    const [, updater] = board.batchUpdateItems.mock.calls.at(-1);
    expect(updater(items.holder).rotation).toBe(360);
    expect(updater(items.token).rotation).toBe(360);
  });

  it("updates tap state on explicitly selected held items", async () => {
    const items = {
      holder: {
        id: "holder",
        x: 0,
        y: 0,
        rotation: 0,
        tapped: false,
        holdItems: true,
        linkedItems: ["token"],
      },
      token: {
        id: "token",
        x: 50,
        y: 0,
        rotation: 0,
        tapped: false,
      },
    };
    board.getItems.mockImplementation((ids) => ids.map((id) => items[id]));

    await hookValue.actionMap.tap.action()(["holder", "token"]);

    const [, updater] = board.batchUpdateItems.mock.calls.at(-1);
    expect(updater(items.token)).toMatchObject({
      x: 0,
      y: 50,
      rotation: 90,
      tapped: true,
    });
  });

  it("does not rewrite items for a zero rotation", async () => {
    await hookValue.rotate(["a"], { angle: 0 });
    await hookValue.actionMap.randomlyRotate.action({ angle: 0 })(["a"]);

    expect(board.batchUpdateItems).not.toHaveBeenCalled();
  });
});
