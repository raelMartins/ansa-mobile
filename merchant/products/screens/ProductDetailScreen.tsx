import { useNavigation, useRoute, type RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useCallback, useEffect, useState } from "react";
import { Alert, Image, ScrollView, Text, View } from "react-native";
import type { ProductsStackParamList } from "../../../core/navigation/types";
import { LoadingState, ErrorState } from "../../../core/ui/states";
import { useSession } from "../../../core/session/SessionContext";
import { useThemedStyles } from "../../../core/ui/themedStyles";
import { archiveProduct, fetchProduct } from "../../api/products";
import { useMerchant } from "../../MerchantContext";
import { formatNairaFromKobo } from "../../lib/money";
import { resolveMediaUrl } from "../../lib/resolveMediaUrl";
import type { MerchantProduct } from "../../types";
import { MerchantDangerLink, MerchantPrimaryButton, MerchantSecondaryButton } from "../../ui/MerchantButtons";
import { StatusPill } from "../../ui/StatusPill";
import { merchantRadii } from "../../ui/merchantUi";
import { feedback } from "../../../core/feedback/feedback";

type Route = RouteProp<ProductsStackParamList, "ProductDetail">;
type Nav = NativeStackNavigationProp<ProductsStackParamList, "ProductDetail">;

export function ProductDetailScreen() {
  const { productId } = useRoute<Route>().params;
  const navigation = useNavigation<Nav>();
  const { merchantId } = useMerchant();
  const { api } = useSession();
  const [product, setProduct] = useState<MerchantProduct | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [, setArchiving] = useState(false);

  const load = useCallback(async () => {
    if (!merchantId) return;
    setLoading(true);
    setError(null);
    try {
      setProduct(await fetchProduct(api, merchantId, productId));
    } catch {
      setError("Could not load this product");
    } finally {
      setLoading(false);
    }
  }, [api, merchantId, productId]);

  useEffect(() => {
    void load();
  }, [load]);

  const styles = useThemedStyles((c, f) => ({
    root: { flex: 1, backgroundColor: c.bg },
    content: { padding: 20, gap: 16, paddingBottom: 40 },
    hero: { width: "100%", height: 280, borderRadius: merchantRadii.card, backgroundColor: "rgba(147,160,151,0.2)" },
    title: { fontSize: 24, fontFamily: f.bold, color: c.text, letterSpacing: -0.3 },
    price: { fontSize: 20, fontFamily: f.semiBold, color: c.text, marginTop: 4 },
    body: { fontSize: 15, fontFamily: f.regular, color: c.textMuted, lineHeight: 22 },
    box: {
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: merchantRadii.card,
      padding: 16,
      gap: 8,
    },
    boxLabel: { fontSize: 13, fontFamily: f.medium, color: c.textMuted },
    boxValue: { fontSize: 15, fontFamily: f.regular, color: c.text },
  }));

  if (loading) return <LoadingState label="Loading product…" />;
  if (error || !product) return <ErrorState message={error ?? "Not found"} onRetry={() => void load()} />;

  const img = resolveMediaUrl(product.imageUrls[0]);
  const statusLabel = product.status === "published" ? "Active" : product.status === "draft" ? "Draft" : "Archived";

  const archive = () => {
    Alert.alert("Archive product?", "It will be hidden from your catalog and storefront.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Archive",
        style: "destructive",
        onPress: () => {
          if (!merchantId) return;
          setArchiving(true);
          void archiveProduct(api, merchantId, productId)
            .then(() => {
              feedback.success();
              navigation.navigate("ProductList");
            })
            .catch(() => feedback.error())
            .finally(() => setArchiving(false));
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      {img ? <Image source={{ uri: img }} style={styles.hero} resizeMode="cover" /> : <View style={styles.hero} />}
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        <Text style={styles.title}>{product.title}</Text>
        <StatusPill label={statusLabel} tone={product.status === "published" ? "success" : "muted"} />
      </View>
      <Text style={styles.price}>{formatNairaFromKobo(product.priceKobo)}</Text>
      {product.description ? <Text style={styles.body}>{product.description}</Text> : null}
      <View style={styles.box}>
        <Text style={styles.boxLabel}>Available stock</Text>
        <Text style={styles.boxValue}>{product.qtyAvailable} units</Text>
        {product.sku ? (
          <>
            <Text style={styles.boxLabel}>SKU</Text>
            <Text style={styles.boxValue}>{product.sku}</Text>
          </>
        ) : null}
      </View>
      <MerchantPrimaryButton label="Edit product" onPress={() => navigation.navigate("ProductEdit", { productId })} />
      <MerchantSecondaryButton label="Share product" disabled onPress={() => undefined} />
      <MerchantDangerLink label="Archive product" onPress={archive} />
    </ScrollView>
  );
}
