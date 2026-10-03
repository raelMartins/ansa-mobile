import type { StatusPillTone } from "../ui/StatusPill";
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

export function orderStatusTone(order: OrderLike): StatusPillTone {
  if (order.paymentStatus === "failed") return "paymentFailed";
  if (order.paymentStatus === "pending" && order.orderStatus === "pending") return "awaitingPayment";

  switch (order.orderStatus as OrderStatus) {
    case "confirmed":
      return "newOrder";
    case "processing":
      return "packing";
    case "ready":
      return "ready";
    case "out_for_delivery":
      return "inTransit";
    case "delivered":
      return "delivered";
    case "cancelled":
      return "cancelled";
    case "pending":
      return "orderPending";
    default:
      return "neutral";
  }
}

export function paymentStatusTone(status: PaymentStatus): StatusPillTone {
  if (status === "paid") return "paid";
  if (status === "failed") return "paymentFailed";
  return "awaitingPayment";
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
