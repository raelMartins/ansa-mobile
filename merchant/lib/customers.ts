import { PAYMENT_STATUS_LABEL, orderStatusLabel } from "./orders";
import type { CustomerIdentity, MerchantOrder, MerchantOrderPublic } from "../types";

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

export function customerRelationshipLabel(orders: number): string {
  if (orders > 1) return "Returning customer";
  return "New customer";
}

export function formatCustomerDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });
}

export function formatCustomerSince(iso: string): string {
  return `Customer since ${formatCustomerDate(iso)}`;
}

export function formatOrderHistoryMeta(order: MerchantOrderPublic): string {
  const date = new Date(order.createdAt).toLocaleDateString("en-NG", { day: "numeric", month: "short" });
  const payment = PAYMENT_STATUS_LABEL[order.paymentStatus];
  const status = orderStatusLabel(order);
  return `${date} · ${payment} · ${status}`;
}

export function isRecentOrder(iso: string): boolean {
  const d = new Date(iso);
  const now = new Date();
  return d.toDateString() === now.toDateString();
}
