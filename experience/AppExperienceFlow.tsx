/**
 * Motion spec (entry experience) — docs/mobile-welcome-motion-spec.md
 * - Boot: native splash (icon over wordmark) stays up until session + onboarding are known.
 * - Returning (signed in + product): QuickSplash → dashboard.
 * - Otherwise: WelcomeFunnel (full cinematic, or short if the intro was already seen).
 * - Exit to dashboard: funnel/splash fades while lifting slightly; dashboard rises 16px into place.
 * - Reduced motion: handled inside QuickSplash / WelcomeFunnel; exits stay short fades.
 */
import * as SplashScreen from "expo-splash-screen";
import { useCallback, useEffect, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  withDelay,
  withTiming,
  type EntryExitAnimationFunction,
} from "react-native-reanimated";
import { ecosystemPalette } from "../core/brand/ecosystem";
import { useOnboarding } from "../core/onboarding/OnboardingContext";
import { useSession } from "../core/session/SessionContext";
import { useTheme } from "../core/ui/ThemeContext";
import { MerchantBootstrapGate } from "../merchant/MerchantBootstrapGate";
import { MerchantProvider } from "../merchant/MerchantContext";
import { motion, welcomeTiming } from "./motion";
import { QuickSplash } from "./QuickSplash";
import { WelcomeFunnel } from "./welcome/WelcomeFunnel";

type Phase =
  | { kind: "boot" }
  | { kind: "quick" }
  | { kind: "welcome"; mode: "full" | "short"; requireAuth: boolean }
  | { kind: "app" };

const EXIT_MS = welcomeTiming.exitToApp;

const liftAway: EntryExitAnimationFunction = () => {
  "worklet";
  return {
    initialValues: { opacity: 1, transform: [{ scale: 1 }] },
    animations: {
      opacity: withTiming(0, { duration: EXIT_MS }),
      transform: [{ scale: withTiming(1.05, { duration: EXIT_MS, easing: motion.easing }) }],
    },
  };
};

const riseIn: EntryExitAnimationFunction = () => {
  "worklet";
  return {
    initialValues: { opacity: 0, transform: [{ translateY: 16 }] },
    animations: {
      opacity: withDelay(60, withTiming(1, { duration: 420 })),
      transform: [{ translateY: withDelay(60, withTiming(0, { duration: 520, easing: motion.easing })) }],
    },
  };
};

function decide(authenticated: boolean, introComplete: boolean, hasProduct: boolean): Phase {
  if (authenticated && hasProduct) {
    return { kind: "quick" };
  }
  if (authenticated) {
    return { kind: "welcome", mode: "full", requireAuth: false };
  }
  return { kind: "welcome", mode: introComplete ? "short" : "full", requireAuth: true };
}

export function AppExperienceFlow() {
  const { status } = useSession();
  const { ready, introComplete, selectedProduct, welcomeRun } = useOnboarding();
  const { scheme } = useTheme();
  const [phase, setPhase] = useState<Phase>({ kind: "boot" });
  /** Remount key so a replay restarts the choreography. */
  const [run, setRun] = useState(0);
  const lastWelcomeRun = useRef(welcomeRun);
  const splashHidden = useRef(false);

  const authenticated = status === "authenticated";
  const bootReady = ready && status !== "loading";

  useEffect(() => {
    if (phase.kind === "boot" && bootReady) {
      setPhase(decide(authenticated, introComplete, selectedProduct !== null));
    }
  }, [phase.kind, bootReady, authenticated, introComplete, selectedProduct]);

  useEffect(() => {
    if (welcomeRun !== lastWelcomeRun.current) {
      lastWelcomeRun.current = welcomeRun;
      setRun((n) => n + 1);
      setPhase({ kind: "boot" });
    }
  }, [welcomeRun]);

  useEffect(() => {
    if (phase.kind === "app" && status === "unauthenticated") {
      setRun((n) => n + 1);
      setPhase({ kind: "welcome", mode: introComplete ? "short" : "full", requireAuth: true });
    }
  }, [phase.kind, status, introComplete]);

  useEffect(() => {
    if (phase.kind === "boot" || splashHidden.current) return;
    splashHidden.current = true;
    requestAnimationFrame(() => SplashScreen.hide());
  }, [phase.kind]);

  const enterApp = useCallback(() => setPhase({ kind: "app" }), []);

  return (
    <View style={[styles.root, { backgroundColor: ecosystemPalette(scheme).background }]}>
      {phase.kind === "app" ? (
        <Animated.View key={`app-${run}`} entering={riseIn} style={styles.fill}>
          <MerchantProvider>
            <MerchantBootstrapGate />
          </MerchantProvider>
        </Animated.View>
      ) : null}
      {phase.kind === "welcome" ? (
        <Animated.View key={`welcome-${run}`} exiting={liftAway} style={StyleSheet.absoluteFill}>
          <WelcomeFunnel mode={phase.mode} requireAuth={phase.requireAuth} onFinished={enterApp} />
        </Animated.View>
      ) : null}
      {phase.kind === "quick" ? (
        <Animated.View key={`quick-${run}`} exiting={liftAway} style={StyleSheet.absoluteFill}>
          <QuickSplash onDone={enterApp} />
        </Animated.View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  fill: { flex: 1 },
});
