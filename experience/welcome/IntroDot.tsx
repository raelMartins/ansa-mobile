import { StyleSheet, View } from "react-native";
import Animated, { interpolateColor, useAnimatedStyle } from "react-native-reanimated";
import { SoftAura } from "../../core/ui/SoftAura";
import type { StageGeometry } from "./geometry";
import { penPoint, type IntroValues } from "./introValues";

type Props = {
  values: IntroValues;
  geo: StageGeometry;
  color: string;
  penColor: string;
  /** Halo colour when the dot sits on a low-contrast canvas. */
  aura?: string | null;
};

/** The intro dot — bounces, then becomes the pen that traces the icon and wordmark. */
export function IntroDot({ values, geo, color, penColor, aura }: Props) {
  const D = geo.dotSize;
  const A = D * 2.4;

  const style = useAnimatedStyle(() => {
    const p = penPoint(values, geo);
    const size = values.dotSize.value;
    const q = values.squash.value;
    const sx = 1 + 0.16 * q;
    const sy = 1 - 0.16 * q;
    const k = size / D;
    return {
      opacity: values.dotOpacity.value,
      backgroundColor: interpolateColor(values.penTone.value, [0, 1], [color, penColor]),
      transform: [
        { translateX: p.x - D / 2 },
        // Keep the squash anchored to the floor.
        { translateY: p.y - D / 2 + values.bounceY.value + (size / 2) * (1 - sy) },
        { scaleX: Math.max(k * sx, 0.0001) },
        { scaleY: Math.max(k * sy, 0.0001) },
      ],
    };
  });

  const auraStyle = useAnimatedStyle(() => {
    const p = penPoint(values, geo);
    const k = values.dotSize.value / D;
    return {
      opacity: values.dotOpacity.value * Math.min(1, k),
      transform: [
        { translateX: p.x - A / 2 },
        { translateY: p.y - A / 2 + values.bounceY.value },
        { scale: Math.max(k, 0.0001) },
      ],
    };
  });

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {aura ? (
        <Animated.View style={[styles.layer, auraStyle]}>
          <SoftAura width={A} height={A} color={aura} opacity={0.35} />
        </Animated.View>
      ) : null}
      <Animated.View style={[styles.layer, { width: D, height: D, borderRadius: D / 2 }, style]} />
    </View>
  );
}

const styles = StyleSheet.create({
  layer: { position: "absolute", left: 0, top: 0 },
});
