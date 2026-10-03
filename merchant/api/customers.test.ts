import type { ApiClient } from "../../core/api/client";
import { fetchCustomerDetail, listCustomers } from "./customers";

describe("customers api", () => {
  it("lists customers", async () => {
    const api: ApiClient = {
      request: jest.fn(async (path) => {
        expect(path).toBe("/v1/me/merchants/m1/customers");
        return { customers: [{ name: "Ada", phone: "+234", orders: 1 }] };
      }),
      post: jest.fn(),
      patch: jest.fn(),
      logout: jest.fn(),
    };
    const customers = await listCustomers(api, "m1");
    expect(customers).toHaveLength(1);
  });

  it("fetches customer detail with query params", async () => {
    const api: ApiClient = {
      request: jest.fn(async (path) => {
        expect(path).toContain("/v1/me/merchants/m1/customers/detail?");
        expect(path).toContain("name=Ada");
        return { customer: { name: "Ada", phone: "+234", orders: 1, isGuest: true }, orders: [] };
      }),
      post: jest.fn(),
      patch: jest.fn(),
      logout: jest.fn(),
    };
    const detail = await fetchCustomerDetail(api, "m1", { name: "Ada", phone: "+234", email: null });
    expect(detail.customer.name).toBe("Ada");
  });
});
