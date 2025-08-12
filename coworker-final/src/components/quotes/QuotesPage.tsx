'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Plus, Search, FileText, Send, Download, Eye, Edit, Package, DollarSign, CheckCircle, Clock, AlertCircle } from 'lucide-react'
import { useAppearance } from '../../contexts/AppearanceContext'
import { GlassCard, GlassButton } from '../ui/glass'
import CreateQuote from './CreateQuote'
import ProductLibrary from './ProductLibrary'
import QuoteViewer, { type Quote, type QuoteItem, type Product } from './QuoteViewer'
import { ProductService } from '@/services/productService'
import { QuoteService, type QuoteWithItems } from '@/services/quoteService'
import type { Database } from '@/types/database'

// Types are re-exported from QuoteViewer to keep a single source of truth

const QuotesPage: React.FC = () => {
  const { getCurrentTheme } = useAppearance()
  const currentTheme = getCurrentTheme()
  const isDark = currentTheme === 'dark'

  const [quotes, setQuotes] = useState<Quote[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [showCreateQuote, setShowCreateQuote] = useState(false)
  const [showProductLibrary, setShowProductLibrary] = useState(false)
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null)

  // helper types for quotes mapping
  type DbCustomer = Database['public']['Tables']['customers']['Row']
  type DbQuoteItem = Database['public']['Tables']['quote_items']['Row']

  // helper: map DB quote to UI quote
  const mapDbQuoteToUi = useCallback((q: QuoteWithItems): Quote => {
    const customer = q.customer as unknown as DbCustomer | undefined
    const items = (q.items || []).map((it: DbQuoteItem) => {
      const fallbackProduct: Product = {
        id: it.product_id || 'custom',
        name: it.description,
        description: it.description,
        price: it.unit_price,
        unit: 'styck',
        category: ''
      }
      return {
        id: it.id,
        productId: it.product_id,
        product: fallbackProduct,
        quantity: it.quantity,
        discount: it.discount_percent || 0,
        total: it.total,
      } as QuoteItem
    })

    return {
      id: q.id,
      quoteNumber: q.quote_number,
  customer: customer ? {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone || '',
        company: customer.company_name || '',
        address: customer.address || '',
        city: customer.city || '',
        postalCode: customer.postal_code || ''
      } : {
        id: '', name: '', email: '', phone: '', company: '', address: '', city: '', postalCode: ''
      },
      items,
      subtotal: q.subtotal,
      tax: q.tax_amount,
      taxRate: q.tax_rate ?? 25,
      discount: q.global_discount || 0,
      total: q.total_amount,
      validUntil: q.valid_until || new Date().toISOString(),
      status: q.status,
      createdAt: q.created_at,
      sentAt: q.sent_at || undefined,
      viewedAt: q.viewed_at || undefined,
      notes: q.notes || ''
    }
  }, [])

  const loadProducts = useCallback(async () => {
    const uiProducts = await ProductService.getProducts()
    setProducts(uiProducts)
  }, [])

  const loadQuotes = useCallback(async () => {
    const dbQuotes = await QuoteService.getQuotes()
    setQuotes(dbQuotes.map(mapDbQuoteToUi))
  }, [mapDbQuoteToUi])

  useEffect(() => {
    // load initial data
    loadProducts()
    loadQuotes()
  }, [loadProducts, loadQuotes])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'text-gray-500'
      case 'sent': return 'text-blue-500'
      case 'viewed': return 'text-yellow-500'
      case 'accepted': return 'text-green-500'
      case 'rejected': return 'text-red-500'
      case 'expired': return 'text-gray-400'
      default: return 'text-gray-500'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft': return <Edit className="w-4 h-4" />
      case 'sent': return <Send className="w-4 h-4" />
      case 'viewed': return <Eye className="w-4 h-4" />
      case 'accepted': return <CheckCircle className="w-4 h-4" />
      case 'rejected': return <AlertCircle className="w-4 h-4" />
      case 'expired': return <Clock className="w-4 h-4" />
      default: return <FileText className="w-4 h-4" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'draft': return 'Utkast'
      case 'sent': return 'Skickad'
      case 'viewed': return 'Öppnad'
      case 'accepted': return 'Accepterad'
      case 'rejected': return 'Avvisad'
      case 'expired': return 'Utgången'
      default: return status
    }
  }

  const handleDownloadPDF = (quote: Quote) => {
    // Här skulle vi implementera PDF-generering
    console.log('Downloading PDF for quote:', quote.quoteNumber)
    // Du kan använda bibliotek som jsPDF eller react-pdf för att generera PDF
    alert(`PDF för ${quote.quoteNumber} skulle laddas ner här. Implementation kommer snart!`)
  }

  const handleSendQuote = async (quote: Quote) => {
    try {
      const updated = await QuoteService.markQuoteAsSent(quote.id)
      if (updated) {
        await loadQuotes()
        alert(`Offert ${quote.quoteNumber} markerad som skickad.`)
      }
    } catch (e) {
      console.error(e)
      alert('Kunde inte markera offert som skickad.')
    }
  }

  const filteredQuotes = quotes.filter(quote => {
    const matchesSearch = quote.quoteNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quote.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quote.customer.company.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = selectedStatus === 'all' || quote.status === selectedStatus
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Offerter
          </h1>
          <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
            Skapa professionella offerter och hantera ditt produktbibliotek
          </p>
        </div>
        
        <div className="flex gap-3">
          <GlassButton 
            onClick={() => setShowProductLibrary(true)}
            className="flex items-center gap-2"
          >
            <Package className="w-4 h-4" />
            Produktbibliotek
          </GlassButton>
          <GlassButton 
            onClick={() => setShowCreateQuote(true)}
            className="flex items-center gap-2 bg-blue-600/20 border-blue-500/30 text-blue-300 hover:bg-blue-600/30"
          >
            <Plus className="w-4 h-4" />
            Ny Offert
          </GlassButton>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <GlassCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Totala offerter</p>
              <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {quotes.length}
              </p>
            </div>
            <FileText className={`w-8 h-8 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
          </div>
        </GlassCard>
        
        <GlassCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Offert värde</p>
              <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {quotes.reduce((sum, quote) => sum + quote.total, 0).toLocaleString('sv-SE')} kr
              </p>
            </div>
            <DollarSign className={`w-8 h-8 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
          </div>
        </GlassCard>
        
        <GlassCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Accepterade</p>
              <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {quotes.filter(q => q.status === 'accepted').length}
              </p>
            </div>
            <CheckCircle className={`w-8 h-8 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
          </div>
        </GlassCard>
        
        <GlassCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Väntande svar</p>
              <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {quotes.filter(q => q.status === 'sent' || q.status === 'viewed').length}
              </p>
            </div>
            <Clock className={`w-8 h-8 ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`} />
          </div>
        </GlassCard>
      </div>

      {/* Search and Filter */}
      <GlassCard className="p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <input
              type="text"
              placeholder="Sök offerter, kunder eller företag..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 border rounded-xl focus:outline-none focus:ring-1 backdrop-blur-xl transition-all ${
                isDark 
                  ? 'bg-white/[0.08] border-white/[0.15] text-white placeholder-gray-400 focus:ring-white/[0.15] focus:border-white/[0.15]' 
                  : 'bg-gray-50/80 border-gray-200/60 text-gray-900 placeholder-gray-500 focus:ring-blue-500/50 focus:border-blue-500/50'
              }`}
            />
          </div>
          
          <div className="flex gap-2">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className={`px-4 py-2 border rounded-xl focus:outline-none focus:ring-1 backdrop-blur-xl transition-all relative z-50 ${
                isDark 
                  ? 'bg-white/[0.08] border-white/[0.15] text-white focus:ring-white/[0.15] focus:border-white/[0.15]' 
                  : 'bg-gray-50/80 border-gray-200/60 text-gray-900 focus:ring-blue-500/50 focus:border-blue-500/50'
              }`}
            >
              <option value="all">Alla status</option>
              <option value="draft">Utkast</option>
              <option value="sent">Skickad</option>
              <option value="viewed">Öppnad</option>
              <option value="accepted">Accepterad</option>
              <option value="rejected">Avvisad</option>
              <option value="expired">Utgången</option>
            </select>
          </div>
        </div>
      </GlassCard>

      {/* Quotes List */}
      <GlassCard className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={`border-b ${isDark ? 'border-white/[0.05]' : 'border-gray-200/60'}`}>
                <th className={`text-left py-4 px-6 font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Offertnummer
                </th>
                <th className={`text-left py-4 px-6 font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Kund
                </th>
                <th className={`text-left py-4 px-6 font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Belopp
                </th>
                <th className={`text-left py-4 px-6 font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Status
                </th>
                <th className={`text-left py-4 px-6 font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Giltig till
                </th>
                <th className={`text-left py-4 px-6 font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Åtgärder
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredQuotes.map((quote) => (
                <motion.tr
                  key={quote.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`border-b ${isDark ? 'border-white/[0.05] hover:bg-white/[0.02]' : 'border-gray-200/60 hover:bg-gray-50/50'} transition-colors cursor-pointer`}
                  onClick={() => setSelectedQuote(quote)}
                >
                  <td className={`py-4 px-6 ${isDark ? 'text-white' : 'text-gray-900'} font-medium`}>
                    {quote.quoteNumber}
                  </td>
                  <td className="py-4 px-6">
                    <div>
                      <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {quote.customer.name}
                      </p>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {quote.customer.company}
                      </p>
                    </div>
                  </td>
                  <td className={`py-4 px-6 ${isDark ? 'text-white' : 'text-gray-900'} font-medium`}>
                    {quote.total.toLocaleString('sv-SE')} kr
                  </td>
                  <td className="py-4 px-6">
                    <div className={`flex items-center gap-2 ${getStatusColor(quote.status)}`}>
                      {getStatusIcon(quote.status)}
                      <span className="text-sm font-medium">
                        {getStatusText(quote.status)}
                      </span>
                    </div>
                  </td>
                  <td className={`py-4 px-6 text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {new Date(quote.validUntil).toLocaleDateString('sv-SE')}
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedQuote(quote)
                        }}
                        title="Visa offert"
                        className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-white/[0.05]' : 'hover:bg-gray-100'}`}
                      >
                        <Edit className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDownloadPDF(quote)
                        }}
                        title="Ladda ner PDF"
                        className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-white/[0.05]' : 'hover:bg-gray-100'}`}
                      >
                        <Download className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation()
                          handleSendQuote(quote)
                        }}
                        title="Skicka offert"
                        className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-white/[0.05]' : 'hover:bg-gray-100'}`}
                      >
                        <Send className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {filteredQuotes.length === 0 && (
        <GlassCard className="p-12 text-center">
          <FileText className={`w-12 h-12 mx-auto mb-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
          <h3 className={`text-lg font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Inga offerter hittades
          </h3>
          <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} mb-6`}>
            {searchTerm || selectedStatus !== 'all' 
              ? 'Prova att ändra dina sökkriterier'
              : 'Kom igång genom att skapa din första offert'
            }
          </p>
          {!searchTerm && selectedStatus === 'all' && (
            <GlassButton 
              onClick={() => setShowCreateQuote(true)}
              className="flex items-center gap-2 bg-blue-600/20 border-blue-500/30 text-blue-300 hover:bg-blue-600/30"
            >
              <Plus className="w-4 h-4" />
              Skapa första offerten
            </GlassButton>
          )}
        </GlassCard>
      )}

      {/* Create Quote Modal */}
      <CreateQuote
        isOpen={showCreateQuote}
        onClose={() => setShowCreateQuote(false)}
        products={products}
        customers={[]}
        onQuoteCreated={async () => {
          await loadQuotes()
          setShowCreateQuote(false)
        }}
      />

      {/* Product Library Modal */}
      <ProductLibrary
        isOpen={showProductLibrary}
        onClose={() => setShowProductLibrary(false)}
      />

      {/* Quote Viewer Modal */}
      <QuoteViewer
        quote={selectedQuote}
        isOpen={selectedQuote !== null}
        onClose={() => setSelectedQuote(null)}
        onDownloadPDF={handleDownloadPDF}
        onSendQuote={handleSendQuote}
      />
    </div>
  )
}

export default QuotesPage
