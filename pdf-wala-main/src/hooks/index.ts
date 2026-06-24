import { useState, useCallback } from 'react';
import translatorService from '../services/translatorService';
import type { TranslateResult } from '../services/translatorService';
import type { LanguageCode } from '../services/translatorService';

interface UseFileUploadOptions {
  maxSize?: number;
  allowedTypes?: string[];
  multiple?: boolean;
}

export const useFileUpload = (options: UseFileUploadOptions = {}) => {
  const {
    maxSize = 50 * 1024 * 1024, // 50MB default
    allowedTypes = [],
    multiple = true,
  } = options;

  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const validateFile = useCallback(
    (file: File): boolean => {
      if (file.size > maxSize) {
        setError(`File size exceeds maximum of ${maxSize / 1024 / 1024}MB`);
        return false;
      }

      if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
        setError(`File type ${file.type} is not allowed`);
        return false;
      }

      return true;
    },
    [maxSize, allowedTypes]
  );

  const handleFiles = useCallback(
    (newFiles: File[]) => {
      setError(null);
      const validFiles = newFiles.filter(validateFile);

      if (validFiles.length === 0) return;

      if (multiple) {
        setFiles((prev) => [...prev, ...validFiles]);
      } else {
        setFiles([validFiles[0]]);
      }
    },
    [validateFile, multiple]
  );

  const removeFile = useCallback((index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const clearFiles = useCallback(() => {
    setFiles([]);
    setError(null);
  }, []);

  return {
    files,
    error,
    loading,
    setLoading,
    handleFiles,
    removeFile,
    clearFiles,
  };
};

export const useLocalStorage = <T>(
  key: string,
  initialValue: T
): [T, (value: T) => void] => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value: T) => {
      try {
        setStoredValue(value);
        window.localStorage.setItem(key, JSON.stringify(value));
      } catch (error) {
        console.error('Error setting local storage:', error);
      }
    },
    [key]
  );

  return [storedValue, setValue];
};

export const useTranslator = (): { translate: (text: string, targetLang: LanguageCode, sourceLang?: LanguageCode) => Promise<TranslateResult>; isLoading: boolean; error: string | null } => {
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

export const useScrollDirection = () => {
  const [direction, setDirection] = useState<'up' | 'down'>('up');
  const [lastScrollY, setLastScrollY] = useState(0);

  const handleScroll = useCallback(() => {
    const currentScrollY = window.scrollY;

    if (currentScrollY > lastScrollY) {
      setDirection('down');
    } else if (currentScrollY < lastScrollY) {
      setDirection('up');
    }

    setLastScrollY(currentScrollY);
  }, [lastScrollY]);

  return { direction, handleScroll };
};

export { useAuth } from './useAuth';

