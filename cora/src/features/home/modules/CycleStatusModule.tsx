import { format } from 'date-fns';

import { usePrediction } from '@/features/tracking';
import { Card } from '@/ui/components/Card';
import { Text } from '@/ui/components/Text';

export function CycleStatusModule() {
  const { prediction, hasEnoughData, isLoading } = usePrediction();

  if (isLoading) {
    return (
      <Card>
        <Text variant="bodyMuted">Cargando tu ciclo...</Text>
      </Card>
    );
  }

  if (!hasEnoughData || !prediction) {
    return (
      <Card>
        <Text variant="heading">Estado del ciclo</Text>
        <Text variant="bodyMuted">
          Registrá al menos 2 ciclos para ver una predicción estimada acá.
        </Text>
      </Card>
    );
  }

  const endDate = new Date(new Date(prediction.nextStart).getTime() + prediction.windowDays * 86400000);

  return (
    <Card>
      <Text variant="heading">Estado del ciclo</Text>
      <Text variant="body">
        Tu próximo período podría llegar entre el {format(new Date(prediction.nextStart), 'd')} y el{' '}
        {format(endDate, 'd MMM')}.
      </Text>
      <Text variant="caption">
        {prediction.confidence === 'buena' ? 'Confianza buena' : 'Estimación inicial'} · no es un
        diagnóstico
      </Text>
    </Card>
  );
}
