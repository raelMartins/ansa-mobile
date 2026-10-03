/**
 * Motion: list FadeInDown stagger; filter SegmentedControl spring.
 * Loading/error/empty aligned with Orders list patterns.
 */
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useCallback, useMemo, useState } from "react";
import { RefreshControl, ScrollView, Text, TextInput, View } from "react-native";
import { useNetworkStatus } from "../../../core/network/useNetworkStatus";
import type { MoreStackParamList } from "../../../core/navigation/types";
import { SegmentedControl } from "../../../core/ui/SegmentedControl";
import { useTheme } from "../../../core/ui/ThemeContext";
import { useThemedStyles } from "../../../core/ui/themedStyles";
import type { CustomerIdentity } from "../../types";
import { InfoBanner } from "../../ui/InfoBanner";
import { MerchantPrimaryButton } from "../../ui/MerchantButtons";
import { OfflineBanner } from "../../ui/OfflineBanner";
import { useMerchantTabBarInset } from "../../shell/MerchantGlassTabBar";
import { merchantRadii } from "../../ui/merchantUi";
import { CustomerListRow } from "../components/CustomerListRow";
import { filterCounts, filterCustomers, type CustomerFilter } from "../customerFilters";
import { useCustomers } from "../useCustomers";

type Nav = NativeStackNavigationProp<MoreStackParamList, "CustomerList">;

export function CustomerListScreen() {
  const navigation = useNavigation<Nav>();
  const { isOffline, isReady: networkReady } = useNetworkStatus();
  const { colors } = useTheme();
  const { state, reload } = useCustomers();
  const tabBarInset = useMerchantTabBarInset();
  const [filter, setFilter] = useState<CustomerFilter>("all");
  const [query, setQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      void reload();
    }, [reload]),
  );

  const styles = useThemedStyles((c, f) => ({
    root: { flex: 1, backgroundColor: c.bg },
    content: { padding: 20, gap: 14 },
    title: { fontSize: 28, fontFamily: f.bold, color: c.text, letterSpacing: -0.4 },
    subtitle: { fontSize: 14, fontFamily: f.regular, color: c.textMuted, lineHeight: 20, marginTop: -6 },
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

  const customers =
    state.kind === "ready" ? state.customers : state.kind === "error" && state.cached ? state.cached : [];
  const counts = useMemo(() => filterCounts(customers), [customers]);
  const visible = useMemo(() => filterCustomers(customers, filter, query), [customers, filter, query]);

  const openDetail = (identity: CustomerIdentity) => {
    navigation.navigate("CustomerDetail", identity);
  };

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
      <Text style={styles.title}>Customers</Text>
      <Text style={styles.subtitle}>People who have ordered from your shop.</Text>

      {networkReady && isOffline ? (
        <OfflineBanner detail="Customer data may be stale until you're back online." />
      ) : null}

      {state.kind === "error" ? (
        <InfoBanner variant="warning">
          {state.cached ? "Showing your last saved customer list." : state.message}
        </InfoBanner>
      ) : null}

      <TextInput
        style={styles.search}
        placeholder="Search name or phone"
        placeholderTextColor={colors.textMuted}
        value={query}
        onChangeText={setQuery}
      />

      <SegmentedControl
        options={[
          { id: "all", label: `All (${counts.all})` },
          { id: "returning", label: `Returning (${counts.returning})` },
          { id: "new", label: `New (${counts.new})` },
        ]}
        value={filter}
        onChange={setFilter}
        accent={colors.accent}
        onAccent={colors.onAccent}
        trackColor="rgba(212, 220, 213, 0.55)"
        height={44}
      />

      {state.kind === "loading" ? <Text style={styles.subtitle}>Loading customers…</Text> : null}

      {state.kind === "error" && !state.cached ? (
        <View style={styles.err}>
          <Text style={styles.empty}>{state.message}</Text>
          <MerchantPrimaryButton label="Try again" onPress={() => void reload()} />
        </View>
      ) : null}

      {state.kind !== "loading" && visible.length === 0 && !(state.kind === "error" && !state.cached) ? (
        <Text style={styles.empty}>
          {customers.length > 0 && query.trim()
            ? "No customers match your search."
            : filter === "all"
              ? "No customers yet. When someone checks out, they will appear here."
              : "No customers in this view."}
        </Text>
      ) : null}

      {visible.map((customer, index) => (
        <CustomerListRow key={`${customer.phone}-${customer.name}`} customer={customer} index={index} onPress={openDetail} />
      ))}

      {state.kind === "ready" && customers.length > 0 ? (
        <InfoBanner variant="success">
          Respect customer privacy. Use contact details only for orders and support they agreed to.
        </InfoBanner>
      ) : null}
    </ScrollView>
  );
}
