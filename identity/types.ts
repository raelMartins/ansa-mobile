export type User = {
  id: string;
  ansaId: string;
  email: string | null;
  phone: string | null;
};

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
  expiresIn?: string;
};

export type AuthResult = {
  user: User;
  tokens: AuthTokens;
};
