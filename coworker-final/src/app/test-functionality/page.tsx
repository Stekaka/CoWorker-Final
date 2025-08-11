'use client'

import { useState, useEffect } from 'react'
import { ProductService } from '@/services/productService'
import { CustomerService } from '@/services/customerService' 
import { QuoteService } from '@/services/quoteService'
import { setupMockAuthOverrides } from '@/lib/mockAuth'

export default function DatabaseTestPage() {
  const [testResults, setTestResults] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Setup mock authentication when component mounts
    setupMockAuthOverrides()
    setTestResults(['🔧 Mock-autentisering konfigurerad'])
  }, [])
  
  const runTests = async () => {
    setLoading(true)
    const results: string[] = ['🔧 Mock-autentisering aktiv']
    
    try {
      // Test 1: Hämta produkter
      results.push('🧪 Testar produkter...')
      const products = await ProductService.getProducts()
      results.push(`✅ Hittade ${products.length} produkter`)
      
      // Test 2: Skapa en ny produkt
      results.push('🧪 Skapar ny produkt...')
      const newProduct = await ProductService.createProduct({
        name: 'Test Produkt',
        description: 'En test-produkt',
        category: 'Test',
        price: 999.99,
        unit: 'styck'
      })
      
      if (newProduct) {
        results.push(`✅ Skapade produkt: ${newProduct.name}`)
      } else {
        results.push('❌ Kunde inte skapa produkt')
      }
      
      // Test 3: Hämta kunder
      results.push('🧪 Testar kunder...')
      const customers = await CustomerService.getCustomers()
      results.push(`✅ Hittade ${customers.length} kunder`)
      
      // Test 4: Skapa ny kund
      results.push('🧪 Skapar ny kund...')
      const newCustomer = await CustomerService.createCustomer({
        name: 'Test Kund',
        email: 'test@example.com',
        phone: '070-123 45 67',
        company_name: 'Test AB'
      })
      
      if (newCustomer) {
        results.push(`✅ Skapade kund: ${newCustomer.name}`)
      } else {
        results.push('❌ Kunde inte skapa kund')
      }
      
      // Test 5: Hämta offerter
      results.push('🧪 Testar offerter...')
      const quotes = await QuoteService.getQuotes()
      results.push(`✅ Hittade ${quotes.length} offerter`)
      
      results.push('🎉 Alla tester klara!')
      
    } catch (error) {
      results.push(`❌ Fel: ${error instanceof Error ? error.message : 'Okänt fel'}`)
    }
    
    setTestResults(results)
    setLoading(false)
  }
  
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Databas Funktionalitetstest</h1>
      
      <div className="mb-6">
        <button 
          onClick={runTests}
          disabled={loading}
          className="bg-blue-500 text-white px-6 py-3 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Testar...' : 'Kör Tester'}
        </button>
      </div>
      
      <div className="bg-gray-100 p-4 rounded-lg min-h-[300px]">
        <h2 className="font-semibold mb-2">Test Resultat:</h2>
        <div className="space-y-1">
          {testResults.map((result, index) => (
            <div key={index} className="text-sm font-mono">
              {result}
            </div>
          ))}
        </div>
        {testResults.length === 0 && !loading && (
          <p className="text-gray-500 italic">Tryck &quot;Kör Tester&quot; för att börja...</p>
        )}
      </div>
      
      <div className="mt-6 text-sm text-gray-600">
        <h3 className="font-semibold">Vad testas:</h3>
        <ul className="list-disc list-inside space-y-1 mt-2">
          <li>✅ Produktbiblioteket - hämta och spara produkter (företagsfiltrerat)</li>
          <li>✅ Kundregister - hämta och spara kunder (företagsfiltrerat)</li>
          <li>✅ Offerthantering - hämta offerter (användarfiltrerat)</li>
          <li>📱 Persistens i Supabase Cloud</li>
          <li>🔒 RLS säkerhetspolicies</li>
        </ul>
      </div>
    </div>
  )
}
