import { useCallback, useEffect, useRef, useState } from "react";
import { ApiError } from "../../core/api/errors";
import { useReconnectEffect } from "../../core/network/useNetworkStatus";
import { useSession } from "../../core/session/SessionContext";
import { listProducts } from "../api/products";
import { useMerchant } from "../MerchantContext";
import type { MerchantProduct } from "../types";

export type ProductsLoadState =
  | { kind: "loading" }
  | { kind: "ready"; products: MerchantProduct[] }
  | { kind: "error"; message: string; cached: MerchantProduct[] | null };

export function useProducts() {
  const { api } = useSession();
  const { merchantId, merchantSwitchEpoch } = useMerchant();
  const [state, setState] = useState<ProductsLoadState>({ kind: "loading" });
  const cacheRef = useRef<MerchantProduct[] | null>(null);
  const merchantIdRef = useRef<string | null>(null);

  const load = useCallback(
    async (mode: "initial" | "refresh" = "initial") => {
      if (!merchantId) return;
      if (mode === "initial") setState({ kind: "loading" });
      try {
        const products = await listProducts(api, merchantId);
        if (merchantIdRef.current !== merchantId) return;
        cacheRef.current = products;
        setState({ kind: "ready", products });
      } catch (err) {
        if (merchantIdRef.current !== merchantId) return;
        const message = err instanceof ApiError ? err.message : "Could not load products";
        setState({ kind: "error", message, cached: cacheRef.current });
      }
    },
    [api, merchantId],
  );

  useEffect(() => {
    merchantIdRef.current = merchantId;
    cacheRef.current = null;
    setState({ kind: "loading" });
    void load("initial");
  }, [merchantId, merchantSwitchEpoch, load]);

  useReconnectEffect(() => {
    if (merchantId) void load("refresh");
  });

  const reload = useCallback(() => {
    void load("initial");
  }, [load]);

  const refresh = useCallback(() => {
    void load("refresh");
  }, [load]);

  return { state, reload, refresh };
}
