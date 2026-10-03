import type { ApiClient } from "../../core/api/client";
import { fetchMerchantOverview } from "./overview";

describe("fetchMerchantOverview", () => {
  it("requests the scoped overview path", async () => {
    const api: ApiClient = {
      request: jest.fn(async (path) => {
        expect(path).toBe("/v1/me/merchants/m1/overview");
        return { merchant: { id: "m1", name: "Shop" } };
      }),
      post: jest.fn(),
      patch: jest.fn(),
      logout: jest.fn(),
    };
    const data = await fetchMerchantOverview(api, "m1");
    expect(data.merchant.name).toBe("Shop");
  });
});
