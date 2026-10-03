import type { ApiClient } from "../core/api/client";
import { ApiError } from "../core/api/errors";
import { bootstrapMerchant } from "./bootstrap";

const merchant = {
  id: "m1",
  name: "Demo",
  slug: "demo",
  description: null,
  category: "Fashion",
  phone: "+234800",
  whatsapp: null,
  location: null,
  logoUrl: null,
  coverUrl: null,
  instagramHandle: null,
  tiktokHandle: null,
  xHandle: null,
  onboardingCompleted: true,
};

function apiWith(handler: () => Promise<unknown>): ApiClient {
  return {
    request: jest.fn().mockImplementation(handler),
    post: jest.fn(),
    patch: jest.fn(),
    logout: jest.fn(),
  };
}

describe("bootstrapMerchant", () => {
  it("returns ready when a merchant exists", async () => {
    const api = apiWith(async () => ({ merchants: [merchant] }));
    const result = await bootstrapMerchant(api);
    expect(result).toEqual({ status: "ready", merchant, merchants: [merchant] });
  });

  it("returns missing when list is empty", async () => {
    const api = apiWith(async () => ({ merchants: [] }));
    expect(await bootstrapMerchant(api)).toEqual({ status: "missing" });
  });

  it("returns unauthorized on 401", async () => {
    const api = apiWith(async () => {
      throw new ApiError(401, "UNAUTHORIZED", "Authentication required");
    });
    expect(await bootstrapMerchant(api)).toEqual({ status: "unauthorized" });
  });

  it("returns error on network failure", async () => {
    const api = apiWith(async () => {
      throw new ApiError(0, "NETWORK", "offline");
    });
    const result = await bootstrapMerchant(api);
    expect(result.status).toBe("error");
  });
});
