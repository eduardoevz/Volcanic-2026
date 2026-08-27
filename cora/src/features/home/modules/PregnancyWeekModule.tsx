import { router } from 'expo-router';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';
import { Pressable } from 'react-native';

import { computeWeek, useActivePregnancy } from '@/features/pregnancy';
import { Card } from '@/ui/components/Card';
import { Text } from '@/ui/components/Text';
import { spacing } from '@/ui/theme/tokens';

export function PregnancyWeekModule() {
  const { t } = useTranslation('home');
  const { data: pregnancy, isLoading } = useActivePregnancy();

  if (isLoading) {
    return (
      <Card>
        <Text variant="bodyMuted">{t('pregnancyWeek.loading')}</Text>
      </Card>
    );
  }

  if (!pregnancy) {
    return (
      <Pressable onPress={() => router.push('/pregnancy')}>
        <Card style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
          <Text style={{ fontSize: 32 }}>🤰</Text>
          <Text variant="body" style={{ flex: 1 }}>
            {t('pregnancyWeek.cta')}
          </Text>
        </Card>
      </Pressable>
    );
  }

  const week = computeWeek(pregnancy.lmp_date, new Date().toISOString().slice(0, 10));

  return (
    <Pressable onPress={() => router.push('/pregnancy')}>
      <Card>
        <Text variant="heading">{t('pregnancyWeek.weekTitle', { week })}</Text>
        <Text variant="bodyMuted">
          {t('pregnancyWeek.dueDate', {
            date: format(new Date(pregnancy.due_date), 'd MMM', { locale: es }),
          })}
        </Text>
      </Card>
    </Pressable>
  );
}
