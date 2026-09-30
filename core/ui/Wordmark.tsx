import { Text, View } from "react-native";
import { AnsaLogo } from "./AnsaLogo";
import { useTheme } from "./ThemeContext";
import { useThemedStyles } from "./themedStyles";

const FOREST = "#2d4236";
const LINEN = "#e3eae4";
const HONEY = "#e3d096";

type WordmarkProps = {
  /** Wordmark cap height in px — mobile defaults smaller than web. */
  height?: number;
  /** Product pill label; pass `false` to hide. */
  badge?: string | false;
  /** Light wordmark for dark backgrounds. */
  inverse?: boolean;
};

export function Wordmark({ height = 18, badge = "merchant", inverse = false }: WordmarkProps) {
  const { colors } = useTheme();
  const showBadge = badge !== false;
  const label = showBadge ? (badge || "merchant") : "";
  const logoColor = inverse ? LINEN : colors.text;

  const styles = useThemedStyles((_c, f) => ({
    row: { flexDirection: "row", alignItems: "center", gap: height * 0.35 },
    pill: {
      backgroundColor: inverse ? HONEY : "rgba(227, 208, 150, 0.38)",
      borderWidth: inverse ? 0 : 1,
      borderColor: "rgba(45, 66, 54, 0.06)",
      paddingHorizontal: height * 0.42,
      paddingVertical: height * 0.14,
      borderRadius: 999,
    },
    pillText: {
      fontFamily: f.semiBold,
      fontSize: Math.max(9, height * 0.38),
      letterSpacing: 0.3,
      color: FOREST,
      textTransform: "lowercase",
    },
  }));

  return (
    <View style={styles.row} accessibilityRole="header">
      <AnsaLogo height={height} color={logoColor} />
      {showBadge ? (
        <View style={styles.pill}>
          <Text style={styles.pillText}>{label}</Text>
        </View>
      ) : null}
    </View>
  );
}
