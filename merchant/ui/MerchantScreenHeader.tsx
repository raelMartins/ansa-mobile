import { Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useThemedStyles } from "../../core/ui/themedStyles";

type Props = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
};

export function MerchantScreenHeader({ eyebrow, title, subtitle }: Props) {
  const styles = useThemedStyles((c, f) => ({
    wrap: { gap: 6, marginBottom: 4 },
    eyebrow: {
      fontSize: 12,
      fontFamily: f.medium,
      color: c.textMuted,
      letterSpacing: 0.6,
      textTransform: "uppercase",
    },
    title: {
      fontSize: 28,
      fontFamily: f.semiBold,
      color: c.text,
      letterSpacing: -0.4,
      lineHeight: 32,
    },
    subtitle: {
      fontSize: 16,
      fontFamily: f.regular,
      color: c.textMuted,
      lineHeight: 22,
      maxWidth: 340,
    },
  }));

  return (
    <Animated.View entering={FadeInDown.duration(420).springify().damping(18)} style={styles.wrap}>
      {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </Animated.View>
  );
}
