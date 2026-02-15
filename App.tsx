
import React, { useState, useRef, useEffect } from 'react';
import { Language, AnalysisResult, Verdict } from './types';
import { STRINGS, LANGUAGES } from './constants';
import { analyzeContent } from './services/geminiService';
import { LanguagePicker } from './components/LanguagePicker';
import { ResultCard } from './components/ResultCard';
import { ChatBot } from './components/ChatBot';
import { RiskMeter } from './components/RiskMeter';

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>('hi');
  const [textInput, setTextInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [activeTab, setActiveTab] = useState<'home' | 'chat' | 'guard' | 'community'>('home');
  const [chatContext, setChatContext] = useState<{ text: string; result: AnalysisResult } | null>(null);
  const [safetyPoints, setSafetyPoints] = useState(1250);
  
  const longPressStartTime = useRef<number | null>(null);
  const s = STRINGS[lang];

  const handleAnalysis = async (mode: 'news' | 'call') => {
    if (!textInput.trim()) return;
    setLoading(true);
    try {
      const res = await analyzeContent(textInput, lang, mode);
      setResult(res);
      if (res.verdict === Verdict.REAL) setSafetyPoints(prev => prev + 50);
    } catch (e) {
      console.error(e);
      alert("Verification failed. Please check connection.");
    } finally {
      setLoading(false);
    }
  };

  const startScreenScan = async () => {
    let stream: MediaStream | null = null;
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
        throw new Error("Screen scan not supported here.");
      }
      stream = await navigator.mediaDevices.getDisplayMedia({ video: { displaySurface: "browser" } } as any);
      setLoading(true);
      const video = document.createElement('video');
      video.srcObject = stream;
      await new Promise((r, j) => { video.onloadedmetadata = r; video.onerror = j; setTimeout(j, 4000); });
      await video.play();
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth; canvas.height = video.videoHeight;
      canvas.getContext('2d')?.drawImage(video, 0, 0);
      const base64 = canvas.toDataURL('image/jpeg').split(',')[1];
      stream.getTracks().forEach(t => t.stop());
      const res = await analyzeContent({ data: base64, mimeType: 'image/jpeg' }, lang);
      setChatContext({ text: "Screen Scan Result", result: res });
      setActiveTab('chat');
    } catch (e: any) {
      if (stream) stream.getTracks().forEach(t => t.stop());
      if (e.name !== 'NotAllowedError') alert(e.message || "Scan failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF9] pb-32 font-sans text-slate-900 overflow-x-hidden select-none">
      {/* Universal Floating Satyam Bubble */}
      <div 
        className="fixed bottom-36 right-6 z-[60] select-none touch-none"
        onPointerDown={() => longPressStartTime.current = Date.now()}
        onPointerUp={() => {
          if (longPressStartTime.current && Date.now() - longPressStartTime.current > 450) startScreenScan();
          else { setActiveTab('home'); setResult(null); }
          longPressStartTime.current = null;
        }}
      >
        <div className="absolute -inset-4 bg-[#FF9933] rounded-full blur-xl opacity-30 animate-pulse"></div>
        <button className="relative w-16 h-16 bg-gradient-to-tr from-[#FF9933] to-[#FFB366] rounded-full shadow-2xl flex items-center justify-center border-4 border-white active:scale-90 transition-all">
          <span className="text-white font-black text-2xl">स</span>
        </button>
      </div>

      {/* Header */}
      <header className="bg-gradient-to-b from-[#000080] to-[#000040] text-white pt-10 pb-20 px-6 rounded-b-[3.5rem] shadow-2xl relative overflow-hidden">
        <div className="max-w-md mx-auto relative z-10">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-[#000080] font-black text-xl shadow-lg">स</div>
              <h1 className="text-2xl font-black italic tracking-tight">Satyam</h1>
            </div>
            <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full border border-white/20">
              <span className="text-amber-400 text-xs font-black">★ {safetyPoints}</span>
              <span className="text-[9px] font-black uppercase tracking-tighter text-white/70">{s.dashboard.safetyPoints}</span>
            </div>
          </div>
          <div className="space-y-1">
             <p className="text-white font-black text-2xl leading-tight">{s.subtitle}</p>
             <p className="text-[#FF9933] text-[10px] uppercase font-bold tracking-[0.3em]">{lang === 'hi' ? 'सत्यमेવ जयते' : 'SATYAMEVA JAYATE'}</p>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-5 -mt-10 relative z-20 pb-10">
        <LanguagePicker current={lang} onSelect={setLang} />

        {activeTab === 'home' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom duration-500">
            {result ? (
              <ResultCard result={result} lang={lang} onBack={() => setResult(null)} />
            ) : (
              <>
                {/* Risk Dashboard Card */}
                <div className="bg-white p-6 rounded-[2.5rem] shadow-xl border-4 border-white flex flex-col items-center">
                   <div className="w-full flex justify-between items-center mb-6">
                      <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Digital Safety Status</h3>
                      <div className="flex items-center gap-1.5 bg-green-50 px-3 py-1 rounded-full text-green-600 font-black text-[10px]">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                        PROTECTED
                      </div>
                   </div>
                   <div className="relative w-full h-40 flex items-center justify-center">
                      <RiskMeter score={12} lang={lang} />
                   </div>
                   <h2 className="text-xl font-black text-slate-800 mt-2">{s.dashboard.statusSafe}</h2>
                   <p className="text-slate-400 text-[10px] font-bold mt-1 uppercase">Checked 45 messages today</p>
                </div>

                {/* Primary Action Buttons */}
                <div className="grid grid-cols-2 gap-4">
                   <button 
                    onClick={() => setActiveTab('chat')}
                    className="bg-[#FF9933] text-white p-6 rounded-[2.5rem] shadow-lg flex flex-col items-center gap-3 active:scale-95 transition-all border-b-8 border-[#CC7A29]"
                   >
                     <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/><path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/></svg>
                     </div>
                     <span className="font-black text-sm uppercase tracking-tight">{s.dashboard.voiceAsk}</span>
                   </button>
                   <button 
                    onClick={() => startScreenScan()}
                    className="bg-[#000080] text-white p-6 rounded-[2.5rem] shadow-lg flex flex-col items-center gap-3 active:scale-95 transition-all border-b-8 border-[#000030]"
                   >
                     <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm4.59-12.42L10 14.17l-2.59-2.58L6 13l4 4 8-8z"/></svg>
                     </div>
                     <span className="font-black text-sm uppercase tracking-tight">{s.dashboard.scanNow}</span>
                   </button>
                </div>

                {/* Quick News Verification */}
                <div className="bg-white p-6 rounded-[2.5rem] shadow-lg border-4 border-white">
                   <h3 className="text-xs font-black text-[#000080] mb-4 uppercase tracking-widest">Verify News</h3>
                   <textarea 
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    placeholder={s.textInputPlaceholder}
                    className="w-full h-32 p-4 bg-slate-50 rounded-2xl border-2 border-slate-100 font-bold focus:ring-4 focus:ring-[#FF9933]/10 outline-none transition-all placeholder:text-slate-200"
                   />
                   <button 
                    onClick={() => handleAnalysis('news')}
                    className="w-full mt-4 bg-slate-800 text-white py-4 rounded-2xl font-black text-lg shadow-xl"
                   >
                    {s.checkButton}
                   </button>
                </div>

                {/* Emergency Quick Dial */}
                <button 
                  onClick={() => alert("Calling Emergency Services 112...")}
                  className="w-full bg-red-600 text-white py-6 rounded-[2.5rem] flex items-center justify-center gap-4 font-black text-xl shadow-xl shadow-red-900/20 active:scale-95 transition-all border-b-8 border-red-800"
                >
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56a.977.977 0 00-1.01.24l-2.2 2.2a15.045 15.045 0 01-6.59-6.59l2.2-2.21a.96.96 0 00.25-1.01c-.36-1.11-.56-2.3-.56-3.53 0-.55-.45-1-1-1H4.01c-.55 0-1 .45-1 1C3.01 12.39 11.62 21 21.01 21c.55 0 1-.45 1-1v-3.62c0-.55-.45-1-1-1z"/></svg>
                  {s.emergency}
                </button>
              </>
            )}
          </div>
        )}

        {activeTab === 'chat' && <ChatBot lang={lang} context={chatContext} onClearContext={() => setChatContext(null)} />}
        
        {activeTab === 'guard' && (
          <div className="space-y-6 animate-in slide-in-from-bottom duration-500">
             <div className="bg-white p-8 rounded-[3rem] shadow-2xl border-4 border-white text-center">
                <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                   <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                </div>
                <h2 className="text-2xl font-black text-[#000080] mb-3">{s.callGuardTitle}</h2>
                <p className="text-slate-400 text-sm font-bold mb-8 px-4 leading-relaxed">{s.callGuardDesc}</p>
                <textarea 
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="Paste script here..."
                  className="w-full h-32 p-5 bg-slate-50 rounded-2xl border-2 border-slate-100 font-bold focus:ring-4 focus:ring-red-100 outline-none mb-6"
                />
                <button onClick={() => handleAnalysis('call')} className="w-full bg-[#ef4444] text-white py-5 rounded-3xl font-black text-xl shadow-xl shadow-red-900/20">{loading ? 'SCANNING...' : 'CHECK FOR SCAM'}</button>
                {result && result.riskScore !== undefined && (
                  <div className="mt-8 p-6 bg-slate-50 rounded-3xl border border-slate-100">
                    <RiskMeter score={result.riskScore} lang={lang} />
                    <p className="mt-4 text-slate-700 font-bold">{result.explanation}</p>
                  </div>
                )}
             </div>
          </div>
        )}

        {activeTab === 'community' && (
          <div className="space-y-6 animate-in slide-in-from-bottom duration-500">
             <div className="bg-white p-6 rounded-[2.5rem] shadow-xl border-4 border-white">
                <div className="flex justify-between items-center mb-6">
                   <h2 className="text-xl font-black text-[#000080]">{s.tabs.community}</h2>
                   <button className="bg-[#FF9933] text-white px-4 py-2 rounded-full font-black text-[10px] uppercase shadow-md">Report Rumor</button>
                </div>
                <div className="space-y-4">
                   {[
                     { user: 'Suresh from MP', text: 'Free recharge rumor for election is fake.', status: 'Verified', color: 'green' },
                     { user: 'Lakshmi from TN', text: 'WhatsApp message about school holiday is suspicious.', status: 'Checking', color: 'amber' },
                     { user: 'Anil from UP', text: 'Electricity bill payment scam link detected.', status: 'Fake Alert', color: 'red' }
                   ].map((item, i) => (
                     <div key={i} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-start gap-3">
                        <div className="w-8 h-8 bg-slate-200 rounded-full flex-shrink-0"></div>
                        <div className="flex-1">
                           <div className="flex justify-between items-center mb-1">
                              <span className="text-[10px] font-black text-slate-400 uppercase">{item.user}</span>
                              <span className={`text-[8px] font-black px-2 py-0.5 rounded-full text-${item.color}-600 bg-${item.color}-100`}>{item.status}</span>
                           </div>
                           <p className="text-xs font-bold text-slate-700">{item.text}</p>
                        </div>
                     </div>
                   ))}
                </div>
             </div>
          </div>
        )}
      </main>

      {/* Persistent Bottom Navigation */}
      <nav className="fixed bottom-6 left-6 right-6 h-20 bg-white/90 backdrop-blur-2xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)] rounded-[2.5rem] flex items-center justify-around px-2 border border-white/50 z-[55]">
        {[
          { id: 'home', label: s.tabs.home, icon: 'M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z' },
          { id: 'chat', label: s.tabs.sahayak, icon: 'M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z' },
          { id: 'guard', label: s.tabs.guard, icon: 'M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z' },
          { id: 'community', label: s.tabs.community, icon: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z' }
        ].map((tab) => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex flex-col items-center justify-center flex-1 h-full gap-1.5 transition-all ${activeTab === tab.id ? 'text-[#FF9933] scale-110' : 'text-slate-300'}`}
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d={tab.icon}/></svg>
            <span className="text-[9px] font-black uppercase tracking-tighter">{tab.label}</span>
          </button>
        ))}
      </nav>

      {/* Global Safety Loader */}
      {loading && (
        <div className="fixed inset-0 bg-[#000080]/60 backdrop-blur-md z-[100] flex items-center justify-center p-10">
          <div className="bg-white p-10 rounded-[3.5rem] shadow-2xl text-center max-w-xs w-full border-b-[12px] border-[#FF9933] animate-in zoom-in duration-300">
             <div className="relative w-20 h-20 mx-auto mb-8">
                <div className="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-[#FF9933] border-t-transparent rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center text-[#000080] font-black">स</div>
             </div>
             <h2 className="text-[#000080] font-black text-2xl mb-2">{s.analyzing}</h2>
             <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Consulting Verified Records...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
