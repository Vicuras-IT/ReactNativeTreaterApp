import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';

import { Colors } from '@/theme';
import { Txt } from './txt';

interface AvatarProps {
  initials: string;
  /** raw base64 (no data: prefix) of the treater picture */
  pictureBase64?: string | null;
  size?: number;
  fontSize?: number;
}

/** Circular avatar — shows the picture if present, else gradient + initials. */
export function Avatar({
  initials,
  pictureBase64,
  size = 44,
  fontSize,
}: AvatarProps) {
  const radius = size / 2;
  if (pictureBase64) {
    return (
      <Image
        source={{ uri: `data:image/jpeg;base64,${pictureBase64}` }}
        style={[
          styles.base,
          { width: size, height: size, borderRadius: radius },
        ]}
        contentFit="cover"
      />
    );
  }
  return (
    <LinearGradient
      colors={[Colors.pink, Colors.pinkDeep]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[
        styles.base,
        styles.center,
        { width: size, height: size, borderRadius: radius },
      ]}>
      <Txt font="displayBold" size={fontSize ?? size * 0.38} color={Colors.white}>
        {initials}
      </Txt>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  base: {
    borderWidth: 1.5,
    borderColor: 'rgba(191,188,255,0.5)',
  },
  center: { alignItems: 'center', justifyContent: 'center' },
});
