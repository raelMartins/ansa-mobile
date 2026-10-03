import { customerIdentityFromOrder, isGuestCustomerEmail } from "./customers";
import type { MerchantOrder } from "../types";

const order: Pick<MerchantOrder, "customerName" | "customerPhone" | "customerEmail"> = {
  customerName: "Ada",
  customerPhone: "+234801",
  customerEmail: "801@guest.ansa.local",
};

describe("customers lib", () => {
  it("detects guest email", () => {
    expect(isGuestCustomerEmail("x@guest.ansa.local")).toBe(true);
    expect(isGuestCustomerEmail("buyer@example.com")).toBe(false);
  });

  it("builds identity from order", () => {
    expect(customerIdentityFromOrder(order)).toEqual({
      name: "Ada",
      phone: "+234801",
      email: "801@guest.ansa.local",
    });
  });
});
