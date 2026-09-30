/**
 * Motion: section cards FadeInDown; rows static; sign-out press opacity.
 * Reduced motion: Reanimated entering respects system preference.
 */
import { Pressable, ScrollView, Switch, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useTheme } from "../../core/ui/ThemeContext";
import { useThemedStyles } from "../../core/ui/themedStyles";
import { resetWelcomeFlow, resetWelcomeFlowAndSignOut } from "../../core/onboarding/onboardingStorage";
import { requestWelcomeReplay } from "../../experience/replay";
import { useSession } from "../../core/session/SessionContext";
import { MerchantCard } from "../ui/MerchantCard";
import { MerchantScreenHeader } from "../ui/MerchantScreenHeader";
import { SoonPill } from "../ui/SoonPill";
import { merchantRadii } from "../ui/merchantUi";

const FUTURE = [
  { title: "Customers", note: "Order history by buyer" },
  { title: "Storefront", note: "Theme and public shop page" },
  { title: "Social", note: "Publish catalog to channels" },
  { title: "WhatsApp", note: "Orders and buyer updates" },
  { title: "Settings", note: "Business and account" },
];

function MenuRow({ title, note }: { title: string; note: string }) {
  const styles = useThemedStyles((c, f) => ({
    row: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: c.border,
    },
    textWrap: { flex: 1, gap: 2 },
    title: { fontSize: 16, fontFamily: f.semiBold, color: c.text },
    note: { fontSize: 14, fontFamily: f.regular, color: c.textMuted, lineHeight: 19 },
    chevron: { fontSize: 18, color: c.textMuted, fontFamily: f.regular },
  }));

  return (
    <View style={styles.row}>
      <View style={styles.textWrap}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.note}>{note}</Text>
      </View>
      <SoonPill />
      <Text style={styles.chevron} accessibilityElementsHidden>›</Text>
    </View>
  );
}

export function MoreScreen() {
  const { signOut } = useSession();
  const { scheme, setScheme, colors } = useTheme();
  const styles = useThemedStyles((c, f) => ({
    root: { flex: 1, backgroundColor: c.bg },
    content: { padding: 20, gap: 16, paddingBottom: 44 },
    themeRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
    },
    themeLabel: { fontSize: 16, fontFamily: f.semiBold, color: c.text },
    themeNote: { fontSize: 14, fontFamily: f.regular, color: c.textMuted, marginTop: 4, lineHeight: 19 },
    signOut: {
      marginTop: 8,
      borderWidth: 1.5,
      borderColor: c.border,
      borderRadius: merchantRadii.button,
      paddingVertical: 15,
      alignItems: "center",
      minHeight: 52,
      justifyContent: "center",
      backgroundColor: c.bg,
    },
    signOutPressed: { opacity: 0.85 },
    signOutText: { color: c.text, fontSize: 16, fontFamily: f.semiBold },
    devBtn: {
      borderRadius: merchantRadii.button,
      paddingVertical: 12,
      paddingHorizontal: 14,
      borderWidth: 1,
      borderColor: c.border,
      alignItems: "center",
      borderStyle: "dashed",
    },
    devText: { color: c.textMuted, fontSize: 13, fontFamily: f.medium },
    devBlock: { gap: 10, marginTop: 4 },
  }));

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <MerchantScreenHeader title="More" subtitle="Preferences and tools for your merchant workspace." />

      <MerchantCard title="Appearance" delay={80}>
        <View style={styles.themeRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.themeLabel}>Dark mode</Text>
            <Text style={styles.themeNote}>Warm light is the default for selling during the day.</Text>
          </View>
          <Switch
            value={scheme === "dark"}
            onValueChange={(dark) => setScheme(dark ? "dark" : "light")}
            trackColor={{ false: colors.border, true: colors.accent }}
            thumbColor={scheme === "dark" ? colors.onAccent : colors.surface}
          />
        </View>
      </MerchantCard>

      <MerchantCard title="Workspace" delay={140}>
        {FUTURE.map((item) => (
          <MenuRow key={item.title} title={item.title} note={item.note} />
        ))}
      </MerchantCard>

      {__DEV__ ? (
        <Animated.View entering={FadeInDown.delay(200).duration(400)} style={styles.devBlock}>
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
        </Animated.View>
      ) : null}

      <Animated.View entering={FadeInDown.delay(260).duration(420)}>
        <Pressable
          style={({ pressed }) => [styles.signOut, pressed && styles.signOutPressed]}
          onPress={() => void signOut()}
          accessibilityRole="button"
        >
          <Text style={styles.signOutText}>Sign out</Text>
        </Pressable>
      </Animated.View>
    </ScrollView>
  );
}
