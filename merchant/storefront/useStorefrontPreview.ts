import { useCallback, useEffect, useState } from "react";
import { ApiError } from "../../core/api/errors";
import { useReconnectEffect } from "../../core/network/useNetworkStatus";
import { useSession } from "../../core/session/SessionContext";
import { fetchPublicMerchant, fetchPublicProducts } from "../api/storefront";
import { useMerchant } from "../MerchantContext";
import type { PublicStorefrontMerchant, PublicStorefrontProduct } from "../types";

export type StorefrontPreviewState =
  | { kind: "loading" }
  | { kind: "ready"; merchant: PublicStorefrontMerchant; products: PublicStorefrontProduct[] }
  | { kind: "error"; message: string };

export function useStorefrontPreview() {
  const { api } = useSession();
  const { merchant, merchantSwitchEpoch } = useMerchant();
  const [state, setState] = useState<StorefrontPreviewState>({ kind: "loading" });

  const load = useCallback(async () => {
    if (!merchant?.slug) return;
    setState({ kind: "loading" });
    try {
      const [shop, products] = await Promise.all([
        fetchPublicMerchant(api, merchant.slug),
        fetchPublicProducts(api, merchant.slug),
      ]);
      setState({ kind: "ready", merchant: shop, products });
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Could not load storefront";
      setState({ kind: "error", message });
    }
  }, [api, merchant?.slug]);

  useEffect(() => {
    void load();
  }, [load, merchantSwitchEpoch]);

  useReconnectEffect(() => {
    void load();
  });

  return { state, reload: load };
}
