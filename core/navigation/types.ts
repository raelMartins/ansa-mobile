import type { NavigatorScreenParams } from "@react-navigation/native";

export type ProductsStackParamList = {
  ProductList: undefined;
  ProductDetail: { productId: string };
  ProductAdd: undefined;
  ProductEdit: { productId: string };
  ProductSaved: { productId: string };
};

export type MerchantTabParamList = {
  Overview: undefined;
  Products: NavigatorScreenParams<ProductsStackParamList>;
  Orders: undefined;
  More: undefined;
};
