import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { Animated, StyleSheet, View } from 'react-native';

import { Colors, Radius } from '@/theme';
import { Txt } from './txt';

interface ToastContextValue {
  show: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState<string | null>(null);
  const opacity = useRef(new Animated.Value(0)).current;
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback(
    (text: string) => {
      if (timer.current) clearTimeout(timer.current);
      setMessage(text);
      Animated.timing(opacity, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }).start();
      timer.current = setTimeout(() => {
        Animated.timing(opacity, {
          toValue: 0,
          duration: 220,
          useNativeDriver: true,
        }).start(() => setMessage(null));
      }, 2200);
    },
    [opacity],
  );

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      {message ? (
        <View pointerEvents="none" style={styles.wrap}>
          <Animated.View style={[styles.toast, { opacity }]}>
            <Txt font="semibold" size={13} color={Colors.text}>
              {message}
            </Txt>
          </Animated.View>
        </View>
      ) : null}
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) return { show: () => {} };
  return ctx;
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 110,
    alignItems: 'center',
  },
  toast: {
    backgroundColor: 'rgba(12,17,56,0.95)',
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(217,74,230,0.4)',
    paddingHorizontal: 18,
    paddingVertical: 11,
    maxWidth: '86%',
  },
});
