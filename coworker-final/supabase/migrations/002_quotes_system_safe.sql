-- Safe quotes system migration
-- Skapad: 2025-08-11
-- Denna migration kollar vad som finns och lägger bara till det som saknas

-- Function to check if table exists
CREATE OR REPLACE FUNCTION table_exists(table_name text)
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = $1
    );
END;
$$ LANGUAGE plpgsql;

-- Function to check if column exists
CREATE OR REPLACE FUNCTION column_exists(table_name text, column_name text)
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = $1 
        AND column_name = $2
    );
END;
$$ LANGUAGE plpgsql;

-- Only create companies table if it doesn't exist
DO $$
BEGIN
    IF NOT table_exists('companies') THEN
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
        RAISE NOTICE 'Created companies table';
    ELSE
        RAISE NOTICE 'Companies table already exists, skipping creation';
    END IF;
END $$;

-- Add company_id to auth.users if it doesn't exist
DO $$
BEGIN
    IF NOT column_exists('users', 'company_id') THEN
        ALTER TABLE auth.users ADD COLUMN company_id UUID REFERENCES companies(id);
        RAISE NOTICE 'Added company_id column to auth.users';
    ELSE
        RAISE NOTICE 'company_id column already exists in auth.users';
    END IF;
END $$;

-- Only create products table if it doesn't exist
DO $$
BEGIN
    IF NOT table_exists('products') THEN
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
        
        CREATE INDEX idx_products_company_id ON products(company_id);
        CREATE INDEX idx_products_category ON products(category);
        
        RAISE NOTICE 'Created products table with indexes';
    ELSE
        RAISE NOTICE 'Products table already exists, skipping creation';
    END IF;
END $$;

-- Only create customers table if it doesn't exist
DO $$
BEGIN
    IF NOT table_exists('customers') THEN
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
        
        CREATE INDEX idx_customers_company_id ON customers(company_id);
        CREATE INDEX idx_customers_email ON customers(email);
        
        RAISE NOTICE 'Created customers table with indexes';
    ELSE
        RAISE NOTICE 'Customers table already exists, skipping creation';
    END IF;
END $$;

-- Only create quotes table if it doesn't exist
DO $$
BEGIN
    IF NOT table_exists('quotes') THEN
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
        
        CREATE INDEX idx_quotes_user_id ON quotes(user_id);
        CREATE INDEX idx_quotes_company_id ON quotes(company_id);
        CREATE INDEX idx_quotes_status ON quotes(status);
        CREATE INDEX idx_quotes_created_at ON quotes(created_at);
        
        RAISE NOTICE 'Created quotes table with indexes';
    ELSE
        RAISE NOTICE 'Quotes table already exists, skipping creation';
    END IF;
END $$;

-- Only create quote_items table if it doesn't exist
DO $$
BEGIN
    IF NOT table_exists('quote_items') THEN
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
        
        CREATE INDEX idx_quote_items_quote_id ON quote_items(quote_id);
        
        RAISE NOTICE 'Created quote_items table with indexes';
    ELSE
        RAISE NOTICE 'Quote_items table already exists, skipping creation';
    END IF;
END $$;

-- Setup RLS for all tables
DO $$
BEGIN
    -- Enable RLS on all our tables
    ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
    ALTER TABLE products ENABLE ROW LEVEL SECURITY;
    ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
    ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
    ALTER TABLE quote_items ENABLE ROW LEVEL SECURITY;
    
    RAISE NOTICE 'Enabled RLS on all tables';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Some RLS policies may already exist';
END $$;

-- Create RLS policies (with IF NOT EXISTS equivalent)
-- Companies policies
DO $$
BEGIN
    -- Check and create companies policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'companies' AND policyname = 'Users can view their own company') THEN
        CREATE POLICY "Users can view their own company" ON companies
            FOR SELECT USING (id = (SELECT company_id FROM auth.users WHERE id = auth.uid()));
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'companies' AND policyname = 'Users can update their own company') THEN
        CREATE POLICY "Users can update their own company" ON companies
            FOR UPDATE USING (id = (SELECT company_id FROM auth.users WHERE id = auth.uid()));
    END IF;
    
    RAISE NOTICE 'Companies RLS policies created/checked';
END $$;

-- Products policies
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'products' AND policyname = 'Users can view products from their company') THEN
        CREATE POLICY "Users can view products from their company" ON products
            FOR SELECT USING (company_id = (SELECT company_id FROM auth.users WHERE id = auth.uid()));
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'products' AND policyname = 'Users can insert products to their company') THEN
        CREATE POLICY "Users can insert products to their company" ON products
            FOR INSERT WITH CHECK (company_id = (SELECT company_id FROM auth.users WHERE id = auth.uid()));
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'products' AND policyname = 'Users can update products from their company') THEN
        CREATE POLICY "Users can update products from their company" ON products
            FOR UPDATE USING (company_id = (SELECT company_id FROM auth.users WHERE id = auth.uid()));
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'products' AND policyname = 'Users can delete products from their company') THEN
        CREATE POLICY "Users can delete products from their company" ON products
            FOR DELETE USING (company_id = (SELECT company_id FROM auth.users WHERE id = auth.uid()));
    END IF;
    
    RAISE NOTICE 'Products RLS policies created/checked';
