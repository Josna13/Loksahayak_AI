import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Search, 
  Filter, 
  RotateCcw, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Building, 
  FileEdit, 
  Eye, 
  X,
  AlertTriangle,
  ChevronDown,
  Layers,
  Send,
  Save
} from 'lucide-react';
import { Complaint, Language, AnalyticsKPIs } from '../types';
import { translations } from '../translations';
import { api } from '../services/api';

const DISTRICTS = [
  "All",
  "Pune",
  "Mumbai City",
  "Mumbai Suburban",
  "Thane",
  "Nagpur",
  "Nashik",
  "Chhatrapati Sambhajinagar"
];

const CATEGORIES = [
  "All",
  "Roads & Transport",
  "Water Supply",
  "Sanitation & Waste",
  "Electricity & Lighting",
  "Women Safety & Welfare",
  "Education & Welfare Services",
  "Public Facilities"
];

const STATUSES = [
  "All",
  "Submitted",
  "Under Review",
  "Assigned",
  "In Progress",
  "Resolved"
];

const DEPARTMENTS = [
  "Maharashtra Jeevan Pradhikaran (MJP)",
  "Public Works Department (PWD) Maharashtra",
  "Municipal Solid Waste Management Department",
  "Maharashtra State Electricity Distribution Co. (MSEDCL)",
  "Women & Child Development Cell",
  "Department of Social Justice & Special Assistance",
  "Brihanmumbai Municipal Corporation (BMC)",
  "Thane Municipal Corporation (TMC)",
  "District Urban Development Agency (DUDA)"
];

interface OfficerDashboardPageProps {
  language: Language;
}

