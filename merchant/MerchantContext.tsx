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
import type { Merchant } from "./types";

export type MerchantBootstrapStatus = MerchantBootstrapState["status"] | "loading";

type MerchantContextValue = {
  merchant: Merchant | null;
  merchantId: string | null;
  bootstrapStatus: MerchantBootstrapStatus;
  errorMessage: string | null;
  refreshMerchant: () => Promise<void>;
  setMerchant: (merchant: Merchant) => void;
};

const MerchantContext = createContext<MerchantContextValue | null>(null);

export function MerchantProvider({ children }: { children: ReactNode }) {
  const { api, signOut } = useSession();
  const [merchant, setMerchant] = useState<Merchant | null>(null);
  const [bootstrapStatus, setBootstrapStatus] = useState<MerchantBootstrapStatus>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const refreshMerchant = useCallback(async () => {
    setBootstrapStatus("loading");
    setErrorMessage(null);
    const result = await bootstrapMerchant(api);
    if (result.status === "ready") {
      setMerchant(result.merchant);
      setBootstrapStatus("ready");
      return;
    }
    if (result.status === "missing") {
      setMerchant(null);
      setBootstrapStatus("missing");
      return;
    }
    if (result.status === "unauthorized") {
      setMerchant(null);
      setBootstrapStatus("unauthorized");
      return;
    }
    setMerchant(null);
    setBootstrapStatus("error");
    setErrorMessage(result.message);
  }, [api]);

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
      merchantId: merchant?.id ?? null,
      bootstrapStatus,
      errorMessage,
      refreshMerchant,
      setMerchant,
    }),
    [merchant, bootstrapStatus, errorMessage, refreshMerchant],
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
