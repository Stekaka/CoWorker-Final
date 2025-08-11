import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Ladda miljövariabler från .env.local
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function testConnection() {
  console.log('🔌 Testar anslutning till Supabase...')
  
  try {
    const { data, error } = await supabase
      .from('auth.users')
      .select('count(*)')
      .limit(1)
    
    if (error) {
      console.log('⚠️  Auth.users inte tillgänglig via RLS, testar annat...')
      
      // Prova något som säkert finns
      const { data: healthCheck, error: healthError } = await supabase
        .rpc('version')
      
      if (healthError) {
        console.error('❌ Anslutningsfel:', healthError)
        return false
      } else {
        console.log('✅ Anslutning OK! Databas version:', healthCheck)
        return true
      }
    } else {
      console.log('✅ Anslutning OK!')
      return true
    }
  } catch (error) {
    console.error('💥 Anslutningsfel:', error)
    return false
  }
}

async function checkTables() {
  console.log('🔍 Kollar vilka tabeller som finns...')
  
  const tablesToCheck = ['companies', 'products', 'customers', 'quotes', 'quote_items']
  
  for (const table of tablesToCheck) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('count(*)')
        .limit(1)
      
      if (error) {
        if (error.code === '42P01') {
          console.log(`❌ Tabell '${table}' finns INTE`)
        } else {
          console.log(`⚠️  Tabell '${table}': ${error.message}`)
        }
      } else {
        console.log(`✅ Tabell '${table}' finns`)
      }
    } catch (err) {
      console.log(`❌ Fel vid kontroll av '${table}':`, err)
    }
  }
}

async function createTestCompany() {
  console.log('🏢 Försöker skapa test-företag...')
  
  try {
    const { data, error } = await supabase
      .from('companies')
      .insert({
        name: 'Test Företag AB',
        org_number: '556123-4567',
        email: 'info@testforetag.se'
      })
      .select()
    
    if (error) {
      console.error('❌ Fel vid skapande av test-företag:', error)
      return null
    } else {
      console.log('✅ Test-företag skapat:', data)
      return data[0]
    }
  } catch (error) {
    console.error('💥 Oväntat fel vid test-företag:', error)
    return null
  }
}

async function main() {
  console.log('🚀 Startar databas-setup och test...\n')
  
  // 1. Testa anslutning
  const connected = await testConnection()
  if (!connected) {
    console.log('❌ Kan inte ansluta till databasen. Kontrollera miljövariabler.')
    return
  }
  
  console.log('')
  
  // 2. Kolla tabeller
  await checkTables()
  
  console.log('')
  
  // 3. Försök skapa test-data
  await createTestCompany()
  
  console.log('\n✅ Test slutfört!')
}

if (require.main === module) {
  main().catch(console.error)
}
