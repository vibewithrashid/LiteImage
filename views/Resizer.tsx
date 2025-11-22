import React, { useState, useEffect } from 'react';
import { Download, Trash2, Settings2 } from 'lucide-react';
import DropZone from '../components/DropZone';
import ImageResultCard from '../components/ImageResultCard';
import { resizeImage, delay, downloadBlob } from '../utils';
import { AppSettings } from '../types';

interface ResizedFile {
  id: string;
  originalFile: File;
  status: 'pending' | 'processing' | 'done' | 'error';
  resultBlob?: Blob;
  resultFileName?: string;
  newSize?: number;
  newWidth?: number;
  newHeight?: number;
}

type ResizeMode = 'dimensions' | 'percentage';

interface ResizerProps {
  settings: AppSettings;
}

const Resizer: React.FC<ResizerProps> = ({ settings }) => {
  const [files, setFiles] = useState<ResizedFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Configuration
  const [mode, setMode] = useState<ResizeMode>(settings.defaultResizeMode);
  const [targetWidth, setTargetWidth] = useState<string>('800');
  const [targetHeight, setTargetHeight] = useState<string>('');
  const [percentage, setPercentage] = useState<number>(settings.defaultResizePercentage);
  const [maintainAspectRatio, setMaintainAspectRatio] = useState(true);

  // Sync defaults if settings change
  useEffect(() => {
    setMode(settings.defaultResizeMode);
    setPercentage(settings.defaultResizePercentage);
  }, [settings.defaultResizeMode, settings.defaultResizePercentage]);

  const handleFilesSelected = (newFiles: File[]) => {
    const mappedFiles = newFiles.map(f => ({
      id: Math.random().toString(36).substring(7),
      originalFile: f,
      status: 'pending' as const
    }));
    setFiles(prev => [...prev, ...mappedFiles]);
  };

  const processQueue = async () => {
    if (isProcessing) return;
    
    const pendingFiles = files.filter(f => f.status === 'pending');
    if (pendingFiles.length === 0) return;

    setIsProcessing(true);

    for (const fileItem of pendingFiles) {
      setFiles(prev => prev.map(f => f.id === fileItem.id ? { ...f, status: 'processing' } : f));
      
      try {
        await delay(300);
        
        let result;
        if (mode === 'percentage') {
           result = await resizeImage(fileItem.originalFile, {
             scale: percentage / 100
           });
        } else {
          const w = targetWidth ? parseInt(targetWidth) : null;
          const h = targetHeight ? parseInt(targetHeight) : null;
          result = await resizeImage(fileItem.originalFile, {
            targetWidth: w,
            targetHeight: h,
            maintainAspectRatio
          });
        }
        
        setFiles(prev => prev.map(f => f.id === fileItem.id ? {
          ...f,
          status: 'done',
          resultBlob: result.blob,
          resultFileName: result.fileName,
          newSize: result.blob.size,
          newWidth: result.width,
          newHeight: result.height
        } : f));

        // Auto Download Logic
        if (settings.autoDownload) {
            downloadBlob(result.blob, result.fileName);
            // Add significant delay to prevent browser from blocking subsequent downloads
            await delay(1000);
        }

      } catch (error) {
        console.error(error);
        setFiles(prev => prev.map(f => f.id === fileItem.id ? { ...f, status: 'error' } : f));
      }
    }

    setIsProcessing(false);
  };

  useEffect(() => {
    const hasPending = files.some(f => f.status === 'pending');
    if (hasPending && !isProcessing) {
      processQueue();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [files]);

  const handleDownload = (file: ResizedFile) => {
    if (file.resultBlob && file.resultFileName) {
      downloadBlob(file.resultBlob, file.resultFileName);
    }
  };

  const handleDownloadAll = async () => {
    const doneFiles = files.filter(f => f.status === 'done');
    for (const file of doneFiles) {
      handleDownload(file);
      // Increased delay to 1000ms to avoid browser blocking parallel downloads
      await delay(1000);
    }
  };

  const clearAll = () => {
    setFiles([]);
  };

  const doneCount = files.filter(f => f.status === 'done').length;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Image Resizer</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-2">Reduce image dimensions while maintaining quality.</p>
      </div>

      {/* Configuration Panel */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 mb-8 transition-colors">
        <div className="flex items-center justify-between mb-6 border-b border-slate-100 dark:border-slate-700 pb-4">
          <div className="flex items-center space-x-2 text-slate-800 dark:text-slate-200 font-semibold">
            <Settings2 className="w-5 h-5 text-primary-500" />
            <span>Resize Mode</span>
          </div>
          
          <div className="flex bg-slate-100 dark:bg-slate-700 p-1 rounded-lg">
            <button
              onClick={() => setMode('percentage')}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                mode === 'percentage' 
                ? 'bg-white dark:bg-slate-600 text-primary-600 dark:text-white shadow-sm' 
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              Percentage
            </button>
            <button
              onClick={() => setMode('dimensions')}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                mode === 'dimensions' 
                ? 'bg-white dark:bg-slate-600 text-primary-600 dark:text-white shadow-sm' 
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              Fixed Dimensions
            </button>
          </div>
        </div>
        
        {mode === 'dimensions' ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in duration-300">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Width (px)</label>
              <input
                type="number"
                value={targetWidth}
                onChange={(e) => setTargetWidth(e.target.value)}
                placeholder="Auto"
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Height (px)</label>
              <input
                type="number"
                value={targetHeight}
                onChange={(e) => setTargetHeight(e.target.value)}
                placeholder="Auto"
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
              />
            </div>
            <div className="flex items-center h-full pt-6">
              <label className="flex items-center space-x-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={maintainAspectRatio}
                  onChange={(e) => setMaintainAspectRatio(e.target.checked)}
                  className="w-4 h-4 text-primary-600 rounded border-slate-300 dark:border-slate-600 focus:ring-primary-500 bg-white dark:bg-slate-900"
                />
                <span className="text-sm text-slate-700 dark:text-slate-300">Maintain Aspect Ratio</span>
              </label>
            </div>
          </div>
        ) : (
          <div className="animate-in fade-in duration-300">
            <div className="flex justify-between mb-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Scale Percentage</label>
              <span className="text-sm font-semibold text-primary-600 dark:text-primary-400">{percentage}%</span>
            </div>
            <input
              type="range"
              min="1"
              max="100"
              value={percentage}
              onChange={(e) => setPercentage(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary-600 dark:accent-primary-500"
            />
            <div className="flex justify-between mt-1 text-xs text-slate-400 dark:text-slate-500">
              <span>1% (Tiny)</span>
              <span>100% (Original)</span>
            </div>
          </div>
        )}
      </div>

      <DropZone onFilesSelected={handleFilesSelected} title="Drop images to resize" />

      {files.length > 0 && (
        <div className="mt-8 space-y-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-slate-600 dark:text-slate-400 font-medium">
              {doneCount} / {files.length} processed
            </div>
            <div className="flex space-x-3">
              <button 
                onClick={clearAll}
                className="flex items-center px-3 py-1.5 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4 mr-2" /> Clear
              </button>
              {doneCount > 0 && (
                <button 
                  onClick={handleDownloadAll}
                  className="flex items-center px-4 py-1.5 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 dark:bg-primary-600 dark:hover:bg-primary-500 rounded-lg shadow-sm transition-all hover:shadow-md active:scale-95"
                >
                  <Download className="w-4 h-4 mr-2" /> Download All
                </button>
              )}
            </div>
          </div>

          <div className="space-y-3">
            {files.map(file => (
              <ImageResultCard
                key={file.id}
                file={file.originalFile}
                status={file.status}
                originalSize={file.originalFile.size}
                newSize={file.newSize}
                newWidth={file.newWidth}
                newHeight={file.newHeight}
                onDownload={() => handleDownload(file)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Resizer;