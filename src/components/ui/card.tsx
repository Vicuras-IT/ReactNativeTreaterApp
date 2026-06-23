import { LinearGradient } from 'expo-linear-gradient';
import {
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import type { ReactNode } from 'react';

import { Alpha, Colors, Radius } from '@/theme';
import { Txt } from './txt';

interface GlassCardProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  padding?: number;
  radius?: number;
  /** optional gradient fill (array of 2-3 colors) overrides the glass surface */
  gradient?: readonly [string, string, ...string[]];
  borderColor?: string;
  backgroundColor?: string;
}

/** Translucent surface with a hairline border — the app's primary card. */
export function GlassCard({
  children,
  style,
  padding = 16,
  radius = Radius.xxl,
  gradient,
  borderColor = Alpha.hairline,
  backgroundColor = Alpha.glass,
}: GlassCardProps) {
  const base: ViewStyle = {
    borderRadius: radius,
    borderWidth: 1,
    borderColor,
    padding,
    overflow: 'hidden',
  };
  if (gradient) {
    return (
      <LinearGradient
        colors={gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[base, style]}>
        {children}
      </LinearGradient>
    );
  }
  return <View style={[base, { backgroundColor }, style]}>{children}</View>;
}

/** Uppercase tracked-out section label (e.g. "DET VENTER PÅ DIG"). */
export function SectionLabel({
  children,
  trailing,
  style,
}: {
  children: ReactNode;
  trailing?: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[styles.sectionRow, style]}>
      <Txt
        font="bold"
        size={12}
        color={Colors.muted}
        tracking={1.8}
        uppercase
        style={styles.flex}>
        {children}
      </Txt>
      {trailing}
    </View>
  );
}

const styles = StyleSheet.create({
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  flex: { flexShrink: 1 },
});
