import { filterCounts, filterOrders } from "./orderFilters";
import type { MerchantOrder } from "../types";

function order(partial: Partial<MerchantOrder> & Pick<MerchantOrder, "id" | "orderStatus" | "paymentStatus">): MerchantOrder {
  return {
    merchantId: "m1",
    merchantName: "Shop",
    reference: partial.reference ?? "ANSA-1",
    customerName: "Ada",
    customerPhone: "+234",
    customerEmail: null,
    fulfilment: "pickup",
    deliveryAddress: null,
    deliveryInstructions: null,
    deliveryFeeKobo: 0,
    subtotalKobo: 1000,
    totalKobo: 1000,
    paymentProvider: "mock",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    items: [],
    ...partial,
  };
}

describe("orderFilters", () => {
  const orders = [
    order({ id: "1", orderStatus: "confirmed", paymentStatus: "paid" }),
    order({ id: "2", orderStatus: "ready", paymentStatus: "paid" }),
    order({ id: "3", orderStatus: "delivered", paymentStatus: "paid" }),
    order({ id: "4", orderStatus: "cancelled", paymentStatus: "pending" }),
  ];

  it("counts filters", () => {
    const counts = filterCounts(orders);
    expect(counts.all).toBe(4);
    expect(counts.attention).toBe(1);
    expect(counts.ready).toBe(1);
    expect(counts.completed).toBe(1);
    expect(counts.cancelled).toBe(1);
  });

  it("filters attention orders", () => {
    const list = filterOrders(orders, "attention");
    expect(list.map((o) => o.id)).toEqual(["1"]);
  });
});
