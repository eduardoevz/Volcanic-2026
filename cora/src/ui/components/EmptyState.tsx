import { StyleSheet, View } from 'react-native';

import { Button } from '@/ui/components/Button';
import { Text } from '@/ui/components/Text';
import { spacing } from '@/ui/theme/tokens';

type EmptyStateProps = {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function EmptyState({ title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <Text variant="heading" style={styles.centered}>
        {title}
      </Text>
      {description ? (
        <Text variant="bodyMuted" style={styles.centered}>
          {description}
        </Text>
      ) : null}
      {actionLabel && onAction ? (
        <Button label={actionLabel} onPress={onAction} variant="secondary" style={styles.action} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    gap: spacing.xs,
  },
  centered: {
    textAlign: 'center',
  },
  action: {
    marginTop: spacing.md,
  },
});
