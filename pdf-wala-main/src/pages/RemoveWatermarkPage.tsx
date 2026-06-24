import React from 'react';
import { motion } from 'framer-motion';
import { Download, Eraser } from 'lucide-react';
import { MainLayout } from '../layouts/MainLayout';
import { FileUpload } from '../components/common/FileUpload';
import { Button } from '../components/common/Button';
import { PDFService } from '../services/pdfService';

export const RemoveWatermarkPage: React.FC = () => {
  const [file, setFile] = React.useState<File | null>(null);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleFilesSelected = (files: File[]) => {
    setFile(files[0] ?? null);
    setError(null);
  };

  const handleRemove = async () => {
    if (!file) {
      setError('Please upload a PDF first.');
      return;
    }

    try {
      setIsProcessing(true);
      setError(null);
      const blob = await PDFService.removeCenterWatermark(file);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name.replace(/\.pdf$/i, '') + '-watermark-removed.pdf';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      setError('Failed to remove watermark.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <MainLayout>
      <div className="min-h-screen pt-20 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-bold mb-4 text-gray-900 dark:text-white">Remove Watermark</h1>
            <p className="text-xl text-gray-600 dark:text-gray-400">Clean common center watermarks from PDF pages</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-8">
            <FileUpload onFilesSelected={handleFilesSelected} accept=".pdf" maxSize={500 * 1024 * 1024} />
          </motion.div>

          {file && (
            <Button size="lg" icon={<Eraser className="w-5 h-5" />} onClick={handleRemove} loading={isProcessing}>
              Remove Watermark & Download
            </Button>
          )}

          {error && <p className="mt-4 text-sm text-red-600 dark:text-red-400">{error}</p>}

          <div className="mt-8 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
            <p className="text-sm text-amber-800 dark:text-amber-300">
              This uses a center-area cleanup mask and works best for common centered watermarks.
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};
