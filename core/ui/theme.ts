import type { AnsaProduct } from "../products/catalog";

export type ColorScheme = "light" | "dark";
export type ThemePreference = ColorScheme | "system";

/** Founder decision (Oct 2026): ship light by default; flip to "system" later. */
export const DEFAULT_THEME_PREFERENCE: ThemePreference = "light";

/** Nordic Sage — sampled from identity preview (docs/ansa_brand_guidelines.md) */
export type ThemeColors = {
  bg: string;
  surface: string;
  text: string;
  textMuted: string;
  accent: string;
  onAccent: string;
  border: string;
  error: string;
  inputBg: string;
};

export const lightColors: ThemeColors = {
  bg: "#ffffff",
  surface: "#ffffff",
  text: "#2d4236",
  textMuted: "#93a097",
  accent: "#2d4236",
  onAccent: "#ffffff",
  border: "#cdd5ce",
  error: "#b85c4f",
  inputBg: "#ffffff",
};

export const darkColors: ThemeColors = {
  bg: "#272930",
  surface: "#32383f",
  text: "#e3eae4",
  textMuted: "#93a097",
  accent: "#e3d096",
  onAccent: "#2d4236",
  border: "#3e464f",
  error: "#e07a6f",
  inputBg: "#2f343c",
};

export const fontFamily = {
  regular: "PlusJakartaSans_400Regular",
  medium: "PlusJakartaSans_500Medium",
  semiBold: "PlusJakartaSans_600SemiBold",
  bold: "PlusJakartaSans_700Bold",
};

export const THEME_STORAGE_KEY = "ansa.colorScheme";

/** Each product's dashboard wears its own primary; merchant keeps the Nordic Sage palette. */
export function colorsForScheme(scheme: ColorScheme, product?: AnsaProduct | null): ThemeColors {
  const base = scheme === "dark" ? darkColors : lightColors;
  if (!product || product.id === "merchant") {
    return base;
  }
  return scheme === "dark"
    ? { ...base, accent: product.darkAccent, onAccent: product.primary }
    : { ...base, text: product.primary, accent: product.primary, onAccent: product.onPrimary };
}
