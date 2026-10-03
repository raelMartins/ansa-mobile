/**
 * Motion spec — docs/mobile-welcome-motion-spec.md
 * - Enter: native splash (icon over wordmark) is matched by the first frame, then collapses into the dot.
 *   Full: dot bounces twice → becomes the pen that traces ring, ring, smile → hold → back to dot →
 *   one bounce → traces the wordmark → wordmark flies into "What [wordmark] are you looking for today?".
 *   Short (returning, signed out): logo dissolves straight into the headline.
 * - Stack: one vertical column. The product grid rises and pushes the headline to the top; login rises
 *   from beneath and pushes headline + grid off the top. Back / drag-down reverses it.
 * - Loading/empty/error: no network here; auth errors shake an inline banner (AuthPanel).
 * - Primary interaction: tiles spring on press; disabled tiles shake; haptics + sound per beat.
 * - Reduced motion: no bounce/trace — cross-fades between icon, wordmark and headline; 260ms stack moves.
 * - Exit: AppExperienceFlow fades + lifts the funnel off the dashboard.
 */
import { LinearGradient } from "expo-linear-gradient";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BackHandler, Keyboard, ScrollView, StyleSheet, View, useWindowDimensions } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ecosystemPalette } from "../../core/brand/ecosystem";
import { WORDMARK_ASPECT } from "../../core/brand/wordmarkGeometry";
import { feedback, prepareFeedback } from "../../core/feedback/feedback";
import { useOnboarding } from "../../core/onboarding/OnboardingContext";
import type { AnsaProduct } from "../../core/products/catalog";
import { ProductGrid } from "../../core/products/ProductGrid";
import { wordmarkHeightForFontSize } from "../../core/ui/brandInlineSizing";
import { useTheme } from "../../core/ui/ThemeContext";
import { AuthPanel, type AuthMode } from "../../identity/components/AuthPanel";
import { motion, welcomeTiming as T } from "../motion";
import { stageGeometry } from "./geometry";
import { HandoffLogo } from "./HandoffLogo";
import { IconTrace } from "./IconTrace";
import { IntroDot } from "./IntroDot";
import { PEN, WORDMARK_DONE, penStarts, useIntroValues } from "./introValues";
import { LoginHeader } from "./LoginHeader";
import { useSequence } from "./useSequence";
import { WelcomeHeadline, type HeadlineMeasure } from "./WelcomeHeadline";
import { WordmarkTrace } from "./WordmarkTrace";

type Props = {
  /** `full` cinematic, or `short` for returning signed-out users. */
  mode: "full" | "short";
  /** Signed-in users with no product skip login after choosing. */
  requireAuth: boolean;
  onFinished: () => void;
};

type Stage = "intro" | "grid" | "login" | "done";

/** Vertical stack positions for stack = 0 (headline centred) → 1 (grid) → 2 (login). */
type StackLayout = { H: number; hh: number; y0: number; y1: number; gridTop1: number; gap: number };

function gridTop(s: number, L: StackLayout): number {
  "worklet";
  return s <= 1 ? L.H + 24 + (L.gridTop1 - L.H - 24) * s : L.gridTop1 - (s - 1) * L.H;
}

function headlineTop(s: number, L: StackLayout): number {
  "worklet";
  // The rising grid physically pushes the headline: it only moves once the grid reaches it.
  return s <= 1 ? Math.min(L.y0, gridTop(s, L) - L.gap - L.hh) : L.y1 - (s - 1) * L.H;
}

function loginTop(s: number, L: StackLayout): number {
  "worklet";
  return s <= 1 ? L.H : L.H * (2 - s);
}

const HEADLINE_INSET = 24;
const GRID_INSET = 20;

