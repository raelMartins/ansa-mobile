import { NavigationContainer } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { RootNavigator } from "./core/navigation/RootNavigator";
import { SessionProvider } from "./core/session/SessionContext";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function App() {
  return (
    <SafeAreaProvider>
      <SessionProvider>
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
      </SessionProvider>
      <StatusBar style="light" />
    </SafeAreaProvider>
  );
}
