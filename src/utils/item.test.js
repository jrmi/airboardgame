import { afterEach, describe, expect, it } from "vitest";
import { captureHeldReferences, getHeldIdsToCapture } from "./item";

// Mirrors react-sync-board's item styling: 2px padding normally, a 2px border
// instead when selected, so only clientWidth/clientHeight change.
const addItemElement = (id, width, height, { selected = false } = {}) => {
  const element = document.createElement("div");
  element.className = `item ${id}`;
  const border = selected ? 4 : 0;
  Object.defineProperty(element, "offsetWidth", { value: width });
  Object.defineProperty(element, "offsetHeight", { value: height });
  Object.defineProperty(element, "clientWidth", { value: width - border });
  Object.defineProperty(element, "clientHeight", { value: height - border });
  document.body.appendChild(element);
};

describe("held item references", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("recaptures items that just became held or were moved while held", () => {
    expect(
      getHeldIdsToCapture({
        previousLinkedItemIds: ["moved", "untouched"],
        newLinkedItemIds: ["moved", "untouched", "new"],
        placedItemIds: ["moved"],
      })
    ).toEqual(["moved", "new"]);
  });

  it("doesn't recapture held items when only the holder moved", () => {
    expect(
      getHeldIdsToCapture({
        previousLinkedItemIds: ["token"],
        newLinkedItemIds: ["token"],
        placedItemIds: ["holder"],
      })
    ).toEqual([]);
  });

  it("captures the offset from the holder's center and its current angle", () => {
    addItemElement("holder", 100, 100);
    addItemElement("token", 20, 20);
    const itemList = [
      { id: "holder", x: 0, y: 0, rotation: 30, linkedItems: ["token"] },
      { id: "token", x: 60, y: 10, rotation: 45 },
    ];

    expect(
      captureHeldReferences({
        holderId: "holder",
        heldIds: ["token"],
        itemList,
      })
    ).toEqual({
      token: { heldOffset: { x: 20, y: -30 }, heldAngle: 30, heldBy: "holder" },
    });
  });

  it("measures the same offset whether or not the held item is selected", () => {
    addItemElement("holder", 100, 100);
    addItemElement("token", 20, 20, { selected: true });
    const itemList = [
      { id: "holder", x: 0, y: 0, linkedItems: ["token"] },
      { id: "token", x: 60, y: 10 },
    ];

    expect(
      captureHeldReferences({
        holderId: "holder",
        heldIds: ["token"],
        itemList,
      }).token.heldOffset
    ).toEqual({ x: 20, y: -30 });
  });

  it("leaves items on a nested holder to that nearer holder", () => {
    addItemElement("board", 400, 400);
    addItemElement("card", 100, 100);
    addItemElement("token", 20, 20);
    const itemList = [
      { id: "board", x: 0, y: 0, linkedItems: ["card", "token"] },
      { id: "card", x: 100, y: 100, linkedItems: ["token"] },
      { id: "token", x: 140, y: 140 },
    ];

    const references = captureHeldReferences({
      holderId: "board",
      heldIds: ["card", "token"],
      itemList,
    });

    expect(Object.keys(references)).toEqual(["card"]);
  });
});
