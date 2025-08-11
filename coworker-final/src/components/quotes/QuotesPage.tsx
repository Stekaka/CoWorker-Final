'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Search, FileText, Send, Download, Eye, Edit, Package, DollarSign, CheckCircle, Clock, AlertCircle } from 'lucide-react'
import { useAppearance } from '../../contexts/AppearanceContext'
import { GlassCard, GlassButton } from '../ui/glass'
import CreateQuote from './CreateQuote'
import ProductLibrary from './ProductLibrary'
import QuoteViewer from './QuoteViewer'

interface Product {
  id: string
  name: string
  description: string
  price: number
  unit: string
  category: string
}

interface QuoteItem {
  id: string
  productId: string
  product: Product
  quantity: number
  discount: number
  total: number
}

interface Customer {
  id: string
  name: string
  email: string
  phone: string
  company: string
  address: string
  city: string
  postalCode: string
}

interface Quote {
  id: string
  quoteNumber: string
  customer: Customer
  items: QuoteItem[]
  subtotal: number
  tax: number
  discount: number
  total: number
  validUntil: string
  status: 'draft' | 'sent' | 'viewed' | 'accepted' | 'rejected' | 'expired'
  createdAt: string
  sentAt?: string
  viewedAt?: string
  notes: string
}

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

  // Mock data för demo
  useEffect(() => {
    const mockProducts: Product[] = [
      {
        id: '1',
        name: 'Webbdesign Konsultation',
        description: 'Initial konsultation och analys av webbdesignbehov',
        price: 1500,
        unit: 'timmar',
        category: 'Konsultation'
      },
      {
        id: '2',
        name: 'Responsiv Webbsida',
        description: 'Komplett responsiv webbsida med modern design',
        price: 25000,
        unit: 'styck',
        category: 'Webbutveckling'
      },
      {
        id: '3',
        name: 'SEO Optimering',
        description: 'Sökmotoroptimering för bättre synlighet',
        price: 8000,
        unit: 'månad',
        category: 'Marknadsföring'
      },
      {
        id: '4',
        name: 'CRM Integration',
        description: 'Integration med befintligt CRM-system',
        price: 15000,
        unit: 'styck',
        category: 'Integration'
      }
    ]

    const mockQuotes: Quote[] = [
      {
        id: '1',
        quoteNumber: 'OFF-2025-001',
        customer: {
          id: '1',
          name: 'Anna Andersson',
          email: 'anna@techinnovate.se',
          phone: '070-123 45 67',
          company: 'Tech Innovate AB',
          address: 'Storgatan 15',
          city: 'Stockholm',
          postalCode: '11122'
        },
        items: [
          {
            id: '1',
            productId: '2',
            product: mockProducts[1],
            quantity: 1,
            discount: 0,
            total: 25000
          },
          {
            id: '2',
            productId: '3',
            product: mockProducts[2],
            quantity: 3,
            discount: 10,
            total: 21600
          }
        ],
        subtotal: 49000,
        tax: 12250,
        discount: 2400,
        total: 58850,
        validUntil: '2025-09-11',
        status: 'sent',
        createdAt: '2025-08-01',
        sentAt: '2025-08-01',
        notes: 'Kunden är intresserad av en långsiktig lösning'
      },
      {
        id: '2',
        quoteNumber: 'OFF-2025-002',
        customer: {
          id: '2',
          name: 'Erik Nilsson',
          email: 'erik@designstudio.se',
          phone: '070-987 65 43',
          company: 'Design Studio',
          address: 'Designgatan 8',
          city: 'Göteborg',
          postalCode: '41122'
        },
        items: [
          {
            id: '3',
            productId: '1',
            product: mockProducts[0],
            quantity: 10,
            discount: 15,
            total: 12750
          }
        ],
        subtotal: 15000,
        tax: 3187.50,
        discount: 2250,
        total: 15937.50,
        validUntil: '2025-08-25',
        status: 'viewed',
        createdAt: '2025-08-05',
        sentAt: '2025-08-05',
        viewedAt: '2025-08-06',
        notes: ''
      }
    ]

    setProducts(mockProducts)
    setQuotes(mockQuotes)
  }, [])

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

  const handleSendQuote = (quote: Quote) => {
    // Här skulle vi implementera e-postfunktionalitet
    console.log('Sending quote:', quote.quoteNumber)
    alert(`Offert ${quote.quoteNumber} skulle skickas till ${quote.customer.email}. Implementation kommer snart!`)
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
        customers={[]} // Nu hämtas kunder direkt från databasen i CreateQuote
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
