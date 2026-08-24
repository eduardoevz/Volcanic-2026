import { useRef, useState } from 'react';
import { router } from 'expo-router';
import { Dimensions, ScrollView, StyleSheet, View } from 'react-native';

import { Button } from '@/ui/components/Button';
import { Screen } from '@/ui/components/Screen';
import { Text } from '@/ui/components/Text';
import { colors, radii, spacing } from '@/ui/theme/tokens';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    emoji: '🌱',
    title: 'Cora crece con vos',
    body: 'Tu Home, tus registros y tu contenido se adaptan a la etapa de vida que estés viviendo.',
  },
  {
    emoji: '🔒',
    title: 'Tu información es tuya',
    body: 'Nada se comparte con terceros. Vos decidís qué compartir con la IA de Cora, y por defecto está apagado.',
  },
  {
    emoji: '🐉',
    title: 'Conocé a tu pitahaya',
    body: 'Una mascota que crece con tu acompañamiento, sin castigos ni rachas — solo sube de nivel.',
  },
];

export default function Welcome() {
  const scrollRef = useRef<ScrollView>(null);
  const [slideIndex, setSlideIndex] = useState(0);

  const goToLifeStage = () => router.push('/(onboarding)/life-stage');

  const handleNext = () => {
    if (slideIndex < SLIDES.length - 1) {
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
        {SLIDES.map((slide) => (
          <View key={slide.title} style={[styles.slide, { width }]}>
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
          {SLIDES.map((slide, index) => (
            <View
              key={slide.title}
              style={[styles.dot, index === slideIndex && styles.dotActive]}
            />
          ))}
        </View>
        <Button
          label={slideIndex === SLIDES.length - 1 ? 'Comenzar' : 'Siguiente'}
          onPress={handleNext}
          style={{ marginBottom: spacing.sm }}
        />
        <Button label="Saltar" variant="ghost" onPress={goToLifeStage} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
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
