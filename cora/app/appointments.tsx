import { useState } from 'react';
import { addDays, addMonths, addWeeks, format, setHours, setMinutes } from 'date-fns';
import { es } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, View } from 'react-native';

import {
  useAppointments,
  useCreateAppointment,
  useDeleteAppointment,
  useUpdateAppointmentStatus,
} from '@/features/appointments';
import { Badge } from '@/ui/components/Badge';
import { Banner } from '@/ui/components/Banner';
import { Button } from '@/ui/components/Button';
import { Card } from '@/ui/components/Card';
import { Chip } from '@/ui/components/Chip';
import { EmptyState } from '@/ui/components/EmptyState';
import { Input } from '@/ui/components/Input';
import { Screen } from '@/ui/components/Screen';
import { Sheet } from '@/ui/components/Sheet';
import { Text } from '@/ui/components/Text';
import { TimeStepper } from '@/ui/components/TimeStepper';
import { useTheme } from '@/ui/theme/ThemeContext';
import { spacing } from '@/ui/theme/tokens';

const DAY_OFFSETS = [
  { key: 'today', days: 0 },
  { key: 'tomorrow', days: 1 },
  { key: 'in3Days', days: 3 },
  { key: 'in1Week', weeks: 1 },
  { key: 'in2Weeks', weeks: 2 },
  { key: 'in1Month', months: 1 },
] as const;

function offsetToDate(offset: (typeof DAY_OFFSETS)[number]): Date {
  const now = new Date();
  if ('months' in offset) return addMonths(now, offset.months);
  if ('weeks' in offset) return addWeeks(now, offset.weeks);
  return addDays(now, offset.days);
}

const STATUS_TONE = { scheduled: 'neutral', completed: 'success', cancelled: 'danger' } as const;

export default function Appointments() {
  const { t } = useTranslation('appointments');
  const { colors } = useTheme();
  const { data: appointments, isLoading, isError } = useAppointments();
  const createAppointment = useCreateAppointment();
  const updateStatus = useUpdateAppointmentStatus();
  const deleteAppointment = useDeleteAppointment();

  const [creating, setCreating] = useState(false);
  const [title, setTitle] = useState('');
  const [specialistName, setSpecialistName] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [dayOffsetKey, setDayOffsetKey] = useState<(typeof DAY_OFFSETS)[number]['key']>('tomorrow');
  const [hour, setHour] = useState(9);
  const [minute, setMinute] = useState(0);

  const resetForm = () => {
    setTitle('');
    setSpecialistName('');
    setLocation('');
    setNotes('');
    setDayOffsetKey('tomorrow');
    setHour(9);
    setMinute(0);
  };

  const handleCreate = async () => {
    if (!title.trim()) return;
    const offset = DAY_OFFSETS.find((o) => o.key === dayOffsetKey)!;
    const scheduledAt = setMinutes(setHours(offsetToDate(offset), hour), minute);
    await createAppointment.mutateAsync({
      title: title.trim(),
      specialistName,
      location,
      notes,
      scheduledAt,
    });
    resetForm();
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
      {createAppointment.isError ? <Banner tone="warning" message={t('createError')} /> : null}
      {updateStatus.isError || deleteAppointment.isError ? (
        <Banner tone="danger" message={t('updateError')} />
      ) : null}

      {isLoading ? (
        <Text variant="bodyMuted">{t('loading')}</Text>
      ) : appointments && appointments.length > 0 ? (
        <ScrollView contentContainerStyle={{ gap: spacing.sm }}>
          {appointments.map((appointment) => (
            <Card key={appointment.id} style={{ gap: spacing.xs }}>
              <View style={{ flexDirection: 'row', gap: spacing.xs, alignItems: 'center' }}>
                <Text variant="body" style={{ fontWeight: '700', flex: 1 }}>
                  {appointment.title}
                </Text>
                <Badge
                  label={t(`status.${appointment.status}`)}
                  tone={STATUS_TONE[appointment.status as keyof typeof STATUS_TONE]}
                />
              </View>
              <Text variant="bodyMuted">
                {format(new Date(appointment.scheduled_at), "d 'de' MMMM, HH:mm", { locale: es })}
              </Text>
              {appointment.specialist_name ? (
                <Text variant="caption">{appointment.specialist_name}</Text>
              ) : null}
              {appointment.location ? <Text variant="caption">{appointment.location}</Text> : null}

              {appointment.status === 'scheduled' ? (
                <View
                  style={{
                    flexDirection: 'row',
                    gap: spacing.sm,
                    marginTop: spacing.xs,
                    flexWrap: 'wrap',
                  }}
                >
                  <Button
                    label={t('markCompleted')}
                    variant="secondary"
                    onPress={() => updateStatus.mutate({ appointment, status: 'completed' })}
                  />
                  <Button
                    label={t('cancel')}
                    variant="secondary"
                    onPress={() => updateStatus.mutate({ appointment, status: 'cancelled' })}
                  />
                </View>
              ) : null}
              <Pressable onPress={() => deleteAppointment.mutate(appointment)} hitSlop={8}>
                <Text style={{ color: colors.danger }}>{t('delete')}</Text>
              </Pressable>
            </Card>
          ))}
        </ScrollView>
      ) : (
        <EmptyState title={t('emptyTitle')} description={t('emptyDescription')} />
      )}

      <Button
        label={t('newAppointment')}
        onPress={() => setCreating(true)}
        style={{ marginTop: spacing.md }}
      />

      <Sheet visible={creating} onClose={() => setCreating(false)}>
        <ScrollView contentContainerStyle={{ gap: spacing.md }}>
          <Text variant="heading">{t('newAppointmentTitle')}</Text>
          <Input
            label={t('titleLabel')}
            placeholder={t('titlePlaceholder')}
            value={title}
            onChangeText={setTitle}
          />
          <Input
            label={t('specialistLabel')}
            placeholder={t('specialistPlaceholder')}
            value={specialistName}
            onChangeText={setSpecialistName}
          />
          <Input
            label={t('locationLabel')}
            placeholder={t('locationPlaceholder')}
            value={location}
            onChangeText={setLocation}
          />
          <Input
            label={t('notesLabel')}
            placeholder={t('notesPlaceholder')}
            value={notes}
            onChangeText={setNotes}
          />

          <Text variant="caption">{t('dayLabel')}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={{ flexDirection: 'row', gap: spacing.sm }}>
              {DAY_OFFSETS.map((offset) => (
                <Chip
                  key={offset.key}
                  label={t(`dayOptions.${offset.key}`)}
                  selected={dayOffsetKey === offset.key}
                  onPress={() => setDayOffsetKey(offset.key)}
                />
              ))}
            </View>
          </ScrollView>

          <View style={{ flexDirection: 'row', justifyContent: 'center', gap: spacing.lg }}>
            <TimeStepper label={t('hourLabel')} value={hour} max={23} onChange={setHour} />
            <TimeStepper label={t('minuteLabel')} value={minute} max={59} onChange={setMinute} />
          </View>

          <Button
            label={t('save')}
            onPress={handleCreate}
            loading={createAppointment.isPending}
            disabled={!title.trim()}
          />
        </ScrollView>
      </Sheet>
    </Screen>
  );
}
