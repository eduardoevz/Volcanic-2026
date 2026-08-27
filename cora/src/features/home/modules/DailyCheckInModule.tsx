import { router } from 'expo-router';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { useDailyLog } from '@/features/tracking';
import { Button } from '@/ui/components/Button';
import { Card } from '@/ui/components/Card';
import { Text } from '@/ui/components/Text';
import { spacing } from '@/ui/theme/tokens';

export function DailyCheckInModule() {
  const { t } = useTranslation('home');
  const today = format(new Date(), 'yyyy-MM-dd');
  const { data: todayLog, isLoading } = useDailyLog(today);
  const alreadyLogged = !isLoading && !!todayLog;

  return (
    <Card style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
      <Text style={{ fontSize: 32 }}>{alreadyLogged ? '✅' : '📝'}</Text>
      <View style={{ flex: 1 }}>
        <Text variant="heading">
          {alreadyLogged ? t('dailyCheckIn.loggedTitle') : t('dailyCheckIn.notLoggedTitle')}
        </Text>
        <Text variant="bodyMuted">
          {alreadyLogged ? t('dailyCheckIn.loggedSubtitle') : t('dailyCheckIn.notLoggedSubtitle')}
        </Text>
      </View>
      <Button
        label={alreadyLogged ? t('dailyCheckIn.editButton') : t('dailyCheckIn.registerButton')}
        variant="secondary"
        onPress={() => router.push(`/log/${today}`)}
      />
    </Card>
  );
}
