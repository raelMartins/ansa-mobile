import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { AnsaProductId } from "../products/catalog";
import {
  loadOnboarding,
  markIntroComplete as persistIntroComplete,
  resetWelcomeFlow,
  setSelectedProduct,
} from "./onboardingStorage";

type OnboardingContextValue = {
  ready: boolean;
  introComplete: boolean;
  selectedProduct: AnsaProductId | null;
  /** Increments whenever the welcome flow should restart from the splash. */
  welcomeRun: number;
  markIntroComplete: () => Promise<void>;
  selectProduct: (product: AnsaProductId) => Promise<void>;
  /** Clears intro + product (keeps auth) and restarts the welcome flow. */
  replayWelcome: () => Promise<void>;
};

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [introComplete, setIntroComplete] = useState(false);
  const [selectedProduct, setSelected] = useState<AnsaProductId | null>(null);
  const [welcomeRun, setWelcomeRun] = useState(0);

  useEffect(() => {
    void loadOnboarding().then((snapshot) => {
      setIntroComplete(snapshot.introComplete);
      setSelected(snapshot.selectedProduct);
      setReady(true);
    });
  }, []);

  const markIntroComplete = useCallback(async () => {
    setIntroComplete(true);
    await persistIntroComplete().catch(() => {});
  }, []);

  const selectProduct = useCallback(async (product: AnsaProductId) => {
    setSelected(product);
    await setSelectedProduct(product).catch(() => {});
  }, []);

  const replayWelcome = useCallback(async () => {
    await resetWelcomeFlow().catch(() => {});
    setIntroComplete(false);
    setSelected(null);
    setWelcomeRun((n) => n + 1);
  }, []);

  const value = useMemo(
    () => ({
      ready,
      introComplete,
      selectedProduct,
      welcomeRun,
      markIntroComplete,
      selectProduct,
      replayWelcome,
    }),
    [ready, introComplete, selectedProduct, welcomeRun, markIntroComplete, selectProduct, replayWelcome],
  );

  return <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>;
}

export function useOnboarding(): OnboardingContextValue {
  const ctx = useContext(OnboardingContext);
  if (!ctx) {
    throw new Error("useOnboarding must be used within OnboardingProvider");
  }
  return ctx;
}
