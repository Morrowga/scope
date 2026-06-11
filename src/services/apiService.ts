import axios, { AxiosError } from 'axios';
import { Config } from '../constants/config';
import { MultiScanResult, ScanMode } from '../models/ScanResult';
import * as Device from 'expo-device';

const api = axios.create({
  baseURL: Config.apiBaseUrl,
  timeout: 30000,
});

const getDeviceId = (): string => Device.osInternalBuildId ?? 'unknown-device';

export class ContentBlockedError extends Error {
  constructor() {
    super('CONTENT_BLOCKED');
    this.name = 'ContentBlockedError';
  }
}

export class BurstLimitError extends Error {
  retryAfter: number;
  constructor(retryAfter: number) {
    super('BURST_LIMIT');
    this.name = 'BurstLimitError';
    this.retryAfter = retryAfter;
  }
}

export class DailyLimitError extends Error {
  retryAfter: number;
  limit: number;
  constructor(retryAfter: number, limit: number) {
    super('RATE_LIMIT_EXCEEDED');
    this.name = 'DailyLimitError';
    this.retryAfter = retryAfter;
    this.limit = limit;
  }
}

export const scanImage = async (
  base64Image: string,
  language: string,
  scanMode: ScanMode = 'multi',
  deepScan: boolean = false,
): Promise<MultiScanResult> => {
  if (Config.useMock) {
    return mockScan(language);
  }

  try {
    const { data } = await api.post<MultiScanResult>('/api/v1/scan', {
      image_base64: base64Image,
      device_id: getDeviceId(),
      language,
      scan_mode: scanMode,
      deep_scan: deepScan,
    });
    return data;
  } catch (e) {
    const err = e as AxiosError<any>;
    if (err.response?.status === 451) {
      throw new ContentBlockedError();
    }
    if (err.response?.status === 429) {
      const code = err.response?.data?.code;
      const retryAfter = err.response?.data?.retry_after ?? 60;
      if (code === 'BURST_LIMIT') {
        throw new BurstLimitError(retryAfter);
      }
      if (code === 'RATE_LIMIT_EXCEEDED') {
        // try to pull the limit number out of the message, fallback 30
        const msg: string = err.response?.data?.message ?? '';
        const m = msg.match(/(\d+)/);
        const limit = m ? parseInt(m[1], 10) : 30;
        throw new DailyLimitError(retryAfter, limit);
      }
    }
    throw e;
  }
};

// ---------------------------------------------------------------------------
// Mock
// ---------------------------------------------------------------------------

const mockScan = async (language: string): Promise<MultiScanResult> => {
  await delay(900);
  return {
    scan_id: `scan_${Date.now()}`,
    source: 'mock',
    processing_time_ms: 900,
    objects: [
      {
        object_id: '1',
        name: 'Fuji Apple',
        brand: null,
        type: 'Fresh Fruit',
        category: 'food',
        count: 1,
        confidence: 0.99,
        is_unknown: false,
        is_celebrity: false,
        reason: null,
        danger: 'safe',
        bad: ['High sugar'],
        good: ['Rich in fiber', 'Vitamins A C'],
        protect: null,
        kill: null,
        price: '$0.50–2.00 each',
        buy_at: 'Supermarkets',
        calories: '~95 kcal',
        text_summary: null,
        detected_language: null,
        scam_result: null,
        solve_result: null,
        caption_result: null,  
        fortune_result: null,
        profile_alerts: [],
        source: 'mock',
        output_language: language,
      },
    ],
  };
};

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));