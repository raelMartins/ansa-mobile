import { Pressable, StyleSheet, Text, TextInput, View, type TextInputProps } from "react-native";
import type { ThemeColors } from "./theme";
import { fontFamily } from "./theme";
import { useTheme } from "./ThemeContext";

type FieldProps = {
  label: string;
  hint?: string;
  error?: string | null;
  inputProps: TextInputProps;
};

export function Field({ label, hint, error, inputProps }: FieldProps) {
  const { colors, fonts } = useTheme();
  const styles = createStyles(colors, fonts);

  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
      <TextInput
        placeholderTextColor={colors.textMuted}
        style={[styles.input, error ? styles.inputError : null]}
        {...inputProps}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

type PrimaryButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
};

export function PrimaryButton({ label, onPress, disabled, loading }: PrimaryButtonProps) {
  const { colors, fonts } = useTheme();
  const styles = createStyles(colors, fonts);
  const isDisabled = disabled || loading;

  return (
    <Pressable
      style={[styles.button, isDisabled && styles.buttonDisabled]}
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
    >
      <Text style={styles.buttonText}>{loading ? "Please wait…" : label}</Text>
    </Pressable>
  );
}

export function TextLink({ label, onPress }: { label: string; onPress: () => void }) {
  const { colors, fonts } = useTheme();
  const styles = createStyles(colors, fonts);

  return (
    <Pressable onPress={onPress} style={styles.linkHit} accessibilityRole="button">
      <Text style={styles.link}>{label}</Text>
    </Pressable>
  );
}

function createStyles(colors: ThemeColors, fonts: typeof fontFamily) {
  return StyleSheet.create({
    field: {
      gap: 6,
    },
    label: {
      color: colors.text,
      fontSize: 15,
      fontFamily: fonts.medium,
    },
    hint: {
      color: colors.textMuted,
      fontSize: 13,
      fontFamily: fonts.regular,
    },
    input: {
      backgroundColor: colors.inputBg,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 14,
      paddingHorizontal: 16,
      paddingVertical: 14,
      fontSize: 16,
      fontFamily: fonts.regular,
      color: colors.text,
      minHeight: 48,
    },
    inputError: {
      borderColor: colors.error,
    },
    error: {
      color: colors.error,
      fontSize: 13,
      fontFamily: fonts.regular,
    },
    button: {
      backgroundColor: colors.accent,
      borderRadius: 14,
      paddingVertical: 16,
      alignItems: "center",
      minHeight: 48,
      justifyContent: "center",
    },
    buttonDisabled: {
      opacity: 0.5,
    },
    buttonText: {
      color: colors.onAccent,
      fontSize: 16,
      fontFamily: fonts.semiBold,
    },
    link: {
      color: colors.accent,
      fontSize: 15,
      fontFamily: fonts.medium,
    },
    linkHit: {
      paddingVertical: 8,
      minHeight: 44,
      justifyContent: "center",
    },
  });
}
