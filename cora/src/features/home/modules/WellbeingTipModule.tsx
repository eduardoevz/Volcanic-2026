import { useTranslation } from 'react-i18next';

import { PlaceholderModule } from './PlaceholderModule';

export function WellbeingTipModule() {
  const { t } = useTranslation('home');

  return (
    <PlaceholderModule
      emoji="💡"
      title={t('wellbeingTip.title')}
      description={t('wellbeingTip.description')}
    />
  );
}
