import { useRef, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, View } from 'react-native';

import { Colors, Radius } from '@/theme';
import { Icon, Txt } from '@/components/ui';

interface Action {
  icon: string;
  label: string;
  onPress: () => void;
}

/** Expandable "+" FAB — reveals the quick actions above it. */
export function QuickActionFab({ actions }: { actions: Action[] }) {
  const [open, setOpen] = useState(false);
  const anim = useRef(new Animated.Value(0)).current;

  const toggle = (next: boolean) => {
    setOpen(next);
    Animated.timing(anim, {
      toValue: next ? 1 : 0,
      duration: 200,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  };

  const rotate = anim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '45deg'],
  });

  return (
    <>
      {open ? (
        <Pressable style={styles.backdrop} onPress={() => toggle(false)} />
      ) : null}
      <View style={styles.container} pointerEvents="box-none">
        {actions.map((action, i) => {
          const translateY = anim.interpolate({
            inputRange: [0, 1],
            outputRange: [20, 0],
          });
          return (
            <Animated.View
              key={action.label}
              pointerEvents={open ? 'auto' : 'none'}
              style={[
                styles.actionRow,
                { opacity: anim, transform: [{ translateY }] },
              ]}>
              <View style={styles.actionLabel}>
                <Txt font="bold" size={12} color={Colors.text}>
                  {action.label}
                </Txt>
              </View>
              <Pressable
                style={styles.actionBtn}
                onPress={() => {
                  toggle(false);
                  action.onPress();
                }}>
                <Icon name={action.icon} size={22} color={Colors.text} />
              </Pressable>
            </Animated.View>
          );
        })}

        <Pressable style={styles.fab} onPress={() => toggle(!open)}>
          <Animated.View style={{ transform: [{ rotate }] }}>
            <Icon name="add" size={30} color={Colors.onPink} />
          </Animated.View>
        </Pressable>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(2,3,12,0.5)',
  },
  container: {
    position: 'absolute',
    right: 16,
    bottom: 96,
    alignItems: 'flex-end',
    gap: 12,
  },
  actionRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  actionLabel: {
    backgroundColor: 'rgba(12,17,56,0.95)',
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  actionBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#0A0F33',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fab: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.pink,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.pink,
    shadowOpacity: 0.5,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
});
