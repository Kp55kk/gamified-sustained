import en from './en.json';
import hi from './hi.json';
import ta from './ta.json';
import te from './te.json';
import kn from './kn.json';
import ml from './ml.json';
import mr from './mr.json';
import bn from './bn.json';
import gu from './gu.json';
import pa from './pa.json';

const translations = { en, hi, ta, te, kn, ml, mr, bn, gu, pa };

// Language code to speech synthesis locale mapping
export const LANG_VOICES = {
  en: 'en-IN',
  hi: 'hi-IN',
  ta: 'ta-IN',
  te: 'te-IN',
  kn: 'kn-IN',
  ml: 'ml-IN',
  mr: 'mr-IN',
  bn: 'bn-IN',
  gu: 'gu-IN',
  pa: 'pa-IN',
};

/**
 * Get translation object for a given language code.
 * Falls back to English for unsupported languages.
 */
export function getTranslation(langCode) {
  return translations[langCode] || translations.en;
}

/**
 * Get the speech synthesis voice locale for a language code.
 */
export function getVoiceLocale(langCode) {
  return LANG_VOICES[langCode] || 'en-IN';
}

export default translations;
