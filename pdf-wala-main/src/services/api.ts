import axios from 'axios';

// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://api.docforge.com';

// Create API client
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized - redirect to login
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// PDF Service
export const pdfService = {
  convertToImage: (file: File) =>
    apiClient.post('/pdf/convert-to-image', { file }, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  
  convertToWord: (file: File) =>
    apiClient.post('/pdf/convert-to-word', { file }, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  
  mergePdfs: (files: File[]) =>
    apiClient.post('/pdf/merge', { files }, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  
  splitPdf: (file: File, ranges: string[]) =>
    apiClient.post('/pdf/split', { file, ranges }, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  
  compressPdf: (file: File) =>
    apiClient.post('/pdf/compress', { file }, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  
  rotatePdf: (file: File, angle: number) =>
    apiClient.post('/pdf/rotate', { file, angle }, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};

// OCR Service
export const ocrService = {
  extractText: (file: File) =>
    apiClient.post('/ocr/extract', { file }, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  
  createSearchablePdf: (file: File) =>
    apiClient.post('/ocr/searchable', { file }, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};

// AI Service
export const aiService = {
  summarizePdf: (file: File) =>
    apiClient.post('/ai/summarize', { file }, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  
  askQuestion: (file: File, question: string) =>
    apiClient.post('/ai/ask', { file, question }, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  
  extractKeyPoints: (file: File) =>
    apiClient.post('/ai/key-points', { file }, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};

// User Service
export const userService = {
  getProfile: () => apiClient.get('/user/profile'),
  updateProfile: (data: any) => apiClient.put('/user/profile', data),
  getSubscription: () => apiClient.get('/user/subscription'),
  upgradeSubscription: (plan: string) =>
    apiClient.post('/user/subscription/upgrade', { plan }),
};

// File Service
export const fileService = {
  uploadFile: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post('/files/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  getFiles: () => apiClient.get('/files'),
  deleteFile: (id: string) => apiClient.delete(`/files/${id}`),
  downloadFile: (id: string) => apiClient.get(`/files/${id}/download`),
};

export default apiClient;
