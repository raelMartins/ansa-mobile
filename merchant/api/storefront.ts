import type { ApiClient } from "../../core/api/client";
import type { PublicStorefrontMerchant, PublicStorefrontProduct } from "../types";

export async function fetchPublicMerchant(api: ApiClient, slug: string): Promise<PublicStorefrontMerchant> {
  const { merchant } = await api.request<{ merchant: PublicStorefrontMerchant }>(`/v1/merchants/${slug}`);
  return merchant;
}

export async function fetchPublicProducts(api: ApiClient, slug: string): Promise<PublicStorefrontProduct[]> {
  const { products } = await api.request<{ products: PublicStorefrontProduct[] }>(`/v1/merchants/${slug}/products`);
  return products;
}
