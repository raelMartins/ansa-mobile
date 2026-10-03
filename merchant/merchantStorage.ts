import * as SecureStore from "expo-secure-store";

const ACTIVE_MERCHANT_KEY = "ansa.mobile.activeMerchantId";

export async function loadActiveMerchantId(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(ACTIVE_MERCHANT_KEY);
  } catch {
    return null;
  }
}

export async function saveActiveMerchantId(merchantId: string): Promise<void> {
  await SecureStore.setItemAsync(ACTIVE_MERCHANT_KEY, merchantId);
}

export async function clearActiveMerchantId(): Promise<void> {
  await SecureStore.deleteItemAsync(ACTIVE_MERCHANT_KEY);
}
