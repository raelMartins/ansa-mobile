import { ApiError, errorMessage } from "../core/api/errors";
import type { ApiClient } from "../core/api/client";
import { listMyMerchants } from "./api/merchant";
import { loadActiveMerchantId, saveActiveMerchantId } from "./merchantStorage";
import type { Merchant } from "./types";

export type MerchantBootstrapState =
  | { status: "ready"; merchant: Merchant; merchants: Merchant[] }
  | { status: "missing" }
  | { status: "unauthorized" }
  | { status: "error"; message: string };

function pickActiveMerchant(merchants: Merchant[], storedId: string | null): Merchant | undefined {
  if (storedId) {
    const match = merchants.find((m) => m.id === storedId);
    if (match) return match;
  }
  return merchants[0];
}

export async function bootstrapMerchant(api: ApiClient): Promise<MerchantBootstrapState> {
  try {
    const merchants = await listMyMerchants(api);
    if (merchants.length === 0) {
      return { status: "missing" };
    }
    const storedId = await loadActiveMerchantId();
    const merchant = pickActiveMerchant(merchants, storedId);
    if (!merchant) {
      return { status: "missing" };
    }
    if (merchant.id !== storedId) {
      await saveActiveMerchantId(merchant.id);
    }
    return { status: "ready", merchant, merchants };
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) {
      return { status: "unauthorized" };
    }
    return { status: "error", message: errorMessage(err) };
  }
}
