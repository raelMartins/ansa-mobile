import { useState, type ReactNode } from "react";
import { StyleSheet, Text, TextInput, View, type TextInputProps } from "react-native";
import Animated, {
  FadeIn,
  FadeOut,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useTheme } from "../../core/ui/ThemeContext";

type Props = {
  label: string;
  accent: string;
  hint?: string;
  error?: string | null;
  trailing?: ReactNode;
  inputProps: TextInputProps;
};

/** Labelled input whose border warms to the product accent on focus. */
export function AuthField({ label, accent, hint, error, trailing, inputProps }: Props) {
  const { colors, fonts } = useTheme();
  const focus = useSharedValue(0);
  const [focused, setFocused] = useState(false);
  const rest = colors.border;
  const active = error ? colors.error : accent;

  const frameStyle = useAnimatedStyle(() => ({
    borderColor: interpolateColor(focus.value, [0, 1], [error ? colors.error : rest, active]),
    transform: [{ scale: 1 + focus.value * 0.004 }],
  }));

  return (
    <View style={styles.field}>
      <Text style={[styles.label, { color: focused ? active : colors.text, fontFamily: fonts.medium }]}>{label}</Text>
      <Animated.View style={[styles.frame, { backgroundColor: colors.inputBg }, frameStyle]}>
        <TextInput
          placeholderTextColor={colors.textMuted}
          {...inputProps}
          onFocus={(e) => {
            setFocused(true);
            focus.value = withTiming(1, { duration: 180 });
            inputProps.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            focus.value = withTiming(0, { duration: 220 });
            inputProps.onBlur?.(e);
          }}
          style={[styles.input, { color: colors.text, fontFamily: fonts.regular }]}
        />
        {trailing}
      </Animated.View>
      {error ? (
        <Animated.Text
          entering={FadeIn.duration(180)}
          exiting={FadeOut.duration(140)}
          style={[styles.note, { color: colors.error, fontFamily: fonts.regular }]}
        >
          {error}
        </Animated.Text>
      ) : hint ? (
        <Text style={[styles.note, { color: colors.textMuted, fontFamily: fonts.regular }]}>{hint}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: 7 },
  label: { fontSize: 14, letterSpacing: 0.1 },
  frame: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderRadius: 16,
    minHeight: 54,
    paddingLeft: 16,
    paddingRight: 6,
  },
  input: { flex: 1, fontSize: 16, paddingVertical: 14 },
  note: { fontSize: 13, lineHeight: 18 },
});
