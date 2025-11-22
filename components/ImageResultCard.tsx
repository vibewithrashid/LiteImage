import React from 'react';
import { CheckCircle, ArrowRight, Download, Loader2 } from 'lucide-react';
import { formatFileSize } from '../utils';

interface ImageResultCardProps {
  file: File;
  status: 'pending' | 'processing' | 'done' | 'error';
  originalSize: number;
  newSize?: number;
  newWidth?: number;
  newHeight?: number;
  savings?: number;
  blob?: Blob;
  onDownload: () => void;
}

const ImageResultCard: React.FC<ImageResultCardProps> = ({
  file,
  status,
  originalSize,
  newSize,
  newWidth,
  newHeight,
  savings,
  onDownload
}) => {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm flex items-center justify-between animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex items-center space-x-4 flex-1 min-w-0">
        {/* Icon/Status */}
        <div className="flex-shrink-0">
          {status === 'pending' && <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-400 dark:text-slate-500"><Loader2 className="w-5 h-5" /></div>}
          {status === 'processing' && <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-500"><Loader2 className="w-5 h-5 animate-spin" /></div>}
          {status === 'done' && <div className="w-10 h-10 rounded-full bg-green-50 dark:bg-green-900/20 flex items-center justify-center text-green-600 dark:text-green-500"><CheckCircle className="w-5 h-5" /></div>}
          {status === 'error' && <div className="w-10 h-10 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center text-red-500">!</div>}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate" title={file.name}>{file.name}</p>
          <div className="flex items-center text-xs text-slate-500 dark:text-slate-400 mt-0.5 space-x-2">
            <span>{formatFileSize(originalSize)}</span>
            {status === 'done' && newSize && (
              <>
                <ArrowRight className="w-3 h-3" />
                <span className="font-semibold text-slate-700 dark:text-slate-300">{formatFileSize(newSize)}</span>
              </>
            )}
             {status === 'done' && newWidth && newHeight && (
              <span className="bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-300 ml-2">
                {newWidth}x{newHeight}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Actions/Stats */}
      <div className="flex items-center space-x-4 ml-4">
        {status === 'done' && savings !== undefined && (
          <span className={`text-xs font-bold px-2 py-1 rounded-full whitespace-nowrap ${
            savings > 0 
              ? 'text-green-600 bg-green-50 dark:bg-green-900/30 dark:text-green-400' 
              : 'text-slate-600 bg-slate-100 dark:bg-slate-700 dark:text-slate-300'
          }`}>
            {savings > 0 ? '-' : ''}{Math.abs(savings).toFixed(0)}%
          </span>
        )}
        
        {status === 'done' && (
          <button 
            onClick={onDownload}
            className="p-2 text-slate-400 dark:text-slate-500 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/30 rounded-full transition-colors"
            title="Download"
          >
            <Download className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
};

export default ImageResultCard;