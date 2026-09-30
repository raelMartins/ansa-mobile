import { useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { ApiError } from "../../core/api/errors";
import { errorMessage } from "../../core/api/errors";
import { Field, PrimaryButton, TextLink } from "../../core/ui/form";
import { useThemedStyles } from "../../core/ui/themedStyles";
import { useSession } from "../../core/session/SessionContext";
import type { AuthStackParamList } from "../../core/navigation/types";
import { signIn } from "../api/auth";
import { parseLoginIdentifier, validatePassword } from "../credentials";

type Props = NativeStackScreenProps<AuthStackParamList, "SignIn">;

export function SignInScreen({ navigation }: Props) {
  const styles = useThemedStyles((c, f) => ({
    root: { flex: 1, backgroundColor: c.bg },
    scroll: { flexGrow: 1, padding: 24, paddingTop: 48, gap: 16 },
    header: { marginBottom: 8, gap: 8 },
    title: { fontSize: 28, fontFamily: f.semiBold, color: c.text },
    subtitle: { fontSize: 16, fontFamily: f.regular, lineHeight: 22, color: c.textMuted },
    formError: { color: c.error, fontSize: 15, fontFamily: f.regular, marginBottom: 4 },
  }));
  const { api, establishSession } = useSession();
  const [credential, setCredential] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ credential?: string; password?: string }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit() {
    Keyboard.dismiss();
    const id = parseLoginIdentifier(credential);
    const passwordError = validatePassword(password);
    const credentialError = id ? null : "Enter your email or phone number";
    setFieldErrors({ credential: credentialError ?? undefined, password: passwordError ?? undefined });
    if (!id || passwordError) return;

    setBusy(true);
    setFormError(null);
    try {
      const result = await signIn(api, { ...id, password });
      await establishSession({
        accessToken: result.tokens.accessToken,
        refreshToken: result.tokens.refreshToken,
      });
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setFormError("Invalid email or password.");
      } else if (err instanceof ApiError && err.status === 0) {
        setFormError(err.message);
      } else {
        setFormError(errorMessage(err, "Could not sign in"));
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
            <Text style={styles.title}>Sign in</Text>
            <Text style={styles.subtitle}>Use your ansa account to manage your business.</Text>
          </View>

          {formError ? <Text style={styles.formError}>{formError}</Text> : null}

          <Field
            label="Email or phone"
            hint="Same as on ansa shop web"
            error={fieldErrors.credential}
            inputProps={{
              value: credential,
              onChangeText: setCredential,
              autoCapitalize: "none",
              autoCorrect: false,
              keyboardType: "email-address",
              textContentType: "username",
              editable: !busy,
            }}
          />

          <Field
            label="Password"
            error={fieldErrors.password}
            inputProps={{
              value: password,
              onChangeText: setPassword,
              secureTextEntry: !showPassword,
              textContentType: "password",
              editable: !busy,
            }}
          />
          <TextLink
            label={showPassword ? "Hide password" : "Show password"}
            onPress={() => setShowPassword((v) => !v)}
          />

          <PrimaryButton label="Sign in" onPress={() => void onSubmit()} loading={busy} />

          <TextLink label="Create an account" onPress={() => navigation.navigate("SignUp")} />
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

