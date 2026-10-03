import type { ColorScheme } from "../ui/theme";
import { iconCurveColor, iconSecondary } from "./color";

/**
 * Ecosystem (pre-product) look for splash + welcome cinematic — Nordic Sage for now;
 * founder may replace the ecosystem primary.
 */
export const ECOSYSTEM_PRIMARY = "#2d4236";

export type EcosystemPalette = {
  scheme: ColorScheme;
  /** Top → bottom canvas gradient. */
  canvas: [string, string];
  /** Flat canvas colour (native splash, contrast checks). */
  background: string;
  /** Intro dot + pen. */
  dot: string;
  text: string;
  textMuted: string;
  icon: { primary: string; secondary: string; curve: string };
  /** Soft aura colour behind marks when the primary is hard to see on the canvas. */
  aura: string | null;
};

const LIGHT_BG = "#eef2ef";
const DARK_BG = "#1f2622";

export function ecosystemPalette(scheme: ColorScheme): EcosystemPalette {
  if (scheme === "dark") {
    return {
      scheme,
      canvas: ["#25302a", DARK_BG],
      background: DARK_BG,
      dot: "#f4f7f4",
      text: "#e3eae4",
      textMuted: "#93a097",
      icon: {
        primary: ECOSYSTEM_PRIMARY,
        secondary: iconSecondary(ECOSYSTEM_PRIMARY),
        curve: iconCurveColor(ECOSYSTEM_PRIMARY, DARK_BG),
      },
      aura: "#e3eae4",
    };
  }
  return {
    scheme,
    canvas: ["#f5f8f5", "#e3eae4"],
    background: LIGHT_BG,
    dot: ECOSYSTEM_PRIMARY,
    text: ECOSYSTEM_PRIMARY,
    textMuted: "#74877a",
    icon: {
      primary: ECOSYSTEM_PRIMARY,
      secondary: iconSecondary(ECOSYSTEM_PRIMARY),
      curve: iconCurveColor(ECOSYSTEM_PRIMARY, LIGHT_BG),
    },
    aura: null,
  };
}
