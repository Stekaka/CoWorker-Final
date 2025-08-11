-- CRM Database Schema for Supabase
-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- User profiles table (extends Supabase auth.users)
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  company_name TEXT,
  avatar_url TEXT,
  plan_type TEXT DEFAULT 'starter' CHECK (plan_type IN ('starter', 'professional', 'enterprise')),
  subscription_id TEXT,
  subscription_status TEXT DEFAULT 'trial' CHECK (subscription_status IN ('trial', 'active', 'cancelled', 'past_due')),
  trial_ends_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '14 days',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Contacts table (people and companies)
CREATE TABLE contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company TEXT,
  position TEXT,
  type TEXT DEFAULT 'person' CHECK (type IN ('person', 'company')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'prospect')),
  source TEXT,
  notes TEXT,
  avatar_url TEXT,
  address TEXT,
  website TEXT,
  social_links JSONB DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  custom_fields JSONB DEFAULT '{}',
  lead_score INTEGER DEFAULT 0,
  last_contacted TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Pipelines table
CREATE TABLE pipelines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Deal stages table
CREATE TABLE deal_stages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pipeline_id UUID REFERENCES pipelines(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#3B82F6',
  order_index INTEGER NOT NULL,
  probability INTEGER DEFAULT 50 CHECK (probability >= 0 AND probability <= 100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Deals table
CREATE TABLE deals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  pipeline_id UUID REFERENCES pipelines(id) ON DELETE SET NULL,
  stage_id UUID REFERENCES deal_stages(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  amount DECIMAL(12, 2) DEFAULT 0,
  currency TEXT DEFAULT 'SEK',
  probability INTEGER DEFAULT 50 CHECK (probability >= 0 AND probability <= 100),
  expected_close_date DATE,
  actual_close_date DATE,
  source TEXT,
  tags TEXT[] DEFAULT '{}',
  custom_fields JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activities table (notes, emails, calls, meetings)
CREATE TABLE activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
  deal_id UUID REFERENCES deals(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('note', 'email', 'call', 'meeting', 'task')),
  title TEXT NOT NULL,
  description TEXT,
  date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  duration_minutes INTEGER,
  outcome TEXT,
  next_action TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tasks table
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  deal_id UUID REFERENCES deals(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  completed BOOLEAN DEFAULT FALSE,
  due_date TIMESTAMP WITH TIME ZONE,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  category TEXT,
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Email templates table
CREATE TABLE email_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  variables TEXT[] DEFAULT '{}',
  category TEXT DEFAULT 'general' CHECK (category IN ('welcome', 'follow_up', 'proposal', 'invoice', 'general')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Quotes table
CREATE TABLE quotes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  deal_id UUID REFERENCES deals(id) ON DELETE SET NULL,
  quote_number TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  line_items JSONB DEFAULT '[]',
  subtotal DECIMAL(12, 2) DEFAULT 0,
  tax_rate DECIMAL(5, 2) DEFAULT 0,
  tax_amount DECIMAL(12, 2) DEFAULT 0,
  total_amount DECIMAL(12, 2) DEFAULT 0,
  currency TEXT DEFAULT 'SEK',
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'viewed', 'accepted', 'rejected', 'expired')),
  valid_until DATE,
  notes TEXT,
  terms TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Invoices table
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  quote_id UUID REFERENCES quotes(id) ON DELETE SET NULL,
  invoice_number TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  line_items JSONB DEFAULT '[]',
  subtotal DECIMAL(12, 2) DEFAULT 0,
  tax_rate DECIMAL(5, 2) DEFAULT 0,
  tax_amount DECIMAL(12, 2) DEFAULT 0,
  total_amount DECIMAL(12, 2) DEFAULT 0,
  currency TEXT DEFAULT 'SEK',
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled')),
  due_date DATE,
  paid_date DATE,
  stripe_payment_intent_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Automations table
CREATE TABLE automations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  trigger_type TEXT NOT NULL CHECK (trigger_type IN ('deal_stage_change', 'contact_created', 'task_completed', 'date_trigger')),
  trigger_conditions JSONB DEFAULT '{}',
  actions JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Email campaigns table
CREATE TABLE campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  email_template_id UUID REFERENCES email_templates(id) ON DELETE SET NULL,
  contact_segments TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sending', 'completed', 'paused')),
  scheduled_at TIMESTAMP WITH TIME ZONE,
  sent_at TIMESTAMP WITH TIME ZONE,
  stats JSONB DEFAULT '{"sent": 0, "delivered": 0, "opened": 0, "clicked": 0, "bounced": 0, "unsubscribed": 0}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Web forms table
CREATE TABLE web_forms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  fields JSONB DEFAULT '[]',
  settings JSONB DEFAULT '{}',
  embed_code TEXT,
  submissions_count INTEGER DEFAULT 0,
  conversion_rate DECIMAL(5, 2) DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Form submissions table
CREATE TABLE form_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  form_id UUID REFERENCES web_forms(id) ON DELETE CASCADE,
  data JSONB DEFAULT '{}',
  source_ip INET,
  user_agent TEXT,
  utm_params JSONB DEFAULT '{}',
  contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  deal_id UUID REFERENCES deals(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Integrations table
CREATE TABLE integrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('email', 'calendar', 'accounting', 'communication', 'crm')),
  provider TEXT NOT NULL,
  credentials JSONB DEFAULT '{}',
  settings JSONB DEFAULT '{}',
  sync_status TEXT DEFAULT 'disconnected' CHECK (sync_status IN ('connected', 'syncing', 'error', 'disconnected')),
  last_sync TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Documents table
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  deal_id UUID REFERENCES deals(id) ON DELETE SET NULL,
  invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  type TEXT DEFAULT 'other' CHECK (type IN ('proposal', 'contract', 'invoice', 'quote', 'other')),
  file_url TEXT NOT NULL,
  file_size BIGINT,
  mime_type TEXT,
  is_public BOOLEAN DEFAULT FALSE,
  view_count INTEGER DEFAULT 0,
  last_viewed TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Timeline events table (for visual timeline)
CREATE TABLE timeline_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
  deal_id UUID REFERENCES deals(id) ON DELETE SET NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  metadata JSONB DEFAULT '{}',
  date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  icon TEXT,
  color TEXT DEFAULT '#3B82F6',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Gamification table
CREATE TABLE gamification (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  points INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  badges JSONB DEFAULT '[]',
  achievements JSONB DEFAULT '[]',
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  leaderboard_position INTEGER,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Offline queue table (for offline-first functionality)
CREATE TABLE offline_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL CHECK (action_type IN ('create', 'update', 'delete')),
  resource_type TEXT NOT NULL CHECK (resource_type IN ('contact', 'deal', 'activity', 'task')),
  resource_id UUID,
  data JSONB DEFAULT '{}',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'synced', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  synced_at TIMESTAMP WITH TIME ZONE
);

-- Customer portal access table
CREATE TABLE customer_portals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
  access_token TEXT NOT NULL UNIQUE,
  permissions JSONB DEFAULT '[]',
  custom_branding JSONB DEFAULT '{}',
  accessible_data JSONB DEFAULT '{}',
  last_accessed TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for better performance
CREATE INDEX idx_contacts_user_id ON contacts(user_id);
CREATE INDEX idx_contacts_email ON contacts(email);
CREATE INDEX idx_contacts_company ON contacts(company);
CREATE INDEX idx_deals_user_id ON deals(user_id);
CREATE INDEX idx_deals_contact_id ON deals(contact_id);
CREATE INDEX idx_deals_stage_id ON deals(stage_id);
CREATE INDEX idx_activities_user_id ON activities(user_id);
CREATE INDEX idx_activities_contact_id ON activities(contact_id);
CREATE INDEX idx_activities_deal_id ON activities(deal_id);
CREATE INDEX idx_activities_date ON activities(date);
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_tasks_completed ON tasks(completed);
CREATE INDEX idx_timeline_events_contact_id ON timeline_events(contact_id);
CREATE INDEX idx_timeline_events_date ON timeline_events(date);

-- RLS (Row Level Security) Policies
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE pipelines ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE automations ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE web_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE timeline_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE gamification ENABLE ROW LEVEL SECURITY;
ALTER TABLE offline_queue ENABLE ROW LEVEL SECURITY;

-- Create policies for user_profiles
CREATE POLICY "Users can view own profile" ON user_profiles FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can insert own profile" ON user_profiles FOR INSERT WITH CHECK (user_id = auth.uid());

-- Create policies for contacts
CREATE POLICY "Users can manage own contacts" ON contacts FOR ALL USING (user_id = auth.uid());

-- Create policies for pipelines
CREATE POLICY "Users can manage own pipelines" ON pipelines FOR ALL USING (user_id = auth.uid());

-- Create policies for deal_stages
CREATE POLICY "Users can manage stages in own pipelines" ON deal_stages FOR ALL USING (
  pipeline_id IN (SELECT id FROM pipelines WHERE user_id = auth.uid())
);

-- Create policies for deals
CREATE POLICY "Users can manage own deals" ON deals FOR ALL USING (user_id = auth.uid());

-- Create policies for activities
CREATE POLICY "Users can manage own activities" ON activities FOR ALL USING (user_id = auth.uid());

-- Create policies for tasks
CREATE POLICY "Users can manage own tasks" ON tasks FOR ALL USING (user_id = auth.uid());

-- Create policies for email_templates
CREATE POLICY "Users can manage own email templates" ON email_templates FOR ALL USING (user_id = auth.uid());

-- Create policies for quotes
CREATE POLICY "Users can manage own quotes" ON quotes FOR ALL USING (user_id = auth.uid());

-- Create policies for invoices
CREATE POLICY "Users can manage own invoices" ON invoices FOR ALL USING (user_id = auth.uid());

-- Create policies for automations
CREATE POLICY "Users can manage own automations" ON automations FOR ALL USING (user_id = auth.uid());

-- Create policies for campaigns
CREATE POLICY "Users can manage own campaigns" ON campaigns FOR ALL USING (user_id = auth.uid());

-- Create policies for web_forms
CREATE POLICY "Users can manage own web forms" ON web_forms FOR ALL USING (user_id = auth.uid());

-- Create policies for form_submissions
CREATE POLICY "Users can view submissions to own forms" ON form_submissions FOR SELECT USING (
  form_id IN (SELECT id FROM web_forms WHERE user_id = auth.uid())
);

-- Create policies for integrations
CREATE POLICY "Users can manage own integrations" ON integrations FOR ALL USING (user_id = auth.uid());

-- Create policies for documents
CREATE POLICY "Users can manage own documents" ON documents FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Public documents are viewable" ON documents FOR SELECT USING (is_public = true);

-- Create policies for timeline_events
CREATE POLICY "Users can manage own timeline events" ON timeline_events FOR ALL USING (user_id = auth.uid());

-- Create policies for gamification
CREATE POLICY "Users can view own gamification data" ON gamification FOR ALL USING (user_id = auth.uid());

-- Create policies for offline_queue
CREATE POLICY "Users can manage own offline queue" ON offline_queue FOR ALL USING (user_id = auth.uid());

-- Create policies for customer_portals (special case - accessed by contact token)
CREATE POLICY "Customer portals accessible by token" ON customer_portals FOR SELECT USING (true);

-- Functions for automatic updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_contacts_updated_at BEFORE UPDATE ON contacts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pipelines_updated_at BEFORE UPDATE ON pipelines FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_deals_updated_at BEFORE UPDATE ON deals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_activities_updated_at BEFORE UPDATE ON activities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_email_templates_updated_at BEFORE UPDATE ON email_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_quotes_updated_at BEFORE UPDATE ON quotes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_automations_updated_at BEFORE UPDATE ON automations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON campaigns FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_web_forms_updated_at BEFORE UPDATE ON web_forms FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_integrations_updated_at BEFORE UPDATE ON integrations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_gamification_updated_at BEFORE UPDATE ON gamification FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to create default pipeline and stages for new users
CREATE OR REPLACE FUNCTION create_default_pipeline_for_user(user_uuid UUID)
RETURNS VOID AS $$
DECLARE
  pipeline_id UUID;
BEGIN
  -- Create default pipeline
  INSERT INTO pipelines (user_id, name, is_default)
  VALUES (user_uuid, 'Standard Sales Pipeline', true)
  RETURNING id INTO pipeline_id;
  
  -- Create default stages
  INSERT INTO deal_stages (pipeline_id, name, color, order_index, probability) VALUES
  (pipeline_id, 'Prospect', '#6B7280', 0, 10),
  (pipeline_id, 'Qualified', '#3B82F6', 1, 25),
  (pipeline_id, 'Proposal', '#F59E0B', 2, 50),
  (pipeline_id, 'Negotiation', '#EF4444', 3, 75),
  (pipeline_id, 'Won', '#10B981', 4, 100),
  (pipeline_id, 'Lost', '#6B7280', 5, 0);
END;
$$ language 'plpgsql';

-- Function to automatically create timeline events
CREATE OR REPLACE FUNCTION create_timeline_event()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_TABLE_NAME = 'contacts' AND TG_OP = 'INSERT' THEN
    INSERT INTO timeline_events (user_id, contact_id, type, title, description, icon, color)
    VALUES (NEW.user_id, NEW.id, 'contact_created', 'Contact Created', 'New contact ' || NEW.name || ' was added', 'user-plus', '#10B981');
  ELSIF TG_TABLE_NAME = 'deals' AND TG_OP = 'INSERT' THEN
    INSERT INTO timeline_events (user_id, contact_id, deal_id, type, title, description, icon, color)
    VALUES (NEW.user_id, NEW.contact_id, NEW.id, 'deal_created', 'Deal Created', 'New deal ' || NEW.title || ' was created', 'briefcase', '#3B82F6');
  ELSIF TG_TABLE_NAME = 'deals' AND TG_OP = 'UPDATE' AND OLD.stage_id != NEW.stage_id THEN
    INSERT INTO timeline_events (user_id, contact_id, deal_id, type, title, description, icon, color)
    VALUES (NEW.user_id, NEW.contact_id, NEW.id, 'deal_stage_changed', 'Deal Stage Changed', 'Deal ' || NEW.title || ' moved to new stage', 'arrow-right', '#F59E0B');
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

-- Create triggers for timeline events
CREATE TRIGGER contact_timeline_trigger AFTER INSERT ON contacts FOR EACH ROW EXECUTE FUNCTION create_timeline_event();
CREATE TRIGGER deal_timeline_trigger AFTER INSERT OR UPDATE ON deals FOR EACH ROW EXECUTE FUNCTION create_timeline_event();

-- Create initial data for new users (trigger on user_profiles insert)
CREATE OR REPLACE FUNCTION setup_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Create default pipeline
  PERFORM create_default_pipeline_for_user(NEW.user_id);
  
  -- Create gamification record
  INSERT INTO gamification (user_id) VALUES (NEW.user_id);
  
  -- Create default email templates
  INSERT INTO email_templates (user_id, name, subject, body, category) VALUES
  (NEW.user_id, 'Welcome Email', 'Welcome to our service!', 'Hi {{contact_name}},\n\nWelcome! We''re excited to work with you.\n\nBest regards,\n{{user_name}}', 'welcome'),
  (NEW.user_id, 'Follow Up', 'Following up on our conversation', 'Hi {{contact_name}},\n\nI wanted to follow up on our recent conversation.\n\nBest regards,\n{{user_name}}', 'follow_up'),
  (NEW.user_id, 'Proposal Sent', 'Your proposal is ready', 'Hi {{contact_name}},\n\nI''ve prepared a proposal for you. Please review it at your convenience.\n\nBest regards,\n{{user_name}}', 'proposal');
  
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER setup_new_user_trigger AFTER INSERT ON user_profiles FOR EACH ROW EXECUTE FUNCTION setup_new_user();
