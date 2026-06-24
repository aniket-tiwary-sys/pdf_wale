import React, { useCallback } from 'react';
import { Upload, X } from 'lucide-react';
import { cn } from '../../utils/helpers';

interface FileUploadProps {
  onFilesSelected: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  maxSize?: number;
  className?: string;
  disabled?: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFilesSelected,
  accept = '.pdf,.jpg,.jpeg,.png,.gif',
  multiple = false,
  maxSize = 50 * 1024 * 1024,
  className,
  disabled = false,
}) => {
  const [isDragActive, setIsDragActive] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragActive(e.type === 'dragenter' || e.type === 'dragover');
    }
  }, [disabled]);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragActive(false);

      if (!disabled) {
        const files = Array.from(e.dataTransfer.files);
        onFilesSelected(files);
      }
    },
    [onFilesSelected, disabled]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        const files = Array.from(e.target.files);
        onFilesSelected(files);
      }
    },
    [onFilesSelected]
  );

  return (
    <div
      className={cn(
        'relative',
        className
      )}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple={multiple}
        accept={accept}
        onChange={handleChange}
        className="hidden"
        disabled={disabled}
      />

      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={disabled}
        className={cn(
          'w-full px-6 py-12 border-2 border-dashed rounded-xl transition-all duration-200',
          'flex flex-col items-center justify-center gap-4',
          'text-center cursor-pointer',
          disabled && 'opacity-50 cursor-not-allowed',
          isDragActive
            ? 'border-primary-500 bg-primary-50 dark:bg-dark-700'
            : 'border-gray-300 bg-gray-50 hover:border-primary-500 hover:bg-primary-50 dark:border-dark-600 dark:bg-dark-800 dark:hover:border-primary-400'
        )}
      >
        <div className={cn(
          'p-3 rounded-full',
          isDragActive
            ? 'bg-primary-100 text-primary-600 dark:bg-primary-900'
            : 'bg-gray-200 text-gray-600 dark:bg-dark-700 dark:text-gray-400'
        )}>
          <Upload className="w-6 h-6" />
        </div>

        <div>
          <p className="font-semibold text-gray-900 dark:text-white">
            {isDragActive ? 'Drop files here' : 'Drag and drop your files here'}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            or click to select files
          </p>
        </div>

        <p className="text-xs text-gray-400 dark:text-gray-500">
          Max file size: {(maxSize / 1024 / 1024).toFixed(0)}MB
        </p>
      </button>
    </div>
  );
};
