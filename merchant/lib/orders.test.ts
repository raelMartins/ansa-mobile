import { orderNeedsAttention, orderStatusLabel } from "./orders";
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
});
