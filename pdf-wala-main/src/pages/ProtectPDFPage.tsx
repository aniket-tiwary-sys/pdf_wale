import React from 'react';
import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';
import { MainLayout } from '../layouts/MainLayout';
import { FileUpload } from '../components/common/FileUpload';
import { Button } from '../components/common/Button';
import { PDFService } from '../services/pdfService';

const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
};

export const ProtectPDFPage: React.FC = () => {
  const [file, setFile] = React.useState<File | null>(null);
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const [isWorking, setIsWorking] = React.useState(false);

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleFilesSelected = (files: File[]) => {
    setFile(files[0] ?? null);
    setError(null);
  };

  const handleProtect = async () => {
    if (!file) {
      setError('Please upload a PDF first.');
      return;
    }
    if (!password || !confirmPassword) {
      setError('Please enter and confirm password.');
      return;
    }
    if (password.length < 6) {
      setError('Use at least 6 characters for a stronger password.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      setIsWorking(true);
      setError(null);
      const blob = await PDFService.protectPDF(file, password);
      const baseName = file.name.replace(/\.pdf$/i, '');
      downloadBlob(blob, `${baseName}-protected.pdf`);
    } catch (e) {
      console.error(e);
      setError('Failed to protect PDF. Please try another file.');
    } finally {
      setIsWorking(false);
    }
  };

  return (
    <MainLayout>
      <div className="min-h-screen pt-20 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-bold mb-4 text-gray-900 dark:text-white">Protect PDF</h1>
            <p className="text-xl text-gray-600 dark:text-gray-400">Add password protection to your PDF</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-8">
            <FileUpload onFilesSelected={handleFilesSelected} accept=".pdf" maxSize={500 * 1024 * 1024} />
          </motion.div>

          {file && (
            <div className="p-6 rounded-xl border border-gray-200 dark:border-dark-700 bg-white dark:bg-dark-800 space-y-4">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Set password"
                className="w-full rounded-lg border border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-900 px-4 py-2 text-gray-900 dark:text-white"
              />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm password"
                className="w-full rounded-lg border border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-900 px-4 py-2 text-gray-900 dark:text-white"
              />
              <Button size="lg" icon={<Lock className="w-5 h-5" />} onClick={handleProtect} loading={isWorking}>
                Protect PDF
              </Button>
            </div>
          )}

          {error && <p className="mt-4 text-sm text-red-600 dark:text-red-400">{error}</p>}
        </div>
      </div>
    </MainLayout>
  );
};
