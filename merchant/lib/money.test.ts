import { formatNairaFromKobo, parseNairaToKobo } from "./money";

describe("money", () => {
  it("formats kobo as naira", () => {
    expect(formatNairaFromKobo(2400000)).toBe("₦24,000");
  });

  it("parses naira strings to kobo", () => {
    expect(parseNairaToKobo("24,000")).toBe(2400000);
    expect(parseNairaToKobo("₦100")).toBe(10000);
  });
});
