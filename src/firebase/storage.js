/**
 * İlan görselleri Cloudinary (unsigned upload preset) ile yüklenir.
 * .env: EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME, EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET
 * (Expo: process.env.EXPO_PUBLIC_* veya @env ile okunur.)
 */
import {
  EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME,
  EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
} from '@env';

const cloudNameFromEnv =
  (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME) ||
  EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;
const uploadPresetFromEnv =
  (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET) ||
  EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

const getMimeType = (uri) => {
  const lower = uri.toLowerCase();
  if (lower.includes('.png')) return 'image/png';
  if (lower.includes('.webp')) return 'image/webp';
  if (lower.includes('.gif')) return 'image/gif';
  return 'image/jpeg';
};

/**
 * @param {string} imageUri - expo-image-picker veya benzeri yerel URI
 * @param {(pct: number) => void} [onProgress] — fetch ile anlık ilerleme yok; imza korunur
 * @returns {Promise<{ success: true, url: string } | { success: false, error: string }>}
 */
export async function uploadImageToCloudinary(imageUri, onProgress) {
  if (onProgress) {
    onProgress(0);
  }

  const cloudName = cloudNameFromEnv?.trim();
  const uploadPreset = uploadPresetFromEnv?.trim();

  if (!cloudName || !uploadPreset) {
    return {
      success: false,
      error: 'Cloudinary eksik: .env içinde EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME ve EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET tanımlayın.',
    };
  }

  const endpoint = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

  try {
    const filename = imageUri.split('/').pop()?.split('?')[0] || 'upload.jpg';

    const formData = new FormData();
    formData.append('file', {
      uri: imageUri,
      type: getMimeType(imageUri),
      name: filename,
    });
    formData.append('upload_preset', uploadPreset);

    const response = await fetch(endpoint, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const msg =
        data?.error?.message ||
        (typeof data?.error === 'string' ? data.error : null) ||
        `HTTP ${response.status}`;
      return { success: false, error: msg };
    }

    if (!data.secure_url) {
      return { success: false, error: 'Cloudinary yanıtında secure_url yok.' };
    }

    if (onProgress) {
      onProgress(100);
    }

    return { success: true, url: data.secure_url };
  } catch (e) {
    return { success: false, error: e?.message || String(e) };
  }
}

/** Geriye dönük uyumluluk */
export const uploadItemImage = uploadImageToCloudinary;
