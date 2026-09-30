import { useEffect, useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextStyle,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { errorMessage } from "../../../core/api/errors";
import { Field, PrimaryButton } from "../../../core/ui/form";
import { Wordmark } from "../../../core/ui/Wordmark";
import { useThemedStyles } from "../../../core/ui/themedStyles";
import { useSession } from "../../../core/session/SessionContext";
import { createMerchant, updateMerchant } from "../../api/merchant";
import { useMerchant } from "../../MerchantContext";
import type { Merchant } from "../../types";

const CATEGORIES = ["Fashion", "Beauty", "Food & drink", "Home & living", "Electronics", "Art & crafts", "Services", "Other"];

type Props = {
  existingMerchant: Merchant | null;
  onComplete: () => void;
};

export function CreateShopScreen({ existingMerchant, onComplete }: Props) {
  const styles = useThemedStyles((c, f) => ({
    root: { flex: 1, backgroundColor: c.bg },
    scroll: { flexGrow: 1, padding: 24, paddingTop: 40, gap: 16 },
    brand: { marginBottom: 16 },
    title: { fontSize: 26, fontFamily: f.semiBold, color: c.text },
    subtitle: { fontSize: 16, fontFamily: f.regular, lineHeight: 22, color: c.textMuted, marginBottom: 8 },
    formError: { color: c.error, fontSize: 15, fontFamily: f.regular },
    label: { color: c.text, fontSize: 15, fontFamily: f.medium, marginBottom: 8 },
    chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
    chip: {
      borderWidth: 1,
      borderColor: c.border,
      color: c.textMuted,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 20,
      fontSize: 14,
      fontFamily: f.regular,
    },
    chipSelected: {
      borderColor: c.accent,
      color: c.text,
      backgroundColor: c.surface,
    },
    fieldError: { color: c.error, fontSize: 13, fontFamily: f.regular, marginTop: 6 },
  }));

  const { api } = useSession();
  const { setMerchant } = useMerchant();
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [phone, setPhone] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!existingMerchant) return;
    setName(existingMerchant.name);
    setCategory(existingMerchant.category ?? "");
    setPhone(existingMerchant.phone ?? "");
  }, [existingMerchant]);

  function validate(): boolean {
    const next: Record<string, string> = {};
    if (!name.trim()) next.name = "Business name is required";
    if (!category.trim()) next.category = "Choose a category";
    if (phone.trim().length < 7) next.phone = "Enter a valid phone number";
    setFieldErrors(next);
    return Object.keys(next).length === 0;
  }

  async function onSubmit() {
    Keyboard.dismiss();
    if (!validate()) return;

    setBusy(true);
    setFormError(null);
    const body = {
      name: name.trim(),
      category: category.trim(),
      phone: phone.trim(),
      whatsapp: phone.trim(),
      onboardingCompleted: true,
    };

    try {
      if (existingMerchant) {
        const merchant = await updateMerchant(api, existingMerchant.id, body);
        setMerchant(merchant);
      } else {
        const merchant = await createMerchant(api, body);
        setMerchant(merchant);
      }
      onComplete();
    } catch (err) {
      setFormError(errorMessage(err, "Could not save your business"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.brand}>
            <Wordmark height={17} />
          </View>
          <Text style={styles.title}>{existingMerchant ? "Finish setup" : "Set up your business"}</Text>
          <Text style={styles.subtitle}>
            {existingMerchant
              ? "Complete your profile to open the merchant dashboard."
              : "Create your business on ansa. You can add more details later."}
          </Text>

          {formError ? <Text style={styles.formError}>{formError}</Text> : null}

          <Field
            label="Business name"
            error={fieldErrors.name}
            inputProps={{ value: name, onChangeText: setName, editable: !busy }}
          />

          <View>
            <Text style={styles.label}>Category</Text>
            <View style={styles.chips}>
              {CATEGORIES.map((c) => (
                <PrimaryChip
                  key={c}
                  label={c}
                  selected={category === c}
                  onPress={() => setCategory(c)}
                  disabled={busy}
                  baseStyle={styles.chip}
                  selectedStyle={styles.chipSelected}
                />
              ))}
            </View>
            {fieldErrors.category ? <Text style={styles.fieldError}>{fieldErrors.category}</Text> : null}
          </View>

          <Field
            label="Phone"
            hint="Customers can reach you on this number"
            error={fieldErrors.phone}
            inputProps={{
              value: phone,
              onChangeText: setPhone,
              keyboardType: "phone-pad",
              editable: !busy,
            }}
          />

          <PrimaryButton
            label={existingMerchant ? "Continue to dashboard" : "Create business"}
            onPress={() => void onSubmit()}
            loading={busy}
          />
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

function PrimaryChip({
  label,
  selected,
  onPress,
  disabled,
  baseStyle,
  selectedStyle,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  disabled?: boolean;
  baseStyle: TextStyle;
  selectedStyle: TextStyle;
}) {
  return (
    <Text
      onPress={disabled ? undefined : onPress}
      style={[baseStyle, selected && selectedStyle]}
      accessibilityRole="button"
    >
      {label}
    </Text>
  );
}
