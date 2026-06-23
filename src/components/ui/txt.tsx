import { Text, type TextProps, type TextStyle } from 'react-native';

import { Colors, Font } from '@/theme';

type FontVariant =
  | 'regular'
  | 'medium'
  | 'semibold'
  | 'bold'
  | 'extrabold'
  | 'display'
  | 'displayBold'
  | 'displayExtrabold';

const FONT_MAP: Record<FontVariant, string> = {
  regular: Font.regular,
  medium: Font.medium,
  semibold: Font.semibold,
  bold: Font.bold,
  extrabold: Font.extrabold,
  display: Font.displaySemibold,
  displayBold: Font.displayBold,
  displayExtrabold: Font.displayExtrabold,
};

interface TxtProps extends TextProps {
  font?: FontVariant;
  size?: number;
  color?: string;
  /** letter-spacing shortcut */
  tracking?: number;
  lineHeight?: number;
  align?: TextStyle['textAlign'];
  uppercase?: boolean;
}

/** Themed Text — applies the Manrope/Montserrat family + default color. */
export function Txt({
  font = 'regular',
  size,
  color = Colors.text,
  tracking,
  lineHeight,
  align,
  uppercase,
  style,
  children,
  ...rest
}: TxtProps) {
  return (
    <Text
      {...rest}
      style={[
        {
          fontFamily: FONT_MAP[font],
          color,
          ...(size != null ? { fontSize: size } : null),
          ...(tracking != null ? { letterSpacing: tracking } : null),
          ...(lineHeight != null ? { lineHeight } : null),
          ...(align ? { textAlign: align } : null),
          ...(uppercase ? { textTransform: 'uppercase' as const } : null),
        },
        style,
      ]}>
      {children}
    </Text>
  );
}
