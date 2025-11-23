import React, { useState, useEffect } from 'react';
import { Download, Trash2, Settings2, ImageIcon, Layers } from 'lucide-react';
import DropZone from '../components/DropZone';
import ImageResultCard from '../components/ImageResultCard';
import { processImage, delay, downloadBlob, formatFileSize } from '../utils';
import { AppSettings } from '../types';

interface ProcessedFile {
  id: string;
  originalFile: File;
  status: 'pending' | 'processing' | 'done' | 'error';
  resultBlob?: Blob;
  resultFileName?: string;
  newSize?: number;
  newWidth?: number;
  newHeight?: number;
}

interface DashboardProps {
  settings: AppSettings;
}

const Dashboard: React.FC<DashboardProps> = ({ settings }) => {
  const [files, setFiles] = useState<ProcessedFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // -- Configuration State --
  
  // Resize
  const [resizeMode, setResizeMode] = useState<'none' | 'dimensions' | 'percentage'>(settings.defaultResizeMode);
  const [percentage, setPercentage] = useState<number>(settings.defaultResizePercentage);
  const [targetWidth, setTargetWidth] = useState<string>('800');
  const [targetHeight, setTargetHeight] = useState<string>('');
  const [maintainAspectRatio, setMaintainAspectRatio] = useState(true);

  // Output / Compression
  const [format, setFormat] = useState<'image/webp' | 'image/jpeg' | 'image/png'>(settings.defaultOutputFormat);
  const [quality, setQuality] = useState<number>(settings.defaultQuality);

  // Sync with global settings when they change (optional, usually only on mount or reset)
  useEffect(() => {
    setResizeMode(settings.defaultResizeMode);
    setPercentage(settings.defaultResizePercentage);
    setFormat(settings.defaultOutputFormat);
    setQuality(settings.defaultQuality);
  }, [settings]);

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
        await delay(300); // UI breathing room
        
        const w = targetWidth ? parseInt(targetWidth) : undefined;
        const h = targetHeight ? parseInt(targetHeight) : undefined;

        const result = await processImage(fileItem.originalFile, {
          resizeMode,
          scale: percentage / 100,
          targetWidth: w,
          targetHeight: h,
          maintainAspectRatio,
          quality: quality / 100,
          format
        });
        
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
            await delay(1000); // Prevent browser blocking
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

  const handleDownload = (file: ProcessedFile) => {
    if (file.resultBlob && file.resultFileName) {
      downloadBlob(file.resultBlob, file.resultFileName);
    }
  };

  const handleDownloadAll = async () => {
    const doneFiles = files.filter(f => f.status === 'done');
    for (const file of doneFiles) {
      handleDownload(file);
      await delay(1000); // Delay to avoid browser blocking
    }
  };
  
  const clearAll = () => {
    setFiles([]);
  };

  const doneCount = files.filter(f => f.status === 'done').length;
  const totalSavings = files.reduce((acc, curr) => {
    if (curr.status === 'done' && curr.newSize) {
      return acc + (curr.originalFile.size - curr.newSize);
    }
    return acc;
  }, 0);

  return (
    <div className="max-w-4xl mx-auto px-4">
      {/* Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        
        {/* Resize Settings */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 transition-colors">
          <div className="flex items-center space-x-2 mb-4 text-slate-800 dark:text-slate-200 font-semibold border-b border-slate-100 dark:border-slate-700 pb-3">
            <ImageIcon className="w-5 h-5 text-primary-500" />
            <span>Resize Image</span>
          </div>

          <div className="space-y-4">
            <div className="flex p-1 bg-slate-100 dark:bg-slate-700 rounded-lg">
              {(['none', 'percentage', 'dimensions'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setResizeMode(m)}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${
                    resizeMode === m
                      ? 'bg-white dark:bg-slate-600 text-primary-600 dark:text-white shadow-sm'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                  }`}
                >
                  {m === 'none' ? 'No Resize' : m === 'percentage' ? 'Percentage' : 'Fixed'}
                </button>
              ))}
            </div>

            {resizeMode === 'percentage' && (
              <div className="animate-in fade-in duration-300">
                <div className="flex justify-between mb-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Scale</label>
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
              </div>
            )}

            {resizeMode === 'dimensions' && (
              <div className="grid grid-cols-2 gap-3 animate-in fade-in duration-300">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Width</label>
                  <input
                    type="number"
                    value={targetWidth}
                    onChange={(e) => setTargetWidth(e.target.value)}
                    placeholder="Auto"
                    className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-md text-sm outline-none focus:ring-1 focus:ring-primary-500 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Height</label>
                  <input
                    type="number"
                    value={targetHeight}
                    onChange={(e) => setTargetHeight(e.target.value)}
                    placeholder="Auto"
                    className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-md text-sm outline-none focus:ring-1 focus:ring-primary-500 dark:text-white"
                  />
                </div>
                <div className="col-span-2">
                  <label className="flex items-center space-x-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={maintainAspectRatio}
                      onChange={(e) => setMaintainAspectRatio(e.target.checked)}
                      className="w-4 h-4 text-primary-600 rounded border-slate-300 dark:border-slate-600 focus:ring-primary-500 bg-white dark:bg-slate-900"
                    />
                    <span className="text-sm text-slate-600 dark:text-slate-400">Maintain Aspect Ratio</span>
                  </label>
                </div>
              </div>
            )}
            
            {resizeMode === 'none' && (
              <div className="text-center py-4 text-sm text-slate-400 dark:text-slate-500 italic">
                Original dimensions will be kept.
              </div>
            )}
          </div>
        </div>

        {/* Compression Settings */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 transition-colors">
          <div className="flex items-center space-x-2 mb-4 text-slate-800 dark:text-slate-200 font-semibold border-b border-slate-100 dark:border-slate-700 pb-3">
            <Layers className="w-5 h-5 text-primary-500" />
            <span>Output & Compression</span>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Format</label>
              <div className="flex space-x-2">
                {(['image/webp', 'image/jpeg', 'image/png'] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFormat(f)}
                    className={`flex-1 px-2 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                      format === f
                        ? 'bg-primary-50 dark:bg-primary-900/30 border-primary-500 text-primary-700 dark:text-primary-300'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    {f.split('/')[1].toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Quality</label>
                <span className="text-sm font-semibold text-primary-600 dark:text-primary-400">{quality}%</span>
              </div>
              <input
                type="range"
                min="1"
                max="100"
                value={quality}
                onChange={(e) => setQuality(parseInt(e.target.value))}
                disabled={format === 'image/png'} // PNG is lossless
                className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${format === 'image/png' ? 'bg-slate-100 dark:bg-slate-700' : 'bg-slate-200 dark:bg-slate-700 accent-primary-600 dark:accent-primary-500'}`}
              />
              <div className="flex justify-between mt-1 text-xs text-slate-400 dark:text-slate-500">
                <span>Smaller Size</span>
                <span>Better Quality</span>
              </div>
              {format === 'image/png' && <p className="text-xs text-amber-500 mt-1">Quality ignored for PNG (Lossless)</p>}
            </div>
          </div>
        </div>
      </div>

      <DropZone onFilesSelected={handleFilesSelected} title="Drop images to process" />

      {files.length > 0 && (
        <div className="mt-8 space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div className="flex items-center justify-between">
            <div className="text-sm text-slate-600 dark:text-slate-400 font-medium">
              {doneCount} / {files.length} processed
              {totalSavings > 0 && <span className="ml-2 text-green-600 dark:text-green-400">({formatFileSize(totalSavings)} saved)</span>}
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
                savings={file.newSize ? ((file.originalFile.size - file.newSize) / file.originalFile.size) * 100 : undefined}
                onDownload={() => handleDownload(file)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;