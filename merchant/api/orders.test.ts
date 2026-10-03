import type { ApiClient } from "../../core/api/client";
import { fetchOrder, listOrders, updateOrderStatus } from "./orders";

describe("orders api", () => {
  it("lists orders for merchant", async () => {
    const api: ApiClient = {
      request: jest.fn(async (path) => {
        expect(path).toBe("/v1/me/merchants/m1/orders");
        return { orders: [{ id: "o1", reference: "ANSA-ABC" }] };
      }),
      post: jest.fn(),
      patch: jest.fn(),
      logout: jest.fn(),
    };
    const orders = await listOrders(api, "m1");
    expect(orders).toHaveLength(1);
  });

  it("fetches a single order", async () => {
    const api: ApiClient = {
      request: jest.fn(async (path) => {
        expect(path).toBe("/v1/me/merchants/m1/orders/o1");
        return { order: { id: "o1", reference: "ANSA-ABC" } };
      }),
      post: jest.fn(),
      patch: jest.fn(),
      logout: jest.fn(),
    };
    const order = await fetchOrder(api, "m1", "o1");
    expect(order.reference).toBe("ANSA-ABC");
  });

  it("patches order status", async () => {
    const api: ApiClient = {
      request: jest.fn(),
      post: jest.fn(),
      patch: jest.fn(async (path, body) => {
        expect(path).toBe("/v1/me/merchants/m1/orders/o1");
        expect(body).toEqual({ status: "processing" });
        return { order: { id: "o1", orderStatus: "processing" } };
      }),
      logout: jest.fn(),
    };
    const res = await updateOrderStatus(api, "m1", "o1", "processing");
    expect(res.order.orderStatus).toBe("processing");
  });
});
