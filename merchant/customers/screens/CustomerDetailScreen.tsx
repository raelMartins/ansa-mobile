/**
 * Motion: FadeInDown on profile + cards; order rows tap with feedback (Standard).
 */
import { useNavigation, useRoute, type CompositeNavigationProp, type RouteProp } from "@react-navigation/native";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useCallback, useEffect, useState } from "react";
import { Pressable, RefreshControl, ScrollView, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { feedback } from "../../../core/feedback/feedback";
import type { CustomersStackParamList, MerchantTabParamList } from "../../../core/navigation/types";
import { LoadingState, ErrorState } from "../../../core/ui/states";
import { ApiError } from "../../../core/api/errors";
import { useSession } from "../../../core/session/SessionContext";
import { useThemedStyles } from "../../../core/ui/themedStyles";
import { fetchCustomerDetail } from "../../api/customers";
import { useMerchant } from "../../MerchantContext";
import {
  customerRelationshipLabel,
  formatCustomerSince,
  formatOrderHistoryMeta,
  isGuestCustomerEmail,
  isRecentOrder,
} from "../../lib/customers";
import { formatNairaFromKobo } from "../../lib/money";
import type { MerchantCustomerDetail } from "../../types";
import { InfoBanner } from "../../ui/InfoBanner";
import { MerchantPrimaryButton } from "../../ui/MerchantButtons";
import { StatusPill } from "../../ui/StatusPill";
import { merchantCardBackground, merchantRadii } from "../../ui/merchantUi";
import { useTheme } from "../../../core/ui/ThemeContext";
import { useMerchantTabBarInset } from "../../shell/MerchantGlassTabBar";

type Route = RouteProp<CustomersStackParamList, "CustomerDetail">;
type Nav = CompositeNavigationProp<
  NativeStackNavigationProp<CustomersStackParamList, "CustomerDetail">,
  BottomTabNavigationProp<MerchantTabParamList>
>;

export function CustomerDetailScreen() {
  const { name, phone, email } = useRoute<Route>().params;
  const navigation = useNavigation<Nav>();
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
    profileCard: {
      backgroundColor: merchantCardBackground(scheme, c),
      borderRadius: merchantRadii.card,
      padding: 18,
      borderWidth: 1,
      borderColor: c.border,
      gap: 10,
    },
    name: { fontSize: 24, fontFamily: f.bold, color: c.text, letterSpacing: -0.3 },
    since: { fontSize: 14, fontFamily: f.regular, color: c.textMuted },
    contact: { fontSize: 15, fontFamily: f.regular, color: c.text, lineHeight: 22 },
    metricsRow: { flexDirection: "row", gap: 10 },
    metricCard: {
      flex: 1,
      backgroundColor: merchantCardBackground(scheme, c),
      borderRadius: merchantRadii.card,
      padding: 16,
      borderWidth: 1,
      borderColor: c.border,
      gap: 6,
    },
    metricLabel: { fontSize: 13, fontFamily: f.medium, color: c.textMuted },
    metricValue: { fontSize: 28, fontFamily: f.bold, color: c.text, letterSpacing: -0.5 },
    metricSub: { fontSize: 12, fontFamily: f.regular, color: c.textMuted, lineHeight: 17 },
    card: {
      backgroundColor: merchantCardBackground(scheme, c),
      borderRadius: merchantRadii.card,
      padding: 16,
      borderWidth: 1,
      borderColor: c.border,
      gap: 10,
    },
    sectionTitle: { fontSize: 16, fontFamily: f.semiBold, color: c.text },
    sectionHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    link: { fontSize: 14, fontFamily: f.semiBold, color: c.accent },
    address: { fontSize: 15, fontFamily: f.regular, color: c.text, lineHeight: 22 },
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
    note: { fontSize: 14, fontFamily: f.regular, color: c.textMuted, lineHeight: 21 },
  }));

  if (loading) return <LoadingState label="Loading customer…" />;
  if (error || !data) return <ErrorState message={error ?? "Customer not found"} onRetry={() => void load()} />;

  const { customer, orders } = data;
  const guest = customer.isGuest || isGuestCustomerEmail(customer.email);
  const recentLabel = isRecentOrder(customer.lastOrderAt) ? "today" : formatCustomerSince(customer.lastOrderAt).replace("Customer since ", "");
  const previewOrders = orders.slice(0, 5);

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
      <Animated.View entering={FadeInDown.duration(400).springify()} style={styles.profileCard}>
        <Text style={styles.name}>{customer.name}</Text>
        <StatusPill label={customerRelationshipLabel(customer.orders)} tone={customer.orders > 1 ? "ready" : "newOrder"} />
        <Text style={styles.since}>{formatCustomerSince(customer.firstOrderAt)}</Text>
        <Text style={styles.contact}>WhatsApp · {customer.phone}</Text>
        {!guest && customer.email ? <Text style={styles.contact}>Email · {customer.email}</Text> : null}
        <MerchantPrimaryButton label="Message on WhatsApp" disabled onPress={() => undefined} />
      </Animated.View>

      <View style={styles.metricsRow}>
        <Animated.View entering={FadeInDown.delay(60).duration(400).springify()} style={styles.metricCard}>
          <Text style={styles.metricLabel}>Paid orders</Text>
          <Text style={styles.metricValue}>{customer.paidOrders}</Text>
          <Text style={styles.metricSub}>Most recent · {recentLabel}</Text>
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(100).duration(400).springify()} style={styles.metricCard}>
          <Text style={styles.metricLabel}>Total spent</Text>
          <Text style={styles.metricValue}>{formatNairaFromKobo(customer.spentKobo)}</Text>
          <Text style={styles.metricSub}>Lifetime paid total</Text>
        </Animated.View>
      </View>

      {customer.latestDeliveryAddress ? (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Delivery address</Text>
          <Text style={styles.address}>{customer.latestDeliveryAddress}</Text>
        </View>
      ) : null}

      <View style={styles.card}>
        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>Order history</Text>
          {orders.length > previewOrders.length ? (
            <Pressable onPress={() => feedback.tap()} hitSlop={8}>
              <Text style={styles.link}>View all →</Text>
            </Pressable>
          ) : null}
        </View>
        {previewOrders.length === 0 ? (
          <Text style={styles.note}>No orders yet.</Text>
        ) : (
          previewOrders.map((order) => (
            <Pressable
              key={order.id}
              style={styles.orderRow}
              onPress={() => {
                feedback.tap();
                navigation.navigate("Orders", { screen: "OrderDetail", params: { orderId: order.id } });
              }}
              accessibilityRole="button"
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.orderRef}>#{order.reference}</Text>
                <Text style={styles.orderMeta}>{formatOrderHistoryMeta(order)}</Text>
              </View>
              <Text style={styles.orderRef}>{formatNairaFromKobo(order.totalKobo)}</Text>
            </Pressable>
          ))
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Merchant note</Text>
        <Text style={styles.note}>
          Private team notes are not available yet. You will be able to save preferences like sizes and delivery
          instructions here in a later update.
        </Text>
      </View>

      {orders.length >= 100 ? (
        <InfoBanner variant="warning">Showing the 100 most recent orders for this customer.</InfoBanner>
      ) : null}
    </ScrollView>
  );
}
