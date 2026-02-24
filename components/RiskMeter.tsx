
import React from 'react';
import { Language } from '../types';
import { STRINGS } from '../constants';
import { Shield, CheckCircle2 } from 'lucide-react';

export const RiskMeter: React.FC<{ score: number; lang: Language }> = ({ score, lang }) => {
  const s = STRINGS[lang];
  
  const getRiskText = () => {
    if (score < 30) return lang === 'hi' ? 'कम' : 'Low';
    if (score < 70) return lang === 'hi' ? 'मध्यम' : 'Medium';
    return lang === 'hi' ? 'उच्च' : 'High';
  };

  const getStatusText = () => {
    if (score < 30) return lang === 'hi' ? 'सुरक्षित ज़ोन' : 'Safe Zone';
    if (score < 70) return lang === 'hi' ? 'जोखિમ क्षेत्र' : 'Risk Zone';
    return lang === 'hi' ? 'खतरे की घंटी' : 'Danger Zone';
  };

  const getBarColor = () => {
    if (score < 30) return 'bg-green-500';
    if (score < 70) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div className="bg-gradient-to-br from-indigo-900 to-indigo-800 rounded-2xl p-6 text-white shadow-lg mb-8 relative overflow-hidden">
      {/* Decorative Blur */}
      <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
      
      <div className="flex justify-between items-start relative z-10">
        <div>
          <p className="text-indigo-200 text-[10px] uppercase tracking-wider font-bold">{lang === 'hi' ? 'वर्तमान जोखिम स्तर' : 'Current Risk Level'}</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-black">{getRiskText()}</span>
            <span className="text-green-400 font-bold text-sm">{getStatusText()}</span>
          </div>
        </div>
        <Shield className="w-10 h-10 text-green-400 opacity-80" />
      </div>
      
      {/* Risk Bar */}
      <div className="mt-6 h-2 bg-indigo-950 rounded-full overflow-hidden">
        <div 
          className={`h-full ${getBarColor()} rounded-full transition-all duration-1000`}
          style={{ width: `${score}%` }}
        ></div>
      </div>
      
      <p className="mt-3 text-[10px] text-indigo-300 flex items-center gap-1 font-bold">
        <CheckCircle2 size={12} className="text-green-400" /> {lang === 'hi' ? 'आज 24 घोटाले रोके गए' : '24 Scams blocked today'}
      </p>
    </div>
  );
};
