import {
  Pressable,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { Alpha, Colors, Radius } from '@/theme';
import { Icon } from './icon';
import { Txt } from './txt';

interface PinkButtonProps {
  label: string;
  onPress?: () => void;
  icon?: string;
  uppercase?: boolean;
  expand?: boolean;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
}

/** Primary pill CTA — pink fill, dark text, glow. */
export function PinkButton({
  label,
  onPress,
  icon,
  uppercase,
  expand,
  style,
  disabled,
}: PinkButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.pink,
        expand && styles.expand,
        { opacity: disabled ? 0.5 : pressed ? 0.85 : 1 },
        style,
      ]}>
      {icon ? <Icon name={icon} size={18} color={Colors.onPink} /> : null}
      <Txt
        font="bold"
        size={uppercase ? 12 : 14}
        color={Colors.onPink}
        tracking={uppercase ? 0.6 : 0}
        uppercase={uppercase}>
        {label}
      </Txt>
    </Pressable>
  );
}

interface OutlinePillProps {
  label: string;
  onPress?: () => void;
  icon?: string;
  color?: string;
  borderColor?: string;
  expand?: boolean;
  style?: StyleProp<ViewStyle>;
  count?: number;
}

/** Secondary action — translucent outline pill. */
export function OutlinePillButton({
  label,
  onPress,
  icon,
  color = Colors.text,
  borderColor = 'rgba(255,255,255,0.20)',
  expand,
  style,
  count,
}: OutlinePillProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.outline,
        { borderColor },
        expand && styles.expand,
        pressed && { opacity: 0.8 },
        style,
      ]}>
      {icon ? <Icon name={icon} size={16} color={color} /> : null}
      <Txt font="semibold" size={13} color={color}>
        {label}
      </Txt>
      {count != null ? (
        <View style={styles.countPill}>
          <Txt font="bold" size={11} color={Colors.onPink}>
            {count}
          </Txt>
        </View>
      ) : null}
    </Pressable>
  );
}

/** Inline pink text link with a trailing arrow (e.g. "Se dagens aftaler →"). */
export function ArrowLink({
  label,
  onPress,
  color = Colors.pink,
  size = 13,
}: {
  label: string;
  onPress?: () => void;
  color?: string;
  size?: number;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.arrowLink, pressed && { opacity: 0.7 }]}>
      <Txt font="bold" size={size} color={color}>
        {label}
      </Txt>
      <Icon name="arrow_forward" size={size + 3} color={color} />
    </Pressable>
  );
}

/** 40×40 round header action with an optional pink count badge. */
export function HeaderIconButton({
  icon,
  onPress,
  badge,
  color = Colors.muted,
}: {
  icon: string;
  onPress?: () => void;
  badge?: string | number;
  color?: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.headerBtn, pressed && { opacity: 0.7 }]}>
      <Icon name={icon} size={24} color={color} />
      {badge != null ? (
        <View style={styles.badge}>
          <Txt font="bold" size={10} color={Colors.onPink}>
            {badge}
          </Txt>
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pink: {
    backgroundColor: Colors.pink,
    borderRadius: Radius.pill,
    paddingVertical: 12,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: Colors.pink,
    shadowOpacity: 0.35,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 0 },
  },
  outline: {
    borderRadius: Radius.pill,
    borderWidth: 1,
    paddingVertical: 9,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  expand: { alignSelf: 'stretch' },
  countPill: {
    backgroundColor: Colors.pink,
    borderRadius: Radius.pill,
    minWidth: 20,
    paddingHorizontal: 6,
    paddingVertical: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowLink: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: 2,
    right: 0,
    backgroundColor: Colors.pink,
    borderRadius: Radius.pill,
    minWidth: 16,
    height: 16,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
