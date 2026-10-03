import splashLayout from "../../assets/brand/splash-layout.json";
import { ICON_VIEW_BOX } from "../../core/brand/brandGeometry.generated";
import { WORDMARK_ASPECT, WORDMARK_VIEW_BOX } from "../../core/brand/wordmarkGeometry";
import { ICON_ASPECT } from "../../core/ui/BrandIcon";

const [WM_X, WM_Y, WM_W] = WORDMARK_VIEW_BOX.split(" ").map(Number);

export type Box = { left: number; top: number; width: number; height: number };
/** Maps SVG user units into stage pixels. */
export type Projection = { left: number; top: number; scale: number; vbX: number; vbY: number };

export type StageGeometry = {
  width: number;
  height: number;
  cx: number;
  cy: number;
  dotSize: number;
  penSize: number;
  icon: Box & { projection: Projection };
  wordmark: Box & { projection: Projection };
  /** Static logo matching the native splash image (icon over wordmark). */
  handoff: Box & { iconHeight: number; gap: number; wordmarkWidth: number; wordmarkHeight: number };
};

export function stageGeometry(width: number, height: number): StageGeometry {
  const s = splashLayout.imageWidth / splashLayout.canvasWidth;
  const handoffWidth = splashLayout.imageWidth;
  const handoffIconHeight = (splashLayout.iconWidth * s) / ICON_ASPECT;
  const gap = splashLayout.gap * s;
  const wordmarkWidth = splashLayout.wordmarkWidth * s;
  const wordmarkHeight = wordmarkWidth / WORDMARK_ASPECT;
  const handoffHeight = handoffIconHeight + gap + wordmarkHeight;
  const handoffTop = (height - handoffHeight) / 2;

  const cx = width / 2;
  const cy = handoffTop + handoffIconHeight / 2;

  const iconWidth = Math.min(width * 0.64, 300);
  const iconHeight = iconWidth / ICON_ASPECT;
  const iconLeft = cx - iconWidth / 2;
  const iconTop = cy - iconHeight / 2;

  const wmWidth = Math.min(width * 0.56, 250);
  const wmHeight = wmWidth / WORDMARK_ASPECT;
  const wmLeft = cx - wmWidth / 2;
  const wmTop = cy - wmHeight / 2;

  return {
    width,
    height,
    cx,
    cy,
    dotSize: Math.round(Math.min(Math.max(width * 0.19, 56), 88)),
    penSize: 12,
    icon: {
      left: iconLeft,
      top: iconTop,
      width: iconWidth,
      height: iconHeight,
      projection: {
        left: iconLeft,
        top: iconTop,
        scale: iconWidth / ICON_VIEW_BOX.w,
        vbX: ICON_VIEW_BOX.x,
        vbY: ICON_VIEW_BOX.y,
      },
    },
    wordmark: {
      left: wmLeft,
      top: wmTop,
      width: wmWidth,
      height: wmHeight,
      projection: { left: wmLeft, top: wmTop, scale: wmWidth / WM_W, vbX: WM_X, vbY: WM_Y },
    },
    handoff: {
      left: cx - handoffWidth / 2,
      top: handoffTop,
      width: handoffWidth,
      height: handoffHeight,
      iconHeight: handoffIconHeight,
      gap,
      wordmarkWidth,
      wordmarkHeight,
    },
  };
}

export type Point = { x: number; y: number };

/** Point at fraction `p` along evenly spaced samples `[x0, y0, x1, y1, …]`. */
export function samplePath(points: readonly number[], p: number): Point {
  "worklet";
  const n = points.length / 2;
  const f = Math.min(Math.max(p, 0), 1) * (n - 1);
  const i = Math.floor(f);
  const j = Math.min(i + 1, n - 1);
  const t = f - i;
  return {
    x: points[i * 2] + (points[j * 2] - points[i * 2]) * t,
    y: points[i * 2 + 1] + (points[j * 2 + 1] - points[i * 2 + 1]) * t,
  };
}

export function project(point: Point, pr: Projection): Point {
  "worklet";
  return { x: pr.left + (point.x - pr.vbX) * pr.scale, y: pr.top + (point.y - pr.vbY) * pr.scale };
}
