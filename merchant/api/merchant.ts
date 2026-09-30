import type { ApiClient } from "../../core/api/client";
import type { CreateMerchantInput, Merchant } from "../types";

export async function listMyMerchants(api: ApiClient): Promise<Merchant[]> {
  const { merchants } = await api.request<{ merchants: Merchant[] }>("/v1/me/merchants");
  return merchants;
}

export async function fetchMerchant(api: ApiClient, merchantId: string): Promise<Merchant> {
  const { merchant } = await api.request<{ merchant: Merchant }>(`/v1/me/merchants/${merchantId}`);
  return merchant;
}

export async function createMerchant(api: ApiClient, input: CreateMerchantInput): Promise<Merchant> {
  const { merchant } = await api.post<{ merchant: Merchant }>("/v1/me/merchants", input);
  return merchant;
}

export async function updateMerchant(
  api: ApiClient,
  merchantId: string,
  input: Partial<CreateMerchantInput>,
): Promise<Merchant> {
  const { merchant } = await api.patch<{ merchant: Merchant }>(`/v1/me/merchants/${merchantId}`, input);
  return merchant;
}
