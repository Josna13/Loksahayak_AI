import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  RotateCcw, 
  Building2, 
  CheckCircle2, 
  ExternalLink, 
  FileText, 
  AlertCircle, 
  Sparkles, 
  X,
  ChevronRight,
  HeartHandshake
} from 'lucide-react';
import { Scheme, Language } from '../types';
import { translations } from '../translations';
import { api } from '../services/api';

const MAHARASHTRA_DISTRICTS = [
  "All Maharashtra",
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

interface SchemeFinderPageProps {
  language: Language;
  initialFilter?: string;
}

export const SchemeFinderPage: React.FC<SchemeFinderPageProps> = ({ language, initialFilter }) => {
  const t = translations[language];

  // Filters State
  const [district, setDistrict] = useState("All Maharashtra");
  const [age, setAge] = useState<number>(28);
  const [occupation, setOccupation] = useState("all");
  const [incomeRange, setIncomeRange] = useState<number>(200000);
  const [category, setCategory] = useState(initialFilter === 'women' ? 'Women Welfare' : 'All');
  const [gender, setGender] = useState(initialFilter === 'women' ? 'female' : 'all');
  const [search, setSearch] = useState('');

  // Results State
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedScheme, setSelectedScheme] = useState<Scheme | null>(null);

  const fetchSchemes = async () => {
    setLoading(true);
    try {
      const res = await api.getSchemes({
        search: search.trim() || undefined,
        category: category !== 'All' ? category : undefined,
        district: district !== 'All Maharashtra' ? district : undefined,
        age: age > 0 ? age : undefined,
        occupation: occupation !== 'all' ? occupation : undefined,
        max_income: incomeRange > 0 ? incomeRange : undefined,
        gender: gender !== 'all' ? gender : undefined
      });
      setSchemes(res.schemes);
    } catch (e) {
      console.error("Error fetching schemes:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchemes();
  }, [district, age, occupation, incomeRange, category, gender]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchSchemes();
  };

  const resetFilters = () => {
    setDistrict("All Maharashtra");
    setAge(28);
    setOccupation("all");
    setIncomeRange(200000);
    setCategory("All");
    setGender("all");
    setSearch('');
  };

  const categories = [
    "All",
    "Women Welfare",
    "Social Welfare",
    "Education",
    "Entrepreneurship",
    "Housing"
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Page Title & Scope */}
      <div className="bg-white border border-gov-border rounded-xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-gov-navy">
                Smart Government Scheme Finder
              </h1>
              <span className="text-[10px] bg-gov-orange-light text-gov-orange-dark border border-gov-orange/30 font-bold px-2 py-0.5 rounded">
                Explainable Matching Engine
              </span>
            </div>
            <p className="text-xs text-gov-muted mt-1 max-w-3xl">
              Match your household criteria against published Maharashtra State and Central Government welfare schemes. Matches are explainable based on published eligibility guidelines.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] bg-slate-100 text-slate-700 px-3 py-1 rounded border border-slate-200 font-mono">
              Demo records: Verify eligibility on official portals
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Filter Column (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white border border-gov-border rounded-xl p-5 shadow-sm space-y-5 sticky top-24">
            <div className="flex items-center justify-between border-b border-gov-border pb-3">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gov-navy" />
                <h3 className="text-sm font-bold text-gov-navy">Citizen Eligibility Criteria</h3>
              </div>
              <button
                onClick={resetFilters}
                className="text-xs text-gov-muted hover:text-gov-red flex items-center gap-1 transition"
                title="Reset all filters"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            </div>

            {/* State & District */}
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-gov-text block mb-1">State Jurisdiction</label>
                <input
                  type="text"
                  disabled
                  value="Maharashtra (Default Focus)"
                  className="w-full text-xs bg-slate-100 text-slate-600 px-3 py-2 rounded border border-gov-border cursor-not-allowed font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gov-text block mb-1">Select District</label>
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full text-xs bg-white text-gov-text px-3 py-2 rounded border border-gov-border focus:ring-2 focus:ring-gov-navy/20"
                >
                  {MAHARASHTRA_DISTRICTS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Gender Filter (Women Focus) */}
            <div>
              <label className="text-xs font-semibold text-gov-text block mb-1.5 flex items-center justify-between">
                <span>Beneficiary Category</span>
                <span className="text-[10px] text-gov-orange font-bold">Women Priority</span>
              </label>
              <div className="grid grid-cols-3 gap-1.5 text-xs">
                <button
                  type="button"
                  onClick={() => setGender('all')}
                  className={`py-1.5 rounded font-medium border text-center transition ${
                    gender === 'all' ? 'bg-gov-navy text-white border-gov-navy' : 'bg-gov-bg text-gov-text border-gov-border hover:bg-slate-200'
                  }`}
                >
                  All
                </button>
                <button
                  type="button"
                  onClick={() => setGender('female')}
                  className={`py-1.5 rounded font-bold border text-center transition flex items-center justify-center gap-1 ${
                    gender === 'female' ? 'bg-gov-orange text-white border-gov-orange shadow-sm' : 'bg-gov-bg text-gov-text border-gov-border hover:bg-slate-200'
                  }`}
                >
                  <HeartHandshake className="w-3 h-3" />
                  <span>Female</span>
                </button>
                <button
                  type="button"
                  onClick={() => setGender('male')}
                  className={`py-1.5 rounded font-medium border text-center transition ${
                    gender === 'male' ? 'bg-gov-navy text-white border-gov-navy' : 'bg-gov-bg text-gov-text border-gov-border hover:bg-slate-200'
                  }`}
                >
                  Male
                </button>
              </div>
            </div>

            {/* Age Slider */}
            <div>
              <div className="flex justify-between text-xs font-semibold text-gov-text mb-1">
                <span>Applicant Age:</span>
                <span className="font-bold text-gov-navy bg-gov-bg px-2 py-0.5 rounded font-mono">{age} years</span>
              </div>
              <input
                type="range"
                min="0"
                max="80"
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                className="w-full accent-gov-navy cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-gov-muted mt-0.5">
                <span>0 yrs (Infant)</span>
                <span>40 yrs</span>
                <span>80+ yrs (Senior)</span>
              </div>
            </div>

            {/* Occupation */}
            <div>
              <label className="text-xs font-semibold text-gov-text block mb-1">Occupation / Profile</label>
              <select
                value={occupation}
                onChange={(e) => setOccupation(e.target.value)}
                className="w-full text-xs bg-white text-gov-text px-3 py-2 rounded border border-gov-border focus:ring-2 focus:ring-gov-navy/20"
              >
                <option value="all">Any / General Citizen</option>
                <option value="student">Student (School / College)</option>
                <option value="business">Self-Employed / Small Business / SHG</option>
                <option value="farmer">Farmer / Agriculture</option>
                <option value="homemaker">Homemaker</option>
              </select>
            </div>

            {/* Annual Income Ceiling */}
            <div>
              <div className="flex justify-between text-xs font-semibold text-gov-text mb-1">
                <span>Annual Family Income:</span>
                <span className="font-bold text-gov-navy bg-gov-bg px-2 py-0.5 rounded font-mono">
                  ₹{incomeRange.toLocaleString('en-IN')}
                </span>
              </div>
              <input
                type="range"
                min="30000"
                max="1000000"
                step="20000"
                value={incomeRange}
                onChange={(e) => setIncomeRange(Number(e.target.value))}
                className="w-full accent-gov-navy cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-gov-muted mt-0.5">
                <span>₹30K (BPL)</span>
                <span>₹2.5L (Ladki Bahin)</span>
                <span>₹10L+</span>
              </div>
            </div>

            <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-[11px] text-amber-900 leading-snug">
              <strong>Privacy Assurance:</strong> We never collect Aadhaar numbers, bank account credentials, or biometric data during scheme discovery.
            </div>
          </div>
        </div>

        {/* Right Schemes Results (8 cols) */}
        <div className="lg:col-span-8 space-y-5">
          {/* Search & Category Pills */}
          <div className="bg-white border border-gov-border rounded-xl p-4 shadow-sm space-y-3">
            <form onSubmit={handleSearchSubmit} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-3 text-gov-muted" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by scheme name, e.g. 'Ladki Bahin', 'Scholarship', 'Awas'..."
                  className="w-full pl-9 pr-3 py-2 text-xs border border-gov-border rounded-lg focus:outline-none focus:ring-2 focus:ring-gov-navy/20"
                />
              </div>
              <button
                type="submit"
                className="bg-gov-navy hover:bg-gov-navy-light text-white text-xs px-4 py-2 rounded-lg font-bold transition shadow"
              >
                Search
              </button>
            </form>

            {/* Category Pills */}
            <div className="flex flex-wrap gap-1.5 pt-1 border-t border-slate-100">
              {categories.map((c) => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={`text-xs px-3 py-1 rounded-full font-medium transition ${
                    category === c
                      ? 'bg-gov-navy text-white shadow-sm'
                      : 'bg-gov-bg text-gov-muted hover:bg-slate-200 hover:text-gov-navy'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Results Count & Status */}
          <div className="flex items-center justify-between text-xs text-gov-muted px-1">
            <span>
              Showing <strong>{schemes.length}</strong> matching schemes for Maharashtra
            </span>
            <span>Sorted by profile relevance</span>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="bg-white border border-gov-border rounded-xl p-12 text-center shadow-sm">
              <div className="w-8 h-8 border-4 border-gov-navy border-t-gov-orange rounded-full animate-spin mx-auto mb-3" />
              <p className="text-xs text-gov-muted font-medium">Filtering government welfare database...</p>
            </div>
          )}

          {/* No Results State */}
          {!loading && schemes.length === 0 && (
            <div className="bg-white border border-gov-border rounded-xl p-12 text-center shadow-sm space-y-3">
              <AlertCircle className="w-10 h-10 text-gov-muted mx-auto" />
              <h3 className="text-sm font-bold text-gov-navy">No Matching Schemes Found</h3>
              <p className="text-xs text-gov-muted max-w-md mx-auto">
                No schemes currently match your specific age, income ceiling, or category combination. Try widening your criteria or clearing filters.
              </p>
              <button
                onClick={resetFilters}
                className="bg-gov-navy text-white text-xs px-4 py-2 rounded-lg font-bold hover:bg-gov-navy-light transition"
              >
                Reset All Filters
              </button>
            </div>
          )}

          {/* Scheme Cards */}
          {!loading && schemes.map((s) => (
            <div
              key={s.id}
              className="bg-white border border-gov-border rounded-xl p-5 shadow-sm hover:border-gov-navy/40 transition space-y-4"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-bold bg-gov-navy text-white px-2 py-0.5 rounded">
                      {s.level}
                    </span>
                    <span className="text-[10px] font-bold bg-gov-orange-light text-gov-orange-dark border border-gov-orange/30 px-2 py-0.5 rounded">
                      {s.category}
                    </span>
                    {s.gender_restriction === 'female' && (
                      <span className="text-[10px] font-bold bg-emerald-50 text-gov-green border border-emerald-200 px-2 py-0.5 rounded flex items-center gap-1">
                        <HeartHandshake className="w-3 h-3" />
                        Women Dedicated
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-bold text-gov-navy mt-1.5">
                    {s.title}
                  </h3>
                  {language === 'mr' && s.title_mr && (
                    <p className="text-xs text-gov-green font-semibold mt-0.5">{s.title_mr}</p>
                  )}
                  {language === 'hi' && s.title_hi && (
                    <p className="text-xs text-gov-green font-semibold mt-0.5">{s.title_hi}</p>
                  )}
                </div>

                <button
                  onClick={() => setSelectedScheme(s)}
                  className="whitespace-nowrap text-xs bg-gov-bg hover:bg-slate-200 text-gov-navy border border-gov-border px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1"
                >
                  <span>View Details</span>
                  <ChevronRight className="w-3.5 h-3.5 text-gov-orange" />
                </button>
              </div>

              {/* Explainable Matching Box */}
              {s.match_reasons && s.match_reasons.length > 0 && (
                <div className="bg-emerald-50/70 border border-emerald-200 rounded-lg p-2.5 flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-gov-green flex-shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <span className="font-bold text-gov-green">Why this matches your profile: </span>
                    <span className="text-slate-700">
                      {s.match_reasons.join(' • ')}
                    </span>
                  </div>
                </div>
              )}

              {/* Description */}
              <p className="text-xs text-gov-muted leading-relaxed">
                {language === 'mr' && s.description_mr ? s.description_mr : s.description}
              </p>

              {/* Eligibility & Documents Snippet */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-lg border border-gov-border/60">
                <div>
                  <span className="font-bold text-gov-navy block mb-0.5">Eligibility Summary:</span>
                  <span className="text-slate-600 leading-snug">{s.eligibility_summary}</span>
                </div>
                <div>
                  <span className="font-bold text-gov-navy block mb-0.5">Key Documents:</span>
                  <div className="flex flex-wrap gap-1">
                    {s.required_docs.slice(0, 3).map((d, i) => (
                      <span key={i} className="text-[10px] bg-white border border-slate-200 px-1.5 py-0.5 rounded text-slate-700">
                        {d}
                      </span>
                    ))}
                    {s.required_docs.length > 3 && (
                      <span className="text-[10px] text-gov-muted self-center">
                        +{s.required_docs.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Footer actions */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
                <span className="text-gov-muted text-[11px]">
                  Enrollment: <strong>{s.deadline || "Open Ongoing"}</strong>
                </span>
                {s.official_url && (
                  <a
                    href={s.official_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-gov-navy hover:text-gov-orange font-bold inline-flex items-center gap-1 hover:underline"
                  >
                    <span>Official Portal</span>
                    <ExternalLink className="w-3.5 h-3.5 text-gov-orange" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Scheme Detail Modal */}
      {selectedScheme && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gov-border p-6 space-y-5 animate-in fade-in duration-150">
            <div className="flex items-start justify-between border-b border-gov-border pb-4">
              <div>
                <span className="text-[10px] font-bold bg-gov-navy text-white px-2 py-0.5 rounded">
                  {selectedScheme.level}
                </span>
                <h2 className="text-lg font-black text-gov-navy mt-1">
                  {selectedScheme.title}
                </h2>
                {selectedScheme.title_mr && (
                  <p className="text-xs text-gov-green font-semibold">{selectedScheme.title_mr}</p>
                )}
              </div>
              <button
                onClick={() => setSelectedScheme(null)}
                className="p-1 rounded hover:bg-slate-100 text-gov-muted hover:text-gov-navy"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <h4 className="font-bold text-gov-navy uppercase text-[11px] mb-1">Target Beneficiary</h4>
                <p className="text-slate-700 bg-gov-bg p-2.5 rounded border border-gov-border">
                  {selectedScheme.target_group}
                </p>
              </div>

              <div>
                <h4 className="font-bold text-gov-navy uppercase text-[11px] mb-1">Detailed Description</h4>
                <p className="text-slate-700 leading-relaxed">
                  {selectedScheme.description}
                </p>
              </div>

              <div>
                <h4 className="font-bold text-gov-navy uppercase text-[11px] mb-1">Eligibility Criteria Breakdown</h4>
                <p className="text-slate-700 bg-slate-50 p-2.5 rounded border border-gov-border">
                  {selectedScheme.eligibility_summary}
                </p>
              </div>

              <div>
                <h4 className="font-bold text-gov-navy uppercase text-[11px] mb-2 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-gov-orange" />
                  Mandatory Supporting Documents
                </h4>
                <ul className="space-y-1.5">
                  {selectedScheme.required_docs.map((doc, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-slate-700 bg-white p-2 rounded border border-slate-200">
                      <CheckCircle2 className="w-3.5 h-3.5 text-gov-green flex-shrink-0" />
                      <span>{doc}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-[11px] text-amber-900 leading-snug">
                <strong>Demonstration Note:</strong> Scheme rules and subsidy rates are subject to Government of Maharashtra Gazettes. Final benefit sanction is verified by the relevant department nodal officer.
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-gov-border pt-4">
              <button
                onClick={() => setSelectedScheme(null)}
                className="text-xs px-4 py-2 border border-gov-border rounded-lg font-semibold hover:bg-slate-100 transition"
              >
                Close
              </button>

              {selectedScheme.official_url && (
                <a
                  href={selectedScheme.official_url}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-gov-navy hover:bg-gov-navy-light text-white text-xs px-5 py-2 rounded-lg font-bold transition flex items-center gap-1.5 shadow"
                >
                  <span>Apply on Official Portal</span>
                  <ExternalLink className="w-3.5 h-3.5 text-gov-orange" />
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
