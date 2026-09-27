import en from './en';
import te from './te';

const translations = { en, te };

export const t = (key, language = 'en') => {
  return translations[language]?.[key] || translations['en']?.[key] || key;
};

export const useTranslation = (language) => ({
  t: (key) => t(key, language),
  language,
});

export default translations;
