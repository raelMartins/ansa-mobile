import { useState } from "react";
import { Switch, Text, View } from "react-native";
import { AuthField } from "../../../identity/components/AuthField";
import { useTheme } from "../../../core/ui/ThemeContext";
import { useThemedStyles } from "../../../core/ui/themedStyles";
import { parseNairaToKobo } from "../../lib/money";
import type { MerchantProduct } from "../../types";
import { ProductPhotoPicker } from "./ProductPhotoPicker";

export type ProductFormValues = {
  title: string;
  priceNaira: string;
  stock: string;
  description: string;
  category: string;
  sku: string;
  published: boolean;
  imageUrls: string[];
};

export function emptyProductForm(): ProductFormValues {
  return {
    title: "",
    priceNaira: "",
    stock: "0",
    description: "",
    category: "",
    sku: "",
    published: true,
    imageUrls: [],
  };
}

export function productToForm(product: MerchantProduct): ProductFormValues {
  return {
    title: product.title,
    priceNaira: String(product.priceKobo / 100),
    stock: String(product.qtyAvailable),
    description: product.description ?? "",
    category: product.category ?? "",
    sku: product.sku ?? "",
    published: product.status === "published",
    imageUrls: product.imageUrls,
  };
}

export function validateProductForm(values: ProductFormValues): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!values.title.trim()) errors.title = "Product name is required";
  const kobo = parseNairaToKobo(values.priceNaira);
  if (kobo === null) errors.priceNaira = "Enter a valid price";
  const stock = Number(values.stock);
  if (!Number.isInteger(stock) || stock < 0) errors.stock = "Enter a valid stock quantity";
  return errors;
}

type Props = {
  values: ProductFormValues;
  onChange: (next: ProductFormValues) => void;
  onUploadPhoto: (dataUrl: string, previewUri: string) => Promise<void>;
  photoPreviews: { uri: string; uploading?: boolean }[];
  onRemovePhoto: (index: number) => void;
};

export function ProductForm({ values, onChange, onUploadPhoto, photoPreviews, onRemovePhoto }: Props) {
  const { colors } = useTheme();
  const styles = useThemedStyles((c, f) => ({
    section: { gap: 14 },
    row: { flexDirection: "row", gap: 10 },
    rowField: { flex: 1 },
    toggleRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: 8,
      minHeight: 48,
    },
    toggleLabel: { fontSize: 15, fontFamily: f.medium, color: c.text, flex: 1, paddingRight: 12 },
  }));

  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (patch: Partial<ProductFormValues>) => {
    const next = { ...values, ...patch };
    onChange(next);
    setErrors(validateProductForm(next));
  };

  return (
    <View style={styles.section}>
      <Text style={{ fontFamily: "PlusJakartaSans_600SemiBold", fontSize: 16, color: colors.text }}>Product photos</Text>
      <ProductPhotoPicker photos={photoPreviews} maxPhotos={5} onAdd={onUploadPhoto} onRemove={onRemovePhoto} />

      <AuthField
        label="Product name *"
        accent={colors.accent}
        error={errors.title}
        inputProps={{
          value: values.title,
          onChangeText: (t) => set({ title: t }),
          placeholder: "Indigo Adire shirt",
        }}
      />

      <View style={styles.row}>
        <View style={styles.rowField}>
          <AuthField
            label="Price (NGN) *"
            accent={colors.accent}
            error={errors.priceNaira}
            inputProps={{
              value: values.priceNaira,
              onChangeText: (t) => set({ priceNaira: t }),
              keyboardType: "numeric",
              placeholder: "24000",
            }}
          />
        </View>
        <View style={styles.rowField}>
          <AuthField
            label="Stock quantity *"
            accent={colors.accent}
            error={errors.stock}
            inputProps={{
              value: values.stock,
              onChangeText: (t) => set({ stock: t }),
              keyboardType: "number-pad",
              placeholder: "0",
            }}
          />
        </View>
      </View>

      <AuthField
        label="Description"
        accent={colors.accent}
        inputProps={{
          value: values.description,
          onChangeText: (t) => set({ description: t }),
          multiline: true,
          style: { minHeight: 96, textAlignVertical: "top" },
          placeholder: "Tell buyers what makes this item special",
        }}
      />

      <View style={styles.row}>
        <View style={styles.rowField}>
          <AuthField
            label="Category"
            accent={colors.accent}
            inputProps={{
              value: values.category,
              onChangeText: (t) => set({ category: t }),
              placeholder: "Fashion",
            }}
          />
        </View>
        <View style={styles.rowField}>
          <AuthField
            label="SKU"
            accent={colors.accent}
            inputProps={{
              value: values.sku,
              onChangeText: (t) => set({ sku: t }),
              placeholder: "ADT-001",
            }}
          />
        </View>
      </View>

      <View style={styles.toggleRow}>
        <Text style={styles.toggleLabel}>Visible on storefront</Text>
        <Switch
          value={values.published}
          onValueChange={(v) => set({ published: v })}
          trackColor={{ false: colors.border, true: colors.accent }}
        />
      </View>
    </View>
  );
}

export function formToApiPayload(values: ProductFormValues) {
  const kobo = parseNairaToKobo(values.priceNaira);
  const stock = Number(values.stock);
  return {
    title: values.title.trim(),
    description: values.description.trim() || undefined,
    priceKobo: kobo ?? 0,
    qtyAvailable: stock,
    sku: values.sku.trim() || null,
    category: values.category.trim() || null,
    status: (values.published ? "published" : "draft") as "published" | "draft",
    imageUrls: values.imageUrls,
  };
}
