import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { LEVEL_META, useMascotState, type MascotLevel } from '@/features/mascot';
import { Skeleton } from '@/ui/components/Skeleton';
import { Text } from '@/ui/components/Text';
import { useTheme } from '@/ui/theme/ThemeContext';
import { radii, spacing } from '@/ui/theme/tokens';

export function MascotModule() {
  const { t } = useTranslation('home');
  const { colors, shadows } = useTheme();
  const { data: mascot, isLoading } = useMascotState();
  const level = (mascot?.level ?? 1) as MascotLevel;
  const meta = LEVEL_META[level];

  return (
    <Pressable onPress={() => router.push('/mascot')}>
      <LinearGradient
        colors={[colors.stemLight, colors.cream]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.md,
          borderRadius: radii.lg,
          padding: spacing.md,
          ...shadows.card,
        }}
      >
        <Text style={{ fontSize: 40 }}>{meta.emoji}</Text>
        {isLoading ? (
          <Skeleton width={140} height={16} />
        ) : (
          <View style={{ flex: 1 }}>
            <Text variant="heading">{t('mascot.summary', { name: meta.name, level })}</Text>
            <Text variant="bodyMuted">{t('mascot.points', { points: mascot?.points ?? 0 })}</Text>
          </View>
        )}
      </LinearGradient>
    </Pressable>
  );
}
