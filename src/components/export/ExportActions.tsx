import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePhotoboothStore } from '../../store/usePhotoboothStore';
import { exportAsJpg } from '../../renderer/exporters/jpgExporter';
import { exportAsGif } from '../../renderer/exporters/gifExporter';
import { downloadBlob } from '../../utils/download';
import { shareOrCopy } from '../../utils/share';

const DownloadIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="7 10 12 15 17 10"/>
    <line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
);

const GifIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="2"/>
    <path d="M10 8H7a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h3"/>
    <line x1="10" y1="12" x2="8" y2="12"/>
    <line x1="13" y1="8" x2="13" y2="16"/>
    <path d="M16 8h2a1 1 0 0 1 1 1v2"/>
    <line x1="16" y1="12" x2="18" y2="12"/>
  </svg>
);

const ShareIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="18" cy="5" r="3"/>
    <circle cx="6" cy="12" r="3"/>
    <circle cx="18" cy="19" r="3"/>
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
  </svg>
);

const CameraIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
    <circle cx="12" cy="13" r="4"/>
  </svg>
);

const PaletteIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <circle cx="12" cy="8" r="1.5" fill="currentColor"/>
    <circle cx="8" cy="12" r="1.5" fill="currentColor"/>
    <circle cx="16" cy="12" r="1.5" fill="currentColor"/>
    <circle cx="12" cy="16" r="1.5" fill="currentColor"/>
  </svg>
);

export default function ExportActions() {
  const navigate = useNavigate();

  const selectedLayout = usePhotoboothStore((s) => s.selectedLayout);
  const selectedTheme = usePhotoboothStore((s) => s.selectedTheme);
  const capturedPhotos = usePhotoboothStore((s) => s.capturedPhotos);
  const customizations = usePhotoboothStore((s) => s.customizations);
  const resetAll = usePhotoboothStore((s) => s.resetAll);

  const [isExporting, setIsExporting] = useState(false);
  const [exportType, setExportType] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const handleExport = useCallback(
    async (type: 'jpg' | 'gif' | 'share') => {
      if (!selectedLayout || !selectedTheme || isExporting) return;

      setIsExporting(true);
      setExportType(type);
      setProgress(0);

      try {
        let blob: Blob;

        switch (type) {
          case 'jpg':
            blob = await exportAsJpg(
              selectedLayout,
              selectedTheme,
              capturedPhotos,
              customizations
            );
            downloadBlob(blob, 'snapcandy-strip.jpg');
            break;

          case 'gif':
            blob = await exportAsGif(
              selectedLayout,
              selectedTheme,
              capturedPhotos,
              customizations,
              setProgress
            );
            downloadBlob(blob, 'snapcandy-strip.gif');
            break;

          case 'share':
            blob = await exportAsJpg(
              selectedLayout,
              selectedTheme,
              capturedPhotos,
              customizations
            );
            await shareOrCopy(blob, 'My SnapCandy Strip');
            break;
        }
      } catch (err) {
        console.error(`Export failed (${type}):`, err);
      } finally {
        setIsExporting(false);
        setExportType(null);
        setProgress(0);
      }
    },
    [selectedLayout, selectedTheme, capturedPhotos, customizations, isExporting]
  );

  return (
    <div className="flex flex-col gap-3 w-full" data-testid="export-actions">
      {/* Primary export */}
      <button
        type="button"
        onClick={() => handleExport('jpg')}
        disabled={isExporting}
        className="w-full rounded-full px-6 py-3 text-sm font-semibold bg-accent text-white shadow-lg shadow-accent/30 hover:scale-[1.02] hover:shadow-xl hover:shadow-accent/40 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 focus:outline-none focus:ring-2 focus:ring-accent/60 flex items-center justify-center gap-2"
        data-testid="save-jpg-button"
      >
        <DownloadIcon />
        {isExporting && exportType === 'jpg' ? 'Saving...' : 'Save as JPG'}
      </button>

      {/* GIF export */}
      <button
        type="button"
        onClick={() => handleExport('gif')}
        disabled={isExporting}
        className="w-full rounded-full px-6 py-3 text-sm font-semibold bg-white/10 text-white border border-white/15 hover:bg-white/15 hover:scale-[1.02] transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 focus:outline-none focus:ring-2 focus:ring-accent/50 flex items-center justify-center gap-2"
        data-testid="save-gif-button"
      >
        <GifIcon />
        {isExporting && exportType === 'gif'
          ? `Creating GIF... ${progress}%`
          : 'Save as GIF'}
      </button>

      {/* Share */}
      <button
        type="button"
        onClick={() => handleExport('share')}
        disabled={isExporting}
        className="w-full rounded-full px-6 py-3 text-sm font-semibold bg-white/10 text-white border border-white/15 hover:bg-white/15 hover:scale-[1.02] transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 focus:outline-none focus:ring-2 focus:ring-accent/50 flex items-center justify-center gap-2"
        data-testid="share-button"
      >
        <ShareIcon />
        {isExporting && exportType === 'share' ? 'Sharing...' : 'Share'}
      </button>

      {/* Progress bar for GIF */}
      {isExporting && exportType === 'gif' && (
        <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden" data-testid="export-progress">
          <div
            className="h-full bg-accent rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* Divider */}
      <div className="border-t border-white/10 my-1" />

      {/* Navigation actions */}
      <button
        type="button"
        onClick={() => navigate('/capture')}
        disabled={isExporting}
        className="w-full rounded-full px-6 py-2.5 text-sm font-semibold text-white/70 bg-white/5 border border-white/10 hover:bg-white/10 hover:text-white transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-accent/50 flex items-center justify-center gap-2"
        data-testid="retake-button"
      >
        <CameraIcon />
        Retake
      </button>

      <button
        type="button"
        onClick={() => { resetAll(); navigate('/layout'); }}
        disabled={isExporting}
        className="w-full rounded-full px-6 py-2.5 text-sm font-semibold text-white/70 bg-white/5 border border-white/10 hover:bg-white/10 hover:text-white transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-accent/50 flex items-center justify-center gap-2"
        data-testid="new-style-button"
      >
        <PaletteIcon />
        New Style
      </button>
    </div>
  );
}
