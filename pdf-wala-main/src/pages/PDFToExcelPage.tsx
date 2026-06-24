import React from 'react';
import { motion } from 'framer-motion';
import { FileSpreadsheet } from 'lucide-react';
import { MainLayout } from '../layouts/MainLayout';
import { FileUpload } from '../components/common/FileUpload';
import { Button } from '../components/common/Button';
import { PDFService } from '../services/pdfService';

const toCSV = (text: string): string => {
  const lines = text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line && !/^Page\s+\d+$/i.test(line));

  const rows = lines.map((line) => {
    const cells = line
      .split(/\s{2,}|\t|\s\|\s|\|/)
      .map((cell) => cell.trim())
      .filter(Boolean);

    const safeCells = (cells.length > 1 ? cells : [line]).map((cell) =>
      `"${cell.replaceAll('"', '""')}"`
    );

    return safeCells.join(',');
  });

  return rows.join('\n');
};

export const PDFToExcelPage: React.FC = () => {
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
      setError('Please upload a PDF first.');
      return;
    }

    try {
      setIsConverting(true);
      setError(null);

      const text = await PDFService.extractTextFromPDF(file);
      const csv = toCSV(text);
      setPreview(csv.split('\n').slice(0, 20).join('\n'));

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = file.name.replace(/\.pdf$/i, '') + '.csv';
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      setError('Failed to convert PDF to Excel format.');
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <MainLayout>
      <div className="min-h-screen pt-20 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-bold mb-4 text-gray-900 dark:text-white">PDF to Excel</h1>
            <p className="text-xl text-gray-600 dark:text-gray-400">Extract table-like data and download as CSV</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-8">
            <FileUpload onFilesSelected={handleFilesSelected} accept=".pdf" maxSize={500 * 1024 * 1024} />
          </motion.div>

          {file && (
            <Button size="lg" icon={<FileSpreadsheet className="w-5 h-5" />} onClick={handleConvert} loading={isConverting}>
              Convert & Download CSV
            </Button>
          )}

          {error && <p className="mt-4 text-sm text-red-600 dark:text-red-400">{error}</p>}

          <div className="mt-8 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
            <p className="text-sm text-amber-800 dark:text-amber-300">
              This exports CSV (opens in Excel). Best with text-based table PDFs; complex scanned tables may need OCR-first cleanup.
            </p>
          </div>

          {preview && (
            <div className="mt-8 p-4 bg-white dark:bg-dark-800 rounded-lg border border-gray-200 dark:border-dark-700">
              <p className="font-medium text-gray-900 dark:text-white mb-2">CSV Preview</p>
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
