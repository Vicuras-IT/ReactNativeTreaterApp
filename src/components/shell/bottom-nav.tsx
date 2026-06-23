import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors, Radius } from '@/theme';
import { Icon, Txt } from '@/components/ui';
import type { TabKey } from '@/state/navigation-context';

interface TabDef {
  key: TabKey;
  icon: string;
  label: string;
  badge?: number;
}

const TABS: TabDef[] = [
  { key: 'home', icon: 'home', label: 'Hjem' },
  { key: 'calendar', icon: 'calendar_month', label: 'Vagtplan' },
  { key: 'tasks', icon: 'task_alt', label: 'Opgaver' },
  { key: 'forum', icon: 'forum', label: 'Forum', badge: 3 },
  { key: 'profile', icon: 'person', label: 'Profil' },
];

export const NAV_HEIGHT = 64;

export function BottomNav({
  active,
  onChange,
}: {
  active: TabKey;
  onChange: (key: TabKey) => void;
}) {
  const insets = useSafeAreaInsets();
  return (
    <LinearGradient
      colors={['rgba(21,22,106,0)', 'rgba(21,22,106,0.9)', '#15166A']}
      locations={[0, 0.35, 1]}
      style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, 10) }]}>
      <View style={styles.row}>
        {TABS.map((tab) => {
          const isActive = tab.key === active;
          return (
            <Pressable
              key={tab.key}
              style={styles.item}
              onPress={() => onChange(tab.key)}>
              <View
                style={[styles.iconWrap, isActive && styles.iconWrapActive]}>
                <Icon
                  name={tab.icon}
                  size={24}
                  color={isActive ? Colors.onPink : Colors.lilac}
                />
                {tab.badge != null ? (
                  <View style={styles.badge}>
                    <Txt font="bold" size={10} color={Colors.onPink}>
                      {tab.badge}
                    </Txt>
                  </View>
                ) : null}
              </View>
              <Txt
                font={isActive ? 'bold' : 'medium'}
                size={11}
                color={isActive ? Colors.text : Colors.faint}>
                {tab.label}
              </Txt>
            </Pressable>
          );
        })}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingTop: 14,
    paddingHorizontal: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
  },
  item: { alignItems: 'center', gap: 5, flex: 1 },
  iconWrap: {
    width: 46,
    height: 38,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapActive: {
    backgroundColor: Colors.pink,
    shadowColor: Colors.pink,
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: 4,
    backgroundColor: Colors.danger,
    borderRadius: Radius.pill,
    minWidth: 16,
    height: 16,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
