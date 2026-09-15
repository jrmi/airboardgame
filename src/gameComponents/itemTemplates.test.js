import { describe, expect, it, vi } from "vitest";

import itemTemplates, { itemLibrary } from "./itemTemplates";

const inventory = [
  [
    "rect",
    ["lock", "remove"],
    [
      "flip",
      "stack",
      "alignAsLine",
      "alignAsSquare",
      "shuffle",
      "clone",
      "lock",
      "remove",
    ],
  ],
  [
    "cube",
    ["clone", "lock", "remove"],
    [
      "stack",
      "alignAsLine",
      "alignAsSquare",
      "shuffle",
      "clone",
      "lock",
      "remove",
    ],
  ],
  [
    "cylinder",
    ["clone", "lock", "remove"],
    [
      "stack",
      "alignAsLine",
      "alignAsSquare",
      "shuffle",
      "clone",
      "lock",
      "remove",
    ],
  ],
  [
    "round",
    ["clone", "lock", "remove"],
    [
      "flip",
      "stack",
      "alignAsLine",
      "alignAsSquare",
      "shuffle",
      "clone",
      "lock",
      "remove",
    ],
  ],
  [
    "hexagon",
    ["clone", "lock", "remove"],
    [
      "flip",
      "stack",
      "alignAsLine",
      "alignAsSquare",
      "shuffle",
      "clone",
      "lock",
      "remove",
    ],
  ],
  [
    "token",
    ["clone", "lock", "remove"],
    [
      "flip",
      "stack",
      "alignAsLine",
      "alignAsSquare",
      "shuffle",
      "clone",
      "lock",
      "remove",
    ],
  ],
  [
    "meeple",
    ["clone", "lock", "remove"],
    [
      "stack",
      "alignAsLine",
      "alignAsSquare",
      "shuffle",
      "clone",
      "lock",
      "remove",
    ],
  ],
  [
    "pawn",
    ["clone", "lock", "remove"],
    [
      "stack",
      "alignAsLine",
      "alignAsSquare",
      "shuffle",
      "clone",
      "lock",
      "remove",
    ],
  ],
  [
    "jewel",
    ["clone", "lock", "remove"],
    [
      "stack",
      "alignAsLine",
      "alignAsSquare",
      "shuffle",
      "clone",
      "lock",
      "remove",
    ],
  ],
  ["checkerboard", ["clone", "lock", "remove"], ["clone", "lock", "remove"]],
  [
    "image",
    ["tap", "stack", "shuffle", "clone", "lock", "remove"],
    [
      "tap",
      "rotate",
      "randomlyRotate",
      "stack",
      "alignAsLine",
      "alignAsSquare",
      "shuffle",
      "clone",
      "lock",
      "remove",
    ],
  ],
  [
    "advancedImage",
    ["stack", "shuffle", "clone", "lock", "remove"],
    [
      "tap",
      "rotate",
      "randomlyRotate",
      "stack",
      "alignAsLine",
      "alignAsSquare",
      "shuffle",
      "clone",
      "lock",
      "remove",
    ],
  ],
  [
    "counter",
    ["prevImage", "nextImage", "clone", "lock", "remove"],
    ["prevImage", "nextImage", "clone", "lock", "remove"],
  ],
  [
    "dice",
    ["roll", "clone", "lock", "remove"],
    ["roll", "clone", "lock", "remove", "alignAsLine", "alignAsSquare"],
  ],
  [
    "diceImage",
    ["roll", "prevImage", "nextImage", "clone", "lock", "remove"],
    [
      "roll",
      "prevImage",
      "nextImage",
      "clone",
      "lock",
      "remove",
      "alignAsLine",
      "alignAsSquare",
    ],
  ],
  [
    "note",
    ["shuffle", "clone", "lock", "remove"],
    ["shuffle", "clone", "lock", "remove", "alignAsLine", "alignAsSquare"],
  ],
  ["anchor", ["clone", "lock", "remove"], ["clone", "lock", "remove"]],
  [
    "zone",
    ["clone", "lock", "remove"],
    ["clone", "lock", "remove", "alignAsLine", "alignAsSquare"],
  ],
  ["screen", ["clone", "lock", "remove"], ["clone", "lock", "remove"]],
  ["generator", ["clone", "lock", "remove"], ["clone", "lock", "remove"]],
];

