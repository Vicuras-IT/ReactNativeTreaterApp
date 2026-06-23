/**
 * Font family keys. These match the names registered via `useFonts` in the
 * root layout (the @expo-google-fonts export names). Manrope = body / UI,
 * Montserrat = display headings.
 */
export const Font = {
  regular: 'Manrope_400Regular',
  medium: 'Manrope_500Medium',
  semibold: 'Manrope_600SemiBold',
  bold: 'Manrope_700Bold',
  extrabold: 'Manrope_800ExtraBold',

  displaySemibold: 'Montserrat_600SemiBold',
  displayBold: 'Montserrat_700Bold',
  displayExtrabold: 'Montserrat_800ExtraBold',
} as const;

export type FontKey = keyof typeof Font;
