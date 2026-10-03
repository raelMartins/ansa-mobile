/**
 * Motion: tab switches use React Navigation default cross-fade; header is static wordmark.
 */
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Platform, View } from "react-native";
import { Wordmark } from "../../core/ui/Wordmark";
import { brand } from "../../core/ui/brandColors";
import { useTheme } from "../../core/ui/ThemeContext";
import { OverviewScreen } from "../overview/screens/OverviewScreen";
import { ProductsStack } from "../products/ProductsStack";
import { ModuleComingSoonScreen } from "./ModuleComingSoonScreen";
import { MoreScreen } from "./MoreScreen";
import {
  TabIconMore,
  TabIconOrders,
  TabIconOverview,
  TabIconProducts,
} from "../ui/MerchantTabIcons";
import type { MerchantTabParamList } from "../../core/navigation/types";
import { MerchantHeaderNotificationButton } from "../ui/MerchantHeaderNotification";
import { MerchantGlassTabBarBackground, merchantGlassTabBarStyle } from "./MerchantGlassTabBar";

const Tab = createBottomTabNavigator<MerchantTabParamList>();

const TAB_ICON = 22;

export function MerchantTabs() {
  const { colors, fonts } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.bg,
          ...Platform.select({
            ios: { shadowColor: brand.forest, shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 } },
            android: { elevation: 2 },
          }),
        },
        headerShadowVisible: false,
        headerTintColor: colors.text,
        headerTitleStyle: { fontFamily: fonts.semiBold },
        tabBarBackground: () => <MerchantGlassTabBarBackground />,
        tabBarStyle: merchantGlassTabBarStyle,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: { fontFamily: fonts.medium, fontSize: 11, marginBottom: Platform.OS === "ios" ? 0 : 8 },
        headerTitle: () => (
          <View style={{ marginLeft: -4 }}>
            <Wordmark height={16} badge={false} />
          </View>
        ),
        headerTitleAlign: "left",
        sceneStyle: { backgroundColor: colors.bg },
      }}
    >
      <Tab.Screen
        name="Overview"
        component={OverviewScreen}
        options={{
          title: "Overview",
          headerRight: () => <MerchantHeaderNotificationButton />,
          tabBarIcon: ({ color }) => <TabIconOverview color={color} size={TAB_ICON} />,
        }}
      />
      <Tab.Screen
        name="Products"
        component={ProductsStack}
        options={{
          title: "Products",
          headerShown: false,
          tabBarIcon: ({ color }) => <TabIconProducts color={color} size={TAB_ICON} />,
        }}
      />
      <Tab.Screen
        name="Orders"
        children={() => <ModuleComingSoonScreen module="orders" />}
        options={{
          title: "Orders",
          tabBarIcon: ({ color }) => <TabIconOrders color={color} size={TAB_ICON} />,
        }}
      />
      <Tab.Screen
        name="More"
        component={MoreScreen}
        options={{
          title: "More",
          tabBarIcon: ({ color }) => <TabIconMore color={color} size={TAB_ICON} />,
        }}
      />
    </Tab.Navigator>
  );
}
