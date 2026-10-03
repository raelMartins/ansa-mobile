import type { ApiClient } from "../../core/api/client";
import type { MerchantOverview } from "../types";

export async function fetchMerchantOverview(api: ApiClient, merchantId: string): Promise<MerchantOverview> {
  return api.request<MerchantOverview>(`/v1/me/merchants/${merchantId}/overview`);
}
