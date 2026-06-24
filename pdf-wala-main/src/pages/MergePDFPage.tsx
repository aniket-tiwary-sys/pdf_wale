import React from 'react';
import { motion } from 'framer-motion';
import { MainLayout } from '../layouts/MainLayout';
import { FileUpload } from '../components/common/FileUpload';
import { Button } from '../components/common/Button';
import { Download } from 'lucide-react';
import { PDFService } from '../services/pdfService';

export const MergePDFPage: React.FC = () => {
  const [files, setFiles] = React.useState<File[]>([]);
  const [isMerging, setIsMerging] = React.useState(false);
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

  const handleMerge = async () => {
    if (files.length < 2) {
      setError('Please select at least 2 PDF files to merge.');
      return;
    }

    try {
      setIsMerging(true);
      setError(null);
      const mergedBlob = await PDFService.mergePDFs(files);
      const url = URL.createObjectURL(mergedBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'merged.pdf';
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      setError('Failed to merge PDFs. Please check your files and try again.');
    } finally {
      setIsMerging(false);
    }
  };

  return (
    <MainLayout>
      <div className="min-h-screen pt-20 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-4 text-gray-900 dark:text-white">
              Merge PDF
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Combine multiple PDF files into one seamlessly
            </p>
          </motion.div>

          {/* Upload Area */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <FileUpload
              onFilesSelected={handleFilesSelected}
              accept=".pdf"
              multiple
              maxSize={500 * 1024 * 1024}
            />
          </motion.div>

          {/* Files List */}
          {files.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Selected Files ({files.length})
              </h2>
              <div className="space-y-2">
                {files.map((file, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-4 bg-white dark:bg-dark-800 rounded-lg border border-gray-200 dark:border-dark-700"
                  >
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {idx + 1}. {file.name}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
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
            </motion.div>
          )}

          {/* Action Buttons */}
          {files.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-4"
            >
              <Button
                size="lg"
                icon={<Download className="w-5 h-5" />}
                onClick={handleMerge}
                loading={isMerging}
              >
                Merge PDFs
              </Button>
              <Button
                size="lg"
                variant="secondary"
                onClick={() => {
                  setFiles([]);
                  setError(null);
                }}
                disabled={isMerging}
              >
                Clear
              </Button>
            </motion.div>
          )}

          {error && (
            <p className="mt-4 text-sm text-red-600 dark:text-red-400">{error}</p>
          )}

          {/* Info Box */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-12 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-900"
          >
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              ℹ️ How it works
            </h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400 list-disc list-inside">
              <li>Select multiple PDF files</li>
              <li>Arrange them in the desired order</li>
              <li>Click "Merge PDFs" to combine them</li>
              <li>Download your merged PDF file</li>
            </ul>
          </motion.div>
        </div>
      </div>
    </MainLayout>
  );
};
