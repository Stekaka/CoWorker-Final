-- Migration för offert-systemet
-- Skapad: 2025-08-11

-- Companies tabell för företagsfiltrering
CREATE TABLE companies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  org_number TEXT UNIQUE,
  email TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  postal_code TEXT,
  website TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User company mappings (istället för att ändra auth.users)
CREATE TABLE user_companies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user', 'viewer')),
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, company_id)
);

-- Products tabell (företagsfiltrerat)
CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  unit TEXT NOT NULL DEFAULT 'styck',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Customers tabell (företagsfiltrerat)
CREATE TABLE customers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  company_name TEXT,
  address TEXT,
  city TEXT,
  postal_code TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Quotes tabell (användarfiltrerat)
CREATE TABLE quotes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  quote_number TEXT NOT NULL,
  title TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'viewed', 'accepted', 'rejected', 'expired')),
  subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
  tax_rate DECIMAL(5,2) NOT NULL DEFAULT 25,
  tax_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  global_discount DECIMAL(10,2) DEFAULT 0,
  notes TEXT,
  valid_until DATE,
  sent_at TIMESTAMP WITH TIME ZONE,
  viewed_at TIMESTAMP WITH TIME ZONE,
  accepted_at TIMESTAMP WITH TIME ZONE,
  rejected_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(company_id, quote_number)
);

-- Quote line items
CREATE TABLE quote_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  quote_id UUID NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  description TEXT NOT NULL,
  quantity DECIMAL(10,3) NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  discount_percent DECIMAL(5,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes för performance
CREATE INDEX idx_user_companies_user_id ON user_companies(user_id);
CREATE INDEX idx_user_companies_company_id ON user_companies(company_id);
CREATE INDEX idx_products_company_id ON products(company_id);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_customers_company_id ON customers(company_id);
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_quotes_user_id ON quotes(user_id);
CREATE INDEX idx_quotes_company_id ON quotes(company_id);
CREATE INDEX idx_quotes_status ON quotes(status);
CREATE INDEX idx_quotes_created_at ON quotes(created_at);
CREATE INDEX idx_quote_items_quote_id ON quote_items(quote_id);

-- Helper function för att få användarens primära företag
CREATE OR REPLACE FUNCTION get_user_company_id(user_uuid UUID)
RETURNS UUID AS $$
DECLARE
  company_uuid UUID;
BEGIN
  SELECT company_id INTO company_uuid
  FROM user_companies 
  WHERE user_id = user_uuid 
  AND is_primary = true
  LIMIT 1;
  
  -- Om inget primärt företag, ta det första
  IF company_uuid IS NULL THEN
    SELECT company_id INTO company_uuid
    FROM user_companies 
    WHERE user_id = user_uuid
    LIMIT 1;
  END IF;
  
  RETURN company_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Row Level Security (RLS)
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies för companies
CREATE POLICY "Users can view their companies" ON companies
  FOR SELECT USING (id IN (SELECT company_id FROM user_companies WHERE user_id = auth.uid()));

CREATE POLICY "Users can update their companies" ON companies
  FOR UPDATE USING (id IN (SELECT company_id FROM user_companies WHERE user_id = auth.uid() AND role IN ('admin')));

-- RLS Policies för user_companies
CREATE POLICY "Users can view their own company mappings" ON user_companies
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can manage company mappings" ON user_companies
  FOR ALL USING (company_id IN (SELECT company_id FROM user_companies WHERE user_id = auth.uid() AND role = 'admin'));

-- RLS Policies för products (företagsfiltrerat)
CREATE POLICY "Users can view products from their companies" ON products
  FOR SELECT USING (company_id IN (SELECT company_id FROM user_companies WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert products to their companies" ON products
  FOR INSERT WITH CHECK (company_id IN (SELECT company_id FROM user_companies WHERE user_id = auth.uid()));

CREATE POLICY "Users can update products from their companies" ON products
  FOR UPDATE USING (company_id IN (SELECT company_id FROM user_companies WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete products from their companies" ON products
  FOR DELETE USING (company_id IN (SELECT company_id FROM user_companies WHERE user_id = auth.uid()));

-- RLS Policies för customers (företagsfiltrerat)
CREATE POLICY "Users can view customers from their companies" ON customers
  FOR SELECT USING (company_id IN (SELECT company_id FROM user_companies WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert customers to their companies" ON customers
  FOR INSERT WITH CHECK (company_id IN (SELECT company_id FROM user_companies WHERE user_id = auth.uid()));

CREATE POLICY "Users can update customers from their companies" ON customers
  FOR UPDATE USING (company_id IN (SELECT company_id FROM user_companies WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete customers from their companies" ON customers
  FOR DELETE USING (company_id IN (SELECT company_id FROM user_companies WHERE user_id = auth.uid()));

-- RLS Policies för quotes (användarfiltrerat men inom företaget)
CREATE POLICY "Users can view quotes from their companies" ON quotes
  FOR SELECT USING (company_id IN (SELECT company_id FROM user_companies WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert quotes to their companies" ON quotes
  FOR INSERT WITH CHECK (
    user_id = auth.uid() AND 
    company_id IN (SELECT company_id FROM user_companies WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can update their own quotes" ON quotes
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own quotes" ON quotes
  FOR DELETE USING (user_id = auth.uid());

-- RLS Policies för quote_items
CREATE POLICY "Users can view quote items for accessible quotes" ON quote_items
  FOR SELECT USING (
    quote_id IN (
      SELECT id FROM quotes 
      WHERE company_id IN (SELECT company_id FROM user_companies WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Users can insert quote items for their quotes" ON quote_items
  FOR INSERT WITH CHECK (
    quote_id IN (SELECT id FROM quotes WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can update quote items for their quotes" ON quote_items
  FOR UPDATE USING (
    quote_id IN (SELECT id FROM quotes WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can delete quote items for their quotes" ON quote_items
  FOR DELETE USING (
    quote_id IN (SELECT id FROM quotes WHERE user_id = auth.uid())
  );

-- Triggers för updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_quotes_updated_at BEFORE UPDATE ON quotes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function för att generera offertnummer
CREATE OR REPLACE FUNCTION generate_quote_number(company_uuid UUID)
RETURNS TEXT AS $$
DECLARE
  year_part TEXT;
  next_number INTEGER;
  quote_number TEXT;
BEGIN
  year_part := EXTRACT(year FROM NOW())::TEXT;
  
  SELECT COALESCE(MAX(
    CASE 
      WHEN quote_number ~ ('^' || year_part || '-[0-9]+$') 
      THEN CAST(SPLIT_PART(quote_number, '-', 2) AS INTEGER)
      ELSE 0 
    END
  ), 0) + 1 
  INTO next_number
  FROM quotes 
  WHERE company_id = company_uuid;
  
  quote_number := year_part || '-' || LPAD(next_number::TEXT, 4, '0');
  
  RETURN quote_number;
END;
$$ LANGUAGE plpgsql;
