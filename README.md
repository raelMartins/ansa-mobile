# ansa mobile

Expo React Native **consumer ansa app** (ecosystem shell). **Merchant** is the first active product; Jobs, Delivery, Check, and others appear in the product picker as they ship. Consumes `ansa-api` at `/v1`.

## Welcome flow

Cold start: **splash → ecosystem slideshow → sign in / sign up → product picker → merchant** (expansion transition into the dashboard).

**Replay the full flow (dev):** More → **Sign out & replay from splash** — or **Replay welcome flow** while signed in (re-shows intro + product picker; sign out first if you need auth screens again).

Restart Metro with `pnpm start:clean` after installing native deps (`react-native-reanimated`).

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
