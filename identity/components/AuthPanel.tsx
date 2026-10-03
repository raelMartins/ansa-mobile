import { useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInLeft,
  FadeInRight,
  FadeOut,
  LinearTransition,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { ApiError, errorMessage } from "../../core/api/errors";
import { withAlpha } from "../../core/brand/color";
import { feedback } from "../../core/feedback/feedback";
import { useSession } from "../../core/session/SessionContext";
import { BrandInline } from "../../core/ui/BrandInline";
import { SegmentedControl } from "../../core/ui/SegmentedControl";
import { useTheme } from "../../core/ui/ThemeContext";
import { signIn, signUp } from "../api/auth";
import { parseLoginIdentifier, validateEmail, validatePassword } from "../credentials";
import { AuthField } from "./AuthField";

export type AuthMode = "signIn" | "signUp";

type Props = {
  mode: AuthMode;
  onModeChange: (mode: AuthMode) => void;
  /** Product accent for focus, toggle and primary action. */
  accent: string;
  onAccent: string;
  bottomInset: number;
  onAuthenticated: () => void;
};

const MODES: { id: AuthMode; label: string }[] = [
  { id: "signIn", label: "Sign in" },
  { id: "signUp", label: "Create account" },
];

function SubmitButton({
  label,
  busyLabel,
  busy,
  accent,
  onAccent,
  onPress,
}: {
  label: string;
  busyLabel: string;
  busy: boolean;
  accent: string;
  onAccent: string;
  onPress: () => void;
}) {
  const { fonts } = useTheme();
  const scale = useSharedValue(1);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Animated.View style={style}>
      <Pressable
        onPress={onPress}
        disabled={busy}
        onPressIn={() => {
          scale.value = withSpring(0.97, { damping: 18, stiffness: 320 });
        }}
        onPressOut={() => {
          scale.value = withSpring(1, { damping: 14, stiffness: 240 });
        }}
        style={[styles.submit, { backgroundColor: accent, opacity: busy ? 0.85 : 1 }]}
        accessibilityRole="button"
        accessibilityState={{ busy, disabled: busy }}
      >
        {busy ? (
          <Animated.View key="busy" entering={FadeIn.duration(160)} style={styles.submitRow}>
            <ActivityIndicator color={onAccent} />
            <Text style={[styles.submitText, { color: onAccent, fontFamily: fonts.semiBold }]}>{busyLabel}</Text>
          </Animated.View>
        ) : (
          <Animated.Text
            key="idle"
            entering={FadeIn.duration(160)}
            style={[styles.submitText, { color: onAccent, fontFamily: fonts.semiBold }]}
          >
            {label}
          </Animated.Text>
        )}
      </Pressable>
    </Animated.View>
  );
}

