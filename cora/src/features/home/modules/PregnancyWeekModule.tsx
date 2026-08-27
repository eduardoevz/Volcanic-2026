import { useTranslation } from 'react-i18next';

import { PlaceholderModule } from './PlaceholderModule';

export function PregnancyWeekModule() {
  const { t } = useTranslation('home');

  return (
    <PlaceholderModule
      emoji="🤰"
      title={t('pregnancyWeek.title')}
      description={t('pregnancyWeek.description')}
    />
  );
}
