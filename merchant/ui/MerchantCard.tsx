import { Text, View, type ViewProps } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useTheme } from "../../core/ui/ThemeContext";
import { useThemedStyles } from "../../core/ui/themedStyles";
import { merchantCardBackground, merchantRadii } from "./merchantUi";

type Props = ViewProps & {
  title?: string;
  delay?: number;
  children: React.ReactNode;
};

export function MerchantCard({ title, delay = 0, children, style, ...rest }: Props) {
  const { scheme } = useTheme();
  const styles = useThemedStyles((c, f) => ({
    card: {
      backgroundColor: merchantCardBackground(scheme, c),
      borderRadius: merchantRadii.card,
      padding: 18,
      gap: 12,
      borderWidth: 1,
      borderColor: c.border,
    },
    title: {
      fontSize: 17,
      fontFamily: f.semiBold,
      color: c.text,
      letterSpacing: -0.2,
    },
  }));

  return (
    <Animated.View
      entering={FadeInDown.delay(delay).duration(480).springify().damping(20)}
      style={[styles.card, style]}
      {...rest}
    >
      {title ? <Text style={styles.title}>{title}</Text> : null}
      {children}
    </Animated.View>
  );
}
