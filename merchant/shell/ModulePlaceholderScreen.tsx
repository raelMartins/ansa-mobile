import { Text, View } from "react-native";
import { useThemedStyles } from "../../core/ui/themedStyles";

type Props = {
  title: string;
  description: string;
};

export function ModulePlaceholderScreen({ title, description }: Props) {
  const styles = useThemedStyles((c, f) => ({
    container: {
      flex: 1,
      justifyContent: "center",
      paddingHorizontal: 24,
      backgroundColor: c.bg,
    },
    title: {
      fontSize: 22,
      fontFamily: f.semiBold,
      color: c.text,
      marginBottom: 8,
    },
    body: {
      fontSize: 16,
      fontFamily: f.regular,
      lineHeight: 22,
      color: c.textMuted,
    },
  }));

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.body}>{description}</Text>
    </View>
  );
}
