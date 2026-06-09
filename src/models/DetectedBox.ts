export type BoxCategory = 'person' | 'animal' | 'plant' | 'food' | 'object';

export interface DetectedBox {
  boxId: string;
  classLabel: string;
  confidence: number;
  // Normalized 0.0-1.0 coordinates relative to the preview/still image
  x: number;
  y: number;
  width: number;
  height: number;
  category: BoxCategory;
}
