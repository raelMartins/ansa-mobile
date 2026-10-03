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

export type MoreStackParamList = {
  MoreMenu: undefined;
  CustomerList: undefined;
  CustomerDetail: CustomerDetailParams;
};

export type MerchantTabParamList = {
  Overview: undefined;
  Products: NavigatorScreenParams<ProductsStackParamList>;
  Orders: NavigatorScreenParams<OrdersStackParamList>;
  More: NavigatorScreenParams<MoreStackParamList>;
};
