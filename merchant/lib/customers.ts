import type { CustomerIdentity, MerchantOrder } from "../types";

const GUEST_SUFFIX = "@guest.ansa.local";

export function isGuestCustomerEmail(email: string | null): boolean {
  return !email || email.endsWith(GUEST_SUFFIX);
}

export function customerIdentityFromOrder(order: Pick<MerchantOrder, "customerName" | "customerPhone" | "customerEmail">): CustomerIdentity {
  return {
    name: order.customerName,
    phone: order.customerPhone,
    email: order.customerEmail,
  };
}

export function customerLocationLabel(orders: number): string {
  if (orders === 1) return "1 order";
  return `${orders} orders`;
}

export function formatCustomerDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });
}