export function WelcomeFunnel({ mode, requireAuth, onFinished }: Props) {
  const { width: W, height: H } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { scheme, colors } = useTheme();
  const reduceMotion = useReducedMotion();
  const { selectProduct, markIntroComplete } = useOnboarding();
  const { wait } = useSequence();

  const palette = useMemo(() => ecosystemPalette(scheme), [scheme]);
  const geo = useMemo(() => stageGeometry(W, H), [W, H]);
  const v = useIntroValues(geo);
  const stack = useSharedValue(0);
  const wordsIn = useSharedValue(0);

  const [stage, setStage] = useState<Stage>("intro");
  const [chosen, setChosen] = useState<AnsaProduct | null>(null);
  const [authMode, setAuthMode] = useState<AuthMode>("signIn");
  const [measure, setMeasure] = useState<HeadlineMeasure | null>(null);
  const measureRef = useRef<HeadlineMeasure | null>(null);

  const fontSize = W < 360 ? 26 : 30;
  const slot = useMemo(() => {
    const height = wordmarkHeightForFontSize(fontSize);
    return { height, width: height * WORDMARK_ASPECT, offsetY: Math.round(fontSize * 0.08) };
  }, [fontSize]);

  const layout = useMemo<StackLayout>(() => {
    const hh = measure?.height ?? fontSize * 2.6;
    const y1 = insets.top + 28;
    return { H, hh, y0: geo.cy - hh / 2, y1, gridTop1: y1 + hh + 24, gap: 24 };
  }, [H, measure, fontSize, insets.top, geo.cy]);

  const onMeasure = useCallback((m: HeadlineMeasure) => {
    measureRef.current = m;
    setMeasure(m);
  }, []);

  // ── Choreography ────────────────────────────────────────────────────────────

  const heroTarget = useCallback(
    (m: HeadlineMeasure) => {
      const y0 = geo.cy - m.height / 2;
      return {
        x: HEADLINE_INSET + m.slotCx - geo.cx,
        y: y0 + m.slotCy - geo.cy,
        scale: slot.height / geo.wordmark.height,
      };
    },
    [geo, slot.height],
  );

  const awaitMeasure = useCallback(async () => {
    while (!measureRef.current) {
      if (!(await wait(40))) return null;
    }
    return measureRef.current;
  }, [wait]);

  const bounce = useCallback(
    async (height: number) => {
      v.squash.value = withSequence(
        withTiming(0.55, { duration: 70 }),
        withTiming(-0.35, { duration: 90 }),
        withTiming(0, { duration: T.bounceUp - 90 }),
        withTiming(-0.3, { duration: T.bounceDown }),
      );
      v.bounceY.value = withDelay(
        70,
        withSequence(
          withTiming(-height, { duration: T.bounceUp, easing: Easing.out(Easing.quad) }),
          withTiming(0, { duration: T.bounceDown, easing: Easing.in(Easing.quad) }),
        ),
      );
      if (!(await wait(70 + T.bounceUp + T.bounceDown))) return false;
      feedback.bounce();
      v.squash.value = withSequence(withTiming(1, { duration: 70 }), withSpring(0, { damping: 9, stiffness: 260 }));
      return wait(T.bounceSettle);
    },
    [v, wait],
  );

  /** Free dot glides to `to`, optionally lifting like a pen between strokes. */
  const glide = useCallback(
    (to: { x: number; y: number }, duration: number, size?: number) => {
      v.penMode.value = PEN.free;
      v.dotX.value = withTiming(to.x, { duration, easing: motion.easingInOut });
      v.dotY.value = withTiming(to.y, { duration, easing: motion.easingInOut });
      if (size !== undefined) {
        v.dotSize.value = withTiming(size, { duration, easing: motion.easing });
      } else {
        v.dotSize.value = withSequence(
          withTiming(geo.penSize * 1.45, { duration: duration / 2 }),
          withTiming(geo.penSize, { duration: duration / 2 }),
        );
      }
    },
    [v, geo.penSize],
  );

  const pinPen = useCallback(
    (at: { x: number; y: number }) => {
      v.dotX.value = at.x;
      v.dotY.value = at.y;
      v.penMode.value = PEN.free;
    },
    [v],
  );

  const showGrid = useCallback(() => {
    setStage("grid");
    void markIntroComplete();
    feedback.sheet();
    stack.value = reduceMotion ? withTiming(1, { duration: 260 }) : withSpring(1, motion.springSheet);
  }, [markIntroComplete, reduceMotion, stack]);

  const compose = useCallback(async () => {
    const m = await awaitMeasure();
    if (!m) return false;
    const target = heroTarget(m);
    const timing = { duration: T.headlineCompose, easing: motion.easing };
    v.heroX.value = withTiming(target.x, timing);
    v.heroY.value = withTiming(target.y, timing);
    v.heroScale.value = withTiming(target.scale, timing);
    wordsIn.value = withDelay(180, withTiming(1, { duration: T.headlineCompose + 240, easing: Easing.linear }));
    return wait(T.headlineCompose + 240);
  }, [awaitMeasure, heroTarget, v, wordsIn, wait]);

  const runFull = useCallback(async () => {
    const D = geo.dotSize;
    const starts = penStarts(geo);
    if (!(await wait(T.handoffHold))) return;

    // Logo → dot
    v.logoScale.value = withTiming(0.18, { duration: T.logoToDot, easing: motion.easingInOut });
    v.logoOpacity.value = withTiming(0, { duration: T.logoToDot * 0.8 });
    v.dotOpacity.value = withTiming(1, { duration: 160 });
    v.dotSize.value = withDelay(T.logoToDot * 0.35, withSpring(D, motion.spring));
    if (!(await wait(T.logoToDot + 140))) return;

    if (!(await bounce(D * 1.1))) return;
    if (!(await bounce(D * 0.55))) return;

    // Dot becomes the pen: ring one
    glide(starts.primary, T.dotToPen, geo.penSize);
    if (!(await wait(T.dotToPen))) return;
    v.penMode.value = PEN.primary;
    v.p1.value = withTiming(1, { duration: T.tracePrimary, easing: motion.easingTrace });
    v.f1.value = withDelay(T.tracePrimary * 0.55, withTiming(1, { duration: T.tracePrimary * 0.6 }));
    if (!(await wait(T.tracePrimary))) return;

    // Lift, hop, ring two
    pinPen(starts.primary);
    v.penTone.value = withTiming(1, { duration: 260 });
    glide(starts.secondary, 260);
    if (!(await wait(260))) return;
    v.penMode.value = PEN.secondary;
    v.p2.value = withTiming(1, { duration: T.traceSecondary, easing: motion.easingTrace });
    v.f2.value = withDelay(T.traceSecondary * 0.55, withTiming(1, { duration: T.traceSecondary * 0.6 }));
    if (!(await wait(T.traceSecondary))) return;

    // Smile, left → right
    pinPen(starts.secondary);
    v.penTone.value = withTiming(0, { duration: 220 });
    glide(starts.curve, 220);
    if (!(await wait(220))) return;
    v.penMode.value = PEN.curve;
    v.sweep.value = withTiming(1, { duration: T.sweepCurve, easing: motion.easingInOut });
    if (!(await wait(T.sweepCurve))) return;

    pinPen(starts.curveEnd);
    v.dotSize.value = withTiming(0, { duration: 220 });
    v.iconScale.value = withSequence(
      withTiming(1.045, { duration: 200, easing: motion.easing }),
      withSpring(1, motion.springSoft),
    );
    feedback.markComplete();
    if (!(await wait(T.holdIcon))) return;

    // Icon → dot → one bounce
    v.iconOpacity.value = withTiming(0, { duration: T.iconToDot, easing: Easing.in(Easing.quad) });
    v.iconScale.value = withTiming(0.3, { duration: T.iconToDot, easing: motion.easingInOut });
    v.dotX.value = geo.cx;
    v.dotY.value = geo.cy;
    v.dotSize.value = withDelay(T.iconToDot * 0.4, withSpring(D, motion.spring));
    if (!(await wait(T.iconToDot + 120))) return;
    if (!(await bounce(D * 0.8))) return;

    // Wordmark
    glide(starts.wordmark, T.dotToPen, geo.penSize);
    if (!(await wait(T.dotToPen))) return;
    v.penMode.value = PEN.wordmark;
    const wordMs = T.traceLetter * WORDMARK_DONE;
    v.wordP.value = withTiming(WORDMARK_DONE, { duration: wordMs, easing: Easing.bezier(0.3, 0, 0.7, 1) });
    if (!(await wait(wordMs))) return;
    pinPen(starts.wordmarkEnd);
    v.dotSize.value = withTiming(0, { duration: 200 });
    feedback.wordmarkComplete();
    if (!(await wait(T.holdWordmark))) return;

    if (!(await compose())) return;
    if (!(await wait(T.holdHeadline))) return;
    showGrid();
  }, [geo, v, wait, bounce, glide, pinPen, compose, showGrid]);

  const runReduced = useCallback(async () => {
    const fade = { duration: T.reduced.crossfade };
    if (!(await wait(T.handoffHold))) return;
    v.iconOpacity.value = 0;
    v.p1.value = 1;
    v.f1.value = 1;
    v.p2.value = 1;
    v.f2.value = 1;
    v.sweep.value = 1;
    v.iconOpacity.value = withTiming(1, fade);
    v.logoOpacity.value = withTiming(0, fade);
    feedback.markComplete();
    if (!(await wait(T.reduced.crossfade + T.reduced.holdIcon))) return;

    v.heroOpacity.value = 0;
    v.wordP.value = WORDMARK_DONE;
    v.iconOpacity.value = withTiming(0, fade);
    v.heroOpacity.value = withTiming(1, fade);
    if (!(await wait(T.reduced.crossfade + T.reduced.holdWordmark))) return;

    const m = await awaitMeasure();
    if (!m) return;
    v.heroOpacity.value = withTiming(0, { duration: 140 });
    if (!(await wait(150))) return;
    const target = heroTarget(m);
    v.heroX.value = target.x;
    v.heroY.value = target.y;
    v.heroScale.value = target.scale;
    v.heroOpacity.value = withTiming(1, fade);
    wordsIn.value = withTiming(1, fade);
    if (!(await wait(T.reduced.crossfade + T.reduced.holdHeadline))) return;
    showGrid();
  }, [v, wait, awaitMeasure, heroTarget, wordsIn, showGrid]);

  const runShort = useCallback(async () => {
    v.heroOpacity.value = 0;
    if (!(await wait(T.handoffHold))) return;
    v.logoOpacity.value = withTiming(0, { duration: 320 });
    v.logoScale.value = withTiming(0.92, { duration: 320, easing: motion.easing });
    const m = await awaitMeasure();
    if (!m) return;
    const target = heroTarget(m);
    v.heroX.value = target.x;
    v.heroY.value = target.y;
    v.heroScale.value = target.scale;
    v.wordP.value = WORDMARK_DONE;
    v.heroOpacity.value = withDelay(140, withTiming(1, { duration: 360 }));
    wordsIn.value = withDelay(140, withTiming(1, { duration: reduceMotion ? 260 : 620, easing: Easing.linear }));
    if (!(await wait(reduceMotion ? 500 : 820))) return;
    showGrid();
  }, [v, wait, awaitMeasure, heroTarget, wordsIn, reduceMotion, showGrid]);

  useEffect(() => {
    prepareFeedback();
    if (mode === "short") {
      void runShort();
    } else if (reduceMotion) {
      void runReduced();
    } else {
      void runFull();
    }
    // The choreography plays once per mount; AppExperienceFlow remounts to replay it.
  }, []);

  // ── Interaction ─────────────────────────────────────────────────────────────

  const toLogin = useCallback(() => {
    setStage("login");
    stack.value = reduceMotion ? withTiming(2, { duration: 260 }) : withSpring(2, motion.springSheet);
  }, [reduceMotion, stack]);

  const backToGrid = useCallback(() => {
    Keyboard.dismiss();
    setStage("grid");
    feedback.sheet();
    stack.value = reduceMotion ? withTiming(1, { duration: 260 }) : withSpring(1, motion.springSheet);
  }, [reduceMotion, stack]);

  const settledBack = useCallback(() => {
    Keyboard.dismiss();
    setStage("grid");
    feedback.sheet();
  }, []);

  const handleSelect = useCallback(
    (product: AnsaProduct) => {
      if (stage !== "grid") return;
      feedback.select();
      setChosen(product);
      void selectProduct(product.id);
      if (requireAuth) {
        toLogin();
        return;
      }
      setStage("done");
      void wait(240).then((alive) => alive && onFinished());
    },
    [stage, selectProduct, requireAuth, toLogin, wait, onFinished],
  );

  const handleAuthenticated = useCallback(() => {
    feedback.success();
    setStage("done");
    onFinished();
  }, [onFinished]);

  useEffect(() => {
    if (stage !== "login") return;
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      backToGrid();
      return true;
    });
    return () => sub.remove();
  }, [stage, backToGrid]);

  const dragDown = useMemo(
    () =>
      Gesture.Pan()
        .activeOffsetY(12)
        .failOffsetY(-12)
        .onUpdate((e) => {
          stack.value = 2 - Math.max(0, e.translationY) / H;
        })
        .onEnd((e) => {
          if (e.translationY > H * 0.18 || e.velocityY > 900) {
            stack.value = withSpring(1, motion.springSheet);
            runOnJS(settledBack)();
          } else {
            stack.value = withSpring(2, motion.springSheet);
          }
        }),
    [H, stack, settledBack],
  );

  // ── Styles ──────────────────────────────────────────────────────────────────

  const headlineStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: headlineTop(stack.value, layout) }],
  }));

  const heroStyle = useAnimatedStyle(() => ({
    opacity: v.heroOpacity.value,
    transform: [
      { translateX: v.heroX.value },
      { translateY: v.heroY.value + headlineTop(stack.value, layout) - layout.y0 },
      { scale: v.heroScale.value },
    ],
  }));

  const gridStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: gridTop(stack.value, layout) }],
  }));

  const loginStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: loginTop(stack.value, layout) }],
  }));

  const accent = chosen ? (scheme === "dark" ? chosen.darkAccent : chosen.primary) : colors.accent;
  const onAccent = chosen ? (scheme === "dark" ? chosen.primary : chosen.onPrimary) : colors.onAccent;
  const gridWidth = W - GRID_INSET * 2;

  return (
    <View style={styles.root}>
      <LinearGradient colors={palette.canvas} style={StyleSheet.absoluteFill} />

      <IconTrace values={v} geo={geo} colors={palette.icon} aura={palette.aura} />

      <Animated.View
        style={[styles.headline, { left: HEADLINE_INSET, width: W - HEADLINE_INSET * 2 }, headlineStyle]}
        pointerEvents="none"
      >
        <WelcomeHeadline
          fontSize={fontSize}
          color={palette.text}
          slot={slot}
          progress={wordsIn}
          onMeasure={onMeasure}
        />
      </Animated.View>

      <Animated.View
        pointerEvents="none"
        style={[
          styles.abs,
          { left: geo.wordmark.left, top: geo.wordmark.top, width: geo.wordmark.width, height: geo.wordmark.height },
          heroStyle,
        ]}
      >
        <WordmarkTrace width={geo.wordmark.width} height={geo.wordmark.height} color={palette.text} progress={v.wordP} />
      </Animated.View>

      <Animated.View
        style={[styles.abs, { left: 0, top: 0, width: W, height: H - layout.gridTop1 }, gridStyle]}
        pointerEvents={stage === "grid" ? "auto" : "none"}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: GRID_INSET, paddingBottom: insets.bottom + 24 }}
        >
          <ProductGrid
            width={gridWidth}
            visible={stage !== "intro"}
            onSelect={handleSelect}
            reduceMotion={reduceMotion}
          />
        </ScrollView>
      </Animated.View>

      {chosen && requireAuth ? (
        <Animated.View
          style={[styles.abs, styles.login, { left: 0, top: 0, width: W, height: H, backgroundColor: colors.bg }, loginStyle]}
          pointerEvents={stage === "login" ? "auto" : "none"}
        >
          <GestureDetector gesture={dragDown}>
            <View>
              <LoginHeader product={chosen} mode={authMode} topInset={insets.top} onBack={backToGrid} />
            </View>
          </GestureDetector>
          <View style={[styles.sheet, { backgroundColor: colors.bg }]}>
            <AuthPanel
              mode={authMode}
              onModeChange={setAuthMode}
              accent={accent}
              onAccent={onAccent}
              bottomInset={insets.bottom}
              onAuthenticated={handleAuthenticated}
            />
          </View>
        </Animated.View>
      ) : null}

      <IntroDot values={v} geo={geo} color={palette.dot} penColor={palette.icon.secondary} aura={palette.aura} />
      <HandoffLogo geo={geo} palette={palette} opacity={v.logoOpacity} scale={v.logoScale} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, overflow: "hidden" },
  abs: { position: "absolute" },
  headline: { position: "absolute", top: 0 },
  login: { overflow: "hidden" },
  sheet: {
    flex: 1,
    marginTop: -28,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: "hidden",
  },
});
