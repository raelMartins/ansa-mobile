import { getApiBaseUrl } from "../config/env";
import type { SessionStorage } from "../session/storage";
import { ApiError } from "./errors";
import type { ApiEnvelope, RefreshTokensPayload } from "./envelope";

export type ApiClient = {
  request<T>(path: string, init?: RequestInit): Promise<T>;
  post<T>(path: string, body?: unknown): Promise<T>;
  patch<T>(path: string, body: unknown): Promise<T>;
  logout(): Promise<void>;
};

export type ApiClientDeps = {
  getBaseUrl: () => string;
  session: SessionStorage;
  fetchFn?: typeof fetch;
  onSessionCleared?: () => void;
};

export function createApiClient(deps: ApiClientDeps): ApiClient {
  const fetchFn = deps.fetchFn ?? fetch;
  let refreshInFlight: Promise<string | null> | null = null;

  async function refreshAccessToken(): Promise<string | null> {
    if (refreshInFlight) {
      return refreshInFlight;
    }

    refreshInFlight = (async () => {
      const refreshToken = await deps.session.getRefreshToken();
      if (!refreshToken) {
        await deps.session.clear();
        deps.onSessionCleared?.();
        return null;
      }

      let res: Response;
      try {
        res = await fetchFn(`${deps.getBaseUrl()}/v1/auth/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken }),
        });
      } catch {
        return null;
      }

      const json = (await res.json().catch(() => ({}))) as ApiEnvelope<RefreshTokensPayload>;
      if (!res.ok || !("data" in json) || !json.data?.tokens) {
        await deps.session.clear();
        deps.onSessionCleared?.();
        return null;
      }

      const { accessToken, refreshToken: nextRefresh } = json.data.tokens;
      await deps.session.save({ accessToken, refreshToken: nextRefresh });
      return accessToken;
    })().finally(() => {
      refreshInFlight = null;
    });

    return refreshInFlight;
  }

  async function request<T>(path: string, init: RequestInit = {}, retry = true): Promise<T> {
    const headers = new Headers(init.headers);
    if (init.body && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }

    const accessToken = await deps.session.getAccessToken();
    if (accessToken) {
      headers.set("Authorization", `Bearer ${accessToken}`);
    }

    let res: Response;
    try {
      res = await fetchFn(`${deps.getBaseUrl()}${path}`, { ...init, headers });
    } catch {
      throw new ApiError(0, "NETWORK", "Can't reach us right now. Check your connection and that the API is running.");
    }

    const json = (await res.json().catch(() => ({}))) as ApiEnvelope<T>;

    if (res.status === 401 && retry && (await deps.session.getRefreshToken())) {
      const nextAccess = await refreshAccessToken();
      if (nextAccess) {
        return request<T>(path, init, false);
      }
    }

    if (!res.ok) {
      const err = "error" in json ? json.error : undefined;
      const detail = err?.details?.[0];
      const message = detail
        ? `${detail.path ? `${detail.path}: ` : ""}${detail.message}`
        : err?.message ?? res.statusText;
      throw new ApiError(res.status, err?.code ?? "ERROR", message, err?.requestId);
    }

    if (!("data" in json) || json.data === undefined) {
      throw new ApiError(res.status, "ERROR", "Empty response");
    }

    return json.data;
  }

  return {
    request,
    post<T>(path: string, body?: unknown) {
      return request<T>(path, { method: "POST", body: JSON.stringify(body ?? {}) });
    },
    patch<T>(path: string, body: unknown) {
      return request<T>(path, { method: "PATCH", body: JSON.stringify(body) });
    },
    async logout() {
      const refreshToken = await deps.session.getRefreshToken();
      await deps.session.clear();
      deps.onSessionCleared?.();
      if (!refreshToken) {
        return;
      }
      await fetchFn(`${deps.getBaseUrl()}/v1/auth/logout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      }).catch(() => undefined);
    },
  };
}

/** App-wide client using secure session storage and configured API URL. */
export function createDefaultApiClient(
  session: SessionStorage,
  onSessionCleared?: () => void,
): ApiClient {
  return createApiClient({
    getBaseUrl: getApiBaseUrl,
    session,
    onSessionCleared,
  });
}
