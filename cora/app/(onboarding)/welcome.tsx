import { useMemo, useRef, useState } from 'react';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';

import { Button } from '@/ui/components/Button';
import { Screen } from '@/ui/components/Screen';
import { Text } from '@/ui/components/Text';
import { useTheme } from '@/ui/theme/ThemeContext';
import { radii, spacing, type ColorScheme } from '@/ui/theme/tokens';

const SLIDE_EMOJI = ['🌱', '🔒', '🐉'];
const SLIDE_KEYS = ['grow', 'privacy', 'mascot'] as const;

function buildStyles(colors: ColorScheme) {
  return StyleSheet.create({
    slide: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: spacing.lg,
    },
    emoji: {
      fontSize: 72,
      marginBottom: spacing.lg,
    },
    title: {
      textAlign: 'center',
      marginBottom: spacing.sm,
    },
    body: {
      textAlign: 'center',
    },
    footer: {
      paddingHorizontal: spacing.md,
      paddingBottom: spacing.lg,
    },
    dots: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: spacing.xs,
      marginBottom: spacing.lg,
    },
    dot: {
      width: 8,
      height: 8,
      borderRadius: radii.full,
      backgroundColor: colors.border,
    },
    dotActive: {
      backgroundColor: colors.pitahaya,
    },
  });
}

export default function Welcome() {
  const { t } = useTranslation('onboarding');
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const styles = useMemo(() => buildStyles(colors), [colors]);
  const scrollRef = useRef<ScrollView>(null);
  const [slideIndex, setSlideIndex] = useState(0);

  const slides = SLIDE_KEYS.map((key, i) => ({
    key,
    emoji: SLIDE_EMOJI[i],
    title: t(`welcome.slides.${key}.title`),
    body: t(`welcome.slides.${key}.body`),
  }));

  const goToLifeStage = () => router.push('/(onboarding)/life-stage');

  const handleNext = () => {
    if (slideIndex < slides.length - 1) {
      scrollRef.current?.scrollTo({ x: (slideIndex + 1) * width, animated: true });
    } else {
      goToLifeStage();
    }
  };

  return (
    <Screen padded={false}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => {
          setSlideIndex(Math.round(e.nativeEvent.contentOffset.x / width));
        }}
      >
        {slides.map((slide) => (
          <View key={slide.key} style={[styles.slide, { width }]}>
            <Text style={styles.emoji}>{slide.emoji}</Text>
            <Text variant="title" style={styles.title}>
              {slide.title}
            </Text>
            <Text variant="bodyMuted" style={styles.body}>
              {slide.body}
            </Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.dots}>
          {slides.map((slide, index) => (
            <View key={slide.key} style={[styles.dot, index === slideIndex && styles.dotActive]} />
          ))}
        </View>
        <Button
          label={slideIndex === slides.length - 1 ? t('welcome.start') : t('welcome.next')}
          onPress={handleNext}
          style={{ marginBottom: spacing.sm }}
        />
        <Button label={t('welcome.skip')} variant="ghost" onPress={goToLifeStage} />
      </View>
    </Screen>
  );
}
