import * as pdfjsLib from 'pdfjs-dist';
import { PDFDocument, StandardFonts, degrees, rgb } from 'pdf-lib';
import { PDF } from '@libpdf/core';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

export class PDFService {
  private static asArrayBuffer(bytes: Uint8Array): ArrayBuffer {
    return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
  }

  static async getPDFPageCount(file: File): Promise<number> {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    return pdf.numPages;
  }

  static async extractPDFPages(file: File, pageNumbers: number[]): Promise<Blob> {
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    const newPdf = await PDFDocument.create();

    for (const pageNum of pageNumbers) {
      const [page] = await newPdf.copyPages(pdfDoc, [pageNum - 1]);
      newPdf.addPage(page);
    }

    const pdfBytes = await newPdf.save();
    return new Blob([this.asArrayBuffer(pdfBytes)], { type: 'application/pdf' });
  }

  static async splitPDFToSinglePageFiles(
    file: File,
    pageNumbers: number[]
  ): Promise<Array<{ pageNumber: number; blob: Blob }>> {
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    const totalPages = pdfDoc.getPageCount();
    const validPageNumbers = pageNumbers.filter((pageNum) => pageNum >= 1 && pageNum <= totalPages);

    const results: Array<{ pageNumber: number; blob: Blob }> = [];
    for (const pageNum of validPageNumbers) {
      const singlePdf = await PDFDocument.create();
      const [page] = await singlePdf.copyPages(pdfDoc, [pageNum - 1]);
      singlePdf.addPage(page);
      const pdfBytes = await singlePdf.save();
      results.push({
        pageNumber: pageNum,
        blob: new Blob([this.asArrayBuffer(pdfBytes)], { type: 'application/pdf' }),
      });
    }

    return results;
  }

  static async deletePDFPages(file: File, pageNumbers: number[]): Promise<Blob> {
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    const sortedPages = [...pageNumbers].sort((a, b) => b - a);

    for (const pageNum of sortedPages) {
      pdfDoc.removePage(pageNum - 1);
    }

    const pdfBytes = await pdfDoc.save();
    return new Blob([this.asArrayBuffer(pdfBytes)], { type: 'application/pdf' });
  }

  static async reorderPDFPages(file: File, pageNumbers: number[]): Promise<Blob> {
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    const newPdf = await PDFDocument.create();
    const total = pdfDoc.getPageCount();
    const validPages = pageNumbers.filter((p) => p >= 1 && p <= total);
    const copied = await newPdf.copyPages(
      pdfDoc,
      validPages.map((p) => p - 1)
    );
    copied.forEach((page) => newPdf.addPage(page));
    const pdfBytes = await newPdf.save();
    return new Blob([this.asArrayBuffer(pdfBytes)], { type: 'application/pdf' });
  }

  static async rotatePDFPages(file: File, pageNumbers: number[], angle: number): Promise<Blob> {
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);

    for (const pageNum of pageNumbers) {
      const page = pdfDoc.getPage(pageNum - 1);
      page.setRotation(degrees((page.getRotation().angle + angle) % 360));
    }

