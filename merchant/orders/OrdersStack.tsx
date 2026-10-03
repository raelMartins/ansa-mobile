import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Platform, View } from "react-native";
import type { OrdersStackParamList } from "../../core/navigation/types";
import { Wordmark } from "../../core/ui/Wordmark";
import { brand } from "../../core/ui/brandColors";
import { useTheme } from "../../core/ui/ThemeContext";
import { MerchantHeaderNotificationButton } from "../ui/MerchantHeaderNotification";
import { OrderDetailScreen } from "./screens/OrderDetailScreen";
import { OrderListScreen } from "./screens/OrderListScreen";

const Stack = createNativeStackNavigator<OrdersStackParamList>();

export function OrdersStack() {
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
        name="OrderList"
        component={OrderListScreen}
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
      <Stack.Screen
        name="OrderDetail"
        component={OrderDetailScreen}
        options={{ title: "Order detail" }}
      />
    </Stack.Navigator>
  );
}
