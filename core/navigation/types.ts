import type { NavigatorScreenParams } from "@react-navigation/native";

export type ProductsStackParamList = {
  ProductList: undefined;
  ProductDetail: { productId: string };
  ProductAdd: undefined;
  ProductEdit: { productId: string };
  ProductSaved: { productId: string };
};

export type OrderListFilterParam = "all" | "attention" | "ready" | "completed" | "cancelled";

export type OrdersStackParamList = {
  OrderList: { filter?: OrderListFilterParam } | undefined;
  OrderDetail: { orderId: string };
};

export type CustomerDetailParams = {
  name: string;
  phone: string;
  email: string | null;
};

export type CustomersStackParamList = {
  CustomerList: undefined;
  CustomerDetail: CustomerDetailParams;
};

export type MoreStackParamList = {
  MoreMenu: undefined;
  StorefrontPreview: undefined;
};

export type MerchantTabParamList = {
  Overview: undefined;
  Products: NavigatorScreenParams<ProductsStackParamList>;
  Orders: NavigatorScreenParams<OrdersStackParamList>;
  Customers: NavigatorScreenParams<CustomersStackParamList>;
  More: NavigatorScreenParams<MoreStackParamList>;
};
