import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import type { BloodType, MedicalBackground, MedicalBackgroundInput } from '@/features/medicalBackground/api';
import { Button } from '@/ui/components/Button';
import { Input } from '@/ui/components/Input';
import { Text } from '@/ui/components/Text';
import { useTheme } from '@/ui/theme/ThemeContext';
import { radii, spacing } from '@/ui/theme/tokens';

const BLOOD_TYPES: BloodType[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

type MedicalBackgroundFormProps = {
  initial?: MedicalBackground | null;
  submitLabel: string;
  submitting?: boolean;
  onSubmit: (input: MedicalBackgroundInput) => void;
};

export function MedicalBackgroundForm({
  initial,
  submitLabel,
  submitting = false,
  onSubmit,
}: MedicalBackgroundFormProps) {
  const { t } = useTranslation('onboarding');
  const { colors } = useTheme();
  const [allergies, setAllergies] = useState(initial?.allergies ?? '');
  const [familyHistory, setFamilyHistory] = useState(initial?.family_history ?? '');
  const [chronicConditions, setChronicConditions] = useState(initial?.chronic_conditions ?? '');
  const [currentMedications, setCurrentMedications] = useState(initial?.current_medications ?? '');
  const [bloodType, setBloodType] = useState<BloodType | null>(initial?.blood_type ?? null);

  const chipStyles = useMemo(
    () => ({
      base: {
        borderRadius: radii.full,
        paddingVertical: spacing.xs + 2,
        paddingHorizontal: spacing.md,
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: colors.border,
      },
      selected: {
        backgroundColor: colors.pitahaya,
        borderColor: colors.pitahaya,
      },
    }),
    [colors]
  );

  const handleSubmit = () => {
    onSubmit({
      allergies: allergies.trim() || null,
      familyHistory: familyHistory.trim() || null,
      chronicConditions: chronicConditions.trim() || null,
      currentMedications: currentMedications.trim() || null,
      bloodType,
    });
  };

  return (
    <View style={{ gap: spacing.md }}>
      <Input
        label={t('medicalBackground.allergiesLabel')}
        placeholder={t('medicalBackground.allergiesPlaceholder')}
        value={allergies}
        onChangeText={setAllergies}
        multiline
        style={{ minHeight: 64, textAlignVertical: 'top' }}
      />
      <Input
        label={t('medicalBackground.familyHistoryLabel')}
        placeholder={t('medicalBackground.familyHistoryPlaceholder')}
        value={familyHistory}
        onChangeText={setFamilyHistory}
        multiline
        style={{ minHeight: 64, textAlignVertical: 'top' }}
      />
      <Input
        label={t('medicalBackground.chronicConditionsLabel')}
        placeholder={t('medicalBackground.chronicConditionsPlaceholder')}
        value={chronicConditions}
        onChangeText={setChronicConditions}
        multiline
        style={{ minHeight: 64, textAlignVertical: 'top' }}
      />
      <Input
        label={t('medicalBackground.currentMedicationsLabel')}
        placeholder={t('medicalBackground.currentMedicationsPlaceholder')}
        value={currentMedications}
        onChangeText={setCurrentMedications}
        multiline
        style={{ minHeight: 64, textAlignVertical: 'top' }}
      />

      <View>
        <Text variant="caption" style={{ marginBottom: spacing.xs, marginLeft: spacing.xs }}>
          {t('medicalBackground.bloodTypeLabel')}
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
          {BLOOD_TYPES.map((type) => {
            const selected = bloodType === type;
            return (
              <Pressable
                key={type}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                onPress={() => setBloodType(selected ? null : type)}
                style={[chipStyles.base, selected && chipStyles.selected]}
              >
                <Text
                  variant="caption"
                  style={{ color: selected ? colors.onBrand : colors.charcoal, fontWeight: '600' }}
                >
                  {type}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <Button label={submitLabel} onPress={handleSubmit} loading={submitting} />
    </View>
  );
}
