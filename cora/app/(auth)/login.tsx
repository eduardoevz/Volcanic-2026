import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Image, ScrollView, StyleSheet, View } from 'react-native';

import { LoginForm } from '@/features/auth';
import { Screen } from '@/ui/components/Screen';
import { Text } from '@/ui/components/Text';
import { useTheme } from '@/ui/theme/ThemeContext';
import { spacing, type ColorScheme } from '@/ui/theme/tokens';

function buildStyles(colors: ColorScheme) {
  return StyleSheet.create({
    screen: {
      backgroundColor: colors.cream,
    },
    leaves: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: 80,
    },
    header: {
      paddingTop: 88,
      paddingHorizontal: spacing.md,
      alignItems: 'center',
    },
    title: {
      textAlign: 'center',
    },
    subtitle: {
      textAlign: 'center',
      marginTop: spacing.xs,
      marginBottom: spacing.lg,
    },
  });
}

export default function Login() {
  const { t } = useTranslation('auth');
  const { colors } = useTheme();
  const styles = useMemo(() => buildStyles(colors), [colors]);

  return (
    <Screen padded={false} style={styles.screen}>
      <Image
        source={require('../../assets/images/welcome/leaves-top-login.png')}
        style={styles.leaves}
        resizeMode="cover"
      />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text variant="title">{t('login.title')}</Text>
          <Text variant="bodyMuted" style={styles.subtitle}>
            {t('login.subtitle')}
          </Text>
        </View>
        <LoginForm />
      </ScrollView>
    </Screen>
  );
}
