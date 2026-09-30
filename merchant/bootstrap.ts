import { ApiError, errorMessage } from "../core/api/errors";
import type { ApiClient } from "../core/api/client";
import { listMyMerchants } from "./api/merchant";
import type { Merchant } from "./types";

export type MerchantBootstrapState =
  | { status: "ready"; merchant: Merchant }
  | { status: "missing" }
  | { status: "unauthorized" }
  | { status: "error"; message: string };

/**
 * Loads the active merchant context for mobile (first merchant for now).
 * OPEN: explicit merchant switcher when product requires it.
 */
export async function bootstrapMerchant(api: ApiClient): Promise<MerchantBootstrapState> {
  try {
    const merchants = await listMyMerchants(api);
    const merchant = merchants[0];
    if (!merchant) {
      return { status: "missing" };
    }
    return { status: "ready", merchant };
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) {
      return { status: "unauthorized" };
    }
    return { status: "error", message: errorMessage(err) };
  }
}
