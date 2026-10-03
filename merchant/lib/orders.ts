import type { MerchantOrderPublic } from "../types";

export function orderStatusLabel(order: MerchantOrderPublic): string {
  if (order.orderStatus === "ready") return "Ready for pickup";
  if (order.orderStatus === "processing") return "Packing";
  if (order.orderStatus === "out_for_delivery") return "Out for delivery";
  if (order.orderStatus === "delivered") return "Delivered";
  if (order.orderStatus === "cancelled") return "Cancelled";
  if (order.paymentStatus === "paid") return "Paid";
  if (order.paymentStatus === "pending") return "Awaiting payment";
  return "Unfulfilled";
}

export function orderStatusTone(order: MerchantOrderPublic): "neutral" | "warn" | "success" | "muted" {
  if (order.orderStatus === "ready") return "success";
  if (order.orderStatus === "processing") return "warn";
  if (order.orderStatus === "delivered") return "muted";
  if (order.paymentStatus === "paid") return "neutral";
  return "muted";
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
