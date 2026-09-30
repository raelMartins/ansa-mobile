import type { ColorScheme, ThemeColors } from "../../core/ui/theme";

export function merchantCardBackground(scheme: ColorScheme, colors: ThemeColors): string {
  return scheme === "dark" ? colors.surface : "rgba(212, 220, 213, 0.45)";
}

export const merchantRadii = {
  card: 16,
  pill: 999,
  button: 12,
};
