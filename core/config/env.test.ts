import { ConfigurationError, getApiBaseUrl } from "./env";

jest.mock("expo-device", () => ({
  isDevice: true,
}));

jest.mock("expo-constants", () => ({
  expoGoConfig: { debuggerHost: "192.168.0.201:8081" },
}));

describe("getApiBaseUrl", () => {
  const original = process.env.EXPO_PUBLIC_API_URL;
  const originalDev = (global as { __DEV__?: boolean }).__DEV__;

  beforeEach(() => {
    (global as { __DEV__?: boolean }).__DEV__ = true;
  });

  afterEach(() => {
    (global as { __DEV__?: boolean }).__DEV__ = originalDev;
    if (original === undefined) {
      delete process.env.EXPO_PUBLIC_API_URL;
    } else {
      process.env.EXPO_PUBLIC_API_URL = original;
    }
  });

  it("throws when EXPO_PUBLIC_API_URL is missing", () => {
    delete process.env.EXPO_PUBLIC_API_URL;
    expect(() => getApiBaseUrl()).toThrow(ConfigurationError);
  });

  it("uses Metro LAN host on a physical device in dev", () => {
    process.env.EXPO_PUBLIC_API_URL = "http://10.0.2.2:5000/";
    expect(getApiBaseUrl()).toBe("http://192.168.0.201:5000");
  });
});
