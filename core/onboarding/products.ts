import type { AnsaProductId } from "./onboardingStorage";

export type AnsaProductOption = {
  id: AnsaProductId;
  label: string;
  tagline: string;
  enabled: boolean;
  /** Normalized anchor in bubble field (0–1). */
  x: number;
  y: number;
  /** Diameter scale vs base (merchant largest). */
  scale: number;
  /** Phase offset for drift animation (radians). */
  driftPhase: number;
};

export const ANSA_PRODUCTS: AnsaProductOption[] = [
  {
    id: "merchant",
    label: "Merchant",
    tagline: "Catalog & orders",
    enabled: true,
    x: 0.5,
    y: 0.48,
    scale: 1.22,
    driftPhase: 0,
  },
  {
    id: "delivery",
    label: "Delivery",
    tagline: "Ship with proof",
    enabled: false,
    x: 0.2,
    y: 0.32,
    scale: 1.05,
    driftPhase: 1.2,
  },
  {
    id: "jobs",
    label: "Jobs",
    tagline: "Work & bounties",
    enabled: false,
    x: 0.8,
    y: 0.3,
    scale: 1.02,
    driftPhase: 2.4,
  },
  {
    id: "check",
    label: "Check",
    tagline: "Trust & identity",
    enabled: false,
    x: 0.16,
    y: 0.62,
    scale: 0.98,
    driftPhase: 0.8,
  },
  {
    id: "locate",
    label: "Locate",
    tagline: "Maps & places",
    enabled: false,
    x: 0.84,
    y: 0.6,
    scale: 1,
    driftPhase: 3.1,
  },
  {
    id: "meets",
    label: "Meets",
    tagline: "Safe connections",
    enabled: false,
    x: 0.5,
    y: 0.76,
    scale: 0.96,
    driftPhase: 1.9,
  },
];
