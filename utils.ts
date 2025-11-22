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

/**
 * Compresses an image and converts it to WebP.
 */
export const compressToWebP = async (file: File, quality = 0.75): Promise<ProcessedImageResult> => {
  const img = await loadImage(file);
  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext('2d');
  
  if (!ctx) throw new Error('Could not get canvas context');
  
  ctx.drawImage(img, 0, 0);
  
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve({
            blob,
            width: img.width,
            height: img.height,
            // Change extension to .webp
            fileName: file.name.replace(/\.[^/.]+$/, "") + ".webp" 
          });
        } else {
          reject(new Error('Canvas to Blob failed'));
        }
      },
      'image/webp',
      quality
    );
  });
};

export interface ResizeOptions {
  targetWidth?: number | null;
  targetHeight?: number | null;
  scale?: number | null; // 0.0 to 1.0
  maintainAspectRatio?: boolean;
}

/**
 * Resizes an image based on dimensions or scale.
 */
export const resizeImage = async (
  file: File, 
  options: ResizeOptions
): Promise<ProcessedImageResult> => {
  const { 
    targetWidth, 
    targetHeight, 
    scale, 
    maintainAspectRatio = true 
  } = options;

  const img = await loadImage(file);
  
  let finalWidth = img.width;
  let finalHeight = img.height;

  if (scale) {
    // Percentage based resizing
    finalWidth = Math.round(img.width * scale);
    finalHeight = Math.round(img.height * scale);
  } else {
    // Dimension based resizing
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
  
  // Better quality scaling
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  return new Promise((resolve, reject) => {
    let mimeType = file.type;
    if (mimeType === 'image/svg+xml') mimeType = 'image/png'; 

    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve({
            blob,
            width: canvas.width,
            height: canvas.height,
            fileName: file.name 
          });
        } else {
          reject(new Error('Canvas to Blob failed'));
        }
      },
      mimeType,
      0.90 
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