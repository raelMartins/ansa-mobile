import { StyleSheet, Text, View } from "react-native";
import { colors } from "../../core/ui/theme";

type Props = {
  title: string;
  description: string;
};

export function ModulePlaceholderScreen({ title, description }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.body}>{description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    backgroundColor: colors.bg,
  },
  title: {
    fontSize: 22,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 8,
  },
  body: {
    fontSize: 16,
    lineHeight: 22,
    color: colors.textMuted,
  },
});
