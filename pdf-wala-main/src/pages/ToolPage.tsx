import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';
import { TOOLS } from '../constants';
import { FileUpload } from '../components/common/FileUpload';
import { Button } from '../components/common/Button';
import { PDFService } from '../services/pdfService';
import { OCRService } from '../services/ocrService';

const downloadBlob = (blob: Blob, name: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};

const loadImageFromFile = async (file: File): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };
    img.src = url;
  });

const canvasToBlob = async (canvas: HTMLCanvasElement, type = 'image/jpeg', quality = 0.95): Promise<Blob> =>
  new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('Failed to export image'));
    }, type, quality);
  });

const toOrdinal = (num: number): string => {
  const mod100 = num % 100;
  if (mod100 >= 11 && mod100 <= 13) return `${num}th`;
  const mod10 = num % 10;
  if (mod10 === 1) return `${num}st`;
  if (mod10 === 2) return `${num}nd`;
  if (mod10 === 3) return `${num}rd`;
  return `${num}th`;
};

const detectCropBounds = (
  data: Uint8ClampedArray,
  width: number,
  height: number,
  threshold = 235
): { x: number; y: number; w: number; h: number } | null => {
  let minX = width;
  let minY = height;
  let maxX = 0;
  let maxY = 0;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const i = (y * width + x) * 4;
      const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
      if (brightness < threshold) {
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
    }
  }

  if (!(maxX > minX && maxY > minY)) return null;
  const pad = 12;
  const cropX = Math.max(0, minX - pad);
  const cropY = Math.max(0, minY - pad);
  const cropW = Math.min(width - cropX, maxX - minX + pad * 2);
  const cropH = Math.min(height - cropY, maxY - minY + pad * 2);
  return { x: cropX, y: cropY, w: cropW, h: cropH };
};

const detectTextBounds = (
  data: Uint8ClampedArray,
  width: number,
  height: number
): { x: number; y: number; w: number; h: number } | null => {
  const rowInk = new Array<number>(height).fill(0);
  const colInk = new Array<number>(width).fill(0);
  const darkThreshold = 190;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const i = (y * width + x) * 4;
      const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      if (gray < darkThreshold) {
        rowInk[y] += 1;
        colInk[x] += 1;
      }
    }
  }

  const rowMinInk = Math.max(3, Math.floor(width * 0.01));
  const colMinInk = Math.max(3, Math.floor(height * 0.01));

  let top = 0;
  while (top < height && rowInk[top] < rowMinInk) top += 1;
  let bottom = height - 1;
  while (bottom >= 0 && rowInk[bottom] < rowMinInk) bottom -= 1;
  let left = 0;
  while (left < width && colInk[left] < colMinInk) left += 1;
  let right = width - 1;
  while (right >= 0 && colInk[right] < colMinInk) right -= 1;

  if (right <= left || bottom <= top) return null;

  const padX = Math.floor(width * 0.02);
  const padY = Math.floor(height * 0.02);
  const x = Math.max(0, left - padX);
  const y = Math.max(0, top - padY);
  const w = Math.min(width - x, right - left + padX * 2);
  const h = Math.min(height - y, bottom - top + padY * 2);

  return { x, y, w, h };
};

