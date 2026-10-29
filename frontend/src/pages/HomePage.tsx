import React, { useState } from 'react';
import { 
  Search, 
  Mic, 
  MicOff, 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  FileText, 
  AlertCircle, 
  HelpCircle, 
  Bell, 
  CheckCircle2, 
  Building, 
  Users, 
  Award,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { ActiveTab, Language } from '../types';
import { translations } from '../translations';

interface HomePageProps {
  language: Language;
  onNavigate: (tab: ActiveTab, query?: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ language, onNavigate }) => {
  const t = translations[language];
  const [assistantQuery, setAssistantQuery] = useState('');
  const [isListening, setIsListening] = useState(false);

  const handleMicClick = () => {
    if (!isListening) {
      setIsListening(true);
      setTimeout(() => {
        setAssistantQuery(
          language === 'mr' 
            ? "मुख्यमंत्री माझी लाडकी बहीण योजनेची पात्रता काय आहे?" 
            : language === 'hi'
            ? "माझी लाडकी बहिन योजना के लिए क्या दस्तावेज चाहिए?"
            : "What documents are required for Mukhyamantri Majhi Ladki Bahin Yojana?"
        );
        setIsListening(false);
      }, 2000);
    } else {
      setIsListening(false);
    }
  };

  const handleAssistantSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (assistantQuery.trim()) {
      onNavigate('assistant', assistantQuery.trim());
    } else {
      onNavigate('assistant');
    }
  };

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-white to-gov-bg border-b border-gov-border pt-10 pb-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Hero Content */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 bg-gov-orange-light border border-gov-orange/30 text-gov-orange-dark px-3 py-1 rounded-full text-xs font-bold tracking-wide">
                <Award className="w-3.5 h-3.5 text-gov-orange" />
                <span>Seva Innovation Challenge 2026 • Women Category</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gov-navy leading-tight tracking-tight">
                {t.heroTitle}
              </h1>

              <p className="text-base sm:text-lg text-gov-muted leading-relaxed max-w-2xl">
                {t.heroSubtitle}
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => onNavigate('schemes')}
                  className="bg-gov-orange hover:bg-gov-orange-dark text-white px-6 py-3 rounded-md font-bold text-sm transition shadow-md flex items-center gap-2"
                >
                  <span>{t.btnFindSchemes}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => onNavigate('assistant')}
                  className="bg-white hover:bg-slate-50 text-gov-navy border-2 border-gov-navy px-6 py-3 rounded-md font-bold text-sm transition flex items-center gap-2 shadow-sm"
                >
                  <Sparkles className="w-4 h-4 text-gov-orange" />
                  <span>{t.btnExploreServices}</span>
                </button>
              </div>

              {/* Verified Trust Metrics */}
              <div className="pt-4 grid grid-cols-3 gap-4 border-t border-gov-border/60">
                <div>
                  <div className="text-2xl font-black text-gov-navy">36</div>
                  <div className="text-xs text-gov-muted font-medium">Maharashtra Districts</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-gov-green">100%</div>
                  <div className="text-xs text-gov-muted font-medium">Source Verified Links</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-gov-orange">&lt; 15 Days</div>
                  <div className="text-xs text-gov-muted font-medium">Right to Services SLA</div>
                </div>
              </div>
            </div>

            {/* Right Hero: Compact Assistant Panel */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-xl shadow-lg border-2 border-gov-navy/10 p-6 relative">
                <div className="flex items-center justify-between pb-4 border-b border-gov-border">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-gov-navy flex items-center justify-center text-white">
                      <Sparkles className="w-4 h-4 text-gov-orange" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-gov-navy">AI Citizen Helpdesk</h3>
                      <p className="text-[11px] text-gov-muted">Multilingual Assistant • Aaple Sarkar Grounded</p>
                    </div>
                  </div>
                  <span className="text-[10px] bg-gov-green-light text-gov-green font-bold px-2 py-0.5 rounded border border-gov-green/20">
                    Online
                  </span>
                </div>

                <form onSubmit={handleAssistantSubmit} className="mt-4 space-y-3">
                  <div className="relative">
                    <textarea
                      value={assistantQuery}
                      onChange={(e) => setAssistantQuery(e.target.value)}
                      placeholder={isListening ? t.assistantListening : t.assistantPlaceholder}
                      rows={3}
                      className="w-full text-xs text-gov-text p-3 border border-gov-border rounded-lg focus:outline-none focus:ring-2 focus:ring-gov-navy/20 resize-none"
                    />

                    {/* Microphone Simulator Button */}
                    <button
                      type="button"
                      onClick={handleMicClick}
                      className={`absolute right-3 bottom-3 p-2 rounded-full border transition ${
                        isListening 
                          ? 'bg-gov-red text-white animate-pulse border-gov-red' 
                          : 'bg-slate-100 hover:bg-slate-200 text-gov-muted border-slate-300'
                      }`}
                      title="Microphone (Simulated Demo)"
                    >
                      {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    </button>
                  </div>

                  {isListening && (
                    <div className="flex items-center gap-2 text-[11px] text-gov-orange font-medium animate-pulse">
                      <span className="w-2 h-2 rounded-full bg-gov-orange" />
                      <span>Simulating voice recognition for Maharashtra resident queries...</span>
                    </div>
                  )}

                  {/* Sample Query Suggestions */}
                  <div className="space-y-1.5 pt-1">
                    <p className="text-[10px] font-semibold text-gov-muted uppercase tracking-wider">
                      Quick Sample Questions:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        type="button"
                        onClick={() => setAssistantQuery("What documents are required for Mukhyamantri Majhi Ladki Bahin Yojana?")}
                        className="text-[11px] bg-gov-bg hover:bg-slate-200 text-gov-navy px-2 py-1 rounded transition text-left"
                      >
                        Ladki Bahin Yojana?
                      </button>
                      <button
                        type="button"
                        onClick={() => setAssistantQuery("How can I apply for an Income Certificate in Maharashtra?")}
                        className="text-[11px] bg-gov-bg hover:bg-slate-200 text-gov-navy px-2 py-1 rounded transition text-left"
                      >
                        Income Certificate?
                      </button>
                      <button
                        type="button"
                        onClick={() => setAssistantQuery("How do I register a pothole road repair grievance?")}
                        className="text-[11px] bg-gov-bg hover:bg-slate-200 text-gov-navy px-2 py-1 rounded transition text-left"
                      >
                        Road repair complaint?
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-gov-navy hover:bg-gov-navy-light text-white py-2.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 shadow"
                  >
                    <span>{t.btnAskAssistant}</span>
                    <ChevronRight className="w-4 h-4 text-gov-orange" />
                  </button>
                </form>

                <p className="text-[10px] text-slate-400 text-center mt-2">
                  Demonstration prototype • Grounded on public Maharashtra Government directories
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Featured Highlight: Women Empowerment Category */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="bg-gradient-to-r from-gov-navy to-gov-navy-light text-white rounded-xl p-6 sm:p-8 shadow-md relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-64 h-64 bg-gov-orange/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <span className="bg-gov-orange text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">
                Seva Innovation Challenge • Women Category Focus
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                Empowering Maharashtra's Women through Targeted Smart Governance
              </h2>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                Prioritizing state welfare initiatives including the <strong>Mukhyamantri Majhi Ladki Bahin Yojana</strong> (₹1,500/mo), <strong>Lek Ladki Yojana</strong> (₹1,01,000 for girl child), and collateral-free <strong>MUDRA</strong> financing for women entrepreneurs.
              </p>
            </div>

            <button
              onClick={() => onNavigate('schemes', 'women')}
              className="whitespace-nowrap bg-gov-orange hover:bg-gov-orange-dark text-white px-5 py-2.5 rounded-lg font-bold text-xs transition shadow flex items-center gap-2"
            >
              <span>Explore Women Welfare Schemes</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Quick Service Cards (6 Core Modules) */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <h2 className="text-2xl sm:text-3xl font-black text-gov-navy">
            Core Citizen Services
          </h2>
          <p className="text-xs sm:text-sm text-gov-muted mt-2">
            Direct access to simplified public services with transparent departmental tracking
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1: Find a Government Scheme */}
          <div 
            onClick={() => onNavigate('schemes')}
            className="bg-white border border-gov-border rounded-xl p-6 shadow-sm hover:shadow-md hover:border-gov-navy/30 transition cursor-pointer group flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-gov-green group-hover:scale-105 transition">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-gov-navy group-hover:text-gov-orange transition">
                {t.quickSchemeTitle}
              </h3>
              <p className="text-xs text-gov-muted leading-relaxed">
                {t.quickSchemeDesc}
              </p>
            </div>
            <div className="pt-4 mt-2 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-gov-navy">
              <span>Filter by District & Age</span>
              <ChevronRight className="w-4 h-4 text-gov-orange group-hover:translate-x-1 transition" />
            </div>
          </div>

          {/* Card 2: Understand Required Documents */}
          <div 
            onClick={() => onNavigate('documents')}
            className="bg-white border border-gov-border rounded-xl p-6 shadow-sm hover:shadow-md hover:border-gov-navy/30 transition cursor-pointer group flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 group-hover:scale-105 transition">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-gov-navy group-hover:text-gov-orange transition">
                {t.quickDocsTitle}
              </h3>
              <p className="text-xs text-gov-muted leading-relaxed">
                {t.quickDocsDesc}
              </p>
            </div>
            <div className="pt-4 mt-2 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-gov-navy">
              <span>OCR Preliminary Verification</span>
              <ChevronRight className="w-4 h-4 text-gov-orange group-hover:translate-x-1 transition" />
            </div>
          </div>

          {/* Card 3: Submit a Grievance */}
          <div 
            onClick={() => onNavigate('grievance')}
            className="bg-white border border-gov-border rounded-xl p-6 shadow-sm hover:shadow-md hover:border-gov-navy/30 transition cursor-pointer group flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 group-hover:scale-105 transition">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-gov-navy group-hover:text-gov-orange transition">
                {t.quickGrievanceTitle}
              </h3>
              <p className="text-xs text-gov-muted leading-relaxed">
                {t.quickGrievanceDesc}
              </p>
            </div>
            <div className="pt-4 mt-2 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-gov-navy">
              <span>Instant AI Ticket Creation</span>
              <ChevronRight className="w-4 h-4 text-gov-orange group-hover:translate-x-1 transition" />
            </div>
          </div>

          {/* Card 4: Track a Complaint */}
          <div 
            onClick={() => onNavigate('grievance')}
            className="bg-white border border-gov-border rounded-xl p-6 shadow-sm hover:shadow-md hover:border-gov-navy/30 transition cursor-pointer group flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-lg bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600 group-hover:scale-105 transition">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-gov-navy group-hover:text-gov-orange transition">
                {t.quickTrackTitle}
              </h3>
              <p className="text-xs text-gov-muted leading-relaxed">
                {t.quickTrackDesc}
              </p>
            </div>
            <div className="pt-4 mt-2 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-gov-navy">
              <span>View Interactive Timeline</span>
              <ChevronRight className="w-4 h-4 text-gov-orange group-hover:translate-x-1 transition" />
            </div>
          </div>

          {/* Card 5: Get Application Guidance */}
          <div 
            onClick={() => onNavigate('assistant')}
            className="bg-white border border-gov-border rounded-xl p-6 shadow-sm hover:shadow-md hover:border-gov-navy/30 transition cursor-pointer group flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-lg bg-orange-50 border border-orange-200 flex items-center justify-center text-gov-orange group-hover:scale-105 transition">
                <HelpCircle className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-gov-navy group-hover:text-gov-orange transition">
                {t.quickGuidanceTitle}
              </h3>
              <p className="text-xs text-gov-muted leading-relaxed">
                {t.quickGuidanceDesc}
              </p>
            </div>
            <div className="pt-4 mt-2 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-gov-navy">
              <span>Interactive Step-by-Step</span>
              <ChevronRight className="w-4 h-4 text-gov-orange group-hover:translate-x-1 transition" />
            </div>
          </div>

          {/* Card 6: View Public-Service Updates */}
          <div 
            onClick={() => onNavigate('schemes')}
            className="bg-white border border-gov-border rounded-xl p-6 shadow-sm hover:shadow-md hover:border-gov-navy/30 transition cursor-pointer group flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-lg bg-slate-100 border border-slate-300 flex items-center justify-center text-slate-700 group-hover:scale-105 transition">
                <Bell className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-gov-navy group-hover:text-gov-orange transition">
                {t.quickUpdatesTitle}
              </h3>
              <p className="text-xs text-gov-muted leading-relaxed">
                {t.quickUpdatesDesc}
              </p>
            </div>
            <div className="pt-4 mt-2 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-gov-navy">
              <span>Official Department Alerts</span>
              <ChevronRight className="w-4 h-4 text-gov-orange group-hover:translate-x-1 transition" />
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Transparency Section */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="bg-white border border-gov-border rounded-xl p-8 shadow-sm">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <div className="inline-flex items-center gap-1.5 text-gov-green text-xs font-bold uppercase tracking-wider mb-2">
              <ShieldCheck className="w-4 h-4" />
              <span>Security & Integrity Standards</span>
            </div>
            <h2 className="text-2xl font-black text-gov-navy">
              {t.trustTitle}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 rounded-lg bg-gov-bg border border-gov-border">
              <div className="w-8 h-8 rounded bg-gov-green/10 text-gov-green flex items-center justify-center mb-3">
                <Building className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-gov-navy mb-1">
                {t.trust1Title}
              </h3>
              <p className="text-xs text-gov-muted leading-relaxed">
                {t.trust1Desc}
              </p>
            </div>

            <div className="p-4 rounded-lg bg-gov-bg border border-gov-border">
              <div className="w-8 h-8 rounded bg-gov-orange/10 text-gov-orange flex items-center justify-center mb-3">
                <Users className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-gov-navy mb-1">
                {t.trust2Title}
              </h3>
              <p className="text-xs text-gov-muted leading-relaxed">
                {t.trust2Desc}
              </p>
            </div>

            <div className="p-4 rounded-lg bg-gov-bg border border-gov-border">
              <div className="w-8 h-8 rounded bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-gov-navy mb-1">
                {t.trust3Title}
              </h3>
              <p className="text-xs text-gov-muted leading-relaxed">
                {t.trust3Desc}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Public Notices / Recent Updates Bulletin */}
      <section className="max-w-7xl mx-auto px-4 pb-6">
        <div className="bg-slate-50 border border-gov-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-4 border-b border-gov-border pb-3">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-gov-orange" />
              <h3 className="text-sm font-bold text-gov-navy uppercase tracking-wider">
                Public Service Bulletins & Official Circulars
              </h3>
            </div>
            <span className="text-[11px] text-gov-muted">Maharashtra Public Portal Feeds</span>
          </div>

          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-3 bg-white rounded border border-gov-border">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] bg-red-100 text-gov-red font-bold px-1.5 py-0.5 rounded">NEW</span>
                  <span className="text-xs font-bold text-gov-navy">MahaDBT Scholarship 2026-27 Enrollment Cycle</span>
                </div>
                <p className="text-[11px] text-gov-muted">Post-Matric scholarship scrutiny is active across all 36 District Social Welfare Offices.</p>
              </div>
              <a 
                href="https://mahadbt.maharashtra.gov.in" 
                target="_blank" 
                rel="noreferrer" 
                className="text-xs text-gov-navy font-semibold hover:underline flex items-center gap-1"
              >
                <span>MahaDBT Portal</span>
                <ExternalLink className="w-3 h-3 text-gov-orange" />
              </a>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-3 bg-white rounded border border-gov-border">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] bg-emerald-100 text-gov-green font-bold px-1.5 py-0.5 rounded">UPDATED</span>
                  <span className="text-xs font-bold text-gov-navy">Mukhyamantri Majhi Ladki Bahin Yojana - eKYC Verification</span>
                </div>
                <p className="text-[11px] text-gov-muted">Beneficiaries can verify Aadhaar seeding status directly at local Taluka Setu Kendra.</p>
              </div>
              <a 
                href="https://ladakibahin.maharashtra.gov.in" 
                target="_blank" 
                rel="noreferrer" 
                className="text-xs text-gov-navy font-semibold hover:underline flex items-center gap-1"
              >
                <span>WCD Portal</span>
                <ExternalLink className="w-3 h-3 text-gov-orange" />
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
