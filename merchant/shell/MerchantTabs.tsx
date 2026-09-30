import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { View } from "react-native";
import { Wordmark } from "../../core/ui/Wordmark";
import { useTheme } from "../../core/ui/ThemeContext";
import { OverviewScreen } from "../overview/screens/OverviewScreen";
import { ModulePlaceholderScreen } from "./ModulePlaceholderScreen";
import { MoreScreen } from "./MoreScreen";
import type { MerchantTabParamList } from "../../core/navigation/types";

const Tab = createBottomTabNavigator<MerchantTabParamList>();

export function MerchantTabs() {
  const { colors, fonts } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.bg },
        headerTintColor: colors.text,
        headerTitleStyle: { fontFamily: fonts.semiBold },
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: { fontFamily: fonts.medium, fontSize: 11 },
        headerTitle: () => (
          <View style={{ marginLeft: -4 }}>
            <Wordmark height={16} badge={false} />
          </View>
        ),
        headerTitleAlign: "left",
      }}
    >
      <Tab.Screen name="Overview" component={OverviewScreen} options={{ title: "Overview" }} />
      <Tab.Screen
        name="Products"
        children={() => (
          <ModulePlaceholderScreen
            title="Products"
            description="Catalog list and editing will be added in the next step."
          />
        )}
      />
      <Tab.Screen
        name="Orders"
        children={() => (
          <ModulePlaceholderScreen
            title="Orders"
            description="Order management will be added after products."
          />
        )}
      />
      <Tab.Screen name="More" component={MoreScreen} options={{ title: "More" }} />
    </Tab.Navigator>
  );
}
