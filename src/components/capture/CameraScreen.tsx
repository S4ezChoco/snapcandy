import { useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePhotoboothStore } from '../../store/usePhotoboothStore';
import { useWebcam } from '../../hooks/useWebcam';
import { useCountdown } from '../../hooks/useCountdown';
import WebcamView from './WebcamView';
import CaptureButton from './CaptureButton';
import CaptureControls from './CaptureControls';
import PhotoThumbnails from './PhotoThumbnails';

export default function CameraScreen() {
  const navigate = useNavigate();

  const selectedLayout = usePhotoboothStore((s) => s.selectedLayout);
  const capturedPhotos = usePhotoboothStore((s) => s.capturedPhotos);
  const captureSettings = usePhotoboothStore((s) => s.captureSettings);
  const retakeIndex = usePhotoboothStore((s) => s.retakeIndex);
  const addPhoto = usePhotoboothStore((s) => s.addPhoto);
  const replacePhoto = usePhotoboothStore((s) => s.replacePhoto);
  const setCaptureSettings = usePhotoboothStore((s) => s.setCaptureSettings);

  const photoCount = selectedLayout?.photoCount ?? 3;
  const capturedCount = capturedPhotos.length;
  const allCaptured = capturedCount >= photoCount;
  const isRetakeMode = retakeIndex !== null;

  const { videoRef, error, isReady, captureFrame, stopStream } = useWebcam({
    quality: captureSettings.quality,
    mirrored: captureSettings.mirrored,
  });

  const { count: countdownValue, isRunning: isCountingDown, start: startCountdown, reset: resetCountdown } = useCountdown();

  // Track whether auto-capture is actively running
  const autoRunningRef = useRef(false);

  // Cleanup stream on unmount
  useEffect(() => {
    return () => {
      stopStream();
      resetCountdown();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCapture = useCallback(() => {
    const photo = captureFrame();
    if (!photo) return;

    if (isRetakeMode && retakeIndex !== null) {
      replacePhoto(retakeIndex, { ...photo, index: retakeIndex });
      navigate('/review');
      return;
    }

    addPhoto({ ...photo, index: capturedCount });
  }, [captureFrame, isRetakeMode, retakeIndex, replacePhoto, addPhoto, capturedCount, navigate]);

  const handleManualCapture = useCallback(async () => {
    if (allCaptured && !isRetakeMode) return;
    // Always use countdown timer before capturing
    await startCountdown(captureSettings.timerSeconds);
    handleCapture();
  }, [allCaptured, isRetakeMode, handleCapture, startCountdown, captureSettings.timerSeconds]);

  const handleAutoCapture = useCallback(async () => {
    if (autoRunningRef.current) return;
    autoRunningRef.current = true;

    // In retake mode, just capture one photo with countdown
    if (isRetakeMode) {
      await startCountdown(captureSettings.timerSeconds);
      handleCapture();
      autoRunningRef.current = false;
      return;
    }

    // Capture remaining photos with countdown intervals
    const remaining = photoCount - capturedCount;
    for (let i = 0; i < remaining; i++) {
      if (!autoRunningRef.current) break;
      await startCountdown(captureSettings.timerSeconds);
      if (!autoRunningRef.current) break;

      const photo = captureFrame();
      if (photo) {
        addPhoto({ ...photo, index: capturedCount + i });
      }
    }

    autoRunningRef.current = false;
  }, [
    isRetakeMode,
    photoCount,
    capturedCount,
    captureSettings.timerSeconds,
    startCountdown,
    handleCapture,
    captureFrame,
    addPhoto,
  ]);

  const handleCaptureClick = useCallback(() => {
    if (isCountingDown) return; // Don't allow clicking during countdown
    if (captureSettings.mode === 'auto') {
      if (autoRunningRef.current) {
        // Stop auto capture
        autoRunningRef.current = false;
        resetCountdown();
      } else {
        handleAutoCapture();
      }
    } else {
      handleManualCapture();
    }
  }, [captureSettings.mode, handleAutoCapture, handleManualCapture, resetCountdown, isCountingDown]);

  // Handle fullscreen toggle
  useEffect(() => {
    const videoEl = videoRef.current;
    if (!videoEl) return;

    if (captureSettings.fullscreen) {
      videoEl.requestFullscreen?.().catch(() => {
        // Fullscreen not supported or denied — silently ignore
      });
    } else if (document.fullscreenElement) {
      document.exitFullscreen?.().catch(() => {});
    }
  }, [captureSettings.fullscreen, videoRef]);

  const handleNext = () => {
    stopStream();
    navigate('/review');
  };

  const handleBack = () => {
    stopStream();
    navigate('/theme');
  };

  // Determine the counter display
  const currentPhotoNumber = isRetakeMode
    ? (retakeIndex ?? 0) + 1
    : Math.min(capturedCount + 1, photoCount);
  const counterText = isRetakeMode
    ? `Retaking Photo ${currentPhotoNumber} of ${photoCount}`
    : `Photo ${currentPhotoNumber} of ${photoCount}`;

  const captureDisabled = (!isRetakeMode && allCaptured) || !isReady || !!error;

  return (
    <div
      data-testid="camera-screen"
      className="flex flex-col items-center px-6 py-6 max-w-6xl mx-auto"
    >
      {/* Header */}
      <p className="text-xs tracking-[0.25em] uppercase text-accent font-semibold mb-2">
        Step 3 of 6
      </p>
      <h1 className="font-heading text-3xl md:text-4xl text-white mb-2">
        Strike a <span className="text-accent italic">Pose</span>
      </h1>
      <p
        data-testid="photo-counter"
        className="text-white/50 text-sm mb-6"
      >
        {counterText}
      </p>

      {/* Main content: webcam + thumbnails */}
      <div className="flex gap-6 items-start w-full justify-center">
        {/* Webcam feed area */}
        <div className="flex flex-col items-center gap-5 flex-1 max-w-[640px]">
          <WebcamView
            videoRef={videoRef}
            mirrored={captureSettings.mirrored}
            error={error}
            isReady={isReady}
            countdownValue={isCountingDown ? countdownValue : null}
          />

          {/* Capture button */}
          <CaptureButton
            onClick={handleCaptureClick}
            disabled={captureDisabled}
          />

          {/* Controls */}
          <CaptureControls
            settings={captureSettings}
            onSettingsChange={setCaptureSettings}
          />
        </div>

        {/* Thumbnails panel on the right */}
        <div className="flex-shrink-0">
          <PhotoThumbnails
            photos={capturedPhotos}
            totalSlots={photoCount}
          />
        </div>
      </div>

      {/* Navigation buttons */}
      <div className="flex items-center gap-4 mt-8">
        <button
          type="button"
          data-testid="capture-back-button"
          onClick={handleBack}
          className="rounded-full px-6 py-3 text-sm font-semibold text-white/70 bg-white/5 border border-white/10 hover:bg-white/10 hover:text-white transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent/50"
        >
          &lt; Change Theme
        </button>

        <button
          type="button"
          data-testid="capture-next-button"
          disabled={!allCaptured || isRetakeMode}
          onClick={handleNext}
          className={[
            'rounded-full px-10 py-3 text-base font-semibold transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-accent/60 focus:ring-offset-2 focus:ring-offset-dark-teal',
            allCaptured && !isRetakeMode
              ? 'bg-accent text-white shadow-lg shadow-accent/30 hover:scale-105 hover:shadow-xl hover:shadow-accent/40 cursor-pointer'
              : 'bg-white/10 text-white/30 cursor-not-allowed',
          ].join(' ')}
        >
          Next
        </button>
      </div>
    </div>
  );
}
