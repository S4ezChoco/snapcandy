import type { LayoutConfig } from '../../types/layout';
import type { ThemeConfig } from '../../types/theme';
import type { CapturedPhoto } from '../../types/capture';
import type { Customization } from '../../types/customization';
import { renderFull } from '../CanvasRenderer';

/**
 * Renders the photo strip at full resolution (min 1200px longest side)
 * and exports it as a JPEG Blob.
 */
export async function exportAsJpg(
  layout: LayoutConfig,
  theme: ThemeConfig,
  photos: CapturedPhoto[],
  customizations: Customization
): Promise<Blob> {
  const canvas = document.createElement('canvas');
  await renderFull(canvas, layout, theme, photos, customizations, 1200);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to export canvas as JPG'));
        }
      },
      'image/jpeg',
      0.92
    );
  });
}
