import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  useFonts,
} from "@expo-google-fonts/plus-jakarta-sans";
import { NavigationContainer, DefaultTheme, DarkTheme } from "@react-navigation/native";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { getApiBaseUrl } from "./core/config/env";
import { RootNavigator } from "./core/navigation/RootNavigator";
import { OnboardingProvider, useOnboarding } from "./core/onboarding/OnboardingContext";
import { SessionProvider } from "./core/session/SessionContext";
import { ThemeProvider, useTheme } from "./core/ui/ThemeContext";

// Held until AppExperienceFlow paints its first frame (which matches the splash).
void SplashScreen.preventAutoHideAsync().catch(() => {});
SplashScreen.setOptions({ duration: 220, fade: true });

function AppNavigation() {
  const { scheme, colors } = useTheme();
  const base = scheme === "dark" ? DarkTheme : DefaultTheme;
  const navTheme = {
    ...base,
    colors: {
      ...base.colors,
      primary: colors.accent,
      background: colors.bg,
      card: colors.surface,
      text: colors.text,
      border: colors.border,
    },
  };

  return (
    <NavigationContainer theme={navTheme}>
      <RootNavigator />
      <StatusBar style={scheme === "dark" ? "light" : "dark"} />
    </NavigationContainer>
  );
}

function ThemedApp() {
  const { selectedProduct } = useOnboarding();
  return (
    <ThemeProvider productId={selectedProduct}>
      <SessionProvider>
        <AppNavigation />
      </SessionProvider>
    </ThemeProvider>
  );
}

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
  });

  useEffect(() => {
    if (__DEV__ && fontsLoaded) {
      console.log("[ansa] API base URL:", getApiBaseUrl());
    }
  }, [fontsLoaded]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <OnboardingProvider>
          <ThemedApp />
        </OnboardingProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
