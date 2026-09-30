# ansa mobile (merchant)

Expo React Native application for the **ansa merchant** experience. Consumes `ansa-api` at `/v1`.

## Prerequisites

- Node.js 22+ (aligned with `ansa-api`)
- pnpm
- Running API on port **5000** (`pnpm api:dev` from workspace root)
- [Expo Go](https://expo.dev/go) on a device, or Android emulator

## Configuration

Copy `.env.example` to `.env` and set **`EXPO_PUBLIC_API_URL`**. Do not hard-code `localhost` in source — use the value appropriate for how you run the app:

| Environment | Typical `EXPO_PUBLIC_API_URL` |
|-------------|-------------------------------|
| Android emulator | `http://10.0.2.2:5000` |
| Physical device (same LAN) | `http://<your-PC-LAN-IP>:5000` |
| iOS simulator | `http://localhost:5000` |

Restart the Expo dev server after changing `.env`.

## Scripts

```bash
pnpm install
pnpm start          # Expo dev server
pnpm android        # Open on Android emulator/device
pnpm typecheck      # TypeScript
pnpm test           # Unit tests
pnpm validate       # typecheck + test + expo-doctor
```

From workspace root: `pnpm mobile:dev`, `pnpm mobile:test`, `pnpm mobile:validate`.

## Architecture (foundation)

- `core/` — API client, config, secure session, navigation shell
- `identity/` — authentication screens (next step)
- `merchant/` — merchant domain (onboarding, overview placeholders only so far)

Public storefront and payments are **not** in this app yet.
