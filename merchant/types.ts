export type Merchant = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category: string | null;
  phone: string | null;
  whatsapp: string | null;
  location: string | null;
  logoUrl: string | null;
  coverUrl: string | null;
  instagramHandle: string | null;
  tiktokHandle: string | null;
  xHandle: string | null;
  onboardingCompleted: boolean;
};

export type CreateMerchantInput = {
  name: string;
  description?: string;
  category?: string;
  phone?: string;
  whatsapp?: string;
  location?: string;
  onboardingCompleted?: boolean;
};

export type ProductStatus = "draft" | "published" | "archived";

export type MerchantProduct = {
  id: string;
  merchantId: string;
  title: string;
  description: string | null;
  priceKobo: number;
  compareAtKobo: number | null;
  currency: string;
  status: ProductStatus;
  slug: string;
  imageUrls: string[];
  kind: "product" | "service";
  qtyAvailable: number;
  qtySold: number;
  sku: string | null;
  category: string | null;
  durationMinutes: number | null;
  availabilityNote: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateProductInput = {
  title: string;
  description?: string;
  priceKobo: number;
  status?: "draft" | "published";
  imageUrls?: string[];
  qtyAvailable?: number;
  sku?: string | null;
  category?: string | null;
};

export type UpdateProductInput = Partial<CreateProductInput> & {
  status?: ProductStatus;
};

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "ready"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";

export type PaymentStatus = "pending" | "paid" | "failed";

export type MerchantOrderItem = {
  id: string;
  productId: string | null;
  title: string;
  kind: "product" | "service";
  quantity: number;
  unitPriceKobo: number;
};

export type MerchantOrder = {
  id: string;
  merchantId: string;
  merchantName: string | null;
  reference: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string | null;
  fulfilment: "pickup" | "delivery";
  deliveryAddress: string | null;
  deliveryInstructions: string | null;
  deliveryFeeKobo: number;
  subtotalKobo: number;
  totalKobo: number;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  paymentProvider: string | null;
  createdAt: string;
  updatedAt: string;
  items: MerchantOrderItem[];
};

export type UpdateOrderStatusResult = {
  order: MerchantOrder;
  notification?: { detail: string; simulated: boolean } | null;
};

export type MerchantOrderPublic = {
  id: string;
  reference: string;
  customerName: string;
  customerPhone: string;
  totalKobo: number;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  createdAt: string;
};

export type MerchantCustomer = {
  name: string;
  phone: string;
  email: string | null;
  orders: number;
  spentKobo: number;
  firstOrderAt: string;
  lastOrderAt: string;
};

export type MerchantCustomerDetail = {
  customer: MerchantCustomer & { isGuest: boolean };
  orders: MerchantOrderPublic[];
};

export type CustomerIdentity = {
  name: string;
  phone: string;
  email: string | null;
};

export type MerchantOverview = {
  merchant: {
    id: string;
    name: string;
    slug: string;
    location: string | null;
    category: string | null;
  };
  salesKobo: number;
  salesMonthKobo: number;
  salesMonthDeltaPct: number | null;
  soldOrdersMonth: number;
  orders: number;
  paidOrders: number;
  toFulfill: number;
  readyForPickup: number;
  customerCount: number;
  newCustomersMonth: number;
  products: number;
  published: number;
  lowStock: number;
  recentOrders: MerchantOrderPublic[];
  generatedAt: string;
};
