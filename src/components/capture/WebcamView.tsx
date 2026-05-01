import type { RefObject } from 'react';
import SkeletonLoader from '../shared/SkeletonLoader';

interface WebcamViewProps {
  videoRef: RefObject<HTMLVideoElement | null>;
  mirrored: boolean;
  error: string | null;
  isReady: boolean;
  countdownValue?: number | null;
}

export default function WebcamView({
  videoRef,
  mirrored,
  error,
  isReady,
  countdownValue,
}: WebcamViewProps) {
  if (error) {
    return (
      <div
        data-testid="webcam-error"
        className="relative w-full max-w-[40rem] aspect-[4/3] rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center"
      >
        <div className="text-center px-8">
          <div className="text-4xl mb-4"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-white/60 mx-auto"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg></div>
          <p className="text-white/70 text-sm leading-relaxed">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      data-testid="webcam-view"
      className="relative w-full max-w-[40rem] aspect-[4/3]"
    >
      {/* Styled frame with corner brackets */}
      <div className="absolute inset-0 pointer-events-none z-10">
        {/* Top-left corner */}
        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-accent rounded-tl-lg" />
        {/* Top-right corner */}
        <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-accent rounded-tr-lg" />
        {/* Bottom-left corner */}
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-accent rounded-bl-lg" />
        {/* Bottom-right corner */}
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-accent rounded-br-lg" />
      </div>

      {/* Video element */}
      <video
        ref={videoRef}
        data-testid="webcam-video"
        autoPlay
        playsInline
        muted
        className={[
          'w-full h-full object-cover rounded-2xl bg-black/50',
          mirrored ? 'scale-x-[-1]' : '',
        ].join(' ')}
      />

      {/* Loading state — skeleton loader while webcam initializes */}
      {!isReady && !error && (
        <div className="absolute inset-0 z-10">
          <SkeletonLoader
            width="100%"
            height="100%"
            borderRadius="1rem"
            className="absolute inset-0"
          />
        </div>
      )}

      {/* Countdown overlay */}
      {countdownValue != null && countdownValue > 0 && (
        <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/40 z-20">
          <span className="text-8xl font-semibold text-white drop-shadow-lg animate-pulse">
            {countdownValue}
          </span>
        </div>
      )}
    </div>
  );
}
