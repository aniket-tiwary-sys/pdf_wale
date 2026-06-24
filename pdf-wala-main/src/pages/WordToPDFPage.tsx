import React from 'react';
import { motion } from 'framer-motion';
import { FileText } from 'lucide-react';
import { MainLayout } from '../layouts/MainLayout';
import { FileUpload } from '../components/common/FileUpload';
import { Button } from '../components/common/Button';
import { PDFService } from '../services/pdfService';

const formatMB = (bytes: number): string => `${(bytes / 1024 / 1024).toFixed(2)} MB`;

const stripHtml = (value: string): string =>
  value
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/\s+/g, ' ')
    .trim();

export const WordToPDFPage: React.FC = () => {
  const [file, setFile] = React.useState<File | null>(null);
  const [isConverting, setIsConverting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleFileSelected = (newFiles: File[]) => {
    const selected = newFiles[0] ?? null;
    setFile(selected);
    setError(null);
  };

  const handleConvert = async () => {
    if (!file) {
      setError('Please upload a file first.');
      return;
    }

    try {
      setIsConverting(true);
      setError(null);

      const rawText = await file.text();
      const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
      const text = ext === 'html' || ext === 'htm' ? stripHtml(rawText) : rawText;

      if (!text.trim()) {
        setError('No readable text found in this file.');
        return;
      }

      const pdfBlob = await PDFService.textToPDF(text);
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = file.name.replace(/\.[^/.]+$/, '') + '.pdf';
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      setError('Failed to convert this file. Please use .txt, .md, or .html for best results.');
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <MainLayout>
      <div className="min-h-screen pt-20 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-bold mb-4 text-gray-900 dark:text-white">Word to PDF</h1>
            <p className="text-xl text-gray-600 dark:text-gray-400">Convert text-based documents to PDF</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-8">
            <FileUpload
              onFilesSelected={handleFileSelected}
              accept=".txt,.md,.html,.htm,.doc,.docx"
              maxSize={100 * 1024 * 1024}
            />
          </motion.div>

          {file && (
            <div className="mb-6 p-4 bg-white dark:bg-dark-800 rounded-lg border border-gray-200 dark:border-dark-700">
              <p className="font-medium text-gray-900 dark:text-white">{file.name}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{formatMB(file.size)}</p>
            </div>
          )}

          {file && (
            <Button size="lg" icon={<FileText className="w-5 h-5" />} onClick={handleConvert} loading={isConverting}>
              Convert & Download PDF
            </Button>
          )}

          {error && <p className="mt-4 text-sm text-red-600 dark:text-red-400">{error}</p>}

          <div className="mt-8 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
            <p className="text-sm text-amber-800 dark:text-amber-300">
              Best results: .txt, .md, .html. Native .doc/.docx binary layout parsing is limited in this browser-only converter.
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};
