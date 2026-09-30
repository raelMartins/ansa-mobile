import * as SecureStore from "expo-secure-store";

const INTRO_KEY = "ansa.mobile.ecosystemIntroComplete";
const PRODUCT_KEY = "ansa.mobile.selectedProductId";

export type AnsaProductId = "merchant" | "delivery" | "jobs" | "check" | "locate" | "meets";

export type OnboardingSnapshot = {
  introComplete: boolean;
  selectedProduct: AnsaProductId | null;
};

async function readFlag(key: string): Promise<boolean> {
  try {
    return (await SecureStore.getItemAsync(key)) === "1";
  } catch {
    return false;
  }
}

async function writeFlag(key: string, value: boolean): Promise<void> {
  if (value) {
    await SecureStore.setItemAsync(key, "1");
  } else {
    await SecureStore.deleteItemAsync(key);
  }
}

export async function loadOnboarding(): Promise<OnboardingSnapshot> {
  const introComplete = await readFlag(INTRO_KEY);
  let selectedProduct: AnsaProductId | null = null;
  try {
    const raw = await SecureStore.getItemAsync(PRODUCT_KEY);
    if (raw === "merchant" || raw === "delivery" || raw === "jobs" || raw === "check" || raw === "locate" || raw === "meets") {
      selectedProduct = raw;
    }
  } catch {
    selectedProduct = null;
  }
  return { introComplete, selectedProduct };
}

export async function markIntroComplete(): Promise<void> {
  await writeFlag(INTRO_KEY, true);
}

export async function setSelectedProduct(product: AnsaProductId): Promise<void> {
  await SecureStore.setItemAsync(PRODUCT_KEY, product);
}

/** Clears intro + product choice so the welcome flow replays (keeps auth tokens). */
export async function resetWelcomeFlow(): Promise<void> {
  await writeFlag(INTRO_KEY, false);
  await SecureStore.deleteItemAsync(PRODUCT_KEY);
}

/** Dev / testing: full welcome + sign-in again. */
export async function resetWelcomeFlowAndSignOut(signOut: () => Promise<void>): Promise<void> {
  await resetWelcomeFlow();
  await signOut();
}
