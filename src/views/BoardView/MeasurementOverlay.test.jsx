import { describe, expect, it } from "vitest";
import { formatBoardDistance } from "./MeasurementOverlay";

describe("formatBoardDistance", () => {
  it("converts board pixels to centimeters at 96 pixels per 2.5 cm", () => {
    expect(formatBoardDistance(96)).toBe("2.5 cm");
  });

  it("converts board pixels to inches at 96 pixels per inch", () => {
    expect(formatBoardDistance(192, { measurementUnit: "inches" })).toBe(
      "2 in"
    );
  });

  it("uses the configured free scale and unit label", () => {
    expect(
      formatBoardDistance(75, {
        measurementUnit: "free",
        pixelsPerUnit: 25,
        unitLabel: "spaces",
      })
    ).toBe("3 spaces");
  });
});
