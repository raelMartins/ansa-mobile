# ansa mobile

Expo React Native **consumer ansa app** (ecosystem shell). **Merchant** is the only enabled product; delivery, jobs, check, locate, meets and health show as "Coming soon" in the product grid. Consumes `ansa-api` at `/v1`.

## Welcome flow

One continuous flow on a single canvas: **native splash (icon over wordmark) → dot → icon trace → wordmark trace → "What [wordmark] are you looking for today?" → product grid → login rises from below → dashboard in the product's colours.** Returning signed-in users get a short splash straight to the dashboard. Spec: `../../docs/mobile-welcome-motion-spec.md`.

**Replay (dev):** at the bottom of More, **Replay welcome flow (dev)** replays the cinematic without login (you stay signed in). **Sign out & replay from splash (dev)** replays it with login. Switch product or theme from More → Product / Appearance.

The custom native splash needs a development or release build; Expo Go shows its own splash.

**Brand assets:** after changing `assets/brand/ansa_icon.svg` or `ansa.svg`, run `pnpm brand:geometry` then `pnpm brand:splash`. `pnpm brand:sounds` regenerates the placeholder UI sounds.

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
