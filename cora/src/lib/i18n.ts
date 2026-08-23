import * as Localization from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import esCommon from '../../locales/es/common.json';
import misCommon from '../../locales/mis/common.json';
import mynCommon from '../../locales/myn/common.json';

const resources = {
  es: { common: esCommon },
  mis: { common: misCommon },
  myn: { common: mynCommon },
};

i18n.use(initReactI18next).init({
  resources,
  lng: Localization.getLocales()[0]?.languageCode ?? 'es',
  fallbackLng: 'es',
  defaultNS: 'common',
  interpolation: { escapeValue: false },
  returnEmptyString: false,
});

export default i18n;
