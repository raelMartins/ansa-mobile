/**
 * Renders the native splash image (brand icon over wordmark) to `assets/splash-logo.png`.
 * Layout comes from `assets/brand/splash-layout.json`, shared with the in-app handoff frame.
 * Run after brand artwork or ecosystem colours change: `pnpm brand:splash`.
 */
import { Resvg } from "@resvg/resvg-js";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { ICON_CURVE, ICON_PRIMARY, ICON_SECONDARY_LENS, ICON_SECONDARY_RING, ICON_VIEW_BOX } from "../core/brand/brandGeometry.generated.ts";
import { iconCurveColor, iconSecondary } from "../core/brand/color.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const layout = JSON.parse(readFileSync(join(root, "assets/brand/splash-layout.json"), "utf8"));
const wordmarkSvg = readFileSync(join(root, "assets/brand/ansa.svg"), "utf8");
const wordmarkD = wordmarkSvg.match(/\sd="([^"]+)"/)[1];
const [wmX, wmY, wmW, wmH] = wordmarkSvg.match(/viewBox="([^"]+)"/)[1].split(/\s+/).map(Number);

const PRIMARY = "#2d4236";
const secondary = iconSecondary(PRIMARY);
const curve = iconCurveColor(PRIMARY, layout.background);

const W = layout.canvasWidth;
const iconScale = layout.iconWidth / ICON_VIEW_BOX.w;
const iconH = ICON_VIEW_BOX.h * iconScale;
const wmScale = layout.wordmarkWidth / wmW;
const wordmarkH = wmH * wmScale;
const H = iconH + layout.gap + wordmarkH;
const wmLeft = (W - layout.wordmarkWidth) / 2;

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <g transform="scale(${iconScale}) translate(${-ICON_VIEW_BOX.x} ${-ICON_VIEW_BOX.y})">
    <path d="${ICON_PRIMARY.d}" fill="${PRIMARY}" fill-rule="evenodd"/>
    <path d="${ICON_SECONDARY_RING.d}" fill="${secondary}" fill-rule="evenodd"/>
    <path d="${ICON_SECONDARY_LENS.d}" fill="${secondary}" fill-rule="evenodd"/>
    <path d="${ICON_CURVE.d}" fill="${curve}" fill-rule="evenodd"/>
  </g>
  <g transform="translate(${wmLeft} ${iconH + layout.gap}) scale(${wmScale}) translate(${-wmX} ${-wmY})">
    <path d="${wordmarkD}" fill="${PRIMARY}" fill-rule="evenodd"/>
  </g>
</svg>`;

const png = new Resvg(svg, { fitTo: { mode: "width", value: W * 2 } }).render().asPng();
writeFileSync(join(root, "assets/splash-logo.png"), png);
console.log(`splash-logo.png ${W * 2}×${Math.round(H * 2)} (curve ${curve})`);
