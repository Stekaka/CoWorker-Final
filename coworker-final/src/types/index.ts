// Type aliases for better type safety
export type JsonValue = string | number | boolean | null | JsonObject | JsonArray
export type JsonObject = { [key: string]: JsonValue }
export type JsonArray = JsonValue[]

// Database Types
export interface UserProfile {
  id: string
  user_id: string
  full_name: string
  company_name?: string
  avatar_url?: string
  plan_type: 'starter' | 'professional' | 'enterprise'
  created_at: string
  updated_at: string
}

export interface Contact {
  id: string
  user_id: string
  name: string
  email?: string
  phone?: string
  company?: string
  position?: string
  type: 'person' | 'company'
  status: 'active' | 'inactive' | 'prospect'
  source?: string
  notes?: string
  avatar_url?: string
  address?: string
  website?: string
  social_links?: Record<string, string>
  tags?: string[]
  created_at: string
  updated_at: string
}

export interface Deal {
  id: string
  user_id: string
  contact_id?: string
  title: string
  description?: string
  amount: number
  currency: string
  stage: 'prospect' | 'qualified' | 'proposal' | 'negotiation' | 'won' | 'lost'
  probability: number
  expected_close_date?: string
  actual_close_date?: string
  source?: string
  tags?: string[]
  created_at: string
  updated_at: string
}

export interface Activity {
  id: string
  user_id: string
  contact_id?: string
  deal_id?: string
  type: 'note' | 'email' | 'call' | 'meeting' | 'task'
  title: string
  description?: string
  date: string
  duration_minutes?: number
  outcome?: string
  next_action?: string
  created_at: string
  updated_at: string
}

export interface Task {
  id: string
  user_id: string
  contact_id?: string
  deal_id?: string
  title: string
  description?: string
  completed: boolean
  completed_at?: string
  due_date?: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  category?: string
  assigned_to?: string
  created_at: string
  updated_at: string
}

export interface Quote {
  id: string
  user_id: string
  contact_id?: string
  deal_id?: string
  quote_number: string
  title: string
  description?: string
  line_items: QuoteLineItem[]
  subtotal: number
  tax_rate: number
  tax_amount: number
  total_amount: number
  currency: string
  status: 'draft' | 'sent' | 'viewed' | 'accepted' | 'rejected' | 'expired'
  valid_until?: string
  notes?: string
  terms?: string
  created_at: string
  updated_at: string
}

export interface QuoteLineItem {
  id: string
  description: string
  quantity: number
  unit_price: number
  total: number
}

export interface Invoice {
  id: string
  user_id: string
  contact_id?: string
  quote_id?: string
  invoice_number: string
  title: string
  line_items: QuoteLineItem[]
  subtotal: number
  tax_rate: number
  tax_amount: number
  total_amount: number
  currency: string
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
  due_date?: string
  paid_date?: string
  created_at: string
  updated_at: string
}

