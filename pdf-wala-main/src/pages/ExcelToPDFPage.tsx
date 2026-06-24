import React from 'react';
import { motion } from 'framer-motion';
import { FileSpreadsheet } from 'lucide-react';
import { MainLayout } from '../layouts/MainLayout';
import { FileUpload } from '../components/common/FileUpload';
import { Button } from '../components/common/Button';
import { PDFService } from '../services/pdfService';

const normalizeSpreadsheetText = (raw: string): string => {
  const lines = raw
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .split('\n')
    .filter((line) => line.trim().length > 0);

  return lines
    .map((line) => {
      const cells = line
        .split(/\t|,|;|\|/)
        .map((cell) => cell.trim())
        .filter((cell) => cell.length > 0);
      return cells.length ? cells.join('    ') : line.trim();
    })
    .join('\n');
};

export const ExcelToPDFPage: React.FC = () => {
  const [file, setFile] = React.useState<File | null>(null);
  const [isConverting, setIsConverting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [preview, setPreview] = React.useState('');

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleFilesSelected = (newFiles: File[]) => {
    const selected = newFiles[0] ?? null;
    setFile(selected);
    setError(null);
    setPreview('');
  };

  const handleConvert = async () => {
    if (!file) {
      setError('Please upload a spreadsheet file first.');
      return;
    }

    try {
      setIsConverting(true);
      setError(null);

      const raw = await file.text();
      const cleaned = normalizeSpreadsheetText(raw);

      if (!cleaned.trim()) {
        setError('No readable table text found. Try exporting your sheet as CSV first.');
        return;
      }

      const pdfBlob = await PDFService.textToPDF(cleaned);
      setPreview(cleaned.split('\n').slice(0, 20).join('\n'));

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
      setError('Failed to convert Excel to PDF. For best results, upload CSV/TSV text exports.');
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <MainLayout>
      <div className="min-h-screen pt-20 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-bold mb-4 text-gray-900 dark:text-white">Excel to PDF</h1>
            <p className="text-xl text-gray-600 dark:text-gray-400">Convert spreadsheet-style data into a clean PDF</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-8">
            <FileUpload
              onFilesSelected={handleFilesSelected}
              accept=".csv,.tsv,.xls,.xlsx"
              maxSize={100 * 1024 * 1024}
            />
          </motion.div>

          {file && (
            <Button size="lg" icon={<FileSpreadsheet className="w-5 h-5" />} onClick={handleConvert} loading={isConverting}>
              Convert & Download PDF
            </Button>
          )}

          {error && <p className="mt-4 text-sm text-red-600 dark:text-red-400">{error}</p>}

          <div className="mt-8 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
            <p className="text-sm text-amber-800 dark:text-amber-300">
              Best support is for CSV/TSV content. If your .xlsx has complex formatting, export to CSV first for better output.
            </p>
          </div>

          {preview && (
            <div className="mt-8 p-4 bg-white dark:bg-dark-800 rounded-lg border border-gray-200 dark:border-dark-700">
              <p className="font-medium text-gray-900 dark:text-white mb-2">Parsed Preview</p>
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
