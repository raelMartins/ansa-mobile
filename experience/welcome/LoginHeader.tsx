import { LinearGradient } from "expo-linear-gradient";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown, FadeOutUp } from "react-native-reanimated";
import Svg, { Path } from "react-native-svg";
import { mix, withAlpha } from "../../core/brand/color";
import type { AnsaProduct } from "../../core/products/catalog";
import { BrandIcon } from "../../core/ui/BrandIcon";
import { fontFamily } from "../../core/ui/theme";
import type { AuthMode } from "../../identity/components/AuthPanel";

type Props = {
  product: AnsaProduct;
  mode: AuthMode;
  topInset: number;
  onBack: () => void;
};

const COPY: Record<AuthMode, { title: string; subtitle: (label: string) => string }> = {
  signIn: { title: "Welcome back", subtitle: (label) => `Sign in to continue to ${label}.` },
  signUp: { title: "Let's get you set up", subtitle: (label) => `Create your account to start with ${label}.` },
};

/** Product-coloured top of the login surface; drag it down (or tap back) to return to the products. */
export function LoginHeader({ product, mode, topInset, onBack }: Props) {
  const on = product.onPrimary;
  const copy = COPY[mode];

  return (
    <LinearGradient
      colors={[mix(product.primary, "#ffffff", 0.05), mix(product.primary, "#000000", 0.22)]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.root, { paddingTop: topInset + 10 }]}
    >
      <View pointerEvents="none" style={styles.ghost}>
        <BrandIcon width={260} variant="mono" color={on} />
      </View>

      <View style={[styles.handle, { backgroundColor: withAlpha(on, 0.35) }]} />

      <View style={styles.row}>
        <Pressable
          onPress={onBack}
          hitSlop={10}
          style={({ pressed }) => [styles.back, { backgroundColor: withAlpha(on, pressed ? 0.26 : 0.16) }]}
          accessibilityRole="button"
          accessibilityLabel="Back to products"
        >
          <Svg width={18} height={18} viewBox="0 0 18 18">
            <Path d="M4 7l5 5 5-5" stroke={on} strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </Pressable>
        <View style={[styles.chip, { backgroundColor: withAlpha(on, 0.14) }]}>
          <BrandIcon width={26} variant="mono" color={on} />
          <Text style={[styles.chipText, { color: on }]}>{product.label}</Text>
        </View>
      </View>

      <View style={styles.copy}>
        <Animated.Text
          key={`t-${mode}`}
          entering={FadeInDown.duration(280)}
          exiting={FadeOutUp.duration(160)}
          style={[styles.title, { color: on }]}
        >
          {copy.title}
        </Animated.Text>
        <Animated.Text
          key={`s-${mode}`}
          entering={FadeInDown.delay(40).duration(280)}
          exiting={FadeOutUp.duration(160)}
          style={[styles.subtitle, { color: withAlpha(on, 0.78) }]}
        >
          {copy.subtitle(product.label)}
        </Animated.Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: { paddingHorizontal: 24, paddingBottom: 52, overflow: "hidden" },
  ghost: { position: "absolute", right: -70, bottom: -60, opacity: 0.1 },
  handle: { alignSelf: "center", width: 40, height: 5, borderRadius: 3, marginBottom: 14 },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  back: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 999,
    paddingLeft: 10,
    paddingRight: 14,
    paddingVertical: 7,
  },
  chipText: { fontFamily: fontFamily.semiBold, fontSize: 14 },
  copy: { marginTop: 26, minHeight: 92, gap: 8 },
  title: { fontFamily: fontFamily.bold, fontSize: 32, letterSpacing: -0.8, lineHeight: 38 },
  subtitle: { fontFamily: fontFamily.regular, fontSize: 15.5, lineHeight: 22 },
});
