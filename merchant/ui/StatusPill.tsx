import { Text, View } from "react-native";
import { useThemedStyles } from "../../core/ui/themedStyles";
import { merchantRadii } from "./merchantUi";

type Tone = "neutral" | "warn" | "success" | "muted";

const toneBg: Record<Tone, string> = {
  neutral: "rgba(45, 66, 54, 0.12)",
  warn: "rgba(227, 208, 150, 0.55)",
  success: "rgba(45, 66, 54, 0.14)",
  muted: "rgba(147, 160, 151, 0.25)",
};

export function StatusPill({ label, tone = "neutral" }: { label: string; tone?: Tone }) {
  const styles = useThemedStyles((c, f) => ({
    pill: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: merchantRadii.pill,
      backgroundColor: toneBg[tone],
    },
    text: { fontSize: 12, fontFamily: f.semiBold, color: c.text },
  }));

  return (
    <View style={styles.pill}>
      <Text style={styles.text}>{label}</Text>
    </View>
  );
}
