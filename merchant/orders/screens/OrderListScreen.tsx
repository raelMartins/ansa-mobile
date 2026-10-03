/**
 * Motion: list FadeInDown stagger; filter SegmentedControl spring.
 * Loading: inline copy; error: retry; empty: guided copy per filter.
 */
import { useFocusEffect, useNavigation, useRoute, type RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useCallback, useMemo, useState } from "react";
import { RefreshControl, ScrollView, Text, TextInput, View } from "react-native";
import { useNetworkStatus } from "../../../core/network/useNetworkStatus";
import type { OrdersStackParamList } from "../../../core/navigation/types";
import { SegmentedControl } from "../../../core/ui/SegmentedControl";
import { useTheme } from "../../../core/ui/ThemeContext";
import { useThemedStyles } from "../../../core/ui/themedStyles";
import { InfoBanner } from "../../ui/InfoBanner";
import { MerchantPrimaryButton } from "../../ui/MerchantButtons";
import { OfflineBanner } from "../../ui/OfflineBanner";
import { useMerchant } from "../../MerchantContext";
import { useMerchantTabBarInset } from "../../shell/MerchantGlassTabBar";
import { merchantRadii } from "../../ui/merchantUi";
import { filterCounts, filterOrders, type OrderFilter } from "../orderFilters";
import { useOrders } from "../useOrders";
import { OrderListRow } from "../components/OrderListRow";

type Nav = NativeStackNavigationProp<OrdersStackParamList, "OrderList">;
type Route = RouteProp<OrdersStackParamList, "OrderList">;

const EMPTY_COPY: Record<OrderFilter, string> = {
  all: "No orders yet. When buyers check out, they will show up here.",
  attention: "Nothing needs your attention right now.",
  ready: "No orders are ready for pickup or delivery.",
  completed: "No completed orders yet.",
  cancelled: "No cancelled orders.",
};

export function OrderListScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { merchant } = useMerchant();
  const { isOffline, isReady: networkReady } = useNetworkStatus();
  const { colors } = useTheme();
  const { state, reload } = useOrders();
  const tabBarInset = useMerchantTabBarInset();
  const [filter, setFilter] = useState<OrderFilter>(route.params?.filter ?? "all");
  const [query, setQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const nextFilter = route.params?.filter;
      if (nextFilter) setFilter(nextFilter);
      void reload();
    }, [reload, route.params?.filter]),
  );

  const styles = useThemedStyles((c, f) => ({
    root: { flex: 1, backgroundColor: c.bg },
    content: { padding: 20, gap: 14 },
    title: { fontSize: 28, fontFamily: f.bold, color: c.text, letterSpacing: -0.4 },
    subtitle: { fontSize: 14, fontFamily: f.regular, color: c.textMuted, lineHeight: 20, marginTop: -6 },
    meta: { fontSize: 13, fontFamily: f.regular, color: c.textMuted },
    business: { fontSize: 14, fontFamily: f.medium, color: c.textMuted, marginTop: -4 },
    search: {
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: merchantRadii.button,
      paddingHorizontal: 14,
      paddingVertical: 12,
      fontSize: 16,
      fontFamily: f.regular,
      color: c.text,
      minHeight: 48,
    },
    empty: { fontSize: 15, fontFamily: f.regular, color: c.textMuted, lineHeight: 22, paddingVertical: 24 },
    err: { gap: 12, paddingVertical: 20 },
  }));

  const orders =
    state.kind === "ready" ? state.orders : state.kind === "error" && state.cached ? state.cached : [];
  const counts = useMemo(() => filterCounts(orders), [orders]);
  const visible = useMemo(() => filterOrders(orders, filter, query), [orders, filter, query]);

  const onRefresh = async () => {
    setRefreshing(true);
    await reload();
    setRefreshing(false);
  };

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={[styles.content, { paddingBottom: tabBarInset }]}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void onRefresh()} tintColor={colors.accent} />}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.title}>Orders</Text>
      {merchant ? (
        <Text style={styles.business}>
          {merchant.name}
          {merchant.location ? ` · ${merchant.location}` : ""}
        </Text>
      ) : null}
      <Text style={styles.subtitle}>
        {counts.attention > 0
          ? `${counts.attention} order${counts.attention === 1 ? "" : "s"} need your attention`
          : "Track sales and update fulfilment as you go."}
      </Text>

      {networkReady && isOffline ? (
        <OfflineBanner detail="Order updates need a connection. You can still review saved orders." />
      ) : null}

      {state.kind === "error" ? (
        <InfoBanner variant="warning">
          {state.cached ? "Showing your last saved orders." : state.message}
        </InfoBanner>
      ) : null}

      <TextInput
        style={styles.search}
        placeholder="Search order ID or customer"
        placeholderTextColor={colors.textMuted}
        value={query}
        onChangeText={setQuery}
      />

      <SegmentedControl
        options={[
          { id: "all", label: `All (${counts.all})` },
          { id: "attention", label: `Action (${counts.attention})` },
          { id: "ready", label: `Ready (${counts.ready})` },
          { id: "completed", label: `Done (${counts.completed})` },
        ]}
        value={filter === "cancelled" ? "all" : filter}
        onChange={setFilter}
        accent={colors.accent}
        onAccent={colors.onAccent}
        trackColor="rgba(212, 220, 213, 0.55)"
        height={44}
      />

      {state.kind === "loading" ? <Text style={styles.meta}>Loading orders…</Text> : null}

      {state.kind === "error" && !state.cached ? (
        <View style={styles.err}>
          <Text style={styles.empty}>{state.message}</Text>
          <MerchantPrimaryButton label="Try again" onPress={() => void reload()} />
        </View>
      ) : null}

      {state.kind !== "loading" && visible.length === 0 && !(state.kind === "error" && !state.cached) ? (
        <Text style={styles.empty}>
          {orders.length > 0 && query.trim()
            ? "No orders match your search."
            : EMPTY_COPY[filter]}
        </Text>
      ) : null}

      {visible.map((order, index) => (
        <OrderListRow
          key={order.id}
          order={order}
          index={index}
          onPress={() => navigation.navigate("OrderDetail", { orderId: order.id })}
        />
      ))}

      {state.kind === "ready" && orders.length > 0 ? (
        <InfoBanner variant="success">
          Payment before fulfilment. Verify payment in the order before releasing a package.
        </InfoBanner>
      ) : null}
    </ScrollView>
  );
}
