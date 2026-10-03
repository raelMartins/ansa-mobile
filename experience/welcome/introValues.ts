import { useSharedValue, type SharedValue } from "react-native-reanimated";
import {
  ICON_CURVE,
  ICON_PRIMARY,
  ICON_SECONDARY_RING,
  WORDMARK_LETTERS,
} from "../../core/brand/brandGeometry.generated";
import { project, samplePath, type Point, type StageGeometry } from "./geometry";

/** Where the dot is: free-floating, or riding the stroke front of a traced shape. */
export const PEN = { free: 0, primary: 1, secondary: 2, curve: 3, wordmark: 4 } as const;

/** Share of each letter's time spent drawing; the rest is the pen hopping to the next letter. */
export const LETTER_DRAW_SHARE = 0.84;
/** `wordP` end value — past 4 so the last letter's fill finishes. */
export const WORDMARK_DONE = 4.25;

export type IntroValues = {
  dotX: SharedValue<number>;
  dotY: SharedValue<number>;
  /** Rendered diameter in px. */
  dotSize: SharedValue<number>;
  dotOpacity: SharedValue<number>;
  bounceY: SharedValue<number>;
  /** −1 stretch … 0 round … 1 squash. */
  squash: SharedValue<number>;
  penMode: SharedValue<number>;
  /** 0 = dot colour, 1 = icon secondary. */
  penTone: SharedValue<number>;
  p1: SharedValue<number>;
  f1: SharedValue<number>;
  p2: SharedValue<number>;
  f2: SharedValue<number>;
  sweep: SharedValue<number>;
  iconOpacity: SharedValue<number>;
  iconScale: SharedValue<number>;
  wordP: SharedValue<number>;
  heroOpacity: SharedValue<number>;
  heroX: SharedValue<number>;
  heroY: SharedValue<number>;
  heroScale: SharedValue<number>;
  logoOpacity: SharedValue<number>;
  logoScale: SharedValue<number>;
};

export function useIntroValues(geo: StageGeometry): IntroValues {
  return {
    dotX: useSharedValue(geo.cx),
    dotY: useSharedValue(geo.cy),
    dotSize: useSharedValue(0),
    dotOpacity: useSharedValue(0),
    bounceY: useSharedValue(0),
    squash: useSharedValue(0),
    penMode: useSharedValue<number>(PEN.free),
    penTone: useSharedValue(0),
    p1: useSharedValue(0),
    f1: useSharedValue(0),
    p2: useSharedValue(0),
    f2: useSharedValue(0),
    sweep: useSharedValue(0),
    iconOpacity: useSharedValue(1),
    iconScale: useSharedValue(1),
    wordP: useSharedValue(0),
    heroOpacity: useSharedValue(1),
    heroX: useSharedValue(0),
    heroY: useSharedValue(0),
    heroScale: useSharedValue(1),
    logoOpacity: useSharedValue(1),
    logoScale: useSharedValue(1),
  };
}

const LETTER_POINTS = WORDMARK_LETTERS.map((l) => l.points);

export function wordmarkPenPoint(wordP: number): Point {
  "worklet";
  const last = LETTER_POINTS.length - 1;
  const i = Math.min(Math.max(Math.floor(wordP), 0), last);
  const t = wordP - i;
  if (t <= LETTER_DRAW_SHARE || i === last) {
    return samplePath(LETTER_POINTS[i], Math.min(t / LETTER_DRAW_SHARE, 1));
  }
  const h = (t - LETTER_DRAW_SHARE) / (1 - LETTER_DRAW_SHARE);
  const eased = h * h * (3 - 2 * h);
  const a = samplePath(LETTER_POINTS[i], 1);
  const b = samplePath(LETTER_POINTS[i + 1], 0);
  return { x: a.x + (b.x - a.x) * eased, y: a.y + (b.y - a.y) * eased };
}

export function curveSweepX(sweep: number): number {
  "worklet";
  return ICON_CURVE.minX + (ICON_CURVE.maxX - ICON_CURVE.minX) * Math.min(Math.max(sweep, 0), 1);
}

/** Stage position of the pen for the current mode. */
export function penPoint(v: IntroValues, geo: StageGeometry): Point {
  "worklet";
  const mode = v.penMode.value;
  if (mode === PEN.primary) {
    return project(samplePath(ICON_PRIMARY.points, v.p1.value), geo.icon.projection);
  }
  if (mode === PEN.secondary) {
    return project(samplePath(ICON_SECONDARY_RING.points, v.p2.value), geo.icon.projection);
  }
  if (mode === PEN.curve) {
    const y = samplePath(ICON_CURVE.points, v.sweep.value).y;
    return project({ x: curveSweepX(v.sweep.value), y }, geo.icon.projection);
  }
  if (mode === PEN.wordmark) {
    return project(wordmarkPenPoint(v.wordP.value), geo.wordmark.projection);
  }
  return { x: v.dotX.value, y: v.dotY.value };
}

/** Pen start points (stage px) so the free dot can glide in without a jump. */
export function penStarts(geo: StageGeometry) {
  return {
    primary: project(samplePath(ICON_PRIMARY.points, 0), geo.icon.projection),
    secondary: project(samplePath(ICON_SECONDARY_RING.points, 0), geo.icon.projection),
    curve: project({ x: curveSweepX(0), y: samplePath(ICON_CURVE.points, 0).y }, geo.icon.projection),
    curveEnd: project({ x: curveSweepX(1), y: samplePath(ICON_CURVE.points, 1).y }, geo.icon.projection),
    wordmark: project(samplePath(LETTER_POINTS[0], 0), geo.wordmark.projection),
    wordmarkEnd: project(samplePath(LETTER_POINTS[LETTER_POINTS.length - 1], 1), geo.wordmark.projection),
  };
}
