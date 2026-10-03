import type { MerchantOrder, OrderStatus } from "../types";

export type OrderAction = {
  status: OrderStatus;
  label: string;
  destructive?: boolean;
  primary?: boolean;
};

export function orderLineSummary(order: MerchantOrder): string {
  if (order.items.length === 0) return "No items";
  const parts = order.items.slice(0, 2).map((i) => `${i.quantity}× ${i.title}`);
  if (order.items.length > 2) parts.push(`+${order.items.length - 2} more`);
  return parts.join(", ");
}

export function availableOrderActions(order: MerchantOrder): OrderAction[] {
  const { orderStatus, paymentStatus, fulfilment } = order;
  if (orderStatus === "delivered" || orderStatus === "cancelled") return [];

  const actions: OrderAction[] = [];

  if (paymentStatus !== "paid") {
    actions.push({ status: "cancelled", label: "Cancel order", destructive: true });
    return actions;
  }

  if (orderStatus === "confirmed") {
    actions.push({ status: "processing", label: "Start packing", primary: true });
  } else if (orderStatus === "processing") {
    actions.push({ status: "ready", label: "Mark ready", primary: true });
  } else if (orderStatus === "ready") {
    if (fulfilment === "delivery") {
      actions.push({ status: "out_for_delivery", label: "Out for delivery", primary: true });
    } else {
      actions.push({ status: "delivered", label: "Mark picked up", primary: true });
    }
  } else if (orderStatus === "out_for_delivery") {
    actions.push({ status: "delivered", label: "Mark delivered", primary: true });
  } else if (orderStatus === "pending" && paymentStatus === "paid") {
    actions.push({ status: "confirmed", label: "Confirm order", primary: true });
  }

  actions.push({ status: "cancelled", label: "Cancel order", destructive: true });

  return actions;
}
