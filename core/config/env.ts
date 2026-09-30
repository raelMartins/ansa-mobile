export class ConfigurationError extends Error {
  readonly code = "CONFIGURATION_ERROR";

  constructor(message: string) {
    super(message);
    this.name = "ConfigurationError";
  }
}

/**
 * API base URL from Expo public env (no trailing slash).
 * Must be set in `.env` — never hard-code localhost in application code.
 */
export function getApiBaseUrl(): string {
  const raw = process.env.EXPO_PUBLIC_API_URL?.trim();
  if (!raw) {
    throw new ConfigurationError(
      "EXPO_PUBLIC_API_URL is not set. Copy .env.example to .env and set your API URL (see README.md).",
    );
  }
  return raw.replace(/\/+$/, "");
}
