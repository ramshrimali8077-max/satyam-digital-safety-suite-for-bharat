
import React, { useState, useRef } from 'react';
import { AnalysisResult, Language, Verdict } from '../types';
import { STRINGS } from '../constants';
import { generateSpeech } from '../services/geminiService';

interface ResultCardProps {
  result: AnalysisResult;
  lang: Language;
  onBack: () => void;
}

export const ResultCard: React.FC<ResultCardProps> = ({ result, lang, onBack }) => {
  const s = STRINGS[lang];
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPreparing, setIsPreparing] = useState(false);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const stopAudio = () => {
    if (audioSourceRef.current) {
      try { audioSourceRef.current.stop(); } catch (e) {}
      audioSourceRef.current = null;
    }
    setIsPlaying(false);
  };

  const handlePlayToggle = async () => {
    if (isPlaying) { stopAudio(); return; }
    try {
      setIsPreparing(true);
      const audioBuffer = await generateSpeech(result.explanation, lang);
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') await ctx.resume();
      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);
      source.onended = () => { setIsPlaying(false); audioSourceRef.current = null; };
      audioSourceRef.current = source;
      setIsPreparing(false);
      setIsPlaying(true);
      source.start();
    } catch (e) {
      setIsPreparing(false);
      setIsPlaying(false);
      console.error(e);
    }
  };

  const verdictStyles = {
    [Verdict.REAL]: 'bg-green-50 text-[#138808] border-green-200 shadow-green-100',
    [Verdict.FAKE]: 'bg-red-50 text-red-600 border-red-200 shadow-red-100',
    [Verdict.SUSPICIOUS]: 'bg-amber-50 text-amber-600 border-amber-200 shadow-amber-100'
  };

  const inputTypeLabel = () => {
    if (result.inputType === 'video') return s.results.verifiedMedia.video;
    if (result.inputType === 'image') return s.results.verifiedMedia.image;
    if (result.inputType === 'audio') return s.results.verifiedMedia.voice;
    return s.results.verifiedMedia.text;
  };

  return (
    <div className="bg-white rounded-[3rem] p-8 shadow-2xl border-4 border-white animate-in zoom-in duration-300">
      <div className="flex justify-between items-start mb-6">
        <div className={`inline-flex items-center gap-3 px-6 py-3 rounded-2xl font-black text-lg border-2 shadow-sm ${verdictStyles[result.verdict]}`}>
          <span className="text-xl">
            {result.verdict === Verdict.REAL && '✅'}
            {result.verdict === Verdict.FAKE && '❌'}
            {result.verdict === Verdict.SUSPICIOUS && '⚠️'}
          </span>
          {s.verdictLabels[result.verdict]}
        </div>
        <div className="bg-slate-50 px-4 py-2 rounded-xl text-[10px] font-black text-slate-400 uppercase tracking-widest border border-slate-100">
          {inputTypeLabel()}
        </div>
      </div>
      
      <div className="mb-8 space-y-4">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{result.category}</h3>
        <p className="text-2xl font-black leading-tight text-[#000080]">
          {result.explanation}
        </p>
      </div>

      {result.sources && result.sources.length > 0 && (
        <div className="mb-8">
          <p className="text-[10px] font-black text-slate-400 mb-4 uppercase tracking-[0.2em]">{s.results.verifiedDoc}</p>
          <div className="space-y-3">
            {result.sources.map((src, i) => src.web && (
              <a 
                key={i} 
                href={src.web.uri} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-3 bg-slate-50/50 p-4 rounded-[1.5rem] border border-slate-100 hover:bg-slate-100 transition-all group"
              >
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-700 shadow-md font-black text-sm">
                  {i+1}
                </div>
                <div className="flex-1 overflow-hidden">
                   <p className="text-sm font-black text-slate-700 truncate">{src.web.title}</p>
                   <p className="text-[10px] font-bold text-blue-500 truncate">{src.web.uri}</p>
                </div>
                <div className="text-slate-200 group-hover:text-blue-500 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-4">
        <button
          onClick={handlePlayToggle}
          disabled={isPreparing}
          className={`w-full py-5 rounded-[2rem] font-black flex items-center justify-center gap-3 transition-all text-lg shadow-sm ${
            isPlaying ? 'bg-red-100 text-red-600 shadow-red-200/50' : 'bg-slate-100 text-[#000080] shadow-slate-200/50'
          }`}
        >
          {isPreparing ? (
            <div className="w-5 h-5 border-2 border-[#000080] border-t-transparent rounded-full animate-spin"></div>
          ) : isPlaying ? (
            <>
              <div className="w-3 h-3 bg-red-600 rounded-sm animate-pulse"></div>
              {s.results.stopListening}
            </>
          ) : (
            <>
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>
              {s.results.listenProof}
            </>
          )}
        </button>

        <button
          onClick={() => {
            const text = `🚨 *SATYAM ALERT* 🚨\n\n*${s.verdictLabels[result.verdict]}*\n\n${result.explanation}\n\nCheck truth on Satyam App.`;
            window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
          }}
          className="w-full bg-[#138808] text-white py-5 rounded-[2rem] font-black text-lg flex items-center justify-center gap-3 shadow-[0_15px_30px_rgba(19,136,8,0.2)] active:scale-95 transition-all"
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.414 0 .004 5.412.001 12.048c0 2.123.554 4.197 1.604 6.046l-1.705 6.225 6.368-1.671a11.83 11.83 0 005.779 1.503h.005c6.635 0 12.046-5.412 12.049-12.049a11.808 11.808 0 00-3.486-8.451z"/></svg>
          {s.results.shareAlert}
        </button>

        <button onClick={onBack} className="w-full py-4 text-slate-400 font-black text-xs tracking-widest uppercase hover:text-[#000080] transition-colors">
          ← {s.back}
        </button>
      </div>
    </div>
  );
};
