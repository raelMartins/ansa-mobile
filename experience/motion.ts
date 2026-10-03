import { Easing } from "react-native-reanimated";

export const motion = {
  spring: { damping: 18, stiffness: 140, mass: 0.9 },
  springSoft: { damping: 22, stiffness: 110, mass: 1 },
  /** Sheets and stacked surfaces — settles without visible overshoot. */
  springSheet: { damping: 26, stiffness: 170, mass: 1 },
  duration: {
    splash: 3200,
    slide: 520,
    fade: 380,
    reveal: 780,
  },
  easing: Easing.bezier(0.22, 1, 0.36, 1),
  /** Pen/stroke tracing — slow in, confident middle, soft landing. */
  easingTrace: Easing.bezier(0.45, 0.05, 0.25, 1),
  easingInOut: Easing.bezier(0.65, 0, 0.35, 1),
};

/** Welcome funnel timeline (ms) — docs/mobile-welcome-motion-spec.md §7. */
export const welcomeTiming = {
  handoffHold: 260,
  logoToDot: 520,
  bounceUp: 230,
  bounceDown: 250,
  bounceSettle: 160,
  dotToPen: 300,
  tracePrimary: 1150,
  traceSecondary: 950,
  /** Secondary begins when primary is this far along. */
  traceOverlap: 0.72,
  sweepCurve: 620,
  holdIcon: 1500,
  iconToDot: 520,
  traceLetter: 400,
  holdWordmark: 900,
  headlineCompose: 900,
  holdHeadline: 1400,
  gridRise: 720,
  gridStagger: 70,
  loginRise: 640,
  exitToApp: 460,
  /** Returning users (signed in + product saved). */
  quick: {
    logoToDot: 300,
    bounce: 300,
    reveal: 380,
    hold: 220,
    exit: 280,
  },
  reduced: {
    crossfade: 260,
    holdIcon: 800,
    holdWordmark: 500,
    holdHeadline: 900,
  },
} as const;
