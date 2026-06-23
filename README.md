# Vicuras Behandler App (React Native)

A React Native (Expo Router, SDK 56) port of the **Vicuras Behandler** employee
app — the dark, indigo/magenta phone UI from the `claude_design` prototype
(`Vicuras Behandler App.dc.html`), wired to the same backend the Flutter
`TreaterApp` uses (`https://kundeportal-test.vicuras.dk`).

## Get started

```bash
npm install
npx expo start            # then press a (Android), i (iOS), or scan in Expo Go
```

Point the app at a different backend with `EXPO_PUBLIC_API_BASE_URL`.

## Architecture

```
src/
  api/            Network layer (ported from the Flutter services)
    config.ts       base URL + endpoint constants
    client.ts       fetch wrapper: bearer auth, timeout, ApiError
    auth.ts         login (token extraction + language normalisation)
    services.ts     dashboard / profile / shifts / bookings / room / images
    types.ts        TypeScript models
  state/          React contexts
    auth-context     session persistence via expo-secure-store, login/logout
    user-context     loads the live /Profile, exposes profile + 401 → logout
    navigation-context  tab + overlay stack (mirrors the Flutter index nav)
  theme/          Colors, Alpha, Font, Spacing, Radius, gradients
  components/
    ui/             Txt, Icon, GlassCard, buttons, pills, Avatar, Toggle,
                    ProgressBar, BottomSheet, Toast, DesignBackground …
    shell/          BottomNav (5 tabs + FAB), QuickActionFab, AppShell
  screens/        One file per screen (login, onboarding, home, calendar,
                  tasks, forum, profile, order-materials, notifications,
                  treatment-guide, medals)
  app/            expo-router entry: _layout (fonts + providers), index (gate)
```

### Navigation

`app/index.tsx` is an auth gate: **loading → splash**, **no token → Login**,
**token but onboarding incomplete → Onboarding**, otherwise **AppShell**.
`AppShell` renders the active tab (`home / calendar / tasks / forum / profile`)
plus a custom bottom nav and an expandable quick-action FAB, and stacks
full-screen overlays (order-materials, notifications, treatment-guide, medals,
onboarding) on top.

### API integration

The login flow, bearer-token auth, session persistence and every treater
endpoint are ported 1:1 from the Flutter app. The **Profile** screen renders
live `/api/treater/Profile` data; the **Calendar** day view loads live
`/api/booking/specificdaybookings`. Other screens use realistic demo data where
the Flutter app does too. A 401/403 anywhere triggers a clean logout.

### Design fidelity

Design tokens (colours, Manrope/Montserrat typography, gradients, radii) come
straight from the prototype and the Flutter `app_colors.dart`. Icons use
`@expo/vector-icons` Material Icons (the prototype's Material Symbols names are
mapped in `components/ui/icon.tsx`). The extracted design source is kept in
`design-reference/` for reference.

> Note: the prototype is a click-through demo without a persistent tab bar; the
> 5-tab bottom navigation follows the production Flutter app, styled in the
> prototype's visual language.
```
