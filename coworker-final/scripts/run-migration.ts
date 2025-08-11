import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

const supabaseUrl = 'https://cvtwtslplnowxsrdiwxo.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2dHd0c2xwbG5vd3hzcmRpd3hvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg0MjIwNTQsImV4cCI6MjA1Mzk5ODA1NH0.-9CYxXQEwZUWTlOPd1_PzCyFz_FRi9eMeFOZC9IK4NI'

const supabase = createClient(supabaseUrl, supabaseKey)

async function runMigration() {
  console.log('🚀 Kör säker migration för quotes system...')
  
  try {
    // Läs migration-filen
    const migrationPath = path.join(process.cwd(), 'supabase', 'migrations', '002_quotes_system_safe.sql')
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8')
    
    console.log('📄 Migration-fil laddad, kör SQL...')
    
    // Kör migrationen
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: migrationSQL
    })
    
    if (error) {
      console.error('❌ Fel vid migration:', error)
      return
    }
    
    console.log('✅ Migration slutförd framgångsrikt!')
    console.log('📊 Resultat:', data)
    
    // Testa att tabellerna skapades
    console.log('\n🔍 Testar tabellstrukturen...')
    
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .in('table_name', ['companies', 'products', 'customers', 'quotes', 'quote_items'])
    
    if (tablesError) {
      console.error('❌ Fel vid hämtning av tabeller:', tablesError)
      return
    }
    
    console.log('📋 Skapade tabeller:', tables?.map(t => t.table_name))
    
  } catch (error) {
    console.error('💥 Oväntat fel:', error)
  }
}

// Alternativ metod - använd rpc för att köra SQL direkt
async function checkAndCreateTables() {
  console.log('🔍 Kollar befintlig databasstruktur...')
  
  try {
    // Kolla vilka tabeller som finns
    const { data, error } = await supabase.rpc('check_tables')
    
    if (error) {
      console.log('⚠️  RPC funktion finns inte, skapar tabeller manuellt...')
      await createTablesManually()
    } else {
      console.log('📋 Befintliga tabeller:', data)
    }
    
  } catch (error) {
    console.error('❌ Fel:', error)
    console.log('🔄 Försöker med manuell approach...')
    await createTablesManually()
  }
}

async function createTablesManually() {
  console.log('🛠️  Skapar tabeller manuellt...')
  
  // Börja med companies tabellen
  try {
    const { data: existingCompanies, error: checkError } = await supabase
      .from('companies')
      .select('count(*)')
      .limit(1)
    
    if (checkError && checkError.code === '42P01') {
      console.log('📦 Skapar companies tabell...')
      
      const createCompaniesSQL = `
        CREATE TABLE IF NOT EXISTS companies (
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
      `
      
      const { error: createError } = await supabase.rpc('exec_sql', {
        sql: createCompaniesSQL
      })
      
      if (createError) {
        console.error('❌ Fel vid skapande av companies:', createError)
      } else {
        console.log('✅ Companies tabell skapad!')
      }
    } else {
      console.log('✅ Companies tabell finns redan')
    }
    
  } catch (error) {
    console.error('❌ Fel vid companies check:', error)
  }
}

// Kör migration
if (require.main === module) {
  checkAndCreateTables()
}

export { runMigration, checkAndCreateTables }
