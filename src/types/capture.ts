export interface CapturedPhoto {
  id: string;
  index: number;
  blobUrl: string;
  imageData: ImageData;
  timestamp: number;
}

export interface CaptureSettings {
  mode: 'manual' | 'auto';
  timerSeconds: 3 | 5 | 10;
  mirrored: boolean;
  fullscreen: boolean;
  quality: 'balanced' | 'high';
}
