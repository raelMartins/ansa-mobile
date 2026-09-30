/**
 * Motion spec (welcome funnel):
 * - Splash: wordmark scale/fade in, glow, fade out → next phase.
 * - Intro: horizontal paging + per-slide FadeInUp; footer CTA cross-fade.
 * - Auth: AuthShell FadeInDown; stack fade between sign-in/up.
 * - Product picker: bubble float loop + FadeIn stagger; merchant → circular reveal overlay.
 * - Reduced motion: prefer shorter splash (quick) and system limits where exposed.
 */
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { MerchantBootstrapGate } from "../merchant/MerchantBootstrapGate";
import { MerchantProvider } from "../merchant/MerchantContext";
import {
  loadOnboarding,
  markIntroComplete,
  setSelectedProduct,
  type AnsaProductId,
  type OnboardingSnapshot,
} from "../core/onboarding/onboardingStorage";
import { AuthStack } from "../core/navigation/AuthStack";
import { useSession } from "../core/session/SessionContext";
import { brand } from "../core/ui/brandColors";
import { EcosystemIntroScreen } from "./EcosystemIntroScreen";
import { MerchantRevealOverlay } from "./MerchantRevealOverlay";
import { ProductPickerScreen } from "./ProductPickerScreen";
import { registerWelcomeReplay } from "./replay";
import { SplashScreen } from "./SplashScreen";

type Phase = "splash" | "intro" | "auth" | "product" | "merchant";

type RevealOrigin = { x: number; y: number; size: number };

function resolvePhase(snapshot: OnboardingSnapshot, authenticated: boolean): Phase {
  if (!snapshot.introComplete) {
    return "intro";
  }
  if (!authenticated) {
    return "auth";
  }
  if (!snapshot.selectedProduct) {
    return "product";
  }
  return "merchant";
}

export function AppExperienceFlow() {
  const { status } = useSession();
  const [onboarding, setOnboarding] = useState<OnboardingSnapshot | null>(null);
  const [phase, setPhase] = useState<Phase>("splash");
  const [revealOrigin, setRevealOrigin] = useState<RevealOrigin | null>(null);
  const [showReveal, setShowReveal] = useState(false);

  const refreshOnboarding = useCallback(async () => {
    setOnboarding(await loadOnboarding());
  }, []);

  useEffect(() => {
    void refreshOnboarding();
  }, [refreshOnboarding]);

  useEffect(() => {
    return registerWelcomeReplay(() => {
      void refreshOnboarding().then(() => {
        setShowReveal(false);
        setRevealOrigin(null);
        setPhase("splash");
      });
    });
  }, [refreshOnboarding]);

  const authenticated = status === "authenticated";
  const bootReady = onboarding !== null && status !== "loading";

  const handleSplashComplete = useCallback(() => {
    if (!onboarding) {
      return;
    }
    setPhase(resolvePhase(onboarding, authenticated));
  }, [authenticated, onboarding]);

  useEffect(() => {
    if (phase !== "auth" || !authenticated || !onboarding) {
      return;
    }
    setPhase(resolvePhase(onboarding, true));
  }, [authenticated, onboarding, phase]);

  useEffect(() => {
    if (!onboarding || status === "loading") {
      return;
    }
    if (status === "unauthenticated" && (phase === "merchant" || phase === "product")) {
      setPhase("auth");
    }
  }, [status, phase, onboarding]);

  const handleIntroComplete = useCallback(async () => {
    await markIntroComplete();
    const snapshot = await loadOnboarding();
    setOnboarding(snapshot);
    setPhase(resolvePhase(snapshot, authenticated));
  }, [authenticated]);

  const handleProductSelect = useCallback(async (product: AnsaProductId, origin: RevealOrigin) => {
    await setSelectedProduct(product);
    const snapshot = await loadOnboarding();
    setOnboarding(snapshot);
    setRevealOrigin(origin);
    setPhase("merchant");
    setShowReveal(true);
  }, []);

  const quickSplash = Boolean(onboarding?.introComplete && authenticated && onboarding?.selectedProduct);

  if (!bootReady) {
    return (
      <View style={styles.boot}>
        <ActivityIndicator size="large" color={brand.honey} />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      {phase === "splash" ? (
        <SplashScreen ready={bootReady} quick={quickSplash} onComplete={handleSplashComplete} />
      ) : null}
      {phase === "intro" ? <EcosystemIntroScreen onComplete={() => void handleIntroComplete()} /> : null}
      {phase === "auth" ? <AuthStack /> : null}
      {phase === "product" ? (
        <ProductPickerScreen onSelect={(id, layout) => void handleProductSelect(id, layout)} />
      ) : null}
      {phase === "merchant" ? (
        <MerchantProvider>
          <MerchantBootstrapGate />
        </MerchantProvider>
      ) : null}
      {showReveal && revealOrigin ? (
        <MerchantRevealOverlay
          origin={revealOrigin}
          onFinished={() => {
            setShowReveal(false);
            setRevealOrigin(null);
          }}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  boot: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: brand.forest,
  },
});
