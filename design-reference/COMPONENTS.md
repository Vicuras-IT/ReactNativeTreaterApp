# Shared foundation reference (Vicuras Behandler RN app)

These modules ALREADY EXIST. Import from them — **do not recreate** theme, UI
primitives, API, or state. Each screen file is self-contained otherwise (define
local sub-components + a `StyleSheet.create` block in the same file).

## Theme — `import { Colors, Alpha, Font, Spacing, Radius, PageGradient, PinkGradient, RequestGradient } from '@/theme';`

- `Colors`: `bg #04050F`, `bgTop #0F1054`, `bgMid #16186E`, `bgBottom #1C1E82`,
  `navBg #15166A`, `sheetBg #0C1138`, `inputBg #0A0F33`, `pink #D633E0`,
  `pinkBright #E98BEF`, `pinkDeep #A02AD4`, `onPink #33003C`, `text #F3F4FF`,
  `muted #9EA4D8`, `faint #6B72A8`, `lilac #BFBCFF`, `success #62E2A6`,
  `warning #F6B545`, `danger #FF6072`, `red #FF2D4A`, `white #FFFFFF`,
  `deepPanel #14155F`, `panel #1C1E80`, `panelBright #333BC4`
- `Alpha`: `glass 'rgba(255,255,255,0.035)'`, `glassStrong 'rgba(255,255,255,0.06)'`,
  `hairline 'rgba(255,255,255,0.12)'`, `hairlineSoft 'rgba(255,255,255,0.10)'`,
  `divider 'rgba(255,255,255,0.06)'`, `pinkTint 'rgba(217,74,230,0.12)'`,
  `pinkBorder 'rgba(217,74,230,0.35)'`, `track 'rgba(255,255,255,0.10)'`,
  `dangerTint`, `dangerBorder`, `warningTint`, `warningBorder`, `successTint`, `successBorder`
- `Radius`: `sm 10, md 14, lg 16, xl 18, xxl 20, pill 999`
- `Spacing`: `xs 4, sm 8, md 12, lg 16, xl 20, xxl 24`
- `PageGradient` `{colors,locations}`, `PinkGradient {colors}`, `RequestGradient {colors,locations}`

## UI — `import { Txt, Icon, GlassCard, SectionLabel, PinkButton, OutlinePillButton, ArrowLink, HeaderIconButton, PillTabs, StatusPill, Avatar, Toggle, ProgressBar, Divider, BottomSheet, useToast, DesignBackground } from '@/components/ui';`

- **`Txt`** — ALWAYS use instead of RN `Text`. Props: `font` = one of
  `'regular'|'medium'|'semibold'|'bold'|'extrabold'|'display'|'displayBold'|'displayExtrabold'`
  (display* = Montserrat headings), `size` (number), `color` (default `Colors.text`),
  `tracking` (letter-spacing), `lineHeight`, `align`, `uppercase`. Plus normal Text props.
- **`Icon`** — `<Icon name="material_symbol_name" size={24} color={...} />`. `name`
  uses Material Symbols underscore names exactly as in the design HTML
  (e.g. `calendar_month`, `chevron_right`, `star`, `notifications`, `event_available`,
  `receipt_long`, `photo_camera`, `workspace_premium`, `edit_note`, `fact_check`).
