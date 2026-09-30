# ansa mobile (merchant)

Expo React Native application for the **ansa merchant** experience. Consumes `ansa-api` at `/v1`.

## Prerequisites

- Node.js 22+ (aligned with `ansa-api`)
- pnpm
- Running API on port **5000** (`pnpm api:dev` from workspace root)
- [Expo Go](https://expo.dev/go) on a device, or Android emulator

## Configuration

Copy `.env.example` to `.env` and set **`EXPO_PUBLIC_API_URL`** (any placeholder is fine in dev).

In **development**, `getApiBaseUrl()` resolves automatically:

| How you run the app | API target |
|---------------------|------------|
| **Physical phone** (Expo Go, same Wi‑Fi as PC) | `http://<Metro-LAN-IP>:5000` (same IP as the QR code, port **5000**) |
| Android emulator | `http://10.0.2.2:5000` |
| iOS simulator | `http://localhost:5000` |

Ensure **`pnpm api:dev`** is running and **Docker Postgres** is up (`pnpm docker:up`). Allow port **5000** through Windows Firewall for private networks if the phone cannot connect.

Restart Expo after changing `.env` (`pnpm start:clean` if needed).

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
