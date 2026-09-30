import { LinearGradient } from "expo-linear-gradient";
import { useCallback, useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";
import { AnimatedWordmarkDraw } from "../core/ui/AnimatedWordmarkDraw";
import { brand } from "../core/ui/brandColors";
import { motion } from "./motion";

type Props = {
  onComplete: () => void;
  quick?: boolean;
  ready?: boolean;
};

export function SplashScreen({ onComplete, quick, ready = true }: Props) {
  const glow = useSharedValue(0);
  const exitOpacity = useSharedValue(1);
  const [drawDone, setDrawDone] = useState(false);

  const finish = useCallback(() => {
    exitOpacity.value = withTiming(0, { duration: motion.duration.fade }, (done) => {
      if (done) {
        runOnJS(onComplete)();
      }
    });
  }, [exitOpacity, onComplete]);

  useEffect(() => {
    if (!ready) {
      return;
    }
    glow.value = withDelay(120, withTiming(1, { duration: quick ? 600 : 1000 }));
  }, [ready, quick, glow]);

  useEffect(() => {
    if (!ready || !drawDone) {
      return;
    }
    const holdMs = quick ? 280 : 520;
    const t = setTimeout(() => finish(), holdMs);
    return () => clearTimeout(t);
  }, [ready, drawDone, quick, finish]);

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glow.value * 0.35,
    transform: [{ scale: 1 + glow.value * 0.22 }],
  }));

  const rootStyle = useAnimatedStyle(() => ({
    opacity: exitOpacity.value,
  }));

  return (
    <Animated.View style={[styles.root, rootStyle]}>
      <LinearGradient colors={[brand.forest, brand.inkFooter]} style={StyleSheet.absoluteFill} />
      <Animated.View style={[styles.glow, glowStyle]} />
      <AnimatedWordmarkDraw
        height={quick ? 36 : 44}
        color={brand.linen}
        quick={quick}
        onLettersDrawn={() => setDrawDone(true)}
      />
      <View style={styles.shimmer} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  glow: {
    position: "absolute",
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: brand.honey,
  },
  shimmer: {
    position: "absolute",
    bottom: 48,
    width: 48,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(227, 234, 228, 0.35)",
  },
});
