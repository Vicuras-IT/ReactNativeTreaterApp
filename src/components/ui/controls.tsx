import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { Alpha, Colors, PinkGradient, Radius } from '@/theme';

/** Animated pill toggle switch. */
export function Toggle({
  value,
  onChange,
  disabled,
  small,
}: {
  value: boolean;
  onChange?: (next: boolean) => void;
  disabled?: boolean;
  small?: boolean;
}) {
  const w = small ? 38 : 46;
  const h = small ? 22 : 26;
  const knob = h - 6;
  return (
    <Pressable
      disabled={disabled}
      onPress={() => onChange?.(!value)}
      style={[
        styles.track,
        {
          width: w,
          height: h,
          borderRadius: h / 2,
          backgroundColor: value ? Colors.pink : 'rgba(255,255,255,0.18)',
          opacity: disabled ? 0.6 : 1,
        },
      ]}>
      <View
        style={[
          styles.knob,
          {
            width: knob,
            height: knob,
            borderRadius: knob / 2,
            transform: [{ translateX: value ? w - knob - 3 : 3 }],
          },
        ]}
      />
    </Pressable>
  );
}

/** Rounded progress bar with a pink gradient fill. */
export function ProgressBar({
  progress,
  height = 8,
  style,
}: {
  progress: number; // 0..1
  height?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const pct = Math.max(0, Math.min(1, progress));
  return (
    <View
      style={[
        styles.progressTrack,
        { height, borderRadius: height / 2 },
        style,
      ]}>
      <LinearGradient
        colors={PinkGradient.colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{
          width: `${pct * 100}%`,
          height: '100%',
          borderRadius: height / 2,
        }}
      />
    </View>
  );
}

/** A thin divider line. */
export function Divider({ style }: { style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.divider, style]} />;
}

const styles = StyleSheet.create({
  track: { justifyContent: 'center' },
  knob: {
    backgroundColor: Colors.white,
    position: 'absolute',
  },
  progressTrack: {
    backgroundColor: Alpha.track,
    overflow: 'hidden',
    width: '100%',
  },
  divider: {
    height: 1,
    backgroundColor: Alpha.hairline,
    borderRadius: Radius.pill,
  },
});
