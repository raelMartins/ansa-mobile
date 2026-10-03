import { Pressable, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { feedback } from "../../../core/feedback/feedback";
import { useThemedStyles } from "../../../core/ui/themedStyles";
import { customerRelationshipLabel, formatCustomerDate, isGuestCustomerEmail } from "../../lib/customers";
import { formatNairaFromKobo } from "../../lib/money";
import type { CustomerIdentity, MerchantCustomer } from "../../types";
import { StatusPill } from "../../ui/StatusPill";

type Props = {
  customer: MerchantCustomer;
  index: number;
  onPress: (identity: CustomerIdentity) => void;
};

export function CustomerListRow({ customer, index, onPress }: Props) {
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
    name: { fontSize: 16, fontFamily: f.semiBold, color: c.text },
    meta: { fontSize: 13, fontFamily: f.regular, color: c.textMuted, lineHeight: 18 },
    right: { alignItems: "flex-end", gap: 6 },
    amount: { fontSize: 15, fontFamily: f.semiBold, color: c.text },
  }));

  const identity: CustomerIdentity = {
    name: customer.name,
    phone: customer.phone,
    email: customer.email,
  };

  return (
    <Animated.View entering={FadeInDown.delay(Math.min(index * 40, 200)).duration(380).springify()}>
      <Pressable
        style={styles.row}
        onPress={() => {
          feedback.tap();
          onPress(identity);
        }}
        accessibilityRole="button"
        accessibilityLabel={`Customer ${customer.name}`}
      >
        <View style={styles.left}>
          <Text style={styles.name}>{customer.name}</Text>
          <Text style={styles.meta}>
            {customer.orders} order{customer.orders === 1 ? "" : "s"} · Last order {formatCustomerDate(customer.lastOrderAt)}
          </Text>
          <Text style={styles.meta}>{customer.phone}</Text>
        </View>
        <View style={styles.right}>
          {customer.orders > 1 ? (
            <StatusPill label={customerRelationshipLabel(customer.orders)} tone="ready" />
          ) : isGuestCustomerEmail(customer.email) ? (
            <StatusPill label="Guest" tone="orderPending" />
          ) : null}
          <Text style={styles.amount}>{formatNairaFromKobo(customer.spentKobo)}</Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}
