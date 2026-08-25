import { useState } from 'react';
import { format, subDays } from 'date-fns';
import { ScrollView, Share, View } from 'react-native';

import { useGenerateSummary, type SummaryPayload } from '@/features/summary';
import { Banner } from '@/ui/components/Banner';
import { Button } from '@/ui/components/Button';
import { Card } from '@/ui/components/Card';
import { Screen } from '@/ui/components/Screen';
import { Text } from '@/ui/components/Text';
import { spacing } from '@/ui/theme/tokens';

const PRESETS = [
  { label: 'Últimos 30 días', days: 30 },
  { label: 'Últimos 90 días', days: 90 },
];

export default function Summary() {
  const generateSummary = useGenerateSummary();
  const [result, setResult] = useState<{ payload: SummaryPayload; text: string } | null>(null);

  const handleGenerate = async (days: number) => {
    const today = new Date();
    const periodEnd = format(today, 'yyyy-MM-dd');
    const periodStart = format(subDays(today, days - 1), 'yyyy-MM-dd');
    setResult(null);
    const data = await generateSummary.mutateAsync({ periodStart, periodEnd });
    setResult(data);
  };

  const handleShare = () => {
    if (!result) return;
    Share.share({ message: result.text });
  };

  return (
    <Screen>
      <Text variant="title" style={{ marginBottom: spacing.sm }}>
        Resumen médico
      </Text>
      <Banner
        tone="warning"
        message="Esto NO es un diagnóstico. Es una transcripción de tus propios registros para llevar a tu consulta médica."
      />

      <View style={{ flexDirection: 'row', gap: spacing.sm, marginVertical: spacing.md }}>
        {PRESETS.map((preset) => (
          <Button
            key={preset.days}
            label={preset.label}
            variant="secondary"
            onPress={() => handleGenerate(preset.days)}
            disabled={generateSummary.isPending}
          />
        ))}
      </View>

      {generateSummary.isPending ? <Text variant="bodyMuted">Generando resumen...</Text> : null}

      {generateSummary.isError ? (
        <Banner
          tone="danger"
          message="No pudimos generar el resumen. Revisá tu conexión e intentá de nuevo."
        />
      ) : null}

      {result ? (
        <ScrollView style={{ marginTop: spacing.md }}>
          <Card>
            <Text variant="body" style={{ fontFamily: 'monospace' }}>
              {result.text}
            </Text>
          </Card>
          <Button
            label="Compartir"
            onPress={handleShare}
            style={{ marginTop: spacing.md, marginBottom: spacing.lg }}
          />
        </ScrollView>
      ) : null}
    </Screen>
  );
}
