export type SessionCredentials = {
  accessToken: string;
  refreshToken: string;
};

export type SessionStatus = "loading" | "unauthenticated" | "authenticated";
