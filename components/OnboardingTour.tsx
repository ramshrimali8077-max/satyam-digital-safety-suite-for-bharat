
import React, { useState } from 'react';
import { Language } from '../types';
import { STRINGS } from '../constants';
import { X, ChevronRight, Shield, Search, Camera, Phone, MessageSquare } from 'lucide-react';

interface OnboardingTourProps {
  lang: Language;
  onComplete: () => void;
}

export const OnboardingTour: React.FC<OnboardingTourProps> = ({ lang, onComplete }) => {
  const [step, setStep] = useState(0);
  const s = STRINGS[lang].onboarding;
  
  const stepIcons = [
    <Shield className="w-16 h-16 text-orange-500" />,
    <Search className="w-16 h-16 text-indigo-600" />,
    <Camera className="w-16 h-16 text-blue-600" />,
    <Phone className="w-16 h-16 text-green-600" />,
    <MessageSquare className="w-16 h-16 text-orange-600" />
  ];

  const handleNext = () => {
    if (step < s.steps.length - 1) {
      setStep(step + 1);
    } else {
      onComplete();
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-indigo-950/80 backdrop-blur-md animate-in fade-in duration-500">
      <div className="bg-white w-full max-w-sm rounded-[3.5rem] p-10 shadow-2xl relative overflow-hidden flex flex-col items-center text-center animate-in zoom-in slide-in-from-bottom-10 duration-500">
        <div className="absolute top-0 left-0 w-full h-2 bg-slate-100">
          <div 
            className="h-full bg-orange-500 transition-all duration-500"
            style={{ width: `${((step + 1) / s.steps.length) * 100}%` }}
          ></div>
        </div>

        <button 
          onClick={onComplete}
          className="absolute top-6 right-6 p-2 text-slate-300 hover:text-slate-600 transition-colors"
        >
          <X size={24} />
        </button>

        <div className="mt-8 mb-10 w-32 h-32 bg-slate-50 rounded-[3rem] flex items-center justify-center shadow-inner animate-pulse">
          {stepIcons[step]}
        </div>

        <h2 className="text-3xl font-black text-indigo-900 mb-4 tracking-tighter leading-tight">
          {s.steps[step].title}
        </h2>
        
        <p className="text-slate-500 font-bold text-sm leading-relaxed mb-12 px-2">
          {s.steps[step].desc}
        </p>

        <div className="w-full space-y-4">
          <button 
            onClick={handleNext}
            className="w-full bg-indigo-900 text-white py-6 rounded-[2rem] font-black text-lg shadow-xl shadow-indigo-900/20 active:scale-95 transition-all flex items-center justify-center gap-3"
          >
            {step === s.steps.length - 1 ? s.finish : s.next}
            <ChevronRight size={20} />
          </button>
          
          <button 
            onClick={onComplete}
            className="text-slate-400 font-black text-[11px] uppercase tracking-widest hover:text-indigo-900 transition-colors"
          >
            {s.skip}
          </button>
        </div>

        <div className="mt-8 flex gap-2">
          {s.steps.map((_, i) => (
            <div 
              key={i} 
              className={`h-1.5 rounded-full transition-all duration-300 ${i === step ? 'w-8 bg-indigo-900' : 'w-2 bg-slate-200'}`}
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
};
