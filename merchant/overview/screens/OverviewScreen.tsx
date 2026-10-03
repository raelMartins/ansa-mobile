/**
 * Motion spec (Standard):
 * - Enter: header + cards FadeInDown stagger on first load.
 * - Loading: skeleton blocks fade in; no hard cut.
 * - Error: cached metrics stay visible; retry button press uses primary feedback.
 * - Primary interactions: quick actions navigate with tab transition; business sheet slides up.
 * - Reduced motion: Reanimated entering animations respect system setting.
 */
import { useNavigation } from "@react-navigation/native";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { useState } from "react";
import { useNetworkStatus } from "../../../core/network/useNetworkStatus";
import { Pressable, RefreshControl, ScrollView, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { feedback } from "../../../core/feedback/feedback";
import type { MerchantTabParamList } from "../../../core/navigation/types";
import { useThemedStyles } from "../../../core/ui/themedStyles";
import { useMerchant } from "../../MerchantContext";
import { formatNairaFromKobo } from "../../lib/money";
import { formatOrderTime, orderStatusLabel, orderStatusTone } from "../../lib/orders";
import { BusinessSwitcherSheet } from "../../shell/BusinessSwitcherSheet";
import { useMerchantTabBarInset } from "../../shell/MerchantGlassTabBar";
import { InfoBanner } from "../../ui/InfoBanner";
import { MerchantPrimaryButton, MerchantSecondaryButton } from "../../ui/MerchantButtons";
import { merchantCardBackground, merchantRadii } from "../../ui/merchantUi";
import { OfflineBanner } from "../../ui/OfflineBanner";
import { StatusPill } from "../../ui/StatusPill";
import { OverviewSkeleton } from "../OverviewSkeleton";
import { useOverview } from "../useOverview";
import { useTheme } from "../../../core/ui/ThemeContext";

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function monthLabel(): string {
  return new Date().toLocaleDateString("en-NG", { month: "long" });
}

function prevMonthLabel(): string {
  const d = new Date();
  d.setMonth(d.getMonth() - 1);
  return d.toLocaleDateString("en-NG", { month: "long" });
}

type Nav = BottomTabNavigationProp<MerchantTabParamList, "Overview">;

export function OverviewScreen() {
  const navigation = useNavigation<Nav>();
  const { merchant, merchants, switchMerchant } = useMerchant();
  const { scheme, colors, fonts } = useTheme();
  const { state, refresh, retry } = useOverview();
  const { isOffline, isReady: networkReady } = useNetworkStatus();
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const tabBarInset = useMerchantTabBarInset();

  const styles = useThemedStyles((c, f) => ({
    root: { flex: 1, backgroundColor: c.bg },
    content: { paddingHorizontal: 20, gap: 16 },
    businessRow: { flexDirection: "row", alignItems: "center", marginTop: 4 },
    businessBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingVertical: 6, minHeight: 44 },
    businessText: { fontSize: 14, fontFamily: f.medium, color: c.textMuted },
    greeting: { fontSize: 26, fontFamily: f.semiBold, color: c.text, letterSpacing: -0.4, lineHeight: 32 },
    subGreeting: { fontSize: 15, fontFamily: f.regular, color: c.textMuted, lineHeight: 22, marginTop: 6 },
    hero: {
      backgroundColor: c.accent,
      borderRadius: merchantRadii.card,
      padding: 20,
      gap: 8,
    },
    heroLabel: { fontSize: 14, fontFamily: f.medium, color: c.onAccent, opacity: 0.9 },
    heroValue: { fontSize: 32, fontFamily: f.bold, color: c.onAccent, letterSpacing: -0.5 },
    heroMeta: { fontSize: 13, fontFamily: f.regular, color: c.onAccent, opacity: 0.85 },
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
    metricValue: { fontSize: 22, fontFamily: f.bold, color: c.text },
    metricSub: { fontSize: 12, fontFamily: f.regular, color: c.textMuted, lineHeight: 17 },
    actionsRow: { flexDirection: "row", gap: 10 },
    sectionHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    sectionTitle: { fontSize: 18, fontFamily: f.semiBold, color: c.text },
    link: { fontSize: 14, fontFamily: f.semiBold, color: c.accent },
    orderRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: c.border,
      gap: 12,
    },
    orderId: { fontSize: 15, fontFamily: f.semiBold, color: c.text },
    orderMeta: { fontSize: 13, fontFamily: f.regular, color: c.textMuted },
    orderRight: { alignItems: "flex-end", gap: 6 },
    orderAmount: { fontSize: 15, fontFamily: f.semiBold, color: c.text },
    footer: { fontSize: 12, fontFamily: f.regular, color: c.textMuted, textAlign: "center", marginTop: 8 },
    errorBox: { alignItems: "center", gap: 12, paddingVertical: 20 },
    errorTitle: { fontSize: 18, fontFamily: f.semiBold, color: c.text, textAlign: "center" },
    errorBody: { fontSize: 15, fontFamily: f.regular, color: c.textMuted, textAlign: "center", lineHeight: 22 },
    cachedLabel: { fontSize: 12, fontFamily: f.medium, color: c.textMuted, textTransform: "uppercase", letterSpacing: 0.4 },
  }));

  if (!merchant) return null;

  const data = state.kind === "ready" ? state.data : state.kind === "error" ? state.cached : null;
  const loading = state.kind === "loading";
  const error = state.kind === "error";

  const onRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  const salesDelta =
    data?.salesMonthDeltaPct != null && data.salesMonthDeltaPct !== 0
      ? `${data.salesMonthDeltaPct > 0 ? "+" : ""}${data.salesMonthDeltaPct}% vs ${prevMonthLabel()}`
      : data && data.salesMonthKobo === 0
        ? `No paid sales yet in ${monthLabel()}`
        : `Sales in ${monthLabel()}`;

  return (
    <>
      <ScrollView
        style={styles.root}
        contentContainerStyle={[styles.content, { paddingBottom: tabBarInset }]}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void onRefresh()} tintColor={colors.accent} />}
      >
        <View style={styles.businessRow}>
          <Pressable
            style={styles.businessBtn}
            onPress={() => {
              feedback.tap();
              setSwitcherOpen(true);
            }}
            accessibilityRole="button"
            accessibilityLabel="Switch business"
          >
            <Text style={styles.businessText}>
              {merchant.name}
              {merchant.location ? ` · ${merchant.location}` : ""}
            </Text>
            <Text style={styles.businessText}>▾</Text>
          </Pressable>
        </View>

        {networkReady && isOffline ? (
          <OfflineBanner detail="You can browse saved data. Pull to refresh when you're back online." />
        ) : null}

        <Animated.View entering={FadeInDown.duration(420).springify()}>
          <Text style={styles.greeting}>{greeting()}.</Text>
          <Text style={styles.subGreeting}>
            {data && data.salesMonthKobo > 0
              ? "Your shop is growing. Here's where things stand today."
              : "Here's where things stand today. Add products to start selling."}
          </Text>
        </Animated.View>

        {loading ? <OverviewSkeleton /> : null}

        {error && !data ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorTitle}>{state.message}</Text>
            <Text style={styles.errorBody}>Check your connection and try again.</Text>
            <MerchantPrimaryButton label="Try again" onPress={() => void retry()} />
          </View>
        ) : null}

        {data ? (
          <>
            {error ? (
              <InfoBanner variant="warning">
                Showing your last saved overview. Pull down or tap Try again to refresh.
              </InfoBanner>
            ) : null}

            <Animated.View entering={FadeInDown.delay(60).duration(480).springify()} style={styles.hero}>
              <Text style={styles.heroLabel}>Sales this month</Text>
              <Text style={styles.heroValue}>{formatNairaFromKobo(data.salesMonthKobo)}</Text>
              <Text style={styles.heroMeta}>
                {salesDelta}
                {data.soldOrdersMonth > 0 ? ` · ${data.soldOrdersMonth} sold orders` : ""}
              </Text>
            </Animated.View>

            <View style={styles.metricsRow}>
              <Animated.View entering={FadeInDown.delay(100).duration(480).springify()} style={styles.metricCard}>
                <Pressable
                  onPress={() => {
                    feedback.tap();
                    navigation.navigate("Orders", { screen: "OrderList", params: { filter: "attention" } });
                  }}
                  accessibilityRole="button"
                  accessibilityLabel="View orders to fulfill"
                >
                  <Text style={styles.metricLabel}>To fulfill</Text>
                  <Text style={styles.metricValue}>{data.toFulfill}</Text>
                  <Text style={styles.metricSub}>
                    {data.readyForPickup > 0 ? `${data.readyForPickup} ready for pickup` : "No orders waiting"}
                  </Text>
                </Pressable>
              </Animated.View>
              <Animated.View entering={FadeInDown.delay(140).duration(480).springify()} style={styles.metricCard}>
                <Pressable
                  onPress={() => {
                    feedback.tap();
                    navigation.navigate("Customers", { screen: "CustomerList" });
                  }}
                  accessibilityRole="button"
                  accessibilityLabel="View customers"
                >
                  <Text style={styles.metricLabel}>Customers</Text>
                  <Text style={styles.metricValue}>{data.customerCount}</Text>
                  <Text style={styles.metricSub}>
                    {data.newCustomersMonth > 0 ? `${data.newCustomersMonth} new this month` : "Invite your first buyer"}
                  </Text>
                </Pressable>
              </Animated.View>
            </View>

            <View style={styles.actionsRow}>
              <View style={{ flex: 1 }}>
                <MerchantPrimaryButton
                  label="+ Add product"
                  onPress={() => navigation.navigate("Products", { screen: "ProductAdd" })}
                />
              </View>
              <View style={{ flex: 1 }}>
                <MerchantSecondaryButton
                  label="View orders"
                  onPress={() => navigation.navigate("Orders", { screen: "OrderList" })}
                />
              </View>
            </View>

            {data.readyForPickup > 0 ? (
              <InfoBanner variant="success">
                {`${data.readyForPickup} order${data.readyForPickup === 1 ? "" : "s"} ready to go. Arrange pickup when you are set.`}
              </InfoBanner>
            ) : null}

            <View style={{ gap: 8 }}>
              <View style={styles.sectionHead}>
                <Text style={styles.sectionTitle}>Recent orders</Text>
                <Pressable
                  onPress={() => navigation.navigate("Orders", { screen: "OrderList" })}
                  hitSlop={8}
                >
                  <Text style={styles.link}>View all +</Text>
                </Pressable>
              </View>
              {data.recentOrders.length === 0 ? (
                <Text style={styles.metricSub}>No orders yet — share your storefront when you are ready.</Text>
              ) : (
                data.recentOrders.map((order) => (
                  <Pressable
                    key={order.id}
                    style={styles.orderRow}
                    onPress={() => {
                      feedback.tap();
                      navigation.navigate("Orders", { screen: "OrderDetail", params: { orderId: order.id } });
                    }}
                    accessibilityRole="button"
                  >
                    <View style={{ flex: 1, gap: 4 }}>
                      <Text style={styles.orderId}>#{order.reference}</Text>
                      <Text style={styles.orderMeta}>
                        {order.customerName} · {formatOrderTime(order.createdAt)}
                      </Text>
                    </View>
                    <View style={styles.orderRight}>
                      <StatusPill label={orderStatusLabel(order)} tone={orderStatusTone(order)} />
                      <Text style={styles.orderAmount}>{formatNairaFromKobo(order.totalKobo)}</Text>
                    </View>
                  </Pressable>
                ))
              )}
            </View>

            <Text style={styles.footer}>
              Last updated{" "}
              {new Date(data.generatedAt).toLocaleTimeString("en-NG", { hour: "numeric", minute: "2-digit" })}
            </Text>

            {error ? (
              <MerchantSecondaryButton label="Try again" onPress={() => void retry()} />
            ) : null}
          </>
        ) : null}
      </ScrollView>

      <BusinessSwitcherSheet
        visible={switcherOpen}
        merchants={merchants}
        activeId={merchant.id}
        onClose={() => setSwitcherOpen(false)}
        onSelect={(m) => void switchMerchant(m.id)}
      />
    </>
  );
}
