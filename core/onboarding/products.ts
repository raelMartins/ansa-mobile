import type { AnsaProductId } from "./onboardingStorage";

export type AnsaProductOption = {
  id: AnsaProductId;
  label: string;
  tagline: string;
  emoji: string;
  enabled: boolean;
  /** Bubble layout hint (0–1 normalized). */
  x: number;
  y: number;
  size: number;
};

export const ANSA_PRODUCTS: AnsaProductOption[] = [
  {
    id: "merchant",
    label: "Merchant",
    tagline: "Catalog, orders, storefront",
    emoji: "◆",
    enabled: true,
    x: 0.5,
    y: 0.42,
    size: 1.15,
  },
  {
    id: "delivery",
    label: "Delivery",
    tagline: "Ship with proof",
    emoji: "◎",
    enabled: false,
    x: 0.22,
    y: 0.28,
    size: 0.92,
  },
  {
    id: "jobs",
    label: "Jobs",
    tagline: "Verified work & bounties",
    emoji: "◇",
    enabled: false,
    x: 0.78,
    y: 0.26,
    size: 0.9,
  },
  {
    id: "check",
    label: "Check",
    tagline: "Trust & identity",
    emoji: "✓",
    enabled: false,
    x: 0.18,
    y: 0.58,
    size: 0.85,
  },
  {
    id: "locate",
    label: "Locate",
    tagline: "Spatial intelligence",
    emoji: "◉",
    enabled: false,
    x: 0.82,
    y: 0.55,
    size: 0.88,
  },
  {
    id: "meets",
    label: "Meets",
    tagline: "Safe connections",
    emoji: "○",
    enabled: false,
    x: 0.5,
    y: 0.72,
    size: 0.82,
  },
];
