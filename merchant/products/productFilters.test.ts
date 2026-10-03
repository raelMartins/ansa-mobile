import { filterCounts, filterProducts } from "./productFilters";
import type { MerchantProduct } from "../types";

const base: MerchantProduct = {
  id: "1",
  merchantId: "m",
  title: "Shirt",
  description: null,
  priceKobo: 100,
  compareAtKobo: null,
  currency: "NGN",
  status: "published",
  slug: "shirt",
  imageUrls: [],
  kind: "product",
  qtyAvailable: 2,
  qtySold: 0,
  sku: "SKU-1",
  category: null,
  durationMinutes: null,
  availabilityNote: null,
  createdAt: "",
  updatedAt: "",
};

describe("productFilters", () => {
  it("counts active and low stock", () => {
    const counts = filterCounts([base, { ...base, id: "2", status: "draft", qtyAvailable: 10 }]);
    expect(counts.active).toBe(1);
    expect(counts.low).toBe(1);
  });

  it("filters by sku query", () => {
    const list = filterProducts([base], "all", "sku-1");
    expect(list).toHaveLength(1);
  });
});
