import { useNavigation, useRoute, type RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useCallback, useEffect, useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, ScrollView, Text, View } from "react-native";
import type { ProductsStackParamList } from "../../../core/navigation/types";
import { LoadingState, ErrorState } from "../../../core/ui/states";
import { useSession } from "../../../core/session/SessionContext";
import { useThemedStyles } from "../../../core/ui/themedStyles";
import { createProduct, fetchProduct, updateProduct } from "../../api/products";
import { uploadMerchantMedia } from "../../api/media";
import { useMerchant } from "../../MerchantContext";
import { MerchantPrimaryButton, MerchantSecondaryButton } from "../../ui/MerchantButtons";
import {
  ProductForm,
  emptyProductForm,
  formToApiPayload,
  productToForm,
  validateProductForm,
  type ProductFormValues,
} from "../components/ProductForm";
import { feedback } from "../../../core/feedback/feedback";

type EditRoute = RouteProp<ProductsStackParamList, "ProductEdit">;
type Nav = NativeStackNavigationProp<ProductsStackParamList>;

type Mode = { kind: "add" } | { kind: "edit"; productId: string };

export function ProductAddScreen() {
  return <ProductFormScreen mode={{ kind: "add" }} />;
}

export function ProductEditScreen() {
  const { productId } = useRoute<EditRoute>().params;
  return <ProductFormScreen mode={{ kind: "edit", productId }} />;
}

function ProductFormScreen({ mode }: { mode: Mode }) {
  const navigation = useNavigation<Nav>();
  const { merchantId } = useMerchant();
  const { api } = useSession();
  const [values, setValues] = useState<ProductFormValues>(emptyProductForm());
  const [photoPreviews, setPhotoPreviews] = useState<{ uri: string; uploading?: boolean }[]>([]);
  const [loading, setLoading] = useState(mode.kind === "edit");
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);

  const styles = useThemedStyles((c, f) => ({
    root: { flex: 1, backgroundColor: c.bg },
    content: { padding: 20, gap: 16, paddingBottom: 40 },
    title: { fontSize: 26, fontFamily: f.bold, color: c.text },
    sub: { fontSize: 14, fontFamily: f.regular, color: c.textMuted, lineHeight: 20 },
  }));

  const loadProduct = useCallback(async () => {
    if (mode.kind !== "edit" || !merchantId) return;
    setLoading(true);
    try {
      const product = await fetchProduct(api, merchantId, mode.productId);
      const form = productToForm(product);
      setValues(form);
      setPhotoPreviews(form.imageUrls.map((u) => ({ uri: u })));
    } catch {
      setLoadError("Could not load product");
    } finally {
      setLoading(false);
    }
  }, [api, merchantId, mode]);

  useEffect(() => {
    if (mode.kind === "edit") void loadProduct();
  }, [loadProduct, mode.kind]);

  const onUploadPhoto = async (dataUrl: string, previewUri: string) => {
    if (!merchantId) return;
    const index = photoPreviews.length;
    setPhotoPreviews((p) => [...p, { uri: previewUri, uploading: true }]);
    setDirty(true);
    try {
      const url = await uploadMerchantMedia(api, merchantId, dataUrl);
      setValues((v) => ({ ...v, imageUrls: [...v.imageUrls, url] }));
      setPhotoPreviews((p) => {
        const next = [...p];
        if (next[index]) next[index] = { uri: url };
        return next;
      });
      feedback.success();
    } catch {
      setPhotoPreviews((p) => p.filter((_, i) => i !== index));
      feedback.error();
    }
  };

  const onRemovePhoto = (index: number) => {
    setPhotoPreviews((p) => p.filter((_, i) => i !== index));
    setValues((v) => ({ ...v, imageUrls: v.imageUrls.filter((_, i) => i !== index) }));
    setDirty(true);
  };

  const cancel = () => {
    if (dirty) {
      Alert.alert("Discard changes?", "Unsaved edits will be lost.", [
        { text: "Keep editing", style: "cancel" },
        { text: "Discard", style: "destructive", onPress: () => navigation.goBack() },
      ]);
      return;
    }
    navigation.goBack();
  };

  const save = async () => {
    const errors = validateProductForm(values);
    if (Object.keys(errors).length > 0) {
      feedback.deny();
      return;
    }
    if (!merchantId) return;
    setSaving(true);
    try {
      const payload = formToApiPayload(values);
      if (mode.kind === "add") {
        const product = await createProduct(api, merchantId, payload);
        feedback.success();
        navigation.replace("ProductSaved", { productId: product.id });
      } else {
        await updateProduct(api, merchantId, mode.productId, payload);
        feedback.success();
        navigation.navigate("ProductDetail", { productId: mode.productId });
      }
    } catch {
      feedback.error();
    } finally {
      setSaving(false);
    }
  };

  const title = mode.kind === "add" ? "Add product" : "Edit product";
  const primaryLabel = mode.kind === "add" ? "Save product" : "Save changes";

  if (loading) return <LoadingState label="Loading product…" />;
  if (loadError) return <ErrorState message={loadError} onRetry={() => void loadProduct()} />;

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>{title}</Text>
        {mode.kind === "edit" ? (
          <Text style={styles.sub}>Update your catalog. Changes apply after you save.</Text>
        ) : null}
        <ProductForm
          values={values}
          onChange={(v) => {
            setValues(v);
            setDirty(true);
          }}
          onUploadPhoto={onUploadPhoto}
          photoPreviews={photoPreviews}
          onRemovePhoto={onRemovePhoto}
        />
        <MerchantPrimaryButton label={primaryLabel} loading={saving} onPress={() => void save()} />
        <MerchantSecondaryButton label="Cancel" onPress={cancel} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
