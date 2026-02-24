
import React, { useState, useRef, useEffect } from 'react';
import { Language, AnalysisResult, Verdict } from '../types';
import { createChatSession, transcribeAudio, analyzeContent } from '../services/geminiService';
import { Chat, GenerateContentResponse } from '@google/genai';
import { STRINGS } from '../constants';
import { Send, Mic, X, ShieldCheck, AlertCircle, CheckCircle2, ExternalLink, Info } from 'lucide-react';

interface Message {
  role: 'user' | 'model';
  text: string;
  image?: string;
  isReport?: boolean;
  isScanning?: boolean;
}

interface ChatBotProps {
  lang: Language;
  context?: { image: string; result?: AnalysisResult } | null;
  onClearContext?: () => void;
}

export const ChatBot: React.FC<ChatBotProps> = ({ lang, context, onClearContext }) => {
  const s = STRINGS[lang];
  
  const getInitialMessage = (l: Language): string => {
    switch (l) {
      case 'hi': return 'नमस्ते! मैं सत्यम सहायक हूँ। आपकी स्क्रीन को स्कैन करने के बाद, आप मुझसे कोई भी सवाल पूछ सकते हैं।';
      case 'ta': return 'வணக்கம்! நான் சத்யம் சகாயக். உங்கள் திரையை ஸ்கேன் செய்த பிறகு, நீங்கள் என்னிடம் ஏதேனும் கேள்விகளைக் கேட்கலாம்.';
      case 'gu': return 'નમસ્તે! હું સત્યમ સહાયક છું. તમારી સ્ક્રીન સ્કેન કર્યા પછી, તમે મને કોઈપણ પ્રશ્નો પૂછી શકો છો.';
      default: return 'Namaste! I am Satyam Sahayak. After scanning your screen, you can ask me follow-up questions about what we found.';
    }
  };

  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: getInitialMessage(lang) }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  
  const chatRef = useRef<Chat | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    if (!chatRef.current) {
      chatRef.current = createChatSession(lang);
    }
  }, [lang]);

  // Automated Scanning Logic when context (Screenshot) is received
  useEffect(() => {
    const processContext = async () => {
      if (context && context.image && chatRef.current) {
        // 1. Show scanning state in chat
        const scanMessageId = Date.now();
        setMessages(prev => [...prev, { 
          role: 'model', 
          text: lang === 'hi' ? '🔍 आपकी स्क्रीन की जांच की जा रही है...' : lang === 'gu' ? '🔍 તમારી સ્ક્રીન તપાસવામાં આવી રહી છે...' : '🔍 Scanning your screen for digital risks...',
          image: context.image,
          isScanning: true
        }]);

        try {
          // 2. Perform AI Analysis
          const base64 = context.image.split(',')[1];
          const result = await analyzeContent({ data: base64, mimeType: 'image/jpeg' }, lang);
          
          const verdictEmoji = result.verdict === Verdict.REAL ? '✅' : result.verdict === Verdict.FAKE ? '❌' : '⚠️';
          let reportText = `📊 **${s.report.title}**\n\n**${s.report.verdictLabel}:** ${verdictEmoji} ${s.verdictLabels[result.verdict]}\n**${s.report.riskLevel}:** ${result.riskScore ?? 'N/A'}%\n\n**${s.report.summary}:** ${result.explanation}`;

          // Grounding Metadata handling
          if (result.sources && result.sources.length > 0) {
            reportText += `\n\n**${s.report.sources}:**`;
            result.sources.forEach((src, idx) => {
              if (src.web) {
                reportText += `\n${idx + 1}. [${src.web.title}](${src.web.uri})`;
              }
            });
          }

          reportText += `\n\n*${s.report.followUp}*`;

          // 3. Replace scanning placeholder with actual report
          setMessages(prev => {
            const filtered = prev.filter(m => !m.isScanning);
            return [...filtered, { 
              role: 'model', 
              text: reportText,
              image: context.image,
              isReport: true
            }];
          });

          // 4. Update Chat Session Context (Hidden context update for follow-ups)
          // We send a system-style message to the chat session so it "knows" what the scan was.
          await chatRef.current.sendMessage({ 
            message: `[INTERNAL SYSTEM UPDATE]: The user performed a screen scan. Result: ${result.verdict}. Analysis: ${result.explanation}. Risk Score: ${result.riskScore}. The user is now going to ask follow-up questions about this specific image/result. Provide helpful safety advice based on this.` 
          });

        } catch (e) {
          console.error("Scan processing failed", e);
          const errorMsg = "Scan failed due to technical error. Please try again.";
          setMessages(prev => prev.filter(m => !m.isScanning).concat([{ role: 'model', text: errorMsg }]));
        } finally {
          if (onClearContext) onClearContext();
        }
      }
    };
    if (context) processContext();
  }, [context, lang]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (overrideText?: string) => {
    const textToSend = overrideText || input;
    if (!textToSend.trim() || !chatRef.current || isLoading) return;
    if (!overrideText) setInput('');
    setMessages(prev => [...prev, { role: 'user', text: textToSend }]);
    setIsLoading(true);
    try {
      const chatResponse: GenerateContentResponse = await chatRef.current.sendMessage({ message: textToSend });
      let text = chatResponse.text || '';

      // Extract sources from the chat response itself if Google Search grounding was used
      const groundingChunks = chatResponse.candidates?.[0]?.groundingMetadata?.groundingChunks;
      if (groundingChunks && groundingChunks.length > 0) {
        text += `\n\n**${s.report.sources}:**`;
        groundingChunks.forEach((chunk: any) => {
          if (chunk.web) {
            text += `\n• [${chunk.web.title}](${chunk.web.uri})`;
          }
        });
      }

      setMessages(prev => [...prev, { role: 'model', text }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'model', text: "Sahayak Service is temporarily busy. Please try again in a moment." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleRecording = async () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];
        mediaRecorder.ondataavailable = (event) => audioChunksRef.current.push(event.data);
        mediaRecorder.onstop = async () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: mediaRecorder.mimeType });
          const reader = new FileReader();
          reader.onloadend = async () => {
            const base64 = (reader.result as string).split(',')[1];
            setIsLoading(true);
            try {
              const transcription = await transcribeAudio(base64, mediaRecorder.mimeType, lang);
              if (transcription.trim()) handleSend(transcription);
            } catch (e) { console.error(e); } finally { setIsLoading(false); }
          };
          reader.readAsDataURL(audioBlob);
          stream.getTracks().forEach(track => track.stop());
        };
        mediaRecorder.start();
        setIsRecording(true);
      } catch (e) { alert("Mic access denied."); }
    }
  };

  return (
    <div className="bg-white rounded-[2rem] shadow-xl flex flex-col h-[75vh] border border-slate-100 overflow-hidden animate-in slide-in-from-bottom duration-500">
      <div className="bg-[#1e1b4b] p-5 flex items-center gap-4">
         <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <ShieldCheck className="text-white" size={24} />
         </div>
         <div className="flex-1">
            <h4 className="text-white font-black text-xs uppercase tracking-widest leading-none mb-1">Sahayak AI</h4>
            <div className="flex items-center gap-1.5">
               <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
               <span className="text-[8px] text-white/50 font-black uppercase tracking-widest">Active Safety Guard</span>
            </div>
         </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-6 bg-slate-50/50 no-scrollbar">
        {messages.map((msg, i) => (
          <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
            <div className={`max-w-[90%] p-5 rounded-3xl text-sm font-bold shadow-sm ${
              msg.role === 'user' 
                ? 'bg-[#1e1b4b] text-white rounded-tr-none' 
                : msg.isReport
                  ? 'bg-white text-slate-800 rounded-tl-none border-2 border-indigo-600/20'
                  : 'bg-white text-slate-800 rounded-tl-none border border-slate-100'
            }`}>
              {msg.image && (
                <div className="mb-4 rounded-2xl overflow-hidden border-2 border-slate-100 aspect-video relative group">
                  <img src={msg.image} className="w-full h-full object-cover" alt="Captured view" />
                  {msg.isScanning && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center gap-3">
                       <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                       <span className="text-[10px] text-white font-black uppercase tracking-widest animate-pulse">Deep Scan in Progress...</span>
                    </div>
                  )}
                  {!msg.isScanning && (
                     <div className="absolute top-3 right-3 bg-indigo-600 text-white p-1.5 rounded-lg shadow-lg">
                        <CheckCircle2 size={16} />
                     </div>
                  )}
                </div>
              )}
              <div className="whitespace-pre-wrap leading-relaxed prose prose-sm max-w-none">
                {msg.text.split('\n').map((line, idx) => {
                  // Basic markdown link parsing for grounding URLs
                  const linkMatch = line.match(/\[(.*?)\]\((.*?)\)/);
                  if (linkMatch) {
                    return (
                      <a 
                        key={idx} 
                        href={linkMatch[2]} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100 mt-2 hover:bg-slate-100 transition-all text-indigo-600"
                      >
                        <ExternalLink size={14} />
                        <span className="font-black text-[11px] truncate">{linkMatch[1]}</span>
                      </a>
                    );
                  }
                  return <div key={idx} className={line.startsWith('📊') ? 'text-indigo-900 font-black text-base mb-2' : ''}>{line}</div>;
                })}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-1.5 p-3">
            <div className="w-1.5 h-1.5 bg-indigo-900 rounded-full animate-bounce"></div>
            <div className="w-1.5 h-1.5 bg-indigo-900 rounded-full animate-bounce [animation-delay:0.2s]"></div>
            <div className="w-1.5 h-1.5 bg-indigo-900 rounded-full animate-bounce [animation-delay:0.4s]"></div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>
      
      <div className="p-5 border-t bg-white flex gap-3 items-center">
        <button
          onClick={toggleRecording}
          className={`p-4 rounded-2xl transition-all shadow-sm active:scale-90 ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-50 text-slate-400'}`}
        >
          {isRecording ? <X size={20}/> : <Mic size={20}/>}
        </button>

        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder={isRecording ? "Listening..." : "Ask follow-up doubt..."}
          className="flex-1 bg-slate-50 rounded-2xl px-5 py-4 text-sm font-black text-[#1e1b4b] placeholder:text-slate-300 focus:ring-4 focus:ring-indigo-50 outline-none transition-all"
          disabled={isRecording}
        />

        <button
          onClick={() => handleSend()}
          disabled={isLoading || !input.trim()}
          className="bg-[#1e1b4b] text-white p-4 rounded-2xl disabled:opacity-30 shadow-lg shadow-blue-100 active:scale-90"
        >
          <Send size={24} />
        </button>
      </div>
    </div>
  );
};
