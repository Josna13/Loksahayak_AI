import React, { useState, useEffect } from 'react';
import { 
  Layers, 
  Search, 
  Plus, 
  CheckCircle2, 
  Clock, 
  FileText, 
  ExternalLink, 
  RotateCcw, 
  Edit, 
  ShieldCheck, 
  X,
  Sparkles,
  Save
} from 'lucide-react';
import { ServiceKB, Scheme, Language } from '../types';
import { translations } from '../translations';

interface AdminKnowledgePageProps {
  language: Language;
}

const DEFAULT_ADMIN_SERVICES: ServiceKB[] = [
  {
    id: 1,
    title: "Income Certificate (Tahsil / Sub-Divisional Office)",
    category: "Revenue Services",
    description: "Issued by Revenue Department certifying annual earnings for scholarships and state welfare schemes.",
    required_docs: ["Ration Card", "Salary Slip / Talathi Report", "Self-Declaration Form", "Aadhaar Card", "Electricity Bill"],
    process_steps: ["1. Register on Aaple Sarkar", "2. Upload scanned PDF documents", "3. Pay nominal fee", "4. Talathi verification within 7 days", "5. Digital certificate issued with QR"],
    sla_days: 15,
    official_portal: "https://aaplesarkar.mahaonline.gov.in",
    source_title: "Maharashtra Right to Public Services Act (RTS)",
    last_verified: "2026-09-15",
    status: "Published"
  },
  {
    id: 2,
    title: "Domicile & 15-Year Residence Certificate",
    category: "General Administration",
    description: "Official legal document proving 15+ years continuous residency in Maharashtra state, mandatory for state university quotas.",
    required_docs: ["Proof of 15 years residency", "Birth Certificate or School Leaving Certificate", "Aadhaar Card", "Electricity Bill"],
    process_steps: ["1. Apply via Aaple Sarkar or District Setu Kendra", "2. Submit residency evidence", "3. Police or Talathi report", "4. Magistrate approval", "5. Download signed certificate"],
    sla_days: 15,
    official_portal: "https://aaplesarkar.mahaonline.gov.in",
    source_title: "Maharashtra General Administration Department (GAD)",
    last_verified: "2026-10-01",
    status: "Published"
  },
  {
    id: 3,
    title: "Aaple Sarkar Public Grievance Redressal Mechanism",
    category: "Citizen Grievances",
    description: "Online dispute and public grievance redressal portal where citizens can submit complaints against any department.",
    required_docs: ["Details of location and incident", "Supporting photographs (optional)", "Citizen contact info"],
    process_steps: ["1. File grievance with department categorization", "2. Ticket generated", "3. Forwarded to Nodal Grievance Officer within 48 hours", "4. First response within 21 days"],
    sla_days: 21,
    official_portal: "https://grievances.maharashtra.gov.in",
    source_title: "Directorate of Public Grievances, Government of Maharashtra",
    last_verified: "2026-08-20",
    status: "Published"
  },
  {
    id: 4,
    title: "Caste Certificate & Validity Scrutiny Process",
    category: "Social Welfare",
    description: "Official certification of recognized SC, ST, VJNT, or OBC status for educational admissions and welfare schemes.",
    required_docs: ["Pre-1967 genealogy records", "School LC of Father/Grandfather", "Affidavit on Stamp Paper"],
    process_steps: ["1. Apply at SDO office", "2. Scrutiny by District Caste Committee", "3. Vigilance verification", "4. Hearing before Committee", "5. Grant of Validity"],
    sla_days: 45,
    official_portal: "https://barti.maharashtra.gov.in",
    source_title: "Dr. Babasaheb Ambedkar Research & Training Institute (BARTI)",
    last_verified: "2026-07-10",
    status: "Published"
  }
];

