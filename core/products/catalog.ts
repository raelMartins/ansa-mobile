import { iconLightTint, iconSecondary, knockoutOn, mix } from "../brand/color";

export type AnsaProductId = "merchant" | "delivery" | "jobs" | "check" | "locate" | "meets" | "health";

export type AnsaProduct = {
  id: AnsaProductId;
  label: string;
  tagline: string;
  enabled: boolean;
  /** Product primary — CURRENT HYPOTHESIS palette (founder may revise). */
  primary: string;
  /** Primary two steps lighter (icon mid-tone, soft UI fills). */
  secondary: string;
  /** Very light primary (light curve fallback, washes). */
  tint: string;
  /** Mark / text colour on a solid primary surface. */
  onPrimary: string;
  /** Accent used on dark UI. */
  darkAccent: string;
};

function product(
  id: AnsaProductId,
  label: string,
  tagline: string,
  primary: string,
  options: { enabled?: boolean; darkAccent?: string } = {},
): AnsaProduct {
  return {
    id,
    label,
    tagline,
    enabled: options.enabled ?? false,
    primary,
    secondary: iconSecondary(primary),
    tint: iconLightTint(primary),
    onPrimary: knockoutOn(primary),
    darkAccent: options.darkAccent ?? mix(primary, "#ffffff", 0.62),
  };
}

/** Grid order. Shop is not being built; rider is a separate app. */
export const ANSA_PRODUCTS: AnsaProduct[] = [
  product("merchant", "Merchant", "Sell, take orders, get paid", "#2D4236", { enabled: true, darkAccent: "#e3d096" }),
  product("delivery", "Delivery", "Send packages with proof", "#1E4D5C"),
  product("jobs", "Jobs", "Work with verified people", "#3D4A6B"),
  product("check", "Check", "Verify people and businesses", "#4A5568"),
  product("locate", "Locate", "Places, mapped by locals", "#2F5D50"),
  product("meets", "Meets", "Meet people safely", "#5C4A6E"),
  product("health", "Health", "More on this soon", "#2D5C4A"),
];

const BY_ID = new Map(ANSA_PRODUCTS.map((p) => [p.id, p]));

export function getProduct(id: AnsaProductId): AnsaProduct {
  return BY_ID.get(id) ?? ANSA_PRODUCTS[0];
}

export function isProductId(value: unknown): value is AnsaProductId {
  return typeof value === "string" && BY_ID.has(value as AnsaProductId);
}
