/**
 * Motion spec — returning users (signed in + product saved), ≤ ~1.2s:
 * - Enter: native splash is matched by the first frame; logo collapses into the dot.
 * - Beat: one bounce, then the dot blooms into the full-colour icon.
 * - Exit: AppExperienceFlow fades + lifts this off the dashboard.
 * - Reduced motion: logo cross-fades to the icon, short hold, exit.
 */
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useMemo } from "react";
import { StyleSheet, View, useWindowDimensions } from "react-native";
import { Easing, useReducedMotion, withDelay, withSequence, withSpring, withTiming } from "react-native-reanimated";
import { ecosystemPalette } from "../core/brand/ecosystem";
import { feedback } from "../core/feedback/feedback";
import { useTheme } from "../core/ui/ThemeContext";
import { motion, welcomeTiming } from "./motion";
import { stageGeometry } from "./welcome/geometry";
import { HandoffLogo } from "./welcome/HandoffLogo";
import { IconTrace } from "./welcome/IconTrace";
import { IntroDot } from "./welcome/IntroDot";
import { useIntroValues } from "./welcome/introValues";
import { useSequence } from "./welcome/useSequence";

const Q = welcomeTiming.quick;

export function QuickSplash({ onDone }: { onDone: () => void }) {
  const { width, height } = useWindowDimensions();
  const { scheme } = useTheme();
  const reduceMotion = useReducedMotion();
  const palette = useMemo(() => ecosystemPalette(scheme), [scheme]);
  const geo = useMemo(() => stageGeometry(width, height), [width, height]);
  const v = useIntroValues(geo);
  const { wait } = useSequence();

  useEffect(() => {
    const D = geo.dotSize;
    v.p1.value = 1;
    v.f1.value = 1;
    v.p2.value = 1;
    v.f2.value = 1;
    v.sweep.value = 1;
    v.iconOpacity.value = 0;

    async function run() {
      if (!(await wait(160))) return;

      if (reduceMotion) {
        v.logoOpacity.value = withTiming(0, { duration: 240 });
        v.iconOpacity.value = withTiming(1, { duration: 240 });
        if (!(await wait(240 + 400))) return;
        onDone();
        return;
      }

      v.iconScale.value = 0.35;
      v.logoScale.value = withTiming(0.18, { duration: Q.logoToDot, easing: motion.easingInOut });
      v.logoOpacity.value = withTiming(0, { duration: Q.logoToDot * 0.8 });
      v.dotOpacity.value = withTiming(1, { duration: 120 });
      v.dotSize.value = withDelay(Q.logoToDot * 0.3, withSpring(D, motion.spring));
      if (!(await wait(Q.logoToDot))) return;

      v.bounceY.value = withSequence(
        withTiming(-D * 0.6, { duration: Q.bounce * 0.48, easing: Easing.out(Easing.quad) }),
        withTiming(0, { duration: Q.bounce * 0.52, easing: Easing.in(Easing.quad) }),
      );
      if (!(await wait(Q.bounce))) return;
      feedback.bounce();
      v.squash.value = withSequence(withTiming(0.9, { duration: 60 }), withSpring(0, { damping: 9, stiffness: 260 }));

      v.dotSize.value = withTiming(D * 1.7, { duration: Q.reveal, easing: motion.easing });
      v.dotOpacity.value = withTiming(0, { duration: Q.reveal * 0.8 });
      v.iconOpacity.value = withTiming(1, { duration: Q.reveal * 0.7 });
      v.iconScale.value = withSpring(1, motion.spring);
      if (!(await wait(Q.reveal + Q.hold))) return;
      onDone();
    }

    void run();
    // Plays once per mount.
  }, []);

  return (
    <View style={styles.root}>
      <LinearGradient colors={palette.canvas} style={StyleSheet.absoluteFill} />
      <IconTrace values={v} geo={geo} colors={palette.icon} aura={palette.aura} />
      <IntroDot values={v} geo={geo} color={palette.dot} penColor={palette.icon.secondary} aura={palette.aura} />
      <HandoffLogo geo={geo} palette={palette} opacity={v.logoOpacity} scale={v.logoScale} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, overflow: "hidden" },
});
