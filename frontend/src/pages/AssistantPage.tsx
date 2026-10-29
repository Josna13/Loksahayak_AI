import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, 
  Send, 
  Mic, 
  MicOff, 
  Copy, 
  Check, 
  RotateCcw, 
  ExternalLink, 
  FileCheck, 
  Sparkles, 
  ShieldCheck, 
  AlertCircle,
  HelpCircle,
  ChevronRight
} from 'lucide-react';
import { Language } from '../types';
import { translations } from '../translations';
import { api } from '../services/api';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  category?: string;
  checklist?: string[];
  source_title?: string;
  source_url?: string;
  next_step?: string;
  timestamp: string;
}

interface AssistantPageProps {
  language: Language;
  initialQuery?: string;
}

export const AssistantPage: React.FC<AssistantPageProps> = ({ language, initialQuery }) => {
  const t = translations[language];
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState(initialQuery || '');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize with greeting
  useEffect(() => {
    const greetingText = 
      language === 'mr'
        ? "नमस्कार! मी LOKORITHM चा शासकीय सेवा एआय सहाय्यक आहे. मी तुम्हाला महाराष्ट्र शासनाच्या योजना, उत्पन्नाचा किंवा रहिवासी दाखला मिळवण्याची पद्धत, आणि नागरी तक्रार नोंदणीसाठी मदत करू शकतो. मी तुम्हाला कशी मदत करू?"
        : language === 'hi'
        ? "नमस्ते! मैं LOKORITHM का एआई नागरिक सहायक हूँ। मैं आपको सरकारी योजनाओं, आवश्यक प्रमाण पत्रों और नागरिक शिकायतों के समाधान की जानकारी दे सकता हूँ। मैं आपकी क्या सहायता कर सकता हूँ?"
        : "Hello! I am LOKORITHM's AI Citizen Assistant. I can assist you with government welfare schemes (such as Majhi Ladki Bahin Yojana), certificate document checklists (Income, Domicile, Caste), and submitting public service complaints. How may I help you today?";

    setMessages([
      {
        id: 'msg-welcome',
        sender: 'assistant',
        text: greetingText,
        category: 'Citizen Services',
        source_title: 'Government of Maharashtra Services Directory',
        source_url: 'https://aaplesarkar.mahaonline.gov.in',
        next_step: 'Choose one of the suggested service questions below or type your inquiry.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);

    if (initialQuery) {
      handleSend(initialQuery);
    }
  }, [language]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || input;
    if (!textToSend.trim() || loading) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.chatAssistant(textToSend.trim(), language);
      const assistantMsg: Message = {
        id: `asst-${Date.now()}`,
        sender: 'assistant',
        text: res.answer,
        category: res.category,
        checklist: res.checklist,
        source_title: res.source_title,
        source_url: res.source_url,
        next_step: res.next_step,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (e) {
      const errorMsg: Message = {
        id: `asst-${Date.now()}`,
        sender: 'assistant',
        text: "Information requires departmental verification. Please check the official portal or visit your local Tahsildar office.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleResetChat = () => {
    setMessages([]);
    setCheckedItems({});
    const welcome = 
      language === 'mr'
        ? "संभाषण रीसेट केले आहे. मी तुम्हाला कशी मदत करू?"
        : language === 'hi'
        ? "बातचीत रीसेट कर दी गई है। मैं आपकी क्या सहायता करूँ?"
        : "Conversation refreshed. How may I assist you with government services today?";

    setMessages([
      {
        id: `msg-${Date.now()}`,
        sender: 'assistant',
        text: welcome,
        category: 'Citizen Helpdesk',
        source_title: 'Aaple Sarkar / RTS Maharashtra',
        source_url: 'https://aaplesarkar.mahaonline.gov.in',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  const handleSimulatedMic = () => {
    if (!isRecording) {
      setIsRecording(true);
      setTimeout(() => {
        const sampleVoiceText = 
          language === 'mr'
            ? "उत्पन्नाचा दाखला काढण्यासाठी कोणती कागदपत्रे लागतात?"
            : language === 'hi'
            ? "आय प्रमाण पत्र के लिए आवश्यक दस्तावेज क्या हैं?"
            : "What documents are required for an Income Certificate?";
        setInput(sampleVoiceText);
        setIsRecording(false);
      }, 2200);
    } else {
      setIsRecording(false);
    }
  };

  const toggleCheck = (item: string) => {
    setCheckedItems(prev => ({ ...prev, [item]: !prev[item] }));
  };

  const samplePrompts = [
    { label: "Majhi Ladki Bahin Yojana Eligibility", query: "What are the eligibility conditions and benefits for Mukhyamantri Majhi Ladki Bahin Yojana?" },
    { label: "Income Certificate Process", query: "What documents are required for an Income Certificate in Maharashtra?" },
    { label: "Road Pothole Grievance", query: "How do I submit a road repair complaint in my ward?" },
    { label: "Check Grievance Status", query: "How can I check the status of my complaint with reference ID?" },
    { label: "PM MUDRA Loan for Women", query: "What collateral-free loans are available for women entrepreneurs under PM MUDRA?" }
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-gov-border rounded-xl p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gov-navy text-white flex items-center justify-center shadow">
            <Bot className="w-7 h-7 text-gov-orange" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-gov-navy">
                AI Citizen Assistant
              </h1>
              <span className="text-[10px] bg-gov-green-light text-gov-green border border-gov-green/30 font-bold px-2 py-0.5 rounded">
                Grounded Knowledge Base
              </span>
            </div>
            <p className="text-xs text-gov-muted mt-0.5">
              Verified public assistance for Maharashtra & Central government schemes, certificates, and civic grievances.
            </p>
          </div>
        </div>

        <button
          onClick={handleResetChat}
          className="flex items-center gap-1.5 text-xs text-gov-muted hover:text-gov-navy bg-gov-bg hover:bg-slate-200 border border-gov-border px-3 py-1.5 rounded-lg transition"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Start New Conversation</span>
        </button>
      </div>

      {/* Suggested Query Pills */}
      <div className="space-y-1.5">
        <span className="text-[11px] font-bold text-gov-muted uppercase tracking-wider">
          Suggested Citizen Inquiries:
        </span>
        <div className="flex flex-wrap gap-2">
          {samplePrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(p.query)}
              className="text-xs bg-white hover:bg-gov-orange-light hover:border-gov-orange/40 text-gov-navy border border-gov-border px-3 py-1.5 rounded-full font-medium transition shadow-sm flex items-center gap-1.5"
            >
              <Sparkles className="w-3 h-3 text-gov-orange" />
              <span>{p.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="bg-white border border-gov-border rounded-xl shadow-sm flex flex-col h-[580px] overflow-hidden">
        {/* Messages List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 bg-slate-50/50">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-gov-navy flex-shrink-0 flex items-center justify-center text-white mt-1 shadow-sm">
                  <Bot className="w-4 h-4 text-gov-orange" />
                </div>
              )}

              <div
                className={`max-w-2xl rounded-xl p-4 shadow-sm border ${
                  msg.sender === 'user'
                    ? 'bg-gov-navy text-white border-gov-navy'
                    : 'bg-white text-gov-text border-gov-border'
                }`}
              >
                {/* Assistant Category Tag */}
                {msg.sender === 'assistant' && msg.category && (
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-gov-border/60">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-gov-bg text-gov-navy px-2 py-0.5 rounded border border-gov-border">
                      {msg.category}
                    </span>
                    <button
                      onClick={() => handleCopy(msg.id, msg.text)}
                      className="text-gov-muted hover:text-gov-navy text-xs flex items-center gap-1 transition"
                      title="Copy Answer"
                    >
                      {copiedId === msg.id ? (
                        <>
                          <Check className="w-3 h-3 text-gov-green" />
                          <span className="text-[10px] text-gov-green font-semibold">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span className="text-[10px]">Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* Message Body */}
                <div className="text-xs sm:text-sm whitespace-pre-line leading-relaxed">
                  {msg.text}
                </div>

                {/* Interactive Checklist for Assistant Messages */}
                {msg.checklist && msg.checklist.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-gov-border bg-gov-bg/60 rounded-lg p-3">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-gov-navy mb-2">
                      <FileCheck className="w-3.5 h-3.5 text-gov-green" />
                      <span>Required Document Checklist (Interactive):</span>
                    </div>
                    <div className="space-y-1.5">
                      {msg.checklist.map((doc, i) => (
                        <label
                          key={i}
                          className="flex items-start gap-2 text-xs text-gov-text cursor-pointer hover:text-gov-navy select-none"
                        >
                          <input
                            type="checkbox"
                            checked={Boolean(checkedItems[`${msg.id}-${doc}`])}
                            onChange={() => toggleCheck(`${msg.id}-${doc}`)}
                            className="mt-0.5 rounded text-gov-green focus:ring-gov-green border-gov-border"
                          />
                          <span className={checkedItems[`${msg.id}-${doc}`] ? 'line-through text-slate-400 font-medium' : 'font-medium'}>
                            {doc}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Source Verification & Next Steps */}
                {msg.sender === 'assistant' && (msg.source_title || msg.next_step) && (
                  <div className="mt-3 pt-2 text-[11px] text-gov-muted space-y-1 border-t border-slate-100">
                    {msg.source_title && (
                      <div className="flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-gov-green flex-shrink-0" />
                        <span>Source: <strong>{msg.source_title}</strong></span>
                        {msg.source_url && (
                          <a
                            href={msg.source_url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-gov-orange hover:underline inline-flex items-center gap-0.5 ml-1 font-semibold"
                          >
                            <span>Verify Portal</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        )}
                      </div>
                    )}

                    {msg.next_step && (
                      <div className="flex items-start gap-1 text-slate-600">
                        <ChevronRight className="w-3.5 h-3.5 text-gov-orange flex-shrink-0 mt-0.5" />
                        <span>Next Action: {msg.next_step}</span>
                      </div>
                    )}
                  </div>
                )}

                <div className={`text-[10px] mt-2 text-right ${msg.sender === 'user' ? 'text-slate-300' : 'text-slate-400'}`}>
                  {msg.timestamp}
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-3 justify-start items-center">
              <div className="w-8 h-8 rounded-full bg-gov-navy flex items-center justify-center text-white">
                <Bot className="w-4 h-4 text-gov-orange animate-spin" />
              </div>
              <div className="bg-white border border-gov-border rounded-xl px-4 py-3 shadow-sm flex items-center gap-2">
                <div className="flex gap-1">
                  <span className="w-2 h-2 rounded-full bg-gov-orange animate-bounce" />
                  <span className="w-2 h-2 rounded-full bg-gov-navy animate-bounce [animation-delay:0.2s]" />
                  <span className="w-2 h-2 rounded-full bg-gov-green animate-bounce [animation-delay:0.4s]" />
                </div>
                <span className="text-xs text-gov-muted font-medium">Retrieving verified government guidance...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3 sm:p-4 bg-white border-t border-gov-border">
          {isRecording && (
            <div className="mb-2 p-2 rounded bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-center justify-between">
              <span className="flex items-center gap-2 animate-pulse">
                <span className="w-2.5 h-2.5 rounded-full bg-gov-red" />
                Listening... (Simulating Marathi/Hindi/English speech recognition for demo)
              </span>
              <button
                type="button"
                onClick={() => setIsRecording(false)}
                className="text-[11px] font-bold text-gov-red hover:underline"
              >
                Stop
              </button>
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about schemes, documents, certificates, or complaints..."
              className="flex-1 text-xs sm:text-sm px-4 py-2.5 border border-gov-border rounded-lg focus:outline-none focus:ring-2 focus:ring-gov-navy/20 bg-gov-bg/40"
            />

            <button
              type="button"
              onClick={handleSimulatedMic}
              className={`p-2.5 rounded-lg border transition ${
                isRecording 
                  ? 'bg-gov-red text-white border-gov-red animate-pulse' 
                  : 'bg-gov-bg hover:bg-slate-200 text-gov-muted border-gov-border'
              }`}
              title="Voice Input (Demo Simulation)"
            >
              {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="bg-gov-navy hover:bg-gov-navy-light disabled:opacity-50 text-white px-4 py-2.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow"
            >
              <span>Send</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>

          <div className="flex items-center justify-between mt-2 text-[10px] text-gov-muted px-1">
            <span>Responsible AI: Grounded in public service records. Always cross-check with official department gazettes.</span>
            <span className="hidden sm:inline">Press Enter to send</span>
          </div>
        </div>
      </div>
    </div>
  );
};
