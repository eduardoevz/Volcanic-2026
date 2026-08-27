import { useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';
import { ScrollView, View } from 'react-native';

import {
  computeDueDate,
  computeTrimester,
  computeWeek,
  useActivePregnancy,
  useCreatePregnancy,
  useEndPregnancy,
  useUpdatePregnancyNotes,
} from '@/features/pregnancy';
import { Banner } from '@/ui/components/Banner';
import { Button } from '@/ui/components/Button';
import { Card } from '@/ui/components/Card';
import { Input } from '@/ui/components/Input';
import { useSession } from '@/shared/hooks/useSession';
import { Screen } from '@/ui/components/Screen';
import { Sheet } from '@/ui/components/Sheet';
import { Text } from '@/ui/components/Text';
import { spacing } from '@/ui/theme/tokens';

function toISODate(date: Date) {
  return date.toISOString().slice(0, 10);
}

export default function Pregnancy() {
  const { t } = useTranslation('pregnancy');
  const { session } = useSession();
  const { data: pregnancy, isLoading, isError } = useActivePregnancy();
  const createPregnancy = useCreatePregnancy();
  const endPregnancy = useEndPregnancy();
  const updateNotes = useUpdatePregnancyNotes();

  const [lmpDate, setLmpDate] = useState(toISODate(new Date()));
  const [notes, setNotes] = useState('');
  const [confirmingEnd, setConfirmingEnd] = useState(false);

  const handleCreate = async () => {
    if (!session?.user.id) return;
    const dueDate = computeDueDate(lmpDate);
    await createPregnancy.mutateAsync({ userId: session.user.id, lmpDate, dueDate });
  };

  const handleSaveNotes = async () => {
    if (!pregnancy) return;
    await updateNotes.mutateAsync({ id: pregnancy.id, notes });
  };

  if (isLoading) {
    return (
      <Screen>
        <Text variant="bodyMuted">{t('loading')}</Text>
      </Screen>
    );
  }

  if (isError) {
    return (
      <Screen>
        <Banner tone="danger" message={t('loadError')} />
      </Screen>
    );
  }

  if (!pregnancy) {
    return (
      <Screen>
        <Text variant="title" style={{ marginBottom: spacing.sm }}>
          {t('startTitle')}
        </Text>
        <Text variant="bodyMuted" style={{ marginBottom: spacing.md }}>
          {t('startDescription')}
        </Text>

        {createPregnancy.isError ? <Banner tone="danger" message={t('createError')} /> : null}

        <Input
          label={t('lmpLabel')}
          placeholder="YYYY-MM-DD"
          value={lmpDate}
          onChangeText={setLmpDate}
        />
        <Button
          label={t('startSubmit')}
          loading={createPregnancy.isPending}
          onPress={handleCreate}
          style={{ marginTop: spacing.md }}
        />
      </Screen>
    );
  }

  const today = toISODate(new Date());
  const week = computeWeek(pregnancy.lmp_date, today);
  const trimester = computeTrimester(week);

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ gap: spacing.md, paddingBottom: spacing.xl }}>
        <Text variant="title">{t('title')}</Text>

        <Card style={{ gap: spacing.xs }}>
          <Text variant="heading">{t('weekLabel', { week })}</Text>
          <Text variant="body">{t('trimesterLabel', { trimester })}</Text>
          <Text variant="bodyMuted">
            {t('dueDateLabel', {
              date: format(new Date(pregnancy.due_date), "d 'de' MMMM 'de' yyyy", { locale: es }),
            })}
          </Text>
        </Card>

        <View style={{ gap: spacing.sm }}>
          <Input
            label={t('notesLabel')}
            placeholder={t('notesPlaceholder')}
            value={notes || pregnancy.notes || ''}
            onChangeText={setNotes}
          />
          <Button label={t('saveNotes')} variant="secondary" onPress={handleSaveNotes} loading={updateNotes.isPending} />
        </View>

        <Button label={t('endTracking')} variant="ghost" onPress={() => setConfirmingEnd(true)} />
      </ScrollView>

      <Sheet visible={confirmingEnd} onClose={() => setConfirmingEnd(false)}>
        <View style={{ gap: spacing.md }}>
          <Text variant="heading">{t('endConfirmTitle')}</Text>
          <Text variant="bodyMuted">{t('endConfirmDescription')}</Text>
          <Button
            label={t('endConfirmSubmit')}
            loading={endPregnancy.isPending}
            onPress={async () => {
              await endPregnancy.mutateAsync({ id: pregnancy.id, status: 'completed' });
              setConfirmingEnd(false);
            }}
          />
          <Button label={t('endConfirmCancel')} variant="ghost" onPress={() => setConfirmingEnd(false)} />
        </View>
      </Sheet>
    </Screen>
  );
}
