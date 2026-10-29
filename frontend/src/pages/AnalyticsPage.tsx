import React, { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  AreaChart, 
  Area, 
  CartesianGrid, 
  Legend 
} from 'recharts';
import { 
  BarChart3, 
  TrendingUp, 
  Lightbulb, 
  ShieldCheck, 
  AlertTriangle, 
  Clock, 
  Layers, 
  RotateCcw 
} from 'lucide-react';
import { AnalyticsData, Language } from '../types';
import { translations } from '../translations';
import { api } from '../services/api';

const COLORS = ['#183153', '#E98A24', '#176B45', '#4F46E5', '#9333EA', '#DC2626'];

interface AnalyticsPageProps {
  language: Language;
}

export const AnalyticsPage: React.FC<AnalyticsPageProps> = ({ language }) => {
  const t = translations[language];
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const res = await api.getAnalytics();
      setData(res);
    } catch (e) {
      console.error("Error loading analytics:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  if (loading || !data) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="w-8 h-8 border-4 border-gov-navy border-t-gov-orange rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-gov-muted font-medium">Computing municipal governance analytics...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Top Banner */}
      <div className="bg-white border border-gov-border rounded-xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-gov-navy">
              Predictive Governance Analytics
            </h1>
            <span className="text-[10px] bg-gov-orange-light text-gov-orange-dark border border-gov-orange/30 font-bold px-2 py-0.5 rounded">
              Administrative Intelligence
            </span>
          </div>
          <p className="text-xs text-gov-muted mt-1 max-w-3xl">
            Live aggregated metrics, departmental workload distribution, and hotspot indicators computed directly from registered demonstration cases.
          </p>
        </div>

        <button
          onClick={loadAnalytics}
          className="text-xs bg-gov-bg hover:bg-slate-200 text-gov-navy border border-gov-border px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Refresh Analytics</span>
        </button>
      </div>

      {/* Key AI Observations Panel */}
      <div className="bg-gradient-to-r from-gov-navy to-gov-navy-light text-white rounded-xl p-6 shadow-md space-y-3">
        <div className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-gov-orange" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-white">
            Algorithmic Service Insights & Hotspot Observations
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-1">
          {data.observations.map((obs, idx) => (
            <div key={idx} className="bg-white/10 backdrop-blur-sm border border-white/10 p-3 rounded-lg flex items-start gap-2">
              <span className="w-2 h-2 rounded-full bg-gov-orange mt-1.5 flex-shrink-0" />
              <span className="leading-relaxed">{obs}</span>
            </div>
          ))}
        </div>

        <div className="pt-2 text-[11px] text-slate-300 flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-gov-green" />
          <span>Observations derived strictly from displayed dataset. Predictive trend forecasting requires historical baseline.</span>
        </div>
      </div>

      {/* Grid of Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Chart 1: Grievance Volume by Category */}
        <div className="bg-white border border-gov-border rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-gov-border pb-3">
            <div>
              <h3 className="text-sm font-bold text-gov-navy">Complaints by Category</h3>
              <p className="text-[11px] text-gov-muted">Breakdown across municipal and welfare sectors</p>
            </div>
            <span className="text-xs font-mono font-bold text-gov-navy bg-gov-bg px-2 py-0.5 rounded">
              Count
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.by_category} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="category" tick={{ fontSize: 10 }} interval={0} angle={-15} textAnchor="end" />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#183153', color: '#fff', borderRadius: '8px', fontSize: '12px' }} 
                  itemStyle={{ color: '#fff' }}
                />
                <Bar dataKey="count" fill="#183153" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Status Distribution (Donut) */}
        <div className="bg-white border border-gov-border rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-gov-border pb-3">
            <div>
              <h3 className="text-sm font-bold text-gov-navy">Resolution Status Distribution</h3>
              <p className="text-[11px] text-gov-muted">Real-time breakdown of case lifecycle stages</p>
            </div>
            <span className="text-xs font-mono font-bold text-gov-green bg-emerald-50 px-2 py-0.5 rounded">
              Lifecycle
            </span>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.by_status}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                >
                  {data.by_status.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#183153', color: '#fff', borderRadius: '8px', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Weekly Grievance Volume vs Resolution Trend */}
        <div className="bg-white border border-gov-border rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-gov-border pb-3">
            <div>
              <h3 className="text-sm font-bold text-gov-navy">Intake vs Resolution Timeline</h3>
              <p className="text-[11px] text-gov-muted">Demonstration 7-day velocity of citizen tickets</p>
            </div>
            <span className="text-xs font-mono font-bold text-gov-orange bg-gov-orange-light px-2 py-0.5 rounded">
              Trend
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.timeline_trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSub" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#183153" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#183153" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="colorRes" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#176B45" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#176B45" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: '#183153', color: '#fff', borderRadius: '8px', fontSize: '12px' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                <Area type="monotone" dataKey="submitted" stroke="#183153" fillOpacity={1} fill="url(#colorSub)" name="Submitted" />
                <Area type="monotone" dataKey="resolved" stroke="#176B45" fillOpacity={1} fill="url(#colorRes)" name="Resolved" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: District Distribution */}
        <div className="bg-white border border-gov-border rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-gov-border pb-3">
            <div>
              <h3 className="text-sm font-bold text-gov-navy">District-wise Grievance Density</h3>
              <p className="text-[11px] text-gov-muted">Maharashtra geographic distribution</p>
            </div>
            <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
              Districts
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={data.by_district} margin={{ top: 10, right: 20, left: 20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="district" tick={{ fontSize: 11 }} width={80} />
                <Tooltip contentStyle={{ backgroundColor: '#183153', color: '#fff', borderRadius: '8px', fontSize: '12px' }} />
                <Bar dataKey="count" fill="#E98A24" radius={[0, 4, 4, 0]} name="Complaints" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Mandatory Regulatory & Roadmap Notice */}
      <div className="p-4 bg-slate-100 border border-gov-border rounded-xl text-xs text-slate-700 space-y-1">
        <span className="font-bold text-gov-navy block">
          Future Capability Roadmap Note:
        </span>
        <p className="leading-relaxed">
          Advanced predictive modeling and heat-spot anomaly forecasting are marked as: <strong>“Future capability — requires adequate historical municipal data.”</strong> Current visualizations reflect active demonstration cases without simulated fabrication.
        </p>
      </div>
    </div>
  );
};
