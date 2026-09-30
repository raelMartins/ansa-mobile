import { useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { ApiError } from "../../core/api/errors";
import { errorMessage } from "../../core/api/errors";
import { Field, PrimaryButton, TextLink } from "../../core/ui/form";
import { colors } from "../../core/ui/theme";
import { useSession } from "../../core/session/SessionContext";
import type { AuthStackParamList } from "../../core/navigation/types";
import { signUp } from "../api/auth";
import { validateEmail, validatePassword } from "../credentials";

type Props = NativeStackScreenProps<AuthStackParamList, "SignUp">;

export function SignUpScreen({ navigation }: Props) {
  const { api, establishSession } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit() {
    Keyboard.dismiss();
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password, true);
    setFieldErrors({ email: emailError ?? undefined, password: passwordError ?? undefined });
    if (emailError || passwordError) return;

    setBusy(true);
    setFormError(null);
    try {
      const result = await signUp(api, { email, password });
      await establishSession({
        accessToken: result.tokens.accessToken,
        refreshToken: result.tokens.refreshToken,
      });
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setFormError("An account with this email already exists.");
      } else if (err instanceof ApiError && err.status === 0) {
        setFormError(err.message);
      } else {
        setFormError(errorMessage(err, "Could not create your account"));
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Text style={styles.title}>Create account</Text>
            <Text style={styles.subtitle}>One ansa identity for your business.</Text>
          </View>

          {formError ? <Text style={styles.formError}>{formError}</Text> : null}

          <Field
            label="Email"
            error={fieldErrors.email}
            inputProps={{
              value: email,
              onChangeText: setEmail,
              autoCapitalize: "none",
              keyboardType: "email-address",
              textContentType: "emailAddress",
              editable: !busy,
            }}
          />

          <Field
            label="Password"
            hint="At least 8 characters"
            error={fieldErrors.password}
            inputProps={{
              value: password,
              onChangeText: setPassword,
              secureTextEntry: !showPassword,
              textContentType: "newPassword",
              editable: !busy,
            }}
          />
          <TextLink
            label={showPassword ? "Hide password" : "Show password"}
            onPress={() => setShowPassword((v) => !v)}
          />

          <PrimaryButton label="Create account" onPress={() => void onSubmit()} loading={busy} />

          <TextLink label="Already have an account? Sign in" onPress={() => navigation.navigate("SignIn")} />
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  scroll: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 48,
    gap: 16,
  },
  header: {
    marginBottom: 8,
    gap: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: "600",
    color: colors.text,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 22,
    color: colors.textMuted,
  },
  formError: {
    color: colors.error,
    fontSize: 15,
    marginBottom: 4,
  },
});