export interface Automation {
  id: string
  user_id: string
  name: string
  description?: string
  trigger_type: 'deal_stage_change' | 'contact_created' | 'task_completed' | 'date_trigger'
  trigger_conditions: JsonObject
  actions: AutomationAction[]
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface AutomationAction {
  id: string
  type: 'send_email' | 'create_task' | 'update_deal' | 'send_notification'
  config: JsonObject
  delay_minutes?: number
}

export interface EmailTemplate {
  id: string
  user_id: string
  name: string
  subject: string
  body: string
  variables: string[]
  category: 'welcome' | 'follow_up' | 'proposal' | 'invoice' | 'general'
  created_at: string
  updated_at: string
}

export interface Campaign {
  id: string
  user_id: string
  name: string
  description?: string
  email_template_id: string
  contact_segments: string[]
  status: 'draft' | 'scheduled' | 'sending' | 'completed' | 'paused'
  scheduled_at?: string
  sent_at?: string
  stats: {
    sent: number
    delivered: number
    opened: number
    clicked: number
    bounced: number
    unsubscribed: number
  }
  created_at: string
  updated_at: string
}

// UI Types
export interface MenuItem {
  id: string
  label: string
  icon: string
  href: string
  badge?: number
  children?: MenuItem[]
}

export interface DashboardStats {
  total_contacts: number
  total_deals: number
  total_revenue: number
  deals_won_this_month: number
  pipeline_value: number
  conversion_rate: number
  average_deal_size: number
  tasks_due_today: number
}

export interface ChartData {
  name: string
  value: number
  color?: string
}

// Advanced Features
export interface AIAssistant {
  id: string
  user_id: string
  type: 'proposal_generator' | 'lead_scorer' | 'next_action_suggester' | 'email_summarizer'
  context: JsonObject
  suggestions: AISuggestion[]
  created_at: string
}

export interface AISuggestion {
  id: string
  type: 'text_generation' | 'action_recommendation' | 'lead_score' | 'email_summary'
  content: string
  confidence_score: number
  metadata: JsonObject
}

export interface LeadScore {
  id: string
  contact_id: string
  score: number
  factors: ScoreFactor[]
  predicted_conversion_probability: number
  recommended_actions: string[]
  updated_at: string
}

export interface ScoreFactor {
  name: string
  value: number
  weight: number
  description: string
}

export interface IndustryTemplate {
  id: string
  name: string
  industry: string
  description: string
  pipeline_stages: Omit<DealStage, 'id' | 'pipeline_id'>[]
  email_templates: Omit<EmailTemplate, 'id' | 'user_id'>[]
  automations: Omit<Automation, 'id' | 'user_id'>[]
  task_templates: TaskTemplate[]
}

export interface TaskTemplate {
  title: string
  description: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  due_days_offset: number
  category: string
}

export interface CustomerPortal {
  id: string
  contact_id: string
  access_token: string
  permissions: PortalPermission[]
  custom_branding: {
    logo_url?: string
    primary_color?: string
    company_name?: string
  }
  accessible_data: {
    deals: string[]
    invoices: string[]
    documents: string[]
  }
  last_accessed?: string
  created_at: string
  expires_at?: string
}

export interface PortalPermission {
  resource: 'deals' | 'invoices' | 'documents' | 'communications'
  actions: ('view' | 'download' | 'comment')[]
}

export interface Document {
  id: string
  user_id: string
  contact_id?: string
  deal_id?: string
  invoice_id?: string
  name: string
  type: 'proposal' | 'contract' | 'invoice' | 'quote' | 'other'
  file_url: string
  file_size: number
  mime_type: string
  is_public: boolean
  view_count: number
  last_viewed?: string
  created_at: string
  updated_at: string
}

export interface WebForm {
  id: string
  user_id: string
  name: string
  description?: string
  fields: FormField[]
  settings: {
    redirect_url?: string
    notification_email?: string
    auto_respond: boolean
    auto_respond_template_id?: string
  }
  embed_code: string
  submissions_count: number
  conversion_rate: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface FormField {
  id: string
  type: 'text' | 'email' | 'phone' | 'textarea' | 'select' | 'checkbox' | 'radio'
  label: string
  placeholder?: string
  required: boolean
  options?: string[]
  validation_rules?: JsonObject
  order: number
}

export interface FormSubmission {
  id: string
  form_id: string
  data: JsonObject
  source_ip: string
  user_agent: string
  utm_params?: Record<string, string>
  contact_id?: string
  deal_id?: string
  created_at: string
}

export interface Integration {
  id: string
  user_id: string
  type: 'email' | 'calendar' | 'accounting' | 'communication' | 'crm'
  provider: 'gmail' | 'outlook' | 'fortnox' | 'visma' | 'whatsapp' | 'sms'
  credentials: JsonObject
  settings: JsonObject
  sync_status: 'connected' | 'syncing' | 'error' | 'disconnected'
  last_sync?: string
  created_at: string
  updated_at: string
}

export interface Gamification {
  id: string
  user_id: string
  points: number
  level: number
  badges: Badge[]
  achievements: Achievement[]
  current_streak: number
  longest_streak: number
  leaderboard_position?: number
  updated_at: string
}

export interface Badge {
  id: string
  name: string
  description: string
  icon: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  earned_at: string
}

export interface Achievement {
  id: string
  name: string
  description: string
  category: 'deals' | 'contacts' | 'tasks' | 'revenue'
  target_value: number
  current_value: number
  completed: boolean
  completed_at?: string
}

export interface OfflineQueue {
  id: string
  user_id: string
  action_type: 'create' | 'update' | 'delete'
  resource_type: 'contact' | 'deal' | 'activity' | 'task'
  resource_id?: string
  data: JsonObject
  status: 'pending' | 'synced' | 'failed'
  created_at: string
  synced_at?: string
}

export interface TimelineEvent {
  id: string
  contact_id?: string
  deal_id?: string
  type: 'contact_created' | 'deal_created' | 'activity_logged' | 'email_sent' | 'call_made' | 'meeting_scheduled' | 'task_completed' | 'deal_stage_changed' | 'invoice_sent' | 'payment_received'
  title: string
  description?: string
  metadata: JsonObject
  date: string
  user_id: string
  icon: string
  color: string
}

// Navigation and UI Types
export interface DealStage {
  id: string
  name: string
  color: string
  order: number
  pipeline_id: string
}

export interface Pipeline {
  id: string
  user_id: string
  name: string
  is_default: boolean
  stages: DealStage[]
  created_at: string
  updated_at: string
}

// Enhanced Dashboard Stats
export interface EnhancedDashboardStats extends DashboardStats {
  revenue_trend: ChartData[]
  deals_by_stage: ChartData[]
  top_performing_contacts: Contact[]
  recent_timeline_events: TimelineEvent[]
  ai_insights: AISuggestion[]
  upcoming_tasks: Task[]
  overdue_invoices: Invoice[]
}
