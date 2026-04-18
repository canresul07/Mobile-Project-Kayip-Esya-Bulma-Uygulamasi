import Constants from 'expo-constants';
import {
  EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME,
  EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
} from '@env';

const extra = Constants.expoConfig?.extra ?? {};

const getMimeType = (uri) => {
  const lower = uri.toLowerCase();
  if (lower.includes('.png')) return 'image/png';
  if (lower.includes('.webp')) return 'image/webp';
  if (lower.includes('.gif')) return 'image/gif';
  return 'image/jpeg';
};

export async function uploadImageToCloudinary(imageUri, onProgress) {
  if (onProgress) onProgress(0);

  const cloudName = (extra.cloudinaryCloudName || EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME)?.trim();
  const uploadPreset = (extra.cloudinaryUploadPreset || EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET)?.trim();

  if (!cloudName || !uploadPreset) {
    return {
      success: false,
      error: 'Cloudinary configuration missing.',
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
      const msg = data?.error?.message || `HTTP ${response.status}`;
      return { success: false, error: msg };
    }

    if (!data.secure_url) {
      return { success: false, error: 'No secure_url in response.' };
    }

    if (onProgress) onProgress(100);

    return { success: true, url: data.secure_url };
  } catch (e) {
    return { success: false, error: e?.message || String(e) };
  }
}
