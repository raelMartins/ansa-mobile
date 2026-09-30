const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type LoginIdentifier =
  | { email: string; phone?: undefined }
  | { phone: string; email?: undefined };

/** Maps a single credential field to email or phone for `/v1/auth/login`. */
export function parseLoginIdentifier(raw: string): LoginIdentifier | null {
  const value = raw.trim();
  if (!value) return null;
  if (EMAIL_RE.test(value)) {
    return { email: value.toLowerCase() };
  }
  const digits = value.replace(/\D/g, "");
  if (digits.length >= 8) {
    return { phone: value };
  }
  return null;
}

export function validatePassword(password: string, forRegister = false): string | null {
  if (!password) return "Password is required";
  if (forRegister && password.length < 8) return "Use at least 8 characters";
  return null;
}

export function validateEmail(email: string): string | null {
  const value = email.trim();
  if (!value) return "Email is required";
  if (!EMAIL_RE.test(value)) return "Enter a valid email address";
  return null;
}
