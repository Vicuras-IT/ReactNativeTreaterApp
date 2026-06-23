/**
 * API endpoints — ported from the Flutter app's lib/globals/urls.dart.
 * Base host can be overridden through EXPO_PUBLIC_API_BASE_URL.
 */
export const BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ?? 'https://kundeportal-test.vicuras.dk';

export const Endpoints = {
  login: `${BASE_URL}/api/treater/login`,
  profile: `${BASE_URL}/api/treater/Profile`,
  dashboard: `${BASE_URL}/api/treater/Dashboard`,
  shifts: `${BASE_URL}/api/treater/shifts`,
  specificDayBookings: `${BASE_URL}/api/booking/specificdaybookings`,
  room: `${BASE_URL}/api/treater/room`,
  locationImages: `${BASE_URL}/api/sharepoint/locationimages`,
} as const;

/** Shared secret sent with the login request (matches the Flutter client). */
export const LOGIN_SECRET = 'Mellon';

export const REQUEST_TIMEOUT_MS = 20000;
