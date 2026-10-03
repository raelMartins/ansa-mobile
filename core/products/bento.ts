import type { AnsaProduct } from "./catalog";

export type TileKind = "hero" | "tall" | "small";
export type BentoCell = { product: AnsaProduct; kind: TileKind; x: number; y: number; w: number; h: number };

export const BENTO_GAP = 12;

/**
 * Ordered bento: a full-width hero, then groups of three that alternate a tall tile
 * on the left / right so the grid feels playful but still reads top-to-bottom.
 */
export function bentoLayout(products: AnsaProduct[], width: number, compact = false) {
  const col = (width - BENTO_GAP) / 2;
  const hero = compact ? 112 : 148;
  const small = compact ? 96 : 108;
  const tall = small * 2 + BENTO_GAP;
  const cells: BentoCell[] = [];
  if (products.length === 0) {
    return { cells, height: 0 };
  }
  const [first, ...rest] = products;
  cells.push({ product: first, kind: "hero", x: 0, y: 0, w: width, h: hero });
  let y = hero + BENTO_GAP;

  for (let g = 0; g < rest.length; g += 3) {
    const group = rest.slice(g, g + 3);
    if (group.length === 3) {
      const tallLeft = (g / 3) % 2 === 0;
      const [tallItem, a, b] = tallLeft ? group : [group[2], group[0], group[1]];
      const tx = tallLeft ? 0 : col + BENTO_GAP;
      const sx = tallLeft ? col + BENTO_GAP : 0;
      cells.push({ product: tallItem, kind: "tall", x: tx, y, w: col, h: tall });
      cells.push({ product: a, kind: "small", x: sx, y, w: col, h: small });
      cells.push({ product: b, kind: "small", x: sx, y: y + small + BENTO_GAP, w: col, h: small });
      y += tall + BENTO_GAP;
    } else if (group.length === 2) {
      cells.push({ product: group[0], kind: "small", x: 0, y, w: col, h: small });
      cells.push({ product: group[1], kind: "small", x: col + BENTO_GAP, y, w: col, h: small });
      y += small + BENTO_GAP;
    } else {
      cells.push({ product: group[0], kind: "small", x: 0, y, w: width, h: small });
      y += small + BENTO_GAP;
    }
  }
  return { cells, height: y - BENTO_GAP };
}
