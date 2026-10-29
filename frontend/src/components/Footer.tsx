import React from 'react';
import { ShieldCheck, PhoneCall, RotateCcw, ExternalLink, HeartHandshake } from 'lucide-react';
import { Language } from '../types';
import { api } from '../services/api';

interface FooterProps {
  language: Language;
  onNavigate: (tab: any) => void;
}

export const Footer: React.FC<FooterProps> = ({ language, onNavigate }) => {
  const handleReset = async () => {
    if (confirm("Reset demonstration database back to default seed data?")) {
      await api.resetDemoData();
      alert("Demonstration database reset successfully. Reloading view.");
      window.location.reload();
    }
  };

  return (
    <footer className="bg-gov-navy text-white mt-16 border-t-4 border-gov-orange">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Identity & Scope */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-xl font-black text-white tracking-tight">LOKORITHM</span>
              <span className="text-[10px] bg-gov-orange text-white px-2 py-0.5 rounded font-bold">2026</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              AI-Powered Citizen Services and Smart Governance. Built for the Seva Innovation Challenge 2026 under the Women Category & Emerging Technologies.
            </p>
            <div className="pt-2">
              <span className="inline-block text-[11px] bg-slate-800/80 border border-slate-700 text-amber-300 px-2 py-1 rounded">
                Prototype — Demonstration Only
              </span>
            </div>
          </div>

          {/* Citizen Modules */}
          <div>
            <h4 className="text-sm font-bold text-gov-orange uppercase tracking-wider mb-3">
              Citizen Services
            </h4>
            <ul className="space-y-2 text-xs text-slate-300">
              <li>
                <button onClick={() => onNavigate('schemes')} className="hover:text-white transition">
                  Maharashtra Welfare Schemes
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('assistant')} className="hover:text-white transition">
                  AI Multilingual Helpdesk
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('grievance')} className="hover:text-white transition">
                  Public Grievance Redressal
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('documents')} className="hover:text-white transition">
                  Document Check & OCR Preview
                </button>
              </li>
            </ul>
          </div>

          {/* Official Helplines */}
          <div>
            <h4 className="text-sm font-bold text-gov-orange uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <PhoneCall className="w-3.5 h-3.5" />
              Emergency & Public Helplines
            </h4>
            <ul className="space-y-2 text-xs text-slate-300">
              <li className="flex justify-between border-b border-slate-700/60 pb-1">
                <span>National Emergency:</span>
                <span className="font-mono font-bold text-white">112</span>
              </li>
              <li className="flex justify-between border-b border-slate-700/60 pb-1">
                <span>Women Helpline (National):</span>
                <span className="font-mono font-bold text-white">1091</span>
              </li>
              <li className="flex justify-between border-b border-slate-700/60 pb-1">
                <span>Aaple Sarkar Citizen RTS:</span>
                <span className="font-mono font-bold text-white">1800 120 8040</span>
              </li>
              <li className="flex justify-between pb-1">
                <span>Childline Support:</span>
                <span className="font-mono font-bold text-white">1098</span>
              </li>
            </ul>
          </div>

          {/* Responsible AI & Reset */}
          <div>
            <h4 className="text-sm font-bold text-gov-orange uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-gov-green" />
              Responsible AI Governance
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed mb-3">
              Algorithms provide advisory classification and eligibility matching. Final statutory sanction and grievance resolution are strictly performed by authorized government officers.
            </p>
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 px-3 py-1.5 rounded transition font-medium"
            >
              <RotateCcw className="w-3.5 h-3.5 text-gov-orange" />
              Reset Demonstration Data
            </button>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 pt-6 border-t border-slate-800 text-xs text-slate-400 flex flex-col md:flex-row items-center justify-between gap-4">
          <p>
            © 2026 LOKORITHM Prototype. Not an official government website. Built for evaluation in Seva Innovation Challenge.
          </p>
          <div className="flex items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1 text-slate-300">
              <HeartHandshake className="w-3.5 h-3.5 text-gov-orange" />
              Focus: Women Category & Maharashtra Citizen Empowerment
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
