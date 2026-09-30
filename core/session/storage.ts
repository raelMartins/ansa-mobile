import * as SecureStore from "expo-secure-store";
import type { SessionCredentials } from "./types";

const ACCESS_KEY = "ansa.mobile.accessToken";
const REFRESH_KEY = "ansa.mobile.refreshToken";

export type SessionStorage = {
  load(): Promise<SessionCredentials | null>;
  save(credentials: SessionCredentials): Promise<void>;
  clear(): Promise<void>;
  getAccessToken(): Promise<string | null>;
  getRefreshToken(): Promise<string | null>;
};

async function read(key: string): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(key);
  } catch {
    return null;
  }
}

async function write(key: string, value: string): Promise<void> {
  await SecureStore.setItemAsync(key, value);
}

async function remove(key: string): Promise<void> {
  await SecureStore.deleteItemAsync(key);
}

/** Production session persistence via expo-secure-store. */
export const secureSessionStorage: SessionStorage = {
  async load() {
    const accessToken = await read(ACCESS_KEY);
    const refreshToken = await read(REFRESH_KEY);
    if (!accessToken || !refreshToken) {
      return null;
    }
    return { accessToken, refreshToken };
  },

  async save({ accessToken, refreshToken }) {
    await write(ACCESS_KEY, accessToken);
    await write(REFRESH_KEY, refreshToken);
  },

  async clear() {
    await remove(ACCESS_KEY);
    await remove(REFRESH_KEY);
  },

  getAccessToken() {
    return read(ACCESS_KEY);
  },

  getRefreshToken() {
    return read(REFRESH_KEY);
  },
};
