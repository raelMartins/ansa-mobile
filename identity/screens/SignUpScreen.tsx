import { useState } from "react";
import { Keyboard, Text, TouchableWithoutFeedback, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { ApiError } from "../../core/api/errors";
import { errorMessage } from "../../core/api/errors";
import { AuthShell } from "../../core/ui/AuthShell";
import { BrandInline } from "../../core/ui/BrandInline";
import { Field, PrimaryButton, TextLink } from "../../core/ui/form";
import { useThemedStyles } from "../../core/ui/themedStyles";
import { useSession } from "../../core/session/SessionContext";
import type { AuthStackParamList } from "../../core/navigation/types";
import { signUp } from "../api/auth";
import { validateEmail, validatePassword } from "../credentials";

type Props = NativeStackScreenProps<AuthStackParamList, "SignUp">;

export function SignUpScreen({ navigation }: Props) {
  const styles = useThemedStyles((c, f) => ({
    header: { gap: 6, marginBottom: 4 },
    title: { fontSize: 26, fontFamily: f.semiBold, color: c.text },
    subtitle: { fontSize: 15, fontFamily: f.regular, lineHeight: 21, color: c.textMuted },
    formError: { color: c.error, fontSize: 15, fontFamily: f.regular },
  }));
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
    <AuthShell>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={{ gap: 14 }}>
          <View style={styles.header}>
            <Text style={styles.title}>Create account</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 6 }}>
              <Text style={styles.subtitle}>One</Text>
              <BrandInline height={14} />
              <Text style={styles.subtitle}>ID for merchant, jobs, delivery, and more.</Text>
            </View>
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
        </View>
      </TouchableWithoutFeedback>
    </AuthShell>
  );
}
