import { useCallback, useEffect, useRef, useState } from "react";
import { ApiError } from "../../core/api/errors";
import { useReconnectEffect } from "../../core/network/useNetworkStatus";
import { useSession } from "../../core/session/SessionContext";
import { listCustomers } from "../api/customers";
import { useMerchant } from "../MerchantContext";
import type { MerchantCustomer } from "../types";

export type CustomersLoadState =
  | { kind: "loading" }
  | { kind: "ready"; customers: MerchantCustomer[] }
  | { kind: "error"; message: string; cached: MerchantCustomer[] | null };

export function useCustomers() {
  const { api } = useSession();
  const { merchantId, merchantSwitchEpoch } = useMerchant();
  const [state, setState] = useState<CustomersLoadState>({ kind: "loading" });
  const cacheRef = useRef<MerchantCustomer[] | null>(null);
  const merchantIdRef = useRef<string | null>(null);

  const load = useCallback(
    async (mode: "initial" | "refresh" = "initial") => {
      if (!merchantId) return;
      if (mode === "initial") setState({ kind: "loading" });
      try {
        const customers = await listCustomers(api, merchantId);
        if (merchantIdRef.current !== merchantId) return;
        cacheRef.current = customers;
        setState({ kind: "ready", customers });
      } catch (err) {
        if (merchantIdRef.current !== merchantId) return;
        const message = err instanceof ApiError ? err.message : "Could not load customers";
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

  return { state, reload };
}