- **`GlassCard`** — `<GlassCard padding={16} radius={20} gradient={['#a','#b']} borderColor={...} backgroundColor={...} style={...}>`. Default = translucent glass + hairline border.
- **`SectionLabel`** — `<SectionLabel trailing={<…/>}>UPPERCASE LABEL</SectionLabel>` (already tracked/uppercase/muted, marginBottom 12).
- **`PinkButton`** — `label, icon?, uppercase?, expand?, onPress, disabled?`.
- **`OutlinePillButton`** — `label, icon?, color?, borderColor?, expand?, count?, onPress`.
- **`ArrowLink`** — `label, onPress, color?, size?` (pink text + forward arrow).
- **`HeaderIconButton`** — `icon, onPress, badge?, color?` (40×40 round).
- **`PillTabs<T extends string>`** — `tabs={[{key,label}]}, selected, onSelect, scroll?`. Selected pill = pink.
- **`StatusPill`** — `label, color?, background?, borderColor?` (small uppercase badge).
- **`Avatar`** — `initials, pictureBase64?, size?, fontSize?` (gradient + initials fallback, else photo).
- **`Toggle`** — `value, onChange?, small?, disabled?`.
- **`ProgressBar`** — `progress` (0..1), `height?`.
- **`Divider`** — thin hairline line.
- **`BottomSheet`** — `<BottomSheet visible title onClose>children</BottomSheet>`.
- **`useToast()`** — `const toast = useToast(); toast.show('Besked');`
- **`DesignBackground`** — gradient page bg with glows. See "Backgrounds" below.

## State hooks

- `import { useAuth } from '@/state/auth-context';`
  → `{ status, token, language, onboardingComplete, biometricsEnabled, loginMessage,
       hasSavedSession, signIn(u,p), resumeSavedSession(), signOut(message?),
       completeOnboarding(), setBiometricsEnabled(bool) }`
- `import { useUser } from '@/state/user-context';`
  → `{ profile: ProfileData | null, loading: boolean, error: string | null, reload() }`
- `import { useNav } from '@/state/navigation-context';`
  → `{ tab, overlays, calendarView, setTab(tab), pushOverlay, popOverlay,
       openTodaysProgram(), openOrderMaterials(), openNotifications(),
       openTreatmentGuide(params?), openMedals(), openOnboarding() }`
  where `tab` ∈ `'home'|'calendar'|'tasks'|'forum'|'profile'`.

## API — `import { fetchDashboard, fetchProfile, fetchShifts, fetchSpecificDayBookings, fetchRoomDetails, fetchRoomImages, ApiError } from '@/api';`
Types: `import type { DashboardData, ProfileData, ShiftScheduleData, ShiftEntry, SpecificDayBooking, RoomDetailsData, RoomImageData } from '@/api';`

- `ProfileData`: `{ fullName, primaryEmail, mobilePhone, address, skills[], treatmentTypes[],
   temporarilyAvailable, eveningShifts, notificationSummary, pictureBase64, initials }`
- `SpecificDayBooking`: `{ bookingId, treaterName, start:Date|null, end:Date|null, serviceType,
   contactName, contactFirstName, contactLastName, bookingStatus, state, status,
   isCompleted, isActive, displayStatus }`
- All `fetch*` take `token` first. Catch `ApiError`; if `err.isUnauthorized` call `signOut('Din session er udløbet. Log ind igen.')`.

## Date utils — `import { formatTime, formatDateTime, formatDateLong, formatTimeRange } from '@/utils/date';`

## Backgrounds / layout conventions

- **Tab screens** (`home, calendar, tasks, forum, profile`): rendered INSIDE the shell's
  `DesignBackground`. Root must be a **transparent** `View`/`ScrollView` — do NOT wrap in
  `DesignBackground`. Use `useSafeAreaInsets()` (from `react-native-safe-area-context`) for top
  padding. ScrollView content must end with `paddingBottom: 120` so the bottom nav doesn't cover it.
  Use `showsVerticalScrollIndicator={false}`.
- **Overlay screens** (`order-materials, notifications, treatment-guide, medals, onboarding`): wrap
  the whole screen in `<DesignBackground>` so it fully covers. Provide a sticky-ish back header with a
  round back button calling the `onBack` prop (icon `arrow_back`).
- Header pattern (tab screens): a row with title (Montserrat via `font="displayBold"` ~19-22px) on
  the left, `HeaderIconButton`s on the right (`notifications`, `settings`, avatar).
- Match the Danish text from the design HTML EXACTLY.
- Use real `profile` data where the screen shows the user (name/initials/picture/contact). Everything
  else may use realistic hard-coded demo data (the Flutter app does too).
- TypeScript strict. Component is a named export, e.g. `export function HomeScreen() {…}`.
