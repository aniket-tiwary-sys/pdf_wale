import React from 'react';
import type { ToolCategory, Tool } from '../types';
import {
  File,
  Merge,
  Split,
  Zap,
  Eye,
  Lock,
  FileText,
  Image,
  Type,
  Settings,
  Camera,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';

export const TOOL_CATEGORIES: Record<ToolCategory, string> = {
  'convert-pdf': 'Convert PDF',
  'edit-pdf': 'Edit PDF',
  'secure-pdf': 'Secure PDF',
  'ocr-tools': 'OCR Tools',
  'scanner-tools': 'Scanner Tools',
  'ai-tools': 'AI Tools',
};

interface ToolData extends Omit<Tool, 'icon'> {
  iconComponent: LucideIcon;
}

const toolsData: ToolData[] = [
  // Convert PDF
  {
    id: 'merge-pdf',
    name: 'Merge PDF',
    description: 'Combine multiple PDF files into one',
    category: 'convert-pdf',
    iconComponent: Merge,
    path: '/tools/merge-pdf',
    enabled: true,
  },
  {
    id: 'split-pdf',
    name: 'Split PDF',
    description: 'Split PDF pages or extract specific pages',
    category: 'convert-pdf',
    iconComponent: Split,
    path: '/tools/split-pdf',
    enabled: true,
  },
  {
    id: 'compress-pdf',
    name: 'Compress PDF',
    description: 'Reduce PDF file size without quality loss',
    category: 'convert-pdf',
    iconComponent: Zap,
    path: '/tools/compress-pdf',
    enabled: true,
  },
  {
    id: 'pdf-to-image',
    name: 'PDF to Image',
    description: 'Convert PDF pages to JPG, PNG, or other images',
    category: 'convert-pdf',
    iconComponent: Image,
    path: '/tools/pdf-to-image',
    enabled: true,
  },
  {
    id: 'image-to-pdf',
    name: 'Image to PDF',
    description: 'Convert images to PDF document',
    category: 'convert-pdf',
    iconComponent: Image,
    path: '/tools/image-to-pdf',
    enabled: true,
  },
  {
    id: 'pdf-to-word',
    name: 'PDF to Word',
    description: 'Convert PDF to editable Word document',
    category: 'convert-pdf',
    iconComponent: FileText,
    path: '/tools/pdf-to-word',
    enabled: true,
  },
  {
    id: 'word-to-pdf',
    name: 'Word to PDF',
    description: 'Convert Word document to PDF',
    category: 'convert-pdf',
    iconComponent: FileText,
    path: '/tools/word-to-pdf',
    enabled: true,
  },
  {
    id: 'pdf-to-excel',
    name: 'PDF to Excel',
    description: 'Convert PDF tables to Excel',
    category: 'convert-pdf',
    iconComponent: FileText,
    path: '/tools/pdf-to-excel',
    enabled: true,
  },
  {
    id: 'excel-to-pdf',
    name: 'Excel to PDF',
    description: 'Convert Excel to PDF',
    category: 'convert-pdf',
    iconComponent: FileText,
    path: '/tools/excel-to-pdf',
    enabled: true,
  },
  {
    id: 'pdf-to-ppt',
    name: 'PDF to PowerPoint',
    description: 'Convert PDF to PowerPoint presentation',
    category: 'convert-pdf',
    iconComponent: FileText,
    path: '/tools/pdf-to-ppt',
    enabled: true,
  },
  {
    id: 'ppt-to-pdf',
    name: 'PowerPoint to PDF',
    description: 'Convert PowerPoint to PDF',
    category: 'convert-pdf',
    iconComponent: FileText,
    path: '/tools/ppt-to-pdf',
    enabled: true,
  },

  // Edit PDF
  {
    id: 'rotate-pdf',
    name: 'Rotate PDF',
    description: 'Rotate PDF pages in any direction',
    category: 'edit-pdf',
    iconComponent: Settings,
    path: '/tools/rotate-pdf',
    enabled: true,
  },
  {
    id: 'rearrange-pages',
    name: 'Rearrange Pages',
    description: 'Reorder pages in a PDF document',
    category: 'edit-pdf',
    iconComponent: Eye,
    path: '/tools/rearrange-pages',
    enabled: true,
  },
  {
    id: 'delete-pages',
    name: 'Delete Pages',
    description: 'Remove unwanted pages from PDF',
    category: 'edit-pdf',
    iconComponent: File,
    path: '/tools/delete-pages',
    enabled: true,
  },
  {
    id: 'extract-pages',
    name: 'Extract Pages',
    description: 'Extract specific pages from PDF',
    category: 'edit-pdf',
    iconComponent: File,
    path: '/tools/extract-pages',
    enabled: true,
  },
  {
    id: 'add-watermark',
    name: 'Add Watermark',
    description: 'Add text or image watermark to PDF',
    category: 'edit-pdf',
    iconComponent: Type,
    path: '/tools/add-watermark',
    enabled: true,
  },
  {
    id: 'remove-watermark',
    name: 'Remove Watermark',
    description: 'Remove watermarks from PDF',
    category: 'edit-pdf',
    iconComponent: Type,
    path: '/tools/remove-watermark',
    enabled: true,
  },
  {
    id: 'create-pdf',
    name: 'Create PDF',
    description: 'Create PDF from scratch',
    category: 'edit-pdf',
    iconComponent: File,
    path: '/tools/create-pdf',
    enabled: true,
  },
  {
    id: 'repair-pdf',
    name: 'Repair PDF',
    description: 'Fix corrupted or damaged PDF files',
    category: 'edit-pdf',
    iconComponent: Settings,
    path: '/tools/repair-pdf',
    enabled: true,
  },

  // Secure PDF
  {
    id: 'protect-pdf',
    name: 'Protect PDF',
    description: 'Add password protection to PDF',
    category: 'secure-pdf',
    iconComponent: Lock,
    path: '/tools/protect-pdf',
    enabled: true,
  },
  {
    id: 'unlock-pdf',
    name: 'Unlock PDF',
    description: 'Remove password from PDF',
    category: 'secure-pdf',
    iconComponent: Lock,
    path: '/tools/unlock-pdf',
    enabled: true,
  },
  {
    id: 'sign-pdf',
    name: 'Sign PDF',
    description: 'Add digital signature to PDF',
    category: 'secure-pdf',
    iconComponent: Type,
    path: '/tools/sign-pdf',
    enabled: true,
  },

  // OCR Tools
  {
    id: 'image-to-text',
    name: 'Image to Text',
    description: 'Extract text from images using OCR',
    category: 'ocr-tools',
    iconComponent: Eye,
    path: '/tools/image-to-text',
    enabled: true,
  },
  {
    id: 'pdf-to-text',
    name: 'PDF to Text',
    description: 'Extract text from PDF documents',
    category: 'ocr-tools',
    iconComponent: FileText,
    path: '/tools/pdf-to-text',
    enabled: true,
  },
  {
    id: 'searchable-pdf',
    name: 'Searchable PDF',
    description: 'Make scanned PDF searchable',
    category: 'ocr-tools',
    iconComponent: Eye,
    path: '/tools/searchable-pdf',
    enabled: true,
  },

  // Scanner Tools
  {
    id: 'document-scanner',
    name: 'Document Scanner',
    description: 'Scan documents using camera',
    category: 'scanner-tools',
    iconComponent: Camera,
    path: '/tools/document-scanner',
    enabled: true,
  },
  {
    id: 'auto-crop',
    name: 'Auto Crop',
    description: 'Automatically crop document images',
    category: 'scanner-tools',
    iconComponent: Camera,
    path: '/tools/auto-crop',
    enabled: true,
  },
  {
    id: 'enhance-document',
    name: 'Enhance Document',
    description: 'Enhance scanned document quality',
    category: 'scanner-tools',
    iconComponent: Eye,
    path: '/tools/enhance-document',
    enabled: true,
  },

  // AI Tools
  {
    id: 'ai-summarize',
    name: 'AI Summarize',
    description: 'Summarize PDF content locally',
    category: 'ai-tools',
    iconComponent: Sparkles,
    path: '/tools/ai-summarize',
    enabled: true,
  },
  {
    id: 'ai-translate',
    name: 'AI Translator',
    description: 'Translate text to any language in the world',
    category: 'ai-tools',
    iconComponent: Sparkles,
    path: '/tools/translator',
    enabled: true,
  },
];

// Convert to Tool array with icon JSX
export const TOOLS: Tool[] = toolsData.map((tool) => ({
  ...tool,
  icon: React.createElement(tool.iconComponent, { className: 'w-6 h-6' }),
  iconComponent: undefined as any,
}));

export const PRICING_PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    period: 'month' as const,
    description: 'Perfect for casual users',
    features: [
      'Unlimited file processing',
      'File size up to 50MB',
      'Basic PDF tools',
      'No watermarks',
      'Files deleted after 1 hour',
    ],
    cta: 'Get Started',
  },
  {
    id: 'pro',
    name: 'Premium',
    price: 9.99,
    period: 'month' as const,
    description: 'For professional users',
    popular: true,
    features: [
      'File size up to 500MB',
      'All tools available',
      'Batch processing',
      'Priority processing',
      'Advanced security',
      'Email support',
      'Files deleted after 30 days',
    ],
    cta: 'Start Free Trial',
  },
  {
    id: 'enterprise',
    name: 'Business',
    price: 49.99,
    period: 'month' as const,
    description: 'For teams and organizations',
    features: [
      'Unlimited file size',
      'All Premium features',
      'API access',
      'Custom workflows',
      'Team collaboration',
      'Dedicated support',
      'Advanced analytics',
      'Custom branding',
    ],
    cta: 'Contact Sales',
  },
];

