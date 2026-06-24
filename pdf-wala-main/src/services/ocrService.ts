import Tesseract from 'tesseract.js';

export class OCRService {
  private static postProcessOCRText(rawText: string): string {
    const cleaned = rawText
      // merge broken words split by newline hyphenation
      .replace(/([A-Za-z])-\s*\n\s*([A-Za-z])/g, '$1$2')
      // normalize line endings and whitespace
      .replace(/\r\n/g, '\n')
      .replace(/[ \t]+/g, ' ')
      // collapse noisy repeated punctuation from OCR
      .replace(/([,.;:!?])\1+/g, '$1')
      // trim spaces around punctuation
      .replace(/\s+([,.;:!?])/g, '$1')
      .replace(/([,.;:!?])([A-Za-z])/g, '$1 $2')
      // collapse too many blank lines
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    const lines = cleaned
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        if (!line) return line;
        const normalized =
          line.charAt(0).toUpperCase() + line.slice(1);
        return /[.!?]$/.test(normalized) ? normalized : `${normalized}.`;
      });

    return lines.join('\n');
  }

  static async extractTextFromImage(
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<string> {
    try {
      const result = await Tesseract.recognize(file, 'eng', {
        logger: (m) => {
          if (m.status === 'recognizing') {
            onProgress?.(m.progress * 100);
          }
        },
      });

      return this.postProcessOCRText(result.data.text || '');
    } catch (error) {
      console.error('Error extracting text from image:', error);
      throw error;
    }
  }

  static async extractTextFromImageURL(
    imageUrl: string,
    onProgress?: (progress: number) => void
  ): Promise<string> {
    try {
      const result = await Tesseract.recognize(imageUrl, 'eng', {
        logger: (m) => {
          if (m.status === 'recognizing') {
            onProgress?.(m.progress * 100);
          }
        },
      });

      return this.postProcessOCRText(result.data.text || '');
    } catch (error) {
      console.error('Error extracting text from image URL:', error);
      throw error;
    }
  }

  static async performOCRWithLanguage(
    file: File,
    language: string = 'eng',
    onProgress?: (progress: number) => void
  ): Promise<string> {
    try {
      const result = await Tesseract.recognize(file, language, {
        logger: (m) => {
          if (m.status === 'recognizing') {
            onProgress?.(m.progress * 100);
          }
        },
      });

      return this.postProcessOCRText(result.data.text || '');
    } catch (error) {
      console.error('Error performing OCR:', error);
      throw error;
    }
  }

  static async detectLanguage(file: File): Promise<string> {
    try {
      const result = await Tesseract.detect(file);
      return result.data.lang || 'eng';
    } catch (error) {
      console.error('Error detecting language:', error);
      return 'eng';
    }
  }
}
