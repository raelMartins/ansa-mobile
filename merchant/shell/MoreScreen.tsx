/**
 * Motion: section cards FadeInDown; theme toggle indicator springs; product switcher is a
 * spring bottom sheet (see ProductSwitcherSheet); sign-out press opacity.
 * Reduced motion: Reanimated entering respects system preference.
 */
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { withAlpha } from "../../core/brand/color";
import { feedback } from "../../core/feedback/feedback";
import { useOnboarding } from "../../core/onboarding/OnboardingContext";
import { ProductSwitcherSheet } from "../../core/products/ProductSwitcherSheet";
import { getProduct } from "../../core/products/catalog";
import { useSession } from "../../core/session/SessionContext";
import { BrandIcon } from "../../core/ui/BrandIcon";
import { SegmentedControl } from "../../core/ui/SegmentedControl";
import { useTheme } from "../../core/ui/ThemeContext";
import type { ThemePreference } from "../../core/ui/theme";
import { useThemedStyles } from "../../core/ui/themedStyles";
import { MerchantCard } from "../ui/MerchantCard";
import { MerchantScreenHeader } from "../ui/MerchantScreenHeader";
import type { MoreStackParamList } from "../../core/navigation/types";
import { SoonPill } from "../ui/SoonPill";
import { merchantRadii } from "../ui/merchantUi";
import { useMerchantTabBarInset } from "./MerchantGlassTabBar";

const FUTURE = [
  { title: "Social", note: "Publish catalog to channels" },
  { title: "WhatsApp", note: "Orders and buyer updates" },
  { title: "Settings", note: "Business and account" },
];

const APPEARANCE: { id: ThemePreference; label: string }[] = [
  { id: "light", label: "Light" },
  { id: "dark", label: "Dark" },
  { id: "system", label: "System" },
];

function MenuRow({
  title,
  note,
  onPress,
  soon,
}: {
  title: string;
  note: string;
  onPress?: () => void;
  soon?: boolean;
}) {
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

  const body = (
    <>
      <View style={styles.textWrap}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.note}>{note}</Text>
      </View>
      {soon ? <SoonPill /> : null}
      <Text style={styles.chevron} accessibilityElementsHidden>›</Text>
    </>
  );

  if (onPress) {
    return (
      <Pressable
        style={styles.row}
        onPress={() => {
          feedback.tap();
          onPress();
        }}
        accessibilityRole="button"
      >
        {body}
      </Pressable>
    );
  }

  return <View style={styles.row}>{body}</View>;
}

type MoreNav = NativeStackNavigationProp<MoreStackParamList, "MoreMenu">;

export function MoreScreen() {
  const navigation = useNavigation<MoreNav>();
  const { signOut } = useSession();
  const { scheme, preference, setPreference, colors } = useTheme();
  const { selectedProduct, selectProduct, replayWelcome } = useOnboarding();
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const product = getProduct(selectedProduct ?? "merchant");
  const tabBarInset = useMerchantTabBarInset();

  const styles = useThemedStyles((c, f) => ({
    root: { flex: 1, backgroundColor: c.bg },
    content: { padding: 20, gap: 16 },
    productRow: { flexDirection: "row", alignItems: "center", gap: 14 },
    productBadge: {
      width: 52,
      height: 52,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
    },
    productText: { flex: 1, gap: 2 },
    productName: { fontSize: 17, fontFamily: f.semiBold, color: c.text },
    productNote: { fontSize: 14, fontFamily: f.regular, color: c.textMuted, lineHeight: 19 },
    switchBtn: {
      borderRadius: 999,
      paddingHorizontal: 16,
      paddingVertical: 10,
      minHeight: 40,
      justifyContent: "center",
    },
    switchText: { fontSize: 14, fontFamily: f.semiBold, color: c.accent },
    themeNote: { fontSize: 14, fontFamily: f.regular, color: c.textMuted, lineHeight: 19 },
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
    <ScrollView
      style={styles.root}
      contentContainerStyle={[styles.content, { paddingBottom: tabBarInset }]}
      showsVerticalScrollIndicator={false}
    >
      <MerchantScreenHeader title="More" subtitle="Preferences and tools for your merchant workspace." />

      <MerchantCard title="Product" delay={60}>
        <View style={styles.productRow}>
          <View style={[styles.productBadge, { backgroundColor: product.primary }]}>
            <BrandIcon width={32} variant="mono" color={product.onPrimary} />
          </View>
          <View style={styles.productText}>
            <Text style={styles.productName}>{product.label}</Text>
            <Text style={styles.productNote}>{product.tagline}</Text>
          </View>
          <Pressable
            onPress={() => {
              feedback.tap();
              setSwitcherOpen(true);
            }}
            style={({ pressed }) => [
              styles.switchBtn,
              { backgroundColor: withAlpha(colors.accent, pressed ? 0.2 : 0.12) },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Switch product"
          >
            <Text style={styles.switchText}>Switch</Text>
          </Pressable>
        </View>
      </MerchantCard>

      <MerchantCard title="Appearance" delay={120}>
        <SegmentedControl
          options={APPEARANCE}
          value={preference}
          onChange={setPreference}
          accent={colors.accent}
          onAccent={colors.onAccent}
          trackColor={scheme === "dark" ? colors.inputBg : withAlpha(colors.accent, 0.07)}
          height={46}
          accessibilityLabel="Appearance"
        />
        <Text style={styles.themeNote}>Light is the default. System follows your phone’s setting.</Text>
      </MerchantCard>

      <MerchantCard title="Workspace" delay={180}>
        <MenuRow
          title="Storefront"
          note="Preview your public shop page"
          onPress={() => navigation.navigate("StorefrontPreview")}
        />
        {FUTURE.map((item) => (
          <MenuRow key={item.title} title={item.title} note={item.note} soon />
        ))}
      </MerchantCard>

      {__DEV__ ? (
        <Animated.View entering={FadeInDown.delay(220).duration(400)} style={styles.devBlock}>
          <Pressable style={styles.devBtn} onPress={() => void replayWelcome()} accessibilityRole="button">
            <Text style={styles.devText}>Replay welcome flow (dev)</Text>
          </Pressable>
          <Pressable
            style={styles.devBtn}
            onPress={() => {
              void signOut().then(() => replayWelcome());
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

      <ProductSwitcherSheet
        visible={switcherOpen}
        currentId={product.id}
        onClose={() => setSwitcherOpen(false)}
        onSwitch={(next) => {
          setSwitcherOpen(false);
          void selectProduct(next.id);
        }}
      />
    </ScrollView>
  );
}
