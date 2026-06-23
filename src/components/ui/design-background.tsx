import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import type { ReactNode } from 'react';

import { PageGradient } from '@/theme';

/**
 * Full-bleed page background: deep-indigo vertical gradient with two soft
 * magenta/indigo glows (approximating the prototype's radial highlights).
 */
export function DesignBackground({
  children,
  style,
}: {
  children?: ReactNode;
  style?: ViewStyle;
}) {
  return (
    <LinearGradient
      colors={PageGradient.colors}
      locations={PageGradient.locations}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={[styles.fill, style]}>
      <View pointerEvents="none" style={[styles.glow, styles.glowTop]} />
      <View pointerEvents="none" style={[styles.glow, styles.glowBottom]} />
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: '#04050F' },
  glow: {
    position: 'absolute',
    width: 360,
    height: 360,
    borderRadius: 180,
    opacity: 0.16,
  },
  glowTop: {
    top: -120,
    right: -80,
    backgroundColor: '#D633E0',
  },
  glowBottom: {
    bottom: -100,
    left: -120,
    backgroundColor: '#3B41CA',
  },
});
