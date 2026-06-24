export interface Tool {
  id: string;
  name: string;
  description: string;
  category: ToolCategory;
  icon: React.ReactNode;
  path: string;
  enabled: boolean;
}

export type ToolCategory = 
  | 'convert-pdf' 
  | 'edit-pdf' 
  | 'secure-pdf' 
  | 'ocr-tools' 
  | 'scanner-tools' 
  | 'ai-tools';

export interface UploadedFile {
  id: string;
  name: string;
  file: File;
  preview?: string;
  uploadedAt: Date;
}

export interface PricingPlan {
  id: string;
  name: string;
  price: number;
  period: 'month' | 'year';
  description: string;
  features: string[];
  popular?: boolean;
  cta: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: string;
  category: string;
  publishedAt: Date;
  image: string;
  readTime: number;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category?: string;
}

export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  language: string;
  notifications: boolean;
  compressImages: boolean;
  deleteAfter: number; // minutes
}

export interface ToolProgress {
  total: number;
  current: number;
  status: 'pending' | 'processing' | 'complete' | 'error';
  message?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  subscription: 'free' | 'premium' | 'business';
  createdAt: string;
}