/** Sign in / create account — one surface, one identity across every product. */
export function AuthPanel({ mode, onModeChange, accent, onAccent, bottomInset, onAuthenticated }: Props) {
  const { colors, fonts, scheme } = useTheme();
  const { api, establishSession } = useSession();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ identifier?: string; password?: string }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const shake = useSharedValue(0);
  const signingUp = mode === "signUp";

  const errorStyle = useAnimatedStyle(() => ({ transform: [{ translateX: shake.value }] }));

  function fail(message: string) {
    setFormError(message);
    feedback.error();
    shake.value = withSequence(
      withTiming(-6, { duration: 45 }),
      withTiming(6, { duration: 60 }),
      withTiming(-3, { duration: 50 }),
      withTiming(0, { duration: 60 }),
    );
  }

  function switchMode(next: AuthMode) {
    setFieldErrors({});
    setFormError(null);
    onModeChange(next);
  }

  async function submit() {
    Keyboard.dismiss();
    const passwordError = validatePassword(password, signingUp);
    let identifierError: string | null;
    const loginId = signingUp ? null : parseLoginIdentifier(identifier);
    if (signingUp) {
      identifierError = validateEmail(identifier);
    } else {
      identifierError = loginId ? null : "Enter your email or phone number";
    }
    setFieldErrors({ identifier: identifierError ?? undefined, password: passwordError ?? undefined });
    if (identifierError || passwordError) {
      feedback.error();
      return;
    }

    setBusy(true);
    setFormError(null);
    try {
      const result = signingUp
        ? await signUp(api, { email: identifier.trim(), password })
        : await signIn(api, { ...loginId!, password });
      await establishSession({
        accessToken: result.tokens.accessToken,
        refreshToken: result.tokens.refreshToken,
      });
      onAuthenticated();
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        fail("That email or password doesn't match.");
      } else if (err instanceof ApiError && err.status === 409) {
        fail("An account with this email already exists. Try signing in.");
      } else if (err instanceof ApiError && err.status === 0) {
        fail(err.message);
      } else {
        fail(errorMessage(err, signingUp ? "Could not create your account" : "Could not sign in"));
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <KeyboardAvoidingView style={styles.flex} behavior="padding">
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingBottom: bottomInset + 28 }]}
      >
        <SegmentedControl
          options={MODES}
          value={mode}
          onChange={switchMode}
          accent={accent}
          onAccent={onAccent}
          trackColor={scheme === "dark" ? colors.inputBg : withAlpha(accent, 0.07)}
          accessibilityLabel="Sign in or create an account"
        />

        {formError ? (
          <Animated.View
            entering={FadeInDown.duration(220)}
            exiting={FadeOut.duration(160)}
            style={[styles.banner, { backgroundColor: withAlpha(colors.error, 0.1), borderColor: withAlpha(colors.error, 0.3) }, errorStyle]}
            accessibilityLiveRegion="polite"
          >
            <Text style={[styles.bannerText, { color: colors.error, fontFamily: fonts.medium }]}>{formError}</Text>
          </Animated.View>
        ) : null}

        <Animated.View
          key={mode}
          entering={(signingUp ? FadeInRight : FadeInLeft).duration(260)}
          layout={LinearTransition.duration(220)}
          style={styles.fields}
        >
          <AuthField
            label={signingUp ? "Email" : "Email or phone"}
            accent={accent}
            error={fieldErrors.identifier}
            inputProps={{
              value: identifier,
              onChangeText: setIdentifier,
              autoCapitalize: "none",
              autoCorrect: false,
              keyboardType: "email-address",
              textContentType: signingUp ? "emailAddress" : "username",
              autoComplete: signingUp ? "email" : "username",
              placeholder: signingUp ? "you@example.com" : "you@example.com or 080…",
              editable: !busy,
              returnKeyType: "next",
            }}
          />
          <AuthField
            label="Password"
            accent={accent}
            hint={signingUp ? "At least 8 characters" : undefined}
            error={fieldErrors.password}
            trailing={
              <Pressable
                onPress={() => setShowPassword((v) => !v)}
                hitSlop={8}
                style={styles.reveal}
                accessibilityRole="button"
                accessibilityLabel={showPassword ? "Hide password" : "Show password"}
              >
                <Text style={[styles.revealText, { color: accent, fontFamily: fonts.semiBold }]}>
                  {showPassword ? "Hide" : "Show"}
                </Text>
              </Pressable>
            }
            inputProps={{
              value: password,
              onChangeText: setPassword,
              secureTextEntry: !showPassword,
              textContentType: signingUp ? "newPassword" : "password",
              autoComplete: signingUp ? "new-password" : "current-password",
              placeholder: "••••••••",
              editable: !busy,
              returnKeyType: "go",
              onSubmitEditing: () => void submit(),
            }}
          />
        </Animated.View>

        <SubmitButton
          label={signingUp ? "Create account" : "Sign in"}
          busyLabel={signingUp ? "Creating account…" : "Signing in…"}
          busy={busy}
          accent={accent}
          onAccent={onAccent}
          onPress={() => void submit()}
        />

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.textMuted, fontFamily: fonts.regular }]}>One</Text>
          <BrandInline fontSize={14} color={colors.textMuted} />
          <Text style={[styles.footerText, { color: colors.textMuted, fontFamily: fonts.regular }]}>
            account works across every product.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { paddingHorizontal: 24, paddingTop: 24, gap: 20 },
  banner: { borderRadius: 14, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 12 },
  bannerText: { fontSize: 14, lineHeight: 20 },
  fields: { gap: 16 },
  reveal: { paddingHorizontal: 12, paddingVertical: 10 },
  revealText: { fontSize: 14 },
  submit: { borderRadius: 16, minHeight: 56, alignItems: "center", justifyContent: "center" },
  submitRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  submitText: { fontSize: 16.5 },
  footer: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", justifyContent: "center", columnGap: 5 },
  footerText: { fontSize: 14 },
});
