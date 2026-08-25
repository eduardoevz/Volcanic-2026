import { useState } from 'react';
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
import { colors, spacing } from '@/ui/theme/tokens';

function pad(n: number) {
  return n.toString().padStart(2, '0');
}

function TimeStepper({
  label,
  value,
  max,
  onChange,
}: {
  label: string;
  value: number;
  max: number;
  onChange: (next: number) => void;
}) {
  return (
    <View style={{ alignItems: 'center', gap: spacing.xs }}>
      <Text variant="caption">{label}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
        <Button
          label="−"
          variant="secondary"
          accessibilityLabel={`Disminuir ${label.toLowerCase()}`}
          onPress={() => onChange((value - 1 + (max + 1)) % (max + 1))}
        />
        <Text variant="heading">{pad(value)}</Text>
        <Button
          label="+"
          variant="secondary"
          accessibilityLabel={`Aumentar ${label.toLowerCase()}`}
          onPress={() => onChange((value + 1) % (max + 1))}
        />
      </View>
    </View>
  );
}

export default function Reminders() {
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
        Recordatorios
      </Text>
      <Text variant="bodyMuted" style={{ marginBottom: spacing.md }}>
        Notificaciones locales en este dispositivo — no requieren conexión para sonar.
      </Text>

      {isError ? (
        <Banner tone="danger" message="No pudimos cargar tus recordatorios." />
      ) : null}

      {createReminder.isError ? (
        <Banner
          tone="warning"
          message="No pudimos crear el recordatorio. Verificá que le hayas dado permiso de notificaciones a Cora."
        />
      ) : null}

      {toggleReminder.isError || deleteReminder.isError ? (
        <Banner tone="danger" message="No pudimos actualizar el recordatorio. Probá de nuevo." />
      ) : null}

      {isLoading ? (
        <Text variant="bodyMuted">Cargando...</Text>
      ) : reminders && reminders.length > 0 ? (
        <ScrollView contentContainerStyle={{ gap: spacing.sm }}>
          {reminders.map((reminder) => (
            <Card key={reminder.id}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
                <View style={{ flex: 1 }}>
                  <Text variant="body">{reminder.title}</Text>
                  <Text variant="caption">
                    {pad(reminder.hour)}:{pad(reminder.minute)} — todos los días
                  </Text>
                </View>
                <Switch
                  value={reminder.is_active}
                  onValueChange={() => toggleReminder.mutate(reminder)}
                  disabled={toggleReminder.isPending}
                  trackColor={{ true: colors.pitahaya }}
                />
                <Pressable onPress={() => deleteReminder.mutate(reminder)} hitSlop={8}>
                  <Text style={{ color: colors.danger }}>Eliminar</Text>
                </Pressable>
              </View>
            </Card>
          ))}
        </ScrollView>
      ) : (
        <EmptyState
          title="Sin recordatorios todavía"
          description="Creá uno para que Cora te avise a la hora que elijas."
        />
      )}

      <Button
        label="+ Nuevo recordatorio"
        onPress={() => setCreating(true)}
        style={{ marginTop: spacing.md }}
      />

      <Sheet visible={creating} onClose={() => setCreating(false)}>
        <View style={{ gap: spacing.md }}>
          <Text variant="heading">Nuevo recordatorio</Text>
          <Input
            label="Título"
            placeholder="Ej. Registrar mi día"
            value={title}
            onChangeText={setTitle}
          />
          <View style={{ flexDirection: 'row', justifyContent: 'center', gap: spacing.lg }}>
            <TimeStepper label="Hora" value={hour} max={23} onChange={setHour} />
            <TimeStepper label="Minuto" value={minute} max={59} onChange={setMinute} />
          </View>
          <Button
            label="Guardar"
            onPress={handleCreate}
            loading={createReminder.isPending}
            disabled={!title.trim()}
          />
        </View>
      </Sheet>
    </Screen>
  );
}
