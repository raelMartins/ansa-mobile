export type ColorScheme = "light" | "dark";

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
};

export const THEME_STORAGE_KEY = "ansa.colorScheme";

export function colorsForScheme(scheme: ColorScheme): ThemeColors {
  return scheme === "dark" ? darkColors : lightColors;
}
