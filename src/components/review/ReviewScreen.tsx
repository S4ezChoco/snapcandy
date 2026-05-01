import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePhotoboothStore } from '../../store/usePhotoboothStore';
import PhotoGrid from './PhotoGrid';
import ConfirmationDialog from '../shared/ConfirmationDialog';

export default function ReviewScreen() {
  const navigate = useNavigate();

  const capturedPhotos = usePhotoboothStore((s) => s.capturedPhotos);
  const clearPhotos = usePhotoboothStore((s) => s.clearPhotos);

  const [showRetakeAllConfirm, setShowRetakeAllConfirm] = useState(false);

  const handleRetake = (index: number) => {
    usePhotoboothStore.setState({ retakeIndex: index });
    navigate('/capture');
  };

  const handleRetakeAll = () => {
    clearPhotos();
    navigate('/capture');
  };

  const handleLooksGood = () => {
    navigate('/customize');
  };

  return (
    <div
      data-testid="review-screen"
      className="flex flex-col items-center px-6 py-6 max-w-5xl mx-auto"
    >
      {/* Header */}
      <p className="text-xs tracking-[0.25em] uppercase text-accent font-semibold mb-2">
        Step 4 of 6
      </p>
      <h1 className="font-heading text-3xl md:text-4xl text-white mb-2">
        How do they <span className="text-accent italic">look?</span>
      </h1>
      <p className="text-white/60 text-sm mb-8">
        Review your photos below. Retake any you&apos;re not happy with, or continue to customize your strip.
      </p>

      {/* Photo grid */}
      <PhotoGrid photos={capturedPhotos} onRetake={handleRetake} />

      {/* Action buttons */}
      <div className="flex items-center gap-4 mt-10">
        <button
          type="button"
          data-testid="retake-all-button"
          onClick={() => setShowRetakeAllConfirm(true)}
          className="rounded-full px-6 py-3 text-sm font-semibold text-white/70 bg-white/5 border border-white/10 hover:bg-white/10 hover:text-white transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent/50"
        >
          Retake All
        </button>

        <button
          type="button"
          data-testid="looks-good-button"
          onClick={handleLooksGood}
          className="rounded-full px-10 py-3 text-base font-semibold bg-accent text-white shadow-md shadow-accent/30 hover:scale-105 hover:shadow-lg hover:shadow-accent/40 transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent/60 focus:ring-offset-2 focus:ring-offset-dark-teal"
        >
          Looks Good!
        </button>
      </div>

      {/* Confirmation dialog for Retake All */}
      <ConfirmationDialog
        open={showRetakeAllConfirm}
        title="Retake All Photos?"
        message="This will discard all captured photos. You'll need to take them again."
        confirmLabel="Retake All"
        variant="danger"
        onConfirm={() => {
          setShowRetakeAllConfirm(false);
          handleRetakeAll();
        }}
        onCancel={() => setShowRetakeAllConfirm(false)}
      />
    </div>
  );
}
