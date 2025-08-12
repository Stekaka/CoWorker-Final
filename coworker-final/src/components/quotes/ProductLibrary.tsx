'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { X, Plus, Search, Edit, Trash2, Package, Tag, DollarSign } from 'lucide-react'
import { useAppearance } from '../../contexts/AppearanceContext'
import { GlassCard, GlassButton } from '../ui/glass'
import { ProductService } from '@/services/productService'

interface Product {
  id: string
  name: string
  description: string
  category: string
  price: number
  unit: string
}

interface ProductLibraryProps {
  isOpen: boolean
  onClose: () => void
  onSelectProduct?: (product: Product) => void
}

const ProductLibrary: React.FC<ProductLibraryProps> = ({ isOpen, onClose, onSelectProduct }) => {
  const { getCurrentTheme } = useAppearance()
  const currentTheme = getCurrentTheme()
  const isDark = currentTheme === 'dark'

  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [categories, setCategories] = useState<string[]>(['all'])
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [stats, setStats] = useState({
    totalProducts: 0,
    activeProducts: 0,
    categories: 0
  })

  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    name: '',
    description: '',
    category: '',
    price: 0,
    unit: 'styck'
  })

  // Ladda produkter från databasen
  const loadProducts = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
  const dbProducts = await ProductService.getProducts()
  setProducts(dbProducts)
    } catch (err) {
  setError(err instanceof Error ? err.message : 'Ett fel uppstod vid laddning av produkter')
      console.error('Error loading products:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  // Ladda kategorier från databasen
  const loadCategories = useCallback(async () => {
    try {
      const dbCategories = await ProductService.getCategories()
      setCategories(['all', ...dbCategories])
    } catch (err) {
      console.error('Error loading categories:', err)
    }
  }, [])

  // Ladda statistik från databasen
  const loadStats = useCallback(async () => {
    try {
      const dbStats = await ProductService.getProductStats()
      setStats(dbStats)
    } catch (err) {
      console.error('Error loading stats:', err)
    }
  }, [])

  // Ladda data när komponenten öppnas
  useEffect(() => {
    if (isOpen) {
      loadProducts()
      loadCategories()
      loadStats()
    }
  }, [isOpen, loadProducts, loadCategories, loadStats])

  // Filtrera produkter baserat på sökning och kategori
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };

  const addProduct = async () => {
    if (newProduct.name && newProduct.category && newProduct.price) {
      try {
  const createdProduct = await ProductService.createProduct({
          name: newProduct.name,
          description: newProduct.description || '',
          category: newProduct.category,
          price: newProduct.price,
          unit: newProduct.unit || 'styck'
        })
        
  if (createdProduct) await loadProducts()
        setNewProduct({
          name: '',
          description: '',
          category: '',
          price: 0,
          unit: 'styck'
        })
        setShowAddForm(false)
        loadStats() // Uppdatera statistik
      } catch (err) {
        console.error('Create product failed:', err)
        setError(err instanceof Error ? err.message : 'Kunde inte skapa produkt')
      }
    }
  }

  const updateProduct = async () => {
    if (editingProduct && editingProduct.name && editingProduct.category && editingProduct.price) {
      try {
  const updatedProduct = await ProductService.updateProduct(editingProduct.id, {
          name: editingProduct.name,
          description: editingProduct.description,
          category: editingProduct.category,
          price: editingProduct.price,
          unit: editingProduct.unit
        })
        
  if (updatedProduct) await loadProducts()
        setEditingProduct(null)
        loadStats() // Uppdatera statistik
      } catch (err) {
        console.error('Update product failed:', err)
        setError(err instanceof Error ? err.message : 'Kunde inte uppdatera produkt')
      }
    }
  }

  const deleteProduct = async (id: string) => {
    try {
      await ProductService.deleteProduct(id)
      await loadProducts()
      loadStats() // Uppdatera statistik
    } catch (err) {
      console.error('Delete product failed:', err)
      setError(err instanceof Error ? err.message : 'Kunde inte ta bort produkt')
    }
  }

  const selectProduct = (product: Product) => {
    if (onSelectProduct) {
      onSelectProduct(product)
    }
    handleClose()
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
                Produktbibliotek
              </h2>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                Hantera dina produkter och tjänster
              </p>
            </div>
            <div className="flex items-center gap-3">
              <GlassButton
                onClick={() => setShowAddForm(true)}
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Lägg till produkt
              </GlassButton>
              <button
                onClick={handleClose}
                className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-white/[0.05]' : 'hover:bg-gray-100'}`}
              >
                <X className={`w-6 h-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6">
              {error && (
                <div className={`mb-4 p-4 rounded-lg border ${isDark ? 'border-red-500/30 bg-red-500/10 text-red-300' : 'border-red-200 bg-red-50 text-red-700'}`}>
                  <p>{error}</p>
                </div>
              )}
              {error && (
                <div className="mb-4 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
                  <p className="text-red-400">{error}</p>
                  <button 
                    onClick={() => setError(null)}
                    className="mt-2 text-sm underline"
                  >
                    Stäng
                  </button>
                </div>
              )}

              {/* Search and Filter */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1 relative">
                  <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                  <input
                    type="text"
                    placeholder="Sök produkter..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`w-full pl-10 pr-4 py-2 border rounded-xl focus:outline-none focus:ring-1 backdrop-blur-xl transition-all ${
                      isDark 
                        ? 'bg-white/[0.08] border-white/[0.15] text-white focus:ring-white/[0.15] focus:border-white/[0.15]' 
                        : 'bg-gray-50/80 border-gray-200/60 text-gray-900 focus:ring-blue-500/50 focus:border-blue-500/50'
                    }`}
                  />
                </div>
                
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className={`px-4 py-2 border rounded-xl focus:outline-none focus:ring-1 backdrop-blur-xl transition-all relative z-50 ${
                    isDark 
                      ? 'bg-white/[0.08] border-white/[0.15] text-white focus:ring-white/[0.15] focus:border-white/[0.15]' 
                      : 'bg-gray-50/80 border-gray-200/60 text-gray-900 focus:ring-blue-500/50 focus:border-blue-500/50'
                  }`}
                >
                  <option value="all">Alla kategorier</option>
                  {categories.filter(cat => cat !== 'all').map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <GlassCard className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${isDark ? 'bg-blue-500/20' : 'bg-blue-100'}`}>
                      <Package className={`w-5 h-5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                    </div>
                    <div>
                      <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {stats.activeProducts}
                      </p>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        Aktiva produkter
                      </p>
                    </div>
                  </div>
                </GlassCard>

                <GlassCard className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${isDark ? 'bg-green-500/20' : 'bg-green-100'}`}>
                      <Tag className={`w-5 h-5 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
                    </div>
                    <div>
                      <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {stats.categories}
                      </p>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        Kategorier
                      </p>
                    </div>
                  </div>
                </GlassCard>

                <GlassCard className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${isDark ? 'bg-purple-500/20' : 'bg-purple-100'}`}>
                      <DollarSign className={`w-5 h-5 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
                    </div>
                    <div>
                      <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {Math.round(products.reduce((sum, p) => sum + p.price, 0) / products.length || 0)} kr
                      </p>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        Genomsnittspris
                      </p>
                    </div>
                  </div>
                </GlassCard>
              </div>

              {/* Loading State */}
              {loading && (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  <p className={`mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Laddar produkter...
                  </p>
                </div>
              )}

              {/* Products Grid */}
              {!loading && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredProducts.map((product) => (
                    <GlassCard key={product.id} className="p-4 hover:scale-105 transition-transform cursor-pointer">
                      <div onClick={() => selectProduct(product)}>
                        <h3 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
                          {product.name}
                        </h3>
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-3`}>
                          {product.description}
                        </p>
                        <div className="flex items-center justify-between mb-3">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-600'
                          }`}>
                            {product.category}
                          </span>
                          <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            {product.price.toLocaleString()} kr/{product.unit}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setEditingProduct(product)
                          }}
                          className={`p-2 rounded-lg transition-colors ${
                            isDark ? 'hover:bg-white/[0.05]' : 'hover:bg-gray-100'
                          }`}
                        >
                          <Edit className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteProduct(product.id)
                          }}
                          className={`p-2 rounded-lg transition-colors ${
                            isDark ? 'hover:bg-red-500/20' : 'hover:bg-red-100'
                          }`}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </GlassCard>
                  ))}
                </div>
              )}

              {/* Empty State */}
              {!loading && filteredProducts.length === 0 && (
                <div className="text-center py-12">
                  <Package className={`w-16 h-16 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
                  <h3 className={`text-lg font-medium ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
                    Inga produkter hittades
                  </h3>
                  <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} mb-4`}>
                    {searchTerm || selectedCategory !== 'all' 
                      ? 'Prova att ändra dina sökkriterier.' 
                      : 'Lägg till din första produkt för att komma igång.'}
                  </p>
                  <GlassButton onClick={() => setShowAddForm(true)}>
                    Lägg till produkt
                  </GlassButton>
                </div>
              )}

              {/* Add Product Form */}
              {showAddForm && (
                <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-md mx-4"
                  >
                    <GlassCard className="p-6">
                      <h3 className={`text-lg font-medium ${isDark ? 'text-white' : 'text-gray-900'} mb-4`}>
                        Lägg till ny produkt
                      </h3>
                      
                      <div className="space-y-4">
                        <div>
                          <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            Namn
                          </label>
                          <input
                            type="text"
                            value={newProduct.name || ''}
                            onChange={(e) => setNewProduct(prev => ({ ...prev, name: e.target.value }))}
                            className={`w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-1 backdrop-blur-xl transition-all ${
                              isDark 
                                ? 'bg-white/[0.08] border-white/[0.15] text-white focus:ring-white/[0.15] focus:border-white/[0.15]' 
                                : 'bg-gray-50/80 border-gray-200/60 text-gray-900 focus:ring-blue-500/50 focus:border-blue-500/50'
                            }`}
                          />
                        </div>

                        <div>
                          <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            Beskrivning
                          </label>
                          <textarea
                            value={newProduct.description || ''}
                            onChange={(e) => setNewProduct(prev => ({ ...prev, description: e.target.value }))}
                            rows={3}
                            className={`w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-1 backdrop-blur-xl transition-all ${
                              isDark 
                                ? 'bg-white/[0.08] border-white/[0.15] text-white focus:ring-white/[0.15] focus:border-white/[0.15]' 
                                : 'bg-gray-50/80 border-gray-200/60 text-gray-900 focus:ring-blue-500/50 focus:border-blue-500/50'
                            }`}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                              Kategori
                            </label>
                            <input
                              type="text"
                              value={newProduct.category || ''}
                              onChange={(e) => setNewProduct(prev => ({ ...prev, category: e.target.value }))}
                              className={`w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-1 backdrop-blur-xl transition-all ${
                                isDark 
                                  ? 'bg-white/[0.08] border-white/[0.15] text-white focus:ring-white/[0.15] focus:border-white/[0.15]' 
                                  : 'bg-gray-50/80 border-gray-200/60 text-gray-900 focus:ring-blue-500/50 focus:border-blue-500/50'
                              }`}
                            />
                          </div>

                          <div>
                            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                              Pris
                            </label>
                            <input
                              type="number"
                              value={newProduct.price || ''}
                              onChange={(e) => setNewProduct(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                              className={`w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-1 backdrop-blur-xl transition-all ${
                                isDark 
                                  ? 'bg-white/[0.08] border-white/[0.15] text-white focus:ring-white/[0.15] focus:border-white/[0.15]' 
                                  : 'bg-gray-50/80 border-gray-200/60 text-gray-900 focus:ring-blue-500/50 focus:border-blue-500/50'
                              }`}
                            />
                          </div>
                        </div>

                        <div>
                          <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            Enhet
                          </label>
                          <select
                            value={newProduct.unit || 'styck'}
                            onChange={(e) => setNewProduct(prev => ({ ...prev, unit: e.target.value }))}
                            className={`w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-1 backdrop-blur-xl transition-all relative z-50 ${
                              isDark 
                                ? 'bg-white/[0.08] border-white/[0.15] text-white focus:ring-white/[0.15] focus:border-white/[0.15]' 
                                : 'bg-gray-50/80 border-gray-200/60 text-gray-900 focus:ring-blue-500/50 focus:border-blue-500/50'
                            }`}
                          >
                            <option value="styck">styck</option>
                            <option value="timmar">timmar</option>
                            <option value="dagar">dagar</option>
                            <option value="veckor">veckor</option>
                            <option value="månader">månader</option>
                            <option value="kvadratmeter">m²</option>
                            <option value="meter">meter</option>
                            <option value="kilogram">kg</option>
                            <option value="liter">liter</option>
                          </select>
                        </div>
                      </div>

                      <div className="flex gap-3 mt-6">
                        <GlassButton onClick={addProduct} className="flex-1">
                          Lägg till
                        </GlassButton>
                        <GlassButton 
                          onClick={() => setShowAddForm(false)} 
                          variant="secondary" 
                          className="flex-1"
                        >
                          Avbryt
                        </GlassButton>
                      </div>
                    </GlassCard>
                  </motion.div>
                </div>
              )}

              {/* Edit Product Form */}
              {editingProduct && (
                <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-md mx-4"
                  >
                    <GlassCard className="p-6">
                      <h3 className={`text-lg font-medium ${isDark ? 'text-white' : 'text-gray-900'} mb-4`}>
                        Redigera produkt
                      </h3>
                      
                      <div className="space-y-4">
                        <div>
                          <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            Namn
                          </label>
                          <input
                            type="text"
                            value={editingProduct.name}
                            onChange={(e) => setEditingProduct(prev => prev ? { ...prev, name: e.target.value } : null)}
                            className={`w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-1 backdrop-blur-xl transition-all ${
                              isDark 
                                ? 'bg-white/[0.08] border-white/[0.15] text-white focus:ring-white/[0.15] focus:border-white/[0.15]' 
                                : 'bg-gray-50/80 border-gray-200/60 text-gray-900 focus:ring-blue-500/50 focus:border-blue-500/50'
                            }`}
                          />
                        </div>

                        <div>
                          <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            Beskrivning
                          </label>
                          <textarea
                            value={editingProduct.description}
                            onChange={(e) => setEditingProduct(prev => prev ? { ...prev, description: e.target.value } : null)}
                            rows={3}
                            className={`w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-1 backdrop-blur-xl transition-all ${
                              isDark 
                                ? 'bg-white/[0.08] border-white/[0.15] text-white focus:ring-white/[0.15] focus:border-white/[0.15]' 
                                : 'bg-gray-50/80 border-gray-200/60 text-gray-900 focus:ring-blue-500/50 focus:border-blue-500/50'
                            }`}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                              Kategori
                            </label>
                            <input
                              type="text"
                              value={editingProduct.category}
                              onChange={(e) => setEditingProduct(prev => prev ? { ...prev, category: e.target.value } : null)}
                              className={`w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-1 backdrop-blur-xl transition-all ${
                                isDark 
                                  ? 'bg-white/[0.08] border-white/[0.15] text-white focus:ring-white/[0.15] focus:border-white/[0.15]' 
                                  : 'bg-gray-50/80 border-gray-200/60 text-gray-900 focus:ring-blue-500/50 focus:border-blue-500/50'
                              }`}
                            />
                          </div>

                          <div>
                            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                              Pris
                            </label>
                            <input
                              type="number"
                              value={editingProduct.price}
                              onChange={(e) => setEditingProduct(prev => prev ? { ...prev, price: parseFloat(e.target.value) || 0 } : null)}
                              className={`w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-1 backdrop-blur-xl transition-all ${
                                isDark 
                                  ? 'bg-white/[0.08] border-white/[0.15] text-white focus:ring-white/[0.15] focus:border-white/[0.15]' 
                                  : 'bg-gray-50/80 border-gray-200/60 text-gray-900 focus:ring-blue-500/50 focus:border-blue-500/50'
                              }`}
                            />
                          </div>
                        </div>

                        <div>
                          <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            Enhet
                          </label>
                          <select
                            value={editingProduct.unit}
                            onChange={(e) => setEditingProduct(prev => prev ? { ...prev, unit: e.target.value } : null)}
                            className={`w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-1 backdrop-blur-xl transition-all relative z-50 ${
                              isDark 
                                ? 'bg-white/[0.08] border-white/[0.15] text-white focus:ring-white/[0.15] focus:border-white/[0.15]' 
                                : 'bg-gray-50/80 border-gray-200/60 text-gray-900 focus:ring-blue-500/50 focus:border-blue-500/50'
                            }`}
                          >
                            <option value="styck">styck</option>
                            <option value="timmar">timmar</option>
                            <option value="dagar">dagar</option>
                            <option value="veckor">veckor</option>
                            <option value="månader">månader</option>
                            <option value="kvadratmeter">m²</option>
                            <option value="meter">meter</option>
                            <option value="kilogram">kg</option>
                            <option value="liter">liter</option>
                          </select>
                        </div>
                      </div>

                      <div className="flex gap-3 mt-6">
                        <GlassButton onClick={updateProduct} className="flex-1">
                          Uppdatera
                        </GlassButton>
                        <GlassButton 
                          onClick={() => setEditingProduct(null)} 
                          variant="secondary" 
                          className="flex-1"
                        >
                          Avbryt
                        </GlassButton>
                      </div>
                    </GlassCard>
                  </motion.div>
                </div>
              )}
            </div>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  )
}

export default ProductLibrary
