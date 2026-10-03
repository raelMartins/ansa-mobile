import { contrast, iconCurveColor, iconSecondary, knockoutOn, mix } from "./color";

describe("icon colour rules", () => {
  it("derives the secondary tone the master SVG uses (forest → sage)", () => {
    const sage = iconSecondary("#2d4236");
    // Master artwork sage is #93a097; allow rounding drift of one step per channel.
    const target = [0x93, 0xa0, 0x97];
    const actual = [1, 3, 5].map((i) => parseInt(sage.slice(i, i + 2), 16));
    actual.forEach((v, i) => expect(Math.abs(v - target[i])).toBeLessThanOrEqual(2));
  });

  it("keeps the smile white on dark surfaces", () => {
    expect(iconCurveColor("#2d4236", "#1f2622")).toBe("#ffffff");
    expect(iconCurveColor("#5c4a6e", "#2d4236")).toBe("#ffffff");
  });

  it("falls back to a light primary tint that still separates on light surfaces", () => {
    const bg = "#eef2ef";
    const curve = iconCurveColor("#2d4236", bg);
    expect(curve).not.toBe("#ffffff");
    expect(contrast(curve, bg)).toBeGreaterThanOrEqual(1.4);
    // Still reads as light — lighter than the secondary ring.
    expect(contrast(curve, "#ffffff")).toBeLessThan(contrast(iconSecondary("#2d4236"), "#ffffff"));
  });

  it("knocks out white on dark product primaries and dark on pale ones", () => {
    expect(knockoutOn("#2d4236")).toBe("#ffffff");
    expect(knockoutOn("#f3e9c8")).toBe("#111111");
  });

  it("mixes linearly", () => {
    expect(mix("#000000", "#ffffff", 0.5)).toBe("#808080");
  });
});
