import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { BlurView } from "expo-blur";
import { Platform, StyleSheet, View } from "react-native";
import { useTheme } from "../../core/ui/ThemeContext";

/** Extra scroll padding so content clears the floating glass tab bar. */
export function useMerchantTabBarInset(extra = 24): number {
  return useBottomTabBarHeight() + extra;
}

/** Frosted backdrop for the merchant bottom tab bar. */
export function MerchantGlassTabBarBackground() {
  const { scheme } = useTheme();
  const isDark = scheme === "dark";

  const tint = isDark ? "dark" : "light";
  const wash = isDark ? "rgba(39, 41, 48, 0.55)" : "rgba(255, 255, 255, 0.58)";
  const hairline = isDark ? "rgba(227, 234, 228, 0.12)" : "rgba(45, 66, 54, 0.1)";

  return (
    <View style={StyleSheet.absoluteFill}>
      <BlurView intensity={isDark ? 70 : 82} tint={tint} style={StyleSheet.absoluteFill} />
      {/* Tint + Android fallback when system blur is weak */}
      <View style={[StyleSheet.absoluteFill, { backgroundColor: wash }]} pointerEvents="none" />
      <View style={[styles.hairline, { backgroundColor: hairline }]} pointerEvents="none" />
    </View>
  );
}

export const merchantGlassTabBarStyle = {
  position: "absolute" as const,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "transparent",
  borderTopWidth: 0,
  elevation: 0,
  paddingTop: 6,
  height: Platform.OS === "ios" ? 88 : 64,
};

const styles = StyleSheet.create({
  hairline: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: StyleSheet.hairlineWidth,
  },
});
