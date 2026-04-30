import { downloadBlob } from './download';

/**
 * Attempts to share a blob using the Web Share API.
 * Falls back to copying to clipboard, then to downloading.
 */
export async function shareOrCopy(blob: Blob, title: string): Promise<void> {
  // Try Web Share API first
  if (navigator.share && typeof File !== 'undefined') {
    try {
      const file = new File([blob], `${title}.jpg`, { type: blob.type });
      await navigator.share({
        title,
        files: [file],
      });
      return;
    } catch (err) {
      // User cancelled or share failed — fall through to clipboard
      if (err instanceof Error && err.name === 'AbortError') {
        return; // User cancelled, don't fall through
      }
    }
  }

  // Try clipboard API
  if (navigator.clipboard && typeof ClipboardItem !== 'undefined') {
    try {
      const item = new ClipboardItem({ [blob.type]: blob });
      await navigator.clipboard.write([item]);
      return;
    } catch {
      // Clipboard failed — fall through to download
    }
  }

  // Final fallback: download
  downloadBlob(blob, `${title}.jpg`);
}
