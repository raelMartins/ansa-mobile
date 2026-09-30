import { ActivityIndicator, StyleSheet, View } from "react-native";
import { MerchantBootstrapGate } from "../../merchant/MerchantBootstrapGate";
import { MerchantProvider } from "../../merchant/MerchantContext";
import { useSession } from "../session/SessionContext";
import { colors } from "../ui/theme";
import { AuthStack } from "./AuthStack";

export function RootNavigator() {
  const { status } = useSession();

  if (status === "loading") {
    return (
      <View style={styles.boot}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  if (status === "authenticated") {
    return (
      <MerchantProvider>
        <MerchantBootstrapGate />
      </MerchantProvider>
    );
  }

  return <AuthStack />;
}

const styles = StyleSheet.create({
  boot: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.bg,
  },
});
