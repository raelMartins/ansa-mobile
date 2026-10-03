import { filterCounts, filterCustomers } from "./customerFilters";
import type { MerchantCustomer } from "../types";

function customer(partial: Partial<MerchantCustomer> & Pick<MerchantCustomer, "name" | "phone" | "orders">): MerchantCustomer {
  return {
    email: null,
    paidOrders: partial.orders ?? 1,
    spentKobo: 1000,
    firstOrderAt: new Date().toISOString(),
    lastOrderAt: new Date().toISOString(),
    ...partial,
  };
}

describe("customerFilters", () => {
  const customers = [
    customer({ name: "Ada", phone: "+1", orders: 1 }),
    customer({ name: "Ben", phone: "+2", orders: 3 }),
    customer({ name: "Chi", phone: "+3", orders: 2 }),
  ];

  it("counts filters", () => {
    const counts = filterCounts(customers);
    expect(counts.all).toBe(3);
    expect(counts.new).toBe(1);
    expect(counts.returning).toBe(2);
  });

  it("searches by name", () => {
    const list = filterCustomers(customers, "all", "ben");
    expect(list).toHaveLength(1);
    expect(list[0].name).toBe("Ben");
  });
});