const resolve = (value, item) =>
  typeof value === "function" ? value(item) : value;

describe("registered game item templates", () => {
  it.each(inventory)(
    "registers the complete %s item contract",
    (type, defaults, available) => {
      const template = itemTemplates[type];

      expect(itemLibrary).toContain(template);
      expect(template).toMatchObject({
        type,
        component: expect.anything(),
        name: expect.anything(),
      });
      expect(template.template).toBeDefined();
      expect(template.form).toBeDefined();
      expect(resolve(template.defaultActions, { type })).toEqual(defaults);
      expect(resolve(template.availableActions, { type })).toEqual(available);
    }
  );

  it("keeps the inventory unique and indexed by type", () => {
    expect(itemLibrary).toHaveLength(20);
    expect(new Set(itemLibrary.map(({ type }) => type)).size).toBe(20);
    expect(Object.keys(itemTemplates)).toEqual(
      itemLibrary.map(({ type }) => type)
    );
  });

  it("creates fresh generated defaults", () => {
    const first = itemTemplates.diceImage.template();
    const second = itemTemplates.diceImage.template();
    expect(first.images).toHaveLength(6);
    expect(first.images).not.toBe(second.images);
    expect(first.images.map(({ content }) => content)).toEqual([
      "/game_assets/dice/one.svg",
      "/game_assets/dice/two.svg",
      "/game_assets/dice/three.svg",
      "/game_assets/dice/four.svg",
      "/game_assets/dice/five.svg",
      "/game_assets/dice/six.svg",
    ]);
    expect(new Set(first.images.map(({ id }) => id)).size).toBe(6);
  });

  it("resolves conditional image actions for backs and layers", () => {
    const image = itemTemplates.image;
    expect(resolve(image.defaultActions, { type: "image" })).not.toContain(
      "flip"
    );
    expect(
      resolve(image.defaultActions, { type: "image", backContent: "back" })
    ).toContain("flip");
    expect(
      resolve(itemTemplates.advancedImage.defaultActions, { layers: [] })
    ).not.toContain("nextImage");
    expect(
      resolve(itemTemplates.advancedImage.availableActions, { layers: [{}] })
    ).toEqual(
      expect.arrayContaining([
        "prevImageForLayer",
        "nextImageForLayer",
        "rollLayer",
      ])
    );
    expect(
      resolve(itemTemplates.advancedImage.availableActions, {
        back: "back",
        layers: [{}],
      })[0]
    ).toBe("flip");
  });

  it("maps all image media fields, including optional overlay content", async () => {
    const map = vi.fn(async (value) => (value ? `mapped:${value}` : value));
    const item = {
      content: "front",
      backContent: "back",
      overlay: { content: "overlay" },
    };
    await itemTemplates.image.mapMedia(item, map);
    expect(item).toEqual({
      content: "mapped:front",
      backContent: "mapped:back",
      overlay: { content: "mapped:overlay" },
    });
    expect(map).toHaveBeenCalledTimes(3);
  });

  it("moves an unowned screen above board content", () => {
    const stateHook = itemTemplates.screen.stateHook;
    expect(
      stateHook({ layer: -2 }, { currentUser: { uid: "u1" } })
    ).toMatchObject({ layer: 3.6 });
    expect(
      stateHook({ layer: 2, ownedBy: ["u1"] }, { currentUser: { uid: "u1" } })
    ).toEqual({ layer: 2, ownedBy: ["u1"] });
  });
});
