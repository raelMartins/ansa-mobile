/**
 * Motion: header FadeInDown; hero icon scale-in; feature rows stagger FadeInDown.
 * Reduced motion: Reanimated respects system setting for entering animations.
 */
import type { ReactNode } from "react";
import { ScrollView, Text, View } from "react-native";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import Svg, { Circle, Path, Rect } from "react-native-svg";
import { brand } from "../../core/ui/brandColors";
import { useTheme } from "../../core/ui/ThemeContext";
import { useThemedStyles } from "../../core/ui/themedStyles";
import { MerchantCard } from "../ui/MerchantCard";
import { MerchantScreenHeader } from "../ui/MerchantScreenHeader";
import { SoonPill } from "../ui/SoonPill";
import { merchantRadii } from "../ui/merchantUi";
import { useMerchantTabBarInset } from "./MerchantGlassTabBar";

type ModuleKey = "products" | "orders";

const COPY: Record<
  ModuleKey,
  { title: string; subtitle: string; features: string[]; icon: (color: string) => ReactNode }
> = {
  products: {
    title: "Products",
    subtitle: "Your catalog, photos, and prices — built for quick edits on the go.",
    features: [
      "Add items with photos and variants",
      "Organize collections for your storefront",
      "Share product links on WhatsApp",
    ],
    icon: (color) => (
      <Svg width={72} height={72} viewBox="0 0 72 72">
        <Rect x="14" y="18" width="44" height="36" rx="6" stroke={color} strokeWidth={2.2} fill="none" />
        <Path d="M14 28 H58" stroke={color} strokeWidth={2} />
        <Rect x="22" y="36" width="14" height="14" rx="3" fill={color} opacity={0.25} />
        <Rect x="40" y="36" width="14" height="14" rx="3" fill={color} opacity={0.25} />
      </Svg>
    ),
  },
  orders: {
    title: "Orders",
    subtitle: "See new sales, update status, and keep buyers in the loop.",
    features: [
      "Live order feed with buyer details",
      "Mark paid, packed, and delivered",
      "Notifications aligned with WhatsApp selling",
    ],
    icon: (color) => (
      <Svg width={72} height={72} viewBox="0 0 72 72">
        <Rect x="16" y="14" width="40" height="48" rx="6" stroke={color} strokeWidth={2.2} fill="none" />
        <Path d="M24 10 H48 V18 H24 Z" stroke={color} strokeWidth={2} strokeLinejoin="round" fill="none" />
        <Path d="M24 32 H48" stroke={color} strokeWidth={2} strokeLinecap="round" />
        <Path d="M24 42 H40" stroke={color} strokeWidth={2} strokeLinecap="round" />
        <Circle cx="48" cy="46" r="8" fill={brand.honey} opacity={0.85} />
      </Svg>
    ),
  },
};

type Props = { module: ModuleKey };

export function ModuleComingSoonScreen({ module }: Props) {
  const { colors } = useTheme();
  const meta = COPY[module];
  const tabBarInset = useMerchantTabBarInset();
  const styles = useThemedStyles((c, f) => ({
    root: { flex: 1, backgroundColor: c.bg },
    content: { padding: 20, gap: 16 },
    hero: {
      alignItems: "center",
      paddingVertical: 20,
      gap: 12,
    },
    heroIcon: {
      width: 112,
      height: 112,
      borderRadius: merchantRadii.card,
      backgroundColor: c.bg,
      borderWidth: 1,
      borderColor: c.border,
      alignItems: "center",
      justifyContent: "center",
    },
    statusRow: { flexDirection: "row", alignItems: "center", gap: 10 },
    statusText: { fontSize: 15, fontFamily: f.medium, color: c.textMuted },
    featureRow: { flexDirection: "row", gap: 12, alignItems: "flex-start" },
    bullet: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: brand.honey,
      marginTop: 7,
    },
    featureText: { flex: 1, fontSize: 15, fontFamily: f.regular, color: c.text, lineHeight: 22 },
    foot: {
      fontSize: 14,
      fontFamily: f.regular,
      color: c.textMuted,
      lineHeight: 20,
      textAlign: "center",
      marginTop: 8,
    },
  }));

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={[styles.content, { paddingBottom: tabBarInset }]}
      showsVerticalScrollIndicator={false}
    >
      <MerchantScreenHeader title={meta.title} subtitle={meta.subtitle} />
      <Animated.View entering={FadeIn.delay(120).duration(500)} style={styles.hero}>
        <View style={styles.heroIcon}>{meta.icon(colors.text)}</View>
        <View style={styles.statusRow}>
          <SoonPill />
          <Text style={styles.statusText}>In active development</Text>
        </View>
      </Animated.View>
      <MerchantCard title="What you'll get" delay={180}>
        {meta.features.map((line, i) => (
          <Animated.View
            key={line}
            entering={FadeInDown.delay(220 + i * 60).duration(400).springify()}
            style={styles.featureRow}
          >
            <View style={styles.bullet} />
            <Text style={styles.featureText}>{line}</Text>
          </Animated.View>
        ))}
      </MerchantCard>
      <Text style={styles.foot}>Overview is live today. We'll enable this tab as soon as the mobile slice ships.</Text>
    </ScrollView>
  );
}
