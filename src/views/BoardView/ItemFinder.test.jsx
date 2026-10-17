import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const board = vi.hoisted(() => ({
  items: [],
  zoomToExtent: vi.fn(),
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (value) => value }),
  initReactI18next: { type: "3rdParty", init: () => {} },
}));

vi.mock("react-sync-board", () => ({
  useItems: () => board.items,
  useBoardPosition: () => ({ zoomToExtent: board.zoomToExtent }),
}));

vi.mock("../../ui/SidePanel", () => ({
  default: ({ children, title }) => (
    <section aria-label={title}>{children}</section>
  ),
}));

vi.mock("../../gameComponents/itemTemplates", () => ({
  default: {
    counter: {
      name: "Counter",
      component: ({ label }) => <span data-testid="preview">{label}</span>,
    },
  },
}));

import ItemFinder, {
  getItemDisplayName,
  getPreviewImageUrl,
  getPreviewSize,
} from "./ItemFinder";

const renderFinder = () => render(<ItemFinder open={true} onClose={vi.fn()} />);

describe("ItemFinder", () => {
  afterEach(() => {
    cleanup();
    board.items = [];
    board.zoomToExtent.mockClear();
  });

  it("uses label, then text, then the item template name", () => {
    const templates = { counter: { name: "Counter" } };

    expect(
      getItemDisplayName(
        { type: "counter", label: "Label", text: "Text" },
        templates
      )
    ).toBe("Label");
    expect(
      getItemDisplayName({ type: "counter", text: "Text" }, templates)
    ).toBe("Text");
    expect(getItemDisplayName({ type: "counter" }, templates)).toBe("Counter");
  });

  it("translates item template names at render time", () => {
    const templates = {
      counter: { name: "Counter", translationKey: "Counter" },
    };

    expect(
      getItemDisplayName({ type: "counter" }, templates, (value) =>
        value === "Counter" ? "Compteur" : value
      )
    ).toBe("Compteur");
  });

  it("keeps image previews within the thumbnail without changing their ratio", () => {
    expect(getPreviewSize({ type: "image", width: 400, height: 200 })).toEqual({
      width: 64,
      height: 32,
    });
    expect(
      getPreviewSize({ type: "diceImage", width: 100, height: 50 })
    ).toEqual({ width: 64, height: 32 });
    expect(
      getPreviewSize({ type: "advancedImage", width: 100, height: 300 })
    ).toEqual({ width: expect.closeTo(21.33, 2), height: 64 });
    expect(getPreviewSize({ type: "image" })).toEqual({ width: 64 });
  });

  it("uses the currently visible image as the preview loading source", () => {
    expect(
      getPreviewImageUrl({
        type: "image",
        content: "/front.png",
        backContent: "/back.png",
        flipped: true,
      })
    ).toBe("/back.png");
    expect(
      getPreviewImageUrl({
        type: "advancedImage",
        front: "/front.png",
        back: "/back.png",
        flipped: false,
      })
    ).toBe("/front.png");
  });

  it("filters live items case- and diacritic-insensitively", () => {
    board.items = [{ id: "first", type: "counter", label: "Éléphant" }];
    const view = renderFinder();

    fireEvent.change(screen.getByRole("searchbox"), {
      target: { value: "ele" },
    });
    expect(screen.getByRole("button", { name: "Éléphant" })).toBeTruthy();
    expect(screen.getByTestId("preview")).toBeTruthy();

    board.items = [
      ...board.items,
      { id: "second", type: "counter", label: "Eleven" },
    ];
    view.rerender(<ItemFinder open={true} onClose={vi.fn()} />);
    expect(screen.getByRole("button", { name: "Eleven" })).toBeTruthy();
  });

  it("only renders previews for visible results", () => {
    board.items = Array.from({ length: 100 }, (_, index) => ({
      id: `counter-${index}`,
      type: "counter",
      label: `Counter ${index}`,
    }));
    renderFinder();

    expect(screen.getAllByTestId("preview").length).toBeLessThan(25);

    fireEvent.scroll(screen.getByRole("list"), {
      target: { scrollTop: 80 * 50 },
    });
    expect(screen.getByRole("button", { name: "Counter 50" })).toBeTruthy();
  });

  it("selects and centers the board on the rendered item", () => {
    board.items = [
      { id: "counter-1", type: "counter", label: "Counter", x: 10, y: 20 },
    ];
    const element = document.createElement("div");
    element.dataset.id = "counter-1";
    element.className = "item counter-1";
    const pointerDown = vi.fn();
    const pointerUp = vi.fn();
    element.addEventListener("pointerdown", pointerDown);
    element.addEventListener("pointerup", pointerUp);
    Object.defineProperties(element, {
      offsetWidth: { value: 40 },
      offsetHeight: { value: 20 },
    });
    document.body.append(element);

    renderFinder();
    fireEvent.click(screen.getByRole("button", { name: "Counter" }));

    expect(board.zoomToExtent).toHaveBeenCalledWith({
      x: 30,
      y: 30,
      radius: 20,
    });
    expect(pointerDown).toHaveBeenCalledOnce();
    expect(pointerUp).toHaveBeenCalledOnce();
    element.remove();
  });
});
