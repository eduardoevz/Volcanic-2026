import { Component, type ErrorInfo, type PropsWithChildren } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/ui/components/Button';
import { Screen } from '@/ui/components/Screen';
import { Text } from '@/ui/components/Text';
import { spacing } from '@/ui/theme/tokens';

type ErrorBoundaryState = {
  error: Error | null;
};

export class ErrorBoundary extends Component<PropsWithChildren, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Sin datos de usuaria en los logs — solo el mensaje técnico del error.
    console.error('[ErrorBoundary]', error.message, info.componentStack);
  }

  reset = () => this.setState({ error: null });

  render() {
    if (this.state.error) {
      return <ErrorFallback onRetry={this.reset} />;
    }
    return this.props.children;
  }
}

function ErrorFallback({ onRetry }: { onRetry: () => void }) {
  const { t } = useTranslation();

  return (
    <Screen>
      <Text variant="heading" style={{ marginBottom: spacing.sm }}>
        {t('common.somethingWentWrong')}
      </Text>
      <Text variant="bodyMuted" style={{ marginBottom: spacing.md }}>
        {t('common.errorBoundaryMessage')}
      </Text>
      <Button label={t('common.retry')} onPress={onRetry} />
    </Screen>
  );
}
