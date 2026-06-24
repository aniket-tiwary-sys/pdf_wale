import React from 'react';
import { motion } from 'framer-motion';
import { Download, FileText } from 'lucide-react';
import { MainLayout } from '../layouts/MainLayout';
import { FileUpload } from '../components/common/FileUpload';
import { Button } from '../components/common/Button';
import { PDFService } from '../services/pdfService';
import { OCRService } from '../services/ocrService';

const escapeHtml = (value: string): string =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');

export const PDFToWordPage: React.FC = () => {
  const [file, setFile] = React.useState<File | null>(null);
  const [isConverting, setIsConverting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [preview, setPreview] = React.useState('');
  const [mode, setMode] = React.useState<'auto' | 'native' | 'ocr'>('auto');
  const [status, setStatus] = React.useState('');

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleFilesSelected = (newFiles: File[]) => {
    const selected = newFiles[0] ?? null;
    setFile(selected);
    setPreview('');
    setError(null);
  };

  const handleConvert = async () => {
    if (!file) {
      setError('Please upload a PDF first.');
      return;
    }

    try {
      setIsConverting(true);
      setError(null);
      setStatus('Reading PDF...');

      const extractWithOCR = async () => {
        const pageCount = await PDFService.getPDFPageCount(file);
        let ocrText = '';
        for (let i = 1; i <= pageCount; i += 1) {
          setStatus(`Running OCR on page ${i}/${pageCount}...`);
          const dataUrl = await PDFService.renderPDFPageToImage(file, i, 2);
          const pageText = await OCRService.extractTextFromImageURL(dataUrl);
          ocrText += `Page ${i}\n${pageText.trim()}\n\n`;
        }
        return ocrText.trim();
      };

      let text = '';
      if (mode === 'native') {
        text = await PDFService.extractTextFromPDF(file);
      } else if (mode === 'ocr') {
        text = await extractWithOCR();
      } else {
        text = await PDFService.extractTextFromPDF(file);
        if (text.replace(/\s+/g, '').length < 80) {
          setStatus('Low native text detected. Switching to OCR...');
          text = await extractWithOCR();
        }
      }

      setPreview(text);

      const htmlDoc = `<!doctype html><html><head><meta charset="utf-8"></head><body>${escapeHtml(text)
        .split('\n')
        .map((line) => `<p>${line || '&nbsp;'}</p>`)
        .join('')}</body></html>`;

      const blob = new Blob([htmlDoc], { type: 'application/msword' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = file.name.replace(/\.pdf$/i, '') + '.doc';
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      setStatus('Done');
    } catch (err) {
      console.error(err);
      setError('Failed to convert PDF to Word. Try another PDF.');
      setStatus('');
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <MainLayout>
      <div className="min-h-screen pt-20 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-4 text-gray-900 dark:text-white">
              PDF to Word
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Convert PDF text content into a Word document
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <FileUpload onFilesSelected={handleFilesSelected} accept=".pdf" maxSize={500 * 1024 * 1024} />
          </motion.div>

          {file && (
            <div className="mb-6 p-4 bg-white dark:bg-dark-800 rounded-lg border border-gray-200 dark:border-dark-700">
              <p className="font-medium text-gray-900 dark:text-white">{file.name}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Click convert to download a .doc file.</p>
            </div>
          )}

          {file && (
            <Button
              size="lg"
              icon={<FileText className="w-5 h-5" />}
              onClick={handleConvert}
              loading={isConverting}
            >
              Convert & Download DOC
            </Button>
          )}

          {file && (
            <div className="mt-4">
              <label className="text-sm text-gray-700 dark:text-gray-300">Extraction mode</label>
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value as 'auto' | 'native' | 'ocr')}
                className="mt-2 w-full rounded-lg border border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-900 px-3 py-2 text-gray-900 dark:text-white"
                disabled={isConverting}
              >
                <option value="auto">Auto (recommended)</option>
                <option value="native">Native text (faster)</option>
                <option value="ocr">OCR scan (better for scanned PDFs)</option>
              </select>
            </div>
          )}

          {error && <p className="mt-4 text-sm text-red-600 dark:text-red-400">{error}</p>}
          {status && <p className="mt-3 text-sm text-blue-600 dark:text-blue-400">{status}</p>}

          <div className="mt-8 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
            <p className="text-sm text-amber-800 dark:text-amber-300">
              This conversion is text-focused. Complex layout, tables, and exact formatting may differ from the original PDF.
            </p>
          </div>

          {preview && (
            <div className="mt-8 p-4 bg-white dark:bg-dark-800 rounded-lg border border-gray-200 dark:border-dark-700">
              <div className="flex items-center gap-2 mb-3 text-gray-900 dark:text-white font-medium">
                <Download className="w-4 h-4" />
                Extracted Text Preview
              </div>
              <textarea
                readOnly
                value={preview}
                className="w-full h-64 rounded-lg border border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-900 px-4 py-2 text-gray-900 dark:text-white"
              />
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};
