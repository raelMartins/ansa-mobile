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
import {
  ColorScheme,
  THEME_STORAGE_KEY,
  colorsForScheme,
  fontFamily,
  type ThemeColors,
} from "./theme";

type ThemeContextValue = {
  scheme: ColorScheme;
  colors: ThemeColors;
  fonts: typeof fontFamily;
  setScheme: (scheme: ColorScheme) => void;
  toggleScheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [scheme, setSchemeState] = useState<ColorScheme>("light");

  useEffect(() => {
    void SecureStore.getItemAsync(THEME_STORAGE_KEY)
      .then((stored) => {
        if (stored === "light" || stored === "dark") {
          setSchemeState(stored);
        }
      })
      .catch(() => {
        /* Expo Go / sim may reject reads; default light is fine */
      });
  }, []);

  const persistScheme = useCallback((next: ColorScheme) => {
    void SecureStore.setItemAsync(THEME_STORAGE_KEY, next).catch(() => {});
  }, []);

  const setScheme = useCallback(
    (next: ColorScheme) => {
      setSchemeState(next);
      persistScheme(next);
    },
    [persistScheme],
  );

  const toggleScheme = useCallback(() => {
    setSchemeState((prev) => {
      const next = prev === "light" ? "dark" : "light";
      persistScheme(next);
      return next;
    });
  }, [persistScheme]);

  const value = useMemo(
    () => ({
      scheme,
      colors: colorsForScheme(scheme),
      fonts: fontFamily,
      setScheme,
      toggleScheme,
    }),
    [scheme, setScheme, toggleScheme],
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
