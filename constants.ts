
import { Language, UIStrings, Verdict } from './types';

export const LANGUAGES: { label: string; code: Language }[] = [
  { label: 'English', code: 'en' },
  { label: 'हिन्दी', code: 'hi' },
  { label: 'தமிழ்', code: 'ta' },
  { label: 'ગુજરાતી', code: 'gu' }
];

export const STRINGS: Record<Language, UIStrings> = {
  en: {
    title: 'Satyam',
    subtitle: 'Bharat Digital Safety Suite',
    textInputPlaceholder: 'Paste news or suspicious message here...',
    imageInputLabel: 'Scan Image',
    voiceInputLabel: 'Voice Input',
    checkButton: 'Verify Now',
    recording: 'Listening...',
    stopRecording: 'Stop Now',
    analyzing: 'Verifying with Official Records...',
    verdictLabels: {
      [Verdict.REAL]: 'Verified Real',
      [Verdict.FAKE]: 'Confirmed Fake',
      [Verdict.SUSPICIOUS]: 'Warning: Suspicious'
    },
    shareWhatsApp: 'Alert your Friends',
    back: 'Go Back',
    callGuardTitle: 'Call Guard',
    callGuardDesc: 'Check suspicious conversations for scam patterns.',
    scanTitle: 'Screen Scan',
    riskLabels: {
      safe: 'Safe Content',
      suspicious: 'Suspicious / Risky',
      scam: 'Scam Detected'
    },
    tabs: {
      home: 'Home',
      sahayak: 'Sahayak',
      guard: 'Guard',
      community: 'Village'
    },
    dashboard: {
      statusSafe: 'You are Safe',
      statusDanger: 'Risk Detected',
      scanNow: 'Scan Now',
      voiceAsk: 'Ask by Voice',
      recentAlerts: 'Recent Safety Alerts',
      safetyPoints: 'Safety Points'
    },
    emergency: 'Emergency 112'
  },
  hi: {
    title: 'सत्यम',
    subtitle: 'भारत डिजिटल सुरक्षा सुइट',
    textInputPlaceholder: 'यहाँ समाचार या संदिग्ध संदेश पेस्ट करें...',
    imageInputLabel: 'इमेज स्कैन करें',
    voiceInputLabel: 'आवाज इनपुट',
    checkButton: 'सच्चाई जांचें',
    recording: 'सुन रहा हूँ...',
    stopRecording: 'बंद करें',
    analyzing: 'सरकारी रिकॉर्ड से जांच जारी है...',
    verdictLabels: {
      [Verdict.REAL]: 'सत्यापित असली',
      [Verdict.FAKE]: 'पुष्टि की गई फर्जी',
      [Verdict.SUSPICIOUS]: 'चेतावनी: संदिग्ध'
    },
    shareWhatsApp: 'दोस्तों को सावधान करें',
    back: 'पीछे जाएं',
    callGuardTitle: 'सुरक्षा गार्ड',
    callGuardDesc: 'धोखाधड़ी के लिए बातचीत की जांच करें।',
    scanTitle: 'स्क्रीन स्कैन',
    riskLabels: {
      safe: 'सुरक्षित',
      suspicious: 'संदिग्ध गतिविधि',
      scam: 'फ्रॉड का खतरा'
    },
    tabs: {
      home: 'मुख्य',
      sahayak: 'सहायक',
      guard: 'गार्ड',
      community: 'चौपाल'
    },
    dashboard: {
      statusSafe: 'आप सुरक्षित हैं',
      statusDanger: 'खतरा महसूस हुआ',
      scanNow: 'अभी स्कैन करें',
      voiceAsk: 'बोलकर पूछें',
      recentAlerts: 'हालिया सुरक्षा अलर्ट',
      safetyPoints: 'सुरक्षा अंक'
    },
    emergency: 'आपातकालीन 112'
  },
  ta: {
    title: 'சத்யம்',
    subtitle: 'பாரத டிஜிட்டல் பாதுகாப்பு தொகுப்பு',
    textInputPlaceholder: 'செய்தி அல்லது சந்தேகத்திற்கிடமான செய்தியை இங்கே ஒட்டவும்...',
    imageInputLabel: 'படத்தை ஸ்கேன் செய்',
    voiceInputLabel: 'குரல் உள்ளீடு',
    checkButton: 'உண்மையைச் சரிபார்த்து',
    recording: 'கேட்கிறது...',
    stopRecording: 'நிறுத்து',
    analyzing: 'சரிபார்க்கிறது...',
    verdictLabels: {
      [Verdict.REAL]: 'உண்மையானது',
      [Verdict.FAKE]: 'போலியானது',
      [Verdict.SUSPICIOUS]: 'எச்சரிக்கை: சந்தேகம்'
    },
    shareWhatsApp: 'நண்பர்களை எச்சரிக்கவும்',
    back: 'திரும்பிச் செல்',
    callGuardTitle: 'கால் கார்டு',
    callGuardDesc: 'அழைப்பு விவரங்களை சரிபார்க்கவும்',
    scanTitle: 'ஸ்கிரீன் ஸேன்',
    riskLabels: {
      safe: 'பாதுகாப்பானது',
      suspicious: 'சந்தேகத்திற்கிடமானது',
      scam: 'மோசடி கண்டறியப்பட்டது'
    },
    tabs: {
      home: 'முகப்பு',
      sahayak: 'சகாயக்',
      guard: 'பாதுகாப்பு',
      community: 'கிராமம்'
    },
    dashboard: {
      statusSafe: 'நீங்கள் பாதுகாப்பாக இருக்கிறீர்கள்',
      statusDanger: 'ஆபத்து கண்டறியப்பட்டது',
      scanNow: 'இப்போது ஸ்கேன் செய்',
      voiceAsk: 'குரல் மூலம் கேள்',
      recentAlerts: 'சமீபத்திய விழிப்புணர்வு',
      safetyPoints: 'பாதுகாப்பு புள்ளிகள்'
    },
    emergency: 'அவசரம் 112'
  },
  gu: {
    title: 'સત્યમ',
    subtitle: 'ભારત ડિજિટલ સેફ્ટી સુઈટ',
    textInputPlaceholder: 'અહીં સમાચાર અથવા શંકાસ્પદ સંદેશ પેસ્ટ કરો...',
    imageInputLabel: 'ઈમેજ સ્કેન કરો',
    voiceInputLabel: 'વોઈસ ઈનપુટ',
    checkButton: 'સત્ય તપાસો',
    recording: 'સાંભળી રહ્યા છીએ...',
    stopRecording: 'બંધ કરો',
    analyzing: 'AI સાથે ચકાસણી થઈ રહી છે...',
    verdictLabels: {
      [Verdict.REAL]: 'ચકાસાયેલ અસલી',
      [Verdict.FAKE]: 'પુષ્ટિ થયેલ નકલી',
      [Verdict.SUSPICIOUS]: 'ચેતવણી: શંકાસ્પદ'
    },
    shareWhatsApp: 'મિત્રોને સાવધ કરો',
    back: 'પાછા જાઓ',
    callGuardTitle: 'કોલ ગાર્ડ',
    callGuardDesc: 'સ્કેમ માટે કોલ સ્ક્રિપ્ટો તપાસો',
    scanTitle: 'સ્ક્રીન સ્કેન',
    riskLabels: {
      safe: 'સલામત સામગ્રી',
      suspicious: 'શંકાસ્પદ / જોખમી',
      scam: 'સ્કેમ જણાયું'
    },
    tabs: {
      home: 'મુખ્ય',
      sahayak: 'સહાયક',
      guard: 'ગાર્ડ',
      community: 'ચોપાલ'
    },
    dashboard: {
      statusSafe: 'તમે સુરક્ષિત છો',
      statusDanger: 'જોખમ જણાયું',
      scanNow: 'હમણાં સ્કેન કરો',
      voiceAsk: 'બોલીને પૂછો',
      recentAlerts: 'તાજેતરની એલર્ટ',
      safetyPoints: 'સુરક્ષા પોઈન્ટ્સ'
    },
    emergency: 'ઇમરજન્સી 112'
  }
};
