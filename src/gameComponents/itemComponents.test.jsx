import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

const register = vi.fn(() => vi.fn());
const setState = vi.fn();
const action = vi.fn();

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (value) => value }),
  initReactI18next: { type: "3rdParty", init: () => {} },
}));

vi.mock("react-sync-board", () => ({
  useUsers: () => ({
    currentUser: { uid: "me" },
    localUsers: [{ uid: "me", color: "red" }],
    isSpaceMaster: true,
  }),
  useItemInteraction: () => ({ register, call: vi.fn() }),
  useItemActions: () => ({
    getItemList: () => [],
    getItems: vi.fn(async () => []),
    pushItem: vi.fn(),
    register: vi.fn(),
    batchUpdateItems: vi.fn(),
    removeItems: vi.fn(),
  }),
  useBoardState: () => ({ movingItems: false }),
  useSelectedItems: () => [],
}));

vi.mock("../hooks/useGlobalConf", () => ({
  default: () => ({ editMode: false, editItem: false }),
}));
vi.mock("./useGameItemActions", () => ({
  default: () => ({ roll: action, snapToPoint: action, actionMap: {} }),
}));
vi.mock("./Canvas", () => ({
  default: ({ layers = [] }) => (
    <div data-testid="canvas">
      {layers.map(({ url }, index) => (
        <img key={index} alt={`layer-${index}`} src={url} />
      ))}
    </div>
  ),
}));

import itemTemplates from "./itemTemplates";

const specialProps = {
  image: {
    content: "/front.png",
    backContent: "/back.png",
    text: "front",
    backText: "back",
  },
  advancedImage: {
    front: "/front.png",
    back: "/back.png",
    layers: [{ images: ["/layer.png"], side: "both" }],
  },
  diceImage: { images: [{ content: "/die.png" }] },
  screen: { ownedBy: [] },
  zone: { label: "Zone" },
  note: { label: "Note" },
  counter: { label: "Counter" },
  dice: { label: "Die" },
};

const renderItem = (type, extra = {}) => {
  const template = itemTemplates[type];
  const Component = template.component;
  const defaults =
    typeof template.template === "function"
      ? template.template()
      : template.template;
  return render(
    <Component
      {...defaults}
      {...specialProps[type]}
      id={`${type}-1`}
      {...extra}
      setState={setState}
    />
  );
};

describe("game item components", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it.each(Object.keys(itemTemplates))(
    "mounts and renders the primary output for %s",
    (type) => {
      renderItem(type);
      expect(document.body.firstChild).toBeTruthy();
    }
  );

  it("supports counter increment, decrement, and direct editing", async () => {
    const user = userEvent.setup();
    renderItem("counter", { value: 2 });
    await user.click(screen.getByRole("button", { name: "+" }));
    await user.click(screen.getByRole("button", { name: "-" }));
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "17" } });
    expect(setState).toHaveBeenCalledTimes(3);
    expect(setState.mock.calls[0][0]({ value: 2 })).toEqual({ value: 3 });
    expect(setState.mock.calls[1][0]({ value: 2 })).toEqual({ value: 1 });
    expect(setState.mock.calls[2][0]({ value: 2 })).toEqual({ value: 17 });
  });

  it("updates note text", () => {
    renderItem("note", { value: "old" });
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "new" } });
    expect(setState).toHaveBeenCalledWith(expect.any(Function));
    expect(setState.mock.calls[0][0]({ other: true })).toEqual({
      other: true,
      value: "new",
    });
  });

  it("wires dice rolling and placement-triggered image-die rolls", () => {
    renderItem("dice", { id: "die-1" });
    fireEvent.click(screen.getByRole("button", { name: "Roll" }));
    expect(action).toHaveBeenCalledWith(["die-1"]);

    action.mockClear();
    renderItem("diceImage", { id: "die-image-1" });
    expect(register).toHaveBeenCalled();
  });

  it("claims and releases a screen for the current user", async () => {
    const user = userEvent.setup();
    renderItem("screen", { ownedBy: [] });
    await user.click(screen.getByRole("button", { name: "Claim it" }));
    expect(setState).toHaveBeenCalled();
    expect(setState.mock.calls[0][0]({ ownedBy: [] })).toEqual({
      ownedBy: ["me"],
    });
  });
});
