import * as SecureStore from "expo-secure-store";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useColorScheme } from "react-native";
import { getProduct, type AnsaProduct, type AnsaProductId } from "../products/catalog";
import {
  DEFAULT_THEME_PREFERENCE,
  THEME_STORAGE_KEY,
  colorsForScheme,
  fontFamily,
  type ColorScheme,
  type ThemeColors,
  type ThemePreference,
} from "./theme";

type ThemeContextValue = {
  scheme: ColorScheme;
  preference: ThemePreference;
  colors: ThemeColors;
  fonts: typeof fontFamily;
  /** Product whose colours the shell wears (null before a product is chosen). */
  product: AnsaProduct | null;
  setPreference: (preference: ThemePreference) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function isPreference(value: unknown): value is ThemePreference {
  return value === "light" || value === "dark" || value === "system";
}

export function ThemeProvider({
  children,
  productId = null,
}: {
  children: ReactNode;
  productId?: AnsaProductId | null;
}) {
  const system = useColorScheme();
  const [preference, setPreferenceState] = useState<ThemePreference>(DEFAULT_THEME_PREFERENCE);

  useEffect(() => {
    void SecureStore.getItemAsync(THEME_STORAGE_KEY)
      .then((stored) => {
        if (isPreference(stored)) {
          setPreferenceState(stored);
        }
      })
      .catch(() => {
        /* Expo Go / sim may reject reads; the default is fine */
      });
  }, []);

  const setPreference = useCallback((next: ThemePreference) => {
    setPreferenceState(next);
    void SecureStore.setItemAsync(THEME_STORAGE_KEY, next).catch(() => {});
  }, []);

  const scheme: ColorScheme = preference === "system" ? (system === "dark" ? "dark" : "light") : preference;
  const product = productId ? getProduct(productId) : null;

  const value = useMemo(
    () => ({
      scheme,
      preference,
      colors: colorsForScheme(scheme, product),
      fonts: fontFamily,
      product,
      setPreference,
    }),
    [scheme, preference, product, setPreference],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme outside ThemeProvider");
  }
  return ctx;
}