const summarizeTextLocally = (text: string): string => {
  const normalized = text.replace(/\s+/g, ' ').trim();
  if (!normalized) return '';

  const sentences = normalized
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 25);

  if (sentences.length <= 4) return sentences.join(' ');

  const stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'of', 'to', 'is', 'are', 'was', 'were', 'in', 'on', 'for', 'with',
    'as', 'at', 'by', 'that', 'this', 'it', 'be', 'from', 'has', 'have', 'had', 'but', 'not', 'you',
    'your', 'their', 'they', 'we', 'our', 'can', 'will', 'would', 'should', 'could', 'about',
  ]);

  const freq = new Map<string, number>();
  for (const sentence of sentences) {
    const words = sentence.toLowerCase().match(/[a-z0-9']+/g) ?? [];
    for (const w of words) {
      if (w.length < 3 || stopWords.has(w)) continue;
      freq.set(w, (freq.get(w) ?? 0) + 1);
    }
  }

  const scored = sentences.map((sentence, idx) => {
    const words = sentence.toLowerCase().match(/[a-z0-9']+/g) ?? [];
    let score = 0;
    for (const w of words) {
      score += freq.get(w) ?? 0;
    }
    const lengthPenalty = Math.max(1, words.length);
    return { idx, sentence, score: score / lengthPenalty };
  });

  const targetCount = Math.max(3, Math.min(8, Math.ceil(sentences.length * 0.22)));
  const chosen = scored
    .sort((a, b) => b.score - a.score)
    .slice(0, targetCount)
    .sort((a, b) => a.idx - b.idx)
    .map((s) => s.sentence);

  return chosen.join(' ');
};

export const ToolPage: React.FC = () => {
  const { toolId } = useParams<{ toolId: string }>();
  const tool = TOOLS.find((t) => t.id === toolId);
  const [files, setFiles] = React.useState<File[]>([]);
  const [password, setPassword] = React.useState('');
  const [pageInput, setPageInput] = React.useState('1');
  const [angleInput, setAngleInput] = React.useState('90');
  const [watermarkText, setWatermarkText] = React.useState('CONFIDENTIAL');
  const [signatureText, setSignatureText] = React.useState('');
  const [scannerExportType, setScannerExportType] = React.useState<'pdf' | 'photo'>('pdf');
  const [enhanceMode, setEnhanceMode] = React.useState<'text-clarity' | 'texture' | 'bw'>('text-clarity');
  const [scannerMode, setScannerMode] = React.useState<'original' | 'bw' | 'grayscale' | 'high-contrast'>('high-contrast');
  const [scannerAutoCrop, setScannerAutoCrop] = React.useState(true);
  const [isWorking, setIsWorking] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [textResult, setTextResult] = React.useState('');
  const cameraInputRef = React.useRef<HTMLInputElement>(null);
  const [previewUrls, setPreviewUrls] = React.useState<string[]>([]);
  const [previewOutputUrls, setPreviewOutputUrls] = React.useState<string[]>([]);
  const [previewRects, setPreviewRects] = React.useState<Array<{ x: number; y: number; w: number; h: number } | null>>([]);
  const [activePreview, setActivePreview] = React.useState(0);
  const [boxCropEnabled, setBoxCropEnabled] = React.useState(false);
  const [cropBox, setCropBox] = React.useState({ x: 8, y: 8, w: 84, h: 84 });
  const dragRef = React.useRef<{ handle: 'tl' | 'tr' | 'br' | 'bl' | null; rect: DOMRect | null }>({
    handle: null,
    rect: null,
  });

  React.useEffect(() => {
    const isCropPreviewTool = toolId === 'auto-crop' || (toolId === 'document-scanner' && scannerAutoCrop);
    if (!isCropPreviewTool || files.length === 0) {
      setPreviewUrls([]);
      setPreviewOutputUrls([]);
      setPreviewRects([]);
      setActivePreview(0);
      return;
    }

    const inputUrls = files.map((f) => URL.createObjectURL(f));
    setPreviewUrls(inputUrls);
    let cancelled = false;
    let outputUrls: string[] = [];

    const run = async () => {
      const rects: Array<{ x: number; y: number; w: number; h: number } | null> = [];
      const outputs: string[] = [];
      for (let i = 0; i < files.length; i += 1) {
        const img = await loadImageFromFile(files[i]);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          rects.push(null);
          continue;
        }
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        const src = ctx.getImageData(0, 0, canvas.width, canvas.height);
        let rect =
          detectTextBounds(src.data, canvas.width, canvas.height) ??
          detectCropBounds(src.data, canvas.width, canvas.height);

        if (boxCropEnabled) {
          const x = Math.floor((cropBox.x / 100) * canvas.width);
          const y = Math.floor((cropBox.y / 100) * canvas.height);
          const w = Math.max(1, Math.floor((cropBox.w / 100) * canvas.width));
          const h = Math.max(1, Math.floor((cropBox.h / 100) * canvas.height));
          rect = { x, y, w, h };
        }
        rects.push(rect);

        if (rect) {
          const cropped = document.createElement('canvas');
          const cctx = cropped.getContext('2d');
          if (cctx) {
            cropped.width = rect.w;
            cropped.height = rect.h;
            cctx.drawImage(canvas, rect.x, rect.y, rect.w, rect.h, 0, 0, rect.w, rect.h);
            const blob = await canvasToBlob(cropped);
            outputs.push(URL.createObjectURL(blob));
          } else {
            outputs.push(URL.createObjectURL(files[i]));
          }
        } else {
          outputs.push(URL.createObjectURL(files[i]));
        }
      }
      if (!cancelled) {
        outputUrls = outputs;
        setPreviewRects(rects);
        setPreviewOutputUrls(outputs);
      }
    };

    run().catch(() => {
      if (!cancelled) setPreviewRects([]);
    });

    return () => {
      cancelled = true;
      inputUrls.forEach((u) => URL.revokeObjectURL(u));
      outputUrls.forEach((u) => URL.revokeObjectURL(u));
    };
  }, [files, toolId, scannerAutoCrop, boxCropEnabled, cropBox]);

  const moveFile = (index: number, direction: 'up' | 'down') => {
    setFiles((prev) => {
      const target = direction === 'up' ? index - 1 : index + 1;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const handleTextToPDF = async () => {
    if (!textResult.trim()) {
      setError('No extracted text available to convert.');
      return;
    }

    try {
      setIsWorking(true);
      setError(null);
      const blob = await PDFService.textToPDF(textResult);
      downloadBlob(blob, 'ocr-text.pdf');
    } catch (err) {
      console.error(err);
      setError('Failed to create PDF from extracted text.');
    } finally {
      setIsWorking(false);
    }
  };

  const openInDocsEditor = () => {
    if (!textResult.trim()) {
      setError('No extracted text available to edit.');
      return;
    }

    localStorage.setItem(
      'docforge_import_draft',
      JSON.stringify({
        title: 'OCR Draft',
        text: textResult,
        createdAt: Date.now(),
      })
    );
    window.location.href = '/tools/create-pdf';
  };

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  React.useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const drag = dragRef.current;
      if (!drag.handle || !drag.rect) return;
      const px = ((e.clientX - drag.rect.left) / drag.rect.width) * 100;
      const py = ((e.clientY - drag.rect.top) / drag.rect.height) * 100;
      const x = Math.max(0, Math.min(100, px));
      const y = Math.max(0, Math.min(100, py));

      setCropBox((prev) => {
        const right = prev.x + prev.w;
        const bottom = prev.y + prev.h;
        if (drag.handle === 'tl') {
          const nx = Math.min(x, right - 2);
          const ny = Math.min(y, bottom - 2);
          return { x: nx, y: ny, w: right - nx, h: bottom - ny };
        }
        if (drag.handle === 'tr') {
          const nx2 = Math.max(x, prev.x + 2);
          const ny2 = Math.min(y, bottom - 2);
          return { x: prev.x, y: ny2, w: nx2 - prev.x, h: bottom - ny2 };
        }
        if (drag.handle === 'br') {
          const nx3 = Math.max(x, prev.x + 2);
          const ny3 = Math.max(y, prev.y + 2);
          return { x: prev.x, y: prev.y, w: nx3 - prev.x, h: ny3 - prev.y };
        }
        const nx4 = Math.min(x, right - 2);
        const ny4 = Math.max(y, prev.y + 2);
        return { x: nx4, y: prev.y, w: right - nx4, h: ny4 - prev.y };
      });
    };

    const onUp = () => {
      dragRef.current = { handle: null, rect: null };
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, []);

  const parsePages = (input: string, preserveOrder = false): number[] => {
    const orderedPages: number[] = [];
    const pages = new Set<number>();
    const chunks = input
      .split(',')
      .map((x) => x.trim())
      .filter(Boolean);

    for (const chunk of chunks) {
      if (chunk.includes('-')) {
        const [startRaw, endRaw] = chunk.split('-').map((x) => Number(x.trim()));
        if (!Number.isFinite(startRaw) || !Number.isFinite(endRaw)) continue;
        const start = Math.min(startRaw, endRaw);
        const end = Math.max(startRaw, endRaw);
        for (let page = start; page <= end; page += 1) {
          if (page >= 1 && !pages.has(page)) {
            pages.add(page);
            orderedPages.push(page);
          }
        }
      } else {
        const page = Number(chunk);
        if (Number.isFinite(page) && page >= 1 && !pages.has(page)) {
          pages.add(page);
          orderedPages.push(page);
        }
      }
    }

    return preserveOrder ? orderedPages : Array.from(pages).sort((a, b) => a - b);
  };

  const handleRun = async () => {
    if (!toolId || files.length === 0) {
      setError('Please upload a file first.');
      return;
    }

    try {
      setIsWorking(true);
      setError(null);
      setTextResult('');

      if (toolId === 'compress-pdf') {
        const blob = await PDFService.compressPDF(files[0]);
        downloadBlob(blob, 'compressed.pdf');
        return;
      }

      if (toolId === 'pdf-to-image') {
        const images = await PDFService.convertPDFToImages(files[0]);
        for (const img of images) {
          await fetch(img.dataUrl)
            .then((r) => r.blob())
            .then((b) => downloadBlob(b, `page-${img.page}.png`));
        }
        return;
      }

      if (toolId === 'image-to-pdf') {
        const blob = await PDFService.imagesToPDF(files);
        downloadBlob(blob, 'images-to-pdf.pdf');
        return;
      }

      if (toolId === 'document-scanner' || toolId === 'auto-crop' || toolId === 'enhance-document') {
        const processImage = async (imageFile: File): Promise<Blob> => {
          const img = await loadImageFromFile(imageFile);
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) throw new Error('Could not initialize image processing.');

          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);

          if (toolId === 'auto-crop' || (toolId === 'document-scanner' && scannerAutoCrop)) {
            const src = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = src.data;
            let minX = canvas.width;
            let minY = canvas.height;
            let maxX = 0;
            let maxY = 0;
            const threshold = 235;

            for (let y = 0; y < canvas.height; y += 1) {
              for (let x = 0; x < canvas.width; x += 1) {
                const i = (y * canvas.width + x) * 4;
                const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
                if (brightness < threshold) {
                  if (x < minX) minX = x;
                  if (y < minY) minY = y;
                  if (x > maxX) maxX = x;
                  if (y > maxY) maxY = y;
                }
              }
            }

            const textRect = detectTextBounds(src.data, canvas.width, canvas.height);
            const edgeRect =
              maxX > minX && maxY > minY
                ? (() => {
                    const pad = 12;
                    return {
                      x: Math.max(0, minX - pad),
                      y: Math.max(0, minY - pad),
                      w: Math.min(canvas.width - Math.max(0, minX - pad), maxX - minX + pad * 2),
                      h: Math.min(canvas.height - Math.max(0, minY - pad), maxY - minY + pad * 2),
                    };
                  })()
                : null;

            let selectedRect = textRect ?? edgeRect;

            if (boxCropEnabled) {
              selectedRect = {
                x: Math.floor((cropBox.x / 100) * canvas.width),
                y: Math.floor((cropBox.y / 100) * canvas.height),
                w: Math.max(1, Math.floor((cropBox.w / 100) * canvas.width)),
                h: Math.max(1, Math.floor((cropBox.h / 100) * canvas.height)),
              };
            }

            if (selectedRect) {
              const cropped = document.createElement('canvas');
              const cctx = cropped.getContext('2d');
              if (!cctx) throw new Error('Failed to crop image');
              cropped.width = selectedRect.w;
              cropped.height = selectedRect.h;
              cctx.drawImage(
                canvas,
                selectedRect.x,
                selectedRect.y,
                selectedRect.w,
                selectedRect.h,
                0,
                0,
                selectedRect.w,
                selectedRect.h
              );
              return canvasToBlob(cropped);
            }

            if (toolId === 'auto-crop') {
              return canvasToBlob(canvas);
            }
          }

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const pixels = imageData.data;
        for (let i = 0; i < pixels.length; i += 4) {
          const r = pixels[i];
          const g = pixels[i + 1];
          const b = pixels[i + 2];
          let gray = 0.299 * r + 0.587 * g + 0.114 * b;

          if (toolId === 'document-scanner') {
            if (scannerMode === 'bw') {
              gray = gray > 150 ? 255 : 0;
            } else if (scannerMode === 'grayscale') {
              gray = gray;
            } else if (scannerMode === 'high-contrast') {
              gray = gray > 155 ? 255 : gray * 0.8;
            } else {
              pixels[i] = r;
              pixels[i + 1] = g;
              pixels[i + 2] = b;
              continue;
            }

            pixels[i] = gray;
            pixels[i + 1] = gray;
            pixels[i + 2] = gray;
            continue;
          }

          if (toolId === 'enhance-document') {
            if (enhanceMode === 'bw') {
              gray = gray > 155 ? 255 : 0;
              pixels[i] = gray;
              pixels[i + 1] = gray;
              pixels[i + 2] = gray;
            } else if (enhanceMode === 'text-clarity') {
              gray = (gray - 128) * 1.35 + 128;
              gray = Math.min(255, Math.max(0, gray + 10));
              pixels[i] = gray;
              pixels[i + 1] = gray;
              pixels[i + 2] = gray;
            } else {
              // texture mode: keep color and boost local contrast/detail
              const boost = 1.18;
              pixels[i] = Math.min(255, Math.max(0, (r - 128) * boost + 128 + 6));
              pixels[i + 1] = Math.min(255, Math.max(0, (g - 128) * boost + 128 + 6));
              pixels[i + 2] = Math.min(255, Math.max(0, (b - 128) * boost + 128 + 6));
            }
          }
        }
        ctx.putImageData(imageData, 0, 0);

          return canvasToBlob(canvas);
        };

        if (toolId === 'document-scanner') {
          const scannedFiles: File[] = [];
          for (let i = 0; i < files.length; i += 1) {
            const blob = await processImage(files[i]);
            scannedFiles.push(new File([blob], `scanned-${i + 1}.jpg`, { type: 'image/jpeg' }));
          }

          if (scannerExportType === 'pdf') {
            const pdfBlob = await PDFService.imagesToPDF(scannedFiles);
            downloadBlob(pdfBlob, 'scanned-document.pdf');
          } else {
            for (let i = 0; i < scannedFiles.length; i += 1) {
              downloadBlob(scannedFiles[i], `scanned-document-${i + 1}.jpg`);
            }
          }
          return;
        }

        if (toolId === 'auto-crop') {
          const croppedFiles: File[] = [];
          for (let i = 0; i < files.length; i += 1) {
            const blob = await processImage(files[i]);
            croppedFiles.push(new File([blob], `auto-cropped-${i + 1}.jpg`, { type: 'image/jpeg' }));
          }

          if (scannerExportType === 'pdf') {
            const pdfBlob = await PDFService.imagesToPDF(croppedFiles);
            downloadBlob(pdfBlob, 'auto-cropped.pdf');
          } else {
            for (let i = 0; i < croppedFiles.length; i += 1) {
              downloadBlob(croppedFiles[i], `auto-cropped-${i + 1}.jpg`);
            }
          }
          return;
        }

        const enhancedFiles: File[] = [];
        for (let i = 0; i < files.length; i += 1) {
          const blob = await processImage(files[i]);
          enhancedFiles.push(new File([blob], `enhanced-document-${i + 1}.jpg`, { type: 'image/jpeg' }));
        }

        if (scannerExportType === 'pdf') {
          const pdfBlob = await PDFService.imagesToPDF(enhancedFiles);
          downloadBlob(pdfBlob, 'enhanced-document.pdf');
        } else {
          for (let i = 0; i < enhancedFiles.length; i += 1) {
            downloadBlob(enhancedFiles[i], `enhanced-document-${i + 1}.jpg`);
          }
        }
        return;
      }

      if (toolId === 'protect-pdf') {
        if (!password) {
          setError('Please enter a password.');
          return;
        }
        const blob = await PDFService.protectPDF(files[0], password);
        downloadBlob(blob, 'protected.pdf');
        return;
      }

      if (toolId === 'unlock-pdf') {
        if (!password) {
          setError('Please enter the PDF password.');
          return;
        }
        const blob = await PDFService.unlockPDF(files[0], password);
        downloadBlob(blob, 'unlocked.pdf');
        return;
      }

      if (toolId === 'image-to-text') {
        const text = await OCRService.extractTextFromImage(files[0]);
        setTextResult(text);
        return;
      }

      if (toolId === 'ai-summarize') {
        const pageCount = await PDFService.getPDFPageCount(files[0]);
        if (pageCount > 30) {
          setError('AI Summarize supports up to 30 pages max.');
          return;
        }

        let sourceText = '';
        try {
          sourceText = (await PDFService.extractTextFromPDF(files[0])).trim();
        } catch (directErr) {
          console.warn('Direct text extraction failed for summarizer, using OCR fallback.', directErr);
        }

        if (!sourceText) {
          let combined = '';
          for (let i = 1; i <= pageCount; i += 1) {
            const dataUrl = await PDFService.renderPDFPageToImage(files[0], i, 1.25);
            const pageText = await OCRService.extractTextFromImageURL(dataUrl);
            combined += ` ${pageText}`;
          }
          sourceText = combined.trim();
        }

        if (!sourceText) {
          setError('No readable text found in this PDF.');
          return;
        }

        const summary = summarizeTextLocally(sourceText);
        if (!summary) {
          setError('Could not generate summary for this PDF.');
          return;
        }
        setTextResult(summary);
        return;
      }

      if (toolId === 'pdf-to-text') {
        try {
          const directText = (await PDFService.extractTextFromPDF(files[0])).trim();
          if (directText.length > 20) {
            setTextResult(directText);
            return;
          }
        } catch (directErr) {
          console.warn('Direct PDF text extraction failed. Falling back to OCR.', directErr);
        }

        // Fallback for scanned/image-only PDFs.
        const pageCount = await PDFService.getPDFPageCount(files[0]);
        let combined = '';
        for (let i = 1; i <= pageCount; i += 1) {
          const dataUrl = await PDFService.renderPDFPageToImage(files[0], i, 1.5);
          const pageText = await OCRService.extractTextFromImageURL(dataUrl);
          combined += `\n--- Page ${i} ---\n${pageText}\n`;
        }
        const finalText = combined.trim();
        if (!finalText) {
          setError('No readable text found. Try a clearer scan or higher-quality PDF.');
          return;
        }
        setTextResult(finalText);
        return;
      }

      if (toolId === 'searchable-pdf') {
        let extracted = '';
        try {
          extracted = (await PDFService.extractTextFromPDF(files[0])).trim();
        } catch (directErr) {
          console.warn('Direct PDF text extraction failed. Falling back to OCR.', directErr);
        }

        if (!extracted) {
          const pageCount = await PDFService.getPDFPageCount(files[0]);
          let combined = '';
          for (let i = 1; i <= pageCount; i += 1) {
            const dataUrl = await PDFService.renderPDFPageToImage(files[0], i, 1.5);
            const pageText = await OCRService.extractTextFromImageURL(dataUrl);
            combined += `\n--- Page ${i} ---\n${pageText}\n`;
          }
          extracted = combined.trim();
        }

        if (!extracted) {
          setError('No readable text found to build a searchable PDF.');
          return;
        }

        try {
          const blob = await PDFService.textToPDF(extracted);
          downloadBlob(blob, 'searchable.pdf');
        } catch (pdfErr) {
          console.warn('Failed to generate searchable PDF, downloading text fallback.', pdfErr);
          const txtBlob = new Blob([extracted], { type: 'text/plain' });
          downloadBlob(txtBlob, 'searchable-fallback.txt');
        }
        setTextResult(extracted);
        return;
      }

      if (toolId === 'rotate-pdf') {
        const pageCount = await PDFService.getPDFPageCount(files[0]);
        const pages = Array.from({ length: pageCount }, (_, i) => i + 1);
        const angle = Number(angleInput) || 90;
        const blob = await PDFService.rotatePDFPages(files[0], pages, angle);
        downloadBlob(blob, 'rotated.pdf');
        return;
      }

      if (toolId === 'delete-pages') {
        const pages = parsePages(pageInput);
        const blob = await PDFService.deletePDFPages(files[0], pages);
        downloadBlob(blob, 'pages-deleted.pdf');
        return;
      }

      if (toolId === 'extract-pages') {
        const pages = parsePages(pageInput, true);
        const blob = await PDFService.extractPDFPages(files[0], pages);
        downloadBlob(blob, 'pages-extracted.pdf');
        return;
      }

      if (toolId === 'rearrange-pages') {
        const pages = parsePages(pageInput, true);
        const blob = await PDFService.reorderPDFPages(files[0], pages);
        downloadBlob(blob, 'rearranged.pdf');
        return;
      }

      if (toolId === 'add-watermark') {
        const blob = await PDFService.addWatermarkToPDF(files[0], watermarkText.trim() || 'WATERMARK');
        downloadBlob(blob, 'watermarked.pdf');
        return;
      }

      if (toolId === 'sign-pdf') {
        if (!signatureText.trim()) {
          setError('Please enter the signer name.');
          return;
        }
        const blob = await PDFService.signPDF(files[0], signatureText.trim());
        downloadBlob(blob, 'signed.pdf');
        return;
      }

      setError('This tool page is being prepared. Use the dedicated pages for Merge and Split right now.');
    } catch (err) {
      console.error(err);
      const message = err instanceof Error ? err.message : 'Unknown error';
      if (toolId === 'unlock-pdf') {
        setError('Unlock failed. Check the password and try again.');
      } else if (toolId === 'searchable-pdf') {
        setError(`Searchable PDF failed: ${message}`);
      } else if (toolId === 'pdf-to-text') {
        setError(`PDF to Text failed: ${message}`);
      } else {
        setError('Operation failed. Please try another file.');
      }
    } finally {
      setIsWorking(false);
    }
  };

  if (!tool) {
    return (
      <MainLayout>
        <div className="min-h-screen pt-20 pb-12">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Tool not found</h1>
            <Link to="/tools" className="text-primary-600 hover:underline">Back to tools</Link>
          </div>
        </div>
      </MainLayout>
    );
  }

  const accepts =
    toolId === 'image-to-pdf' ||
    toolId === 'image-to-text' ||
    toolId === 'document-scanner' ||
    toolId === 'auto-crop' ||
    toolId === 'enhance-document'
      ? '.jpg,.jpeg,.png'
      : '.pdf';

  const allowMulti =
    toolId === 'image-to-pdf' ||
    toolId === 'document-scanner' ||
    toolId === 'auto-crop' ||
    toolId === 'enhance-document';

  return (
    <MainLayout>
      <div className="min-h-screen pt-20 pb-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mx-auto mb-6 w-14 h-14 bg-primary-100 dark:bg-primary-900 rounded-xl flex items-center justify-center text-primary-600 dark:text-primary-400">
            {tool.icon}
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">{tool.name}</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">{tool.description}</p>

          <div className="p-6 rounded-xl border border-gray-200 dark:border-dark-700 bg-white dark:bg-dark-800 space-y-4 text-left">
            <FileUpload
              onFilesSelected={(f) => setFiles(allowMulti ? f : [f[0]])}
              accept={accepts}
              multiple={allowMulti}
              maxSize={500 * 1024 * 1024}
            />

            {(toolId === 'document-scanner' || toolId === 'auto-crop' || toolId === 'enhance-document') && (
              <>
                {toolId === 'document-scanner' && (
                  <>
                    <select
                      value={scannerMode}
                      onChange={(e) => setScannerMode(e.target.value as 'original' | 'bw' | 'grayscale' | 'high-contrast')}
                      className="w-full rounded-lg border border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-900 px-4 py-2 text-gray-900 dark:text-white"
                    >
                      <option value="high-contrast">Doc Scanner (High Contrast)</option>
                      <option value="bw">Black & White</option>
                      <option value="grayscale">Grayscale</option>
                      <option value="original">Original Colors</option>
                    </select>
                    <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <input
                        type="checkbox"
                        checked={scannerAutoCrop}
                        onChange={(e) => setScannerAutoCrop(e.target.checked)}
                      />
                      Auto crop document edges
                    </label>
                  </>
                )}
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={(e) => {
                    const picked = e.target.files ? Array.from(e.target.files) : [];
                    if (picked.length > 0) {
                      setFiles((prev) => [...prev, ...picked]);
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => cameraInputRef.current?.click()}
                  disabled={isWorking}
                >
                  Take Photo
                </Button>
                <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <input type="checkbox" checked={boxCropEnabled} onChange={(e) => setBoxCropEnabled(e.target.checked)} />
                  Box crop tool
                </label>
                {boxCropEnabled && (
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => setCropBox({ x: 8, y: 8, w: 84, h: 84 })}>Reset Box</Button>
                    <p className="text-xs text-gray-600 dark:text-gray-400 self-center">
                      Drag blue corner handles on the image.
                    </p>
                  </div>
                )}
                {toolId === 'enhance-document' && (
                  <select
                    value={enhanceMode}
                    onChange={(e) => setEnhanceMode(e.target.value as 'text-clarity' | 'texture' | 'bw')}
                    className="w-full rounded-lg border border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-900 px-4 py-2 text-gray-900 dark:text-white"
                  >
                    <option value="text-clarity">Text Clarity</option>
                    <option value="texture">Texture Detail</option>
                    <option value="bw">Black & White</option>
                  </select>
                )}
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={scannerExportType === 'pdf' ? 'primary' : 'outline'}
                    onClick={() => setScannerExportType('pdf')}
                  >
                    Export as PDF
                  </Button>
                  <Button
                    size="sm"
                    variant={scannerExportType === 'photo' ? 'primary' : 'outline'}
                    onClick={() => setScannerExportType('photo')}
                  >
                    Export as Photo
                  </Button>
                </div>
              </>
            )}

            {previewUrls.length > 0 && (
              <div className="space-y-3 rounded-lg border border-gray-300 dark:border-dark-600 p-3">
                <p className="text-sm text-gray-700 dark:text-gray-300">Crop preview</p>
                {previewUrls.length > 1 && (
                  <div className="flex flex-wrap gap-2">
                    {previewUrls.map((_, idx) => (
                      <Button
                        key={`preview-tab-${idx}`}
                        size="sm"
                        variant={idx === activePreview ? 'primary' : 'outline'}
                        onClick={() => setActivePreview(idx)}
                      >
                        {toOrdinal(idx + 1)}
                      </Button>
                    ))}
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="rounded-lg border border-gray-200 dark:border-dark-700 p-2">
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Before</p>
                    <div className="relative">
                      <img
                        src={previewUrls[Math.min(activePreview, previewUrls.length - 1)]}
                        alt="Before crop preview"
                        className="w-full max-h-72 object-contain bg-gray-50 dark:bg-dark-900 rounded"
                      />
                      {boxCropEnabled && (
                        <div
                          className="absolute border-2 border-blue-500 bg-blue-500/10"
                          style={{ left: `${cropBox.x}%`, top: `${cropBox.y}%`, width: `${cropBox.w}%`, height: `${cropBox.h}%` }}
                        >
                          {(['tl', 'tr', 'br', 'bl'] as const).map((handle) => {
                            const pos =
                              handle === 'tl'
                                ? { left: 0, top: 0 }
                                : handle === 'tr'
                                  ? { right: 0, top: 0 }
                                  : handle === 'br'
                                    ? { right: 0, bottom: 0 }
                                    : { left: 0, bottom: 0 };
                            return (
                              <div
                                key={handle}
                                className="absolute w-3 h-3 bg-blue-500 border border-white rounded-sm -translate-x-1/2 -translate-y-1/2 cursor-nwse-resize"
                                style={pos as React.CSSProperties}
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  const wrapper = (e.currentTarget.parentElement?.parentElement as HTMLDivElement) || null;
                                  dragRef.current = { handle, rect: wrapper?.getBoundingClientRect() || null };
                                }}
                              />
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="rounded-lg border border-gray-200 dark:border-dark-700 p-2">
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">After</p>
                    {previewOutputUrls.length > 0 ? (
                      <img
                        src={previewOutputUrls[Math.min(activePreview, Math.max(0, previewOutputUrls.length - 1))]}
                        alt="After crop preview"
                        className="w-full max-h-72 object-contain bg-gray-50 dark:bg-dark-900 rounded"
                      />
                    ) : (
                      <div className="w-full h-48 grid place-items-center text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-dark-900 rounded">
                        Building preview...
                      </div>
                    )}
                  </div>
                </div>
                {previewRects[activePreview] ? (
                  <p className="text-xs text-green-700 dark:text-green-400">
                    {boxCropEnabled ? 'Box crop preview is applied.' : 'Auto crop preview is applied.'}
                  </p>
                ) : (
                  <p className="text-xs text-amber-700 dark:text-amber-400">No clear crop boundary detected; full image will be used.</p>
                )}
              </div>
            )}

            {(toolId === 'protect-pdf' || toolId === 'unlock-pdf') && (
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full rounded-lg border border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-900 px-4 py-2 text-gray-900 dark:text-white"
              />
            )}

            {(toolId === 'delete-pages' || toolId === 'extract-pages' || toolId === 'rearrange-pages') && (
              <input
                type="text"
                value={pageInput}
                onChange={(e) => setPageInput(e.target.value)}
                placeholder="Pages (example: 1-4,7,10-12)"
                className="w-full rounded-lg border border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-900 px-4 py-2 text-gray-900 dark:text-white"
              />
            )}

            {toolId === 'rotate-pdf' && (
              <input
                type="number"
                value={angleInput}
                onChange={(e) => setAngleInput(e.target.value)}
                placeholder="Rotation angle"
                className="w-full rounded-lg border border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-900 px-4 py-2 text-gray-900 dark:text-white"
              />
            )}

            {toolId === 'add-watermark' && (
              <input
                type="text"
                value={watermarkText}
                onChange={(e) => setWatermarkText(e.target.value)}
                placeholder="Watermark text"
                className="w-full rounded-lg border border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-900 px-4 py-2 text-gray-900 dark:text-white"
              />
            )}

            {toolId === 'sign-pdf' && (
              <input
                type="text"
                value={signatureText}
                onChange={(e) => setSignatureText(e.target.value)}
                placeholder="Signer name"
                className="w-full rounded-lg border border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-900 px-4 py-2 text-gray-900 dark:text-white"
              />
            )}

            <Button onClick={handleRun} loading={isWorking} disabled={!tool.enabled}>
              Run {tool.name}
            </Button>

            {(toolId === 'document-scanner' || toolId === 'auto-crop' || toolId === 'enhance-document') && files.length > 1 && (
              <div className="space-y-2">
                <p className="text-sm text-gray-600 dark:text-gray-400">Page order (used in PDF):</p>
                {files.map((f, idx) => (
                  <div
                    key={`${f.name}-${idx}`}
                    className="flex items-center justify-between rounded-lg border border-gray-300 dark:border-dark-600 px-3 py-2"
                  >
                    <span className="text-sm text-gray-900 dark:text-white truncate pr-2">
                      {toOrdinal(idx + 1)} photo - {f.name}
                    </span>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => moveFile(idx, 'up')} disabled={idx === 0}>
                        Up
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => moveFile(idx, 'down')} disabled={idx === files.length - 1}>
                        Down
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

            {textResult && (
              <>
                <textarea
                  readOnly
                  value={textResult}
                  className="w-full h-64 rounded-lg border border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-900 px-4 py-2 text-gray-900 dark:text-white"
                />
                <Button onClick={handleTextToPDF} loading={isWorking}>
                  Create PDF from Text
                </Button>
                <Button onClick={openInDocsEditor} variant="secondary" disabled={isWorking}>
                  Edit in Docs Page
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};
