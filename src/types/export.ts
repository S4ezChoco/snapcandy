export type ExportFormat = 'jpg' | 'gif' | 'video';

export interface ExportOptions {
  format: ExportFormat;
  quality: number; // 0-1 for JPG
  minResolution: number; // minimum pixels on longest side
}
