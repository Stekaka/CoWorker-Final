'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { X, Search, User, Calculator, Save, Send } from 'lucide-react'
import { useAppearance } from '../../contexts/AppearanceContext'
import { GlassCard, GlassButton } from '../ui/glass'
import { CustomerService } from '@/services/customerService'
import { QuoteService } from '@/services/quoteService'
import type { Database } from '@/types/database'

type DatabaseCustomer = Database['public']['Tables']['customers']['Row']

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

interface CreateQuoteProps {
  isOpen: boolean
  onClose: () => void
  products: Product[]
  customers: Customer[]
  onQuoteCreated?: () => void
}

const CreateQuote: React.FC<CreateQuoteProps> = ({ isOpen, onClose, products, onQuoteCreated }) => {
  const { getCurrentTheme } = useAppearance()
  const currentTheme = getCurrentTheme()
  const isDark = currentTheme === 'dark'

  const [step, setStep] = useState(1)
  const [customerSearch, setCustomerSearch] = useState('')
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [customCustomer, setCustomCustomer] = useState<Partial<Customer>>({})
  const [useCustomCustomer, setUseCustomCustomer] = useState(false)
  
  const [quoteItems, setQuoteItems] = useState<QuoteItem[]>([])
  const [productSearch, setProductSearch] = useState('')
  const [showProductSearch, setShowProductSearch] = useState(false)
  
  const [notes, setNotes] = useState('')
  const [validUntil, setValidUntil] = useState('')

  // Database customers
  const [databaseCustomers, setDatabaseCustomers] = useState<Customer[]>([])
  // const [loadingCustomers, setLoadingCustomers] = useState(false)

  // Load customers from database
  const loadCustomers = useCallback(async () => {
    try {
  // setLoadingCustomers(true)
      const dbCustomers = await CustomerService.getCustomers()
      
      // Convert database customer to local interface
      const convertedCustomers = dbCustomers.map((dbCustomer: DatabaseCustomer): Customer => ({
        id: dbCustomer.id,
        name: dbCustomer.name,
        email: dbCustomer.email,
        phone: dbCustomer.phone || '',
        company: dbCustomer.company_name || '',
        address: dbCustomer.address || '',
        city: dbCustomer.city || '',
        postalCode: dbCustomer.postal_code || ''
      }))
      
      setDatabaseCustomers(convertedCustomers)
    } catch (err) {
      console.error('Error loading customers:', err)
      // Fallback to empty array if database fails - mock data will be used in filtering
      setDatabaseCustomers([])
    } finally {
  // setLoadingCustomers(false)
    }
  }, [])

  // Mock customers data - fallback if database fails
  const mockCustomers: Customer[] = [
    {
      id: '1',
      name: 'Anna Andersson',
      company: 'Andersson Consulting AB',
      email: 'anna@andersson-consulting.se',
      phone: '08-123 456 78',
      address: 'Storgatan 15',
      city: 'Stockholm',
      postalCode: '111 22'
    },
    {
      id: '2', 
      name: 'Marcus Bergström',
      company: 'BergTech Solutions',
      email: 'marcus@bergtech.se',
      phone: '031-987 654 32',
      address: 'Teknikgatan 8',
      city: 'Göteborg',
      postalCode: '412 96'
    },
    {
      id: '3',
      name: 'Lisa Carlsson',
      company: 'Carlsson & Partners',
      email: 'lisa@carlsson-partners.se', 
      phone: '040-555 123 45',
      address: 'Malmövägen 33',
      city: 'Malmö',
      postalCode: '214 37'
    },
    {
      id: '4',
      name: 'Erik Danielsson',
      company: 'Nordic Design Studio',
      email: 'erik@nordicdesign.se',
      phone: '08-777 888 99',
      address: 'Designgatan 22',
      city: 'Stockholm',
      postalCode: '118 46'
    },
    {
      id: '5',
      name: 'Sofia Eriksson',
      company: 'Green Energy Solutions AB',
      email: 'sofia@greenenergy.se',
      phone: '031-444 555 66',
      address: 'Miljögatan 12',
      city: 'Göteborg',
      postalCode: '413 27'
    },
    {
      id: '6',
      name: 'Johan Fransson',
      company: 'Fransson Transport',
      email: 'johan@fransson-transport.se',
      phone: '0920-123 456',
      address: 'Industrivägen 45',
      city: 'Luleå',
      postalCode: '973 42'
    }
  ]

  // Load customers when component opens
  useEffect(() => {
    if (isOpen) {
      loadCustomers()
    }
  }, [isOpen, loadCustomers])

  // Filter customers based on search - use database customers if available, otherwise mock data
  const filteredCustomers = (databaseCustomers.length > 0 ? databaseCustomers : mockCustomers).filter(customer => {
    if (!customerSearch.trim()) return false;
    const searchLower = customerSearch.toLowerCase();
    return (
      customer.name.toLowerCase().includes(searchLower) ||
      customer.company.toLowerCase().includes(searchLower) ||
      customer.email.toLowerCase().includes(searchLower)
    );
  });
  const [taxRate, setTaxRate] = useState(25)
  const [globalDiscount, setGlobalDiscount] = useState(0)

  const productSearchRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) {
      // Sätt standarddatum till 30 dagar framåt
      const date = new Date()
      date.setDate(date.getDate() + 30)
      setValidUntil(date.toISOString().split('T')[0])
    }
  }, [isOpen])

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(productSearch.toLowerCase()) ||
    product.description.toLowerCase().includes(productSearch.toLowerCase()) ||
    product.category.toLowerCase().includes(productSearch.toLowerCase())
  )

  const addProduct = (product: Product) => {
    const existingItem = quoteItems.find(item => item.productId === product.id)
    
    if (existingItem) {
      setQuoteItems(prev => prev.map(item =>
        item.productId === product.id
          ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * product.price * (1 - item.discount / 100) }
          : item
      ))
    } else {
      const newItem: QuoteItem = {
        id: Date.now().toString(),
        productId: product.id,
        product,
        quantity: 1,
        discount: 0,
        total: product.price
      }
      setQuoteItems(prev => [...prev, newItem])
    }
    
    setProductSearch('')
    setShowProductSearch(false)
  }

  const updateQuoteItem = (itemId: string, field: 'quantity' | 'discount', value: number) => {
    setQuoteItems(prev => prev.map(item => {
      if (item.id === itemId) {
        const newItem = { ...item, [field]: value }
        newItem.total = newItem.quantity * item.product.price * (1 - newItem.discount / 100)
        return newItem
      }
      return item
    }))
  }

  const removeQuoteItem = (itemId: string) => {
    setQuoteItems(prev => prev.filter(item => item.id !== itemId))
  }

  const calculateTotals = () => {
    const subtotal = quoteItems.reduce((sum, item) => sum + item.total, 0)
    const discountAmount = subtotal * (globalDiscount / 100)
    const discountedSubtotal = subtotal - discountAmount
    const tax = discountedSubtotal * (taxRate / 100)
    const total = discountedSubtotal + tax

    return {
      subtotal,
      discountAmount,
      discountedSubtotal,
      tax,
      total
    }
  }

  const totals = calculateTotals()

  const resetForm = () => {
    setStep(1)
    setCustomerSearch('')
    setSelectedCustomer(null)
    setCustomCustomer({})
    setUseCustomCustomer(false)
    setQuoteItems([])
    setProductSearch('')
    setShowProductSearch(false)
    setNotes('')
    setValidUntil('')
    setTaxRate(25)
    setGlobalDiscount(0)
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const handleSave = (sendImmediately = false) => {
    const doSave = async () => {
      try {
        // Ensure we have a customer in DB
        let customerId: string | null = null

        // Determine if selected customer exists in DB list
        const selectedIsDb = selectedCustomer
          ? databaseCustomers.some((c) => c.id === selectedCustomer.id)
          : false

        if (selectedCustomer && selectedIsDb) {
          customerId = selectedCustomer.id
        } else {
          // Create customer from selected or custom data
          const base = selectedCustomer || customCustomer
          if (!base || !base.name || !base.email) {
            alert('Ange kundens namn och e-post')
            return
          }
          const created = await CustomerService.createCustomer({
            name: base.name,
            email: base.email,
            phone: base.phone || '',
            company_name: base.company || '',
            address: base.address || '',
            city: base.city || '',
            postal_code: base.postalCode || ''
          })
          if (!created) {
            alert('Kunde inte skapa kund')
            return
          }
          customerId = created.id
        }

        if (!customerId) {
          alert('Ingen kund vald')
          return
        }

        // Build items for DB
        const dbItems = quoteItems.map((item, index) => ({
          product_id: item.productId || null,
          description: item.product.name,
          quantity: item.quantity,
          unit_price: item.product.price,
          discount_percent: item.discount || 0,
          total: item.total,
          sort_order: index
        }))

        // Build quote data
        const quote = await QuoteService.createQuote(
          {
            customer_id: customerId,
            title: `Offert ${new Date().toLocaleDateString('sv-SE')}`,
            status: sendImmediately ? 'sent' : 'draft',
            subtotal: totals.discountedSubtotal,
            tax_rate: taxRate,
            tax_amount: totals.tax,
            total_amount: totals.total,
            global_discount: globalDiscount,
            notes: notes || '',
            valid_until: validUntil ? new Date(validUntil).toISOString() : null
          },
          dbItems
        )

        if (!quote) {
          alert('Kunde inte spara offerten')
          return
        }

        // Notify parent and close
  if (onQuoteCreated) onQuoteCreated()
        handleClose()
      } catch (err) {
        console.error('Error saving quote:', err)
        alert('Ett fel uppstod vid sparning av offerten')
      }
    }

    void doSave()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={handleClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="w-full max-w-6xl max-h-[90vh] mx-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <GlassCard className="h-full flex flex-col">
          {/* Header */}
          <div className={`flex items-center justify-between p-6 border-b ${isDark ? 'border-white/[0.05]' : 'border-gray-200/60'} flex-shrink-0`}>
            <div>
              <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Skapa ny offert
              </h2>
              <div className="flex items-center gap-4 mt-2">
                {[1, 2, 3].map((stepNumber) => (
                  <div key={stepNumber} className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      step >= stepNumber
                        ? 'bg-blue-600 text-white'
                        : isDark ? 'bg-white/[0.05] text-gray-400' : 'bg-gray-200 text-gray-600'
                    }`}>
                      {stepNumber}
                    </div>
                    {stepNumber < 3 && (
                      <div className={`w-12 h-0.5 mx-2 ${
                        step > stepNumber
                          ? 'bg-blue-600'
                          : isDark ? 'bg-white/[0.05]' : 'bg-gray-200'
                      }`} />
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            <button
              onClick={handleClose}
              className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-white/[0.05]' : 'hover:bg-gray-100'}`}
            >
              <X className={`w-6 h-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6">
            {/* Steg 1: Välj kund */}
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <h3 className={`text-lg font-medium mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Välj kund
                  </h3>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Befintlig kund */}
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Sök befintlig kund
                      </label>
                      <div className="relative">
                        <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                        <input
                          type="text"
                          placeholder="Sök på namn, företag eller e-post..."
                          value={customerSearch}
                          onChange={(e) => {
                            setCustomerSearch(e.target.value)
                            setSelectedCustomer(null)
                            setUseCustomCustomer(false)
                          }}
                          className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-1 backdrop-blur-xl transition-all ${
                            isDark 
                              ? 'bg-white/[0.08] border-white/[0.15] text-white placeholder-gray-400 focus:ring-white/[0.15] focus:border-white/[0.15]' 
                              : 'bg-gray-50/80 border-gray-200/60 text-gray-900 placeholder-gray-500 focus:ring-blue-500/50 focus:border-blue-500/50'
                          }`}
                        />
                      </div>
                      
                      {customerSearch && filteredCustomers.length > 0 && (
                        <div className={`mt-2 border rounded-xl max-h-60 overflow-y-auto ${isDark ? 'border-white/[0.15] bg-white/[0.05]' : 'border-gray-200/60 bg-white/80'}`}>
                          {filteredCustomers.map((customer) => (
                            <button
                              key={customer.id}
                              onClick={() => {
                                setSelectedCustomer(customer)
                                setCustomerSearch(customer.name)
                                setUseCustomCustomer(false)
                              }}
                              className={`w-full p-4 text-left transition-colors ${
                                selectedCustomer?.id === customer.id
                                  ? isDark ? 'bg-blue-600/20' : 'bg-blue-50'
                                  : isDark ? 'hover:bg-white/[0.05]' : 'hover:bg-gray-50'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <User className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                                <div>
                                  <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    {customer.name}
                                  </p>
                                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                    {customer.company} • {customer.email}
                                  </p>
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Ny kund */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <label className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                          Eller skapa ny kund
                        </label>
                        <button
                          onClick={() => setUseCustomCustomer(!useCustomCustomer)}
                          className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                            useCustomCustomer
                              ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30'
                              : isDark ? 'bg-white/[0.05] text-gray-400 border border-white/[0.15]' : 'bg-gray-100 text-gray-600 border border-gray-200'
                          }`}
                        >
                          {useCustomCustomer ? 'Aktiv' : 'Aktivera'}
                        </button>
                      </div>
                      
                      {useCustomCustomer && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <input
                              type="text"
                              placeholder="Namn *"
                              value={customCustomer.name || ''}
                              onChange={(e) => setCustomCustomer(prev => ({ ...prev, name: e.target.value }))}
                              className={`px-4 py-2 border rounded-xl focus:outline-none focus:ring-1 backdrop-blur-xl transition-all ${
                                isDark 
                                  ? 'bg-white/[0.08] border-white/[0.15] text-white placeholder-gray-400 focus:ring-white/[0.15] focus:border-white/[0.15]' 
                                  : 'bg-gray-50/80 border-gray-200/60 text-gray-900 placeholder-gray-500 focus:ring-blue-500/50 focus:border-blue-500/50'
                              }`}
                            />
                            <input
                              type="email"
                              placeholder="E-post *"
                              value={customCustomer.email || ''}
                              onChange={(e) => setCustomCustomer(prev => ({ ...prev, email: e.target.value }))}
                              className={`px-4 py-2 border rounded-xl focus:outline-none focus:ring-1 backdrop-blur-xl transition-all ${
                                isDark 
                                  ? 'bg-white/[0.08] border-white/[0.15] text-white placeholder-gray-400 focus:ring-white/[0.15] focus:border-white/[0.15]' 
                                  : 'bg-gray-50/80 border-gray-200/60 text-gray-900 placeholder-gray-500 focus:ring-blue-500/50 focus:border-blue-500/50'
                              }`}
                            />
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <input
                              type="text"
                              placeholder="Företag"
                              value={customCustomer.company || ''}
                              onChange={(e) => setCustomCustomer(prev => ({ ...prev, company: e.target.value }))}
                              className={`px-4 py-2 border rounded-xl focus:outline-none focus:ring-1 backdrop-blur-xl transition-all ${
                                isDark 
                                  ? 'bg-white/[0.08] border-white/[0.15] text-white placeholder-gray-400 focus:ring-white/[0.15] focus:border-white/[0.15]' 
                                  : 'bg-gray-50/80 border-gray-200/60 text-gray-900 placeholder-gray-500 focus:ring-blue-500/50 focus:border-blue-500/50'
                              }`}
                            />
                            <input
                              type="tel"
                              placeholder="Telefon"
                              value={customCustomer.phone || ''}
                              onChange={(e) => setCustomCustomer(prev => ({ ...prev, phone: e.target.value }))}
                              className={`px-4 py-2 border rounded-xl focus:outline-none focus:ring-1 backdrop-blur-xl transition-all ${
                                isDark 
                                  ? 'bg-white/[0.08] border-white/[0.15] text-white placeholder-gray-400 focus:ring-white/[0.15] focus:border-white/[0.15]' 
                                  : 'bg-gray-50/80 border-gray-200/60 text-gray-900 placeholder-gray-500 focus:ring-blue-500/50 focus:border-blue-500/50'
                              }`}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Vald kund preview */}
                {(selectedCustomer || (useCustomCustomer && customCustomer.name)) && (
                  <div className={`p-4 rounded-xl border ${isDark ? 'border-green-500/30 bg-green-500/10' : 'border-green-200 bg-green-50'}`}>
                    <div className="flex items-center gap-3">
                      <User className={`w-5 h-5 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
                      <div>
                        <p className={`font-medium ${isDark ? 'text-green-300' : 'text-green-800'}`}>
                          Vald kund: {selectedCustomer?.name || customCustomer.name}
                        </p>
                        <p className={`text-sm ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                          {selectedCustomer?.company || customCustomer.company || 'Ingen företagsuppgift'} • {selectedCustomer?.email || customCustomer.email}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Steg 2: Lägg till produkter */}
            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <h3 className={`text-lg font-medium mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Lägg till produkter & tjänster
                  </h3>
                  
                  {/* Lägg till produkt */}
                  <div className="relative mb-6">
                    <input
                      ref={productSearchRef}
                      type="text"
                      placeholder="Sök produkter och tjänster..."
                      value={productSearch}
                      onChange={(e) => {
                        setProductSearch(e.target.value)
                        setShowProductSearch(e.target.value.length > 0)
                      }}
                      onFocus={() => setShowProductSearch(productSearch.length > 0)}
                      className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-1 backdrop-blur-xl transition-all ${
                        isDark 
                          ? 'bg-white/[0.08] border-white/[0.15] text-white placeholder-gray-400 focus:ring-white/[0.15] focus:border-white/[0.15]' 
                          : 'bg-gray-50/80 border-gray-200/60 text-gray-900 placeholder-gray-500 focus:ring-blue-500/50 focus:border-blue-500/50'
                      }`}
                    />
                    <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                    
                    {showProductSearch && filteredProducts.length > 0 && (
                      <div className={`absolute z-10 w-full mt-2 border rounded-xl max-h-60 overflow-y-auto ${isDark ? 'border-white/[0.15] bg-white/[0.05] backdrop-blur-xl' : 'border-gray-200/60 bg-white/80 backdrop-blur-xl'}`}>
                        {filteredProducts.map((product) => (
                          <button
                            key={product.id}
                            onClick={() => addProduct(product)}
                            className={`w-full p-4 text-left transition-colors ${isDark ? 'hover:bg-white/[0.05]' : 'hover:bg-gray-50'}`}
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                  {product.name}
                                </p>
                                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                                  {product.description}
                                </p>
                                <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'} mt-1`}>
                                  {product.category}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                  {product.price.toLocaleString('sv-SE')} kr
                                </p>
                                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                  per {product.unit}
                                </p>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Offertlista */}
                  {quoteItems.length > 0 && (
                    <div className="space-y-4">
                      <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Offertlista
                      </h4>
                      
                      {quoteItems.map((item) => (
                        <div key={item.id} className={`p-4 border rounded-xl ${isDark ? 'border-white/[0.15] bg-white/[0.02]' : 'border-gray-200/60 bg-gray-50/50'}`}>
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex-1">
                              <h5 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {item.product.name}
                              </h5>
                              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                                {item.product.description}
                              </p>
                            </div>
                            <button
                              onClick={() => removeQuoteItem(item.id)}
                              className={`p-1 rounded-lg transition-colors ${isDark ? 'hover:bg-red-500/20 text-red-400' : 'hover:bg-red-100 text-red-600'}`}
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                            <div>
                              <label className={`block text-xs font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                Antal
                              </label>
                              <input
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={(e) => updateQuoteItem(item.id, 'quantity', parseInt(e.target.value) || 1)}
                                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 transition-all ${
                                  isDark 
                                    ? 'bg-white/[0.08] border-white/[0.15] text-white focus:ring-white/[0.15] focus:border-white/[0.15]' 
                                    : 'bg-white border-gray-200 text-gray-900 focus:ring-blue-500/50 focus:border-blue-500/50'
                                }`}
                              />
                            </div>
                            
                            <div>
                              <label className={`block text-xs font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                À-pris
                              </label>
                              <p className={`px-3 py-2 text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                {item.product.price.toLocaleString('sv-SE')} kr
                              </p>
                            </div>
                            
                            <div>
                              <label className={`block text-xs font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                Rabatt (%)
                              </label>
                              <input
                                type="number"
                                min="0"
                                max="100"
                                value={item.discount}
                                onChange={(e) => updateQuoteItem(item.id, 'discount', parseFloat(e.target.value) || 0)}
                                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 transition-all ${
                                  isDark 
                                    ? 'bg-white/[0.08] border-white/[0.15] text-white focus:ring-white/[0.15] focus:border-white/[0.15]' 
                                    : 'bg-white border-gray-200 text-gray-900 focus:ring-blue-500/50 focus:border-blue-500/50'
                                }`}
                              />
                            </div>
                            
                            <div>
                              <label className={`block text-xs font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                Totalt
                              </label>
                              <p className={`px-3 py-2 font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {item.total.toLocaleString('sv-SE')} kr
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {quoteItems.length === 0 && (
                    <div className="text-center py-12">
                      <Calculator className={`w-12 h-12 mx-auto mb-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                      <h4 className={`font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Inga produkter tillagda än
                      </h4>
                      <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        Sök efter produkter och tjänster att lägga till i offerten
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Steg 3: Granska och skicka */}
            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <h3 className={`text-lg font-medium mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Granska och slutför offert
                  </h3>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Vänster kolumn - Detaljer */}
                    <div className="lg:col-span-2 space-y-6">
                      {/* Kundinfo */}
                      <div className={`p-4 border rounded-xl ${isDark ? 'border-white/[0.15] bg-white/[0.02]' : 'border-gray-200/60 bg-gray-50/50'}`}>
                        <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          Kunduppgifter
                        </h4>
                        <div className="space-y-2">
                          <p className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            <strong>Namn:</strong> {selectedCustomer?.name || customCustomer.name}
                          </p>
                          <p className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            <strong>Företag:</strong> {selectedCustomer?.company || customCustomer.company || 'Ej angivet'}
                          </p>
                          <p className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            <strong>E-post:</strong> {selectedCustomer?.email || customCustomer.email}
                          </p>
                          {(selectedCustomer?.phone || customCustomer.phone) && (
                            <p className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                              <strong>Telefon:</strong> {selectedCustomer?.phone || customCustomer.phone}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Inställningar */}
                      <div className={`p-4 border rounded-xl ${isDark ? 'border-white/[0.15] bg-white/[0.02]' : 'border-gray-200/60 bg-gray-50/50'}`}>
                        <h4 className={`font-medium mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          Offertinställningar
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                          <div>
                            <label className={`block text-xs font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                              Giltig till
                            </label>
                            <input
                              type="date"
                              value={validUntil}
                              onChange={(e) => setValidUntil(e.target.value)}
                              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 transition-all ${
                                isDark 
                                  ? 'bg-white/[0.08] border-white/[0.15] text-white focus:ring-white/[0.15] focus:border-white/[0.15]' 
                                  : 'bg-white border-gray-200 text-gray-900 focus:ring-blue-500/50 focus:border-blue-500/50'
                              }`}
                            />
                          </div>
                          
                          <div>
                            <label className={`block text-xs font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                              Moms (%)
                            </label>
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={taxRate}
                              onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 transition-all ${
                                isDark 
                                  ? 'bg-white/[0.08] border-white/[0.15] text-white focus:ring-white/[0.15] focus:border-white/[0.15]' 
                                  : 'bg-white border-gray-200 text-gray-900 focus:ring-blue-500/50 focus:border-blue-500/50'
                              }`}
                            />
                          </div>
                          
                          <div>
                            <label className={`block text-xs font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                              Total rabatt (%)
                            </label>
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={globalDiscount}
                              onChange={(e) => setGlobalDiscount(parseFloat(e.target.value) || 0)}
                              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 transition-all ${
                                isDark 
                                  ? 'bg-white/[0.08] border-white/[0.15] text-white focus:ring-white/[0.15] focus:border-white/[0.15]' 
                                  : 'bg-white border-gray-200 text-gray-900 focus:ring-blue-500/50 focus:border-blue-500/50'
                              }`}
                            />
                          </div>
                        </div>
                        
                        <div>
                          <label className={`block text-xs font-medium mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            Anteckningar (visas på offerten)
                          </label>
                          <textarea
                            rows={3}
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Lägg till eventuella anteckningar eller villkor..."
                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 transition-all resize-none ${
                              isDark 
                                ? 'bg-white/[0.08] border-white/[0.15] text-white placeholder-gray-400 focus:ring-white/[0.15] focus:border-white/[0.15]' 
                                : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500 focus:ring-blue-500/50 focus:border-blue-500/50'
                            }`}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Höger kolumn - Sammanfattning */}
                    <div>
                      <div className={`p-4 border rounded-xl ${isDark ? 'border-white/[0.15] bg-white/[0.02]' : 'border-gray-200/60 bg-gray-50/50'}`}>
                        <h4 className={`font-medium mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          Sammanfattning
                        </h4>
                        
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                              Delsumma:
                            </span>
                            <span className={`${isDark ? 'text-white' : 'text-gray-900'}`}>
                              {totals.subtotal.toLocaleString('sv-SE')} kr
                            </span>
                          </div>
                          
                          {globalDiscount > 0 && (
                            <div className="flex justify-between text-green-600">
                              <span>Rabatt ({globalDiscount}%):</span>
                              <span>-{totals.discountAmount.toLocaleString('sv-SE')} kr</span>
                            </div>
                          )}
                          
                          <div className="flex justify-between">
                            <span className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                              Moms ({taxRate}%):
                            </span>
                            <span className={`${isDark ? 'text-white' : 'text-gray-900'}`}>
                              {totals.tax.toLocaleString('sv-SE')} kr
                            </span>
                          </div>
                          
                          <div className={`pt-3 border-t flex justify-between font-bold text-lg ${isDark ? 'border-white/[0.15] text-white' : 'border-gray-200 text-gray-900'}`}>
                            <span>Totalt:</span>
                            <span>{totals.total.toLocaleString('sv-SE')} kr</span>
                          </div>
                        </div>
                        
                        <div className={`mt-4 p-3 rounded-lg text-sm ${isDark ? 'bg-blue-500/10 text-blue-300' : 'bg-blue-50 text-blue-700'}`}>
                          <strong>Produkter:</strong> {quoteItems.length} st<br />
                          <strong>Giltig till:</strong> {new Date(validUntil).toLocaleDateString('sv-SE')}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            </div>
          </div>

          {/* Footer */}
          <div className={`flex justify-between items-center p-6 border-t ${isDark ? 'border-white/[0.05]' : 'border-gray-200/60'} flex-shrink-0`}>
            <div className="flex gap-3">
              {step > 1 && (
                <GlassButton
                  onClick={() => setStep(step - 1)}
                  className="flex items-center gap-2"
                >
                  Tillbaka
                </GlassButton>
              )}
            </div>
            
            <div className="flex gap-3">
              {step < 3 ? (
                <GlassButton
                  onClick={() => setStep(step + 1)}
                  disabled={
                    (step === 1 && !selectedCustomer && (!useCustomCustomer || !customCustomer.name || !customCustomer.email)) ||
                    (step === 2 && quoteItems.length === 0)
                  }
                  className="flex items-center gap-2 bg-blue-600/20 border-blue-500/30 text-blue-300 hover:bg-blue-600/30 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Nästa
                </GlassButton>
              ) : (
                <div className="flex gap-3">
                  <GlassButton
                    onClick={() => handleSave(false)}
                    className="flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Spara som utkast
                  </GlassButton>
                  <GlassButton
                    onClick={() => handleSave(true)}
                    className="flex items-center gap-2 bg-green-600/20 border-green-500/30 text-green-300 hover:bg-green-600/30"
                  >
                    <Send className="w-4 h-4" />
                    Spara & Skicka
                  </GlassButton>
                </div>
              )}
            </div>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  )
}

export default CreateQuote
