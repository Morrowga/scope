import * as ImageManipulator from 'expo-image-manipulator';

/** Resize + compress an image and return base64 (no data: prefix). */
export const compressImage = async (uri: string): Promise<string> => {
  const result = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: 800 } }],
    { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG, base64: true }
  );
  return result.base64 ?? '';
};

/** Crop a normalized region then resize + compress, returning base64. */
export const cropAndCompress = async (
  uri: string,
  imageWidth: number,
  imageHeight: number,
  normalized: { x: number; y: number; width: number; height: number }
): Promise<string> => {
  const crop = {
    originX: Math.round(normalized.x * imageWidth),
    originY: Math.round(normalized.y * imageHeight),
    width: Math.round(normalized.width * imageWidth),
    height: Math.round(normalized.height * imageHeight),
  };
  const result = await ImageManipulator.manipulateAsync(
    uri,
    [{ crop }, { resize: { width: 800 } }],
    { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG, base64: true }
  );
  return result.base64 ?? '';
};

/** Produce a small thumbnail uri for history rows. */
export const makeThumbnail = async (uri: string): Promise<string> => {
  const result = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: 200 } }],
    { compress: 0.6, format: ImageManipulator.SaveFormat.JPEG }
  );
  return result.uri;
};
