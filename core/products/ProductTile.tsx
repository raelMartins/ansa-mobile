import { LinearGradient } from "expo-linear-gradient";
import { useEffect } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import Svg, { Path } from "react-native-svg";
import { mix, withAlpha } from "../brand/color";
import { feedback } from "../feedback/feedback";
import { BrandIcon } from "../ui/BrandIcon";
import { fontFamily } from "../ui/theme";
import type { TileKind } from "./bento";
import type { AnsaProduct } from "./catalog";

type Props = {
  product: AnsaProduct;
  kind: TileKind;
  width: number;
  height: number;
  index: number;
  visible: boolean;
  selected?: boolean;
  reduceMotion?: boolean;
  onSelect: (product: AnsaProduct) => void;
};

const ICON_WIDTH: Record<TileKind, number> = { hero: 62, tall: 54, small: 40 };
const TITLE_SIZE: Record<TileKind, number> = { hero: 22, tall: 19, small: 16 };

function Arrow({ color }: { color: string }) {
  return (
    <Svg width={16} height={16} viewBox="0 0 16 16">
      <Path d="M3 8h9M8.5 4l4 4-4 4" stroke={color} strokeWidth={1.8} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

/** One product in the bento grid: knockout icon on the product's own colour, name beneath. */
export function ProductTile({ product, kind, width, height, index, visible, selected, reduceMotion, onSelect }: Props) {
  const enter = useSharedValue(0);
  const press = useSharedValue(1);
  const shake = useSharedValue(0);
  const on = product.onPrimary;

  useEffect(() => {
    if (!visible) {
      enter.value = 0;
      return;
    }
    enter.value = reduceMotion
      ? withTiming(1, { duration: 220 })
      : withDelay(160 + index * 70, withSpring(1, { damping: 15, stiffness: 140, mass: 0.9 }));
  }, [visible, index, reduceMotion, enter]);

  const style = useAnimatedStyle(() => {
    const p = enter.value;
    const tilt = index % 2 === 0 ? -4 : 4;
    return {
      opacity: Math.min(1, p * 1.6),
      transform: reduceMotion
        ? [{ scale: press.value }]
        : [
            { translateX: shake.value },
            { translateY: (1 - p) * 44 },
            { rotate: `${(1 - p) * tilt}deg` },
            { scale: (0.9 + 0.1 * p) * press.value },
          ],
    };
  });

  function handlePress() {
    if (!product.enabled) {
      feedback.deny();
      shake.value = withSequence(
        withTiming(-7, { duration: 45 }),
        withTiming(7, { duration: 60 }),
        withTiming(-5, { duration: 55 }),
        withTiming(4, { duration: 50 }),
        withTiming(0, { duration: 70, easing: Easing.out(Easing.quad) }),
      );
      return;
    }
    press.value = withSequence(withTiming(1.03, { duration: 120 }), withSpring(1, { damping: 12, stiffness: 220 }));
    onSelect(product);
  }

  const iconWidth = ICON_WIDTH[kind];
  const ghostWidth = kind === "hero" ? width * 0.56 : height * 1.15;
  const status = product.enabled ? (selected ? "Current" : "Available") : "Coming soon";

  return (
    <Animated.View style={[{ width, height }, style]}>
      <Pressable
        onPress={handlePress}
        onPressIn={() => {
          press.value = withSpring(0.965, { damping: 18, stiffness: 320 });
        }}
        onPressOut={() => {
          press.value = withSpring(1, { damping: 14, stiffness: 240 });
        }}
        style={[styles.tile, !product.enabled && styles.disabled]}
        accessibilityRole="button"
        accessibilityLabel={`${product.label}. ${product.tagline}. ${status}.`}
        accessibilityState={{ disabled: !product.enabled, selected: !!selected }}
      >
        <LinearGradient
          colors={[mix(product.primary, "#ffffff", 0.06), mix(product.primary, "#000000", 0.2)]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <View
          pointerEvents="none"
          style={[styles.ghost, { right: -ghostWidth * 0.22, bottom: -ghostWidth * 0.2, opacity: 0.12 }]}
        >
          <BrandIcon width={ghostWidth} variant="mono" color={on} />
        </View>

        <View style={styles.topRow}>
          <BrandIcon width={iconWidth} variant="mono" color={on} />
          <View style={[styles.pill, { backgroundColor: withAlpha(on, product.enabled ? 0.2 : 0.14) }]}>
            <Text style={[styles.pillText, { color: on }]}>{status}</Text>
          </View>
        </View>

        <View style={styles.bottom}>
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={[styles.title, { color: on, fontSize: TITLE_SIZE[kind] }]} numberOfLines={1}>
              {product.label}
            </Text>
            <Text
              style={[styles.tagline, { color: withAlpha(on, 0.78), fontSize: kind === "small" ? 12 : 13.5 }]}
              numberOfLines={kind === "tall" ? 3 : 1}
            >
              {product.tagline}
            </Text>
          </View>
          {kind === "hero" && product.enabled ? (
            <View style={[styles.arrow, { backgroundColor: withAlpha(on, 0.18) }]}>
              <Arrow color={on} />
            </View>
          ) : null}
        </View>

        {selected ? <View pointerEvents="none" style={[styles.selectedRing, { borderColor: withAlpha(on, 0.85) }]} /> : null}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    borderRadius: 22,
    overflow: "hidden",
    padding: 16,
    justifyContent: "space-between",
  },
  disabled: { opacity: 0.6 },
  ghost: { position: "absolute" },
  topRow: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 8 },
  pill: { borderRadius: 999, paddingHorizontal: 9, paddingVertical: 4 },
  pillText: { fontFamily: fontFamily.semiBold, fontSize: 10.5, letterSpacing: 0.3 },
  bottom: { flexDirection: "row", alignItems: "flex-end", gap: 10 },
  title: { fontFamily: fontFamily.semiBold, letterSpacing: -0.3 },
  tagline: { fontFamily: fontFamily.regular, lineHeight: 18 },
  arrow: { width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center" },
  selectedRing: { position: "absolute", top: 0, right: 0, bottom: 0, left: 0, borderRadius: 22, borderWidth: 2.5 },
});
