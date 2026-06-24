import React from 'react';
import { motion } from 'framer-motion';
import { Download, Image as ImageIcon } from 'lucide-react';
import { MainLayout } from '../layouts/MainLayout';
import { FileUpload } from '../components/common/FileUpload';
import { Button } from '../components/common/Button';
import { PDFService } from '../services/pdfService';

interface PageImage {
  page: number;
  dataUrl: string;
}

const downloadDataUrl = async (dataUrl: string, filename: string) => {
  const blob = await fetch(dataUrl).then((res) => res.blob());
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

export const PDFToImagePage: React.FC = () => {
  const [file, setFile] = React.useState<File | null>(null);
  const [images, setImages] = React.useState<PageImage[]>([]);
  const [isConverting, setIsConverting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleFileSelected = (newFiles: File[]) => {
    const selected = newFiles[0] ?? null;
    setFile(selected);
    setImages([]);
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
      const result = await PDFService.convertPDFToImages(file);
      setImages(result);
    } catch (err) {
      console.error(err);
      setError('Failed to convert PDF. Please try another file.');
    } finally {
      setIsConverting(false);
    }
  };

  const baseName = file?.name.replace(/\.pdf$/i, '') || 'pdf';

  const handleDownloadAll = async () => {
    for (const img of images) {
      await downloadDataUrl(img.dataUrl, `${baseName}-page-${img.page}.png`);
    }
  };

  return (
    <MainLayout>
      <div className="min-h-screen pt-20 pb-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-4 text-gray-900 dark:text-white">
              PDF to Image
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Convert each PDF page into a PNG image
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
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          )}

          {file && (
            <div className="flex gap-4 mb-8">
              <Button
                size="lg"
                icon={<ImageIcon className="w-5 h-5" />}
                onClick={handleConvert}
                loading={isConverting}
              >
                Convert to Images
              </Button>

              <Button
                size="lg"
                variant="secondary"
                icon={<Download className="w-5 h-5" />}
                onClick={handleDownloadAll}
                disabled={images.length === 0 || isConverting}
              >
                Download All
              </Button>
            </div>
          )}

          {error && <p className="mb-6 text-sm text-red-600 dark:text-red-400">{error}</p>}

          {images.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {images.map((img) => (
                <div
                  key={img.page}
                  className="p-4 bg-white dark:bg-dark-800 rounded-xl border border-gray-200 dark:border-dark-700"
                >
                  <p className="font-medium text-gray-900 dark:text-white mb-3">Page {img.page}</p>
                  <img
                    src={img.dataUrl}
                    alt={`Page ${img.page}`}
                    className="w-full rounded-lg border border-gray-200 dark:border-dark-700"
                  />
                  <Button
                    className="mt-3 w-full"
                    variant="outline"
                    icon={<Download className="w-4 h-4" />}
                    onClick={() => downloadDataUrl(img.dataUrl, `${baseName}-page-${img.page}.png`)}
                  >
                    Download Page {img.page}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};
