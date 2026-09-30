import type { ApiClient } from "../../core/api/client";
import type { AuthResult } from "../types";

export type SignInInput = {
  email?: string;
  phone?: string;
  password: string;
};

export type SignUpInput = {
  email: string;
  password: string;
};

export async function signIn(api: ApiClient, input: SignInInput): Promise<AuthResult> {
  const body =
    input.email !== undefined
      ? { email: input.email, password: input.password }
      : { phone: input.phone, password: input.password };
  return api.post<AuthResult>("/v1/auth/login", body);
}

export async function signUp(api: ApiClient, input: SignUpInput): Promise<AuthResult> {
  return api.post<AuthResult>("/v1/auth/register", {
    email: input.email.trim().toLowerCase(),
    password: input.password,
  });
}
