import "@testing-library/jest-native/extend-expect";

jest.mock("react-native-reanimated", () => {
  const Reanimated = require("react-native-reanimated/mock");
  Reanimated.default.call = () => undefined;
  return Reanimated;
});

jest.mock("expo-linear-gradient", () => ({
  LinearGradient: "LinearGradient",
}));

jest.mock("@react-native-community/netinfo", () => ({
  addEventListener: () => () => undefined,
  fetch: async () => ({ isConnected: true, isInternetReachable: true }),
}));

jest.mock("react-native-gesture-handler", () => {
  const { View } = require("react-native");
  return {
    GestureHandlerRootView: View,
    GestureDetector: View,
    Gesture: {
      Pan: () => {
        const g = { onStart: () => g, onUpdate: () => g, onEnd: () => g, onFinalize: () => g };
        return g;
      },
      Tap: () => {
        const g = { maxDuration: () => g, onEnd: () => g };
        return g;
      },
      Exclusive: (...gestures: unknown[]) => gestures[0],
    },
  };
});
