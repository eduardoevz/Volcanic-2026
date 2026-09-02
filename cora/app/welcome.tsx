import { useMemo } from 'react';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Image, StyleSheet, View } from 'react-native';

import { Button } from '@/ui/components/Button';
import { Screen } from '@/ui/components/Screen';
import { Text } from '@/ui/components/Text';
import { useTheme } from '@/ui/theme/ThemeContext';
import { radii, spacing, type ColorScheme } from '@/ui/theme/tokens';

function buildStyles(colors: ColorScheme) {
  return StyleSheet.create({
    leavesTop: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: 90,
    },
    content: {
      flex: 1,
      alignItems: 'center',
      paddingTop: 96,
      paddingHorizontal: spacing.lg,
    },
    logo: {
      width: 120,
      height: 118,
    },
    title: {
      marginTop: spacing.sm,
      letterSpacing: 2,
    },
    tagline: {
      textAlign: 'center',
      marginTop: spacing.sm,
    },
    divider: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      alignSelf: 'stretch',
      marginTop: spacing.lg,
    },
    dividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: colors.charcoal,
    },
    dividerIcon: {
      width: 20,
      height: 20,
    },
    heading: {
      marginTop: spacing.lg,
    },
    subtitle: {
      marginTop: spacing.xs,
    },
    cta: {
      marginTop: spacing.lg,
      alignSelf: 'stretch',
      borderRadius: radii.full,
      paddingVertical: spacing.md,
    },
    footer: {
      height: 280,
      justifyContent: 'flex-end',
      alignItems: 'center',
    },
    landscape: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      top: 0,
    },
    drum: {
      width: 90,
      height: 154,
      marginBottom: spacing.lg,
    },
    mascot: {
      position: 'absolute',
      width: 150,
      height: 126,
      bottom: spacing.xl + 60,
    },
  });
}

export default function Welcome() {
  const { t } = useTranslation('auth');
  const { colors } = useTheme();
  const styles = useMemo(() => buildStyles(colors), [colors]);

  return (
    <Screen padded={false}>
      <Image
        source={require('../assets/images/welcome/leaves-top-welcome.png')}
        style={styles.leavesTop}
        resizeMode="cover"
      />

      <View style={styles.content}>
        <Image
          source={require('../assets/images/welcome/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text variant="title" style={styles.title}>
          CORA
        </Text>
        <Text variant="bodyMuted" style={styles.tagline}>
          {t('welcome.tagline')}
        </Text>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Image
            source={require('../assets/images/welcome/divider-icon.png')}
            style={styles.dividerIcon}
            resizeMode="contain"
          />
          <View style={styles.dividerLine} />
        </View>

        <Text variant="heading" style={styles.heading}>
          {t('welcome.heading')}
        </Text>
        <Text variant="bodyMuted" style={styles.subtitle}>
          {t('welcome.subtitle')}
        </Text>

        <Button
          label={t('welcome.cta')}
          onPress={() => router.push('/(auth)/login')}
          style={styles.cta}
        />
      </View>

      <View style={styles.footer}>
        <Image
          source={require('../assets/images/welcome/landscape-welcome.png')}
          style={styles.landscape}
          resizeMode="cover"
        />
        <Image
          source={require('../assets/images/welcome/mascot-drum.png')}
          style={styles.drum}
          resizeMode="contain"
        />
        <Image
          source={require('../assets/images/welcome/mascot-welcome.png')}
          style={styles.mascot}
          resizeMode="contain"
        />
      </View>
    </Screen>
  );
}
