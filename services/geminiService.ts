
import { GoogleGenAI, Type, Modality, GenerateContentResponse, Chat } from "@google/genai";
import { AnalysisResult, Verdict, Language } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

function decode(base64: string) {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

export const analyzeContent = async (
  content: string | { data: string; mimeType: string },
  lang: Language,
  mode: 'news' | 'call' = 'news'
): Promise<AnalysisResult> => {
  const langMap: Record<Language, string> = { hi: 'Hindi', ta: 'Tamil', gu: 'Gujarati', en: 'English' };
  const targetLang = langMap[lang];
  
  const systemInstruction = mode === 'news' 
    ? `You are Satyam, India's lead AI fact-checker. Use Google Search.
       Verify WhatsApp forwards and rumors. Detect deepfakes in videos.
       Provide verdict (REAL/FAKE/SUSPICIOUS) and explanation in ${targetLang}.`
    : `You are Rakshak, India's scam expert. Detect patterns: KYC fraud, lottery scams.
       Risk Score 0-100. Explain in ${targetLang}.`;

  const inputParts = typeof content === "string" 
    ? [{ text: content }]
    : [{ inlineData: content }, { text: `Analyze this ${content.mimeType.startsWith('video') ? 'video' : 'image'} for scams or fake news.` }];

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: { parts: inputParts },
    config: {
      systemInstruction,
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          verdict: { type: Type.STRING, enum: Object.values(Verdict) },
          category: { type: Type.STRING },
          explanation: { type: Type.STRING },
          confidence: { type: Type.NUMBER },
          riskScore: { type: Type.NUMBER },
          sources: { 
            type: Type.ARRAY, 
            items: { type: Type.OBJECT, properties: { web: { type: Type.OBJECT, properties: { uri: { type: Type.STRING }, title: { type: Type.STRING } } } } } 
          }
        },
        required: ["verdict", "category", "explanation", "confidence"]
      }
    }
  });

  const parsed = JSON.parse(response.text || "{}");
  parsed.inputType = typeof content === 'string' ? 'text' : (content.mimeType.startsWith('video') ? 'video' : 'image');
  return parsed as AnalysisResult;
};

export const createChatSession = (lang: Language): Chat => {
  const langMap: Record<Language, string> = { hi: 'Hindi', ta: 'Tamil', gu: 'Gujarati', en: 'English' };
  return ai.chats.create({
    model: "gemini-3-flash-preview",
    config: {
      systemInstruction: `You are Satyam Sahayak, a digital safety AI for India. Speak in ${langMap[lang]}. 
      Verify news, explain scams, and advise users to be safe. Use Google Search for facts.`,
      tools: [{ googleSearch: {} }]
    }
  });
};

export const generateSpeech = async (text: string, lang: Language): Promise<AudioBuffer> => {
  const voice = lang === 'hi' ? 'Kore' : (lang === 'en' ? 'Zephyr' : 'Puck');
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: voice } } }
    },
  });
  const data = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  const ctx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
  return await decodeAudioData(decode(data!), ctx, 24000, 1);
};

export const transcribeAudio = async (base64: string, mimeType: string, lang: Language): Promise<string> => {
  const langMap: Record<Language, string> = { hi: 'Hindi', ta: 'Tamil', gu: 'Gujarati', en: 'English' };
  const res = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: { parts: [{ inlineData: { data: base64, mimeType } }, { text: `Transcribe this ${langMap[lang]} audio.` }] }
  });
  return res.text || "";
};
