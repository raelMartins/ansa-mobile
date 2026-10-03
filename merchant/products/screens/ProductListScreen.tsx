/**
 * Motion: list FadeInDown stagger; filter uses SegmentedControl spring.
 * Loading: skeleton rows; error: inline retry.
 */
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useCallback, useMemo, useState } from "react";
import { Image, Pressable, RefreshControl, ScrollView, Text, TextInput, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useNetworkStatus } from "../../../core/network/useNetworkStatus";
import type { ProductsStackParamList } from "../../../core/navigation/types";
import { SegmentedControl } from "../../../core/ui/SegmentedControl";
import { useTheme } from "../../../core/ui/ThemeContext";
import { useThemedStyles } from "../../../core/ui/themedStyles";
import { useMerchant } from "../../MerchantContext";
import { formatNairaFromKobo } from "../../lib/money";
import { resolveMediaUrl } from "../../lib/resolveMediaUrl";
import { InfoBanner } from "../../ui/InfoBanner";
import { OfflineBanner } from "../../ui/OfflineBanner";
import { MerchantPrimaryButton } from "../../ui/MerchantButtons";
import { merchantRadii } from "../../ui/merchantUi";
import { filterCounts, filterProducts, type ProductFilter } from "../productFilters";
import { useProducts } from "../useProducts";
import { useMerchantTabBarInset } from "../../shell/MerchantGlassTabBar";

type Nav = NativeStackNavigationProp<ProductsStackParamList, "ProductList">;

export function ProductListScreen() {
  const navigation = useNavigation<Nav>();
  const { isOffline, isReady: networkReady } = useNetworkStatus();
  const { colors, fonts } = useTheme();
  const { state, reload } = useProducts();
  const tabBarInset = useMerchantTabBarInset();

  useFocusEffect(
    useCallback(() => {
      void reload();
    }, [reload]),
  );
  const [filter, setFilter] = useState<ProductFilter>("all");
  const [query, setQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const styles = useThemedStyles((c, f) => ({
    root: { flex: 1, backgroundColor: c.bg },
    content: { padding: 20, gap: 14 },
    title: { fontSize: 28, fontFamily: f.bold, color: c.text, letterSpacing: -0.4 },
    search: {
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: merchantRadii.button,
      paddingHorizontal: 14,
      paddingVertical: 12,
      fontSize: 16,
      fontFamily: f.regular,
      color: c.text,
      minHeight: 48,
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: c.border,
    },
    thumb: { width: 56, height: 56, borderRadius: 10, backgroundColor: "rgba(147,160,151,0.2)" },
    name: { fontSize: 16, fontFamily: f.semiBold, color: c.text },
    meta: { fontSize: 13, fontFamily: f.regular, color: c.textMuted, marginTop: 2 },
    empty: { fontSize: 15, fontFamily: f.regular, color: c.textMuted, lineHeight: 22, paddingVertical: 24 },
    err: { gap: 12, paddingVertical: 20 },
  }));

  const products =
    state.kind === "ready" ? state.products : state.kind === "error" && state.cached ? state.cached : [];
  const counts = useMemo(() => filterCounts(products), [products]);
  const visible = useMemo(() => filterProducts(products, filter, query), [products, filter, query]);

  const onRefresh = async () => {
    setRefreshing(true);
    await reload();
    setRefreshing(false);
  };

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={[styles.content, { paddingBottom: tabBarInset }]}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void onRefresh()} tintColor={colors.accent} />}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.title}>Products</Text>
      {networkReady && isOffline ? (
        <OfflineBanner detail="Catalog may be out of date until you're back online." />
      ) : null}
      <MerchantPrimaryButton label="+ Add product" onPress={() => navigation.navigate("ProductAdd")} />

      <TextInput
        style={styles.search}
        placeholder="Search by name or SKU"
        placeholderTextColor={colors.textMuted}
        value={query}
        onChangeText={setQuery}
      />

      <SegmentedControl
        options={[
          { id: "all", label: `All (${counts.all})` },
          { id: "active", label: `Active (${counts.active})` },
          { id: "low", label: `Low stock (${counts.low})` },
        ]}
        value={filter}
        onChange={setFilter}
        accent={colors.accent}
        onAccent={colors.onAccent}
        trackColor="rgba(212, 220, 213, 0.55)"
        height={44}
      />

      {state.kind === "loading" ? <Text style={styles.meta}>Loading catalog…</Text> : null}
      {state.kind === "error" && products.length === 0 ? (
        <View style={styles.err}>
          <Text style={styles.empty}>{state.message}</Text>
          <MerchantPrimaryButton label="Try again" onPress={() => void reload()} />
        </View>
      ) : null}
      {state.kind === "error" && products.length > 0 ? (
        <InfoBanner variant="warning">Showing your last saved catalog. Try again when you're online.</InfoBanner>
      ) : null}

      {state.kind === "ready" && visible.length === 0 ? (
        <Text style={styles.empty}>
          {products.length === 0
            ? "Your catalog is empty. Add your first product to start selling."
            : "No products match this filter."}
        </Text>
      ) : null}

      {visible.map((p, i) => {
        const img = resolveMediaUrl(p.imageUrls[0]);
        return (
          <Animated.View key={p.id} entering={FadeInDown.delay(40 + i * 30).duration(400).springify()}>
            <Pressable style={styles.row} onPress={() => navigation.navigate("ProductDetail", { productId: p.id })}>
              {img ? <Image source={{ uri: img }} style={styles.thumb} /> : <View style={styles.thumb} />}
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{p.title}</Text>
                <Text style={styles.meta}>
                  {formatNairaFromKobo(p.priceKobo)} · {p.qtyAvailable} in stock
                  {p.sku ? ` · ${p.sku}` : ""}
                </Text>
              </View>
            </Pressable>
          </Animated.View>
        );
      })}

      {state.kind === "ready" && products.length > 0 ? (
        <InfoBanner variant="success">
          Your catalog syncs with your storefront. Buyers see published products on the web shop link.
        </InfoBanner>
      ) : null}
    </ScrollView>
  );
}
