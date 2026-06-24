import React from 'react';
import { motion } from 'framer-motion';
import { Download, Zap } from 'lucide-react';
import { MainLayout } from '../layouts/MainLayout';
import { FileUpload } from '../components/common/FileUpload';
import { Button } from '../components/common/Button';
import { PDFService } from '../services/pdfService';

const formatMB = (bytes: number): string => `${(bytes / 1024 / 1024).toFixed(2)} MB`;

export const CompressPDFPage: React.FC = () => {
  const [file, setFile] = React.useState<File | null>(null);
  const [compressedBlob, setCompressedBlob] = React.useState<Blob | null>(null);
  const [isCompressing, setIsCompressing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleFileSelected = (newFiles: File[]) => {
    const selected = newFiles[0] ?? null;
    setFile(selected);
    setCompressedBlob(null);
    setError(null);
  };

  const handleCompress = async () => {
    if (!file) {
      setError('Please upload a PDF first.');
      return;
    }

    try {
      setIsCompressing(true);
      setError(null);
      const output = await PDFService.compressPDF(file);
      setCompressedBlob(output);
    } catch (err) {
      console.error(err);
      setError('Failed to compress PDF. Please try another file.');
    } finally {
      setIsCompressing(false);
    }
  };

  const handleDownload = () => {
    if (!compressedBlob || !file) return;

    const url = URL.createObjectURL(compressedBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = file.name.replace(/\.pdf$/i, '') + '-compressed.pdf';
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const reduction =
    file && compressedBlob
      ? Math.max(0, ((file.size - compressedBlob.size) / file.size) * 100)
      : 0;

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
              Compress PDF
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Reduce PDF size while preserving readability
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <FileUpload
              onFilesSelected={handleFileSelected}
              accept=".pdf"
              maxSize={500 * 1024 * 1024}
            />
          </motion.div>

          {file && (
            <div className="mb-8 p-4 bg-white dark:bg-dark-800 rounded-lg border border-gray-200 dark:border-dark-700">
              <p className="font-medium text-gray-900 dark:text-white">{file.name}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Original size: {formatMB(file.size)}</p>
            </div>
          )}

          {compressedBlob && file && (
            <div className="mb-8 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-900 space-y-1">
              <p className="font-medium text-green-800 dark:text-green-300">Compression complete</p>
              <p className="text-sm text-green-700 dark:text-green-400">Compressed size: {formatMB(compressedBlob.size)}</p>
              <p className="text-sm text-green-700 dark:text-green-400">Reduction: {reduction.toFixed(1)}%</p>
            </div>
          )}

          {file && (
            <div className="flex gap-4">
              <Button
                size="lg"
                icon={<Zap className="w-5 h-5" />}
                onClick={handleCompress}
                loading={isCompressing}
              >
                Compress PDF
              </Button>

              <Button
                size="lg"
                variant="secondary"
                icon={<Download className="w-5 h-5" />}
                onClick={handleDownload}
                disabled={!compressedBlob || isCompressing}
              >
                Download
              </Button>
            </div>
          )}

          {error && <p className="mt-4 text-sm text-red-600 dark:text-red-400">{error}</p>}
        </div>
      </div>
    </MainLayout>
  );
};
