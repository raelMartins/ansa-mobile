import { useCallback, useEffect, useRef, useState } from "react";
import { ApiError } from "../../core/api/errors";
import { useReconnectEffect } from "../../core/network/useNetworkStatus";
import { useSession } from "../../core/session/SessionContext";
import { listOrders } from "../api/orders";
import { useMerchant } from "../MerchantContext";
import type { MerchantOrder } from "../types";

export type OrdersLoadState =
  | { kind: "loading" }
  | { kind: "ready"; orders: MerchantOrder[] }
  | { kind: "error"; message: string; cached: MerchantOrder[] | null };

export function useOrders() {
  const { api } = useSession();
  const { merchantId, merchantSwitchEpoch } = useMerchant();
  const [state, setState] = useState<OrdersLoadState>({ kind: "loading" });
  const cacheRef = useRef<MerchantOrder[] | null>(null);
  const merchantIdRef = useRef<string | null>(null);

  const load = useCallback(
    async (mode: "initial" | "refresh" = "initial") => {
      if (!merchantId) return;
      if (mode === "initial") setState({ kind: "loading" });
      try {
        const orders = await listOrders(api, merchantId);
        if (merchantIdRef.current !== merchantId) return;
        cacheRef.current = orders;
        setState({ kind: "ready", orders });
      } catch (err) {
        if (merchantIdRef.current !== merchantId) return;
        const message = err instanceof ApiError ? err.message : "Could not load orders";
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
