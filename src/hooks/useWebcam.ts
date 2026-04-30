import { useRef, useState, useCallback, useEffect } from 'react';
import type { CapturedPhoto } from '../types/capture';

interface UseWebcamOptions {
  quality?: 'balanced' | 'high';
  mirrored?: boolean;
}

interface UseWebcamReturn {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  stream: MediaStream | null;
  error: string | null;
  isReady: boolean;
  captureFrame: () => CapturedPhoto | null;
  stopStream: () => void;
}

const QUALITY_CONSTRAINTS: Record<'balanced' | 'high', MediaTrackConstraints> = {
  balanced: { width: { ideal: 640 }, height: { ideal: 480 } },
  high: { width: { ideal: 1280 }, height: { ideal: 720 } },
};

export function useWebcam(options: UseWebcamOptions = {}): UseWebcamReturn {
  const { quality = 'balanced' } = options;
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const photoCountRef = useRef(0);

  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setStream(null);
    setIsReady(false);
  }, []);

  const startStream = useCallback(async () => {
    // Check if getUserMedia is supported
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError(
        "Your browser doesn't support camera access. Please use a modern browser like Chrome, Firefox, or Edge.",
      );
      return;
    }

    try {
      // Stop any existing stream first
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }

      const constraints: MediaStreamConstraints = {
        video: QUALITY_CONSTRAINTS[quality],
        audio: false,
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = mediaStream;
      setStream(mediaStream);
      setError(null);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          setIsReady(true);
        };
      }
    } catch (err) {
      const domError = err as DOMException;
      if (domError.name === 'NotAllowedError' || domError.name === 'PermissionDeniedError') {
        setError(
          'Camera access is required to take photos. Please allow camera access in your browser settings.',
        );
      } else if (domError.name === 'NotFoundError' || domError.name === 'DevicesNotFoundError') {
        setError('No camera detected. Please connect a webcam and try again.');
      } else if (
        domError.name === 'NotReadableError' ||
        domError.name === 'TrackStartError'
      ) {
        setError(
          'Your camera is being used by another application. Please close it and try again.',
        );
      } else {
        setError('Unable to access camera. Please check your browser settings and try again.');
      }
    }
  }, [quality]);

  // Start stream on mount and when quality changes
  useEffect(() => {
    startStream();
    return () => {
      stopStream();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quality]);

  const captureFrame = useCallback((): CapturedPhoto | null => {
    const video = videoRef.current;
    if (!video || !isReady) return null;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const blobUrl = canvas.toDataURL('image/jpeg', 0.92);

    const index = photoCountRef.current;
    photoCountRef.current += 1;

    const photo: CapturedPhoto = {
      id: `photo-${Date.now()}-${index}`,
      index,
      blobUrl,
      imageData,
      timestamp: Date.now(),
    };

    return photo;
  }, [isReady]);

  return {
    videoRef,
    stream,
    error,
    isReady,
    captureFrame,
    stopStream,
  };
}
