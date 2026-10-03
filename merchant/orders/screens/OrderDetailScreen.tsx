/**
 * Motion: content FadeIn; status update uses button press feedback + inline banner.
 * Loading/error: shared LoadingState/ErrorState; destructive actions use Alert.
 */
import { useRoute, type RouteProp } from "@react-navigation/native";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Image, ScrollView, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { feedback } from "../../../core/feedback/feedback";
import type { OrdersStackParamList } from "../../../core/navigation/types";
import { LoadingState, ErrorState } from "../../../core/ui/states";
import { useSession } from "../../../core/session/SessionContext";
import { useThemedStyles } from "../../../core/ui/themedStyles";
import { ApiError } from "../../../core/api/errors";
import { fetchOrder, updateOrderStatus } from "../../api/orders";
import { fetchProduct } from "../../api/products";
import { useMerchant } from "../../MerchantContext";
import { formatNairaFromKobo } from "../../lib/money";
import {
  ORDER_STATUS_LABEL,
  PAYMENT_STATUS_LABEL,
  orderStatusLabel,
  orderStatusTone,
  paymentStatusTone,
} from "../../lib/orders";
import { resolveMediaUrl } from "../../lib/resolveMediaUrl";
import type { MerchantOrder, OrderStatus } from "../../types";
import { InfoBanner } from "../../ui/InfoBanner";
import { MerchantPrimaryButton, MerchantSecondaryButton } from "../../ui/MerchantButtons";
import { StatusPill } from "../../ui/StatusPill";
import { merchantCardBackground, merchantRadii } from "../../ui/merchantUi";
import { useTheme } from "../../../core/ui/ThemeContext";
import { useMerchantTabBarInset } from "../../shell/MerchantGlassTabBar";
import { availableOrderActions, type OrderAction } from "../orderActions";

type Route = RouteProp<OrdersStackParamList, "OrderDetail">;

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function progressSteps(order: MerchantOrder): OrderStatus[] {
  const base: OrderStatus[] = ["confirmed", "processing", "ready"];
  if (order.fulfilment === "delivery") {
    return [...base, "out_for_delivery", "delivered"];
  }
  return [...base, "delivered"];
}

function isGuestEmail(email: string | null): boolean {
  return !email || email.endsWith("@guest.ansa.local");
}