export const OfficerDashboardPage: React.FC<OfficerDashboardPageProps> = ({ language }) => {
  const t = translations[language];

  // Table State
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterPriority, setFilterPriority] = useState('All');
  const [filterDistrict, setFilterDistrict] = useState('All');

  // Selected Complaint for Case Drawer
  const [selectedCase, setSelectedCase] = useState<Complaint | null>(null);

  // Case Action Form in Modal
  const [editStatus, setEditStatus] = useState('Under Review');
  const [editDept, setEditDept] = useState('');
  const [editPriority, setEditPriority] = useState<'High' | 'Medium' | 'Low'>('Medium');
  const [newInternalNote, setNewInternalNote] = useState('');
  const [savingAction, setSavingAction] = useState(false);

  // KPIs
  const [kpis, setKpis] = useState<AnalyticsKPIs>({
    total_complaints: 0,
    pending_review: 0,
    in_progress: 0,
    resolved: 0,
    approaching_deadline: 0
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await api.getComplaints({
        search: search.trim() || undefined,
        category: filterCategory !== 'All' ? filterCategory : undefined,
        status: filterStatus !== 'All' ? filterStatus : undefined,
        priority: filterPriority !== 'All' ? filterPriority : undefined,
        district: filterDistrict !== 'All' ? filterDistrict : undefined
      });
      setComplaints(res.complaints);

      // KPI calculation
      const all = res.complaints;
      setKpis({
        total_complaints: all.length,
        pending_review: all.filter(c => c.status === 'Submitted' || c.status === 'Under Review').length,
        in_progress: all.filter(c => c.status === 'In Progress' || c.status === 'Assigned').length,
        resolved: all.filter(c => c.status === 'Resolved').length,
        approaching_deadline: all.filter(c => c.current_priority === 'High' && c.status !== 'Resolved').length
      });
    } catch (e) {
      console.error("Error loading complaints:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [filterCategory, filterStatus, filterPriority, filterDistrict]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  const openCaseDetails = (c: Complaint) => {
    setSelectedCase(c);
    setEditStatus(c.status);
    setEditDept(c.assigned_department);
    setEditPriority(c.current_priority);
    setNewInternalNote('');
  };

  const handleSaveOfficerAction = async () => {
    if (!selectedCase) return;
    setSavingAction(true);
    try {
      await api.updateComplaint(selectedCase.ref_id, {
        status: editStatus,
        assigned_department: editDept,
        current_priority: editPriority,
        internal_notes: newInternalNote.trim() || undefined,
        officer_name: "Desk Officer (P. Deshmukh)"
      });

      alert(`Case ${selectedCase.ref_id} updated successfully.`);
      setSelectedCase(null);
      await loadData();
    } catch (e) {
      alert("Failed to save changes.");
    } finally {
      setSavingAction(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Officer Header */}
      <div className="bg-white border border-gov-border rounded-xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gov-navy text-white flex items-center justify-center shadow">
            <ShieldCheck className="w-7 h-7 text-gov-green" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-gov-navy">
                Government Officer Dashboard
              </h1>
              <span className="text-[10px] bg-slate-800 text-white font-mono px-2 py-0.5 rounded font-bold">
                Desk Mode • Case Management
              </span>
            </div>
            <p className="text-xs text-gov-muted mt-0.5">
              Review public grievances, manage SLA resolution timelines, reassign divisional tasks, and maintain audit integrity.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="bg-amber-50 text-amber-900 border border-amber-200 px-3 py-1 rounded font-medium">
            Authorized Officer Demonstration Access
          </span>
          <button
            onClick={() => loadData()}
            className="p-1.5 rounded-lg border border-gov-border hover:bg-slate-100 text-gov-muted hover:text-gov-navy"
            title="Refresh Table"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="bg-white border border-gov-border rounded-xl p-4 shadow-sm">
          <span className="text-[11px] font-bold text-gov-muted uppercase block">Total Complaints</span>
          <div className="text-2xl font-black text-gov-navy mt-1">{kpis.total_complaints}</div>
          <span className="text-[10px] text-slate-500">Logged in demonstration database</span>
        </div>

        <div className="bg-white border border-gov-border rounded-xl p-4 shadow-sm">
          <span className="text-[11px] font-bold text-amber-700 uppercase block">Pending Scrutiny</span>
          <div className="text-2xl font-black text-amber-600 mt-1">{kpis.pending_review}</div>
          <span className="text-[10px] text-slate-500">Requires desk triage</span>
        </div>

        <div className="bg-white border border-gov-border rounded-xl p-4 shadow-sm">
          <span className="text-[11px] font-bold text-blue-700 uppercase block">In Progress</span>
          <div className="text-2xl font-black text-blue-600 mt-1">{kpis.in_progress}</div>
          <span className="text-[10px] text-slate-500">Field works dispatched</span>
        </div>

        <div className="bg-white border border-gov-border rounded-xl p-4 shadow-sm">
          <span className="text-[11px] font-bold text-gov-green uppercase block">Resolved Cases</span>
          <div className="text-2xl font-black text-gov-green mt-1">{kpis.resolved}</div>
          <span className="text-[10px] text-slate-500">Action report uploaded</span>
        </div>

        <div className="bg-white border border-red-200 bg-red-50/20 rounded-xl p-4 shadow-sm col-span-2 sm:col-span-1">
          <span className="text-[11px] font-bold text-gov-red uppercase block">Urgent SLA Watch</span>
          <div className="text-2xl font-black text-gov-red mt-1">{kpis.approaching_deadline}</div>
          <span className="text-[10px] text-red-600 font-medium">High priority &gt; 3 days</span>
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="bg-white border border-gov-border rounded-xl p-4 shadow-sm space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-3 text-gov-muted" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Ref ID, title, locality, or keyword..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-gov-border rounded-lg focus:outline-none focus:ring-2 focus:ring-gov-navy/20"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="text-xs p-2 rounded-lg border border-gov-border bg-white"
            >
              <option value="All">All Categories</option>
              {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="text-xs p-2 rounded-lg border border-gov-border bg-white"
            >
              <option value="All">All Statuses</option>
              {STATUSES.filter(s => s !== 'All').map(s => <option key={s} value={s}>{s}</option>)}
            </select>

            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="text-xs p-2 rounded-lg border border-gov-border bg-white"
            >
              <option value="All">All Priorities</option>
              <option value="High">High Priority</option>
              <option value="Medium">Medium Priority</option>
              <option value="Low">Low Priority</option>
            </select>

            <select
              value={filterDistrict}
              onChange={(e) => setFilterDistrict(e.target.value)}
              className="text-xs p-2 rounded-lg border border-gov-border bg-white"
            >
              <option value="All">All Districts</option>
              {DISTRICTS.filter(d => d !== 'All').map(d => <option key={d} value={d}>{d}</option>)}
            </select>

            <button
              type="submit"
              className="bg-gov-navy text-white text-xs px-4 py-2 rounded-lg font-bold hover:bg-gov-navy-light transition"
            >
              Filter
            </button>
          </div>
        </form>
      </div>

      {/* Case Management Table */}
      <div className="bg-white border border-gov-border rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100/80 border-b border-gov-border text-gov-navy uppercase text-[10px] font-bold tracking-wider">
              <tr>
                <th className="py-3 px-4">Ref ID</th>
                <th className="py-3 px-4">Complaint Title</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">District</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Assigned Dept</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gov-border/60">
              {loading && (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-gov-muted">
                    Loading grievance records...
                  </td>
                </tr>
              )}

              {!loading && complaints.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-gov-muted">
                    No complaints matching the active filter criteria.
                  </td>
                </tr>
              )}

              {!loading && complaints.map((c) => (
                <tr key={c.ref_id} className="hover:bg-slate-50 transition">
                  <td className="py-3 px-4 font-mono font-bold text-gov-navy">
                    {c.ref_id}
                  </td>
                  <td className="py-3 px-4 max-w-xs">
                    <div className="font-semibold text-slate-800 truncate" title={c.title}>
                      {c.title}
                    </div>
                    <div className="text-[10px] text-gov-muted truncate">
                      {c.locality}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-slate-700 whitespace-nowrap">
                    {c.category}
                  </td>
                  <td className="py-3 px-4 text-slate-700 whitespace-nowrap">
                    {c.district}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      c.current_priority === 'High' 
                        ? 'bg-red-100 text-gov-red' 
                        : c.current_priority === 'Medium'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}>
                      {c.current_priority}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-600 max-w-[180px] truncate" title={c.assigned_department}>
                    {c.assigned_department}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      c.status === 'Resolved' 
                        ? 'bg-emerald-100 text-gov-green' 
                        : c.status === 'In Progress'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-slate-100 text-slate-800'
                    }`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <button
                      onClick={() => openCaseDetails(c)}
                      className="bg-gov-bg hover:bg-slate-200 text-gov-navy px-2.5 py-1 rounded font-bold transition border border-gov-border inline-flex items-center gap-1"
                    >
                      <Eye className="w-3 h-3 text-gov-orange" />
                      <span>Review</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Case Details & Action Drawer / Modal */}
      {selectedCase && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[92vh] overflow-y-auto border border-gov-border p-6 space-y-6 animate-in fade-in duration-150">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-gov-border pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold bg-gov-navy text-white px-2 py-0.5 rounded">
                    {selectedCase.ref_id}
                  </span>
                  <span className="text-xs font-bold bg-gov-bg text-gov-navy px-2 py-0.5 rounded border border-gov-border">
                    {selectedCase.category}
                  </span>
                </div>
                <h2 className="text-lg font-black text-gov-navy mt-1.5">
                  {selectedCase.title}
                </h2>
                <p className="text-xs text-gov-muted">
                  Location: {selectedCase.locality}, {selectedCase.district}
                </p>
              </div>

              <button
                onClick={() => setSelectedCase(null)}
                className="p-1 rounded hover:bg-slate-100 text-gov-muted hover:text-gov-navy"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Description & AI Metadata */}
            <div className="space-y-3 text-xs">
              <div className="bg-gov-bg p-3 rounded-lg border border-gov-border">
                <span className="font-bold text-gov-navy block mb-1">Citizen Statement:</span>
                <p className="text-slate-700 leading-relaxed">{selectedCase.description}</p>
              </div>

              {selectedCase.duplicate_warning ? (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">Possible Co-Located Duplicate Alert:</span>
                    <span>{selectedCase.duplicate_details}</span>
                  </div>
                </div>
              ) : null}

              {selectedCase.internal_notes && (
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <span className="font-bold text-gov-navy block mb-1">Previous Case Log Remarks:</span>
                  <pre className="text-[11px] text-slate-700 whitespace-pre-wrap font-sans">
                    {selectedCase.internal_notes}
                  </pre>
                </div>
              )}
            </div>

            {/* Officer Action Form */}
            <div className="bg-slate-50 border border-gov-border rounded-xl p-4 space-y-4">
              <h4 className="text-xs font-bold text-gov-navy uppercase tracking-wider flex items-center gap-1.5">
                <FileEdit className="w-4 h-4 text-gov-orange" />
                Administrative Case Action (Demo Officer Mode)
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Status Update */}
                <div>
                  <label className="text-xs font-semibold text-gov-text block mb-1">Update Status</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="w-full text-xs p-2 rounded-lg border border-gov-border bg-white"
                  >
                    <option value="Submitted">Submitted</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Assigned">Assigned</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                  </select>
                </div>

                {/* Priority Override */}
                <div>
                  <label className="text-xs font-semibold text-gov-text block mb-1">Priority Level</label>
                  <select
                    value={editPriority}
                    onChange={(e) => setEditPriority(e.target.value as any)}
                    className="w-full text-xs p-2 rounded-lg border border-gov-border bg-white"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>

                {/* Department Reassignment */}
                <div>
                  <label className="text-xs font-semibold text-gov-text block mb-1">Assign Department</label>
                  <select
                    value={editDept}
                    onChange={(e) => setEditDept(e.target.value)}
                    className="w-full text-xs p-2 rounded-lg border border-gov-border bg-white"
                  >
                    {DEPARTMENTS.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Internal Notes */}
              <div>
                <label className="text-xs font-semibold text-gov-text block mb-1">
                  Add Officer Internal Note / Field Inspection Remark
                </label>
                <textarea
                  rows={2}
                  value={newInternalNote}
                  onChange={(e) => setNewInternalNote(e.target.value)}
                  placeholder="e.g. Dispatched Junior Engineer S. Patil for on-site pipeline inspection. Est. completion 48 hrs."
                  className="w-full text-xs p-2.5 rounded-lg border border-gov-border bg-white focus:ring-2 focus:ring-gov-navy/20"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedCase(null)}
                  className="px-4 py-2 border border-gov-border text-xs rounded-lg font-semibold hover:bg-slate-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={savingAction}
                  onClick={handleSaveOfficerAction}
                  className="bg-gov-navy hover:bg-gov-navy-light text-white text-xs px-5 py-2 rounded-lg font-bold transition flex items-center gap-1.5 shadow"
                >
                  <Save className="w-3.5 h-3.5 text-gov-orange" />
                  <span>{savingAction ? "Saving Update..." : "Confirm Case Action"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