    const pdfBytes = await pdfDoc.save();
    return new Blob([this.asArrayBuffer(pdfBytes)], { type: 'application/pdf' });
  }

  static async mergePDFs(files: File[]): Promise<Blob> {
    const mergedPdf = await PDFDocument.create();

    for (const file of files) {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pageIndices = pdfDoc.getPageIndices();
      const pages = await mergedPdf.copyPages(pdfDoc, pageIndices);
      for (const page of pages) {
        mergedPdf.addPage(page);
      }
    }

    const pdfBytes = await mergedPdf.save();
    return new Blob([this.asArrayBuffer(pdfBytes)], { type: 'application/pdf' });
  }

  static async addWatermarkToPDF(file: File, watermarkText: string): Promise<Blob> {
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);

    for (const page of pdfDoc.getPages()) {
      const { width, height } = page.getSize();
      page.drawText(watermarkText, {
        x: width / 2 - 80,
        y: height / 2,
        size: 32,
        opacity: 0.25,
        color: rgb(0.5, 0.5, 0.5),
        rotate: degrees(25),
      });
    }

    const pdfBytes = await pdfDoc.save();
    return new Blob([this.asArrayBuffer(pdfBytes)], { type: 'application/pdf' });
  }

  static async signPDF(file: File, signature: string): Promise<Blob> {
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    const page = pdfDoc.getPages()[pdfDoc.getPageCount() - 1];
    const { width } = page.getSize();
    const signedAt = new Date().toLocaleString();
    const text = `Signed by: ${signature}\nDate: ${signedAt}`;

    page.drawRectangle({
      x: width - 230,
      y: 30,
      width: 200,
      height: 46,
      color: rgb(0.96, 0.96, 0.96),
      opacity: 1,
    });

    page.drawText(text, {
      x: width - 224,
      y: 58,
      size: 10,
      color: rgb(0.1, 0.1, 0.1),
      lineHeight: 12,
    });

    const pdfBytes = await pdfDoc.save();
    return new Blob([this.asArrayBuffer(pdfBytes)], { type: 'application/pdf' });
  }

  static async removeCenterWatermark(file: File): Promise<Blob> {
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);

    for (const page of pdfDoc.getPages()) {
      const { width, height } = page.getSize();
      const boxWidth = width * 0.72;
      const boxHeight = height * 0.22;
      const x = (width - boxWidth) / 2;
      const y = (height - boxHeight) / 2;

      // Practical masking approach for common centered text/image watermarks.
      page.drawRectangle({
        x,
        y,
        width: boxWidth,
        height: boxHeight,
        color: rgb(1, 1, 1),
        opacity: 1,
      });
    }

    const pdfBytes = await pdfDoc.save();
    return new Blob([this.asArrayBuffer(pdfBytes)], { type: 'application/pdf' });
  }

  static async renderPDFPageToImage(file: File, pageNumber: number, scale = 2): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const page = await pdf.getPage(pageNumber);

    const viewport = page.getViewport({ scale });
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    if (!context) throw new Error('Failed to get canvas context');

    canvas.width = viewport.width;
    canvas.height = viewport.height;

    await page.render({ canvasContext: context, viewport, canvas }).promise;
    return canvas.toDataURL('image/png');
  }

  static async convertPDFToImages(file: File): Promise<Array<{ page: number; dataUrl: string }>> {
    const pageCount = await this.getPDFPageCount(file);
    const images: Array<{ page: number; dataUrl: string }> = [];

    for (let i = 1; i <= pageCount; i += 1) {
      const dataUrl = await this.renderPDFPageToImage(file, i, 2);
      images.push({ page: i, dataUrl });
    }

    return images;
  }

  static async extractTextFromPDF(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let text = '';

    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
      const page = await pdf.getPage(pageNumber);
      const content = await page.getTextContent();
      const positioned = content.items
        .filter((item): item is any => 'str' in item && typeof item.str === 'string')
        .map((item: any) => ({
          text: item.str.trim(),
          x: item.transform?.[4] ?? 0,
          y: item.transform?.[5] ?? 0,
        }))
        .filter((item) => item.text.length > 0)
        .sort((a, b) => {
          if (Math.abs(b.y - a.y) > 2) return b.y - a.y;
          return a.x - b.x;
        });

      const lines: Array<{ y: number; parts: string[] }> = [];
      for (const item of positioned) {
        const line = lines.find((l) => Math.abs(l.y - item.y) <= 3);
        if (line) {
          line.parts.push(item.text);
        } else {
          lines.push({ y: item.y, parts: [item.text] });
        }
      }

      lines.sort((a, b) => b.y - a.y);
      const pageText = lines.map((line) => line.parts.join(' ').replace(/\s+/g, ' ').trim()).join('\n');
      text += `Page ${pageNumber}\n${pageText}\n\n`;
    }

    return text.trim();
  }

  static async imagesToPDF(files: File[]): Promise<Blob> {
    const pdfDoc = await PDFDocument.create();

    for (const file of files) {
      const bytes = await file.arrayBuffer();
      let image;
      if (file.type.includes('png')) {
        image = await pdfDoc.embedPng(bytes);
      } else {
        image = await pdfDoc.embedJpg(bytes);
      }

      const page = pdfDoc.addPage([image.width, image.height]);
      page.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height });
    }

    const pdfBytes = await pdfDoc.save();
    return new Blob([pdfBytes], { type: 'application/pdf' });
  }

  static async compressPDF(file: File): Promise<Blob> {
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    const pdfBytes = await pdfDoc.save({ useObjectStreams: true, addDefaultPage: false });
    return new Blob([this.asArrayBuffer(pdfBytes)], { type: 'application/pdf' });
  }

  static async repairPDF(file: File): Promise<{ blob: Blob; pageCount: number }> {
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });

    // Rewriting object streams and metadata often resolves minor structural issues.
    const bytes = await pdfDoc.save({
      useObjectStreams: true,
      addDefaultPage: false,
      updateFieldAppearances: true,
    });

    return {
      blob: new Blob([this.asArrayBuffer(bytes)], { type: 'application/pdf' }),
      pageCount: pdfDoc.getPageCount(),
    };
  }

  static async protectPDF(file: File, password: string): Promise<Blob> {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await PDF.load(new Uint8Array(arrayBuffer));

    pdf.setProtection({
      userPassword: password,
      algorithm: 'AES-256',
    });

    const bytes = await pdf.save();
    return new Blob([this.asArrayBuffer(bytes)], { type: 'application/pdf' });
  }

  static async unlockPDF(file: File, password: string): Promise<Blob> {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await PDF.load(new Uint8Array(arrayBuffer), { credentials: password });

    if (pdf.isEncrypted && !pdf.isAuthenticated) {
      throw new Error('Invalid password');
    }

    if (pdf.isEncrypted) {
      pdf.removeProtection();
    }

    const bytes = await pdf.save();
    return new Blob([this.asArrayBuffer(bytes)], { type: 'application/pdf' });
  }

  static async textToPDF(text: string): Promise<Blob> {
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    const fontSize = 11;
    const margin = 50;
    const pageWidth = 595.28; // A4
    const pageHeight = 841.89; // A4
    const lineHeight = 16;
    const maxWidth = pageWidth - margin * 2;

    const words = text.replace(/\r\n/g, '\n').split('\n').flatMap((line) => {
      if (!line.trim()) return ['\n'];
      return [line];
    });

    let page = pdfDoc.addPage([pageWidth, pageHeight]);
    let y = pageHeight - margin;

    const pushLine = (line: string) => {
      if (y <= margin) {
        page = pdfDoc.addPage([pageWidth, pageHeight]);
        y = pageHeight - margin;
      }
      page.drawText(line, { x: margin, y, size: fontSize, font, color: rgb(0, 0, 0) });
      y -= lineHeight;
    };

    for (const line of words) {
      if (line === '\n') {
        y -= lineHeight * 0.7;
        continue;
      }

      const tokens = line.split(/\s+/).filter(Boolean);
      let current = '';
      for (const token of tokens) {
        const candidate = current ? `${current} ${token}` : token;
        if (font.widthOfTextAtSize(candidate, fontSize) <= maxWidth) {
          current = candidate;
        } else {
          if (current) pushLine(current);
          current = token;
        }
      }
      if (current) pushLine(current);
    }

    const bytes = await pdfDoc.save();
    return new Blob([this.asArrayBuffer(bytes)], { type: 'application/pdf' });
  }

  static async createPDFFromSections(
    sections: Array<{ title: string; body: string }>
  ): Promise<Blob> {
    const pdfDoc = await PDFDocument.create();
    const titleFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const bodyFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

    const pageWidth = 595.28;
    const pageHeight = 841.89;
    const margin = 48;
    const titleSize = 20;
    const bodySize = 12;
    const lineHeight = 18;
    const maxWidth = pageWidth - margin * 2;

    const drawWrapped = (
      page: any,
      text: string,
      yStart: number,
      font: any,
      size: number
    ) => {
      let y = yStart;
      const lines = text.replace(/\r\n/g, '\n').split('\n');
      for (const rawLine of lines) {
        const words = rawLine.split(/\s+/).filter(Boolean);
        if (words.length === 0) {
          y -= lineHeight;
          continue;
        }
        let current = '';
        for (const word of words) {
          const candidate = current ? `${current} ${word}` : word;
          if (font.widthOfTextAtSize(candidate, size) <= maxWidth) {
            current = candidate;
          } else {
            page.drawText(current, { x: margin, y, size, font, color: rgb(0, 0, 0) });
            y -= lineHeight;
            current = word;
          }
        }
        if (current) {
          page.drawText(current, { x: margin, y, size, font, color: rgb(0, 0, 0) });
          y -= lineHeight;
        }
      }
      return y;
    };

    for (let i = 0; i < sections.length; i += 1) {
      const section = sections[i];
      let page = pdfDoc.addPage([pageWidth, pageHeight]);
      let y = pageHeight - margin;

      page.drawText(section.title || `Page ${i + 1}`, {
        x: margin,
        y,
        size: titleSize,
        font: titleFont,
        color: rgb(0.08, 0.08, 0.08),
      });
      y -= 32;

      y = drawWrapped(page, section.body || ' ', y, bodyFont, bodySize);

      while (y <= margin) {
        const overflowPage = pdfDoc.addPage([pageWidth, pageHeight]);
        y = pageHeight - margin;
        y = drawWrapped(overflowPage, '', y, bodyFont, bodySize);
        break;
      }
    }

    const bytes = await pdfDoc.save();
    return new Blob([this.asArrayBuffer(bytes)], { type: 'application/pdf' });
  }

  static async createPDFFromRichSections(
    sections: Array<{ title: string; html: string }>
  ): Promise<Blob> {
    const pdfDoc = await PDFDocument.create();
    const titleFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const serifFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);

    const pageWidth = 595.28;
    const pageHeight = 841.89;
    const margin = 48;
    const maxWidth = pageWidth - margin * 2;
    const lineHeight = 17;

    const addPage = () => pdfDoc.addPage([pageWidth, pageHeight]);
    let page = addPage();
    let y = pageHeight - margin;

    const ensureSpace = (minLines = 1) => {
      if (y <= margin + lineHeight * minLines) {
        page = addPage();
        y = pageHeight - margin;
      }
    };

    const drawWrapped = (
      text: string,
      font: any,
      size: number,
      color = rgb(0.1, 0.1, 0.1)
    ) => {
      const tokens = text.split(/\s+/).filter(Boolean);
      if (!tokens.length) {
        y -= lineHeight;
        return;
      }

      let line = '';
      for (const token of tokens) {
        const candidate = line ? `${line} ${token}` : token;
        if (font.widthOfTextAtSize(candidate, size) <= maxWidth) {
          line = candidate;
        } else {
          ensureSpace(2);
          page.drawText(line, { x: margin, y, size, font, color });
          y -= lineHeight;
          line = token;
        }
      }

      if (line) {
        ensureSpace(2);
        page.drawText(line, { x: margin, y, size, font, color });
        y -= lineHeight;
      }
    };

    const htmlToBlocks = (html: string): Array<{ text: string; style: 'h1' | 'h2' | 'p' | 'li' | 'bold' }> => {
      const container = document.createElement('div');
      container.innerHTML = html;
      const blocks: Array<{ text: string; style: 'h1' | 'h2' | 'p' | 'li' | 'bold' }> = [];

      const walk = (el: Element) => {
        const tag = el.tagName.toLowerCase();
        const text = (el.textContent || '').trim();
        if (!text) return;

        if (tag === 'h1') blocks.push({ text, style: 'h1' });
        else if (tag === 'h2') blocks.push({ text, style: 'h2' });
        else if (tag === 'li') blocks.push({ text: `• ${text}`, style: 'li' });
        else if (tag === 'b' || tag === 'strong') blocks.push({ text, style: 'bold' });
        else if (tag === 'p' || tag === 'div') blocks.push({ text, style: 'p' });
      };

      container.querySelectorAll('h1,h2,p,div,li,b,strong').forEach(walk);
      if (!blocks.length) {
        const plain = container.textContent?.trim();
        if (plain) blocks.push({ text: plain, style: 'p' });
      }

      return blocks;
    };

    sections.forEach((section, idx) => {
      ensureSpace(4);
      page.drawText(section.title || `Page ${idx + 1}`, {
        x: margin,
        y,
        size: 20,
        font: titleFont,
        color: rgb(0.08, 0.08, 0.08),
      });
      y -= 30;

      const blocks = htmlToBlocks(section.html);
      blocks.forEach((block) => {
        if (block.style === 'h1') drawWrapped(block.text, titleFont, 18, rgb(0.12, 0.12, 0.12));
        else if (block.style === 'h2') drawWrapped(block.text, boldFont, 15, rgb(0.16, 0.16, 0.16));
        else if (block.style === 'bold') drawWrapped(block.text, boldFont, 12, rgb(0.1, 0.1, 0.1));
        else if (block.style === 'li') drawWrapped(block.text, regularFont, 12, rgb(0.14, 0.14, 0.14));
        else drawWrapped(block.text, serifFont, 12, rgb(0.1, 0.1, 0.1));
      });

      y -= 12;
      ensureSpace(2);
    });

    const bytes = await pdfDoc.save();
    return new Blob([this.asArrayBuffer(bytes)], { type: 'application/pdf' });
  }
}
