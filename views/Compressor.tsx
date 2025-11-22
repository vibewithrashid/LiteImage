import React, { useState, useEffect } from 'react';
import { Download, Trash2, Settings2 } from 'lucide-react';
import DropZone from '../components/DropZone';
import ImageResultCard from '../components/ImageResultCard';
import { compressToWebP, delay, downloadBlob, formatFileSize } from '../utils';
import { AppSettings } from '../types';

interface CompressedFile {
  id: string;
  originalFile: File;
  status: 'pending' | 'processing' | 'done' | 'error';
  resultBlob?: Blob;
  resultFileName?: string;
  newSize?: number;
  downloaded?: boolean;
}

interface CompressorProps {
  settings: AppSettings;
}

const Compressor: React.FC<CompressorProps> = ({ settings }) => {
  const [files, setFiles] = useState<CompressedFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [quality, setQuality] = useState<number>(settings.defaultQuality);

  // Update quality if default setting changes (optional, mostly for initialization but nice to sync)
  useEffect(() => {
    setQuality(settings.defaultQuality);
  }, [settings.defaultQuality]);

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
        // Convert 0-100 range to 0-1 for the function
        const result = await compressToWebP(fileItem.originalFile, quality / 100);
        
        setFiles(prev => prev.map(f => f.id === fileItem.id ? {
          ...f,
          status: 'done',
          resultBlob: result.blob,
          resultFileName: result.fileName,
          newSize: result.blob.size
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

  const handleDownload = (file: CompressedFile) => {
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
  const totalSavings = files.reduce((acc, curr) => {
    if (curr.status === 'done' && curr.newSize) {
      return acc + (curr.originalFile.size - curr.newSize);
    }
    return acc;
  }, 0);

  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">WebP Compressor</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-2">Compress images and convert them to WebP format automatically.</p>
      </div>

      {/* Configuration Panel */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 mb-8 transition-colors">
        <div className="flex items-center space-x-2 mb-4 text-slate-800 dark:text-slate-200 font-semibold">
          <Settings2 className="w-5 h-5 text-primary-500" />
          <span>Compression Percentage</span>
        </div>
        
        <div>
          <div className="flex justify-between mb-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Quality Level</label>
            <span className="text-sm font-semibold text-primary-600 dark:text-primary-400">{quality}%</span>
          </div>
          <input
            type="range"
            min="1"
            max="100"
            value={quality}
            onChange={(e) => setQuality(parseInt(e.target.value))}
            className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary-600 dark:accent-primary-500"
          />
          <div className="flex justify-between mt-1 text-xs text-slate-400 dark:text-slate-500">
            <span>Lower Quality (Smaller Size)</span>
            <span>Higher Quality (Larger Size)</span>
          </div>
        </div>
      </div>

      <DropZone onFilesSelected={handleFilesSelected} title="Drop images to compress" />

      {files.length > 0 && (
        <div className="mt-8 space-y-6">
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

export default Compressor;