import { ErrorState, LoadingState } from "../core/ui/states";
import { CreateShopScreen } from "./onboarding/screens/CreateShopScreen";
import { useMerchant } from "./MerchantContext";
import { MerchantTabs } from "./shell/MerchantTabs";

export function MerchantBootstrapGate() {
  const { bootstrapStatus, merchant, errorMessage, refreshMerchant } = useMerchant();

  if (bootstrapStatus === "loading" || bootstrapStatus === "unauthorized") {
    return <LoadingState label="Opening your business…" />;
  }

  if (bootstrapStatus === "error") {
    return (
      <ErrorState message={errorMessage ?? "Could not load your business"} onRetry={() => void refreshMerchant()} />
    );
  }

  const needsOnboarding =
    bootstrapStatus === "missing" ||
    (bootstrapStatus === "ready" && merchant && !merchant.onboardingCompleted);

  if (needsOnboarding) {
    return <CreateShopScreen existingMerchant={merchant} onComplete={() => void refreshMerchant()} />;
  }

  if (bootstrapStatus === "ready" && merchant) {
    return <MerchantTabs />;
  }

  return <ErrorState message="Unexpected state loading your business." onRetry={() => void refreshMerchant()} />;
}
