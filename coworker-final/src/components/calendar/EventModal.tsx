'use client'

import React, { useState, useEffect } from 'react'
import { CalendarEvent, CreateEventData, UpdateEventData } from '@/services/calendarService'

interface EventModalProps {
  isOpen: boolean
  onClose: () => void
  event?: CalendarEvent | null
  onSave: (eventData: CreateEventData | UpdateEventData) => Promise<void>
  onDelete?: (eventId: string) => Promise<void>
}

export default function EventModal({ 
  isOpen, 
  onClose, 
  event, 
  onSave, 
  onDelete 
}: EventModalProps) {
  const [formData, setFormData] = useState<CreateEventData>({
    title: '',
    description: '',
    start: new Date(),
    end: new Date(Date.now() + 60 * 60 * 1000), // 1 hour from now
    allDay: false,
    type: 'meeting',
    contactId: '',
    dealId: '',
    color: '#3B82F6',
    metadata: {}
  })

  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

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
        color: event.color || '#3B82F6',
        metadata: event.metadata || {}
      })
    } else {
      // Reset form for new event
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
        color: '#3B82F6',
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

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              {event ? 'Redigera händelse' : 'Ny händelse'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-4">
          {errors.general && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {errors.general}
            </div>
          )}

          <div className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Titel *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.title ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Händelsens titel"
              />
              {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Beskrivning
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Beskrivning av händelsen"
              />
            </div>

            {/* Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Typ
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="meeting">Möte</option>
                <option value="call">Samtal</option>
                <option value="task">Uppgift</option>
                <option value="note">Anteckning</option>
                <option value="email">E-post</option>
              </select>
            </div>

            {/* All Day Toggle */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="allDay"
                checked={formData.allDay}
                onChange={(e) => handleAllDayChange(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="allDay" className="ml-2 block text-sm text-gray-700">
                Hela dagen
              </label>
            </div>

            {/* Start Date/Time */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* End Date/Time */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
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
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.end ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.end && <p className="mt-1 text-sm text-red-600">{errors.end}</p>}
            </div>

            {/* Color */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Färg
              </label>
              <div className="flex space-x-2">
                {['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444', '#6B7280'].map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, color }))}
                    className={`w-8 h-8 rounded-full border-2 ${
                      formData.color === color ? 'border-gray-800' : 'border-gray-300'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between mt-6 pt-4 border-t border-gray-200">
            <div className="flex space-x-2">
              {event && onDelete && (
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isLoading}
                  className="px-4 py-2 text-sm font-medium text-red-600 border border-red-600 rounded-md hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
                >
                  Ta bort
                </button>
              )}
            </div>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                Avbryt
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isLoading ? 'Sparar...' : (event ? 'Uppdatera' : 'Skapa')}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
