import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { LEVEL_META, useMascotState, type MascotLevel } from '@/features/mascot';
import { Card } from '@/ui/components/Card';
import { Skeleton } from '@/ui/components/Skeleton';
import { Text } from '@/ui/components/Text';
import { spacing } from '@/ui/theme/tokens';

export function MascotModule() {
  const { t } = useTranslation('home');
  const { data: mascot, isLoading } = useMascotState();
  const level = (mascot?.level ?? 1) as MascotLevel;
  const meta = LEVEL_META[level];

  return (
    <Pressable onPress={() => router.push('/mascot')}>
      <Card style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
        <Text style={{ fontSize: 40 }}>{meta.emoji}</Text>
        {isLoading ? (
          <Skeleton width={140} height={16} />
        ) : (
          <View>
            <Text variant="heading">{t('mascot.summary', { name: meta.name, level })}</Text>
            <Text variant="bodyMuted">{t('mascot.points', { points: mascot?.points ?? 0 })}</Text>
          </View>
        )}
      </Card>
    </Pressable>
  );
}
