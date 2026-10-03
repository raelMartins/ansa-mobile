import { Pressable, Text, type StyleProp, type ViewStyle } from "react-native";
import { feedback } from "../../core/feedback/feedback";
import { useThemedStyles } from "../../core/ui/themedStyles";
import { merchantRadii } from "./merchantUi";

type ButtonProps = {
  label: string;
  loading?: boolean;
  disabled?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
};

export function MerchantPrimaryButton({ label, loading, disabled, onPress, style }: ButtonProps) {
  const styles = useThemedStyles((c, f) => ({
    btn: {
      backgroundColor: c.accent,
      borderRadius: merchantRadii.button,
      paddingVertical: 16,
      paddingHorizontal: 20,
      alignItems: "center",
      minHeight: 52,
      justifyContent: "center",
      opacity: disabled || loading ? 0.55 : 1,
    },
    text: { color: c.onAccent, fontSize: 16, fontFamily: f.semiBold },
  }));

  return (
    <Pressable
      style={[styles.btn, style]}
      disabled={disabled || loading}
      onPress={() => {
        feedback.tap();
        onPress?.();
      }}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!(disabled || loading), busy: !!loading }}
    >
      <Text style={styles.text}>{loading ? "Please wait…" : label}</Text>
    </Pressable>
  );
}

export function MerchantSecondaryButton({ label, loading, disabled, onPress, style }: ButtonProps) {
  const styles = useThemedStyles((c, f) => ({
    btn: {
      backgroundColor: c.bg,
      borderRadius: merchantRadii.button,
      paddingVertical: 16,
      paddingHorizontal: 20,
      alignItems: "center",
      minHeight: 52,
      justifyContent: "center",
      borderWidth: 1,
      borderColor: c.border,
      opacity: disabled || loading ? 0.55 : 1,
    },
    text: { color: c.text, fontSize: 16, fontFamily: f.semiBold },
  }));

  return (
    <Pressable
      style={[styles.btn, style]}
      disabled={disabled || loading}
      onPress={() => {
        feedback.tap();
        onPress?.();
      }}
      accessibilityRole="button"
    >
      <Text style={styles.text}>{loading ? "Please wait…" : label}</Text>
    </Pressable>
  );
}

export function MerchantDangerLink({ label, onPress }: { label: string; onPress: () => void }) {
  const styles = useThemedStyles((c, f) => ({
    hit: { paddingVertical: 12, alignItems: "center", minHeight: 44, justifyContent: "center" },
    text: { color: c.error, fontSize: 15, fontFamily: f.semiBold },
  }));
  return (
    <Pressable style={styles.hit} onPress={onPress} accessibilityRole="button">
      <Text style={styles.text}>{label}</Text>
    </Pressable>
  );
}
