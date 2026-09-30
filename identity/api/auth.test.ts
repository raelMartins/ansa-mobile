import type { ApiClient } from "../../core/api/client";
import { ApiError } from "../../core/api/errors";
import { signIn, signUp } from "./auth";

function mockApi(handler: (path: string, body: unknown) => unknown): ApiClient {
  return {
    request: jest.fn(),
    post: jest.fn(async (path, body) => handler(path, body) as never),
    patch: jest.fn(),
    logout: jest.fn(),
  };
}

describe("identity auth api", () => {
  it("signs in with email", async () => {
    const api = mockApi((path, body) => {
      expect(path).toBe("/v1/auth/login");
      expect(body).toEqual({ email: "a@b.com", password: "secret" });
      return { user: { id: "1", ansaId: "A1", email: "a@b.com", phone: null }, tokens: { accessToken: "a", refreshToken: "r" } };
    });
    const result = await signIn(api, { email: "a@b.com", password: "secret" });
    expect(result.tokens.accessToken).toBe("a");
  });

  it("signs up with email", async () => {
    const api = mockApi((path, body) => {
      expect(path).toBe("/v1/auth/register");
      expect(body).toEqual({ email: "new@b.com", password: "password1" });
      return { user: { id: "2", ansaId: "A2", email: "new@b.com", phone: null }, tokens: { accessToken: "x", refreshToken: "y" } };
    });
    await signUp(api, { email: "new@b.com", password: "password1" });
  });
});

describe("sign in failure (client)", () => {
  it("surfaces ApiError from client", async () => {
    const api: ApiClient = {
      request: jest.fn(),
      post: jest.fn().mockRejectedValue(new ApiError(401, "UNAUTHORIZED", "Invalid credentials")),
      patch: jest.fn(),
      logout: jest.fn(),
    };
    await expect(signIn(api, { email: "a@b.com", password: "bad" })).rejects.toMatchObject({ status: 401 });
  });
});
