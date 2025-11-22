export interface AppSettings {
  autoDownload: boolean;
  defaultQuality: number;
  defaultResizePercentage: number;
  defaultResizeMode: 'dimensions' | 'percentage';
}

export const DEFAULT_SETTINGS: AppSettings = {
  autoDownload: false,
  defaultQuality: 75,
  defaultResizePercentage: 50,
  defaultResizeMode: 'percentage'
};