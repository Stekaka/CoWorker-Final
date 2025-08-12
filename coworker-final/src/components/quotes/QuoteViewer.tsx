'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { X, Download, Send } from 'lucide-react'
import { useAppearance } from '../../contexts/AppearanceContext'
import { GlassCard, GlassButton } from '../ui/glass'

export interface Product {
  id: string
  name: string
  description: string
  price: number
  unit: string
  category: string
}

export interface QuoteItem {
  id: string
  productId: string | null
  product: Product
  quantity: number
  discount: number
  total: number
}

export interface Customer {
  id: string
  name: string
  email: string
  phone: string
  company: string
  address: string
  city: string
  postalCode: string
}

export interface Quote {
  id: string
  quoteNumber: string
  customer: Customer
  items: QuoteItem[]
  subtotal: number
  tax: number
  taxRate: number
  discount: number
  total: number
  validUntil: string
  status: 'draft' | 'sent' | 'viewed' | 'accepted' | 'rejected' | 'expired'
  createdAt: string
  sentAt?: string
  viewedAt?: string
  notes: string
}

interface QuoteViewerProps {
  quote: Quote | null
  isOpen: boolean
  onClose: () => void
  onDownloadPDF: (quote: Quote) => void
  onSendQuote: (quote: Quote) => void | Promise<void>
}

