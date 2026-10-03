import { availableOrderActions } from "./orderActions";
import type { MerchantOrder } from "../types";

function order(partial: Partial<MerchantOrder> & Pick<MerchantOrder, "orderStatus" | "paymentStatus">): MerchantOrder {
  return {
    id: "o1",
    merchantId: "m1",
    merchantName: "Shop",
    reference: "ANSA-1",
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

describe("availableOrderActions", () => {
  it("offers packing for paid confirmed orders", () => {
    const actions = availableOrderActions(order({ orderStatus: "confirmed", paymentStatus: "paid" }));
    expect(actions.some((a) => a.status === "processing" && a.primary)).toBe(true);
  });

  it("allows cancel when payment is pending", () => {
    const actions = availableOrderActions(order({ orderStatus: "pending", paymentStatus: "pending" }));
    expect(actions).toEqual([{ status: "cancelled", label: "Cancel order", destructive: true }]);
  });

  it("returns no actions for delivered orders", () => {
    expect(availableOrderActions(order({ orderStatus: "delivered", paymentStatus: "paid" }))).toEqual([]);
  });
});
