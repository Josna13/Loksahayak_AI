import React, { useState } from 'react';
import { ActiveTab, Language, UserRole } from './types';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { AssistantPage } from './pages/AssistantPage';
import { SchemeFinderPage } from './pages/SchemeFinderPage';
import { GrievancePage } from './pages/GrievancePage';
import { DocumentAssistantPage } from './pages/DocumentAssistantPage';
import { OfficerDashboardPage } from './pages/OfficerDashboardPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { AdminKnowledgePage } from './pages/AdminKnowledgePage';
import { ChevronRight, Home as HomeIcon } from 'lucide-react';
import { translations } from './translations';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [language, setLanguage] = useState<Language>('en');
  const [role, setRole] = useState<UserRole>('citizen');
  const [assistantInitialQuery, setAssistantInitialQuery] = useState<string>('');
  const [schemeInitialFilter, setSchemeInitialFilter] = useState<string>('');

  const t = translations[language];

  const handleNavigate = (tab: ActiveTab, param?: string) => {
    if (tab === 'assistant' && param) {
      setAssistantInitialQuery(param);
    }
    if (tab === 'schemes' && param) {
      setSchemeInitialFilter(param);
    }
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getBreadcrumbTitle = (tab: ActiveTab) => {
    switch (tab) {
      case 'home': return t.navHome;
      case 'assistant': return t.navAssistant;
      case 'schemes': return t.navSchemes;
      case 'grievance': return t.navGrievance;
      case 'documents': return t.navDocuments;
      case 'officer-dashboard': return t.navDashboard;
      case 'analytics': return t.navAnalytics;
      case 'admin': return t.navAdmin;
      default: return tab;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gov-bg text-gov-text font-sans">
      {/* Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        language={language}
        setLanguage={setLanguage}
        role={role}
        setRole={setRole}
      />

      {/* Breadcrumb Bar (Visible on all inner pages) */}
      {activeTab !== 'home' && (
        <div className="bg-white border-b border-gov-border/60 py-2 px-4 shadow-xs">
          <div className="max-w-7xl mx-auto flex items-center gap-1.5 text-xs text-gov-muted">
            <button
              onClick={() => handleNavigate(role === 'citizen' ? 'home' : 'officer-dashboard')}
              className="hover:text-gov-navy flex items-center gap-1 font-medium transition"
            >
              <HomeIcon className="w-3.5 h-3.5" />
              <span>{role === 'citizen' ? t.navHome : 'Officer Console'}</span>
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-bold text-gov-navy">
              {getBreadcrumbTitle(activeTab)}
            </span>
          </div>
        </div>
      )}

      {/* Main Page Content */}
      <main className="flex-1">
        {activeTab === 'home' && (
          <HomePage language={language} onNavigate={handleNavigate} />
        )}

        {activeTab === 'assistant' && (
          <AssistantPage language={language} initialQuery={assistantInitialQuery} />
        )}

        {activeTab === 'schemes' && (
          <SchemeFinderPage language={language} initialFilter={schemeInitialFilter} />
        )}

        {activeTab === 'grievance' && (
          <GrievancePage language={language} />
        )}

        {activeTab === 'documents' && (
          <DocumentAssistantPage language={language} />
        )}

        {activeTab === 'officer-dashboard' && (
          <OfficerDashboardPage language={language} />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsPage language={language} />
        )}

        {activeTab === 'admin' && (
          <AdminKnowledgePage language={language} />
        )}
      </main>

      {/* Footer */}
      <Footer language={language} onNavigate={handleNavigate} />
    </div>
  );
};

export default App;
