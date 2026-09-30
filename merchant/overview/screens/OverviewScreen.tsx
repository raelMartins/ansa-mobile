import { ScrollView, StyleSheet, Text, View } from "react-native";
import { colors } from "../../../core/ui/theme";
import { useMerchant } from "../../MerchantContext";

function Row({ label, value }: { label: string; value: string | null | undefined }) {
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
  if (!merchant) {
    return null;
  }

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>{merchant.name}</Text>
      {merchant.category ? <Text style={styles.category}>{merchant.category}</Text> : null}

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Business profile</Text>
        <Row label="Description" value={merchant.description} />
        <Row label="Phone" value={merchant.phone} />
        <Row label="WhatsApp" value={merchant.whatsapp} />
        <Row label="Location" value={merchant.location} />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Storefront</Text>
        <Row label="Public slug" value={merchant.slug} />
        <Text style={styles.hint}>
          Your customer storefront lives on ansa web at /shop/{merchant.slug}. Share that link from WhatsApp or social.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 20, gap: 16, paddingBottom: 32 },
  heading: { fontSize: 26, fontWeight: "600", color: colors.text },
  category: { fontSize: 16, color: colors.accent, marginTop: -8 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    gap: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardTitle: { fontSize: 17, fontWeight: "600", color: colors.text, marginBottom: 4 },
  row: { gap: 2 },
  rowLabel: { fontSize: 13, color: colors.textMuted, textTransform: "uppercase", letterSpacing: 0.4 },
  rowValue: { fontSize: 16, color: colors.text, lineHeight: 22 },
  hint: { fontSize: 14, lineHeight: 20, color: colors.textMuted, marginTop: 4 },
});
