import { useState, useCallback } from 'react';
import translatorService from '../services/translatorService';
import type { LanguageCode, TranslateResult } from '../services/translatorService';

interface UseTranslatorReturn {
  translate: (text: string, targetLang: LanguageCode, sourceLang?: LanguageCode) => Promise<TranslateResult>;
  isLoading: boolean;
  error: string | null;
}

export const useTranslator = (): UseTranslatorReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const translate = useCallback(
    async (text: string, targetLang: LanguageCode, sourceLang: LanguageCode = 'en') => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await translatorService.translate(text, targetLang, sourceLang);
        return result;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Translation failed';
        setError(errorMsg);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return { translate, isLoading, error };
};
