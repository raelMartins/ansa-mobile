import { getApiBaseUrl } from "../../core/config/env";

/** Buyer storefront path on the merchant web app (dev: port 3000). */
export function getStorefrontUrl(merchantSlug: string): string {
  const api = getApiBaseUrl();
  const shopOrigin = api.replace(/:5000\/?$/, ":3000");
  return `${shopOrigin}/shop/${merchantSlug}`;
}
