import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://zgdakjulguivtdogqskl.supabase.co'
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpnZGFranVsZ3VpdnRkb2dxc2tsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDY0NDE1OSwiZXhwIjoyMDcwMjIwMTU5fQ.fFbHizqutUfenHkgPUODO_JFCQhbFPv2cLqc50hJLrA'

// Skapa admin client med service role
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function simpleRebuild() {
  console.log('🔥 STARTAR ENKEL REBUILD AV COWORKERFINAL...')
  
  try {
    // Testa connection först
    console.log('🔌 Testar anslutning...')
    const { data: testData, error: testError } = await supabase.auth.admin.listUsers()
    
    if (testError) {
      console.error('❌ Anslutningsfel:', testError)
      return
    }
    
    console.log('✅ Anslutning OK! Användare i auth:', testData.users.length)

    // Nu skapar vi user_profiles tabellen med raw SQL via REST API
    console.log('🏗️  Skapar user_profiles tabell...')
    
    const createTableSQL = `
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID UNIQUE,
    full_name TEXT,
    company_name TEXT,
    avatar_url TEXT,
    plan_type TEXT DEFAULT 'starter',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Users can view own profile" 
ON public.user_profiles FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can update own profile" 
ON public.user_profiles FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can insert own profile" 
ON public.user_profiles FOR INSERT 
WITH CHECK (auth.uid() = user_id);
`

    // Använd fetch direkt till Supabase
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${serviceRoleKey}`,
        'apikey': serviceRoleKey
      },
      body: JSON.stringify({
        sql: createTableSQL
      })
    })

    console.log('📡 SQL Response status:', response.status)
    const responseText = await response.text()
    console.log('📄 SQL Response:', responseText)

    if (!response.ok) {
      console.log('⚠️  Direkt SQL fungerade inte, testar via postgrest...')
      
      // Fallback - försök skapa en enkel tabell med Supabase client
      console.log('🔧 Skapar via Supabase client...')
      
      // Först, testa om tabellen redan finns
      const { data: existingData, error: checkError } = await supabase
        .from('user_profiles')
        .select('count(*)')
        .limit(1)
      
      if (checkError && checkError.code === '42P01') {
        console.log('🆕 user_profiles tabellen finns inte, måste skapas manuellt')
        console.log('📋 Gå till Supabase Dashboard och kör SQL manuellt')
        return
      } else if (checkError) {
        console.error('❌ Andra fel:', checkError)
        return
      } else {
        console.log('✅ user_profiles tabellen finns redan!')
      }
    }

    // Testa trigger genom att skapa en testanvändare
    console.log('🧪 Testar användarregistrering...')
    
    const testEmail = `test${Date.now()}@example.com`
    const { data: newUser, error: userError } = await supabase.auth.admin.createUser({
      email: testEmail,
      password: 'password123',
      email_confirm: true,
      user_metadata: {
        full_name: 'Test User',
        company_name: 'Test Company'
      }
    })

    if (userError) {
      console.error('❌ Fel vid skapande av testanvändare:', userError)
      return
    }

    console.log('✅ Testanvändare skapad:', newUser.user.id)

    // Vänta lite och kolla om profil skapades
    setTimeout(async () => {
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', newUser.user.id)
        .single()

      if (profileError) {
        console.error('❌ Profil skapades inte automatiskt:', profileError)
        console.log('🔧 Trigger saknas - måste skapas manuellt')
      } else {
        console.log('🎉 FRAMGÅNG! Profil skapades automatiskt:', profile)
      }

      // Cleanup - ta bort testanvändaren
      await supabase.auth.admin.deleteUser(newUser.user.id)
      console.log('🧹 Testanvändare borttagen')
    }, 2000)

  } catch (error) {
    console.error('💥 Oväntat fel:', error)
  }
}

simpleRebuild()
