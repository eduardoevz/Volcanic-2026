import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, Switch, View } from 'react-native';

import {
  useCreateReminder,
  useDeleteReminder,
  useReminders,
  useToggleReminder,
} from '@/features/reminders';
import { Banner } from '@/ui/components/Banner';
import { Button } from '@/ui/components/Button';
import { Card } from '@/ui/components/Card';
import { EmptyState } from '@/ui/components/EmptyState';
import { Input } from '@/ui/components/Input';
import { Screen } from '@/ui/components/Screen';
import { Sheet } from '@/ui/components/Sheet';
import { Text } from '@/ui/components/Text';
import { TimeStepper } from '@/ui/components/TimeStepper';
import { useTheme } from '@/ui/theme/ThemeContext';
import { spacing } from '@/ui/theme/tokens';

function pad(n: number) {
  return n.toString().padStart(2, '0');
}

export default function Reminders() {
  const { t } = useTranslation('reminders');
  const { colors } = useTheme();
  const { data: reminders, isLoading, isError } = useReminders();
  const createReminder = useCreateReminder();
  const toggleReminder = useToggleReminder();
  const deleteReminder = useDeleteReminder();

  const [creating, setCreating] = useState(false);
  const [title, setTitle] = useState('');
  const [hour, setHour] = useState(20);
  const [minute, setMinute] = useState(0);

  const handleCreate = async () => {
    if (!title.trim()) return;
    await createReminder.mutateAsync({ title: title.trim(), hour, minute });
    setTitle('');
    setHour(20);
    setMinute(0);
    setCreating(false);
  };

  return (
    <Screen>
      <Text variant="title" style={{ marginBottom: spacing.sm }}>
        {t('title')}
      </Text>
      <Text variant="bodyMuted" style={{ marginBottom: spacing.md }}>
        {t('subtitle')}
      </Text>

      {isError ? <Banner tone="danger" message={t('loadError')} /> : null}

      {createReminder.isError ? <Banner tone="warning" message={t('createError')} /> : null}

      {toggleReminder.isError || deleteReminder.isError ? (
        <Banner tone="danger" message={t('updateError')} />
      ) : null}

      {isLoading ? (
        <Text variant="bodyMuted">{t('loading')}</Text>
      ) : reminders && reminders.length > 0 ? (
        <ScrollView contentContainerStyle={{ gap: spacing.sm }}>
          {reminders.map((reminder) => (
            <Card key={reminder.id}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
                <View style={{ flex: 1 }}>
                  <Text variant="body">{reminder.title}</Text>
                  <Text variant="caption">
                    {t('dailyAt', { hour: pad(reminder.hour), minute: pad(reminder.minute) })}
                  </Text>
                </View>
                <Switch
                  value={reminder.is_active}
                  onValueChange={() => toggleReminder.mutate(reminder)}
                  disabled={toggleReminder.isPending}
                  trackColor={{ true: colors.pitahaya }}
                />
                <Pressable onPress={() => deleteReminder.mutate(reminder)} hitSlop={8}>
                  <Text style={{ color: colors.danger }}>{t('delete')}</Text>
                </Pressable>
              </View>
            </Card>
          ))}
        </ScrollView>
      ) : (
        <EmptyState title={t('emptyTitle')} description={t('emptyDescription')} />
      )}

      <Button
        label={t('newReminder')}
        onPress={() => setCreating(true)}
        style={{ marginTop: spacing.md }}
      />

      <Sheet visible={creating} onClose={() => setCreating(false)}>
        <View style={{ gap: spacing.md }}>
          <Text variant="heading">{t('newReminderTitle')}</Text>
          <Input
            label={t('titleLabel')}
            placeholder={t('titlePlaceholder')}
            value={title}
            onChangeText={setTitle}
          />
          <View style={{ flexDirection: 'row', justifyContent: 'center', gap: spacing.lg }}>
            <TimeStepper label={t('hourLabel')} value={hour} max={23} onChange={setHour} />
            <TimeStepper label={t('minuteLabel')} value={minute} max={59} onChange={setMinute} />
          </View>
          <Button
            label={t('save')}
            onPress={handleCreate}
            loading={createReminder.isPending}
            disabled={!title.trim()}
          />
        </View>
      </Sheet>
    </Screen>
  );
}
