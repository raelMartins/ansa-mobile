/** Format integer kobo as Nigerian Naira for display. */
export function formatNairaFromKobo(kobo: number): string {
  const naira = kobo / 100;
  return `₦${naira.toLocaleString("en-NG", { maximumFractionDigits: 0 })}`;
}

export function parseNairaToKobo(input: string): number | null {
  const cleaned = input.replace(/[₦,\s]/g, "");
  if (!cleaned) return null;
  const naira = Number(cleaned);
  if (!Number.isFinite(naira) || naira < 0) return null;
  return Math.round(naira * 100);
}
