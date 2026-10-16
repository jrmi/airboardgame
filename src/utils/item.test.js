import { describe, expect, it } from "vitest";

import {
  getContinuousRotation,
  getHeldOwners,
  getHeldRotationUpdates,
} from "./item";

describe("continuous editor rotations", () => {
  it("crosses zero in both directions without a full-turn CSS interpolation", () => {
    let rotation = 350;
    const forward = [-5, 0, 5, 10].map((target) => {
      rotation = getContinuousRotation(rotation, target);
      return rotation;
    });
    expect(forward).toEqual([355, 360, 365, 370]);
    const backward = [5, 0, -5, -10].map((target) => {
      rotation = getContinuousRotation(rotation, target);
      return rotation;
    });
    expect(backward).toEqual([365, 360, 355, 350]);
    expect(getContinuousRotation(-5, 0)).toBe(0);
    expect(getContinuousRotation(360, 0)).toBe(360);
  });
});

const dimensions = (items) =>
  Object.fromEntries(
    items.map(({ id, width = 10, height = 10 }) => [id, { width, height }])
  );

describe("getHeldRotationUpdates", () => {
  it("ignores linked items belonging to non-holding components", () => {
    const items = [
      {
        id: "generator",
        linkedItems: ["token"],
      },
      { id: "token" },
    ];

    expect(getHeldOwners({ items, dimensions: dimensions(items) })).toEqual({});
  });

  it("rotates a directly held item around its holder", () => {
    const items = [
      {
        id: "holder",
        x: 0,
        y: 0,
        width: 50,
        height: 50,
        rotation: 0,
        holdItems: true,
        linkedItems: ["token"],
      },
      {
        id: "token",
        x: 50,
        y: 0,
        rotation: 0,
        heldBy: "holder",
        heldOffset: { x: 30, y: -20 },
        heldAngle: 0,
      },
    ];

    expect(
      getHeldRotationUpdates({
        items,
        dimensions: dimensions(items),
        rootAngleDeltas: { holder: 90 },
      }).updates.token
    ).toEqual({ x: 40, y: 50, rotation: 90 });
  });

  it("uses immediate parents once for nested held stacks", () => {
    const items = [
      {
        id: "board",
        x: 0,
        y: 0,
        width: 100,
        height: 100,
        rotation: 0,
        holdItems: true,
        linkedItems: ["card", "token"],
      },
      {
        id: "card",
        x: 50,
        y: 25,
        width: 50,
        height: 50,
        rotation: 0,
        holdItems: true,
        linkedItems: ["token"],
        heldBy: "board",
        heldOffset: { x: 25, y: 0 },
        heldAngle: 0,
      },
      {
        id: "token",
        x: 80,
        y: 45,
        rotation: 0,
        heldBy: "card",
        heldOffset: { x: 10, y: 0 },
        heldAngle: 0,
      },
    ];

    const updates = getHeldRotationUpdates({
      items,
      dimensions: dimensions(items),
      rootAngleDeltas: { board: 90 },
    }).updates;
    expect(updates.card).toEqual({ x: 25, y: 50, rotation: 90 });
    expect(updates.token).toEqual({ x: 45, y: 80, rotation: 90 });
  });

  it("filters selected descendants and supports legacy flat links", () => {
    const items = [
      {
        id: "holder",
        x: 0,
        y: 0,
        width: 50,
        height: 50,
        rotation: 0,
        holdItems: true,
        linkedItems: ["token"],
      },
      { id: "token", x: 50, y: 0, rotation: 0 },
    ];
    const result = getHeldRotationUpdates({
      items,
      dimensions: dimensions(items),
      rootAngleDeltas: { holder: -90, token: -90 },
    });

    expect(result.roots).toEqual(["holder"]);
    expect(result.updates.token).toEqual({ x: 0, y: -10, rotation: -90 });
  });

  it("keeps held item rotations continuous when crossing zero", () => {
    const items = [
      {
        id: "holder",
        x: 0,
        y: 0,
        width: 50,
        height: 50,
        rotation: 270,
        holdItems: true,
        linkedItems: ["token"],
      },
      {
        id: "token",
        x: 50,
        y: 0,
        rotation: 270,
        heldBy: "holder",
        heldOffset: { x: -20, y: -30 },
        heldAngle: 270,
      },
    ];

    const updates = getHeldRotationUpdates({
      items,
      dimensions: dimensions(items),
      rootAngleDeltas: { holder: 90 },
    }).updates;

    expect(updates.token.rotation).toBe(360);
  });

  it("ignores stale ownership after an item leaves its holder", () => {
    const items = [
      {
        id: "holder",
        x: 0,
        y: 0,
        width: 50,
        height: 50,
        rotation: 0,
        holdItems: true,
        linkedItems: [],
      },
      {
        id: "token",
        x: 100,
        y: 0,
        rotation: 0,
        heldBy: "holder",
        heldOffset: { x: 30, y: 0 },
        heldAngle: 0,
      },
    ];

    const result = getHeldRotationUpdates({
      items,
      dimensions: dimensions(items),
      rootAngleDeltas: { holder: 90, token: 90 },
    });

    expect(result.roots).toEqual(["holder", "token"]);
    expect(result.updates).toEqual({});
  });
});
