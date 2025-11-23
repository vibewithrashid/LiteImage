export interface AppSettings {
  autoDownload: boolean;
  defaultQuality: number;
  defaultResizeMode: 'none' | 'dimensions' | 'percentage';
  defaultResizePercentage: number;
  defaultOutputFormat: 'image/webp' | 'image/jpeg' | 'image/png';
}

export const DEFAULT_SETTINGS: AppSettings = {
  autoDownload: true,
  defaultQuality: 70,
  defaultResizeMode: 'none',
  defaultResizePercentage: 50,
  defaultOutputFormat: 'image/webp'
};