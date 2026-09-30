export type ApiErrorBody = {
  code: string;
  message: string;
  details?: { path?: string; message: string }[];
  requestId?: string;
};

export type SuccessEnvelope<T> = { data: T };

export type ErrorEnvelope = { error: ApiErrorBody };

export type ApiEnvelope<T> = SuccessEnvelope<T> | ErrorEnvelope;

export type RefreshTokensPayload = {
  tokens: {
    accessToken: string;
    refreshToken: string;
    expiresIn?: string;
  };
};
