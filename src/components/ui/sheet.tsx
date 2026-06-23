import type { ReactNode } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Alpha, Colors, Radius } from '@/theme';
import { Icon } from './icon';
import { Txt } from './txt';

interface BottomSheetProps {
  visible: boolean;
  title?: string;
  onClose: () => void;
  children: ReactNode;
}

/** Slide-up modal sheet with a grab handle, title and close button. */
export function BottomSheet({
  visible,
  title,
  onClose,
  children,
}: BottomSheetProps) {
  const insets = useSafeAreaInsets();
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent>
      <View style={styles.backdrop}>
        <Pressable style={styles.backdropFill} onPress={onClose} />
        <View style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]}>
          <View style={styles.handle} />
          {title ? (
            <View style={styles.header}>
              <Txt font="displayBold" size={18} color={Colors.text}>
                {title}
              </Txt>
              <Pressable onPress={onClose} hitSlop={10}>
                <Icon name="close" size={24} color={Colors.muted} />
              </Pressable>
            </View>
          ) : null}
          <ScrollView
            style={styles.body}
            contentContainerStyle={styles.bodyContent}
            showsVerticalScrollIndicator={false}>
            {children}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: 'flex-end' },
  backdropFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(2,3,12,0.6)',
  },
  sheet: {
    backgroundColor: Colors.sheetBg,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderColor: Alpha.hairline,
    paddingHorizontal: 18,
    paddingTop: 10,
    maxHeight: '88%',
  },
  handle: {
    alignSelf: 'center',
    width: 44,
    height: 5,
    borderRadius: Radius.pill,
    backgroundColor: 'rgba(255,255,255,0.25)',
    marginBottom: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  body: { flexGrow: 0 },
  bodyContent: { gap: 14, paddingBottom: 8 },
});
