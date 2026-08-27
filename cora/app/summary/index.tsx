import { useState } from 'react';
import { format, subDays } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { ScrollView, Share, View } from 'react-native';

import { exportSummaryToPdf, useGenerateSummary, type SummaryPayload } from '@/features/summary';
import { Banner } from '@/ui/components/Banner';
import { Button } from '@/ui/components/Button';
import { Card } from '@/ui/components/Card';
import { Screen } from '@/ui/components/Screen';
import { Text } from '@/ui/components/Text';
import { spacing } from '@/ui/theme/tokens';

export default function Summary() {
  const { t } = useTranslation('summary');
  const presets = [
    { labelKey: 'preset30Days' as const, days: 30 },
    { labelKey: 'preset90Days' as const, days: 90 },
  ];
  const generateSummary = useGenerateSummary();
  const [result, setResult] = useState<{ payload: SummaryPayload; text: string } | null>(null);
  const [exportingPdf, setExportingPdf] = useState(false);
  const [pdfError, setPdfError] = useState(false);

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

  const handleExportPdf = async () => {
    if (!result) return;
    setPdfError(false);
    setExportingPdf(true);
    try {
      await exportSummaryToPdf(result.payload);
    } catch {
      setPdfError(true);
    } finally {
      setExportingPdf(false);
    }
  };

  return (
    <Screen>
      <Text variant="title" style={{ marginBottom: spacing.sm }}>
        {t('title')}
      </Text>
      <Banner tone="warning" message={t('disclaimer')} />

      <View style={{ flexDirection: 'row', gap: spacing.sm, marginVertical: spacing.md }}>
        {presets.map((preset) => (
          <Button
            key={preset.days}
            label={t(preset.labelKey)}
            variant="secondary"
            onPress={() => handleGenerate(preset.days)}
            disabled={generateSummary.isPending}
          />
        ))}
      </View>

      {generateSummary.isPending ? <Text variant="bodyMuted">{t('generating')}</Text> : null}

      {generateSummary.isError ? <Banner tone="danger" message={t('generateError')} /> : null}

      {result ? (
        <ScrollView style={{ marginTop: spacing.md }}>
          <Card>
            <Text variant="body" style={{ fontFamily: 'monospace' }}>
              {result.text}
            </Text>
          </Card>
          {pdfError ? <Banner tone="danger" message={t('exportPdfError')} /> : null}
          <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md, marginBottom: spacing.lg }}>
            <Button label={t('share')} onPress={handleShare} />
            <Button
              label={t('exportPdf')}
              variant="secondary"
              loading={exportingPdf}
              onPress={handleExportPdf}
            />
          </View>
        </ScrollView>
      ) : null}
    </Screen>
  );
}
