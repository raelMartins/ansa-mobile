import { StyleSheet, View } from "react-native";
import Animated, { useAnimatedStyle, type SharedValue } from "react-native-reanimated";
import type { EcosystemPalette } from "../../core/brand/ecosystem";
import { AnsaLogo } from "../../core/ui/AnsaLogo";
import { BrandIcon } from "../../core/ui/BrandIcon";
import type { StageGeometry } from "./geometry";

type Props = {
  geo: StageGeometry;
  palette: EcosystemPalette;
  opacity: SharedValue<number>;
  scale: SharedValue<number>;
};

/** First in-app frame: the native splash (icon over wordmark), pixel-matched, so the handoff is invisible. */
export function HandoffLogo({ geo, palette, opacity, scale }: Props) {
  const h = geo.handoff;
  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.root, { left: h.left, top: h.top, width: h.width, height: h.height }, style]}
    >
      <BrandIcon width={h.width} primary={palette.icon.primary} curveColor={palette.icon.curve} />
      <View style={{ height: h.gap }} />
      <AnsaLogo height={h.wordmarkHeight} color={palette.text} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: { position: "absolute", alignItems: "center" },
});
