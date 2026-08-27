import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { Button } from '@/ui/components/Button';
import { Text } from '@/ui/components/Text';
import { spacing } from '@/ui/theme/tokens';

function pad(n: number) {
  return n.toString().padStart(2, '0');
}

type TimeStepperProps = {
  label: string;
  value: number;
  max: number;
  onChange: (next: number) => void;
};

// Extraído de app/reminders.tsx (Fase 8) al pasar a usarse también en
// app/appointments.tsx (Fase 16) — ya no es código de una sola pantalla.
export function TimeStepper({ label, value, max, onChange }: TimeStepperProps) {
  const { t } = useTranslation('reminders');

  return (
    <View style={{ alignItems: 'center', gap: spacing.xs }}>
      <Text variant="caption">{label}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
        <Button
          label="−"
          variant="secondary"
          accessibilityLabel={t('decrease', { label: label.toLowerCase() })}
          onPress={() => onChange((value - 1 + (max + 1)) % (max + 1))}
        />
        <Text variant="heading">{pad(value)}</Text>
        <Button
          label="+"
          variant="secondary"
          accessibilityLabel={t('increase', { label: label.toLowerCase() })}
          onPress={() => onChange((value + 1) % (max + 1))}
        />
      </View>
    </View>
  );
}
