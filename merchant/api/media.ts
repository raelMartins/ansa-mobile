import type { ApiClient } from "../../core/api/client";

export async function uploadMerchantMedia(api: ApiClient, merchantId: string, dataUrl: string): Promise<string> {
  const { url } = await api.post<{ url: string }>(`/v1/me/merchants/${merchantId}/media`, { dataUrl });
  return url;
}
