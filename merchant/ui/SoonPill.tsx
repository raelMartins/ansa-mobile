import { Text, View } from "react-native";
import { brand } from "../../core/ui/brandColors";
import { useTheme } from "../../core/ui/ThemeContext";
import { useThemedStyles } from "../../core/ui/themedStyles";
import { merchantRadii } from "./merchantUi";

export function SoonPill() {
  const { scheme } = useTheme();
  const styles = useThemedStyles((c, f) => ({
    pill: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: merchantRadii.pill,
      backgroundColor: scheme === "dark" ? "rgba(227, 208, 150, 0.18)" : brand.honey + "66",
    },
    text: {
      fontSize: 11,
      fontFamily: f.semiBold,
      color: scheme === "dark" ? brand.honey : brand.forest,
      letterSpacing: 0.5,
      textTransform: "uppercase",
    },
  }));

  return (
    <View style={styles.pill}>
      <Text style={styles.text}>Soon</Text>
    </View>
  );
}
