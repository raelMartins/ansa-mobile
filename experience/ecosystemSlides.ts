export type EcosystemSlide = {
  key: string;
  eyebrow: string;
  title: string;
  body: string;
  accent: string;
  /** Render wordmark as eyebrow instead of eyebrow text. */
  brandEyebrow?: boolean;
  /** Title is “{title}” + inline wordmark (see EcosystemIntroScreen). */
  titleWithBrand?: boolean;
  /** Body includes inline wordmark before “ ID.” */
  bodyWithBrandId?: boolean;
};

export const ECOSYSTEM_SLIDES: EcosystemSlide[] = [
  {
    key: "platform",
    eyebrow: "",
    brandEyebrow: true,
    title: "One trusted platform",
    body: "Commerce, logistics, jobs, identity, and community — connected by your",
    bodyWithBrandId: true,
    accent: "#e3d096",
  },
  {
    key: "merchant",
    eyebrow: "merchant",
    title: "Sell with confidence",
    body: "Mobile catalog, WhatsApp-ready storefront, and paid orders built for Nigerian businesses.",
    accent: "#d4dcd5",
  },
  {
    key: "delivery",
    eyebrow: "delivery",
    title: "Move what matters",
    body: "Proof-of-delivery, riders, and logistics that respect real-world constraints.",
    accent: "#93a097",
  },
  {
    key: "jobs",
    eyebrow: "jobs",
    title: "Work that pays fairly",
    body: "Verified people, escrowed bounties, and gigs you can trust.",
    accent: "#e3d096",
  },
  {
    key: "trust",
    eyebrow: "check · locate · meets",
    title: "Trust where you need it",
    body: "Identity, spatial signals, and safer connections — shared across every product.",
    accent: "#cdd5ce",
  },
  {
    key: "start",
    eyebrow: "your move",
    title: "Choose your",
    titleWithBrand: true,
    body: "Sign in once. Pick the product you need today — more unlock as we ship.",
    accent: "#e3eae4",
  },
];
