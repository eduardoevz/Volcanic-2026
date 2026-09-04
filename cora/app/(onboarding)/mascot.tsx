import { useEffect } from 'react';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { OnboardingProgress } from '@/features/onboarding';
import { Button } from '@/ui/components/Button';
import { Screen } from '@/ui/components/Screen';
import { Text } from '@/ui/components/Text';
import { spacing } from '@/ui/theme/tokens';

export default function MascotScreen() {
  const { t } = useTranslation('onboarding');
  const scale = useSharedValue(0);

  useEffect(() => {
    scale.value = withSpring(1, { damping: 8 });
  }, [scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Screen style={{ alignItems: 'center', justifyContent: 'center' }}>
      <OnboardingProgress step={5} />
      <Animated.Text style={[{ fontSize: 96, marginVertical: spacing.lg }, animatedStyle]}>
        🐉
      </Animated.Text>
      <Text variant="title" style={{ textAlign: 'center', marginBottom: spacing.sm }}>
        {t('mascotIntro.title')}
      </Text>
      <Text variant="bodyMuted" style={{ textAlign: 'center', marginBottom: spacing.lg }}>
        {t('mascotIntro.body')}
      </Text>
      <Button label={t('mascotIntro.continue')} onPress={() => router.push('/(onboarding)/consent')} />
    </Screen>
  );
}
