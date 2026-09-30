import { ScrollView, Text, View } from "react-native";
import { useThemedStyles } from "../../../core/ui/themedStyles";
import { useMerchant } from "../../MerchantContext";

function Row({
  label,
  value,
  styles,
}: {
  label: string;
  value: string | null | undefined;
  styles: ReturnType<typeof useThemedStyles>;
}) {
  if (!value) return null;
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

export function OverviewScreen() {
  const { merchant } = useMerchant();
  const styles = useThemedStyles((c, f) => ({
    root: { flex: 1, backgroundColor: c.bg },
    content: { padding: 20, gap: 16, paddingBottom: 32 },
    heading: { fontSize: 26, fontFamily: f.semiBold, color: c.text },
    category: { fontSize: 16, fontFamily: f.regular, color: c.accent, marginTop: -8 },
    card: {
      backgroundColor: c.surface,
      borderRadius: 12,
      padding: 16,
      gap: 10,
      borderWidth: 1,
      borderColor: c.border,
    },
    cardTitle: { fontSize: 17, fontFamily: f.semiBold, color: c.text, marginBottom: 4 },
    row: { gap: 2 },
    rowLabel: {
      fontSize: 13,
      fontFamily: f.medium,
      color: c.textMuted,
      textTransform: "uppercase",
      letterSpacing: 0.4,
    },
    rowValue: { fontSize: 16, fontFamily: f.regular, color: c.text, lineHeight: 22 },
    hint: { fontSize: 14, fontFamily: f.regular, lineHeight: 20, color: c.textMuted, marginTop: 4 },
  }));

  if (!merchant) {
    return null;
  }

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>{merchant.name}</Text>
      {merchant.category ? <Text style={styles.category}>{merchant.category}</Text> : null}

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Business profile</Text>
        <Row label="Description" value={merchant.description} styles={styles} />
        <Row label="Phone" value={merchant.phone} styles={styles} />
        <Row label="WhatsApp" value={merchant.whatsapp} styles={styles} />
        <Row label="Location" value={merchant.location} styles={styles} />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Storefront</Text>
        <Row label="Public slug" value={merchant.slug} styles={styles} />
        <Text style={styles.hint}>
          Your customer storefront lives on ansa merchant web at /shop/{merchant.slug}. Share that link from WhatsApp or social.
        </Text>
      </View>
    </ScrollView>
  );
}
