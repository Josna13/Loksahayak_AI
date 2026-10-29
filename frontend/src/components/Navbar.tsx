import React from 'react';
import { 
  Building2, 
  Bot, 
  Search, 
  AlertCircle, 
  FileCheck, 
  BarChart3, 
  ShieldCheck, 
  Globe, 
  UserCheck, 
  Sparkles,
  Layers
} from 'lucide-react';
import { ActiveTab, Language, UserRole } from '../types';
import { translations } from '../translations';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  role: UserRole;
  setRole: (role: UserRole) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  language,
  setLanguage,
  role,
  setRole
}) => {
  const t = translations[language];

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gov-border shadow-sm">
      {/* Tricolor Government Ribbon */}
      <div className="h-1.5 w-full bg-gradient-to-r from-gov-orange via-white to-gov-green" />

      {/* Top Government Bar */}
      <div className="bg-gov-navy text-white text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 font-medium text-slate-300 text-[11px]">
            <span className="font-semibold text-white">Government of Maharashtra</span>
            <span className="text-slate-500">•</span>
            <span>Citizen Services & Smart Governance Portal</span>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Language Switcher */}
            <div className="flex items-center gap-1.5 bg-gov-navy-dark px-2.5 py-1 rounded border border-slate-700">
              <Globe className="w-3.5 h-3.5 text-gov-orange" />
              <button
                onClick={() => setLanguage('en')}
                className={`text-xs px-1.5 py-0.5 rounded transition ${language === 'en' ? 'bg-gov-orange text-white font-bold' : 'text-slate-300 hover:text-white'}`}
              >
                English
              </button>
              <span className="text-slate-600">|</span>
              <button
                onClick={() => setLanguage('mr')}
                className={`text-xs px-1.5 py-0.5 rounded transition ${language === 'mr' ? 'bg-gov-orange text-white font-bold' : 'text-slate-300 hover:text-white'}`}
              >
                मराठी
              </button>
              <span className="text-slate-600">|</span>
              <button
                onClick={() => setLanguage('hi')}
                className={`text-xs px-1.5 py-0.5 rounded transition ${language === 'hi' ? 'bg-gov-orange text-white font-bold' : 'text-slate-300 hover:text-white'}`}
              >
                हिन्दी
              </button>
            </div>

            {/* Role Switcher */}
            <button
              onClick={() => {
                const nextRole = role === 'citizen' ? 'officer' : 'citizen';
                setRole(nextRole);
                if (nextRole === 'officer' && (activeTab === 'home' || activeTab === 'assistant')) {
                  setActiveTab('officer-dashboard');
                } else if (nextRole === 'citizen' && (activeTab === 'officer-dashboard' || activeTab === 'admin')) {
                  setActiveTab('home');
                }
              }}
              className="flex items-center gap-1.5 text-xs bg-gov-green hover:bg-gov-green-dark text-white px-2.5 py-1 rounded font-medium transition shadow-sm"
              title="Toggle between Citizen and Government Officer View"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>{role === 'citizen' ? t.roleCitizen : t.roleOfficer}</span>
              <span className="text-[10px] bg-black/20 px-1 rounded ml-1 font-mono">
                {t.switchRole}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Brand Identity */}
        <div 
          onClick={() => setActiveTab(role === 'citizen' ? 'home' : 'officer-dashboard')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-lg bg-gov-navy flex items-center justify-center text-white shadow-md border-2 border-gov-orange group-hover:scale-105 transition">
            <Building2 className="w-6 h-6 text-gov-orange" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black tracking-tight text-gov-navy">
                {t.appName}
              </span>
              <span className="text-[10px] font-bold bg-gov-green-light text-gov-green border border-gov-green/30 px-1.5 py-0.5 rounded">
                MAHA-GOV AI
              </span>
            </div>
            <p className="text-xs text-gov-muted hidden sm:block font-medium">
              {t.appTagline}
            </p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1">
          {role === 'citizen' ? (
            <>
              <button
                onClick={() => setActiveTab('home')}
                className={`px-3 py-2 rounded-md text-sm font-semibold transition ${
                  activeTab === 'home' ? 'bg-gov-navy text-white' : 'text-gov-text hover:bg-slate-100'
                }`}
              >
                {t.navHome}
              </button>
              <button
                onClick={() => setActiveTab('assistant')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-semibold transition ${
                  activeTab === 'assistant' ? 'bg-gov-navy text-white' : 'text-gov-text hover:bg-slate-100'
                }`}
              >
                <Bot className="w-4 h-4 text-gov-orange" />
                {t.navAssistant}
              </button>
              <button
                onClick={() => setActiveTab('schemes')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-semibold transition ${
                  activeTab === 'schemes' ? 'bg-gov-navy text-white' : 'text-gov-text hover:bg-slate-100'
                }`}
              >
                <Search className="w-4 h-4 text-gov-green" />
                {t.navSchemes}
              </button>
              <button
                onClick={() => setActiveTab('grievance')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-semibold transition ${
                  activeTab === 'grievance' ? 'bg-gov-navy text-white' : 'text-gov-text hover:bg-slate-100'
                }`}
              >
                <AlertCircle className="w-4 h-4 text-amber-500" />
                {t.navGrievance}
              </button>
              <button
                onClick={() => setActiveTab('documents')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-semibold transition ${
                  activeTab === 'documents' ? 'bg-gov-navy text-white' : 'text-gov-text hover:bg-slate-100'
                }`}
              >
                <FileCheck className="w-4 h-4 text-blue-500" />
                {t.navDocuments}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setActiveTab('officer-dashboard')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-semibold transition ${
                  activeTab === 'officer-dashboard' ? 'bg-gov-navy text-white' : 'text-gov-text hover:bg-slate-100'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-gov-green" />
                {t.navDashboard}
              </button>
              <button
                onClick={() => setActiveTab('grievance')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-semibold transition ${
                  activeTab === 'grievance' ? 'bg-gov-navy text-white' : 'text-gov-text hover:bg-slate-100'
                }`}
              >
                <AlertCircle className="w-4 h-4 text-amber-500" />
                Citizen Grievances
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-semibold transition ${
                  activeTab === 'analytics' ? 'bg-gov-navy text-white' : 'text-gov-text hover:bg-slate-100'
                }`}
              >
                <BarChart3 className="w-4 h-4 text-gov-orange" />
                {t.navAnalytics}
              </button>
              <button
                onClick={() => setActiveTab('admin')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-semibold transition ${
                  activeTab === 'admin' ? 'bg-gov-navy text-white' : 'text-gov-text hover:bg-slate-100'
                }`}
              >
                <Layers className="w-4 h-4 text-purple-600" />
                {t.navAdmin}
              </button>
            </>
          )}
        </nav>

        {/* Quick Action Pill on right */}
        <div className="flex items-center gap-2">
          {role === 'citizen' ? (
            <button
              onClick={() => setActiveTab('grievance')}
              className="bg-gov-orange hover:bg-gov-orange-dark text-white px-3.5 py-1.5 rounded-md text-xs font-bold transition shadow flex items-center gap-1.5"
            >
              <AlertCircle className="w-4 h-4" />
              <span>File Grievance</span>
            </button>
          ) : (
            <button
              onClick={() => setActiveTab('analytics')}
              className="bg-gov-navy-light hover:bg-gov-navy text-white px-3.5 py-1.5 rounded-md text-xs font-bold transition shadow flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4 text-gov-orange" />
              <span>Predictive Insights</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile Nav Bar */}
      <div className="lg:hidden flex overflow-x-auto gap-2 px-4 py-2 bg-slate-50 border-t border-gov-border text-xs font-semibold whitespace-nowrap">
        {role === 'citizen' ? (
          <>
            <button onClick={() => setActiveTab('home')} className={`px-2.5 py-1 rounded ${activeTab === 'home' ? 'bg-gov-navy text-white' : 'text-gov-text'}`}>{t.navHome}</button>
            <button onClick={() => setActiveTab('assistant')} className={`px-2.5 py-1 rounded ${activeTab === 'assistant' ? 'bg-gov-navy text-white' : 'text-gov-text'}`}>{t.navAssistant}</button>
            <button onClick={() => setActiveTab('schemes')} className={`px-2.5 py-1 rounded ${activeTab === 'schemes' ? 'bg-gov-navy text-white' : 'text-gov-text'}`}>{t.navSchemes}</button>
            <button onClick={() => setActiveTab('grievance')} className={`px-2.5 py-1 rounded ${activeTab === 'grievance' ? 'bg-gov-navy text-white' : 'text-gov-text'}`}>{t.navGrievance}</button>
            <button onClick={() => setActiveTab('documents')} className={`px-2.5 py-1 rounded ${activeTab === 'documents' ? 'bg-gov-navy text-white' : 'text-gov-text'}`}>{t.navDocuments}</button>
          </>
        ) : (
          <>
            <button onClick={() => setActiveTab('officer-dashboard')} className={`px-2.5 py-1 rounded ${activeTab === 'officer-dashboard' ? 'bg-gov-navy text-white' : 'text-gov-text'}`}>{t.navDashboard}</button>
            <button onClick={() => setActiveTab('analytics')} className={`px-2.5 py-1 rounded ${activeTab === 'analytics' ? 'bg-gov-navy text-white' : 'text-gov-text'}`}>{t.navAnalytics}</button>
            <button onClick={() => setActiveTab('grievance')} className={`px-2.5 py-1 rounded ${activeTab === 'grievance' ? 'bg-gov-navy text-white' : 'text-gov-text'}`}>Grievances</button>
            <button onClick={() => setActiveTab('admin')} className={`px-2.5 py-1 rounded ${activeTab === 'admin' ? 'bg-gov-navy text-white' : 'text-gov-text'}`}>{t.navAdmin}</button>
          </>
        )}
      </div>
    </header>
  );
};
