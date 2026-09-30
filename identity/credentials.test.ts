import { parseLoginIdentifier, validateEmail, validatePassword } from "./credentials";

describe("parseLoginIdentifier", () => {
  it("parses email", () => {
    expect(parseLoginIdentifier("zola@demo.ansa")).toEqual({ email: "zola@demo.ansa" });
  });

  it("parses phone", () => {
    expect(parseLoginIdentifier("+2348012345678")).toEqual({ phone: "+2348012345678" });
  });

  it("rejects empty", () => {
    expect(parseLoginIdentifier("  ")).toBeNull();
  });
});

describe("validatePassword", () => {
  it("requires 8 chars on register", () => {
    expect(validatePassword("short", true)).toMatch(/8/);
  });
});

describe("validateEmail", () => {
  it("rejects invalid email", () => {
    expect(validateEmail("not-email")).toMatch(/valid/);
  });
});
