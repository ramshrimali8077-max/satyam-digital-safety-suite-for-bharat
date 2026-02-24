
import React from 'react';
import { Language } from '../types';
import { LANGUAGES } from '../constants';

interface LanguagePickerProps {
  current: Language;
  onSelect: (lang: Language) => void;
}

export const LanguagePicker: React.FC<LanguagePickerProps> = ({ current, onSelect }) => {
  return (
    <div className="flex gap-2 justify-center mb-8 overflow-x-auto pb-2 no-scrollbar">
      {LANGUAGES.map((l) => (
        <button
          key={l.code}
          onClick={() => onSelect(l.code)}
          className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${
            current === l.code 
              ? 'bg-[#000080] text-white shadow-[0_10px_20px_rgba(0,0,128,0.2)]' 
              : 'bg-white text-slate-400 border border-slate-100 hover:bg-slate-50 shadow-sm'
          }`}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
};