export const FEATURES = [
  {
    icon: '🛡️',
    title: 'Privacy First',
    description: 'All files are processed locally on your device. Nothing is ever uploaded to our servers.',
  },
  {
    icon: '⚡',
    title: 'Lightning Fast',
    description: 'Process documents in seconds with our optimized algorithms.',
  },
  {
    icon: '🎨',
    title: 'Beautiful UI',
    description: 'Professional, intuitive interface that anyone can use.',
  },
  {
    icon: '🔒',
    title: 'Bank-Grade Security',
    description: 'Enterprise-level encryption and security standards.',
  },
  {
    icon: '📱',
    title: 'Works Everywhere',
    description: 'Desktop, tablet, or mobile - same experience everywhere.',
  },
  {
    icon: '🌐',
    title: 'Multi-Language',
    description: 'Available in 20+ languages for global users.',
  },
];

export const FAQS = [
  {
    id: '1',
    question: 'Is my data safe?',
    answer:
      'Yes! All processing happens on your device. We never upload your files to our servers. Your privacy is our top priority.',
    category: 'security',
  },
  {
    id: '2',
    question: 'What file formats are supported?',
    answer:
      'We support PDF, JPG, PNG, GIF, TIFF, and more. Check individual tool pages for specific format support.',
    category: 'technical',
  },
  {
    id: '3',
    question: 'How large can files be?',
    answer:
      'Free plan: 50MB. Premium: 500MB. Business: Unlimited. Larger files may take longer to process.',
    category: 'technical',
  },
  {
    id: '4',
    question: 'Do I need to create an account?',
    answer:
      'No account required for basic features. Creating an account unlocks additional benefits like file history.',
    category: 'account',
  },
  {
    id: '5',
    question: 'How long are files stored?',
    answer:
      'Free plan: 1 hour. Premium: 30 days. You can always download your files immediately after processing.',
    category: 'technical',
  },
  {
    id: '6',
    question: 'Can I use this offline?',
    answer:
      'Yes! PDF Wala is a PWA and works offline. Just visit the site once to cache the app.',
    category: 'technical',
  },
];
