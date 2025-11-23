/**
 * Formats a file size in bytes to a human-readable string (e.g., "1.5 MB").
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Loads an image file into an HTMLImageElement.
 */
export const loadImage = (file: File): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = (err) => reject(err);
    img.src = url;
  });
};

export interface ProcessedImageResult {
  blob: Blob;
  width: number;
  height: number;
  fileName: string;
}

export interface ProcessOptions {
  resizeMode: 'none' | 'dimensions' | 'percentage';
  scale?: number; // 0.0 to 1.0
  targetWidth?: number;
  targetHeight?: number;
  maintainAspectRatio?: boolean;
  quality: number; // 0.0 to 1.0
  format: 'image/webp' | 'image/jpeg' | 'image/png';
}

/**
 * Processes an image: resizes and compresses/converts format.
 */
export const processImage = async (
  file: File, 
  options: ProcessOptions
): Promise<ProcessedImageResult> => {
  const { 
    resizeMode,
    scale,
    targetWidth, 
    targetHeight, 
    maintainAspectRatio = true,
    quality,
    format
  } = options;

  const img = await loadImage(file);
  
  let finalWidth = img.width;
  let finalHeight = img.height;

  // Calculate new dimensions
  if (resizeMode === 'percentage' && scale) {
    finalWidth = Math.round(img.width * scale);
    finalHeight = Math.round(img.height * scale);
  } else if (resizeMode === 'dimensions') {
    if (maintainAspectRatio) {
      const ratio = img.width / img.height;
      if (targetWidth && !targetHeight) {
        finalWidth = targetWidth;
        finalHeight = targetWidth / ratio;
      } else if (!targetWidth && targetHeight) {
        finalHeight = targetHeight;
        finalWidth = targetHeight * ratio;
      } else if (targetWidth && targetHeight) {
        // Fit within box
        const scaleFactor = Math.min(targetWidth / img.width, targetHeight / img.height);
        finalWidth = img.width * scaleFactor;
        finalHeight = img.height * scaleFactor;
      }
    } else {
      if (targetWidth) finalWidth = targetWidth;
      if (targetHeight) finalHeight = targetHeight;
    }
  }

  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(finalWidth));
  canvas.height = Math.max(1, Math.round(finalHeight));
  const ctx = canvas.getContext('2d');

  if (!ctx) throw new Error('Could not get canvas context');
  
  // High quality scaling
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  // Determine file extension
  let extension = '';
  switch (format) {
    case 'image/webp': extension = '.webp'; break;
    case 'image/jpeg': extension = '.jpg'; break;
    case 'image/png': extension = '.png'; break;
    default: extension = '.webp';
  }

  const newFileName = file.name.replace(/\.[^/.]+$/, "") + extension;

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve({
            blob,
            width: canvas.width,
            height: canvas.height,
            fileName: newFileName 
          });
        } else {
          reject(new Error('Canvas to Blob failed'));
        }
      },
      format,
      quality
    );
  });
};

/**
 * Triggers a download for a blob.
 */
export const downloadBlob = (blob: Blob, fileName: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Helper to delay execution
 */
export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Compresses an image to WebP format.
 */
export const compressToWebP = async (file: File, quality: number): Promise<ProcessedImageResult> => {
  return processImage(file, {
    resizeMode: 'none',
    quality: quality,
    format: 'image/webp'
  });
};

export interface SimpleResizeOptions {
  scale?: number;
  targetWidth?: number | null;
  targetHeight?: number | null;
  maintainAspectRatio?: boolean;
}

/**
 * Resizes an image.
 */
export const resizeImage = async (file: File, options: SimpleResizeOptions): Promise<ProcessedImageResult> => {
  const { scale, targetWidth, targetHeight, maintainAspectRatio = true } = options;

  let resizeMode: 'none' | 'dimensions' | 'percentage' = 'none';
  if (scale) {
    resizeMode = 'percentage';
  } else if (targetWidth || targetHeight) {
    resizeMode = 'dimensions';
  }

  // Determine output format based on input, or default to JPEG
  let format: 'image/jpeg' | 'image/png' | 'image/webp' = 'image/jpeg';
  if (file.type === 'image/png') format = 'image/png';
  if (file.type === 'image/webp') format = 'image/webp';

  return processImage(file, {
    resizeMode,
    scale,
    targetWidth: targetWidth || undefined,
    targetHeight: targetHeight || undefined,
    maintainAspectRatio,
    quality: 0.9,
    format
  });
};