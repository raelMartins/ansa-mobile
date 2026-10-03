import type { MerchantOrderPublic, OrderStatus, PaymentStatus } from "../types";

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  pending: "Pending",
  confirmed: "New order",
  processing: "Packing",
  ready: "Ready for pickup",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export const PAYMENT_STATUS_LABEL: Record<PaymentStatus, string> = {
  pending: "Awaiting payment",
  paid: "Paid",
  failed: "Payment failed",
};

type OrderLike = Pick<MerchantOrderPublic, "paymentStatus" | "orderStatus">;

export function orderStatusLabel(order: OrderLike): string {
  if (order.paymentStatus === "pending" && order.orderStatus === "pending") {
    return PAYMENT_STATUS_LABEL.pending;
  }
  if (order.paymentStatus === "failed") return PAYMENT_STATUS_LABEL.failed;
  return ORDER_STATUS_LABEL[order.orderStatus as OrderStatus] ?? order.orderStatus;
}

export function orderStatusTone(order: OrderLike): "neutral" | "warn" | "success" | "muted" {
  if (order.orderStatus === "ready" || order.orderStatus === "out_for_delivery") return "success";
  if (order.orderStatus === "processing" || order.orderStatus === "confirmed") return "warn";
  if (order.orderStatus === "delivered") return "muted";
  if (order.orderStatus === "cancelled") return "muted";
  if (order.paymentStatus === "pending") return "warn";
  return "neutral";
}

export function orderNeedsAttention(order: OrderLike): boolean {
  if (order.orderStatus === "cancelled" || order.orderStatus === "delivered") return false;
  if (order.paymentStatus !== "paid") return order.paymentStatus === "pending";
  return ["pending", "confirmed", "processing"].includes(order.orderStatus);
}

export function formatOrderTime(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  if (sameDay) {
    return d.toLocaleTimeString("en-NG", { hour: "numeric", minute: "2-digit" });
  }
  return d.toLocaleDateString("en-NG", { day: "numeric", month: "short" });
}
