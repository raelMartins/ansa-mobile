import { useCallback, useEffect, useRef, useState } from "react";
import { ApiError } from "../../core/api/errors";
import { useReconnectEffect } from "../../core/network/useNetworkStatus";
import { useSession } from "../../core/session/SessionContext";
import { fetchMerchantOverview } from "../api/overview";
import { useMerchant } from "../MerchantContext";
import type { MerchantOverview } from "../types";

export type OverviewLoadState =
  | { kind: "loading" }
  | { kind: "ready"; data: MerchantOverview }
  | { kind: "error"; message: string; cached: MerchantOverview | null };

export function useOverview() {
  const { api } = useSession();
  const { merchantId, merchantSwitchEpoch } = useMerchant();
  const [state, setState] = useState<OverviewLoadState>({ kind: "loading" });
  const cacheRef = useRef<MerchantOverview | null>(null);
  const merchantIdRef = useRef<string | null>(null);

  const load = useCallback(
    async (mode: "initial" | "refresh" = "initial") => {
      if (!merchantId) return;
      if (mode === "initial") setState({ kind: "loading" });
      try {
        const data = await fetchMerchantOverview(api, merchantId);
        if (merchantIdRef.current !== merchantId) return;
        cacheRef.current = data;
        setState({ kind: "ready", data });
      } catch (err) {
        if (merchantIdRef.current !== merchantId) return;
        const message = err instanceof ApiError ? err.message : "Could not load your overview";
        const isNetwork = err instanceof ApiError && err.status === 0;
        setState({
          kind: "error",
          message: isNetwork ? "We couldn't refresh your shop" : message,
          cached: cacheRef.current,
        });
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

  const refresh = useCallback(() => {
    void load("refresh");
  }, [load]);

  const retry = useCallback(() => {
    void load("initial");
  }, [load]);

  return { state, refresh, retry };
}
