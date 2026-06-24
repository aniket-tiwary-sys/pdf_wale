import React from 'react';
import { motion } from 'framer-motion';
import { Scissors } from 'lucide-react';
import { MainLayout } from '../layouts/MainLayout';
import { FileUpload } from '../components/common/FileUpload';
import { Button } from '../components/common/Button';
import { PDFService } from '../services/pdfService';

const parsePageInput = (input: string, maxPages: number): number[] => {
  const values = new Set<number>();
  const chunks = input.split(',').map((s) => s.trim()).filter(Boolean);

  for (const chunk of chunks) {
    if (chunk.includes('-')) {
      const [startRaw, endRaw] = chunk.split('-').map((s) => Number(s.trim()));
      if (!Number.isFinite(startRaw) || !Number.isFinite(endRaw)) continue;
      const start = Math.min(startRaw, endRaw);
      const end = Math.max(startRaw, endRaw);
      for (let i = start; i <= end; i += 1) {
        if (i >= 1 && i <= maxPages) values.add(i);
      }
    } else {
      const num = Number(chunk);
      if (Number.isFinite(num) && num >= 1 && num <= maxPages) values.add(num);
    }
  }

  return Array.from(values).sort((a, b) => a - b);
};

export const SplitPDFPage: React.FC = () => {
  const [file, setFile] = React.useState<File | null>(null);
  const [pageCount, setPageCount] = React.useState<number>(0);
  const [pageInput, setPageInput] = React.useState<string>('');
  const [isSplitting, setIsSplitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleFilesSelected = async (newFiles: File[]) => {
    const selected = newFiles[0] ?? null;
    setFile(selected);
    setError(null);

    if (!selected) return;
    try {
      const pages = await PDFService.getPDFPageCount(selected);
      setPageCount(pages);
      setPageInput(`1-${pages}`);
    } catch (err) {
      console.error(err);
      setError('Unable to read this PDF. Please upload a valid file.');
    }
  };

  const handleSplit = async () => {
    if (!file) {
      setError('Please upload a PDF first.');
      return;
    }

    const pages = parsePageInput(pageInput, pageCount);
    if (pages.length === 0) {
      setError('Enter valid pages like 1,3-5');
      return;
    }

    try {
      setIsSplitting(true);
      setError(null);
      const outputs = await PDFService.splitPDFToSinglePageFiles(file, pages);
      const baseName = file.name.replace(/\.pdf$/i, '');

      outputs.forEach((output) => {
        const url = URL.createObjectURL(output.blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${baseName}-page-${output.pageNumber}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      });
    } catch (err) {
      console.error(err);
      setError('Failed to split PDF. Please try again.');
    } finally {
      setIsSplitting(false);
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
              Split PDF
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Split one PDF into separate page files
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <FileUpload
              onFilesSelected={handleFilesSelected}
              accept=".pdf"
              maxSize={500 * 1024 * 1024}
            />
          </motion.div>

          {file && (
            <div className="p-6 bg-white dark:bg-dark-800 rounded-xl border border-gray-200 dark:border-dark-700 space-y-4">
              <p className="text-gray-900 dark:text-white font-medium">
                File: {file.name} ({pageCount} pages)
              </p>
              <label className="block">
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Pages to split (example: 1,3-5)
                </span>
                <input
                  value={pageInput}
                  onChange={(e) => setPageInput(e.target.value)}
                  className="mt-2 w-full rounded-lg border border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-900 px-4 py-2 text-gray-900 dark:text-white"
                />
              </label>
              <Button
                size="lg"
                icon={<Scissors className="w-5 h-5" />}
                onClick={handleSplit}
                loading={isSplitting}
              >
                Split & Download
              </Button>
            </div>
          )}

          {error && (
            <p className="mt-4 text-sm text-red-600 dark:text-red-400">{error}</p>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

