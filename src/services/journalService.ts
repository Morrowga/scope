import axios from 'axios';
import { Config } from '../constants/config';
import * as Device from 'expo-device';

const api = axios.create({
  baseURL: Config.apiBaseUrl,
  timeout: 30000,
});

const getDeviceId = (): string => Device.osInternalBuildId ?? 'unknown-device';

export interface JournalLocation {
  country: string;
  city: string;
  address: string;
}

export interface JournalEntry {
  id: string;
  thought: string;
  image_url: string;
  location: JournalLocation | null;
  captured_at: string;
  summary?: string | null;
}

export interface SummarizeResponse {
  summary: string;
  already_existed: boolean;
}

export interface SaveJournalParams {
  imageBase64: string;
  imageUri: string;
  location: JournalLocation | null;
  language: string;
}

export const saveJournalEntry = async (params: SaveJournalParams): Promise<JournalEntry> => {
  const { data } = await api.post<JournalEntry>('/api/v1/journal/entry', {
    image_base64: params.imageBase64,
    image_uri: params.imageUri,
    device_id: getDeviceId(),
    language: params.language,
    location: params.location,
  });
  return data;
};

export const getJournalDay = async (date: string): Promise<JournalEntry[]> => {
  const { data } = await api.get<JournalEntry[]>('/api/v1/journal/day', {
    params: { device_id: getDeviceId(), date },
  });
  return data;
};

export const summarizeJournalDay = async (date: string, language: string = 'en'): Promise<SummarizeResponse> => {
  const { data } = await api.post<SummarizeResponse>('/api/v1/journal/summarize', {
    device_id: getDeviceId(),
    date,
    language,
  });
  return data;
};