import React from 'react';
import { motion } from 'framer-motion';
import { Download, Scissors } from 'lucide-react';
import { MainLayout } from '../layouts/MainLayout';
import { FileUpload } from '../components/common/FileUpload';
import { Button } from '../components/common/Button';
import { PDFService } from '../services/pdfService';

type PageThumb = { page: number; image: string };

export const ExtractPagesPage: React.FC = () => {
  const [file, setFile] = React.useState<File | null>(null);
  const [thumbs, setThumbs] = React.useState<PageThumb[]>([]);
  const [selectedPages, setSelectedPages] = React.useState<number[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isExtracting, setIsExtracting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleFilesSelected = async (files: File[]) => {
    const selected = files[0] ?? null;
    setFile(selected);
    setThumbs([]);
    setSelectedPages([]);
    setError(null);

    if (!selected) return;

    try {
      setIsLoading(true);
      const count = await PDFService.getPDFPageCount(selected);
      const list: PageThumb[] = [];
      for (let p = 1; p <= count; p += 1) {
        const image = await PDFService.renderPDFPageToImage(selected, p, 0.5);
        list.push({ page: p, image });
      }
      setThumbs(list);
    } catch (err) {
      console.error(err);
      setError('Failed to load PDF pages.');
    } finally {
      setIsLoading(false);
    }
  };

  const togglePage = (page: number) => {
    setSelectedPages((prev) =>
      prev.includes(page) ? prev.filter((p) => p !== page) : [...prev, page]
    );
  };

  const handleExtract = async () => {
    if (!file) {
      setError('Please upload a PDF first.');
      return;
    }
    if (selectedPages.length === 0) {
      setError('Select at least one page to extract.');
      return;
    }

    try {
      setIsExtracting(true);
      setError(null);
      const blob = await PDFService.extractPDFPages(file, selectedPages);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name.replace(/\.pdf$/i, '') + '-extracted.pdf';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      setError('Failed to extract selected pages.');
    } finally {
      setIsExtracting(false);
    }
  };

  return (
    <MainLayout>
      <div className="min-h-screen pt-20 pb-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-bold mb-4 text-gray-900 dark:text-white">Extract Pages</h1>
            <p className="text-xl text-gray-600 dark:text-gray-400">Select pages visually and export only what you need</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-8">
            <FileUpload onFilesSelected={handleFilesSelected} accept=".pdf" maxSize={500 * 1024 * 1024} />
          </motion.div>

          {isLoading && <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">Loading pages...</p>}

          {thumbs.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {thumbs.map((thumb) => {
                const selected = selectedPages.includes(thumb.page);
                return (
                  <button
                    key={thumb.page}
                    onClick={() => togglePage(thumb.page)}
                    className={`text-left p-3 rounded-xl border transition-all ${
                      selected
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                        : 'border-gray-200 dark:border-dark-700 bg-white dark:bg-dark-800'
                    }`}
                  >
                    <img src={thumb.image} alt={`Page ${thumb.page}`} className="w-full rounded border border-gray-200 dark:border-dark-700" />
                    <p className="mt-2 font-medium text-gray-900 dark:text-white">Page {thumb.page}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{selected ? 'Selected for extraction' : 'Click to select'}</p>
                  </button>
                );
              })}
            </div>
          )}

          {thumbs.length > 0 && (
            <div className="flex gap-3">
              <Button size="lg" icon={<Scissors className="w-5 h-5" />} onClick={handleExtract} loading={isExtracting}>
                Extract Selected ({selectedPages.length})
              </Button>
              <Button
                size="lg"
                variant="secondary"
                icon={<Download className="w-5 h-5" />}
                onClick={() => setSelectedPages([])}
                disabled={isExtracting || selectedPages.length === 0}
              >
                Clear Selection
              </Button>
            </div>
          )}

          {error && <p className="mt-4 text-sm text-red-600 dark:text-red-400">{error}</p>}
        </div>
      </div>
    </MainLayout>
  );
};
