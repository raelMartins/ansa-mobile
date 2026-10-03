import { Pressable, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { feedback } from "../../../core/feedback/feedback";
import { useThemedStyles } from "../../../core/ui/themedStyles";
import { formatNairaFromKobo } from "../../lib/money";
import { formatOrderTime, orderNeedsAttention, orderStatusLabel, orderStatusTone } from "../../lib/orders";
import type { MerchantOrder } from "../../types";
import { StatusPill } from "../../ui/StatusPill";
import { orderLineSummary } from "../orderActions";

type Props = {
  order: MerchantOrder;
  index: number;
  onPress: () => void;
};

export function OrderListRow({ order, index, onPress }: Props) {
  const styles = useThemedStyles((c, f) => ({
    row: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: c.border,
      gap: 12,
    },
    left: { flex: 1, gap: 4 },
    ref: { fontSize: 15, fontFamily: f.semiBold, color: c.text },
    meta: { fontSize: 13, fontFamily: f.regular, color: c.textMuted, lineHeight: 18 },
    summary: { fontSize: 13, fontFamily: f.regular, color: c.textMuted, marginTop: 2 },
    right: { alignItems: "flex-end", gap: 6 },
    amount: { fontSize: 15, fontFamily: f.semiBold, color: c.text },
    dot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: c.accent,
      marginTop: 4,
    },
  }));

  const attention = orderNeedsAttention(order);

  return (
    <Animated.View entering={FadeInDown.delay(Math.min(index * 40, 200)).duration(380).springify()}>
      <Pressable
        style={styles.row}
        onPress={() => {
          feedback.tap();
          onPress();
        }}
        accessibilityRole="button"
        accessibilityLabel={`Order ${order.reference}`}
      >
        <View style={styles.left}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            {attention ? <View style={styles.dot} accessibilityLabel="Needs attention" /> : null}
            <Text style={styles.ref}>#{order.reference}</Text>
          </View>
          <Text style={styles.meta}>
            {order.customerName} · {formatOrderTime(order.createdAt)}
          </Text>
          <Text style={styles.summary} numberOfLines={2}>{orderLineSummary(order)}</Text>
        </View>
        <View style={styles.right}>
          <StatusPill label={orderStatusLabel(order)} tone={orderStatusTone(order)} />
          <Text style={styles.amount}>{formatNairaFromKobo(order.totalKobo)}</Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}
