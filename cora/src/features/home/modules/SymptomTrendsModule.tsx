import { useRecentSymptomCounts } from '@/features/tracking';
import { Card } from '@/ui/components/Card';
import { Text } from '@/ui/components/Text';

export function SymptomTrendsModule() {
  const { data: counts, isLoading } = useRecentSymptomCounts();
  const top = counts?.[0];

  return (
    <Card>
      <Text variant="heading">Tendencia de síntomas</Text>
      {isLoading ? (
        <Text variant="bodyMuted">Cargando...</Text>
      ) : top ? (
        <Text variant="body">
          Registraste “{top.label}” {top.count} {top.count === 1 ? 'vez' : 'veces'} en los últimos 30
          días.
        </Text>
      ) : (
        <Text variant="bodyMuted">
          Todavía no hay suficientes registros de síntomas para mostrar una tendencia.
        </Text>
      )}
    </Card>
  );
}
