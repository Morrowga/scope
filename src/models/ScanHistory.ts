import { MultiScanResult, ScanCategory } from './ScanResult';

export interface ScanHistory {
  id: string;                    // scan_id from backend
  previewName: string;           // first object name — shown in list
  previewCategory: ScanCategory; // first object category — badge color
  objectCount: number;           // total objects found
  thumbnailUri: string | null;
  scannedAt: string;
  result: MultiScanResult;       // full result with all objects
}