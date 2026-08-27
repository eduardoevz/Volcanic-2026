import { useEffect, useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { ScrollView, View } from 'react-native';

import { useProfile } from '@/features/profile';
import {
  useDailyLog,
  useSaveDailyLog,
  useSymptomCatalog,
  type FlowLevel,
  type Mood,
} from '@/features/tracking';
import { Banner } from '@/ui/components/Banner';
import { Button } from '@/ui/components/Button';
import { Chip } from '@/ui/components/Chip';
import { Input } from '@/ui/components/Input';
import { Screen } from '@/ui/components/Screen';
import { Text } from '@/ui/components/Text';
import { spacing } from '@/ui/theme/tokens';

const FLOW_OPTIONS: { value: FlowLevel; label: string }[] = [
  { value: 'none', label: 'Nada' },
  { value: 'spotting', label: 'Manchado' },
  { value: 'light', label: 'Leve' },
  { value: 'medium', label: 'Moderado' },
  { value: 'heavy', label: 'Abundante' },
];

const MOOD_OPTIONS: { value: Mood; label: string }[] = [
  { value: 'great', label: '😄 Genial' },
  { value: 'good', label: '🙂 Bien' },
  { value: 'neutral', label: '😐 Neutral' },
  { value: 'low', label: '😔 Bajo' },
  { value: 'difficult', label: '😣 Difícil' },
];

// El flujo no aplica en estas etapas (no hay ciclo menstrual en curso).
const STAGES_WITHOUT_FLOW = ['mayor', 'embarazo'];

export default function DailyLogScreen() {
  const { date } = useLocalSearchParams<{ date: string }>();
  const { data: profile } = useProfile();
  const { data: existingLog, isLoading: logLoading, isError: logError } = useDailyLog(date);
  const { data: symptoms, isLoading: symptomsLoading, isError: symptomsError } = useSymptomCatalog();
  const saveDailyLog = useSaveDailyLog();

  const [flowLevel, setFlowLevel] = useState<FlowLevel | null>(null);
  const [mood, setMood] = useState<Mood | null>(null);
  const [energyLevel, setEnergyLevel] = useState<number | null>(null);
  const [notes, setNotes] = useState('');
  const [selectedSymptoms, setSelectedSymptoms] = useState<Map<string, number>>(new Map());
  const [prefilled, setPrefilled] = useState(false);

  // Precarga los valores guardados una sola vez, ajustando el estado durante
  // el render (no en un efecto) apenas termina de cargar la query — patrón
  // recomendado por React para sincronizar estado con datos externos.
  if (!prefilled && !logLoading) {
    setPrefilled(true);
    if (existingLog) {
      setFlowLevel(existingLog.flow_level);
      setMood(existingLog.mood);
      setEnergyLevel(existingLog.energy_level);
      setNotes(existingLog.notes ?? '');
      const map = new Map<string, number>();
      for (const s of existingLog.daily_log_symptoms ?? []) {
        map.set(s.symptom_id, s.intensity);
      }
      setSelectedSymptoms(map);
    }
  }

  const showFlow = !STAGES_WITHOUT_FLOW.includes(profile?.life_stage ?? '');
  const applicableSymptoms = (symptoms ?? []).filter((s) =>
    profile?.life_stage ? s.applicable_stages.includes(profile.life_stage) : true
  );

  const toggleSymptom = (symptomId: string) => {
    setSelectedSymptoms((prev) => {
      const next = new Map(prev);
      if (next.has(symptomId)) {
        next.delete(symptomId);
      } else {
        next.set(symptomId, 2); // intensidad media por defecto
      }
      return next;
    });
  };

  const setIntensity = (symptomId: string, intensity: number) => {
    setSelectedSymptoms((prev) => new Map(prev).set(symptomId, intensity));
  };

  const handleSave = () => {
    // Con networkMode 'offlineFirst' la mutación se pausa sola sin conexión y
    // se retoma al reconectar (ver configureOnlineManager en queryClient.ts).
    // Navegamos de inmediato en el camino online exitoso y también apenas la
    // mutación queda pausada por falta de red (para no romper la sensación de
    // guardado instantáneo del modo offline). Si falla de verdad con red (tras
    // agotar los reintentos), nos quedamos en la pantalla para que se vea el
    // banner de error de abajo, en vez de perderlo por haber navegado antes.
    saveDailyLog.mutate(
      {
        logDate: date,
        flowLevel,
        mood,
        energyLevel,
        sleepHours: null,
        notes: notes.trim() ? notes.trim() : null,
        symptoms: Array.from(selectedSymptoms.entries()).map(([symptomId, intensity]) => ({
          symptomId,
          intensity,
        })),
      },
      { onSuccess: () => router.back() }
    );
  };

  // La actualización de isPaused llega en un render posterior al de mutate()
  // de arriba, así que se cubre con un efecto separado en vez de leerlo ahí.
  useEffect(() => {
    if (saveDailyLog.isPaused) {
      router.back();
    }
  }, [saveDailyLog.isPaused]);

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ gap: spacing.lg, paddingBottom: spacing.xl }}>
        <Text variant="bodyMuted">{date}</Text>

        {logError ? (
          <Banner
            tone="warning"
            message="No pudimos cargar tu registro previo de este día — si ya habías guardado algo, revisalo antes de sobrescribir."
          />
        ) : null}

        {showFlow ? (
          <View style={{ gap: spacing.xs }}>
            <Text variant="heading">Flujo</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs }}>
              {FLOW_OPTIONS.map((opt) => (
                <Chip
                  key={opt.value}
                  label={opt.label}
                  selected={flowLevel === opt.value}
                  onPress={() => setFlowLevel(opt.value)}
                />
              ))}
            </View>
          </View>
        ) : null}

        <View style={{ gap: spacing.xs }}>
          <Text variant="heading">Ánimo</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs }}>
            {MOOD_OPTIONS.map((opt) => (
              <Chip
                key={opt.value}
                label={opt.label}
                selected={mood === opt.value}
                onPress={() => setMood(opt.value)}
              />
            ))}
          </View>
        </View>

        <View style={{ gap: spacing.xs }}>
          <Text variant="heading">Energía</Text>
          <View style={{ flexDirection: 'row', gap: spacing.xs }}>
            {[1, 2, 3, 4, 5].map((level) => (
              <Chip
                key={level}
                label={String(level)}
                selected={energyLevel === level}
                onPress={() => setEnergyLevel(level)}
              />
            ))}
          </View>
        </View>

        <View style={{ gap: spacing.xs }}>
          <Text variant="heading">Síntomas</Text>
          {symptomsError ? (
            <Banner tone="danger" message="No pudimos cargar el catálogo de síntomas." />
          ) : symptomsLoading ? (
            <Text variant="bodyMuted">Cargando síntomas...</Text>
          ) : (
            <View style={{ gap: spacing.sm }}>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs }}>
                {applicableSymptoms.map((symptom) => (
                  <Chip
                    key={symptom.id}
                    label={`${symptom.icon ?? ''} ${symptom.label_es}`.trim()}
                    selected={selectedSymptoms.has(symptom.id)}
                    onPress={() => toggleSymptom(symptom.id)}
                  />
                ))}
              </View>
              {Array.from(selectedSymptoms.keys()).map((symptomId) => {
                const symptom = applicableSymptoms.find((s) => s.id === symptomId);
                if (!symptom) return null;
                return (
                  <View key={symptomId} style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
                    <Text variant="caption" style={{ width: 140 }}>
                      {symptom.label_es}
                    </Text>
                    {[1, 2, 3].map((intensity) => (
                      <Chip
                        key={intensity}
                        label={String(intensity)}
                        selected={selectedSymptoms.get(symptomId) === intensity}
                        onPress={() => setIntensity(symptomId, intensity)}
                      />
                    ))}
                  </View>
                );
              })}
            </View>
          )}
        </View>

        <View style={{ gap: spacing.xs }}>
          <Text variant="heading">Nota</Text>
          <Input
            placeholder="Algo más que quieras anotar (opcional)"
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
          />
        </View>

        {saveDailyLog.isError ? (
          <Banner message="No pudimos guardar. Probá de nuevo." tone="danger" />
        ) : null}

        <Button label="Guardar" onPress={handleSave} loading={saveDailyLog.isPending} />
      </ScrollView>
    </Screen>
  );
}
