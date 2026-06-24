import React from 'react';
import { motion } from 'framer-motion';
import { Presentation } from 'lucide-react';
import { MainLayout } from '../layouts/MainLayout';
import { FileUpload } from '../components/common/FileUpload';
import { Button } from '../components/common/Button';
import { PDFService } from '../services/pdfService';

const buildPptHtml = (title: string, images: Array<{ page: number; dataUrl: string }>): string => {
  const slides = images
    .map(
      (img) => `
      <div style="page-break-after: always; width: 1280px; height: 720px; display: flex; flex-direction: column; justify-content: center; align-items: center; background: #ffffff;">
        <h2 style="font-family: Arial, sans-serif; font-size: 24px; margin: 0 0 16px 0; color: #111827;">Page ${img.page}</h2>
        <img src="${img.dataUrl}" style="max-width: 1180px; max-height: 620px; object-fit: contain; border: 1px solid #e5e7eb;" />
      </div>`
    )
    .join('\n');

  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<title>${title}</title>
</head>
<body style="margin: 0; padding: 0; background: #f3f4f6;">${slides}</body>
</html>`;
};

export const PDFToPPTPage: React.FC = () => {
  const [file, setFile] = React.useState<File | null>(null);
  const [isConverting, setIsConverting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [slideCount, setSlideCount] = React.useState(0);

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleFilesSelected = (newFiles: File[]) => {
    setFile(newFiles[0] ?? null);
    setError(null);
    setSlideCount(0);
  };

  const handleConvert = async () => {
    if (!file) {
      setError('Please upload a PDF first.');
      return;
    }

    try {
      setIsConverting(true);
      setError(null);

      const images = await PDFService.convertPDFToImages(file);
      setSlideCount(images.length);

      const title = file.name.replace(/\.pdf$/i, '') || 'presentation';
      const html = buildPptHtml(title, images);
      const blob = new Blob([html], { type: 'application/vnd.ms-powerpoint' });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `${title}.ppt`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      setError('Failed to convert PDF to PowerPoint.');
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <MainLayout>
      <div className="min-h-screen pt-20 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-bold mb-4 text-gray-900 dark:text-white">PDF to PowerPoint</h1>
            <p className="text-xl text-gray-600 dark:text-gray-400">Convert each PDF page into a presentation slide</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-8">
            <FileUpload onFilesSelected={handleFilesSelected} accept=".pdf" maxSize={500 * 1024 * 1024} />
          </motion.div>

          {file && (
            <Button
              size="lg"
              icon={<Presentation className="w-5 h-5" />}
              onClick={handleConvert}
              loading={isConverting}
            >
              Convert & Download PPT
            </Button>
          )}

          {slideCount > 0 && !isConverting && (
            <p className="mt-4 text-sm text-green-700 dark:text-green-400">Created {slideCount} slides.</p>
          )}

          {error && <p className="mt-4 text-sm text-red-600 dark:text-red-400">{error}</p>}

          <div className="mt-8 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
            <p className="text-sm text-amber-800 dark:text-amber-300">
              This creates image-based slides for reliable visual fidelity. Text may not be directly editable inside PowerPoint.
            </p>
          </div>

          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-900">
            <p className="text-sm text-blue-800 dark:text-blue-300">
              Tip: If PowerPoint warns about compatibility, open the file and use Save As to modern .pptx format.
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};
