import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useAppStore } from './store/appStore';
import './styles/globals.css';

// Pages
import { HomePage } from './pages/HomePage';
import { ToolsHubPage } from './pages/ToolsHubPage';
import { DonatePage } from './pages/DonatePage';
import { ContactPage } from './pages/ContactPage';

import { AboutPage } from './pages/AboutPage';
import { BlogPage } from './pages/BlogPage';
import { MergePDFPage } from './pages/MergePDFPage';
import { SplitPDFPage } from './pages/SplitPDFPage';
import { CompressPDFPage } from './pages/CompressPDFPage';
import { PDFToImagePage } from './pages/PDFToImagePage';
import { ImageToPDFPage } from './pages/ImageToPDFPage';
import { PDFToWordPage } from './pages/PDFToWordPage';
import { WordToPDFPage } from './pages/WordToPDFPage';
import { PDFToExcelPage } from './pages/PDFToExcelPage';
import { ExcelToPDFPage } from './pages/ExcelToPDFPage';
import { PDFToPPTPage } from './pages/PDFToPPTPage';
import { PPTToPDFPage } from './pages/PPTToPDFPage';
import { RearrangePDFPage } from './pages/RearrangePDFPage';
import { DeletePagesPage } from './pages/DeletePagesPage';
import { ExtractPagesPage } from './pages/ExtractPagesPage';
import { RemoveWatermarkPage } from './pages/RemoveWatermarkPage';
import { CreatePDFPage } from './pages/CreatePDFPage';
import { RepairPDFPage } from './pages/RepairPDFPage';
import { ProtectPDFPage } from './pages/ProtectPDFPage';
import { ToolPage } from './pages/ToolPage';
import { TranslatorPage } from './pages/TranslatorPage';


import { ForgotPasswordPage } from './pages/ForgotPasswordPage';

function App() {
  const { theme } = useAppStore();

  useEffect(() => {
    // Handle theme
    const isDarkMode =
      theme === 'dark' ||
      (theme === 'system' &&
        window.matchMedia('(prefers-color-scheme: dark)').matches);

    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      if (theme === 'system') {
        if (e.matches) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  return (
    <Router>
      <Routes>
        {/* Main Pages */}
        <Route path="/" element={<HomePage />} />
        <Route path="/tools" element={<ToolsHubPage />} />

        <Route path="/blog" element={<BlogPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/donate" element={<DonatePage />} />


        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        {/* Tool Pages */}
        <Route path="/tools/merge-pdf" element={<MergePDFPage />} />
        <Route path="/tools/split-pdf" element={<SplitPDFPage />} />
        <Route path="/tools/compress-pdf" element={<CompressPDFPage />} />
        <Route path="/tools/pdf-to-image" element={<PDFToImagePage />} />
        <Route path="/tools/image-to-pdf" element={<ImageToPDFPage />} />
        <Route path="/tools/pdf-to-word" element={<PDFToWordPage />} />
        <Route path="/tools/word-to-pdf" element={<WordToPDFPage />} />
        <Route path="/tools/pdf-to-excel" element={<PDFToExcelPage />} />
        <Route path="/tools/excel-to-pdf" element={<ExcelToPDFPage />} />
        <Route path="/tools/pdf-to-ppt" element={<PDFToPPTPage />} />
        <Route path="/tools/ppt-to-pdf" element={<PPTToPDFPage />} />
        <Route path="/tools/rearrange-pages" element={<RearrangePDFPage />} />
        <Route path="/tools/delete-pages" element={<DeletePagesPage />} />
        <Route path="/tools/extract-pages" element={<ExtractPagesPage />} />
        <Route path="/tools/remove-watermark" element={<RemoveWatermarkPage />} />
        <Route path="/tools/create-pdf" element={<CreatePDFPage />} />
        <Route path="/tools/repair-pdf" element={<RepairPDFPage />} />
        <Route path="/tools/protect-pdf" element={<ProtectPDFPage />} />
        <Route path="/tools/translator" element={<TranslatorPage />} />
        <Route path="/tools/:toolId" element={<ToolPage />} />

        {/* 404 */}
        <Route path="*" element={<HomePage />} />
      </Routes>
    </Router>
  );
}

export default App;
