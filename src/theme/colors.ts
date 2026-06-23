/**
 * Vicuras Behandler App — canonical color tokens.
 * Ported 1:1 from the Flutter app's lib/theme/app_colors.dart and the
 * claude_design prototype (Vicuras Behandler App.dc.html).
 */
export const Colors = {
  // Backgrounds
  bg: '#04050F', // outermost page background
  bgTop: '#0F1054', // page gradient top stop
  bgMid: '#16186E', // page gradient middle stop
  bgBottom: '#1C1E82', // page gradient bottom stop
  navBg: '#15166A', // bottom navigation background
  sheetBg: '#0C1138', // bottom-sheet / modal surface
  inputBg: '#0A0F33', // input / select field fill

  // Brand accents
  pink: '#D633E0', // primary brand magenta
  pinkBright: '#E98BEF', // bright pink variant
  pinkDeep: '#A02AD4', // deep purple-pink
  onPink: '#33003C', // text on pink fills

  // Text
  text: '#F3F4FF', // primary off-white text
  muted: '#9EA4D8', // secondary / muted text
  faint: '#6B72A8', // faint text (lowest contrast)
  lilac: '#BFBCFF', // light lilac accent

  // Status
  success: '#62E2A6',
  warning: '#F6B545',
  danger: '#FF6072',
  red: '#FF2D4A',

  // Neutrals
  white: '#FFFFFF',

  // Panel variants (from the prototype's deep-indigo palette)
  deepPanel: '#14155F',
  panel: '#1C1E80',
  panelBright: '#333BC4',
} as const;

export type ColorToken = keyof typeof Colors;

/** Translucent helpers used across cards / borders. */
export const Alpha = {
  /** card surface — white @ 3.5% */
  glass: 'rgba(255,255,255,0.035)',
  /** secondary card surface — white @ 6% */
  glassStrong: 'rgba(255,255,255,0.06)',
  /** hairline border — white @ 12% */
  hairline: 'rgba(255,255,255,0.12)',
  /** soft hairline — white @ 10% */
  hairlineSoft: 'rgba(255,255,255,0.10)',
  /** faint divider — white @ 6% */
  divider: 'rgba(255,255,255,0.06)',
  /** pink glow tint */
  pinkTint: 'rgba(217,74,230,0.12)',
  pinkBorder: 'rgba(217,74,230,0.35)',
  /** progress track */
  track: 'rgba(255,255,255,0.10)',
  dangerTint: 'rgba(255,96,114,0.14)',
  dangerBorder: 'rgba(255,96,114,0.35)',
  warningTint: 'rgba(246,181,69,0.12)',
  warningBorder: 'rgba(246,181,69,0.30)',
  successTint: 'rgba(98,226,166,0.12)',
  successBorder: 'rgba(98,226,166,0.30)',
} as const;
