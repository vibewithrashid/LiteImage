import React, { useRef, useState } from 'react';
import { UploadCloud } from 'lucide-react';

interface DropZoneProps {
  onFilesSelected: (files: File[]) => void;
  accept?: string;
  title?: string;
  subtitle?: string;
  disabled?: boolean;
}

const DropZone: React.FC<DropZoneProps> = ({ 
  onFilesSelected, 
  accept = "image/png, image/jpeg, image/webp",
  title = "Drag & Drop images here",
  subtitle = "or click to browse files",
  disabled = false
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFilesSelected(Array.from(e.dataTransfer.files));
    }
  };

  const handleClick = () => {
    if (!disabled) inputRef.current?.click();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFilesSelected(Array.from(e.target.files));
    }
    // Reset input value so the same file can be selected again if needed
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  return (
    <div
      onClick={handleClick}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-200
        ${disabled ? 'opacity-50 cursor-not-allowed border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900' : ''}
        ${isDragging 
          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 scale-[1.02]' 
          : 'border-slate-300 dark:border-slate-600 hover:border-primary-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 bg-white dark:bg-slate-800'}
      `}
    >
      <input
        type="file"
        ref={inputRef}
        className="hidden"
        multiple
        accept={accept}
        onChange={handleInputChange}
        disabled={disabled}
      />
      
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className={`p-4 rounded-full ${isDragging ? 'bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'}`}>
          <UploadCloud className="w-8 h-8" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200">{title}</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{subtitle}</p>
        </div>
      </div>
    </div>
  );
};

export default DropZone;