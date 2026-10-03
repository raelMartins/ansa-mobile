import type { MerchantCustomer } from "../types";

export type CustomerFilter = "all" | "returning" | "new";

export function filterCustomers(customers: MerchantCustomer[], filter: CustomerFilter, query: string): MerchantCustomer[] {
  const q = query.trim().toLowerCase();
  let list = customers;

  if (filter === "returning") {
    list = list.filter((c) => c.orders > 1);
  } else if (filter === "new") {
    list = list.filter((c) => c.orders === 1);
  }

  if (!q) return list;

  return list.filter((c) => {
    const name = c.name.toLowerCase();
    const phone = c.phone.toLowerCase();
    const email = c.email?.toLowerCase() ?? "";
    return name.includes(q) || phone.includes(q) || email.includes(q);
  });
}

export function filterCounts(customers: MerchantCustomer[]) {
  return {
    all: customers.length,
    returning: customers.filter((c) => c.orders > 1).length,
    new: customers.filter((c) => c.orders === 1).length,
  };
}
