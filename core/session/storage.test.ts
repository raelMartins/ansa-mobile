import * as SecureStore from "expo-secure-store";
import { secureSessionStorage } from "./storage";

jest.mock("expo-secure-store", () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

const getItemAsync = SecureStore.getItemAsync as jest.Mock;
const setItemAsync = SecureStore.setItemAsync as jest.Mock;
const deleteItemAsync = SecureStore.deleteItemAsync as jest.Mock;

describe("secureSessionStorage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("saves access and refresh tokens", async () => {
    await secureSessionStorage.save({ accessToken: "a", refreshToken: "r" });
    expect(setItemAsync).toHaveBeenCalledTimes(2);
  });

  it("loads credentials when both tokens exist", async () => {
    getItemAsync.mockResolvedValueOnce("access").mockResolvedValueOnce("refresh");
    await expect(secureSessionStorage.load()).resolves.toEqual({
      accessToken: "access",
      refreshToken: "refresh",
    });
  });

  it("returns null when tokens are incomplete", async () => {
    getItemAsync.mockResolvedValueOnce("access").mockResolvedValueOnce(null);
    await expect(secureSessionStorage.load()).resolves.toBeNull();
  });

  it("clears both keys", async () => {
    await secureSessionStorage.clear();
    expect(deleteItemAsync).toHaveBeenCalledTimes(2);
  });
});
