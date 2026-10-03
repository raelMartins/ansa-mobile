import { BENTO_GAP, bentoLayout, type BentoCell } from "./bento";
import { ANSA_PRODUCTS } from "./catalog";

function overlaps(a: BentoCell, b: BentoCell) {
  return a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
}

describe("bentoLayout", () => {
  const width = 350;
  const { cells, height } = bentoLayout(ANSA_PRODUCTS, width);

  it("places every product exactly once, merchant as the hero", () => {
    expect(cells.map((c) => c.product.id).sort()).toEqual(ANSA_PRODUCTS.map((p) => p.id).sort());
    expect(cells[0]).toMatchObject({ kind: "hero", w: width });
    expect(cells[0].product.id).toBe("merchant");
  });

  it("never overlaps tiles and stays inside the grid", () => {
    for (let i = 0; i < cells.length; i++) {
      const c = cells[i];
      expect(c.x).toBeGreaterThanOrEqual(0);
      expect(c.x + c.w).toBeLessThanOrEqual(width + 0.001);
      expect(c.y + c.h).toBeLessThanOrEqual(height + 0.001);
      for (let j = i + 1; j < cells.length; j++) {
        expect(overlaps(c, cells[j])).toBe(false);
      }
    }
  });

  it("alternates the tall tile side between groups", () => {
    const talls = cells.filter((c) => c.kind === "tall");
    expect(talls).toHaveLength(2);
    expect(talls[0].x).toBe(0);
    expect(talls[1].x).toBeCloseTo((width - BENTO_GAP) / 2 + BENTO_GAP);
  });

  it("only merchant is enabled; rider and shop are not in the grid", () => {
    expect(ANSA_PRODUCTS.filter((p) => p.enabled).map((p) => p.id)).toEqual(["merchant"]);
    const ids = ANSA_PRODUCTS.map((p) => p.id as string);
    expect(ids).not.toContain("rider");
    expect(ids).not.toContain("shop");
    expect(ids).toContain("health");
  });
});
