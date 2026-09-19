import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import backgrounds from "./boardBackgrounds";

const gridBackground = backgrounds.find(({ type }) => type === "grid");

describe("grid background", () => {
  beforeEach(() => {
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      stroke: vi.fn(),
    });
    vi.spyOn(HTMLCanvasElement.prototype, "toDataURL").mockReturnValue(
      "data:image/png;base64,test"
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders when the saved configuration is null", () => {
    expect(gridBackground.getStyle(null)).toMatchObject({
      backgroundColor: "#19202c",
      backgroundImage: "url(data:image/png;base64,test)",
    });
  });
});
