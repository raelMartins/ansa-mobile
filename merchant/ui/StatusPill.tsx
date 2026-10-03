import { Text, View } from "react-native";
import { brand } from "../../core/ui/brandColors";
import type { ColorScheme } from "../../core/ui/theme";
import { useTheme } from "../../core/ui/ThemeContext";
import { useThemedStyles } from "../../core/ui/themedStyles";
import { merchantRadii } from "./merchantUi";

export type StatusPillTone =
  | "neutral"
  | "success"
  | "muted"
  | "warn"
  | "awaitingPayment"
  | "paymentFailed"
  | "paid"
  | "newOrder"
  | "packing"
  | "ready"
  | "inTransit"
  | "delivered"
  | "cancelled"
  | "orderPending";

type ToneColors = { bg: string; text: string };

function colorsForTone(tone: StatusPillTone, scheme: ColorScheme): ToneColors {
  const dark = scheme === "dark";

  switch (tone) {
    case "awaitingPayment":
    case "warn":
      return {
        bg: dark ? "rgba(227, 208, 150, 0.28)" : "rgba(227, 208, 150, 0.62)",
        text: dark ? brand.honey : "#5c4a1e",
      };
    case "paymentFailed":
      return {
        bg: dark ? "rgba(224, 122, 111, 0.22)" : "rgba(184, 92, 79, 0.16)",
        text: dark ? "#f0a89e" : "#9a3f32",
      };
    case "paid":
    case "success":
      return {
        bg: dark ? "rgba(120, 160, 140, 0.28)" : "rgba(45, 66, 54, 0.2)",
        text: dark ? "#b8d4c4" : brand.forest,
      };
    case "newOrder":
      return {
        bg: dark ? "rgba(100, 140, 180, 0.28)" : "rgba(70, 110, 150, 0.16)",
        text: dark ? "#a8c8e8" : "#2f5570",
      };
    case "packing":
      return {
        bg: dark ? "rgba(200, 160, 100, 0.25)" : "rgba(196, 152, 88, 0.28)",
        text: dark ? "#e8c99a" : "#6b4e24",
      };
    case "ready":
      return {
        bg: dark ? "rgba(90, 150, 110, 0.3)" : "rgba(72, 130, 95, 0.2)",
        text: dark ? "#9fd4b0" : "#2a5c40",
      };
    case "inTransit":
      return {
        bg: dark ? "rgba(80, 150, 145, 0.28)" : "rgba(55, 120, 115, 0.18)",
        text: dark ? "#8fd4cf" : "#2a5a56",
      };
    case "delivered":
    case "muted":
      return {
        bg: dark ? "rgba(147, 160, 151, 0.22)" : "rgba(147, 160, 151, 0.32)",
        text: dark ? brand.linen : brand.inkMuted,
      };
    case "cancelled":
      return {
        bg: dark ? "rgba(160, 120, 120, 0.22)" : "rgba(120, 100, 100, 0.18)",
        text: dark ? "#c4b0b0" : "#5c5050",
      };
    case "orderPending":
    case "neutral":
    default:
      return {
        bg: dark ? "rgba(147, 160, 151, 0.18)" : "rgba(212, 220, 213, 0.65)",
        text: dark ? brand.linen : brand.forest,
      };
  }
}

export function StatusPill({ label, tone = "neutral" }: { label: string; tone?: StatusPillTone }) {
  const { scheme } = useTheme();
  const { bg, text } = colorsForTone(tone, scheme);

  const styles = useThemedStyles((_, f) => ({
    pill: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: merchantRadii.pill,
      backgroundColor: bg,
    },
    text: { fontSize: 12, fontFamily: f.semiBold, color: text },
  }));

  return (
    <View style={styles.pill}>
      <Text style={styles.text}>{label}</Text>
    </View>
  );
}
