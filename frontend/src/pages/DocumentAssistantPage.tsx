import React, { useState } from 'react';
import { 
  FileCheck, 
  UploadCloud, 
  CheckCircle2, 
  AlertTriangle, 
  AlertCircle, 
  ShieldCheck, 
  Sparkles, 
  FileText, 
  RotateCcw,
  Check,
  ChevronRight,
  Info
} from 'lucide-react';
import { DocumentVerificationResult, Language } from '../types';
import { translations } from '../translations';
import { api } from '../services/api';

const DOCUMENT_TYPES = [
  "Tahsil Income Certificate",
  "Maharashtra Domicile & Residence Certificate",
  "Caste / Category Certificate",
  "Ration Card (Yellow/Orange)",
  "Land Record 7/12 Extract"
];

interface DocumentAssistantPageProps {
  language: Language;
}

export const DocumentAssistantPage: React.FC<DocumentAssistantPageProps> = ({ language }) => {
  const t = translations[language];

  const [selectedDocType, setSelectedDocType] = useState(DOCUMENT_TYPES[0]);
  const [fileName, setFileName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DocumentVerificationResult | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("File size exceeds 5MB limit. Please provide a smaller document scan.");
      return;
    }

    setFileName(file.name);
    processVerification(file.name);
  };

  const handleSampleTest = (type: string, sampleName: string) => {
    setSelectedDocType(type);
    setFileName(sampleName);
    processVerification(sampleName, type);
  };

  const processVerification = async (name: string, customType?: string) => {
    setLoading(true);
    setResult(null);
    try {
      const docType = customType || selectedDocType;
      const res = await api.verifyDocument(docType, name);
      setResult(res);
    } catch (e) {
      alert("Error processing document verification.");
    } finally {
      setLoading(false);
    }
  };

  const resetVerification = () => {
    setFileName(null);
    setResult(null);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Title & Guidelines */}
      <div className="bg-white border border-gov-border rounded-xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-gov-navy">
                Document Assistance & Verification
              </h1>
              <span className="text-[10px] bg-gov-orange-light text-gov-orange-dark border border-gov-orange/30 font-bold px-2 py-0.5 rounded">
                Pre-Scrutiny AI
              </span>
            </div>
            <p className="text-xs text-gov-muted mt-1 max-w-3xl">
              Conduct automated preliminary checks on government certificates before official filing. Extract key metadata, verify mandatory seals, and inspect potential eligibility discrepancies.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] bg-amber-50 text-amber-900 border border-amber-200 px-3 py-1 rounded font-medium">
              Preliminary Evaluation Only
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Upload & Configuration (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-gov-border rounded-xl p-5 shadow-sm space-y-5">
            <h3 className="text-sm font-bold text-gov-navy border-b border-gov-border pb-3">
              Document Selection & Upload
            </h3>

            {/* Document Type Dropdown */}
            <div>
              <label className="text-xs font-semibold text-gov-text block mb-1">
                Select Certificate / Document Type
              </label>
              <select
                value={selectedDocType}
                onChange={(e) => setSelectedDocType(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-gov-border bg-white focus:ring-2 focus:ring-gov-navy/20"
              >
                {DOCUMENT_TYPES.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* Upload Area */}
            <div>
              <label className="text-xs font-semibold text-gov-text block mb-1">
                Upload Scanned File (PDF or Image)
              </label>
              <div className="border-2 border-dashed border-gov-border rounded-xl p-6 text-center hover:bg-slate-50 transition cursor-pointer relative">
                <input
                  type="file"
                  accept="application/pdf,image/jpeg,image/png"
                  onChange={handleFileUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <UploadCloud className="w-8 h-8 text-gov-muted mx-auto mb-2" />
                <p className="text-xs font-bold text-gov-navy">
                  {fileName ? fileName : "Click or drop file to analyze"}
                </p>
                <p className="text-[10px] text-gov-muted mt-1">
                  Supported: PDF, JPG, PNG (Max 5MB)
                </p>
              </div>
            </div>

            {/* Sample Documents for Easy Demonstration */}
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <span className="text-[11px] font-bold text-gov-muted uppercase tracking-wider block">
                Quick Demonstration Samples:
              </span>
              <div className="space-y-1.5">
                <button
                  type="button"
                  onClick={() => handleSampleTest("Tahsil Income Certificate", "Sample_Income_Cert_Haveli_Pune.pdf")}
                  className="w-full text-left text-xs bg-gov-bg hover:bg-slate-200 text-gov-navy p-2.5 rounded-lg border border-gov-border font-medium flex items-center justify-between transition"
                >
                  <span className="flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5 text-gov-orange" />
                    <span>Sample Income Certificate (Tahsildar Pune)</span>
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-gov-muted" />
                </button>

                <button
                  type="button"
                  onClick={() => handleSampleTest("Maharashtra Domicile & Residence Certificate", "Sample_Domicile_Cert_MH.pdf")}
                  className="w-full text-left text-xs bg-gov-bg hover:bg-slate-200 text-gov-navy p-2.5 rounded-lg border border-gov-border font-medium flex items-center justify-between transition"
                >
                  <span className="flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5 text-blue-600" />
                    <span>Sample Domicile Certificate (18 Yrs Residence)</span>
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-gov-muted" />
                </button>

                <button
                  type="button"
                  onClick={() => handleSampleTest("Caste / Category Certificate", "Sample_Caste_Certificate_BARTI.pdf")}
                  className="w-full text-left text-xs bg-gov-bg hover:bg-slate-200 text-gov-navy p-2.5 rounded-lg border border-gov-border font-medium flex items-center justify-between transition"
                >
                  <span className="flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5 text-purple-600" />
                    <span>Sample Caste Certificate (OBC Category)</span>
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-gov-muted" />
                </button>
              </div>
            </div>

            {/* Privacy Guarantee */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-[10px] text-slate-600 leading-relaxed flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-gov-green flex-shrink-0 mt-0.5" />
              <span>
                <strong>Privacy Protocol:</strong> Document pixels are analyzed in volatile memory for the preliminary extraction demo. No personal biometric or Aadhaar identities are retained.
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: OCR Extraction & Verification Results (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {loading && (
            <div className="bg-white border border-gov-border rounded-xl p-12 text-center shadow-sm space-y-3">
              <div className="w-9 h-9 border-4 border-gov-navy border-t-gov-orange rounded-full animate-spin mx-auto" />
              <h3 className="text-sm font-bold text-gov-navy">Extracting Document Data via OCR...</h3>
              <p className="text-xs text-gov-muted">
                Parsing certificate authority, digital signatures, QR markers, and eligibility fields...
              </p>
            </div>
          )}

          {!loading && !result && (
            <div className="bg-white border border-gov-border rounded-xl p-12 text-center shadow-sm space-y-3">
              <FileCheck className="w-12 h-12 text-gov-muted mx-auto" />
              <h3 className="text-base font-bold text-gov-navy">
                No Document Selected for Analysis
              </h3>
              <p className="text-xs text-gov-muted max-w-sm mx-auto">
                Upload a document file or click one of the quick demonstration samples on the left to inspect the automated pre-scrutiny output.
              </p>
            </div>
          )}

          {!loading && result && (
            <div className="bg-white border border-gov-border rounded-xl p-6 shadow-sm space-y-6 animate-in fade-in duration-150">
              {/* Result Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-gov-border pb-4">
                <div>
                  <span className="text-[10px] font-bold bg-gov-navy text-white px-2 py-0.5 rounded">
                    {result.document_type}
                  </span>
                  <h3 className="text-base font-bold text-gov-navy mt-1">
                    Pre-Scrutiny Verification Summary
                  </h3>
                  <p className="text-xs text-gov-muted">File: {result.file_name}</p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <span className="text-[10px] text-gov-muted block">OCR Confidence</span>
                    <span className="text-xs font-black text-gov-green">{result.ocr_confidence}%</span>
                  </div>
                  <button
                    onClick={resetVerification}
                    className="p-1.5 rounded hover:bg-slate-100 text-gov-muted hover:text-gov-navy"
                    title="Reset"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Extracted Fields Table */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-gov-navy uppercase tracking-wider">
                  OCR Extracted Fields
                </h4>
                <div className="bg-gov-bg rounded-lg border border-gov-border overflow-hidden">
                  <table className="w-full text-xs text-left">
                    <tbody className="divide-y divide-gov-border/60">
                      {Object.entries(result.extracted_fields).map(([key, val]) => (
                        <tr key={key} className="hover:bg-slate-100/60">
                          <td className="py-2.5 px-3 font-semibold text-gov-navy w-2/5 bg-slate-50/50">
                            {key}
                          </td>
                          <td className="py-2.5 px-3 font-medium text-slate-800">
                            {val}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Validation Checklist */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-gov-navy uppercase tracking-wider">
                  Completeness Checklist
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {result.checklist.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-lg border text-xs flex items-center justify-between bg-white border-slate-200"
                    >
                      <span className="text-slate-700 font-medium">{item.item}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        item.status === 'Passed' 
                          ? 'bg-emerald-100 text-gov-green' 
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {item.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Flagged Inconsistencies / Alerts */}
              {result.flags && result.flags.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-gov-navy uppercase tracking-wider flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-gov-orange" />
                    Flagged Inconsistencies & Review Items
                  </h4>
                  <div className="space-y-1.5">
                    {result.flags.map((flag, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 leading-relaxed"
                      >
                        <span className="font-bold">[{flag.type}]: </span>
                        <span>{flag.message}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Prominent Required Government Disclaimer */}
              <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl text-xs text-red-950 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-gov-red">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>Mandatory Statutory Disclaimer:</span>
                </div>
                <p className="leading-relaxed">
                  <strong>{result.disclaimer}</strong> This automated pre-check does not guarantee government approval or certify document authenticity. Final sanction rests exclusively with the authorized government officer.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
