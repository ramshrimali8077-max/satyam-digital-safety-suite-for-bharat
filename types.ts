
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
  riskScore?: number;
  inputType?: 'text' | 'image' | 'video' | 'audio';
}

export interface UIStrings {
  title: string;
  subtitle: string;
  textInputPlaceholder: string;
  imageInputLabel: string;
  videoInputLabel: string;
  voiceInputLabel: string;
  checkButton: string;
  recording: string;
  stopRecording: string;
  analyzing: string;
  verdictLabels: { [key in Verdict]: string };
  shareWhatsApp: string;
  back: string;
  callGuardTitle: string;
  callGuardDesc: string;
  scanTitle: string;
  riskLabels: { safe: string; suspicious: string; scam: string };
  tabs: { home: string; sahayak: string; guard: string; community: string; profile: string };
  dashboard: { statusSafe: string; statusDanger: string; scanNow: string; voiceAsk: string; recentAlerts: string; safetyPoints: string; protectionTools: string; directSearch: string };
  profile: { accountDetails: string; appLanguage: string; villageCircle: string; alertHub: string; secureLogout: string; verifiedCitizen: string };
  login: { secureLogin: string; enterOtp: string; loginDesc: string; otpDesc: string; sendCode: string; verifyEnter: string; changeNumber: string; mobileNumber: string };
  results: { stopListening: string; listenProof: string; shareAlert: string; verifiedDoc: string; verifiedMedia: { video: string; image: string; voice: string; text: string } };
  report: { title: string; verdictLabel: string; riskLevel: string; summary: string; sources: string; followUp: string };
  greetings: { morning: string; afternoon: string; evening: string };
  emergency: string;
  onboarding: { skip: string; next: string; finish: string; steps: { title: string; desc: string }[] };
}
