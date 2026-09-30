import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import type { ThemeColors } from "./theme";
import { fontFamily } from "./theme";
import { useTheme } from "./ThemeContext";

export function LoadingState({ label = "Loading…" }: { label?: string }) {
  const { colors, fonts } = useTheme();
  const styles = createStyles(colors, fonts);

  return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color={colors.accent} />
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

export function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  const { colors, fonts } = useTheme();
  const styles = createStyles(colors, fonts);

  return (
    <View style={styles.center}>
      <Text style={styles.errorTitle}>Something went wrong</Text>
      <Text style={styles.errorBody}>{message}</Text>
      {onRetry ? (
        <Pressable style={styles.button} onPress={onRetry} accessibilityRole="button">
          <Text style={styles.buttonText}>Try again</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function createStyles(colors: ThemeColors, fonts: typeof fontFamily) {
  return StyleSheet.create({
    center: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      padding: 24,
      backgroundColor: colors.bg,
    },
    label: {
      marginTop: 16,
      color: colors.textMuted,
      fontSize: 16,
      fontFamily: fonts.regular,
    },
    errorTitle: {
      color: colors.text,
      fontSize: 18,
      fontFamily: fonts.semiBold,
      marginBottom: 8,
    },
    errorBody: {
      color: colors.textMuted,
      fontSize: 16,
      fontFamily: fonts.regular,
      textAlign: "center",
      lineHeight: 22,
    },
    button: {
      marginTop: 20,
      backgroundColor: colors.accent,
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 8,
      minHeight: 44,
      justifyContent: "center",
    },
    buttonText: {
      color: colors.onAccent,
      fontFamily: fonts.semiBold,
      fontSize: 16,
    },
  });
}
