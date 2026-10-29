import React, { useState, useEffect } from 'react';
import { 
  AlertCircle, 
  Send, 
  Search, 
  UploadCloud, 
  CheckCircle2, 
  Clock, 
  FileCheck, 
  ShieldCheck, 
  Building, 
  MapPin, 
  AlertTriangle,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Eye,
  X
} from 'lucide-react';
import { Complaint, Language } from '../types';
import { translations } from '../translations';
import { api } from '../services/api';

const DISTRICTS = [
  "Pune",
  "Mumbai City",
  "Mumbai Suburban",
  "Thane",
  "Nagpur",
  "Nashik",
  "Chhatrapati Sambhajinagar",
  "Solapur",
  "Kolhapur",
  "Amravati",
  "Nanded",
  "Jalgaon",
  "Satara",
  "Ahmednagar"
];

const CATEGORIES = [
  "Roads & Transport",
  "Water Supply",
  "Sanitation & Waste",
  "Electricity & Lighting",
  "Women Safety & Welfare",
  "Education & Welfare Services",
  "Public Facilities",
  "Other"
];

interface GrievancePageProps {
  language: Language;
  initialTab?: 'submit' | 'track';
}

export const GrievancePage: React.FC<GrievancePageProps> = ({ language, initialTab = 'submit' }) => {
  const t = translations[language];
  const [activeSubTab, setActiveSubTab] = useState<'submit' | 'track'>(initialTab);

  // Submission Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Roads & Transport');
  const [district, setDistrict] = useState('Pune');
  const [locality, setLocality] = useState('');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  // Submission Result State
  const [submissionResult, setSubmissionResult] = useState<{
    ref_id: string;
    category: string;
    suggested_priority: 'High' | 'Medium' | 'Low';
    suggested_department: string;
    duplicate_warning: boolean;
    duplicate_details?: string | null;
  } | null>(null);

  // Tracking State
  const [trackRefId, setTrackRefId] = useState('LOKO-DEMO-1001');
  const [trackedComplaint, setTrackedComplaint] = useState<Complaint | null>(null);
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [trackError, setTrackError] = useState<string | null>(null);

  // Live AI Prediction side-panel
  const [aiSuggestions, setAiSuggestions] = useState<{
    priority: 'High' | 'Medium' | 'Low';
    category: string;
    department: string;
    duplicateCheck: boolean;
  }>({
    priority: 'Medium',
    category: 'Roads & Transport',
    department: 'Public Works Department (PWD) Maharashtra',
    duplicateCheck: false
  });

  // Calculate live AI analysis as citizen types
  useEffect(() => {
    const text = (title + ' ' + description).toLowerCase();
    let prio: 'High' | 'Medium' | 'Low' = 'Medium';
    if (text.includes('danger') || text.includes('hazard') || text.includes('burst') || text.includes('contaminat') || text.includes('accident') || text.includes('shock')) {
      prio = 'High';
    } else if (text.includes('delay') || text.includes('routine') || text.includes('info')) {
      prio = 'Low';
    }

    let cat = category;
    if (text.includes('water') || text.includes('pipe') || text.includes('drain')) cat = 'Water Supply';
    else if (text.includes('pothole') || text.includes('road') || text.includes('traffic')) cat = 'Roads & Transport';
    else if (text.includes('garbage') || text.includes('waste') || text.includes('trash')) cat = 'Sanitation & Waste';
    else if (text.includes('light') || text.includes('power') || text.includes('wire')) cat = 'Electricity & Lighting';
    else if (text.includes('women') || text.includes('girl') || text.includes('safety')) cat = 'Women Safety & Welfare';

    const deptMap: Record<string, string> = {
      "Water Supply": "Maharashtra Jeevan Pradhikaran (MJP)",
      "Roads & Transport": "Public Works Department (PWD) / Municipal Corp",
      "Sanitation & Waste": "Municipal Solid Waste Management Department",
      "Electricity & Lighting": "Maharashtra State Electricity Distribution Co. (MSEDCL)",
      "Women Safety & Welfare": "Women & Child Development Cell / Local Police",
      "Education & Welfare Services": "Department of Social Justice",
      "Public Facilities": "District Urban Development Agency (DUDA)",
      "Other": `District Collectorate — ${district}`
    };

    setAiSuggestions({
      priority: prio,
      category: cat,
      department: deptMap[cat] || `District Collectorate — ${district}`,
      duplicateCheck: locality.trim().length > 3
    });
  }, [title, description, category, district, locality]);

  // Load initial tracked complaint
  useEffect(() => {
    if (activeSubTab === 'track' && trackRefId) {
      handleTrackSubmit();
    }
  }, [activeSubTab]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("File size exceeds 5MB limit. Please upload a smaller image.");
      return;
    }

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      alert("Only JPEG, PNG, or WEBP image formats are supported.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const validateForm = () => {
    const errs: Record<string, string> = {};
    if (!title.trim() || title.trim().length < 5) {
      errs.title = "Please provide a concise title (at least 5 characters).";
    }
    if (!description.trim() || description.trim().length < 15) {
      errs.description = "Please describe the civic issue in detail (at least 15 characters).";
    }
    if (!locality.trim() || locality.trim().length < 3) {
      errs.locality = "Please specify ward, landmark, or locality.";
    }
    if (!consent) {
      errs.consent = "You must confirm consent for demonstration data processing.";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmitGrievance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const result = await api.createComplaint({
        title: title.trim(),
        description: description.trim(),
        category,
        district,
        locality: locality.trim(),
        photo_url: photoPreview,
        language,
        consent
      });

      setSubmissionResult({
        ref_id: result.ref_id,
        category: result.category,
        suggested_priority: result.suggested_priority,
        suggested_department: result.suggested_department,
        duplicate_warning: result.duplicate_warning,
        duplicate_details: result.duplicate_details
      });

      // Reset form
      setTitle('');
      setDescription('');
      setLocality('');
      setPhotoPreview(null);
      setConsent(false);
      setErrors({});
    } catch (e) {
      alert("Error submitting grievance in demonstration mode.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleTrackSubmit = async (customId?: string) => {
    const idToSearch = customId || trackRefId;
    if (!idToSearch.trim()) return;

    setTrackingLoading(true);
    setTrackError(null);
    try {
      const found = await api.getComplaintByRef(idToSearch.trim());
      if (found) {
        setTrackedComplaint(found);
      } else {
        setTrackedComplaint(null);
        setTrackError(`Complaint reference ID '${idToSearch}' was not found in demo records.`);
      }
    } catch (e) {
      setTrackError("Unable to retrieve complaint status.");
    } finally {
      setTrackingLoading(false);
    }
  };

  const getStatusStepIndex = (status: string) => {
    switch (status) {
      case 'Submitted': return 0;
      case 'Under Review': return 1;
      case 'Assigned': return 2;
      case 'In Progress': return 3;
      case 'Resolved': return 4;
      default: return 0;
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Top Banner */}
      <div className="bg-white border border-gov-border rounded-xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-gov-navy">
              Intelligent Grievance Management
            </h1>
            <span className="text-[10px] bg-gov-orange-light text-gov-orange-dark border border-gov-orange/30 font-bold px-2 py-0.5 rounded">
              AI Triage & SLA Tracking
            </span>
          </div>
          <p className="text-xs text-gov-muted mt-1 max-w-3xl">
            Register civic and municipal issues with automated urgency classification, duplicate detection, and departmental routing.
          </p>
        </div>

        {/* Sub-Tab Switcher */}
        <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-gov-border text-xs font-bold">
          <button
            onClick={() => {
              setActiveSubTab('submit');
              setSubmissionResult(null);
            }}
            className={`px-4 py-2 rounded-md transition ${
              activeSubTab === 'submit' ? 'bg-gov-navy text-white shadow-sm' : 'text-gov-muted hover:text-gov-navy'
            }`}
          >
            File Grievance
          </button>
          <button
            onClick={() => setActiveSubTab('track')}
            className={`px-4 py-2 rounded-md transition ${
              activeSubTab === 'track' ? 'bg-gov-navy text-white shadow-sm' : 'text-gov-muted hover:text-gov-navy'
            }`}
          >
            Track Status
          </button>
        </div>
      </div>

      {/* SUB-TAB 1: FILE GRIEVANCE */}
      {activeSubTab === 'submit' && (
        <>
          {submissionResult ? (
            /* Successful Submission Confirmation Card */
            <div className="bg-white border-2 border-gov-green/30 rounded-xl p-8 shadow-md text-center max-w-2xl mx-auto space-y-5 animate-in fade-in duration-200">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-gov-green flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div>
                <span className="text-xs font-bold text-gov-green uppercase tracking-wider">
                  Registration Successful
                </span>
                <h2 className="text-2xl font-black text-gov-navy mt-1">
                  Reference ID: {submissionResult.ref_id}
                </h2>
                <p className="text-xs text-gov-muted mt-1">
                  Keep this demonstration tracking ID to monitor resolution progress.
                </p>
              </div>

              {/* AI Triage Summary */}
              <div className="bg-slate-50 border border-gov-border rounded-xl p-4 text-left space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-gov-muted font-medium">Assigned Department:</span>
                  <span className="font-bold text-gov-navy">{submissionResult.suggested_department}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-gov-muted font-medium">AI Urgency Priority:</span>
                  <span className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                    submissionResult.suggested_priority === 'High' 
                      ? 'bg-red-100 text-gov-red' 
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {submissionResult.suggested_priority}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-gov-muted font-medium">Category:</span>
                  <span className="font-bold text-slate-700">{submissionResult.category}</span>
                </div>

                {submissionResult.duplicate_warning && (
                  <div className="p-2.5 bg-amber-50 rounded border border-amber-200 text-amber-900 mt-2 text-[11px] flex items-start gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <span><strong>Duplicate Notice:</strong> {submissionResult.duplicate_details}</span>
                  </div>
                )}
              </div>

              <div className="p-3 bg-slate-100 text-slate-600 rounded text-[11px]">
                <strong>Demonstration Notice:</strong> Demo complaint — not submitted to an actual government department.
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => {
                    setTrackRefId(submissionResult.ref_id);
                    setActiveSubTab('track');
                    handleTrackSubmit(submissionResult.ref_id);
                  }}
                  className="bg-gov-navy hover:bg-gov-navy-light text-white text-xs px-5 py-2.5 rounded-lg font-bold transition flex items-center gap-2 shadow"
                >
                  <span>Track This Complaint Now</span>
                  <ArrowRight className="w-4 h-4 text-gov-orange" />
                </button>

                <button
                  onClick={() => setSubmissionResult(null)}
                  className="text-xs text-gov-muted hover:text-gov-navy px-4 py-2 font-semibold"
                >
                  Submit Another
                </button>
              </div>
            </div>
          ) : (
            /* Filing Form */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Form (8 cols) */}
              <div className="lg:col-span-8 bg-white border border-gov-border rounded-xl p-6 shadow-sm">
                <h3 className="text-base font-bold text-gov-navy border-b border-gov-border pb-3 mb-5">
                  Citizen Public Grievance Form
                </h3>

                <form onSubmit={handleSubmitGrievance} className="space-y-4">
                  {/* Title */}
                  <div>
                    <label className="text-xs font-semibold text-gov-text block mb-1">
                      Grievance Title <span className="text-gov-red">*</span>
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Contaminated drinking water supply or Deep pothole hazard"
                      className={`w-full text-xs p-2.5 rounded-lg border ${
                        errors.title ? 'border-gov-red bg-red-50/30' : 'border-gov-border focus:ring-2 focus:ring-gov-navy/20'
                      }`}
                    />
                    {errors.title && <p className="text-[11px] text-gov-red mt-1">{errors.title}</p>}
                  </div>

                  {/* Category & District Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-gov-text block mb-1">
                        Category <span className="text-gov-red">*</span>
                      </label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full text-xs p-2.5 rounded-lg border border-gov-border bg-white focus:ring-2 focus:ring-gov-navy/20"
                      >
                        {CATEGORIES.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-gov-text block mb-1">
                        District (Maharashtra) <span className="text-gov-red">*</span>
                      </label>
                      <select
                        value={district}
                        onChange={(e) => setDistrict(e.target.value)}
                        className="w-full text-xs p-2.5 rounded-lg border border-gov-border bg-white focus:ring-2 focus:ring-gov-navy/20"
                      >
                        {DISTRICTS.map((d) => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Locality */}
                  <div>
                    <label className="text-xs font-semibold text-gov-text block mb-1">
                      Locality, Ward, or Landmark <span className="text-gov-red">*</span>
                    </label>
                    <input
                      type="text"
                      value={locality}
                      onChange={(e) => setLocality(e.target.value)}
                      placeholder="e.g. Near Ganpati Chowk, Naupada Ward, Thane West"
                      className={`w-full text-xs p-2.5 rounded-lg border ${
                        errors.locality ? 'border-gov-red bg-red-50/30' : 'border-gov-border focus:ring-2 focus:ring-gov-navy/20'
                      }`}
                    />
                    {errors.locality && <p className="text-[11px] text-gov-red mt-1">{errors.locality}</p>}
                  </div>

                  {/* Description */}
                  <div>
                    <label className="text-xs font-semibold text-gov-text block mb-1">
                      Detailed Incident Description <span className="text-gov-red">*</span>
                    </label>
                    <textarea
                      rows={4}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Please describe the issue, how long it has persisted, and how many households or commuters are affected..."
                      className={`w-full text-xs p-2.5 rounded-lg border ${
                        errors.description ? 'border-gov-red bg-red-50/30' : 'border-gov-border focus:ring-2 focus:ring-gov-navy/20'
                      }`}
                    />
                    {errors.description && <p className="text-[11px] text-gov-red mt-1">{errors.description}</p>}
                  </div>

                  {/* Photo Upload */}
                  <div>
                    <label className="text-xs font-semibold text-gov-text block mb-1">
                      Attach Site Photograph (Optional, Max 5MB)
                    </label>
                    <div className="border-2 border-dashed border-gov-border rounded-lg p-4 text-center hover:bg-slate-50 transition cursor-pointer relative">
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handlePhotoUpload}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                      {photoPreview ? (
                        <div className="flex items-center justify-center gap-3">
                          <img src={photoPreview} alt="Site" className="h-16 w-16 object-cover rounded border" />
                          <div className="text-left">
                            <span className="text-xs font-bold text-gov-green block">Photograph Attached</span>
                            <span className="text-[10px] text-gov-muted">Click or drag another to replace</span>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <UploadCloud className="w-6 h-6 text-gov-muted mx-auto" />
                          <p className="text-xs text-slate-700 font-medium">Click to select or drag photo here</p>
                          <p className="text-[10px] text-gov-muted">JPG, PNG up to 5MB</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Consent Checkbox */}
                  <div className="pt-2">
                    <label className="flex items-start gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={consent}
                        onChange={(e) => setConsent(e.target.checked)}
                        className="mt-0.5 rounded text-gov-navy focus:ring-gov-navy border-gov-border"
                      />
                      <span className="text-xs text-slate-600">
                        I confirm that this grievance is submitted for the <strong>Seva Innovation Challenge 2026</strong> prototype demonstration. No classified or unauthorized personal data has been submitted.
                      </span>
                    </label>
                    {errors.consent && <p className="text-[11px] text-gov-red mt-1">{errors.consent}</p>}
                  </div>

                  {/* Submit Button */}
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] text-gov-muted">
                      Validation is performed client-side & on server
                    </span>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="bg-gov-navy hover:bg-gov-navy-light text-white text-xs px-6 py-2.5 rounded-lg font-bold transition flex items-center gap-2 shadow"
                    >
                      {submitting ? "Processing AI Triage..." : "Submit Grievance"}
                      <Send className="w-3.5 h-3.5 text-gov-orange" />
                    </button>
                  </div>
                </form>
              </div>

              {/* AI Triage Preview Sidebar (4 cols) */}
              <div className="lg:col-span-4 space-y-4">
                <div className="bg-white border border-gov-border rounded-xl p-5 shadow-sm space-y-4 sticky top-24">
                  <div className="flex items-center gap-2 border-b border-gov-border pb-3">
                    <Sparkles className="w-4 h-4 text-gov-orange" />
                    <h3 className="text-xs font-bold text-gov-navy uppercase tracking-wider">
                      Live AI Triage Engine
                    </h3>
                  </div>

                  <p className="text-[11px] text-gov-muted leading-relaxed">
                    As you type, LOKORITHM analyzes urgency keywords, predicts municipal department responsibility, and checks for co-located duplicate issues.
                  </p>

                  <div className="space-y-3 text-xs">
                    <div className="p-3 bg-gov-bg rounded-lg border border-gov-border">
                      <span className="text-[10px] text-gov-muted font-bold block uppercase">
                        Predicted Priority:
                      </span>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2 py-0.5 rounded font-bold text-[11px] ${
                          aiSuggestions.priority === 'High' 
                            ? 'bg-red-100 text-gov-red' 
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {aiSuggestions.priority} Priority
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {aiSuggestions.priority === 'High' ? 'Safety/health impact keywords detected' : 'Standard 15-day resolution queue'}
                        </span>
                      </div>
                    </div>

                    <div className="p-3 bg-gov-bg rounded-lg border border-gov-border">
                      <span className="text-[10px] text-gov-muted font-bold block uppercase">
                        Suggested Department:
                      </span>
                      <p className="font-bold text-gov-navy mt-1">
                        {aiSuggestions.department}
                      </p>
                    </div>

                    {aiSuggestions.duplicateCheck && (
                      <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-emerald-800">
                        <span className="text-[10px] font-bold block uppercase">
                          Duplicate Detection:
                        </span>
                        <p className="text-[11px] mt-0.5">
                          Checking locality against active complaints in {district}...
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="p-2.5 bg-slate-100 rounded text-[10px] text-slate-600 leading-snug">
                    <strong>Responsible AI:</strong> Automated prioritization is advisory. Final department dispatch is reviewed by desk officers.
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* SUB-TAB 2: TRACK STATUS */}
      {activeSubTab === 'track' && (
        <div className="space-y-6">
          {/* Tracking Search Bar */}
          <div className="bg-white border border-gov-border rounded-xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-gov-navy">
              Track Public Grievance Status
            </h3>

            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-3 text-gov-muted" />
                <input
                  type="text"
                  value={trackRefId}
                  onChange={(e) => setTrackRefId(e.target.value)}
                  placeholder="Enter Reference ID e.g. LOKO-DEMO-1001"
                  className="w-full pl-9 pr-3 py-2 text-xs border border-gov-border rounded-lg focus:outline-none focus:ring-2 focus:ring-gov-navy/20 font-mono uppercase"
                />
              </div>

              <button
                onClick={() => handleTrackSubmit()}
                disabled={trackingLoading}
                className="bg-gov-navy hover:bg-gov-navy-light text-white text-xs px-5 py-2 rounded-lg font-bold transition shadow"
              >
                {trackingLoading ? "Searching..." : "Track Status"}
              </button>
            </div>

            {/* Quick Demo Sample IDs */}
            <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100">
              <span className="text-[11px] font-semibold text-gov-muted">Sample Demo IDs:</span>
              {['LOKO-DEMO-1001', 'LOKO-DEMO-1002', 'LOKO-DEMO-1003', 'LOKO-DEMO-1004', 'LOKO-DEMO-1005'].map((id) => (
                <button
                  key={id}
                  onClick={() => {
                    setTrackRefId(id);
                    handleTrackSubmit(id);
                  }}
                  className="text-[11px] bg-gov-bg hover:bg-slate-200 text-gov-navy font-mono px-2 py-0.5 rounded border border-gov-border transition"
                >
                  {id}
                </button>
              ))}
            </div>
          </div>

          {trackError && (
            <div className="p-4 bg-red-50 border border-gov-red/30 rounded-xl text-gov-red text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{trackError}</span>
            </div>
          )}

          {/* Tracked Complaint Details & Timeline */}
          {trackedComplaint && (
            <div className="bg-white border border-gov-border rounded-xl p-6 shadow-sm space-y-8">
              {/* Complaint Header */}
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-gov-border pb-5">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold bg-gov-navy text-white px-2 py-0.5 rounded">
                      {trackedComplaint.ref_id}
                    </span>
                    <span className="text-xs font-bold bg-gov-bg text-gov-navy border border-gov-border px-2 py-0.5 rounded">
                      {trackedComplaint.category}
                    </span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                      trackedComplaint.current_priority === 'High' 
                        ? 'bg-red-100 text-gov-red' 
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {trackedComplaint.current_priority} Priority
                    </span>
                  </div>

                  <h2 className="text-lg font-black text-gov-navy mt-2">
                    {trackedComplaint.title}
                  </h2>
                  <p className="text-xs text-gov-muted flex items-center gap-1.5 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-gov-orange" />
                    <span>{trackedComplaint.locality}, {trackedComplaint.district}</span>
                    <span>• Submitted {new Date(trackedComplaint.created_at).toLocaleDateString()}</span>
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-gov-muted block font-semibold">CURRENT STATUS</span>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase mt-1 ${
                    trackedComplaint.status === 'Resolved' 
                      ? 'bg-emerald-100 text-gov-green border border-emerald-300' 
                      : 'bg-blue-100 text-blue-800 border border-blue-200'
                  }`}>
                    {trackedComplaint.status}
                  </span>
                </div>
              </div>

              {/* Visual Multi-step Progression Tracker */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-gov-navy uppercase tracking-wider">
                  SLA Redressal Progression
                </h4>

                <div className="grid grid-cols-5 gap-2 pt-3">
                  {['Submitted', 'Under Review', 'Assigned', 'In Progress', 'Resolved'].map((step, idx) => {
                    const activeIdx = getStatusStepIndex(trackedComplaint.status);
                    const isPassed = idx <= activeIdx;
                    const isCurrent = idx === activeIdx;

                    return (
                      <div key={step} className="text-center space-y-1">
                        <div className={`h-2 rounded-full transition ${
                          isPassed ? (step === 'Resolved' ? 'bg-gov-green' : 'bg-gov-navy') : 'bg-slate-200'
                        }`} />
                        <span className={`text-[10px] block font-bold ${
                          isCurrent ? 'text-gov-navy underline' : isPassed ? 'text-slate-700' : 'text-slate-400'
                        }`}>
                          {step}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Department & Description Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gov-bg/60 p-4 rounded-xl border border-gov-border text-xs">
                <div>
                  <span className="font-bold text-gov-navy block mb-1">Assigned Department</span>
                  <p className="text-slate-700">{trackedComplaint.assigned_department}</p>
                  
                  {trackedComplaint.internal_notes && (
                    <div className="mt-3 pt-3 border-t border-slate-200">
                      <span className="font-bold text-gov-navy block mb-1">Administrative Remarks</span>
                      <p className="text-slate-600 bg-white p-2 rounded border border-slate-200 italic font-mono text-[11px]">
                        {trackedComplaint.internal_notes}
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <span className="font-bold text-gov-navy block mb-1">Citizen's Description</span>
                  <p className="text-slate-700 leading-relaxed bg-white p-2.5 rounded border border-slate-200">
                    {trackedComplaint.description}
                  </p>
                </div>
              </div>

              {/* Audit Timeline */}
              {trackedComplaint.timeline && trackedComplaint.timeline.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-gov-navy uppercase tracking-wider">
                    Official Activity Trail & Status Updates
                  </h4>

                  <div className="space-y-3 border-l-2 border-gov-navy/20 pl-4 ml-2">
                    {trackedComplaint.timeline.map((item, idx) => (
                      <div key={idx} className="relative text-xs space-y-0.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-gov-navy absolute -left-[21px] top-1 border-2 border-white" />
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-gov-navy">{item.action}</span>
                          <span className="text-[10px] text-gov-muted">{new Date(item.created_at).toLocaleString()}</span>
                        </div>
                        <p className="text-slate-600">{item.details}</p>
                        <span className="text-[10px] text-gov-muted block">Logged by: {item.performed_by}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
