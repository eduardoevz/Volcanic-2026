import { router } from 'expo-router';
import { Pressable, View } from 'react-native';

import { LEVEL_META, useMascotState, type MascotLevel } from '@/features/mascot';
import { Card } from '@/ui/components/Card';
import { Skeleton } from '@/ui/components/Skeleton';
import { Text } from '@/ui/components/Text';
import { spacing } from '@/ui/theme/tokens';

export function MascotModule() {
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
            <Text variant="heading">{`Tu pitahaya · ${meta.name} · Nivel ${level}`}</Text>
            <Text variant="bodyMuted">{`${mascot?.points ?? 0} puntos acumulados`}</Text>
          </View>
        )}
      </Card>
    </Pressable>
  );
}
