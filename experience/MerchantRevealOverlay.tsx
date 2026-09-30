import { useEffect } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { brand } from "../core/ui/brandColors";
import { motion } from "./motion";

const { width: W, height: H } = Dimensions.get("window");
const MAX_R = Math.hypot(W, H) * 1.2;

type Props = {
  origin: { x: number; y: number; size: number };
  onFinished: () => void;
};

export function MerchantRevealOverlay({ origin, onFinished }: Props) {
  const scale = useSharedValue(origin.size / MAX_R);

  useEffect(() => {
    scale.value = withTiming(1, { duration: motion.duration.reveal, easing: motion.easing }, (done) => {
      if (done) {
        runOnJS(onFinished)();
      }
    });
  }, [onFinished, scale]);

  const circleStyle = useAnimatedStyle(() => ({
    width: MAX_R * 2,
    height: MAX_R * 2,
    borderRadius: MAX_R,
    transform: [
      { translateX: origin.x - MAX_R },
      { translateY: origin.y - MAX_R },
      { scale: scale.value },
    ],
  }));

  return (
    <View style={styles.overlay} pointerEvents="none">
      <Animated.View style={[styles.circle, circleStyle]} />
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    zIndex: 100,
    backgroundColor: "transparent",
    overflow: "hidden",
  },
  circle: {
    position: "absolute",
    backgroundColor: brand.linen,
  },
});
