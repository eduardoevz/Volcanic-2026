import { useTranslation } from 'react-i18next';

import { PlaceholderModule } from './PlaceholderModule';

export function RemindersModule() {
  const { t } = useTranslation('home');

  return (
    <PlaceholderModule
      emoji="⏰"
      title={t('reminders.title')}
      description={t('reminders.description')}
    />
  );
}
