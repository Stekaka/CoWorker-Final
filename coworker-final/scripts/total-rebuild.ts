import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://zgdakjulguivtdogqskl.supabase.co'
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpnZGFranVsZ3VpdnRkb2dxc2tsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDY0NDE1OSwiZXhwIjoyMDcwMjIwMTU5fQ.fFbHizqutUfenHkgPUODO_JFCQhbFPv2cLqc50hJLrA'

// Skapa admin client med service role
const supabase = createClient(supabaseUrl, serviceRoleKey)

async function totalWipeAndRebuild() {
  console.log('🔥 STARTAR TOTAL WIPE OCH REBUILD AV COWORKERFINAL DATABAS...')
  
  try {
    console.log('🗑️  Wipar alla befintliga tabeller...')
    
    // WIPE ALLT
    const wipeSQL = `
      -- TA BORT ALLT SOM FINNS
      DROP TABLE IF EXISTS public.user_profiles CASCADE;
      DROP TABLE IF EXISTS public.companies CASCADE;
      DROP TABLE IF EXISTS public.products CASCADE;
      DROP TABLE IF EXISTS public.customers CASCADE;
      DROP TABLE IF EXISTS public.quotes CASCADE;
      DROP TABLE IF EXISTS public.quote_items CASCADE;
      DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
      DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
    `
    
    const { error: wipeError } = await supabase.rpc('exec_sql', { sql: wipeSQL })
    if (wipeError && !wipeError.message.includes('does not exist')) {
      console.error('❌ Wipe error:', wipeError)
    } else {
      console.log('✅ Wipe klar!')
    }

    console.log('🏗️  Bygger nya tabeller...')
    
    // BYGG NYA TABELLER
    const buildSQL = `
      -- SKAPA USER_PROFILES TABELL
      CREATE TABLE public.user_profiles (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
          full_name TEXT,
          company_name TEXT,
          avatar_url TEXT,
          plan_type TEXT DEFAULT 'starter',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- AKTIVERA RLS
      ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

      -- SKAPA RLS POLICIES
      CREATE POLICY "Users can view own profile" 
      ON public.user_profiles FOR SELECT 
      USING (auth.uid() = user_id);

      CREATE POLICY "Users can update own profile" 
      ON public.user_profiles FOR UPDATE 
      USING (auth.uid() = user_id);

      CREATE POLICY "Users can insert own profile" 
      ON public.user_profiles FOR INSERT 
      WITH CHECK (auth.uid() = user_id);
    `
    
    const { error: buildError } = await supabase.rpc('exec_sql', { sql: buildSQL })
    if (buildError) {
      console.error('❌ Build error:', buildError)
      return
    }
    
    console.log('✅ user_profiles tabell skapad!')

    console.log('🔧 Skapar trigger för automatisk profil...')
    
    // SKAPA TRIGGER
    const triggerSQL = `
      -- SKAPA AUTOMATISK PROFIL-TRIGGER
      CREATE OR REPLACE FUNCTION public.handle_new_user()
      RETURNS trigger
      LANGUAGE plpgsql
      SECURITY DEFINER
      AS $$
      BEGIN
          INSERT INTO public.user_profiles (user_id, full_name, company_name)
          VALUES (
              NEW.id,
              COALESCE(NEW.raw_user_meta_data->>'full_name', 'New User'),
              COALESCE(NEW.raw_user_meta_data->>'company_name', 'New Company')
          );
          RETURN NEW;
      EXCEPTION
          WHEN others THEN
              -- Log error men fail inte user creation
              RAISE LOG 'Error creating user profile: %', SQLERRM;
              RETURN NEW;
      END;
      $$;

      -- SKAPA TRIGGER
      CREATE TRIGGER on_auth_user_created
          AFTER INSERT ON auth.users
          FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
    `
    
    const { error: triggerError } = await supabase.rpc('exec_sql', { sql: triggerSQL })
    if (triggerError) {
      console.error('❌ Trigger error:', triggerError)
      return
    }
    
    console.log('✅ Trigger skapad!')

    console.log('📊 Skapar CRM tabeller...')
    
    // SKAPA CRM TABELLER
    const crmSQL = `
      -- COMPANIES TABELL
      CREATE TABLE public.companies (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
          name TEXT NOT NULL,
          org_number TEXT,
          email TEXT,
          phone TEXT,
          address TEXT,
          city TEXT,
          postal_code TEXT,
          website TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
      CREATE POLICY "Users can manage own companies" ON public.companies FOR ALL USING (auth.uid() = user_id);

      -- PRODUCTS TABELL
      CREATE TABLE public.products (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
          name TEXT NOT NULL,
          description TEXT,
          price DECIMAL(10,2),
          category TEXT,
          unit TEXT DEFAULT 'st',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
      CREATE POLICY "Users can manage own products" ON public.products FOR ALL USING (auth.uid() = user_id);

      -- CUSTOMERS TABELL
      CREATE TABLE public.customers (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
          name TEXT NOT NULL,
          email TEXT,
          phone TEXT,
          address TEXT,
          city TEXT,
          postal_code TEXT,
          company_name TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
      CREATE POLICY "Users can manage own customers" ON public.customers FOR ALL USING (auth.uid() = user_id);
    `
    
    const { error: crmError } = await supabase.rpc('exec_sql', { sql: crmSQL })
    if (crmError) {
      console.error('❌ CRM tables error:', crmError)
      return
    }
    
    console.log('✅ CRM tabeller skapade!')

    console.log('💰 Skapar quotes tabeller...')
    
    // QUOTES TABELLER
    const quotesSQL = `
      -- QUOTES TABELL
      CREATE TABLE public.quotes (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
          customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
          quote_number TEXT UNIQUE NOT NULL,
          title TEXT,
          description TEXT,
          status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'accepted', 'rejected')),
          total_amount DECIMAL(10,2) DEFAULT 0,
          valid_until DATE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
      CREATE POLICY "Users can manage own quotes" ON public.quotes FOR ALL USING (auth.uid() = user_id);

      -- QUOTE_ITEMS TABELL
      CREATE TABLE public.quote_items (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          quote_id UUID REFERENCES public.quotes(id) ON DELETE CASCADE,
          product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
          name TEXT NOT NULL,
          description TEXT,
          quantity INTEGER DEFAULT 1,
          unit_price DECIMAL(10,2),
          total_price DECIMAL(10,2),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      ALTER TABLE public.quote_items ENABLE ROW LEVEL SECURITY;
      CREATE POLICY "Users can manage own quote items" ON public.quote_items FOR ALL USING (
          EXISTS (
              SELECT 1 FROM public.quotes 
              WHERE quotes.id = quote_items.quote_id 
              AND quotes.user_id = auth.uid()
          )
      );
    `
    
    const { error: quotesError } = await supabase.rpc('exec_sql', { sql: quotesSQL })
    if (quotesError) {
      console.error('❌ Quotes tables error:', quotesError)
      return
    }
    
    console.log('✅ Quotes tabeller skapade!')

    // TESTA STRUKTUR
    console.log('🔍 Testar databasstruktur...')
    const { data: tables, error: testError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .order('table_name')
    
    if (testError) {
      console.error('❌ Test error:', testError)
    } else {
      console.log('📋 Skapade tabeller:', tables?.map(t => t.table_name))
    }

    console.log('🎉 TOTAL REBUILD KLAR! Databasen är redo för CoWorker!')
    
  } catch (error) {
    console.error('💥 Oväntat fel:', error)
  }
}

// Kör rebuild
totalWipeAndRebuild()
