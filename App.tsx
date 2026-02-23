
import React, { useState, useRef, useEffect } from 'react';
import { Language, AnalysisResult, Verdict } from './types';
import { STRINGS, LANGUAGES } from './constants';
import { analyzeContent, transcribeAudio } from './services/geminiService';
import { LanguagePicker } from './components/LanguagePicker';
import { ResultCard } from './components/ResultCard';
import { ChatBot } from './components/ChatBot';
import { RiskMeter } from './components/RiskMeter';
import { OnboardingTour } from './components/OnboardingTour';
import { 
  Shield, 
  Search, 
  Phone, 
  MessageSquare, 
  Mic, 
  Home, 
  Users, 
  User, 
  Video, 
  Camera, 
  LogOut, 
  ChevronRight, 
  Globe, 
  Bell, 
  ShieldCheck, 
  Lock, 
  Award, 
  ShieldAlert, 
  Contact2, 
  History, 
  Info,
  PhoneForwarded,
  FileText,
  Upload,
  Square,
  Volume2
} from 'lucide-react';

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>('hi');
  const [textInput, setTextInput] = useState('');
  const [callTranscript, setCallTranscript] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [activeTab, setActiveTab] = useState<'home' | 'chat' | 'guard' | 'community' | 'profile'>('home');
  const [chatContext, setChatContext] = useState<{ image: string } | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  
  // Guard specific states
  const [isRecordingGuard, setIsRecordingGuard] = useState(false);
  const [guardAudioUrl, setGuardAudioUrl] = useState<string | null>(null);
  const [guardAudioBase64, setGuardAudioBase64] = useState<string | null>(null);
  const [guardMimeType, setGuardMimeType] = useState<string>('');

  const videoInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  
  const [authStep, setAuthStep] = useState<'phone' | 'otp'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState(['', '', '', '']);
  const [resendTimer, setResendTimer] = useState(0);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const s = STRINGS[lang];

  useEffect(() => {
    let interval: any;
    if (resendTimer > 0) interval = setInterval(() => setResendTimer(t => t - 1), 1000);
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleLogin = () => {
    setLoading(true);
    setLoadingMsg(authStep === 'phone' ? 'Requesting Secure OTP...' : 'Verifying Identity...');
    setTimeout(() => {
      setLoading(false);
      if (authStep === 'phone') { setAuthStep('otp'); setResendTimer(30); }
      else { 
        setIsLoggedIn(true);
        if (!localStorage.getItem('satyam_v1_onboard')) setShowOnboarding(true);
      }
    }, 1200);
  };

  const handleAnalysis = async (mode: 'news' | 'call', input?: any) => {
    setLoading(true);
    setLoadingMsg(mode === 'call' ? 'Analyzing for Scam Patterns...' : 'Scanning for threats...');
    try {
      // If we have a recorded audio but no transcript, we might want to transcribe first
      // but analyzeContent already handles inlineData. 
      const finalInput = input || (mode === 'call' 
        ? (guardAudioBase64 ? { data: guardAudioBase64, mimeType: guardMimeType } : callTranscript)
        : textInput);
      
      const res = await analyzeContent(finalInput, lang, mode);
      setResult(res);
    } catch (e) { 
      alert("Verification failed. Please try a different format or shorter text."); 
    }
    setLoading(false);
  };

  const toggleGuardRecording = async () => {
    if (isRecordingGuard) {
      mediaRecorderRef.current?.stop();
      setIsRecordingGuard(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];
        
        mediaRecorder.ondataavailable = (event) => audioChunksRef.current.push(event.data);
        mediaRecorder.onstop = async () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: mediaRecorder.mimeType });
          const url = URL.createObjectURL(audioBlob);
          setGuardAudioUrl(url);
          setGuardMimeType(mediaRecorder.mimeType);
          
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64 = (reader.result as string).split(',')[1];
            setGuardAudioBase64(base64);
          };
          reader.readAsDataURL(audioBlob);
          stream.getTracks().forEach(track => track.stop());
        };
        
        mediaRecorder.start();
        setIsRecordingGuard(true);
        setGuardAudioUrl(null);
        setGuardAudioBase64(null);
        setCallTranscript('');
      } catch (e) {
        alert("Microphone access is required to record snippets.");
      }
    }
  };

  const handleVideo = (e: any) => {
    const file = e.target.files[0];
    if (file) {
      const r = new FileReader();
      r.onload = () => handleAnalysis('news', { data: (r.result as string).split(',')[1], mimeType: file.type });
      r.readAsDataURL(file);
    }
  };

  const handleAudioUpload = (e: any) => {
    const file = e.target.files[0];
    if (file) {
      setGuardMimeType(file.type);
      const r = new FileReader();
      r.onload = () => {
        const base64 = (r.result as string).split(',')[1];
        setGuardAudioBase64(base64);
        setGuardAudioUrl(r.result as string);
        setCallTranscript('');
        handleAnalysis('call', { data: base64, mimeType: file.type });
      };
      r.readAsDataURL(file);
    }
  };

  const startScreenScan = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      const video = document.createElement('video');
      video.srcObject = stream;
      await video.play();
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext('2d')?.drawImage(video, 0, 0);
      stream.getTracks().forEach(t => t.stop());
      setChatContext({ image: canvas.toDataURL('image/jpeg') });
      setActiveTab('chat');
    } catch (e) { alert("Screen scan not supported."); }
  };

  if (!isLoggedIn) {
    return (
      <div className="flex flex-col h-screen bg-[#fafbff] font-sans max-w-md mx-auto p-8 justify-center shadow-2xl overflow-hidden">
        <div className="mb-12 text-center animate-in fade-in slide-in-from-top duration-700">
          <div className="w-24 h-24 bg-[#1e1b4b] rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 shadow-2xl border-4 border-white rotate-3">
            <Shield className="w-12 h-12 text-orange-500 fill-current" />
          </div>
          <h1 className="text-4xl font-black text-[#1e1b4b] mb-1">Satyam</h1>
          <p className="text-slate-400 font-bold uppercase tracking-[0.3em] text-[10px]">Truth for Bharat</p>
        </div>
        <div className="bg-white rounded-[3rem] p-10 shadow-2xl border border-slate-100">
          <h2 className="text-2xl font-black text-[#1e1b4b] mb-2">{authStep === 'phone' ? 'Secure Login' : 'Enter OTP'}</h2>
          <p className="text-slate-400 text-sm mb-8">Enter your details to protect your digital identity.</p>
          {authStep === 'phone' ? (
            <div className="space-y-6">
              <div className="flex bg-slate-50 rounded-2xl border-2 border-slate-100 p-4">
                <span className="font-black border-r px-4">+91</span>
                <input type="tel" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} placeholder="Mobile Number" className="bg-transparent px-4 outline-none w-full font-black" />
              </div>
              <button onClick={handleLogin} className="w-full bg-[#1e1b4b] text-white py-5 rounded-2xl font-black shadow-lg">Send OTP</button>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="flex justify-between gap-2">
                {otp.map((d, i) => <input key={i} ref={el => otpRefs.current[i] = el} type="text" maxLength={1} value={d} onChange={e => { const n = [...otp]; n[i] = e.target.value; setOtp(n); if(e.target.value && i < 3) otpRefs.current[i+1]?.focus(); }} className="w-full h-16 text-center text-2xl font-black bg-slate-50 rounded-2xl border-2" />)}
              </div>
              <button onClick={handleLogin} className="w-full bg-[#1e1b4b] text-white py-5 rounded-2xl font-black shadow-lg">Verify & Enter</button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-slate-50 font-sans max-w-md mx-auto shadow-2xl overflow-hidden relative">
      {showOnboarding && <OnboardingTour lang={lang} onComplete={() => { setShowOnboarding(false); localStorage.setItem('satyam_v1_onboard', 'true'); }} />}
      <input type="file" accept="video/*" ref={videoInputRef} className="hidden" onChange={handleVideo} />
      <input type="file" accept="audio/*" ref={audioInputRef} className="hidden" onChange={handleAudioUpload} />
      
      <header className="flex justify-between items-center p-6 bg-white shadow-sm z-20">
        <div className="flex items-center gap-3">
          <Shield className="w-8 h-8 text-orange-500 fill-current p-1.5 bg-[#1e1b4b] rounded-lg" />
          <h1 className="text-xl font-black text-[#1e1b4b]">Satyam</h1>
        </div>
        <div className="flex items-center gap-2">
          <button className="bg-red-50 text-red-600 px-3 py-1.5 rounded-full text-[10px] font-black border border-red-100 flex items-center gap-1" onClick={() => alert("Calling 112...")}><Phone size={12}/> 112</button>
          <div className="bg-indigo-50 px-3 py-1.5 rounded-full text-[10px] font-black text-[#1e1b4b]">★ 1.2k</div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pb-32 px-6 pt-6 no-scrollbar">
        {result ? (
          <div className="animate-in fade-in duration-500">
             <ResultCard result={result} lang={lang} onBack={() => setResult(null)} />
          </div>
        ) : (
          <>
            {activeTab === 'home' && (
              <div className="animate-in fade-in duration-500">
                <div className="flex justify-between items-end mb-6">
                  <div><p className="text-[10px] uppercase font-black text-slate-400 mb-1">{s.greetings.morning} 🙏</p><h2 className="text-2xl font-black text-[#1e1b4b]">{s.dashboard.statusSafe}</h2></div>
                  <LanguagePicker current={lang} onSelect={setLang} />
                </div>
                <RiskMeter score={12} lang={lang} />
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <ToolCard icon={<Search className="text-orange-500"/>} title="Fact Check" onClick={() => setActiveTab('chat')} />
                  <ToolCard icon={<Video className="text-purple-600"/>} title="Video Check" onClick={() => videoInputRef.current?.click()} />
                  <ToolCard icon={<Camera className="text-blue-600"/>} title="Screen Scan" onClick={startScreenScan} />
                  <ToolCard icon={<Phone className="text-green-600"/>} title="Call Guard" onClick={() => setActiveTab('guard')} />
                </div>
                <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border mb-6">
                  <textarea value={textInput} onChange={e => setTextInput(e.target.value)} placeholder={s.textInputPlaceholder} className="w-full h-24 bg-slate-50 rounded-2xl p-4 text-xs font-black outline-none resize-none border" />
                  <button onClick={() => handleAnalysis('news')} className="w-full bg-[#1e1b4b] text-white py-5 rounded-2xl font-black text-sm mt-4 shadow-xl">Verify Now</button>
                </div>
              </div>
            )}

            {activeTab === 'guard' && (
              <div className="animate-in fade-in duration-500 space-y-6">
                <div>
                  <h2 className="text-3xl font-black text-[#1e1b4b] mb-1">{s.callGuardTitle}</h2>
                  <p className="text-slate-500 font-medium text-xs leading-relaxed">{s.callGuardDesc}</p>
                </div>

                {/* Audio Recording Section */}
                <div className="bg-indigo-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl">
                   <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16"></div>
                   <div className="relative z-10 flex flex-col items-center gap-6">
                      <button 
                        onClick={toggleGuardRecording}
                        className={`w-24 h-24 rounded-full flex items-center justify-center transition-all ${isRecordingGuard ? 'bg-red-500 animate-pulse' : 'bg-white text-indigo-900'}`}
                      >
                         {isRecordingGuard ? <Square size={32} fill="currentColor" /> : <Mic size={40} />}
                      </button>
                      <div className="text-center">
                        <h4 className="font-black text-lg">{isRecordingGuard ? 'Recording Snippet...' : 'Tap to Record Live Call'}</h4>
                        <p className="text-white/50 text-[10px] uppercase font-bold tracking-widest mt-1">
                          Capture suspicious bank or KYC talk
                        </p>
                      </div>

                      {guardAudioUrl && !isRecordingGuard && (
                        <div className="w-full bg-white/10 rounded-2xl p-4 flex items-center gap-4 border border-white/20">
                           <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-indigo-900">
                              <Volume2 size={20} />
                           </div>
                           <audio src={guardAudioUrl} controls className="flex-1 h-8 opacity-70" />
                        </div>
                      )}
                   </div>
                </div>

                {/* Transcript Input Section */}
                <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-100">
                  <div className="space-y-4">
                    <div>
                      <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                        <FileText size={14} className="text-indigo-600" />
                        Enter Call Transcript
                      </label>
                      <textarea 
                        value={callTranscript}
                        onChange={e => {
                          setCallTranscript(e.target.value);
                          setGuardAudioBase64(null);
                          setGuardAudioUrl(null);
                        }}
                        placeholder="e.g. 'This is your bank manager, please share your CVV...'"
                        className="w-full h-32 bg-slate-50 rounded-2xl p-5 text-sm font-bold text-[#1e1b4b] border-2 border-slate-100 focus:border-indigo-600 outline-none transition-all resize-none shadow-inner placeholder:text-slate-300"
                      />
                    </div>

                    <div className="flex gap-3">
                      <button 
                        onClick={() => audioInputRef.current?.click()}
                        className="flex-1 bg-slate-100 text-slate-600 py-4 rounded-2xl font-black text-xs flex items-center justify-center gap-2 hover:bg-slate-200"
                      >
                        <Upload size={16} /> Upload File
                      </button>
                      <button 
                        onClick={() => handleAnalysis('call')}
                        disabled={!callTranscript.trim() && !guardAudioBase64}
                        className="flex-[2] bg-[#1e1b4b] text-white py-4 rounded-2xl font-black text-sm shadow-xl shadow-indigo-900/20 active:scale-95 transition-all disabled:opacity-30"
                      >
                        Start Scam Check
                      </button>
                    </div>
                  </div>
                </div>

                {/* Privacy/Safety Tip */}
                <div className="bg-orange-50 border border-orange-100 rounded-2xl p-5 flex gap-4">
                   <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600 shrink-0">
                      <ShieldAlert size={20} />
                   </div>
                   <div>
                      <h4 className="text-[#1e1b4b] font-black text-xs mb-1">Stay Safe from Scams</h4>
                      <p className="text-[10px] font-bold text-orange-700 leading-normal">
                        Never share OTP, PIN, or login passwords with anyone calling, even if they claim to be from the government or bank.
                      </p>
                   </div>
                </div>
              </div>
            )}

            {activeTab === 'chat' && <ChatBot lang={lang} context={chatContext} onClearContext={() => setChatContext(null)} />}

            {activeTab === 'profile' && (
              <div className="space-y-8 animate-in slide-in-from-bottom duration-500 pb-10">
                <h2 className="text-3xl font-black text-[#1e1b4b]">Profile</h2>
                <div className="bg-[#1e1b4b] p-8 rounded-[3rem] text-center text-white relative overflow-hidden shadow-2xl">
                  <div className="w-20 h-20 bg-white/10 rounded-[2rem] mx-auto mb-4 flex items-center justify-center text-3xl font-black text-orange-400">RP</div>
                  <h3 className="text-2xl font-black">Ram Prasad</h3>
                  <p className="text-white/40 font-bold uppercase text-[10px] tracking-widest mt-1">+91 {phoneNumber}</p>
                  <div className="flex justify-center gap-2 mt-4">
                    <span className="bg-white/5 border border-white/10 px-3 py-1.5 rounded-full text-[8px] font-black uppercase flex items-center gap-1"><ShieldCheck size={12}/> Verified</span>
                    <span className="bg-white/5 border border-white/10 px-3 py-1.5 rounded-full text-[8px] font-black uppercase flex items-center gap-1"><Award size={12}/> Pro</span>
                  </div>
                </div>
                <div className="bg-white rounded-[2.5rem] border overflow-hidden">
                  <SettingRow icon={<Lock className="text-red-500"/>} title="Identity Shield" value="Active" />
                  <SettingRow icon={<Globe className="text-indigo-600"/>} title="Regional Support" value={lang.toUpperCase()} />
                  <SettingRow icon={<LogOut className="text-slate-400"/>} title="Logout" onClick={() => setIsLoggedIn(false)} border={false} />
                </div>
              </div>
            )}
          </>
        )}
      </main>

      <nav className="absolute bottom-0 w-full bg-white/95 backdrop-blur-xl border-t p-4 px-8 flex justify-between items-end pb-10 shadow-2xl">
        <NavIcon icon={<Home/>} label="Home" active={activeTab === 'home'} onClick={() => setActiveTab('home')} />
        <NavIcon icon={<Shield/>} label="Guard" active={activeTab === 'guard'} onClick={() => setActiveTab('guard')} />
        <button onClick={() => setActiveTab('chat')} className={`w-16 h-16 rounded-[2rem] shadow-xl flex items-center justify-center -mt-10 border-4 border-white transition-all ${activeTab === 'chat' ? 'bg-[#1e1b4b]' : 'bg-orange-500 shadow-orange-500/30'}`}>
          <Mic className="text-white" size={28}/>
        </button>
        <NavIcon icon={<Users/>} label="Village" active={activeTab === 'community'} onClick={() => setActiveTab('community')} />
        <NavIcon icon={<User/>} label="Me" active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} />
      </nav>

      {loading && (
        <div className="fixed inset-0 bg-indigo-950/80 backdrop-blur-md z-[100] flex items-center justify-center p-12">
          <div className="bg-white p-10 rounded-[3.5rem] text-center w-full max-w-xs animate-in zoom-in">
            <div className="w-12 h-12 border-4 border-[#1e1b4b] border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
            <h2 className="text-xl font-black text-[#1e1b4b]">{loadingMsg}</h2>
            <p className="text-[10px] font-black uppercase text-slate-400 mt-2 tracking-widest">Bharat Safety Core Active</p>
          </div>
        </div>
      )}
    </div>
  );
};

