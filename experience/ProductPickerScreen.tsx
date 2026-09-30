import { LinearGradient } from "expo-linear-gradient";
import { useEffect } from "react";
import { Dimensions, Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  Easing,
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { AnsaProductId } from "../core/onboarding/onboardingStorage";
import { ANSA_PRODUCTS, type AnsaProductOption } from "../core/onboarding/products";
import { BrandInline } from "../core/ui/BrandInline";
import { brand } from "../core/ui/brandColors";
import { fontFamily } from "../core/ui/theme";

const { width: W, height: H } = Dimensions.get("window");
const BASE = Math.min(W, H) * 0.19;

type Props = {
  onSelect: (product: AnsaProductId, layout: { x: number; y: number; size: number }) => void;
};

function ProductBubble({
  product,
  onPress,
}: {
  product: AnsaProductOption;
  onPress: () => void;
}) {
  const float = useSharedValue(0);
  const size = BASE * product.size;

  useEffect(() => {
    const delay = product.x * 400;
    float.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 2200 + delay, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 2200 + delay, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    );
  }, [float, product.x]);

  const anim = useAnimatedStyle(() => ({
    transform: [{ translateY: (float.value - 0.5) * 10 }],
  }));

  const left = product.x * W - size / 2;
  const top = product.y * H - size / 2;

  return (
    <Animated.View
      entering={FadeIn.delay(120 + ANSA_PRODUCTS.indexOf(product) * 80).duration(500)}
      style={[styles.bubbleWrap, { left, top, width: size, height: size }, anim]}
    >
      <Pressable
        disabled={!product.enabled}
        onPress={onPress}
        style={[
          styles.bubble,
          product.enabled ? styles.bubbleLive : styles.bubbleLocked,
          { width: size, height: size, borderRadius: size / 2 },
        ]}
        accessibilityRole="button"
        accessibilityState={{ disabled: !product.enabled }}
      >
        <Text style={[styles.emoji, !product.enabled && styles.emojiMuted]}>{product.emoji}</Text>
        <Text style={[styles.bubbleLabel, !product.enabled && styles.bubbleLabelMuted]}>{product.label}</Text>
        {!product.enabled ? <Text style={styles.soon}>Soon</Text> : null}
      </Pressable>
    </Animated.View>
  );
}

export function ProductPickerScreen({ onSelect }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.root}>
      <LinearGradient colors={[brand.forest, brand.inkFooter]} style={StyleSheet.absoluteFill} />
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>Choose your</Text>
          <BrandInline height={28} inverse />
          <View style={{ width: 4 }} />
        </View>
        <Text style={styles.subtitle}>One account. Many products. Start with Merchant today.</Text>
      </View>
      <View style={styles.field}>
        {ANSA_PRODUCTS.map((p) => (
          <ProductBubble
            key={p.id}
            product={p}
            onPress={() => {
              if (!p.enabled) return;
              const size = BASE * p.size;
              onSelect(p.id, { x: p.x * W, y: p.y * H, size });
            }}
          />
        ))}
      </View>
      <Text style={[styles.hint, { paddingBottom: insets.bottom + 16 }]}>Tap Merchant to continue</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    paddingHorizontal: 24,
    zIndex: 2,
    gap: 8,
  },
  titleRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "flex-end",
    gap: 8,
  },
  title: {
    color: brand.linen,
    fontFamily: fontFamily.semiBold,
    fontSize: 30,
    letterSpacing: -0.4,
  },
  subtitle: {
    color: brand.sage,
    fontFamily: fontFamily.regular,
    fontSize: 16,
    lineHeight: 22,
    maxWidth: 320,
  },
  field: {
    flex: 1,
  },
  bubbleWrap: {
    position: "absolute",
  },
  bubble: {
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
    borderWidth: 1,
  },
  bubbleLive: {
    backgroundColor: "rgba(227, 208, 150, 0.92)",
    borderColor: "rgba(45, 66, 54, 0.12)",
    shadowColor: brand.honey,
    shadowOpacity: 0.45,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  bubbleLocked: {
    backgroundColor: "rgba(47, 52, 60, 0.75)",
    borderColor: "rgba(205, 213, 206, 0.2)",
    opacity: 0.72,
  },
  emoji: {
    fontSize: 22,
    color: brand.forest,
    marginBottom: 2,
  },
  emojiMuted: { color: brand.sage },
  bubbleLabel: {
    fontFamily: fontFamily.semiBold,
    fontSize: 13,
    color: brand.forest,
    textAlign: "center",
  },
  bubbleLabelMuted: {
    color: brand.linen,
    fontFamily: fontFamily.medium,
  },
  soon: {
    marginTop: 2,
    fontSize: 10,
    fontFamily: fontFamily.medium,
    color: brand.sage,
    letterSpacing: 0.5,
  },
  hint: {
    textAlign: "center",
    color: brand.sage,
    fontFamily: fontFamily.regular,
    fontSize: 14,
  },
});