const QuoteViewer: React.FC<QuoteViewerProps> = ({ quote, isOpen, onClose, onDownloadPDF, onSendQuote }) => {
  const { getCurrentTheme } = useAppearance()
  const currentTheme = getCurrentTheme()
  const isDark = currentTheme === 'dark'

  if (!isOpen || !quote) return null

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return isDark ? 'text-gray-400 bg-gray-500/20' : 'text-gray-600 bg-gray-100'
      case 'sent': return isDark ? 'text-blue-400 bg-blue-500/20' : 'text-blue-600 bg-blue-100'
      case 'viewed': return isDark ? 'text-yellow-400 bg-yellow-500/20' : 'text-yellow-600 bg-yellow-100'
      case 'accepted': return isDark ? 'text-green-400 bg-green-500/20' : 'text-green-600 bg-green-100'
      case 'rejected': return isDark ? 'text-red-400 bg-red-500/20' : 'text-red-600 bg-red-100'
      case 'expired': return isDark ? 'text-gray-400 bg-gray-500/20' : 'text-gray-500 bg-gray-100'
      default: return isDark ? 'text-gray-400 bg-gray-500/20' : 'text-gray-600 bg-gray-100'
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={handleClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="w-full max-w-4xl max-h-[90vh] mx-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <GlassCard className="h-full flex flex-col">
          {/* Header */}
          <div className={`flex items-center justify-between p-6 border-b ${isDark ? 'border-white/[0.05]' : 'border-gray-200/60'} flex-shrink-0`}>
            <div>
              <div className="flex items-center gap-4 mb-2">
                <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {quote.quoteNumber}
                </h2>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(quote.status)}`}>
                  {getStatusText(quote.status)}
                </span>
              </div>
              <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Skapad: {new Date(quote.createdAt).toLocaleDateString('sv-SE')} • 
                Giltig till: {new Date(quote.validUntil).toLocaleDateString('sv-SE')}
              </p>
            </div>
            
            <div className="flex gap-3">
              <GlassButton
                onClick={() => onDownloadPDF(quote)}
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Ladda ner PDF
              </GlassButton>
              {quote.status === 'draft' && (
                <GlassButton
                  onClick={() => onSendQuote(quote)}
                  className="flex items-center gap-2 bg-blue-600/20 border-blue-500/30 text-blue-300 hover:bg-blue-600/30"
                >
                  <Send className="w-4 h-4" />
                  Skicka
                </GlassButton>
              )}
              <button
                onClick={onClose}
                className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-white/[0.05]' : 'hover:bg-gray-100'}`}
              >
                <X className={`w-6 h-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6">
            {/* Quote Preview */}
            <div className={`max-w-3xl mx-auto bg-white text-gray-900 p-8 rounded-xl shadow-2xl`}>
              {/* Company Header */}
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Ditt Företag AB</h1>
                <p className="text-gray-600">
                  Företagsgatan 1 • 123 45 Stockholm • info@dittforetag.se • 08-123 456 78
                </p>
              </div>

              {/* Quote Header */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Offert</h2>
                  <div className="space-y-2">
                    <p><strong>Offertnummer:</strong> {quote.quoteNumber}</p>
                    <p><strong>Datum:</strong> {new Date(quote.createdAt).toLocaleDateString('sv-SE')}</p>
                    <p><strong>Giltig till:</strong> {new Date(quote.validUntil).toLocaleDateString('sv-SE')}</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Faktureringsadress</h3>
                  <div className="space-y-1">
                    <p className="font-medium">{quote.customer.name}</p>
                    {quote.customer.company && <p>{quote.customer.company}</p>}
                    <p>{quote.customer.address}</p>
                    <p>{quote.customer.postalCode} {quote.customer.city}</p>
                    <p className="mt-2">
                      <strong>E-post:</strong> {quote.customer.email}
                    </p>
                    {quote.customer.phone && (
                      <p><strong>Telefon:</strong> {quote.customer.phone}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div className="mb-8">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Beskrivning</th>
                      <th className="border border-gray-300 px-4 py-3 text-right font-semibold">Antal</th>
                      <th className="border border-gray-300 px-4 py-3 text-right font-semibold">À-pris</th>
                      <th className="border border-gray-300 px-4 py-3 text-right font-semibold">Rabatt</th>
                      <th className="border border-gray-300 px-4 py-3 text-right font-semibold">Totalt</th>
                    </tr>
                  </thead>
                  <tbody>
                    {quote.items.map((item, index) => (
                      <tr key={item.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="border border-gray-300 px-4 py-3">
                          <div>
                            <p className="font-medium">{item.product.name}</p>
                            <p className="text-sm text-gray-600">{item.product.description}</p>
                          </div>
                        </td>
                        <td className="border border-gray-300 px-4 py-3 text-right">
                          {item.quantity} {item.product.unit}
                        </td>
                        <td className="border border-gray-300 px-4 py-3 text-right">
                          {item.product.price.toLocaleString('sv-SE')} kr
                        </td>
                        <td className="border border-gray-300 px-4 py-3 text-right">
                          {item.discount > 0 ? `${item.discount}%` : '-'}
                        </td>
                        <td className="border border-gray-300 px-4 py-3 text-right font-medium">
                          {item.total.toLocaleString('sv-SE')} kr
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div className="flex justify-end mb-8">
                <div className="w-80">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Delsumma:</span>
                      <span>{quote.subtotal.toLocaleString('sv-SE')} kr</span>
                    </div>
                    {quote.discount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Rabatt:</span>
                        <span>-{(quote.subtotal * quote.discount / 100).toLocaleString('sv-SE')} kr</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Moms ({quote.taxRate}%):</span>
                      <span>{quote.tax.toLocaleString('sv-SE')} kr</span>
                    </div>
                    <div className="border-t border-gray-300 pt-2">
                      <div className="flex justify-between font-bold text-lg">
                        <span>Totalt att betala:</span>
                        <span>{quote.total.toLocaleString('sv-SE')} kr</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {quote.notes && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Anteckningar</h3>
                  <p className="text-gray-700 whitespace-pre-line">{quote.notes}</p>
                </div>
              )}

              {/* Terms */}
              <div className="border-t border-gray-300 pt-6 text-sm text-gray-600">
                <h3 className="font-semibold text-gray-900 mb-2">Villkor</h3>
                <ul className="space-y-1">
                  <li>• Denna offert är giltig till {new Date(quote.validUntil).toLocaleDateString('sv-SE')}</li>
                  <li>• Betalningsvillkor: 30 dagar netto</li>
                  <li>• Alla priser är exklusive moms om inget annat anges</li>
                  <li>• Ändringar i omfattning kan påverka priset</li>
                </ul>
              </div>
            </div>

            {/* Timeline */}
            {(quote.sentAt || quote.viewedAt) && (
              <div className="mt-8">
                <h3 className={`text-lg font-medium mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Aktivitetslogg
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${isDark ? 'bg-blue-400' : 'bg-blue-600'}`} />
                    <p className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Offert skapad - {new Date(quote.createdAt).toLocaleDateString('sv-SE')} {new Date(quote.createdAt).toLocaleTimeString('sv-SE')}
                    </p>
                  </div>
                  {quote.sentAt && (
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${isDark ? 'bg-green-400' : 'bg-green-600'}`} />
                      <p className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Offert skickad - {new Date(quote.sentAt).toLocaleDateString('sv-SE')} {new Date(quote.sentAt).toLocaleTimeString('sv-SE')}
                      </p>
                    </div>
                  )}
                  {quote.viewedAt && (
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${isDark ? 'bg-yellow-400' : 'bg-yellow-600'}`} />
                      <p className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Offert öppnad av kund - {new Date(quote.viewedAt).toLocaleDateString('sv-SE')} {new Date(quote.viewedAt).toLocaleTimeString('sv-SE')}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
            </div>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  )
}

export default QuoteViewer
