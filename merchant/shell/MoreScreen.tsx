import { Pressable, ScrollView, Switch, Text, View } from "react-native";
import { useTheme } from "../../core/ui/ThemeContext";
import { useThemedStyles } from "../../core/ui/themedStyles";
import { resetWelcomeFlow, resetWelcomeFlowAndSignOut } from "../../core/onboarding/onboardingStorage";
import { requestWelcomeReplay } from "../../experience/replay";
import { useSession } from "../../core/session/SessionContext";

const FUTURE = [
  { title: "Customers", note: "Order history by customer — coming soon." },
  { title: "Storefront", note: "Manage how buyers see your storefront — coming soon." },
  { title: "Social", note: "Publish catalog to social channels — coming soon." },
  { title: "WhatsApp", note: "Order notifications and buyer chat — coming soon." },
  { title: "Settings", note: "Business and account settings — coming soon." },
];

export function MoreScreen() {
  const { signOut } = useSession();
  const { scheme, setScheme, colors } = useTheme();
  const styles = useThemedStyles((c, f) => ({
    root: { flex: 1, backgroundColor: c.bg },
    content: { padding: 20, gap: 12, paddingBottom: 40 },
    heading: { fontSize: 22, fontFamily: f.semiBold, color: c.text, marginBottom: 8 },
    themeRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: c.border,
      gap: 12,
    },
    themeLabel: { fontSize: 17, fontFamily: f.medium, color: c.text },
    themeNote: { fontSize: 14, fontFamily: f.regular, color: c.textMuted, marginTop: 2 },
    row: {
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: c.border,
      gap: 4,
    },
    rowTitle: { fontSize: 17, fontFamily: f.medium, color: c.text },
    rowNote: { fontSize: 14, fontFamily: f.regular, color: c.textMuted, lineHeight: 20 },
    signOut: {
      marginTop: 24,
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 8,
      paddingVertical: 14,
      alignItems: "center",
      minHeight: 48,
      justifyContent: "center",
    },
    signOutText: { color: c.text, fontSize: 16, fontFamily: f.semiBold },
    devBtn: {
      marginTop: 12,
      borderRadius: 8,
      paddingVertical: 12,
      paddingHorizontal: 14,
      borderWidth: 1,
      borderColor: c.border,
      alignItems: "center",
    },
    devText: { color: c.textMuted, fontSize: 14, fontFamily: f.medium },
  }));

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>More</Text>

      <View style={styles.themeRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.themeLabel}>Dark mode</Text>
          <Text style={styles.themeNote}>Warm light is the default</Text>
        </View>
        <Switch
          value={scheme === "dark"}
          onValueChange={(dark) => setScheme(dark ? "dark" : "light")}
          trackColor={{ false: colors.border, true: colors.accent }}
          thumbColor={scheme === "dark" ? colors.onAccent : colors.surface}
        />
      </View>

      {FUTURE.map((item) => (
        <View key={item.title} style={styles.row}>
          <Text style={styles.rowTitle}>{item.title}</Text>
          <Text style={styles.rowNote}>{item.note}</Text>
        </View>
      ))}
      {__DEV__ ? (
        <>
          <Pressable
            style={styles.devBtn}
            onPress={() => {
              void resetWelcomeFlow().then(() => requestWelcomeReplay());
            }}
            accessibilityRole="button"
          >
            <Text style={styles.devText}>Replay welcome flow (dev)</Text>
          </Pressable>
          <Pressable
            style={styles.devBtn}
            onPress={() => {
              void resetWelcomeFlowAndSignOut(() => signOut()).then(() => requestWelcomeReplay());
            }}
            accessibilityRole="button"
          >
            <Text style={styles.devText}>Sign out & replay from splash (dev)</Text>
          </Pressable>
        </>
      ) : null}
      <Pressable style={styles.signOut} onPress={() => void signOut()} accessibilityRole="button">
        <Text style={styles.signOutText}>Sign out</Text>
      </Pressable>
    </ScrollView>
  );
}
