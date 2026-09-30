/**
 * Motion: header + cards FadeInDown stagger; quick actions subtle press scale via opacity.
 * Reduced motion: entering animations shorten via Reanimated system setting.
 */
import { Pressable, ScrollView, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { brand } from "../../../core/ui/brandColors";
import { useTheme } from "../../../core/ui/ThemeContext";
import { useThemedStyles } from "../../../core/ui/themedStyles";
import { useMerchant } from "../../MerchantContext";
import { MerchantCard } from "../../ui/MerchantCard";
import { MerchantScreenHeader } from "../../ui/MerchantScreenHeader";
import { SoonPill } from "../../ui/SoonPill";
import { merchantRadii } from "../../ui/merchantUi";

function DetailRow({ label, value }: { label: string; value: string }) {
  const styles = useThemedStyles((c, f) => ({
    row: { gap: 4 },
    label: {
      fontSize: 12,
      fontFamily: f.medium,
      color: c.textMuted,
      letterSpacing: 0.4,
      textTransform: "uppercase",
    },
    value: { fontSize: 16, fontFamily: f.regular, color: c.text, lineHeight: 22 },
  }));
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

function QuickAction({
  label,
  note,
  disabled,
  delay,
}: {
  label: string;
  note: string;
  disabled?: boolean;
  delay: number;
}) {
  const styles = useThemedStyles((c, f) => ({
    action: {
      flex: 1,
      minWidth: 140,
      padding: 14,
      borderRadius: merchantRadii.card,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.bg,
      gap: 6,
      opacity: disabled ? 0.72 : 1,
    },
    label: { fontSize: 15, fontFamily: f.semiBold, color: c.text },
    note: { fontSize: 13, fontFamily: f.regular, color: c.textMuted, lineHeight: 18 },
  }));

  return (
    <Animated.View entering={FadeInDown.delay(delay).duration(420).springify()}>
      <Pressable
        style={styles.action}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityState={{ disabled: !!disabled }}
      >
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.note}>{note}</Text>
        {disabled ? <SoonPill /> : null}
      </Pressable>
    </Animated.View>
  );
}

function SetupRow({ done, label }: { done: boolean; label: string }) {
  const { scheme } = useTheme();
  const styles = useThemedStyles((c, f) => ({
    row: { flexDirection: "row", alignItems: "center", gap: 12 },
    dot: {
      width: 22,
      height: 22,
      borderRadius: 11,
      borderWidth: 2,
      borderColor: done ? brand.forest : c.border,
      backgroundColor: done ? (scheme === "dark" ? brand.honey : brand.forest) : "transparent",
      alignItems: "center",
      justifyContent: "center",
    },
    check: { color: scheme === "dark" ? brand.forest : c.onAccent, fontSize: 12, fontFamily: f.semiBold },
    label: {
      flex: 1,
      fontSize: 15,
      fontFamily: f.regular,
      color: done ? c.textMuted : c.text,
      textDecorationLine: done ? "line-through" : "none",
    },
  }));

  return (
    <View style={styles.row}>
      <View style={styles.dot}>{done ? <Text style={styles.check}>✓</Text> : null}</View>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function weekdayLabel(): string {
  return new Date().toLocaleDateString("en-NG", { weekday: "long", day: "numeric", month: "short" });
}

export function OverviewScreen() {
  const { merchant } = useMerchant();
  const styles = useThemedStyles((c, f) => ({
    root: { flex: 1, backgroundColor: c.bg },
    content: { padding: 20, gap: 16, paddingBottom: 36 },
    actions: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
    cardBody: { gap: 14 },
    hint: { fontSize: 14, fontFamily: f.regular, lineHeight: 20, color: c.textMuted },
    slug: {
      fontSize: 15,
      fontFamily: f.medium,
      color: c.text,
      backgroundColor: c.bg,
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: merchantRadii.button,
      paddingHorizontal: 12,
      paddingVertical: 10,
    },
  }));

  if (!merchant) {
    return null;
  }

  const profileDone = Boolean(merchant.description && merchant.phone);
  const storefrontDone = Boolean(merchant.slug);

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <MerchantScreenHeader
        eyebrow={`${greeting()} · ${weekdayLabel()}`}
        title={merchant.name}
        subtitle={merchant.category ?? "Your merchant workspace"}
      />

      <View style={styles.actions}>
        <QuickAction label="Share storefront" note="Copy your shop link" disabled delay={80} />
        <QuickAction label="Add product" note="Catalog tab next" disabled delay={140} />
      </View>

      <MerchantCard title="Get set up" delay={200}>
        <View style={styles.cardBody}>
          <SetupRow done={profileDone} label="Complete your business profile" />
          <SetupRow done={storefrontDone} label="Storefront link is live" />
          <SetupRow done={false} label="Add your first product" />
        </View>
      </MerchantCard>

      <MerchantCard title="Business profile" delay={260}>
        <View style={styles.cardBody}>
          {merchant.description ? <DetailRow label="About" value={merchant.description} /> : null}
          {merchant.phone ? <DetailRow label="Phone" value={merchant.phone} /> : null}
          {merchant.whatsapp ? <DetailRow label="WhatsApp" value={merchant.whatsapp} /> : null}
          {merchant.location ? <DetailRow label="Location" value={merchant.location} /> : null}
          {!merchant.description && !merchant.phone && !merchant.whatsapp && !merchant.location ? (
            <Text style={styles.hint}>Add more details from Settings when it ships — your basics are saved.</Text>
          ) : null}
        </View>
      </MerchantCard>

      <MerchantCard title="Storefront" delay={320}>
        <Text style={styles.slug} selectable>/shop/{merchant.slug}</Text>
        <Text style={styles.hint}>
          Buyers open this link on the web — no app required. Share it on WhatsApp, Instagram, or anywhere you sell.
        </Text>
      </MerchantCard>
    </ScrollView>
  );
}
