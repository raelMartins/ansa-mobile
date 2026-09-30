import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { ApiClient } from "../api/client";
import { createDefaultApiClient } from "../api/client";
import { secureSessionStorage, type SessionStorage } from "./storage";
import type { SessionCredentials, SessionStatus } from "./types";

type SessionContextValue = {
  status: SessionStatus;
  api: ApiClient;
  credentials: SessionCredentials | null;
  restoreSession: () => Promise<void>;
  establishSession: (credentials: SessionCredentials) => Promise<void>;
  signOut: () => Promise<void>;
};

const SessionContext = createContext<SessionContextValue | null>(null);

type SessionProviderProps = {
  children: ReactNode;
  storage?: SessionStorage;
};

export function SessionProvider({ children, storage = secureSessionStorage }: SessionProviderProps) {
  const [status, setStatus] = useState<SessionStatus>("loading");
  const [credentials, setCredentials] = useState<SessionCredentials | null>(null);

  const handleSessionCleared = useCallback(() => {
    setCredentials(null);
    setStatus("unauthenticated");
  }, []);

  const api = useMemo(
    () => createDefaultApiClient(storage, handleSessionCleared),
    [storage, handleSessionCleared],
  );

  const restoreSession = useCallback(async () => {
    setStatus("loading");
    const loaded = await storage.load();
    if (loaded) {
      setCredentials(loaded);
      setStatus("authenticated");
    } else {
      setCredentials(null);
      setStatus("unauthenticated");
    }
  }, [storage]);

  const establishSession = useCallback(
    async (next: SessionCredentials) => {
      await storage.save(next);
      setCredentials(next);
      setStatus("authenticated");
    },
    [storage],
  );

  const signOut = useCallback(async () => {
    await api.logout();
    setCredentials(null);
    setStatus("unauthenticated");
  }, [api]);

  useEffect(() => {
    void restoreSession();
  }, [restoreSession]);

  const value = useMemo(
    () => ({
      status,
      api,
      credentials,
      restoreSession,
      establishSession,
      signOut,
    }),
    [status, api, credentials, restoreSession, establishSession, signOut],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext);
  if (!ctx) {
    throw new Error("useSession must be used within SessionProvider");
  }
  return ctx;
}