export function OrderDetailScreen() {
  const { orderId } = useRoute<Route>().params;
  const { merchantId } = useMerchant();
  const { api } = useSession();
  const { scheme } = useTheme();
  const tabBarInset = useMerchantTabBarInset();
  const [order, setOrder] = useState<MerchantOrder | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionError, setActionError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [itemImages, setItemImages] = useState<Record<string, string | null>>({});

  const load = useCallback(async () => {
    if (!merchantId) return;
    setLoading(true);
    setError(null);
    setActionError(null);
    setStatusMessage(null);
    try {
      const next = await fetchOrder(api, merchantId, orderId);
      setOrder(next);
      const withProduct = next.items.filter((i) => i.productId);
      const images: Record<string, string | null> = {};
      await Promise.all(
        withProduct.map(async (item) => {
          if (!item.productId) return;
          try {
            const product = await fetchProduct(api, merchantId, item.productId);
            images[item.id] = resolveMediaUrl(product.imageUrls[0]);
          } catch {
            images[item.id] = null;
          }
        }),
      );
      setItemImages(images);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Could not load this order";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [api, merchantId, orderId]);

  useEffect(() => {
    void load();
  }, [load]);

  const styles = useThemedStyles((c, f) => ({
    root: { flex: 1, backgroundColor: c.bg },
    content: { padding: 20, gap: 16 },
    head: { gap: 8 },
    ref: { fontSize: 22, fontFamily: f.bold, color: c.text, letterSpacing: -0.3 },
    meta: { fontSize: 14, fontFamily: f.regular, color: c.textMuted },
    card: {
      backgroundColor: merchantCardBackground(scheme, c),
      borderRadius: merchantRadii.card,
      padding: 16,
      borderWidth: 1,
      borderColor: c.border,
      gap: 12,
    },
    sectionTitle: { fontSize: 16, fontFamily: f.semiBold, color: c.text },
    row: { flexDirection: "row", justifyContent: "space-between", gap: 12 },
    label: { fontSize: 13, fontFamily: f.medium, color: c.textMuted },
    value: { fontSize: 15, fontFamily: f.regular, color: c.text, textAlign: "right", flex: 1 },
    totalValue: { fontSize: 17, fontFamily: f.bold, color: c.text, textAlign: "right", flex: 1 },
    itemRow: { flexDirection: "row", gap: 12, alignItems: "center" },
    thumb: { width: 52, height: 52, borderRadius: 10, backgroundColor: "rgba(147,160,151,0.2)" },
    itemTitle: { fontSize: 15, fontFamily: f.semiBold, color: c.text },
    itemMeta: { fontSize: 13, fontFamily: f.regular, color: c.textMuted, marginTop: 2 },
    stepRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 6 },
    stepDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: c.border },
    stepDotDone: { backgroundColor: c.accent },
    stepDotCurrent: { backgroundColor: c.accent, transform: [{ scale: 1.15 }] },
    stepLabel: { fontSize: 14, fontFamily: f.regular, color: c.textMuted },
    stepLabelCurrent: { fontFamily: f.semiBold, color: c.text },
    actions: { gap: 10 },
    customerHint: { fontSize: 13, fontFamily: f.regular, color: c.textMuted, lineHeight: 18 },
  }));

  const actions = useMemo(() => (order ? availableOrderActions(order) : []), [order]);
  const steps = useMemo(() => (order ? progressSteps(order) : []), [order]);

  const applyAction = (action: OrderAction) => {
    if (!merchantId || !order) return;
    const run = async () => {
      setUpdating(true);
      setActionError(null);
      try {
        const res = await updateOrderStatus(api, merchantId, order.id, action.status);
        setOrder(res.order);
        setStatusMessage(`Status updated to ${ORDER_STATUS_LABEL[res.order.orderStatus]}.`);
        feedback.success();
      } catch (err) {
        feedback.deny();
        const message = err instanceof ApiError ? err.message : "Could not update order";
        setActionError(message);
      } finally {
        setUpdating(false);
      }
    };

    if (action.destructive) {
      Alert.alert("Cancel this order?", "The buyer will not be charged if payment has not completed.", [
        { text: "Keep order", style: "cancel" },
        { text: "Cancel order", style: "destructive", onPress: () => void run() },
      ]);
      return;
    }
    void run();
  };

  if (loading) return <LoadingState label="Loading order…" />;
  if (error || !order) return <ErrorState message={error ?? "Order not found"} onRetry={() => void load()} />;

  const currentStepIndex = steps.indexOf(order.orderStatus);
  const cancelled = order.orderStatus === "cancelled";

  return (
    <ScrollView style={styles.root} contentContainerStyle={[styles.content, { paddingBottom: tabBarInset }]}>
      <Animated.View entering={FadeInDown.duration(400).springify()} style={styles.head}>
        <Text style={styles.ref}>{order.reference}</Text>
        <Text style={styles.meta}>Placed {formatDateTime(order.createdAt)}</Text>
        <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
          <StatusPill label={orderStatusLabel(order)} tone={orderStatusTone(order)} />
          <StatusPill label={PAYMENT_STATUS_LABEL[order.paymentStatus]} tone={paymentStatusTone(order.paymentStatus)} />
        </View>
      </Animated.View>

      {statusMessage ? <InfoBanner variant="success">{statusMessage}</InfoBanner> : null}

      {actionError ? (
        <InfoBanner variant="warning">{actionError}</InfoBanner>
      ) : null}

      {!cancelled && order.paymentStatus === "paid" ? (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Fulfilment progress</Text>
          {steps.map((step, i) => {
            const done = currentStepIndex > i || order.orderStatus === "delivered";
            const current = order.orderStatus === step;
            return (
              <View key={step} style={styles.stepRow}>
                <View
                  style={[
                    styles.stepDot,
                    done ? styles.stepDotDone : null,
                    current ? styles.stepDotCurrent : null,
                  ]}
                />
                <Text style={[styles.stepLabel, current ? styles.stepLabelCurrent : null]}>
                  {ORDER_STATUS_LABEL[step]}
                </Text>
              </View>
            );
          })}
        </View>
      ) : null}

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Items</Text>
        {order.items.map((item) => {
          const img = itemImages[item.id];
          const lineTotal = item.unitPriceKobo * item.quantity;
          return (
            <View key={item.id} style={styles.itemRow}>
              {img ? (
                <Image source={{ uri: img }} style={styles.thumb} resizeMode="cover" />
              ) : (
                <View style={styles.thumb} />
              )}
              <View style={{ flex: 1 }}>
                <Text style={styles.itemTitle}>{item.title}</Text>
                <Text style={styles.itemMeta}>
                  {item.quantity} × {formatNairaFromKobo(item.unitPriceKobo)}
                </Text>
              </View>
              <Text style={styles.itemTitle}>{formatNairaFromKobo(lineTotal)}</Text>
            </View>
          );
        })}
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Customer</Text>
        <Text style={styles.itemTitle}>{order.customerName}</Text>
        <Text style={styles.itemMeta}>{order.customerPhone}</Text>
        {!isGuestEmail(order.customerEmail) ? (
          <Text style={styles.itemMeta}>{order.customerEmail}</Text>
        ) : (
          <Text style={styles.customerHint}>Guest checkout — customer profile coming in a later update.</Text>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Summary</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Subtotal</Text>
          <Text style={styles.value}>{formatNairaFromKobo(order.subtotalKobo)}</Text>
        </View>
        {order.deliveryFeeKobo > 0 ? (
          <View style={styles.row}>
            <Text style={styles.label}>Delivery</Text>
            <Text style={styles.value}>{formatNairaFromKobo(order.deliveryFeeKobo)}</Text>
          </View>
        ) : null}
        <View style={styles.row}>
          <Text style={styles.label}>Total</Text>
          <Text style={styles.totalValue}>{formatNairaFromKobo(order.totalKobo)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Fulfilment</Text>
          <Text style={styles.value}>
            {order.fulfilment === "delivery"
              ? `Delivery${order.deliveryAddress ? ` · ${order.deliveryAddress}` : ""}`
              : "Pickup"}
          </Text>
        </View>
        {order.deliveryInstructions ? (
          <View style={styles.row}>
            <Text style={styles.label}>Instructions</Text>
            <Text style={styles.value}>{order.deliveryInstructions}</Text>
          </View>
        ) : null}
        <View style={styles.row}>
          <Text style={styles.label}>Payment</Text>
          <Text style={styles.value}>
            {PAYMENT_STATUS_LABEL[order.paymentStatus]}
            {order.paymentProvider ? ` · ${order.paymentProvider}` : ""}
          </Text>
        </View>
      </View>

      {actions.length > 0 ? (
        <View style={styles.actions}>
          <Text style={styles.sectionTitle}>Next steps</Text>
          {actions.map((action) =>
            action.primary ? (
              <MerchantPrimaryButton
                key={action.status}
                label={action.label}
                disabled={updating}
                onPress={() => applyAction(action)}
              />
            ) : (
              <MerchantSecondaryButton
                key={action.status}
                label={action.label}
                disabled={updating}
                onPress={() => applyAction(action)}
              />
            ),
          )}
        </View>
      ) : null}
    </ScrollView>
  );
}
