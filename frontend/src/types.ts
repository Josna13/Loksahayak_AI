export type Language = 'en' | 'mr' | 'hi';
export type UserRole = 'citizen' | 'officer';

export type ActiveTab = 
  | 'home' 
  | 'assistant' 
  | 'schemes' 
  | 'grievance' 
  | 'documents' 
  | 'officer-dashboard' 
  | 'analytics' 
  | 'admin';

export interface Complaint {
  id?: number;
  ref_id: string;
  title: string;
  description: string;
  category: string;
  district: string;
  locality: string;
  photo_url?: string | null;
  language?: string;
  suggested_priority: 'High' | 'Medium' | 'Low';
  current_priority: 'High' | 'Medium' | 'Low';
  suggested_department: string;
  assigned_department: string;
  status: 'Submitted' | 'Under Review' | 'Assigned' | 'In Progress' | 'Resolved';
  duplicate_warning?: number;
  duplicate_details?: string | null;
  created_at: string;
  updated_at: string;
  internal_notes?: string;
  timeline?: AuditLog[];
}

export interface AuditLog {
  id?: number;
  complaint_ref_id: string;
  action: string;
  performed_by: string;
  details?: string;
  created_at: string;
}

export interface Scheme {
  id: number;
  title: string;
  title_mr?: string;
  title_hi?: string;
  level: string;
  category: string;
  target_group: string;
  description: string;
  description_mr?: string;
  description_hi?: string;
  eligibility_summary: string;
  min_age: number;
  max_age: number;
  occupation: string;
  employment_status: string;
  max_income: number;
  gender_restriction: 'all' | 'female' | 'male';
  required_docs: string[];
  deadline?: string;
  official_url?: string;
  status: 'Published' | 'Draft' | 'Needs Review';
  match_reasons?: string[];
}

export interface ServiceKB {
  id: number;
  title: string;
  category: string;
  description: string;
  required_docs: string[];
  process_steps: string[];
  sla_days: number;
  official_portal?: string;
  source_title: string;
  last_verified: string;
  status: 'Published' | 'Draft' | 'Needs Review';
}

export interface AnalyticsKPIs {
  total_complaints: number;
  pending_review: number;
  in_progress: number;
  resolved: number;
  approaching_deadline: number;
}

export interface AnalyticsData {
  kpis: AnalyticsKPIs;
  by_category: { category: string; count: number }[];
  by_status: { status: string; count: number }[];
  by_priority: { current_priority: string; count: number }[];
  by_district: { district: string; count: number }[];
  timeline_trend: { date: string; submitted: number; resolved: number }[];
  observations: string[];
  disclaimer: string;
}

export interface DocumentVerificationResult {
  document_type: string;
  file_name: string;
  is_valid: boolean;
  ocr_confidence: number;
  extracted_fields: Record<string, string>;
  checklist: { item: string; status: 'Passed' | 'Needs Review' | 'Missing' }[];
  flags: { type: string; message: string }[];
  disclaimer: string;
}
