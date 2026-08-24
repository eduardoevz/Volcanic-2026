import { View } from 'react-native';

import { useMascotState } from '@/features/home/hooks/useMascotState';
import { Card } from '@/ui/components/Card';
import { Skeleton } from '@/ui/components/Skeleton';
import { Text } from '@/ui/components/Text';
import { spacing } from '@/ui/theme/tokens';

export function MascotModule() {
  const { data: mascot, isLoading } = useMascotState();

  return (
    <Card style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
      <Text style={{ fontSize: 40 }}>🐉</Text>
      {isLoading ? (
        <Skeleton width={140} height={16} />
      ) : (
        <View>
          <Text variant="heading">Tu pitahaya · Nivel {mascot?.level ?? 1}</Text>
          <Text variant="bodyMuted">{mascot?.points ?? 0} puntos acumulados</Text>
        </View>
      )}
    </Card>
  );
}
