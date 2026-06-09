import * as ImagePicker from 'expo-image-picker';

/** Request gallery permission; returns true if granted. */
export const ensureMediaLibraryPermission = async (): Promise<boolean> => {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  return status === 'granted';
};

/** Launch the gallery and return the picked image uri (or null). */
export const pickImageFromGallery = async (): Promise<string | null> => {
  const granted = await ensureMediaLibraryPermission();
  if (!granted) return null;
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    quality: 1,
    allowsEditing: false,
  });
  if (result.canceled || !result.assets?.length) return null;
  return result.assets[0].uri;
};
