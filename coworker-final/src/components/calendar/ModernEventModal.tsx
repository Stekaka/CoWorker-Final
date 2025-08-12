'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CalendarEvent, CreateEventData, UpdateEventData } from '@/services/calendarService'
import { 
  X, 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  FileText, 
  Palette,
  Trash2,
  Save,
  Plus
} from 'lucide-react'

interface ModernEventModalProps {
  isOpen: boolean
  onClose: () => void
  event?: CalendarEvent | null
  onSave: (eventData: CreateEventData | UpdateEventData) => Promise<void>
  onDelete?: (eventId: string) => Promise<void>
}

export default function ModernEventModal({ 
  isOpen, 
  onClose, 
  event, 
  onSave, 
  onDelete 
}: ModernEventModalProps) {
  const [formData, setFormData] = useState<CreateEventData>({
    title: '',
    description: '',
    start: new Date(),
    end: new Date(Date.now() + 60 * 60 * 1000),
    allDay: false,
    type: 'meeting',
    contactId: '',
    dealId: '',
    color: '#6366f1',
    metadata: {}
  })

  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [activeTab, setActiveTab] = useState<'details' | 'advanced'>('details')

  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title,
        description: event.description || '',
        start: event.start,
        end: event.end,
        allDay: event.allDay,
        type: event.type,
        contactId: event.contactId || '',
        dealId: event.dealId || '',
        color: event.color || '#6366f1',
        metadata: event.metadata || {}
      })
    } else {
      const now = new Date()
      const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000)
      setFormData({
        title: '',
        description: '',
        start: now,
        end: oneHourLater,
        allDay: false,
        type: 'meeting',
        contactId: '',
        dealId: '',
        color: '#6366f1',
        metadata: {}
      })
    }
    setErrors({})
  }, [event, isOpen])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Titel är obligatorisk'
    }

    if (formData.start >= formData.end && !formData.allDay) {
      newErrors.end = 'Sluttid måste vara efter starttid'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsLoading(true)
    try {
      if (event) {
        await onSave({ ...formData, id: event.id } as UpdateEventData)
      } else {
        await onSave(formData)
      }
      onClose()
    } catch (error) {
      console.error('Error saving event:', error)
      setErrors({ general: 'Ett fel uppstod vid sparande av händelsen' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!event || !onDelete) return

    if (window.confirm('Är du säker på att du vill ta bort denna händelse?')) {
      setIsLoading(true)
      try {
        await onDelete(event.id)
        onClose()
      } catch (error) {
        console.error('Error deleting event:', error)
        setErrors({ general: 'Ett fel uppstod vid borttagning av händelsen' })
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleAllDayChange = (allDay: boolean) => {
    setFormData(prev => ({
      ...prev,
      allDay,
      end: allDay ? new Date(prev.start.getTime() + 24 * 60 * 60 * 1000) : prev.end
    }))
  }

  const colorOptions = [
    { name: 'Indigo', value: '#6366f1' },
    { name: 'Blå', value: '#3b82f6' },
    { name: 'Grön', value: '#10b981' },
    { name: 'Gul', value: '#f59e0b' },
    { name: 'Röd', value: '#ef4444' },
    { name: 'Lila', value: '#8b5cf6' },
    { name: 'Rosa', value: '#ec4899' },
    { name: 'Grå', value: '#6b7280' }
  ]

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200/50 dark:border-slate-700/50 w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="relative p-4 border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    {event ? 'Redigera händelse' : 'Ny händelse'}
                  </h2>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {event ? 'Uppdatera händelsens detaljer' : 'Skapa en ny händelse i kalendern'}
                  </p>
                </div>
              </div>
              
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <X className="w-4 h-4 text-slate-600 dark:text-slate-400" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex items-center space-x-1 mt-4">
              <button
                onClick={() => setActiveTab('details')}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all ${
                  activeTab === 'details'
                    ? 'bg-indigo-100 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Detaljer
              </button>
              <button
                onClick={() => setActiveTab('advanced')}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all ${
                  activeTab === 'advanced'
                    ? 'bg-indigo-100 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Avancerat
              </button>
            </div>
          </div>

          {/* Form - Scrollable */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-4">
            {errors.general && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-lg text-sm"
              >
                {errors.general}
              </motion.div>
            )}

            {activeTab === 'details' ? (
              <div className="space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Titel *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm ${
                      errors.title ? 'border-red-300 dark:border-red-600' : 'border-slate-200 dark:border-slate-600'
                    } bg-white dark:bg-slate-700 text-slate-900 dark:text-white`}
                    placeholder="Händelsens titel"
                  />
                  {errors.title && (
                    <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.title}</p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Beskrivning
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm"
                    rows={2}
                    placeholder="Beskrivning av händelsen"
                  />
                </div>

                {/* Type and Color */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Typ
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
                      className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm"
                    >
                      <option value="meeting">Möte</option>
                      <option value="call">Samtal</option>
                      <option value="task">Uppgift</option>
                      <option value="note">Anteckning</option>
                      <option value="email">E-post</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Färg
                    </label>
                    <div className="grid grid-cols-4 gap-1.5">
                      {colorOptions.map((color) => (
                        <button
                          key={color.value}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, color: color.value }))}
                          className={`w-8 h-8 rounded-lg border-2 transition-all ${
                            formData.color === color.value 
                              ? 'border-slate-800 dark:border-white scale-110' 
                              : 'border-slate-200 dark:border-slate-600 hover:scale-105'
                          }`}
                          style={{ backgroundColor: color.value }}
                          title={color.name}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* All Day Toggle */}
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="allDay"
                    checked={formData.allDay}
                    onChange={(e) => handleAllDayChange(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded"
                  />
                  <label htmlFor="allDay" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Hela dagen
                  </label>
                </div>

                {/* Date and Time */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Start *
                    </label>
                    <input
                      type={formData.allDay ? 'date' : 'datetime-local'}
                      value={formData.allDay 
                        ? formData.start.toISOString().split('T')[0]
                        : formData.start.toISOString().slice(0, 16)
                      }
                      onChange={(e) => {
                        const newStart = new Date(e.target.value)
                        setFormData(prev => ({ ...prev, start: newStart }))
                      }}
                      className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Slut *
                    </label>
                    <input
                      type={formData.allDay ? 'date' : 'datetime-local'}
                      value={formData.allDay 
                        ? formData.end.toISOString().split('T')[0]
                        : formData.end.toISOString().slice(0, 16)
                      }
                      onChange={(e) => {
                        const newEnd = new Date(e.target.value)
                        setFormData(prev => ({ ...prev, end: newEnd }))
                      }}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm ${
                        errors.end ? 'border-red-300 dark:border-red-600' : 'border-slate-200 dark:border-slate-600'
                      }`}
                    />
                    {errors.end && (
                      <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.end}</p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Advanced options */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Kontakt ID
                  </label>
                  <input
                    type="text"
                    value={formData.contactId}
                    onChange={(e) => setFormData(prev => ({ ...prev, contactId: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm"
                    placeholder="Valfritt kontakt-ID"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Affär ID
                  </label>
                  <input
                    type="text"
                    value={formData.dealId}
                    onChange={(e) => setFormData(prev => ({ ...prev, dealId: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm"
                    placeholder="Valfritt affär-ID"
                  />
                </div>
              </div>
            )}
          </form>

          {/* Action Buttons - Fixed at bottom */}
          <div className="flex items-center justify-between p-4 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex-shrink-0">
            <div className="flex space-x-2">
              {event && onDelete && (
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isLoading}
                  className="inline-flex items-center px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 transition-all"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Ta bort
                </button>
              )}
            </div>
            
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 transition-all"
              >
                Avbryt
              </button>
              
              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-indigo-500 to-purple-600 border border-transparent rounded-lg hover:from-indigo-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Sparar...
                  </>
                ) : (
                  <>
                    {event ? (
                      <>
                        <Save className="w-4 h-4 mr-1" />
                        Uppdatera
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 mr-1" />
                        Skapa
                      </>
                    )}
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
