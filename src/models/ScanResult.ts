export type ScanCategory =
  | 'plant' | 'animal' | 'food' | 'object'
  | 'text' | 'place' | 'product' | 'person' | 'unknown';

export type DangerLevel = 'safe' | 'caution' | 'dangerous';

export type ScanMode =
  | 'single' | 'multi' | 'count' | 'text_summary' | 'scam_check' | 'solve'
  | 'caption' | 'fortune' | 'inspect' | 'diagnose';

export type ScamVerdict = 'likely_scam' | 'suspicious' | 'likely_legitimate' | 'unclear';

export interface ScamScores {
  legitimate: number;
  suspicious: number;
  scam: number;
}

export interface ScamResult {
  verdict: ScamVerdict;
  scores: ScamScores;
  red_flags: string[];
  safe_signals: string[];
  advice: string;
  detected_language: string | null;
}

export interface SolveResult {
  answer: string;
  steps: string[];
  topic: string | null;
}

// ── Caption Mode ──────────────────────────────────────────────────────────────

export interface CaptionStyle {
  style: 'funny' | 'aesthetic' | 'punchy' | 'casual';
  // emoji: string;
  text: string;
}

export interface CaptionResult {
  image_summary: string;
  captions: CaptionStyle[];  // always 4
  hashtags: string[];        // 5 items, no "#" prefix
}

// ── Fortune Mode ──────────────────────────────────────────────────────────────
// Replace FortuneReading and FortuneResult interfaces in ScanResult.ts

export interface FortuneReading {
  category: 'love' | 'career' | 'money' | 'energy';
  text:     string;
}
 
export interface FortuneResult {
  subject:      string;
  greeting:     string;
  readings:     FortuneReading[];
  lucky_number: number;
  lucky_color:  string;
  share_text:   string;
}
 

// ── Core object ───────────────────────────────────────────────────────────────

export interface ScannedObject {
  object_id: string;
  name: string;
  brand: string | null;
  type: string;
  category: ScanCategory;
  count: number;
  confidence: number;
  is_unknown: boolean;
  is_celebrity: boolean;
  reason: string | null;
  danger: DangerLevel | null;
  bad: string[];
  good: string[];
  protect: string | null;
  kill: string | null;
  price: string | null;
  buy_at: string | null;
  calories: string | null;
  text_summary: string | null;
  detected_language: string | null;
  scam_result: ScamResult | null;
  solve_result: SolveResult | null;
  caption_result: CaptionResult | null;
  fortune_result: FortuneResult | null;
  inspect_result: InspectResult | null;
  profile_alerts: string[];
  source: string;
  output_language: string;
  rarity: string | null;
  conservation_status: string | null;
  diagnose_result: DiagnoseResult | null;
  text_bullets: string[];
  condition: string | null;
  habitat: string | null;
  behavior: string[];
}

export interface DiagnoseResult {
  damage_type: string;
  sub_type: string;
  severity: 'Minor' | 'Moderate' | 'Serious' | 'Critical';
  root_cause: string;
  fix_steps: string[];
  cost_estimate: string | null;
  professional_needed: boolean;
  urgency: 'Can wait' | 'Fix soon' | 'Fix now';
  is_diagnosable: boolean;
  reason: string | null;
}

interface InspectResult {
  rarity: string | null;
  conservation_status: string | null;
  condition: string | null;
  habitat: string | null;
  behavior: string[];
}


export interface MultiScanResult {
  scan_id: string;
  source: string;
  processing_time_ms: number;
  objects: ScannedObject[];
}

export interface ScanHistory {
  id: string;
  previewName: string;
  previewCategory: ScanCategory;
  objectCount: number;
  thumbnailUri: string | null;
  scannedAt: string;
  result: MultiScanResult;
}