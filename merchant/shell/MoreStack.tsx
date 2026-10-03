import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Platform } from "react-native";
import type { MoreStackParamList } from "../../core/navigation/types";
import { brand } from "../../core/ui/brandColors";
import { useTheme } from "../../core/ui/ThemeContext";
import { CustomerDetailScreen } from "../customers/screens/CustomerDetailScreen";
import { CustomerListScreen } from "../customers/screens/CustomerListScreen";
import { MoreScreen } from "./MoreScreen";

const Stack = createNativeStackNavigator<MoreStackParamList>();

export function MoreStack() {
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
      <Stack.Screen name="MoreMenu" component={MoreScreen} options={{ headerShown: false }} />
      <Stack.Screen name="CustomerList" component={CustomerListScreen} options={{ title: "Customers" }} />
      <Stack.Screen name="CustomerDetail" component={CustomerDetailScreen} options={{ title: "Customer" }} />
    </Stack.Navigator>
  );
}
