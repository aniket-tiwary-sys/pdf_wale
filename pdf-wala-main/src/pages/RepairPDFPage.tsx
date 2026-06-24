import React from 'react';
import { motion } from 'framer-motion';
import { Wrench, Download } from 'lucide-react';
import { MainLayout } from '../layouts/MainLayout';
import { FileUpload } from '../components/common/FileUpload';
import { Button } from '../components/common/Button';
import { PDFService } from '../services/pdfService';

export const RepairPDFPage: React.FC = () => {
  const [file, setFile] = React.useState<File | null>(null);
  const [isRepairing, setIsRepairing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [result, setResult] = React.useState<{ pageCount: number; oldSize: number; newSize: number } | null>(null);

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleFilesSelected = (files: File[]) => {
    setFile(files[0] ?? null);
    setError(null);
    setResult(null);
  };

  const handleRepair = async () => {
    if (!file) {
      setError('Please upload a PDF first.');
      return;
    }

    try {
      setIsRepairing(true);
      setError(null);
      const repaired = await PDFService.repairPDF(file);
      const url = URL.createObjectURL(repaired.blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = file.name.replace(/\.pdf$/i, '') + '-repaired.pdf';
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);

      setResult({
        pageCount: repaired.pageCount,
        oldSize: file.size,
        newSize: repaired.blob.size,
      });
    } catch (err) {
      console.error(err);
      setError('Repair failed. The PDF may be severely damaged or encrypted.');
    } finally {
      setIsRepairing(false);
    }
  };

  return (
    <MainLayout>
      <div className="min-h-screen pt-20 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-bold mb-4 text-gray-900 dark:text-white">Repair PDF</h1>
            <p className="text-xl text-gray-600 dark:text-gray-400">Fix common PDF structural problems and re-export a clean file</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-8">
            <FileUpload onFilesSelected={handleFilesSelected} accept=".pdf" maxSize={500 * 1024 * 1024} />
          </motion.div>

          {file && (
            <div className="flex gap-3">
              <Button size="lg" icon={<Wrench className="w-5 h-5" />} onClick={handleRepair} loading={isRepairing}>
                Repair & Download
              </Button>
            </div>
          )}

          {result && (
            <div className="mt-6 p-4 rounded-xl border border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-900/20">
              <p className="font-semibold text-green-800 dark:text-green-300">Repair completed</p>
              <p className="text-sm text-green-700 dark:text-green-400 mt-1">Pages: {result.pageCount}</p>
              <p className="text-sm text-green-700 dark:text-green-400">Size: {(result.oldSize / 1024 / 1024).toFixed(2)} MB → {(result.newSize / 1024 / 1024).toFixed(2)} MB</p>
            </div>
          )}

          {error && <p className="mt-4 text-sm text-red-600 dark:text-red-400">{error}</p>}

          <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-900">
            <p className="text-sm text-blue-800 dark:text-blue-300">
              This repair mode rebuilds PDF objects and streams. It can fix many open/save errors but not all severe corruption cases.
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};
