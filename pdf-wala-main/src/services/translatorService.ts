import axios from 'axios';

export interface TranslateResult {
  text: string;
  language: string;
  detectedLanguage?: string;
}

export const SUPPORTED_LANGUAGES = {
  af: 'Afrikaans',
  ar: 'Arabic',
  bg: 'Bulgarian',
  bn: 'Bengali',
  ca: 'Catalan',
  cs: 'Czech',
  cy: 'Welsh',
  da: 'Danish',
  de: 'German',
  el: 'Greek',
  en: 'English',
  es: 'Spanish',
  et: 'Estonian',
  fa: 'Persian',
  fi: 'Finnish',
  fr: 'French',
  gu: 'Gujarati',
  he: 'Hebrew',
  hi: 'Hindi',
  hr: 'Croatian',
  hu: 'Hungarian',
  id: 'Indonesian',
  it: 'Italian',
  ja: 'Japanese',
  kn: 'Kannada',
  ko: 'Korean',
  lt: 'Lithuanian',
  lv: 'Latvian',
  mk: 'Macedonian',
  ml: 'Malayalam',
  mr: 'Marathi',
  ne: 'Nepali',
  nl: 'Dutch',
  no: 'Norwegian',
  pa: 'Punjabi',
  pl: 'Polish',
  pt: 'Portuguese',
  ro: 'Romanian',
  ru: 'Russian',
  sk: 'Slovak',
  sl: 'Slovenian',
  so: 'Somali',
  sq: 'Albanian',
  sv: 'Swedish',
  ta: 'Tamil',
  te: 'Telugu',
  th: 'Thai',
  tl: 'Tagalog',
  tr: 'Turkish',
  uk: 'Ukrainian',
  ur: 'Urdu',
  vi: 'Vietnamese',
  zh: 'Chinese',
  'zh-CN': 'Chinese (Simplified)',
  'zh-TW': 'Chinese (Traditional)',
} as const;

export type LanguageCode = keyof typeof SUPPORTED_LANGUAGES;

class TranslatorService {
  private readonly apiUrl = 'https://api.mymemory.translated.net/get';

  async translate(
    text: string,
    targetLanguage: LanguageCode,
    sourceLanguage: LanguageCode = 'en'
  ): Promise<TranslateResult> {
    try {
      if (!text.trim()) {
        return {
          text: '',
          language: targetLanguage,
        };
      }

      const response = await axios.get(this.apiUrl, {
        params: {
          q: text,
          langpair: `${sourceLanguage}|${targetLanguage}`,
        },
      });

      if (response.data.responseStatus === 200) {
        return {
          text: response.data.responseData.translatedText,
          language: targetLanguage,
          detectedLanguage: sourceLanguage,
        };
      }

      throw new Error(response.data.responseStatus);
    } catch (error) {
      console.error('Translation error:', error);
      throw new Error(`Failed to translate text to ${targetLanguage}`);
    }
  }

  async translateBatch(
    texts: string[],
    targetLanguage: LanguageCode,
    sourceLanguage: LanguageCode = 'en'
  ): Promise<TranslateResult[]> {
    try {
      const results = await Promise.all(
        texts.map((text) => this.translate(text, targetLanguage, sourceLanguage))
      );
      return results;
    } catch (error) {
      console.error('Batch translation error:', error);
      throw error;
    }
  }

  getLanguageName(code: LanguageCode): string {
    return SUPPORTED_LANGUAGES[code] || code;
  }

  getAllLanguages() {
    return Object.entries(SUPPORTED_LANGUAGES).map(([code, name]) => ({
      code: code as LanguageCode,
      name,
    }));
  }

  isValidLanguage(code: string): code is LanguageCode {
    return code in SUPPORTED_LANGUAGES;
  }
}

export default new TranslatorService();
