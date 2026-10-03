import { useNavigation, useRoute, type RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useEffect, useState } from "react";
import { Image, ScrollView, Text, View } from "react-native";
import type { ProductsStackParamList } from "../../../core/navigation/types";
import { LoadingState } from "../../../core/ui/states";
import { useSession } from "../../../core/session/SessionContext";
import { useThemedStyles } from "../../../core/ui/themedStyles";
import { fetchProduct } from "../../api/products";
import { useMerchant } from "../../MerchantContext";
import { formatNairaFromKobo } from "../../lib/money";
import { resolveMediaUrl } from "../../lib/resolveMediaUrl";
import { InfoBanner } from "../../ui/InfoBanner";
import { MerchantPrimaryButton, MerchantSecondaryButton } from "../../ui/MerchantButtons";
import { StatusPill } from "../../ui/StatusPill";
import { merchantRadii } from "../../ui/merchantUi";

type Route = RouteProp<ProductsStackParamList, "ProductSaved">;
type Nav = NativeStackNavigationProp<ProductsStackParamList, "ProductSaved">;

export function ProductSavedScreen() {
  const { productId } = useRoute<Route>().params;
  const navigation = useNavigation<Nav>();
  const { merchantId } = useMerchant();
  const { api } = useSession();
  const [loading, setLoading] = useState(true);

  const styles = useThemedStyles((c, f) => ({
    root: { flex: 1, backgroundColor: c.bg },
    content: { padding: 20, gap: 16, alignItems: "center", paddingBottom: 40 },
    title: { fontSize: 22, fontFamily: f.bold, color: c.text, alignSelf: "flex-start" },
    headline: { fontSize: 20, fontFamily: f.semiBold, color: c.text, textAlign: "center" },
    card: {
      width: "100%",
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: merchantRadii.card,
      overflow: "hidden",
    },
    thumb: { width: "100%", height: 200, backgroundColor: "rgba(147,160,151,0.2)" },
    cardBody: { padding: 16, gap: 6 },
    name: { fontSize: 17, fontFamily: f.semiBold, color: c.text },
    meta: { fontSize: 14, fontFamily: f.regular, color: c.textMuted },
    link: { paddingVertical: 12, minHeight: 44, justifyContent: "center" },
    linkText: { fontSize: 15, fontFamily: f.semiBold, color: c.accent, textAlign: "center" },
  }));

  const [name, setName] = useState("");
  const [price, setPrice] = useState(0);
  const [stock, setStock] = useState(0);
  const [img, setImg] = useState<string | null>(null);

  useEffect(() => {
    if (!merchantId) return;
    void fetchProduct(api, merchantId, productId).then((p) => {
      setName(p.title);
      setPrice(p.priceKobo);
      setStock(p.qtyAvailable);
      setImg(resolveMediaUrl(p.imageUrls[0]));
      setLoading(false);
    });
  }, [api, merchantId, productId]);

  if (loading) return <LoadingState label="Product saved…" />;

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Product saved</Text>
      <InfoBanner variant="success">
        Product saved. Your storefront is up to date. Synced just now — all changes saved.
      </InfoBanner>
      <Text style={styles.headline}>Your product is ready to sell.</Text>
      <View style={styles.card}>
        {img ? <Image source={{ uri: img }} style={styles.thumb} resizeMode="cover" /> : <View style={styles.thumb} />}
        <View style={styles.cardBody}>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.meta}>{formatNairaFromKobo(price)} · {stock} units</Text>
          <StatusPill label="Active" tone="success" />
        </View>
      </View>
      <MerchantPrimaryButton
        label="View product"
        onPress={() => navigation.replace("ProductDetail", { productId })}
      />
      <MerchantSecondaryButton label="Share on WhatsApp" disabled onPress={() => undefined} />
      <View style={styles.link}>
        <Text
          style={styles.linkText}
          onPress={() => navigation.navigate("ProductList")}
          accessibilityRole="button"
        >
          Back to products
        </Text>
      </View>
    </ScrollView>
  );
}
