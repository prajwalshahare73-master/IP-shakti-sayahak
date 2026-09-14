import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './en.json';
import hi from './hi.json';
import sa from './sa.json';
import gu from './gu.json';
import te from './te.json';
import kn from './kn.json';
import mr from './mr.json';
import bn from './bn.json';
import hinglish from './hinglish.json';

export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English', script: 'Latin' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', script: 'Devanagari' },
  { code: 'sa', name: 'Sanskrit', nativeName: 'संस्कृतम्', script: 'Devanagari' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', script: 'Gujarati' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', script: 'Telugu' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', script: 'Kannada' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', script: 'Devanagari' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', script: 'Bengali' },
  { code: 'hinglish', name: 'Hinglish', nativeName: 'Hinglish', script: 'Latin' }
];

const savedLang = localStorage.getItem('ipsakti_lang') || 'en';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      hi: { translation: hi },
      sa: { translation: sa },
      gu: { translation: gu },
      te: { translation: te },
      kn: { translation: kn },
      mr: { translation: mr },
      bn: { translation: bn },
      hinglish: { translation: hinglish }
    },
    lng: savedLang,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

i18n.on('languageChanged', (lng) => {
  localStorage.setItem('ipsakti_lang', lng);
  document.documentElement.lang = lng === 'hinglish' ? 'en' : lng;
});

export default i18n;
