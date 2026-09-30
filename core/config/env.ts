import Constants from "expo-constants";
import * as Device from "expo-device";
import { Platform } from "react-native";

export class ConfigurationError extends Error {
  readonly code = "CONFIGURATION_ERROR";

  constructor(message: string) {
    super(message);
    this.name = "ConfigurationError";
  }
}

function lanHostFromMetro(): string | null {
  const debuggerHost = Constants.expoGoConfig?.debuggerHost;
  if (!debuggerHost) {
    return null;
  }
  const host = debuggerHost.split(":")[0]?.trim();
  return host || null;
}

/**
 * API base URL (no trailing slash).
 * In dev, resolves emulator vs physical device automatically so `.env` can stay simple.
 */
export function getApiBaseUrl(): string {
  const raw = process.env.EXPO_PUBLIC_API_URL?.trim();
  if (!raw) {
    throw new ConfigurationError(
      "EXPO_PUBLIC_API_URL is not set. Copy .env.example to .env and set your API URL (see README.md).",
    );
  }

  const configured = raw.replace(/\/+$/, "");

  if (!__DEV__) {
    return configured;
  }

  if (!Device.isDevice) {
    if (Platform.OS === "android") {
      return "http://10.0.2.2:5000";
    }
    return "http://localhost:5000";
  }

  const lan = lanHostFromMetro();
  if (lan) {
    return `http://${lan}:5000`;
  }

  return configured;
}
