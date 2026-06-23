import {
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { Colors, Radius } from '@/theme';
import { Txt } from './txt';

interface PillTabsProps<T extends string> {
  tabs: { key: T; label: string }[];
  selected: T;
  onSelect: (key: T) => void;
  scroll?: boolean;
  style?: StyleProp<ViewStyle>;
}

/** Segmented pill tabs — selected pill is pink-filled. */
export function PillTabs<T extends string>({
  tabs,
  selected,
  onSelect,
  scroll,
  style,
}: PillTabsProps<T>) {
  const content = tabs.map((tab) => {
    const active = tab.key === selected;
    return (
      <Pressable
        key={tab.key}
        onPress={() => onSelect(tab.key)}
        style={[styles.tab, active ? styles.tabActive : styles.tabIdle]}>
        <Txt
          font={active ? 'bold' : 'semibold'}
          size={13}
          color={active ? Colors.onPink : Colors.muted}>
          {tab.label}
        </Txt>
      </Pressable>
    );
  });

  if (scroll) {
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[styles.row, style]}>
        {content}
      </ScrollView>
    );
  }
  return <View style={[styles.row, styles.rowWrap, style]}>{content}</View>;
}

interface StatusPillProps {
  label: string;
  color?: string;
  background?: string;
  borderColor?: string;
}

/** Small uppercase status badge. */
export function StatusPill({
  label,
  color = Colors.pink,
  background = 'rgba(217,74,230,0.14)',
  borderColor = 'rgba(217,74,230,0.35)',
}: StatusPillProps) {
  return (
    <View style={[styles.status, { backgroundColor: background, borderColor }]}>
      <Txt font="bold" size={10} color={color} tracking={0.5} uppercase>
        {label}
      </Txt>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  rowWrap: { flexWrap: 'wrap' },
  tab: {
    borderRadius: Radius.pill,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  tabActive: { backgroundColor: Colors.pink },
  tabIdle: { backgroundColor: 'rgba(255,255,255,0.05)' },
  status: {
    borderRadius: Radius.pill,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
});
