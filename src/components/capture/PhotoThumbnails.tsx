import type { CapturedPhoto } from '../../types/capture';

interface PhotoThumbnailsProps {
  photos: CapturedPhoto[];
  totalSlots: number;
}

export default function PhotoThumbnails({ photos, totalSlots }: PhotoThumbnailsProps) {
  const slots = Array.from({ length: totalSlots }, (_, i) => photos[i] ?? null);

  return (
    <div
      data-testid="photo-thumbnails"
      className="flex flex-row lg:flex-col gap-3 lg:w-24"
    >
      {slots.map((photo, index) => (
        <div
          key={photo?.id ?? `slot-${index}`}
          data-testid={`thumbnail-slot-${index}`}
          className={[
            'w-24 h-18 rounded-xl border overflow-hidden flex items-center justify-center transition-all duration-200',
            photo
              ? 'border-accent/40 bg-black/30 animate-thumbnail-bounce'
              : 'border-white/10 bg-white/5',
          ].join(' ')}
        >
          {photo ? (
            <img
              src={photo.blobUrl}
              alt={`Photo ${index + 1}`}
              className="w-full h-full object-cover"
            />
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-white/20"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
          )}
        </div>
      ))}
    </div>
  );
}
