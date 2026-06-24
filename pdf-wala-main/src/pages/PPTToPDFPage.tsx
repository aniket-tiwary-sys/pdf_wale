import React from 'react';
import { motion } from 'framer-motion';
import { Presentation } from 'lucide-react';
import { MainLayout } from '../layouts/MainLayout';
import { FileUpload } from '../components/common/FileUpload';
import { Button } from '../components/common/Button';
import { PDFService } from '../services/pdfService';

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

export const PPTToPDFPage: React.FC = () => {
  const [file, setFile] = React.useState<File | null>(null);
  const [isConverting, setIsConverting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [preview, setPreview] = React.useState('');

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleFilesSelected = (newFiles: File[]) => {
    setFile(newFiles[0] ?? null);
    setError(null);
    setPreview('');
  };

  const handleConvert = async () => {
    if (!file) {
      setError('Please upload a PowerPoint file first.');
      return;
    }

    try {
      setIsConverting(true);
      setError(null);

      const raw = await file.text();
      const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
      const content = ext === 'html' || ext === 'htm' || raw.includes('<html') ? stripHtml(raw) : raw;

      if (!content.trim()) {
        setError('No readable content found. Export your slides to text/HTML first for best results.');
        return;
      }

      const pdfBlob = await PDFService.textToPDF(content);
      setPreview(content.slice(0, 3000));

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
      setError('Failed to convert PowerPoint to PDF.');
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <MainLayout>
      <div className="min-h-screen pt-20 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-bold mb-4 text-gray-900 dark:text-white">PowerPoint to PDF</h1>
            <p className="text-xl text-gray-600 dark:text-gray-400">Convert presentation content into a PDF document</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-8">
            <FileUpload onFilesSelected={handleFilesSelected} accept=".ppt,.pptx,.html,.htm,.txt" maxSize={200 * 1024 * 1024} />
          </motion.div>

          {file && (
            <Button size="lg" icon={<Presentation className="w-5 h-5" />} onClick={handleConvert} loading={isConverting}>
              Convert & Download PDF
            </Button>
          )}

          {error && <p className="mt-4 text-sm text-red-600 dark:text-red-400">{error}</p>}

          <div className="mt-8 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
            <p className="text-sm text-amber-800 dark:text-amber-300">
              Best results are with text/HTML exports. Complex binary .pptx slide layouts are limited in browser-only conversion.
            </p>
          </div>

          {preview && (
            <div className="mt-8 p-4 bg-white dark:bg-dark-800 rounded-lg border border-gray-200 dark:border-dark-700">
              <p className="font-medium text-gray-900 dark:text-white mb-2">Extracted Preview</p>
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
