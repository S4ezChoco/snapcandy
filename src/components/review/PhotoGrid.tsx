import type { CapturedPhoto } from '../../types/capture';

interface PhotoGridProps {
  photos: CapturedPhoto[];
  onRetake: (index: number) => void;
}

export default function PhotoGrid({ photos, onRetake }: PhotoGridProps) {
  return (
    <div
      data-testid="photo-grid"
      className="flex flex-wrap justify-center gap-5"
    >
      {photos.map((photo, index) => (
        <div
          key={photo.id}
          data-testid={`photo-card-${index}`}
          className="relative group rounded-xl border border-white/10 bg-white/5 overflow-hidden transition-all duration-200 hover:border-accent/40 hover:shadow-lg hover:shadow-accent/10 hover:scale-[1.02] w-[220px]"
        >
          {/* Number label */}
          <span
            data-testid={`photo-label-${index}`}
            className="absolute top-2 left-2 z-10 bg-black/60 text-white text-xs font-bold px-2 py-0.5 rounded-md"
          >
            #{index + 1}
          </span>

          {/* Photo image */}
          <img
            src={photo.blobUrl}
            alt={`Captured photo ${index + 1}`}
            className="w-full aspect-[4/3] object-cover"
          />

          {/* Retake button */}
          <button
            type="button"
            data-testid={`retake-button-${index}`}
            onClick={() => onRetake(index)}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-gray-900 text-white text-xs font-semibold uppercase tracking-wider hover:bg-gray-800 transition-colors duration-150 cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent/50"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-3.5 h-3.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
            Retake
          </button>
        </div>
      ))}
    </div>
  );
}
