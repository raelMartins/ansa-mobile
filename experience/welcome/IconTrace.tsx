import { StyleSheet, View } from "react-native";
import Animated, { useAnimatedProps, useAnimatedStyle, type SharedValue } from "react-native-reanimated";
import Svg, { Path } from "react-native-svg";
import {
  ICON_CURVE,
  ICON_PRIMARY,
  ICON_SECONDARY_LENS,
  ICON_SECONDARY_RING,
} from "../../core/brand/brandGeometry.generated";
import { ICON_VIEW_BOX_STRING } from "../../core/ui/BrandIcon";
import { SoftAura } from "../../core/ui/SoftAura";
import type { StageGeometry } from "./geometry";
import { curveSweepX, type IntroValues } from "./introValues";

const AnimatedPath = Animated.createAnimatedComponent(Path);

/** Stroke width in icon user units (~2.5px at hero size). */
const STROKE = 10;

function TracedShape({
  d,
  length,
  color,
  progress,
  fill,
}: {
  d: string;
  length: number;
  color: string;
  progress: SharedValue<number>;
  fill: SharedValue<number>;
}) {
  const animatedProps = useAnimatedProps(() => {
    const p = progress.value;
    const f = fill.value;
    return {
      strokeDashoffset: length * (1 - p),
      strokeOpacity: p > 0.001 ? 1 - f : 0,
      fillOpacity: f,
    };
  });

  return (
    <AnimatedPath
      d={d}
      fill={color}
      fillRule="evenodd"
      fillOpacity={0}
      stroke={color}
      strokeOpacity={0}
      strokeWidth={STROKE}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeDasharray={[length, length]}
      animatedProps={animatedProps}
    />
  );
}

type Props = {
  values: IntroValues;
  geo: StageGeometry;
  colors: { primary: string; secondary: string; curve: string };
  aura?: string | null;
};

export function IconTrace({ values, geo, colors, aura }: Props) {
  const { width, height, projection } = geo.icon;

  const containerStyle = useAnimatedStyle(() => ({
    opacity: values.iconOpacity.value,
    transform: [{ scale: values.iconScale.value }],
  }));

  const curveClipStyle = useAnimatedStyle(() => ({
    width: Math.max(0, (curveSweepX(values.sweep.value) - projection.vbX) * projection.scale),
  }));

  const auraStyle = useAnimatedStyle(() => ({ opacity: values.f1.value }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.box, { left: geo.icon.left, top: geo.icon.top, width, height }, containerStyle]}
    >
      {aura ? (
        <Animated.View style={[styles.aura, { left: -width * 0.3, top: -height * 0.4 }, auraStyle]}>
          <SoftAura width={width * 1.6} height={height * 1.8} color={aura} opacity={0.3} />
        </Animated.View>
      ) : null}
      <Svg width={width} height={height} viewBox={ICON_VIEW_BOX_STRING} style={StyleSheet.absoluteFill}>
        <TracedShape
          d={ICON_PRIMARY.d}
          length={ICON_PRIMARY.length}
          color={colors.primary}
          progress={values.p1}
          fill={values.f1}
        />
        <TracedShape
          d={ICON_SECONDARY_RING.d}
          length={ICON_SECONDARY_RING.length}
          color={colors.secondary}
          progress={values.p2}
          fill={values.f2}
        />
        <TracedShape
          d={ICON_SECONDARY_LENS.d}
          length={ICON_SECONDARY_LENS.length}
          color={colors.secondary}
          progress={values.p2}
          fill={values.f2}
        />
      </Svg>
      <Animated.View style={[styles.clip, { height }, curveClipStyle]}>
        <View style={{ width, height }}>
          <Svg width={width} height={height} viewBox={ICON_VIEW_BOX_STRING}>
            <Path d={ICON_CURVE.d} fill={colors.curve} fillRule="evenodd" />
          </Svg>
        </View>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  box: { position: "absolute" },
  aura: { position: "absolute" },
  clip: { position: "absolute", left: 0, top: 0, overflow: "hidden" },
});
