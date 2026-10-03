/**
 * Motion: hero FadeInDown; product grid stagger (Standard).
 * Storefront preview — read-only public catalog; checkout/WhatsApp deferred.
 */
import { useMemo, useState } from "react";
import { Image, RefreshControl, ScrollView, Share, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { feedback } from "../../../core/feedback/feedback";
import { LoadingState, ErrorState } from "../../../core/ui/states";
import { SegmentedControl } from "../../../core/ui/SegmentedControl";
import { useTheme } from "../../../core/ui/ThemeContext";
import { useThemedStyles } from "../../../core/ui/themedStyles";
import { formatNairaFromKobo } from "../../lib/money";
import { resolveMediaUrl } from "../../lib/resolveMediaUrl";
import { getStorefrontUrl } from "../../lib/shopUrl";
import { useMerchant } from "../../MerchantContext";
import { useMerchantTabBarInset } from "../../shell/MerchantGlassTabBar";
import { InfoBanner } from "../../ui/InfoBanner";
import { MerchantPrimaryButton, MerchantSecondaryButton } from "../../ui/MerchantButtons";
import { merchantCardBackground, merchantRadii } from "../../ui/merchantUi";
import { useStorefrontPreview } from "../useStorefrontPreview";

export function StorefrontPreviewScreen() {
  const { merchant: activeMerchant } = useMerchant();
  const { state, reload } = useStorefrontPreview();
  const { colors, scheme } = useTheme();
  const tabBarInset = useMerchantTabBarInset();
  const [category, setCategory] = useState<string>("all");
  const [refreshing, setRefreshing] = useState(false);

  const styles = useThemedStyles((c, f) => ({
    root: { flex: 1, backgroundColor: c.bg },
    content: { padding: 20, gap: 16 },
    hero: {
      backgroundColor: "rgba(212, 220, 213, 0.55)",
      borderRadius: merchantRadii.card,
      padding: 20,
      gap: 8,
      borderWidth: 1,
      borderColor: c.border,
    },
    heroTag: { fontSize: 12, fontFamily: f.semiBold, color: c.textMuted, textTransform: "uppercase", letterSpacing: 0.6 },
    heroTitle: { fontSize: 26, fontFamily: f.bold, color: c.text, letterSpacing: -0.4 },
    heroBody: { fontSize: 15, fontFamily: f.regular, color: c.textMuted, lineHeight: 22 },
    heroMeta: { fontSize: 13, fontFamily: f.medium, color: c.textMuted, marginTop: 4 },
    grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
    tile: {
      width: "47%",
      backgroundColor: merchantCardBackground(scheme, c),
      borderRadius: merchantRadii.card,
      borderWidth: 1,
      borderColor: c.border,
      overflow: "hidden",
    },
    thumb: { width: "100%", aspectRatio: 1, backgroundColor: "rgba(147,160,151,0.2)" },
    tileBody: { padding: 10, gap: 4 },
    tileTitle: { fontSize: 14, fontFamily: f.semiBold, color: c.text },
    tilePrice: { fontSize: 14, fontFamily: f.medium, color: c.text },
    link: { fontSize: 13, fontFamily: f.regular, color: c.textMuted, lineHeight: 18 },
    footer: { fontSize: 12, fontFamily: f.regular, color: c.textMuted, textAlign: "center", lineHeight: 17 },
  }));

  const categories = useMemo(() => {
    if (state.kind !== "ready") return ["all"];
    const set = new Set<string>();
    for (const p of state.products) {
      if (p.category?.trim()) set.add(p.category.trim());
    }
    return ["all", ...Array.from(set).sort()];
  }, [state]);

  const products = useMemo(() => {
    if (state.kind !== "ready") return [];
    if (category === "all") return state.products;
    return state.products.filter((p) => p.category === category);
  }, [state, category]);

  if (state.kind === "loading") return <LoadingState label="Loading storefront…" />;
  if (state.kind === "error") return <ErrorState message={state.message} onRetry={() => void reload()} />;

  const shop = state.merchant;
  const shopUrl = activeMerchant ? getStorefrontUrl(activeMerchant.slug) : "";

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={[styles.content, { paddingBottom: tabBarInset }]}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            void reload().finally(() => setRefreshing(false));
          }}
          tintColor={colors.accent}
        />
      }
    >
      <Animated.View entering={FadeInDown.duration(420).springify()} style={styles.hero}>
        {shop.category ? <Text style={styles.heroTag}>{shop.category}</Text> : null}
        <Text style={styles.heroTitle}>{shop.name}</Text>
        {shop.description ? <Text style={styles.heroBody}>{shop.description}</Text> : null}
        <Text style={styles.heroMeta}>
          {[shop.location, shop.whatsapp ? "Usually replies on WhatsApp" : null].filter(Boolean).join(" · ")}
        </Text>
      </Animated.View>

      <Text style={styles.link} selectable>
        {shopUrl}
      </Text>
      <MerchantSecondaryButton
        label="Share shop link"
        onPress={() => {
          feedback.tap();
          void Share.share({ message: shopUrl, url: shopUrl });
        }}
      />

      {categories.length > 1 ? (
        <SegmentedControl
          options={categories.map((id) => ({ id, label: id === "all" ? "All pieces" : id }))}
          value={category}
          onChange={setCategory}
          accent={colors.accent}
          onAccent={colors.onAccent}
          trackColor="rgba(212, 220, 213, 0.55)"
          height={44}
        />
      ) : null}

      {products.length === 0 ? (
        <InfoBanner variant="warning">No published products yet. Publish items in Products to fill your storefront.</InfoBanner>
      ) : (
        <View style={styles.grid}>
          {products.map((p, i) => {
            const img = resolveMediaUrl(p.imageUrls[0]);
            return (
              <Animated.View key={p.id} entering={FadeInDown.delay(40 + i * 30).duration(380).springify()} style={styles.tile}>
                {img ? <Image source={{ uri: img }} style={styles.thumb} resizeMode="cover" /> : <View style={styles.thumb} />}
                <View style={styles.tileBody}>
                  <Text style={styles.tileTitle} numberOfLines={2}>{p.title}</Text>
                  <Text style={styles.tilePrice}>{formatNairaFromKobo(p.priceKobo)}</Text>
                </View>
              </Animated.View>
            );
          })}
        </View>
      )}

      <InfoBanner variant="success">
        Lagos delivery from ₦2,500 on delivery orders. Pickup is free when buyers choose pickup at checkout.
      </InfoBanner>

      <MerchantPrimaryButton label="Chat on WhatsApp" disabled onPress={() => undefined} />

      <Text style={styles.footer}>Secure checkout · Powered by your merchant workspace</Text>
    </ScrollView>
  );
}
