import { useMemo } from "react";
import { StyleSheet, type ImageStyle, type TextStyle, type ViewStyle } from "react-native";
import { useTheme } from "./ThemeContext";
import type { ThemeColors } from "./theme";
import { fontFamily } from "./theme";

type NamedStyles<T> = { [P in keyof T]: ViewStyle | TextStyle | ImageStyle };

export function useThemedStyles<T extends NamedStyles<T>>(
  factory: (colors: ThemeColors, fonts: typeof fontFamily) => T,
): T {
  const { colors, fonts } = useTheme();
  return useMemo(() => StyleSheet.create(factory(colors, fonts)), [colors, fonts]);
}