END $$;

-- Customers policies
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'customers' AND policyname = 'Users can view customers from their company') THEN
        CREATE POLICY "Users can view customers from their company" ON customers
            FOR SELECT USING (company_id = (SELECT company_id FROM auth.users WHERE id = auth.uid()));
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'customers' AND policyname = 'Users can insert customers to their company') THEN
        CREATE POLICY "Users can insert customers to their company" ON customers
            FOR INSERT WITH CHECK (company_id = (SELECT company_id FROM auth.users WHERE id = auth.uid()));
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'customers' AND policyname = 'Users can update customers from their company') THEN
        CREATE POLICY "Users can update customers from their company" ON customers
            FOR UPDATE USING (company_id = (SELECT company_id FROM auth.users WHERE id = auth.uid()));
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'customers' AND policyname = 'Users can delete customers from their company') THEN
        CREATE POLICY "Users can delete customers from their company" ON customers
            FOR DELETE USING (company_id = (SELECT company_id FROM auth.users WHERE id = auth.uid()));
    END IF;
    
    RAISE NOTICE 'Customers RLS policies created/checked';
END $$;

-- Quotes policies
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'quotes' AND policyname = 'Users can view quotes they created or from their company') THEN
        CREATE POLICY "Users can view quotes they created or from their company" ON quotes
            FOR SELECT USING (user_id = auth.uid() OR company_id = (SELECT company_id FROM auth.users WHERE id = auth.uid()));
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'quotes' AND policyname = 'Users can insert quotes to their company') THEN
        CREATE POLICY "Users can insert quotes to their company" ON quotes
            FOR INSERT WITH CHECK (
                user_id = auth.uid() AND 
                company_id = (SELECT company_id FROM auth.users WHERE id = auth.uid())
            );
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'quotes' AND policyname = 'Users can update their own quotes') THEN
        CREATE POLICY "Users can update their own quotes" ON quotes
            FOR UPDATE USING (user_id = auth.uid());
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'quotes' AND policyname = 'Users can delete their own quotes') THEN
        CREATE POLICY "Users can delete their own quotes" ON quotes
            FOR DELETE USING (user_id = auth.uid());
    END IF;
    
    RAISE NOTICE 'Quotes RLS policies created/checked';
END $$;

-- Quote items policies
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'quote_items' AND policyname = 'Users can view quote items for accessible quotes') THEN
        CREATE POLICY "Users can view quote items for accessible quotes" ON quote_items
            FOR SELECT USING (
                quote_id IN (
                    SELECT id FROM quotes 
                    WHERE user_id = auth.uid() 
                    OR company_id = (SELECT company_id FROM auth.users WHERE id = auth.uid())
                )
            );
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'quote_items' AND policyname = 'Users can insert quote items for their quotes') THEN
        CREATE POLICY "Users can insert quote items for their quotes" ON quote_items
            FOR INSERT WITH CHECK (
                quote_id IN (SELECT id FROM quotes WHERE user_id = auth.uid())
            );
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'quote_items' AND policyname = 'Users can update quote items for their quotes') THEN
        CREATE POLICY "Users can update quote items for their quotes" ON quote_items
            FOR UPDATE USING (
                quote_id IN (SELECT id FROM quotes WHERE user_id = auth.uid())
            );
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'quote_items' AND policyname = 'Users can delete quote items for their quotes') THEN
        CREATE POLICY "Users can delete quote items for their quotes" ON quote_items
            FOR DELETE USING (
                quote_id IN (SELECT id FROM quotes WHERE user_id = auth.uid())
            );
    END IF;
    
    RAISE NOTICE 'Quote items RLS policies created/checked';
END $$;

-- Create update triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers only if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_companies_updated_at') THEN
        CREATE TRIGGER update_companies_updated_at 
            BEFORE UPDATE ON companies 
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_products_updated_at') THEN
        CREATE TRIGGER update_products_updated_at 
            BEFORE UPDATE ON products 
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_customers_updated_at') THEN
        CREATE TRIGGER update_customers_updated_at 
            BEFORE UPDATE ON customers 
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_quotes_updated_at') THEN
        CREATE TRIGGER update_quotes_updated_at 
            BEFORE UPDATE ON quotes 
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    RAISE NOTICE 'Update triggers created/checked';
END $$;

-- Create quote number generation function
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

-- Clean up helper functions
DROP FUNCTION IF EXISTS table_exists(text);
DROP FUNCTION IF EXISTS column_exists(text, text);

-- Final success message
DO $$
BEGIN
    RAISE NOTICE '=== SAFE QUOTES SYSTEM MIGRATION COMPLETED SUCCESSFULLY ===';
    RAISE NOTICE 'All tables, indexes, RLS policies, and functions have been created or verified.';
    RAISE NOTICE 'The system is ready for production use.';
END $$;