export const AdminKnowledgePage: React.FC<AdminKnowledgePageProps> = ({ language }) => {
  const t = translations[language];

  const [services, setServices] = useState<ServiceKB[]>(DEFAULT_ADMIN_SERVICES);
  const [search, setSearch] = useState('');
  const [selectedService, setSelectedService] = useState<ServiceKB | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Service Form
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Revenue Services');
  const [newDescription, setNewDescription] = useState('');
  const [newSLA, setNewSLA] = useState(15);
  const [newPortal, setNewPortal] = useState('https://aaplesarkar.mahaonline.gov.in');
  const [newSource, setNewSource] = useState('Maharashtra RTS Act');
  const [newDocs, setNewDocs] = useState('Aadhaar Card, Proof of Residence, Income Verification');

  const filtered = services.filter(s => 
    s.title.toLowerCase().includes(search.toLowerCase()) || 
    s.category.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newRecord: ServiceKB = {
      id: Date.now(),
      title: newTitle.trim(),
      category: newCategory,
      description: newDescription.trim(),
      required_docs: newDocs.split(',').map(d => d.trim()),
      process_steps: ["1. Online submission via Aaple Sarkar", "2. Taluka officer scrutiny"],
      sla_days: Number(newSLA),
      official_portal: newPortal,
      source_title: newSource,
      last_verified: new Date().toISOString().split('T')[0],
      status: "Published"
    };

    setServices([newRecord, ...services]);
    setIsAddModalOpen(false);
    // Reset
    setNewTitle('');
    setNewDescription('');
  };

  const toggleStatus = (id: number) => {
    setServices(services.map(s => {
      if (s.id === id) {
        const nextStatus = s.status === 'Published' ? 'Needs Review' : 'Published';
        return { ...s, status: nextStatus };
      }
      return s;
    }));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Top Banner */}
      <div className="bg-white border border-gov-border rounded-xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-gov-navy">
              Scheme & Service Administration
            </h1>
            <span className="text-[10px] bg-purple-100 text-purple-800 font-bold px-2 py-0.5 rounded border border-purple-200">
              Knowledge Base Management
            </span>
          </div>
          <p className="text-xs text-gov-muted mt-1 max-w-3xl">
            Maintain verified public-service guidelines, document checklists, and statutory SLA benchmarks used by the AI Citizen Assistant and Scheme Finder.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-gov-navy hover:bg-gov-navy-light text-white text-xs px-4 py-2.5 rounded-lg font-bold transition flex items-center gap-1.5 shadow"
        >
          <Plus className="w-4 h-4 text-gov-orange" />
          <span>Add Reference Service</span>
        </button>
      </div>

      {/* RAG Engine Sync Status */}
      <div className="bg-white border border-gov-border rounded-xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-gov-green animate-pulse" />
          <div>
            <span className="font-bold text-gov-navy">RAG Vector Index: </span>
            <span className="text-gov-green font-semibold">Synchronized & Active</span>
          </div>
        </div>

        <div className="flex items-center gap-4 text-slate-500 text-[11px]">
          <span>Published Services: <strong>{services.filter(s => s.status === 'Published').length}</strong></span>
          <span>Under Review: <strong>{services.filter(s => s.status !== 'Published').length}</strong></span>
          <span>Indexed Sources: <strong>Aaple Sarkar, WCD, MahaDBT</strong></span>
        </div>
      </div>

      {/* Search and Table */}
      <div className="bg-white border border-gov-border rounded-xl shadow-sm overflow-hidden space-y-4 p-5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-gov-navy">
            Configured Service & Scheme Reference Catalog
          </h3>

          <div className="relative w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-gov-muted" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search catalog..."
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-gov-border rounded-lg focus:outline-none focus:ring-2 focus:ring-gov-navy/20"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100/80 border-b border-gov-border text-gov-navy uppercase text-[10px] font-bold tracking-wider">
              <tr>
                <th className="py-3 px-4">Service Title</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">SLA (Days)</th>
                <th className="py-3 px-4">Official Source</th>
                <th className="py-3 px-4">Last Verified</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gov-border/60">
              {filtered.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50 transition">
                  <td className="py-3 px-4 font-semibold text-slate-800 max-w-xs">
                    {s.title}
                  </td>
                  <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                    {s.category}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className="font-mono font-bold bg-gov-bg px-2 py-0.5 rounded text-gov-navy">
                      {s.sla_days} Days
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-600 max-w-[200px] truncate" title={s.source_title}>
                    {s.source_title}
                  </td>
                  <td className="py-3 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                    {s.last_verified}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <button
                      onClick={() => toggleStatus(s.id)}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase transition ${
                        s.status === 'Published' 
                          ? 'bg-emerald-100 text-gov-green hover:bg-emerald-200' 
                          : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                      }`}
                      title="Click to toggle status"
                    >
                      {s.status}
                    </button>
                  </td>
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <button
                      onClick={() => setSelectedService(s)}
                      className="text-xs bg-gov-bg hover:bg-slate-200 text-gov-navy px-2.5 py-1 rounded font-bold transition border border-gov-border inline-flex items-center gap-1"
                    >
                      <span>Inspect</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inspect Modal */}
      {selectedService && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gov-border p-6 space-y-5 animate-in fade-in duration-150">
            <div className="flex items-start justify-between border-b border-gov-border pb-4">
              <div>
                <span className="text-[10px] font-bold bg-gov-navy text-white px-2 py-0.5 rounded">
                  {selectedService.category}
                </span>
                <h2 className="text-lg font-black text-gov-navy mt-1">
                  {selectedService.title}
                </h2>
                <p className="text-xs text-gov-muted">Last Verified: {selectedService.last_verified}</p>
              </div>
              <button
                onClick={() => setSelectedService(null)}
                className="p-1 rounded hover:bg-slate-100 text-gov-muted hover:text-gov-navy"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <span className="font-bold text-gov-navy block mb-1">Description:</span>
                <p className="text-slate-700 bg-gov-bg p-2.5 rounded border border-gov-border">
                  {selectedService.description}
                </p>
              </div>

              <div>
                <span className="font-bold text-gov-navy block mb-1">Required Documents:</span>
                <ul className="space-y-1">
                  {selectedService.required_docs.map((doc, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-slate-700 bg-slate-50 p-1.5 rounded">
                      <CheckCircle2 className="w-3.5 h-3.5 text-gov-green flex-shrink-0" />
                      <span>{doc}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <span className="font-bold text-gov-navy block mb-1">Procedural Workflow Steps:</span>
                <div className="space-y-1">
                  {selectedService.process_steps.map((step, idx) => (
                    <div key={idx} className="text-slate-700 bg-white p-2 rounded border border-slate-200">
                      {step}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-gov-border">
                <div>
                  <span className="font-bold text-gov-navy block">Official Reference Source:</span>
                  <span className="text-slate-600">{selectedService.source_title}</span>
                </div>
                {selectedService.official_portal && (
                  <a
                    href={selectedService.official_portal}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-bold text-gov-navy hover:text-gov-orange flex items-center gap-1 hover:underline"
                  >
                    <span>Visit Portal</span>
                    <ExternalLink className="w-3 h-3 text-gov-orange" />
                  </a>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-gov-border">
              <button
                onClick={() => setSelectedService(null)}
                className="text-xs px-4 py-2 border border-gov-border rounded-lg font-semibold hover:bg-slate-100 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Service Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto border border-gov-border p-6 space-y-5 animate-in fade-in duration-150">
            <div className="flex items-center justify-between border-b border-gov-border pb-3">
              <h3 className="text-base font-bold text-gov-navy">Add Service Guidance Record</h3>
              <button onClick={() => setIsAddModalOpen(false)}>
                <X className="w-5 h-5 text-gov-muted" />
              </button>
            </div>

            <form onSubmit={handleAddService} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold block mb-1">Service Title *</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Non-Creamy Layer Certificate"
                  className="w-full p-2 border border-gov-border rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full p-2 border border-gov-border rounded-lg bg-white"
                  >
                    <option value="Revenue Services">Revenue Services</option>
                    <option value="General Administration">General Administration</option>
                    <option value="Social Welfare">Social Welfare</option>
                    <option value="Women & Child">Women & Child</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold block mb-1">SLA Resolution Days</label>
                  <input
                    type="number"
                    value={newSLA}
                    onChange={(e) => setNewSLA(Number(e.target.value))}
                    className="w-full p-2 border border-gov-border rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold block mb-1">Service Description</label>
                <textarea
                  rows={2}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Brief description of the citizen certificate or welfare guidance..."
                  className="w-full p-2 border border-gov-border rounded-lg"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Required Documents (Comma Separated)</label>
                <input
                  type="text"
                  value={newDocs}
                  onChange={(e) => setNewDocs(e.target.value)}
                  className="w-full p-2 border border-gov-border rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Source Title</label>
                  <input
                    type="text"
                    value={newSource}
                    onChange={(e) => setNewSource(e.target.value)}
                    className="w-full p-2 border border-gov-border rounded-lg"
                  />
                </div>

                <div>
                  <label className="font-semibold block mb-1">Official Portal URL</label>
                  <input
                    type="text"
                    value={newPortal}
                    onChange={(e) => setNewPortal(e.target.value)}
                    className="w-full p-2 border border-gov-border rounded-lg"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gov-border">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border rounded-lg hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-gov-navy text-white px-5 py-2 rounded-lg font-bold hover:bg-gov-navy-light shadow"
                >
                  Save & Index Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
