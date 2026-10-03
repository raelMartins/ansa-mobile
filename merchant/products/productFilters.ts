import type { MerchantProduct } from "../types";

export type ProductFilter = "all" | "active" | "low";

const LOW_STOCK_MAX = 3;

export function filterProducts(products: MerchantProduct[], filter: ProductFilter, query: string): MerchantProduct[] {
  const q = query.trim().toLowerCase();
  let list = products.filter((p) => p.status !== "archived");
  if (filter === "active") {
    list = list.filter((p) => p.status === "published");
  } else if (filter === "low") {
    list = list.filter((p) => p.kind === "product" && p.qtyAvailable <= LOW_STOCK_MAX);
  }
  if (!q) return list;
  return list.filter(
    (p) => p.title.toLowerCase().includes(q) || (p.sku?.toLowerCase().includes(q) ?? false),
  );
}

export function filterCounts(products: MerchantProduct[]) {
  const visible = products.filter((p) => p.status !== "archived");
  const active = visible.filter((p) => p.status === "published");
  const low = visible.filter((p) => p.kind === "product" && p.qtyAvailable <= LOW_STOCK_MAX);
  return { all: visible.length, active: active.length, low: low.length };
}
