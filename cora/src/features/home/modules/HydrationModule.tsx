import { useTranslation } from 'react-i18next';

import { PlaceholderModule } from './PlaceholderModule';

export function HydrationModule() {
  const { t } = useTranslation('home');

  return (
    <PlaceholderModule
      emoji="💧"
      title={t('hydration.title')}
      description={t('hydration.description')}
    />
  );
}
