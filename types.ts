
export type Language = 'en' | 'hi' | 'ta' | 'gu';

export enum Verdict {
  REAL = 'REAL',
  FAKE = 'FAKE',
  SUSPICIOUS = 'SUSPICIOUS'
}

export interface AnalysisResult {
  verdict: Verdict;
  category: string;
  explanation: string;
  confidence: number;
  sources: { web?: { uri: string, title: string } }[];
  riskScore?: number; // 0 to 100
}

export interface UIStrings {
  title: string;
  subtitle: string;
  textInputPlaceholder: string;
  imageInputLabel: string;
  voiceInputLabel: string;
  checkButton: string;
  recording: string;
  stopRecording: string;
  analyzing: string;
  verdictLabels: {
    [key in Verdict]: string;
  };
  shareWhatsApp: string;
  back: string;
  callGuardTitle: string;
  callGuardDesc: string;
  scanTitle: string;
  riskLabels: {
    safe: string;
    suspicious: string;
    scam: string;
  };
  tabs: {
    home: string;
    sahayak: string;
    guard: string;
    community: string;
  };
  dashboard: {
    statusSafe: string;
    statusDanger: string;
    scanNow: string;
    voiceAsk: string;
    recentAlerts: string;
    safetyPoints: string;
  };
  emergency: string;
}
