import React from 'react';
import { motion } from 'framer-motion';
import { ArrowDown, ArrowUp, Download } from 'lucide-react';
import { MainLayout } from '../layouts/MainLayout';
import { FileUpload } from '../components/common/FileUpload';
import { Button } from '../components/common/Button';
import { PDFService } from '../services/pdfService';

type PagePreview = { page: number; image: string };

export const RearrangePDFPage: React.FC = () => {
  const [file, setFile] = React.useState<File | null>(null);
  const [pageOrder, setPageOrder] = React.useState<number[]>([]);
  const [previews, setPreviews] = React.useState<Record<number, string>>({});
  const [isLoadingPreviews, setIsLoadingPreviews] = React.useState(false);
  const [isRearranging, setIsRearranging] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleFilesSelected = async (newFiles: File[]) => {
    const selected = newFiles[0] ?? null;
    setFile(selected);
    setError(null);
    setPageOrder([]);
    setPreviews({});

    if (!selected) return;

    try {
      setIsLoadingPreviews(true);
      const pageCount = await PDFService.getPDFPageCount(selected);
      const order = Array.from({ length: pageCount }, (_, i) => i + 1);
      setPageOrder(order);

      const nextPreviews: Record<number, string> = {};
      for (const pageNum of order) {
        const image = await PDFService.renderPDFPageToImage(selected, pageNum, 0.5);
        nextPreviews[pageNum] = image;
      }
      setPreviews(nextPreviews);
    } catch (err) {
      console.error(err);
      setError('Failed to load PDF pages. Please try another file.');
    } finally {
      setIsLoadingPreviews(false);
    }
  };

  const movePage = (index: number, direction: 'up' | 'down') => {
    setPageOrder((prev) => {
      const next = [...prev];
      const target = direction === 'up' ? index - 1 : index + 1;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const handleRearrange = async () => {
    if (!file || pageOrder.length === 0) {
      setError('Please upload a PDF first.');
      return;
    }

    try {
      setIsRearranging(true);
      setError(null);
      const blob = await PDFService.reorderPDFPages(file, pageOrder);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = file.name.replace(/\.pdf$/i, '') + '-rearranged.pdf';
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      setError('Failed to rearrange PDF. Please try again.');
    } finally {
      setIsRearranging(false);
    }
  };

  const orderedPreviews: PagePreview[] = pageOrder.map((page) => ({ page, image: previews[page] }));

  return (
    <MainLayout>
      <div className="min-h-screen pt-20 pb-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-bold mb-4 text-gray-900 dark:text-white">Rearrange Pages</h1>
            <p className="text-xl text-gray-600 dark:text-gray-400">Visually reorder your PDF pages and download the updated file</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-8">
            <FileUpload onFilesSelected={handleFilesSelected} accept=".pdf" maxSize={500 * 1024 * 1024} />
          </motion.div>

          {isLoadingPreviews && <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">Loading page previews...</p>}

          {orderedPreviews.length > 0 && (
            <div className="space-y-4 mb-8">
              {orderedPreviews.map((item, idx) => (
                <div key={`${item.page}-${idx}`} className="p-4 rounded-xl border border-gray-200 dark:border-dark-700 bg-white dark:bg-dark-800">
                  <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                    <img
                      src={item.image}
                      alt={`Page ${item.page}`}
                      className="w-full sm:w-40 rounded-lg border border-gray-200 dark:border-dark-700"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 dark:text-white">Page {item.page}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Position {idx + 1}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => movePage(idx, 'up')} disabled={idx === 0}>
                        <ArrowUp className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => movePage(idx, 'down')}
                        disabled={idx === orderedPreviews.length - 1}
                      >
                        <ArrowDown className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {orderedPreviews.length > 0 && (
            <Button size="lg" icon={<Download className="w-5 h-5" />} onClick={handleRearrange} loading={isRearranging}>
              Rearrange & Download PDF
            </Button>
          )}

          {error && <p className="mt-4 text-sm text-red-600 dark:text-red-400">{error}</p>}
        </div>
      </div>
    </MainLayout>
  );
};
