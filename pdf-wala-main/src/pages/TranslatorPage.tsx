import { useState } from 'react';
import { Copy, Download, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import translatorService from '../services/translatorService';
import { SUPPORTED_LANGUAGES } from '../services/translatorService';
import type { LanguageCode } from '../services/translatorService';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';

export const TranslatorPage = () => {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [sourceLanguage, setSourceLanguage] = useState<LanguageCode>('en');
  const [targetLanguage, setTargetLanguage] = useState<LanguageCode>('es');
  const [isLoading, setIsLoading] = useState(false);
  const [charCount, setCharCount] = useState(0);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setInputText(text);
    setCharCount(text.length);
  };

  const handleTranslate = async () => {
    if (!inputText.trim()) {
      toast.error('Please enter text to translate');
      return;
    }

    setIsLoading(true);
    try {
      const result = await translatorService.translate(
        inputText,
        targetLanguage,
        sourceLanguage
      );
      setOutputText(result.text);
      toast.success('Translation completed!');
    } catch (error) {
      toast.error('Translation failed. Please try again.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Copied to clipboard!');
    } catch {
      toast.error('Failed to copy');
    }
  };

  const handleSwapLanguages = () => {
    setSourceLanguage(targetLanguage);
    setTargetLanguage(sourceLanguage);
    setInputText(outputText);
    setOutputText(inputText);
  };

  const handleClear = () => {
    setInputText('');
    setOutputText('');
    setCharCount(0);
  };

  const handleDownload = () => {
    if (!outputText) {
      toast.error('No translation to download');
      return;
    }

    const element = document.createElement('a');
    const file = new Blob([outputText], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `translation_${targetLanguage}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success('Translation downloaded!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-2">
            Universal Translator
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300">
            Translate text to any language in the world
          </p>
        </div>

        {/* Main Container */}
        <Card className="shadow-2xl">
          <div className="p-6 md:p-8">
            {/* Language Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Source Language */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  From Language
                </label>
                <select
                  value={sourceLanguage}
                  onChange={(e) => setSourceLanguage(e.target.value as LanguageCode)}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {Object.entries(SUPPORTED_LANGUAGES).map(([code, name]) => (
                    <option key={code} value={code}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Target Language */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  To Language
                </label>
                <select
                  value={targetLanguage}
                  onChange={(e) => setTargetLanguage(e.target.value as LanguageCode)}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {Object.entries(SUPPORTED_LANGUAGES).map(([code, name]) => (
                    <option key={code} value={code}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Input and Output Area */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Input */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Original Text
                  </label>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {charCount} characters
                  </span>
                </div>
                <textarea
                  value={inputText}
                  onChange={handleInputChange}
                  placeholder="Enter text to translate..."
                  className="w-full h-64 px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => handleCopy(inputText)}
                    className="flex items-center gap-2 px-3 py-1 text-sm text-slate-600 dark:text-slate-400 hover:text-blue-500 dark:hover:text-blue-400 transition"
                    disabled={!inputText}
                  >
                    <Copy size={16} />
                    Copy
                  </button>
                </div>
              </div>

              {/* Output */}
              <div>
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 block">
                  Translated Text
                </label>
                <textarea
                  value={outputText}
                  readOnly
                  placeholder="Translation will appear here..."
                  className="w-full h-64 px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-600 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none resize-none"
                />
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => handleCopy(outputText)}
                    className="flex items-center gap-2 px-3 py-1 text-sm text-slate-600 dark:text-slate-400 hover:text-blue-500 dark:hover:text-blue-400 transition disabled:opacity-50"
                    disabled={!outputText}
                  >
                    <Copy size={16} />
                    Copy
                  </button>
                  <button
                    onClick={handleDownload}
                    className="flex items-center gap-2 px-3 py-1 text-sm text-slate-600 dark:text-slate-400 hover:text-green-500 dark:hover:text-green-400 transition disabled:opacity-50"
                    disabled={!outputText}
                  >
                    <Download size={16} />
                    Download
                  </button>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={handleSwapLanguages}
                className="bg-slate-500 hover:bg-slate-600 text-white px-6"
              >
                ⇄ Swap Languages
              </Button>
              <Button
                onClick={handleTranslate}
                disabled={!inputText.trim()}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 flex-1 sm:flex-none"
              >
                Translate
              </Button>
              <Button
                onClick={handleClear}
                className="bg-red-500 hover:bg-red-600 text-white px-6"
              >
                <Trash2 size={18} />
                Clear
              </Button>
            </div>

            {/* Info Section */}
            <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-2">
                Supported Languages
              </h3>
              <p className="text-xs text-blue-800 dark:text-blue-300">
                {Object.keys(SUPPORTED_LANGUAGES).length}+ languages supported including English, Spanish,
                French, German, Chinese, Japanese, Arabic, Hindi, Portuguese, Russian, and many more!
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default TranslatorPage;
