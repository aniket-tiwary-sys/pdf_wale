import * as PDFJS from 'pdfjs-dist';
import { PDFDocument } from 'pdf-lib';

// Set worker
PDFJS.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS.version}/pdf.worker.min.js`;

export const advancedPdfService = {
  // Extract text from PDF
  async extractText(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await PDFJS.getDocument(arrayBuffer).promise;
    let text = '';

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      text += textContent.items.map((item: any) => item.str).join(' ') + '\n';
    }

    return text;
  },

  // Get PDF metadata
  async getPdfMetadata(file: File) {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await PDFJS.getDocument(arrayBuffer).promise;
    const metadata = await pdf.getMetadata();

    return {
      title: metadata.info?.Title,
      author: metadata.info?.Author,
      subject: metadata.info?.Subject,
      pages: pdf.numPages,
      creationDate: metadata.info?.CreationDate,
    };
  },

  // Convert PDF page to image
  async pdfPageToImage(file: File, pageNum: number): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await PDFJS.getDocument(arrayBuffer).promise;
    const page = await pdf.getPage(pageNum);

    const viewport = page.getViewport({ scale: 2 });
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d')!;
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    await page.render({
      canvasContext: context,
      viewport,
    }).promise;

    return canvas.toDataURL('image/png');
  },

  // Merge PDFs
  async mergePdfs(files: File[]): Promise<Blob> {
    const mergedPdf = await PDFDocument.create();

    for (const file of files) {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer);
      const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
      copiedPages.forEach((page) => mergedPdf.addPage(page));
    }

    const pdfBytes = await mergedPdf.save();
    return new Blob([pdfBytes], { type: 'application/pdf' });
  },

  // Split PDF
  async splitPdf(file: File, pageRanges: number[][]): Promise<Blob[]> {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await PDFDocument.load(arrayBuffer);
    const splits: Blob[] = [];

    for (const range of pageRanges) {
      const newPdf = await PDFDocument.create();
      const [start, end] = range;
      const pages = await newPdf.copyPages(pdf, Array.from({ length: end - start + 1 }, (_, i) => start - 1 + i));
      pages.forEach((page) => newPdf.addPage(page));

      const pdfBytes = await newPdf.save();
      splits.push(new Blob([pdfBytes], { type: 'application/pdf' }));
    }

    return splits;
  },

  // Rotate PDF pages
  async rotatePdf(file: File, angle: number): Promise<Blob> {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await PDFDocument.load(arrayBuffer);

    pdf.getPages().forEach((page) => {
      page.setRotation((page.getRotation().angle + angle) % 360);
    });

    const pdfBytes = await pdf.save();
    return new Blob([pdfBytes], { type: 'application/pdf' });
  },

  // Add watermark to PDF
  async addWatermark(file: File, text: string): Promise<Blob> {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await PDFDocument.load(arrayBuffer);

    pdf.getPages().forEach((page) => {
      // Watermark implementation would go here
      // This is a placeholder
    });

    const pdfBytes = await pdf.save();
    return new Blob([pdfBytes], { type: 'application/pdf' });
  },
};
