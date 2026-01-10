import * as ImageManipulator from 'expo-image-manipulator';
import { File } from 'expo-file-system';

/**
 * Compresses an image from the given URI and returns the new compressed URI.
 * Also logs original & compressed sizes (in human-readable format).
 *
 * @param imageUri - Local URI of the image (file://...) from ImagePicker, Camera, etc.
 * @param options - Compression settings
 * @returns Promise<string> - URI of the compressed image
 */
export async function compressImage(
  imageUri: string,
  options: {
    compress?: number;           // 0 to 1 (default: 0.6 → ~60% quality)
    maxWidth?: number;           // Optional resize (keeps aspect ratio)
    format?: ImageManipulator.SaveFormat; // JPEG (default) or PNG
    logPrefix?: string;          // Optional prefix for logs
  } = {}
): Promise<string> {
  const {
    compress = 0.6,
    maxWidth,
    format = ImageManipulator.SaveFormat.JPEG,
    logPrefix = '[Image Compress]',
  } = options;

  try {
    // 1. Get original size
    const originalFile = new File(imageUri);
    const originalSizeBytes = originalFile.size || 0;

    const originalSizeStr = formatBytes(originalSizeBytes);
    console.log(`${logPrefix} Original: ${originalSizeStr} (${originalSizeBytes} bytes)`);

    if (originalSizeBytes === 0) {
      console.warn(`${logPrefix} Could not determine original file size`);
    }

    // 2. Prepare manipulations
    const manipulations: ImageManipulator.Action[] = [];

    if (maxWidth) {
      manipulations.push({
        resize: {
          width: maxWidth,
          // height is auto-calculated to preserve aspect ratio
        },
      });
    }

    // 3. Compress / resize
    const result = await ImageManipulator.manipulateAsync(
      imageUri,
      manipulations,
      {
        compress,
        format,
      }
    );

    // 4. Get compressed size
    const compressedFile = new File(result.uri);
    const compressedSizeBytes = compressedFile.size || 0;

    const compressedSizeStr = formatBytes(compressedSizeBytes);
    console.log(`${logPrefix} Compressed: ${compressedSizeStr} (${compressedSizeBytes} bytes)`);

    const reduction = originalSizeBytes > 0
      ? Math.round(((originalSizeBytes - compressedSizeBytes) / originalSizeBytes) * 100)
      : 0;

    console.log(`${logPrefix} Size reduction: ${reduction}%`);

    return result.uri;
  } catch (error) {
    console.error(`${logPrefix} Compression failed:`, error);
    throw error; // or return originalUri if you want fallback
  }
}

/**
 * Format bytes to human readable format (KB, MB, GB...)
 */
function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}