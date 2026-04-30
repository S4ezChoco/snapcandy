import { useRef } from 'react';
import { usePhotoboothStore } from '../../store/usePhotoboothStore';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/svg+xml'];

export default function LogoUploader() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const customizations = usePhotoboothStore((s) => s.customizations);
  const updateCustomizations = usePhotoboothStore((s) => s.updateCustomizations);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ACCEPTED_TYPES.includes(file.type)) {
      alert('Please upload a PNG, JPG, or SVG file.');
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      alert('Logo file is too large. Please use an image under 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      // Load image to get natural dimensions for proper aspect ratio
      const img = new Image();
      img.onload = () => {
        const aspect = img.naturalWidth / img.naturalHeight;
        // Logo takes up ~12% of strip width, height calculated from aspect ratio
        const logoW = 0.12;
        const logoH = logoW / aspect;
        // Place at bottom-left corner of the strip
        updateCustomizations({
          logo: {
            imageDataUrl: dataUrl,
            x: 0.02,
            y: 1 - logoH - 0.02,
            width: logoW,
            height: logoH,
          },
        });
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  const removeLogo = () => {
    updateCustomizations({ logo: null });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="p-4 space-y-4" data-testid="logo-uploader">
      <input
        ref={fileInputRef}
        type="file"
        accept=".png,.jpg,.jpeg,.svg"
        onChange={handleFileChange}
        className="hidden"
        data-testid="logo-file-input"
      />

      {!customizations.logo ? (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="w-full py-6 rounded-lg border-2 border-dashed border-white/20 bg-white/5 hover:bg-white/10 hover:border-accent/40 transition-all duration-200 cursor-pointer flex flex-col items-center gap-2"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-white/50"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          <span className="text-sm text-white/70">Upload Logo</span>
          <span className="text-xs text-white/40">PNG, JPG, or SVG · Max 5MB</span>
        </button>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-center p-4 rounded-lg bg-white/5 border border-white/10">
            <img
              src={customizations.logo.imageDataUrl}
              alt="Logo preview"
              className="max-h-20 max-w-full object-contain"
              data-testid="logo-preview"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 py-2 text-sm rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer text-white/70"
            >
              Replace
            </button>
            <button
              type="button"
              onClick={removeLogo}
              className="flex-1 py-2 text-sm rounded-lg bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-colors cursor-pointer text-red-400"
            >
              Remove
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
