import AsyncStorage from '@react-native-async-storage/async-storage';
import { Config } from '../constants/config';

export interface FaceCheckResponse {
  has_face: boolean;
  face_url: string | null;
}

const FACE_SETUP_KEY = 'face_setup_done';

// Cache result locally so we don't re-check every time
export async function checkFace(deviceId: string): Promise<FaceCheckResponse> {
  // Check local cache first
  const cached = await AsyncStorage.getItem(FACE_SETUP_KEY);
  if (cached === 'true') {
    return { has_face: true, face_url: null };
  }

  // Otherwise check backend
  const res = await fetch(
    `${Config.apiBaseUrl}/api/v1/profile/face?device_id=${encodeURIComponent(deviceId)}`
  );
  if (!res.ok) throw new Error('Failed to check face');
  const data: FaceCheckResponse = await res.json();

  // Cache if face exists
  if (data.has_face) {
    await AsyncStorage.setItem(FACE_SETUP_KEY, 'true');
  }

  return data;
}

export async function saveFace(deviceId: string, imageBase64: string): Promise<void> {
  const res = await fetch(`${Config.apiBaseUrl}/api/v1/profile/face`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ device_id: deviceId, image_base64: imageBase64 }),
  });
  if (!res.ok) throw new Error('Failed to save face');

  // Mark as done locally so popup never shows again
  await AsyncStorage.setItem(FACE_SETUP_KEY, 'true');
}