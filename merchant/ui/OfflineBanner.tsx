import { Text, View } from "react-native";
import { useTheme } from "../../core/ui/ThemeContext";
import { useThemedStyles } from "../../core/ui/themedStyles";
import { IconWifiOff } from "./MerchantHeaderIcons";
import { merchantRadii } from "./merchantUi";

type Props = {
  /** Optional suffix, e.g. pending sync count copy. */
  detail?: string;
};

export function OfflineBanner({ detail }: Props) {
  const { colors } = useTheme();
  const styles = useThemedStyles((c, f) => ({
    box: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 10,
      backgroundColor: "rgba(227, 208, 150, 0.42)",
      borderRadius: merchantRadii.card,
      borderWidth: 1,
      borderColor: "rgba(45, 66, 54, 0.12)",
      padding: 14,
    },
    text: { flex: 1, fontSize: 14, fontFamily: f.regular, color: c.text, lineHeight: 20 },
    strong: { fontFamily: f.semiBold },
  }));

  const body = detail
    ? detail
    : "You're offline. You can browse saved data. We'll sync when your connection returns.";

  return (
    <View style={styles.box} accessibilityRole="text" accessibilityLiveRegion="polite">
      <IconWifiOff color={colors.text} size={20} />
      <Text style={styles.text}>
        <Text style={styles.strong}>You're offline</Text>
        {" · "}
        {body}
      </Text>
    </View>
  );
}
