import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { colors } from "../../core/ui/theme";
import { useSession } from "../../core/session/SessionContext";

const FUTURE = [
  { title: "Customers", note: "Order history by customer — coming soon." },
  { title: "Storefront", note: "Manage how buyers see your shop — coming soon." },
  { title: "Social", note: "Publish catalog to social channels — coming soon." },
  { title: "WhatsApp", note: "Order notifications and buyer chat — coming soon." },
  { title: "Settings", note: "Business and account settings — coming soon." },
];

export function MoreScreen() {
  const { signOut } = useSession();

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>More</Text>
      {FUTURE.map((item) => (
        <View key={item.title} style={styles.row}>
          <Text style={styles.rowTitle}>{item.title}</Text>
          <Text style={styles.rowNote}>{item.note}</Text>
        </View>
      ))}
      <Pressable style={styles.signOut} onPress={() => void signOut()} accessibilityRole="button">
        <Text style={styles.signOutText}>Sign out</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 20, gap: 12, paddingBottom: 40 },
  heading: { fontSize: 22, fontWeight: "600", color: colors.text, marginBottom: 8 },
  row: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 4,
  },
  rowTitle: { fontSize: 17, color: colors.text, fontWeight: "500" },
  rowNote: { fontSize: 14, color: colors.textMuted, lineHeight: 20 },
  signOut: {
    marginTop: 24,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    minHeight: 48,
    justifyContent: "center",
  },
  signOutText: { color: colors.text, fontSize: 16, fontWeight: "600" },
});
