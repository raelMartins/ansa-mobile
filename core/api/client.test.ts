import { createApiClient } from "./client";
import { ApiError } from "./errors";
import type { SessionStorage } from "../session/storage";

function createMemorySession(initial?: { accessToken: string; refreshToken: string }): SessionStorage {
  let access: string | null = initial?.accessToken ?? null;
  let refresh: string | null = initial?.refreshToken ?? null;
  return {
    async load() {
      if (!access || !refresh) return null;
      return { accessToken: access, refreshToken: refresh };
    },
    async save(creds) {
      access = creds.accessToken;
      refresh = creds.refreshToken;
    },
    async clear() {
      access = null;
      refresh = null;
    },
    getAccessToken: async () => access,
    getRefreshToken: async () => refresh,
  };
}

describe("createApiClient", () => {
  const baseUrl = "http://api.test";

  it("parses successful { data } envelope", async () => {
    const session = createMemorySession();
    const fetchFn = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ data: { ok: true } }),
    });

    const client = createApiClient({ getBaseUrl: () => baseUrl, session, fetchFn });
    await expect(client.request("/v1/health")).resolves.toEqual({ ok: true });
  });

  it("throws ApiError for structured { error } responses", async () => {
    const session = createMemorySession();
    const fetchFn = jest.fn().mockResolvedValue({
      ok: false,
      status: 400,
      statusText: "Bad Request",
      json: async () => ({
        error: { code: "VALIDATION_ERROR", message: "Invalid input", requestId: "req-1" },
      }),
    });

    const client = createApiClient({ getBaseUrl: () => baseUrl, session, fetchFn });
    await expect(client.request("/v1/auth/login")).rejects.toMatchObject({
      status: 400,
      code: "VALIDATION_ERROR",
      message: "Invalid input",
      requestId: "req-1",
    });
  });

  it("refreshes on 401 and retries the original request once", async () => {
    const session = createMemorySession({ accessToken: "old", refreshToken: "refresh-1" });
    const fetchFn = jest
      .fn()
      .mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ error: { code: "UNAUTHORIZED", message: "expired" } }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          data: { tokens: { accessToken: "new-access", refreshToken: "new-refresh" } },
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ data: { user: { id: "u1" } } }),
      });

    const client = createApiClient({ getBaseUrl: () => baseUrl, session, fetchFn });
    await expect(client.request("/v1/auth/me")).resolves.toEqual({ user: { id: "u1" } });
    expect(fetchFn).toHaveBeenCalledTimes(3);
    expect(await session.getAccessToken()).toBe("new-access");
  });

  it("deduplicates concurrent refresh attempts", async () => {
    const session = createMemorySession({ accessToken: "old", refreshToken: "refresh-1" });
    let refreshCalls = 0;
    const protectedAttempts = new Map<string, number>();
    const fetchFn = jest.fn(async (url: string) => {
      if (url.endsWith("/v1/auth/refresh")) {
        refreshCalls += 1;
        await new Promise((r) => setTimeout(r, 20));
        return {
          ok: true,
          status: 200,
          json: async () => ({
            data: { tokens: { accessToken: "new", refreshToken: "new-r" } },
          }),
        };
      }
      const path = url.replace(baseUrl, "");
      if (path === "/v1/a" || path === "/v1/b") {
        const count = (protectedAttempts.get(path) ?? 0) + 1;
        protectedAttempts.set(path, count);
        if (count === 1) {
          return {
            ok: false,
            status: 401,
            json: async () => ({ error: { code: "UNAUTHORIZED", message: "expired" } }),
          };
        }
      }
      return {
        ok: true,
        status: 200,
        json: async () => ({ data: { ok: true } }),
      };
    });

    const client = createApiClient({ getBaseUrl: () => baseUrl, session, fetchFn });
    await Promise.all([client.request("/v1/a"), client.request("/v1/b")]);
    expect(refreshCalls).toBe(1);
  });

  it("clears session when refresh fails", async () => {
    const session = createMemorySession({ accessToken: "old", refreshToken: "refresh-1" });
    const onSessionCleared = jest.fn();
    const fetchFn = jest
      .fn()
      .mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ error: { code: "UNAUTHORIZED", message: "expired" } }),
      })
      .mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ error: { code: "UNAUTHORIZED", message: "bad refresh" } }),
      });

    const client = createApiClient({
      getBaseUrl: () => baseUrl,
      session,
      fetchFn,
      onSessionCleared,
    });

    await expect(client.request("/v1/auth/me")).rejects.toBeInstanceOf(ApiError);
    expect(await session.getRefreshToken()).toBeNull();
    expect(onSessionCleared).toHaveBeenCalled();
  });
});
