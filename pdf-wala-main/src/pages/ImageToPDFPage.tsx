import React from 'react';
import { motion } from 'framer-motion';
import { Download, FileText } from 'lucide-react';
import { MainLayout } from '../layouts/MainLayout';
import { FileUpload } from '../components/common/FileUpload';
import { Button } from '../components/common/Button';
import { PDFService } from '../services/pdfService';

const formatMB = (bytes: number): string => `${(bytes / 1024 / 1024).toFixed(2)} MB`;

export const ImageToPDFPage: React.FC = () => {
  const [files, setFiles] = React.useState<File[]>([]);
  const [isConverting, setIsConverting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleFilesSelected = (newFiles: File[]) => {
    setError(null);
    setFiles((prev) => [...prev, ...newFiles]);
  };

  const removeFile = (index: number) => {
    setError(null);
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleConvert = async () => {
    if (files.length === 0) {
      setError('Please select at least one image.');
      return;
    }

    try {
      setIsConverting(true);
      setError(null);
      const pdfBlob = await PDFService.imagesToPDF(files);
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'images-to-pdf.pdf';
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      setError('Failed to convert images to PDF. Please try valid JPG/PNG files.');
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
              Image to PDF
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Convert JPG and PNG images into a single PDF
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
              accept=".jpg,.jpeg,.png"
              multiple
              maxSize={100 * 1024 * 1024}
            />
          </motion.div>

          {files.length > 0 && (
            <div className="mb-8 space-y-2">
              {files.map((file, idx) => (
                <div
                  key={`${file.name}-${idx}`}
                  className="flex items-center justify-between p-4 bg-white dark:bg-dark-800 rounded-lg border border-gray-200 dark:border-dark-700"
                >
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {idx + 1}. {file.name}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {formatMB(file.size)}
                    </p>
                  </div>
                  <button
                    onClick={() => removeFile(idx)}
                    className="text-red-500 hover:text-red-600 font-medium"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}

          {files.length > 0 && (
            <div className="flex gap-4">
              <Button
                size="lg"
                icon={<FileText className="w-5 h-5" />}
                onClick={handleConvert}
                loading={isConverting}
              >
                Convert to PDF
              </Button>

              <Button
                size="lg"
                variant="secondary"
                icon={<Download className="w-5 h-5" />}
                onClick={() => {
                  setFiles([]);
                  setError(null);
                }}
                disabled={isConverting}
              >
                Clear
              </Button>
            </div>
          )}

          {error && <p className="mt-4 text-sm text-red-600 dark:text-red-400">{error}</p>}
        </div>
      </div>
    </MainLayout>
  );
};
