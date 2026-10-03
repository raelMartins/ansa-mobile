import { Text, View } from "react-native";
import { useThemedStyles } from "../../core/ui/themedStyles";
import { merchantRadii } from "./merchantUi";

type Variant = "success" | "warning" | "neutral";

export function InfoBanner({
  children,
  variant = "neutral",
}: {
  children: string;
  variant?: Variant;
}) {
  const styles = useThemedStyles((c, f) => {
    const bg =
      variant === "success"
        ? "rgba(212, 220, 213, 0.65)"
        : variant === "warning"
          ? "rgba(227, 208, 150, 0.35)"
          : "rgba(212, 220, 213, 0.45)";
    return {
      box: {
        backgroundColor: bg,
        borderRadius: merchantRadii.card,
        padding: 14,
        borderWidth: 1,
        borderColor: c.border,
      },
      text: { fontSize: 14, fontFamily: f.regular, color: c.text, lineHeight: 20 },
    };
  });

  return (
    <View style={styles.box}>
      <Text style={styles.text}>{children}</Text>
    </View>
  );
}
