import { orderNeedsAttention, orderStatusLabel, orderStatusTone, paymentStatusTone } from "./orders";
import type { MerchantOrderPublic } from "../types";

const base: MerchantOrderPublic = {
  id: "1",
  reference: "ANSA-1",
  customerName: "Ada",
  customerPhone: "+234",
  totalKobo: 1000,
  paymentStatus: "paid",
  orderStatus: "confirmed",
  createdAt: new Date().toISOString(),
};

describe("orders lib", () => {
  it("labels awaiting payment", () => {
    expect(
      orderStatusLabel({ ...base, paymentStatus: "pending", orderStatus: "pending" }),
    ).toBe("Awaiting payment");
  });

  it("flags paid unfulfilled orders as needing attention", () => {
    expect(orderNeedsAttention(base)).toBe(true);
    expect(orderNeedsAttention({ ...base, orderStatus: "delivered" })).toBe(false);
  });

  it("maps distinct pill tones per fulfilment status", () => {
    expect(orderStatusTone({ ...base, orderStatus: "confirmed" })).toBe("newOrder");
    expect(orderStatusTone({ ...base, orderStatus: "processing" })).toBe("packing");
    expect(orderStatusTone({ ...base, orderStatus: "ready" })).toBe("ready");
    expect(orderStatusTone({ ...base, orderStatus: "out_for_delivery" })).toBe("inTransit");
    expect(orderStatusTone({ ...base, orderStatus: "delivered" })).toBe("delivered");
    expect(orderStatusTone({ ...base, orderStatus: "cancelled" })).toBe("cancelled");
    expect(
      orderStatusTone({ ...base, paymentStatus: "pending", orderStatus: "pending" }),
    ).toBe("awaitingPayment");
  });

  it("maps payment pill tones", () => {
    expect(paymentStatusTone("paid")).toBe("paid");
    expect(paymentStatusTone("failed")).toBe("paymentFailed");
    expect(paymentStatusTone("pending")).toBe("awaitingPayment");
  });
});
