import type { PropsWithChildren } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { colors, radii, spacing } from '@/ui/theme/tokens';

type SheetProps = PropsWithChildren<{
  visible: boolean;
  onClose: () => void;
}>;

export function Sheet({ visible, onClose, children }: SheetProps) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.sheet}>{children}</View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(34, 27, 31, 0.4)',
  },
  sheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: radii.lg,
    borderTopRightRadius: radii.lg,
    padding: spacing.lg,
  },
});
