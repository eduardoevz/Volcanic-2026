import * as Localization from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import esAssistant from '../../locales/es/assistant.json';
import esAuth from '../../locales/es/auth.json';
import esCommon from '../../locales/es/common.json';
import esDirectory from '../../locales/es/directory.json';
import esFamily from '../../locales/es/family.json';
import esHome from '../../locales/es/home.json';
import esLibrary from '../../locales/es/library.json';
import esMascot from '../../locales/es/mascot.json';
import esOnboarding from '../../locales/es/onboarding.json';
import esReminders from '../../locales/es/reminders.json';
import esSettings from '../../locales/es/settings.json';
import esSummary from '../../locales/es/summary.json';
import esTracking from '../../locales/es/tracking.json';
import misAssistant from '../../locales/mis/assistant.json';
import misAuth from '../../locales/mis/auth.json';
import misCommon from '../../locales/mis/common.json';
import misDirectory from '../../locales/mis/directory.json';
import misFamily from '../../locales/mis/family.json';
import misHome from '../../locales/mis/home.json';
import misLibrary from '../../locales/mis/library.json';
import misMascot from '../../locales/mis/mascot.json';
import misOnboarding from '../../locales/mis/onboarding.json';
import misReminders from '../../locales/mis/reminders.json';
import misSettings from '../../locales/mis/settings.json';
import misSummary from '../../locales/mis/summary.json';
import misTracking from '../../locales/mis/tracking.json';
import mynAssistant from '../../locales/myn/assistant.json';
import mynAuth from '../../locales/myn/auth.json';
import mynCommon from '../../locales/myn/common.json';
import mynDirectory from '../../locales/myn/directory.json';
import mynFamily from '../../locales/myn/family.json';
import mynHome from '../../locales/myn/home.json';
import mynLibrary from '../../locales/myn/library.json';
import mynMascot from '../../locales/myn/mascot.json';
import mynOnboarding from '../../locales/myn/onboarding.json';
import mynReminders from '../../locales/myn/reminders.json';
import mynSettings from '../../locales/myn/settings.json';
import mynSummary from '../../locales/myn/summary.json';
import mynTracking from '../../locales/myn/tracking.json';

const resources = {
  es: {
    common: esCommon,
    auth: esAuth,
    onboarding: esOnboarding,
    home: esHome,
    tracking: esTracking,
    library: esLibrary,
    assistant: esAssistant,
    mascot: esMascot,
    summary: esSummary,
    settings: esSettings,
    reminders: esReminders,
    directory: esDirectory,
    family: esFamily,
  },
  mis: {
    common: misCommon,
    auth: misAuth,
    onboarding: misOnboarding,
    home: misHome,
    tracking: misTracking,
    library: misLibrary,
    assistant: misAssistant,
    mascot: misMascot,
    summary: misSummary,
    settings: misSettings,
    reminders: misReminders,
    directory: misDirectory,
    family: misFamily,
  },
  myn: {
    common: mynCommon,
    auth: mynAuth,
    onboarding: mynOnboarding,
    home: mynHome,
    tracking: mynTracking,
    library: mynLibrary,
    assistant: mynAssistant,
    mascot: mynMascot,
    summary: mynSummary,
    settings: mynSettings,
    reminders: mynReminders,
    directory: mynDirectory,
    family: mynFamily,
  },
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
