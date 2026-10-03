import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useSession } from "../core/session/SessionContext";
import { bootstrapMerchant, type MerchantBootstrapState } from "./bootstrap";
import { fetchMerchant } from "./api/merchant";
import { saveActiveMerchantId } from "./merchantStorage";
import type { Merchant } from "./types";

export type MerchantBootstrapStatus = MerchantBootstrapState["status"] | "loading";

type MerchantContextValue = {
  merchant: Merchant | null;
  merchants: Merchant[];
  merchantId: string | null;
  bootstrapStatus: MerchantBootstrapStatus;
  errorMessage: string | null;
  refreshMerchant: () => Promise<void>;
  setMerchant: (merchant: Merchant) => void;
  switchMerchant: (merchantId: string) => Promise<void>;
  /** Bumps on each business switch so data hooks refetch. */
  merchantSwitchEpoch: number;
};

const MerchantContext = createContext<MerchantContextValue | null>(null);

export function MerchantProvider({ children }: { children: ReactNode }) {
  const { api, signOut } = useSession();
  const [merchant, setMerchant] = useState<Merchant | null>(null);
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [bootstrapStatus, setBootstrapStatus] = useState<MerchantBootstrapStatus>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [merchantSwitchEpoch, setMerchantSwitchEpoch] = useState(0);

  const refreshMerchant = useCallback(async () => {
    setBootstrapStatus("loading");
    setErrorMessage(null);
    const result = await bootstrapMerchant(api);
    if (result.status === "ready") {
      setMerchant(result.merchant);
      setMerchants(result.merchants);
      setBootstrapStatus("ready");
      return;
    }
    if (result.status === "missing") {
      setMerchant(null);
      setMerchants([]);
      setBootstrapStatus("missing");
      return;
    }
    if (result.status === "unauthorized") {
      setMerchant(null);
      setMerchants([]);
      setBootstrapStatus("unauthorized");
      return;
    }
    setMerchant(null);
    setMerchants([]);
    setBootstrapStatus("error");
    setErrorMessage(result.message);
  }, [api]);

  const switchMerchant = useCallback(
    async (merchantId: string) => {
      const next = merchants.find((m) => m.id === merchantId);
      if (!next || next.id === merchant?.id) return;
      await saveActiveMerchantId(next.id);
      setMerchant(next);
      setMerchantSwitchEpoch((n) => n + 1);
      try {
        const fresh = await fetchMerchant(api, merchantId);
        setMerchant(fresh);
        setMerchants((list) => list.map((m) => (m.id === fresh.id ? fresh : m)));
      } catch {
        // Keep the list copy; overview hook will surface errors if refresh fails.
      }
    },
    [api, merchants, merchant?.id],
  );

  useEffect(() => {
    void refreshMerchant();
  }, [refreshMerchant]);

  useEffect(() => {
    if (bootstrapStatus === "unauthorized") {
      void signOut();
    }
  }, [bootstrapStatus, signOut]);

  const value = useMemo(
    () => ({
      merchant,
      merchants,
      merchantId: merchant?.id ?? null,
      bootstrapStatus,
      errorMessage,
      refreshMerchant,
      setMerchant,
      switchMerchant,
      merchantSwitchEpoch,
    }),
    [merchant, merchants, bootstrapStatus, errorMessage, refreshMerchant, switchMerchant, merchantSwitchEpoch],
  );

  return <MerchantContext.Provider value={value}>{children}</MerchantContext.Provider>;
}

export function useMerchant(): MerchantContextValue {
  const ctx = useContext(MerchantContext);
  if (!ctx) {
    throw new Error("useMerchant must be used within MerchantProvider");
  }
  return ctx;
}