const ToolCard = ({ icon, title, onClick }: any) => (
  <button onClick={onClick} className="bg-white p-6 rounded-[2rem] shadow-sm border flex flex-col items-start gap-3 active:scale-95 transition-all text-left group">
    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center group-hover:bg-indigo-50 transition-colors">{icon}</div>
    <span className="text-sm font-black text-[#1e1b4b] leading-none">{title}</span>
  </button>
);

const NavIcon = ({ icon, label, active, onClick }: any) => (
  <button onClick={onClick} className={`flex flex-col items-center gap-1 transition-all ${active ? 'text-[#1e1b4b]' : 'text-slate-300'}`}>
    {icon}
    <span className="text-[8px] font-black uppercase tracking-tighter">{label}</span>
  </button>
);

const SettingRow = ({ icon, title, value, onClick, border = true }: any) => (
  <button onClick={onClick} className={`w-full flex items-center justify-between p-6 active:bg-slate-50 transition-colors ${border ? 'border-b' : ''}`}>
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center">{icon}</div>
      <span className="text-sm font-black text-[#1e1b4b]">{title}</span>
    </div>
    {value && <span className="text-[10px] font-black text-slate-300 uppercase">{value}</span>}
    <ChevronRight size={16} className="text-slate-200" />
  </button>
);

export default App;
