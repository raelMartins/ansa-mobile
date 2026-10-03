import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Platform, View } from "react-native";
import type { ProductsStackParamList } from "../../core/navigation/types";
import { Wordmark } from "../../core/ui/Wordmark";
import { brand } from "../../core/ui/brandColors";
import { useTheme } from "../../core/ui/ThemeContext";
import { ProductAddScreen, ProductEditScreen } from "./screens/ProductFormScreen";
import { ProductDetailScreen } from "./screens/ProductDetailScreen";
import { ProductListScreen } from "./screens/ProductListScreen";
import { ProductSavedScreen } from "./screens/ProductSavedScreen";
import { MerchantHeaderNotificationButton } from "../ui/MerchantHeaderNotification";

const Stack = createNativeStackNavigator<ProductsStackParamList>();

export function ProductsStack() {
  const { colors, fonts } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.bg,
          ...Platform.select({
            ios: { shadowColor: brand.forest, shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 } },
            android: {},
          }),
        },
        headerShadowVisible: false,
        headerTintColor: colors.text,
        headerTitleStyle: { fontFamily: fonts.semiBold, fontSize: 17 },
        contentStyle: { backgroundColor: colors.bg },
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen
        name="ProductList"
        component={ProductListScreen}
        options={{
          headerTitle: () => (
            <View style={{ marginLeft: -4 }}>
              <Wordmark height={16} badge={false} />
            </View>
          ),
          headerTitleAlign: "left",
          headerRight: () => <MerchantHeaderNotificationButton />,
        }}
      />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} options={{ title: "Product detail" }} />
      <Stack.Screen name="ProductAdd" component={ProductAddScreen} options={{ title: "Add product" }} />
      <Stack.Screen name="ProductEdit" component={ProductEditScreen} options={{ title: "Edit product" }} />
      <Stack.Screen name="ProductSaved" component={ProductSavedScreen} options={{ title: "Product saved", headerBackVisible: false }} />
    </Stack.Navigator>
  );
}
