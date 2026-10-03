/**
 * Motion: FadeInDown on content; order rows tap with feedback.
 */
import { useNavigation, useRoute, type RouteProp } from "@react-navigation/native";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useCallback, useEffect, useState } from "react";
import { Pressable, RefreshControl, ScrollView, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { feedback } from "../../../core/feedback/feedback";
import type { MerchantTabParamList, MoreStackParamList } from "../../../core/navigation/types";
import { LoadingState, ErrorState } from "../../../core/ui/states";
import { ApiError } from "../../../core/api/errors";
import { useSession } from "../../../core/session/SessionContext";
import { useThemedStyles } from "../../../core/ui/themedStyles";
import { fetchCustomerDetail } from "../../api/customers";
import { useMerchant } from "../../MerchantContext";
import { formatCustomerDate, isGuestCustomerEmail } from "../../lib/customers";
import { formatNairaFromKobo } from "../../lib/money";
import { formatOrderTime, orderStatusLabel, orderStatusTone } from "../../lib/orders";
import type { MerchantCustomerDetail } from "../../types";
import { InfoBanner } from "../../ui/InfoBanner";
import { StatusPill } from "../../ui/StatusPill";
import { merchantCardBackground, merchantRadii } from "../../ui/merchantUi";
import { useTheme } from "../../../core/ui/ThemeContext";
import { useMerchantTabBarInset } from "../../shell/MerchantGlassTabBar";

type Route = RouteProp<MoreStackParamList, "CustomerDetail">;
type MoreNav = NativeStackNavigationProp<MoreStackParamList, "CustomerDetail">;
type TabNav = BottomTabNavigationProp<MerchantTabParamList>;

export function CustomerDetailScreen() {
  const { name, phone, email } = useRoute<Route>().params;
  const navigation = useNavigation<MoreNav>();
  const tabNavigation = navigation.getParent<TabNav>();
  const { merchantId } = useMerchant();
  const { api } = useSession();
  const { scheme } = useTheme();
  const tabBarInset = useMerchantTabBarInset();
  const [data, setData] = useState<MerchantCustomerDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!merchantId) return;
    setError(null);
    try {
      const next = await fetchCustomerDetail(api, merchantId, { name, phone, email });
      setData(next);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Could not load this customer";
      setError(message);
      setData(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [api, merchantId, name, phone, email]);

  useEffect(() => {
    setLoading(true);
    void load();
  }, [load]);

  const styles = useThemedStyles((c, f) => ({
    root: { flex: 1, backgroundColor: c.bg },
    content: { padding: 20, gap: 16 },
    head: { gap: 6 },
    name: { fontSize: 26, fontFamily: f.bold, color: c.text, letterSpacing: -0.3 },
    meta: { fontSize: 15, fontFamily: f.regular, color: c.textMuted, lineHeight: 21 },
    card: {
      backgroundColor: merchantCardBackground(scheme, c),
      borderRadius: merchantRadii.card,
      padding: 16,
      borderWidth: 1,
      borderColor: c.border,
      gap: 10,
    },
    sectionTitle: { fontSize: 16, fontFamily: f.semiBold, color: c.text },
    row: { flexDirection: "row", justifyContent: "space-between", gap: 12 },
    label: { fontSize: 13, fontFamily: f.medium, color: c.textMuted },
    value: { fontSize: 15, fontFamily: f.semiBold, color: c.text, textAlign: "right", flex: 1 },
    orderRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: c.border,
      gap: 12,
    },
    orderRef: { fontSize: 15, fontFamily: f.semiBold, color: c.text },
    orderMeta: { fontSize: 13, fontFamily: f.regular, color: c.textMuted, marginTop: 2 },
    orderRight: { alignItems: "flex-end", gap: 6 },
    hint: { fontSize: 13, fontFamily: f.regular, color: c.textMuted, lineHeight: 18 },
  }));

  if (loading) return <LoadingState label="Loading customer…" />;
  if (error || !data) return <ErrorState message={error ?? "Customer not found"} onRetry={() => void load()} />;

  const { customer, orders } = data;
  const guest = customer.isGuest || isGuestCustomerEmail(customer.email);

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={[styles.content, { paddingBottom: tabBarInset }]}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            void load();
          }}
        />
      }
    >
      <Animated.View entering={FadeInDown.duration(400).springify()} style={styles.head}>
        <Text style={styles.name}>{customer.name}</Text>
        <Text style={styles.meta}>{customer.phone}</Text>
        {!guest && customer.email ? <Text style={styles.meta}>{customer.email}</Text> : null}
        <View style={{ flexDirection: "row", gap: 8, marginTop: 4 }}>
          <StatusPill label={guest ? "Guest checkout" : "Buyer"} tone={guest ? "orderPending" : "newOrder"} />
        </View>
        {guest ? (
          <Text style={styles.hint}>Guest buyers are grouped by name and phone from checkout. No ansa account yet.</Text>
        ) : null}
      </Animated.View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Relationship</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Orders</Text>
          <Text style={styles.value}>{customer.orders}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Total spent (paid)</Text>
          <Text style={styles.value}>{formatNairaFromKobo(customer.spentKobo)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>First order</Text>
          <Text style={styles.value}>{formatCustomerDate(customer.firstOrderAt)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Latest order</Text>
          <Text style={styles.value}>{formatCustomerDate(customer.lastOrderAt)}</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Orders</Text>
        {orders.length === 0 ? (
          <Text style={styles.hint}>No orders found for this customer.</Text>
        ) : (
          orders.map((order) => (
            <Pressable
              key={order.id}
              style={styles.orderRow}
              onPress={() => {
                feedback.tap();
                tabNavigation?.navigate("Orders", { screen: "OrderDetail", params: { orderId: order.id } });
              }}
              accessibilityRole="button"
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.orderRef}>#{order.reference}</Text>
                <Text style={styles.orderMeta}>{formatOrderTime(order.createdAt)}</Text>
              </View>
              <View style={styles.orderRight}>
                <StatusPill label={orderStatusLabel(order)} tone={orderStatusTone(order)} />
                <Text style={styles.orderRef}>{formatNairaFromKobo(order.totalKobo)}</Text>
              </View>
            </Pressable>
          ))
        )}
      </View>

      {orders.length >= 100 ? (
        <InfoBanner variant="warning">Showing the 100 most recent orders for this customer.</InfoBanner>
      ) : null}
    </ScrollView>
  );
}
