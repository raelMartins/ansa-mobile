import type { ApiClient } from "../../core/api/client";
import type { CreateProductInput, MerchantProduct, UpdateProductInput } from "../types";

export async function listProducts(api: ApiClient, merchantId: string): Promise<MerchantProduct[]> {
  const { products } = await api.request<{ products: MerchantProduct[] }>(`/v1/me/merchants/${merchantId}/products`);
  return products;
}

export async function fetchProduct(api: ApiClient, merchantId: string, productId: string): Promise<MerchantProduct> {
  const { product } = await api.request<{ product: MerchantProduct }>(
    `/v1/me/merchants/${merchantId}/products/${productId}`,
  );
  return product;
}

export async function createProduct(
  api: ApiClient,
  merchantId: string,
  input: CreateProductInput,
): Promise<MerchantProduct> {
  const { product } = await api.post<{ product: MerchantProduct }>(`/v1/me/merchants/${merchantId}/products`, input);
  return product;
}

export async function updateProduct(
  api: ApiClient,
  merchantId: string,
  productId: string,
  input: UpdateProductInput,
): Promise<MerchantProduct> {
  const { product } = await api.patch<{ product: MerchantProduct }>(
    `/v1/me/merchants/${merchantId}/products/${productId}`,
    input,
  );
  return product;
}

export async function archiveProduct(
  api: ApiClient,
  merchantId: string,
  productId: string,
): Promise<MerchantProduct> {
  const { product } = await api.request<{ product: MerchantProduct }>(
    `/v1/me/merchants/${merchantId}/products/${productId}`,
    { method: "DELETE" },
  );
  return product;
}
