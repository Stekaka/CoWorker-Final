'use client'

import { supabase } from '@/lib/supabase'

export default function DatabaseTestPage() {
  const testTables = async () => {
    console.log('🔍 Testar databas...')
    
    try {
      // Testa companies tabellen
      const { data: companies, error: companiesError } = await supabase
        .from('companies')
        .select('count(*)')
        .limit(1)
      
      console.log('Companies test:', { data: companies, error: companiesError })
      
      // Testa products tabellen
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('count(*)')
        .limit(1)
      
      console.log('Products test:', { data: products, error: productsError })
      
    } catch (error) {
      console.error('Database test error:', error)
    }
  }
  
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Database Test</h1>
      <button 
        onClick={testTables}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Test Database Tables
      </button>
      <div className="mt-4 text-sm text-gray-600">
        Öppna Developer Console (F12) för att se test-resultat
      </div>
    </div>
  )
}
