import { router } from 'expo-router';
import { format } from 'date-fns';
import { View } from 'react-native';

import { useDailyLog } from '@/features/tracking';
import { Button } from '@/ui/components/Button';
import { Card } from '@/ui/components/Card';
import { Text } from '@/ui/components/Text';
import { spacing } from '@/ui/theme/tokens';

export function DailyCheckInModule() {
  const today = format(new Date(), 'yyyy-MM-dd');
  const { data: todayLog, isLoading } = useDailyLog(today);
  const alreadyLogged = !isLoading && !!todayLog;

  return (
    <Card style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
      <Text style={{ fontSize: 32 }}>{alreadyLogged ? '✅' : '📝'}</Text>
      <View style={{ flex: 1 }}>
        <Text variant="heading">
          {alreadyLogged ? 'Ya registraste hoy' : '¿Cómo te sentís hoy?'}
        </Text>
        <Text variant="bodyMuted">
          {alreadyLogged ? 'Podés editar tu registro cuando quieras.' : 'Toma menos de un minuto.'}
        </Text>
      </View>
      <Button
        label={alreadyLogged ? 'Editar' : 'Registrar'}
        variant="secondary"
        onPress={() => router.push(`/log/${today}`)}
      />
    </Card>
  );
}
