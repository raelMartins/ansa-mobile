type Rgb = { r: number; g: number; b: number };

function parseHex(hex: string): Rgb {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const n = parseInt(full.slice(0, 6), 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function toHex({ r, g, b }: Rgb): string {
  const c = (v: number) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, "0");
  return `#${c(r)}${c(g)}${c(b)}`;
}

/** Linear blend: `amount` 0 → `a`, 1 → `b`. */
export function mix(a: string, b: string, amount: number): string {
  const x = parseHex(a);
  const y = parseHex(b);
  return toHex({
    r: x.r + (y.r - x.r) * amount,
    g: x.g + (y.g - x.g) * amount,
    b: x.b + (y.b - x.b) * amount,
  });
}

export function withAlpha(hex: string, alpha: number): string {
  const { r, g, b } = parseHex(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function channel(v: number): number {
  const s = v / 255;
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}

export function luminance(hex: string): number {
  const { r, g, b } = parseHex(hex);
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

/** WCAG contrast ratio (1–21). */
export function contrast(a: string, b: string): number {
  const la = luminance(a);
  const lb = luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

export function isDark(hex: string): boolean {
  return luminance(hex) < 0.22;
}

/**
 * Icon tone steps (founder rule, Oct 2026). "Two shades lighter" is pinned to the
 * forest → sage relationship in the master SVG (≈49% toward white).
 */
export const ICON_SECONDARY_STEP = 0.49;
export const ICON_LIGHT_TINT_STEP = 0.88;

export function iconSecondary(primary: string): string {
  return mix(primary, "#ffffff", ICON_SECONDARY_STEP);
}

export function iconLightTint(primary: string): string {
  return mix(primary, "#ffffff", ICON_LIGHT_TINT_STEP);
}

/**
 * Light curve: white when it separates from the surface; otherwise the lightest
 * primary tint that still reads against it.
 */
export function iconCurveColor(primary: string, background: string): string {
  if (contrast("#ffffff", background) >= 1.5) {
    return "#ffffff";
  }
  for (let amount = ICON_LIGHT_TINT_STEP; amount > 0.5; amount -= 0.02) {
    const tint = mix(primary, "#ffffff", amount);
    if (contrast(tint, background) >= 1.4) {
      return tint;
    }
  }
  return iconSecondary(primary);
}

/** Single-colour knockout for marks sitting on a solid colour. */
export function knockoutOn(background: string): string {
  return contrast("#ffffff", background) >= contrast("#111111", background) ? "#ffffff" : "#111111";
}
