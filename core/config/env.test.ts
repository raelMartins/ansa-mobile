import { ConfigurationError, getApiBaseUrl } from "./env";

describe("getApiBaseUrl", () => {
  const original = process.env.EXPO_PUBLIC_API_URL;

  afterEach(() => {
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

  it("returns trimmed URL without trailing slash", () => {
    process.env.EXPO_PUBLIC_API_URL = "http://10.0.2.2:5000/";
    expect(getApiBaseUrl()).toBe("http://10.0.2.2:5000");
  });
});
