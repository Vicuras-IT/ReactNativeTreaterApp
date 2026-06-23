export { Colors, Alpha } from './colors';
export type { ColorToken } from './colors';
export { Font } from './typography';
export type { FontKey } from './typography';

/** Spacing scale (px). */
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
} as const;

/** Corner radii (px). */
export const Radius = {
  sm: 10,
  md: 14,
  lg: 16,
  xl: 18,
  xxl: 20,
  pill: 999,
} as const;

/**
 * Page background gradient stops (deep indigo). Maps to the Flutter
 * `pageGradient` (bgTop → bgMid 48% → bgBottom).
 */
export const PageGradient = {
  colors: ['#0F1054', '#16186E', '#1C1E82'] as const,
  locations: [0, 0.48, 1] as const,
};

/** Primary pink button / accent gradient. */
export const PinkGradient = {
  colors: ['#C81FD4', '#D633E0'] as const,
};

/** Card gradient used on the "next workday" / request cards. */
export const RequestGradient = {
  colors: ['#D23FE0', '#A02AD4', '#7A23C0'] as const,
  locations: [0, 0.55, 1] as const,
};

/** Phone-frame max width used by the prototype (404px canvas). */
export const PHONE_MAX_WIDTH = 480;
