import { orderNeedsAttention } from "../lib/orders";
import type { MerchantOrder } from "../types";

export type OrderFilter = "all" | "attention" | "ready" | "completed" | "cancelled";

export function filterOrders(orders: MerchantOrder[], filter: OrderFilter, query = ""): MerchantOrder[] {
  const q = query.trim().toLowerCase();
  let list = orders;

  if (filter === "attention") {
    list = orders.filter((o) => orderNeedsAttention(o));
  } else if (filter === "ready") {
    list = orders.filter((o) => o.orderStatus === "ready" || o.orderStatus === "out_for_delivery");
  } else if (filter === "completed") {
    list = orders.filter((o) => o.orderStatus === "delivered");
  } else if (filter === "cancelled") {
    list = orders.filter((o) => o.orderStatus === "cancelled");
  }

  if (!q) return list;

  return list.filter((o) => {
    const ref = o.reference.toLowerCase();
    const name = o.customerName.toLowerCase();
    const phone = o.customerPhone.toLowerCase();
    return ref.includes(q) || name.includes(q) || phone.includes(q);
  });
}

export function filterCounts(orders: MerchantOrder[]) {
  return {
    all: orders.length,
    attention: orders.filter((o) => orderNeedsAttention(o)).length,
    ready: orders.filter((o) => o.orderStatus === "ready" || o.orderStatus === "out_for_delivery").length,
    completed: orders.filter((o) => o.orderStatus === "delivered").length,
    cancelled: orders.filter((o) => o.orderStatus === "cancelled").length,
  };
}
