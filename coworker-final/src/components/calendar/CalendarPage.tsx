'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { CalendarEvent, CreateEventData, UpdateEventData, CalendarService } from '@/services/calendarService'
import Calendar from './Calendar'

export default function CalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load events for current month
  const loadEvents = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const now = new Date()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
      
      const fetchedEvents = await CalendarService.getEvents(startOfMonth, endOfMonth)
      setEvents(fetchedEvents)
    } catch (err) {
      console.error('Error loading events:', err)
      setError('Kunde inte ladda händelser')
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Load events on component mount
  useEffect(() => {
    loadEvents()
  }, [loadEvents])

  // Handle event creation
  const handleEventCreate = async (eventData: CreateEventData): Promise<void> => {
    try {
      const newEvent = await CalendarService.createEvent(eventData)
      if (newEvent) {
        setEvents(prev => [...prev, newEvent])
      }
    } catch (err) {
      console.error('Error creating event:', err)
      throw err
    }
  }

  // Handle event update
  const handleEventUpdate = async (eventData: UpdateEventData): Promise<void> => {
    try {
      const updatedEvent = await CalendarService.updateEvent(eventData)
      if (updatedEvent) {
        setEvents(prev => prev.map(event => 
          event.id === updatedEvent.id ? updatedEvent : event
        ))
      }
    } catch (err) {
      console.error('Error updating event:', err)
      throw err
    }
  }

  // Handle event deletion
  const handleEventDelete = async (eventId: string): Promise<void> => {
    try {
      await CalendarService.deleteEvent(eventId)
      setEvents(prev => prev.filter(event => event.id !== eventId))
    } catch (err) {
      console.error('Error deleting event:', err)
      throw err
    }
  }

  // Refresh events
  const handleRefresh = () => {
    loadEvents()
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Laddar kalender...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">⚠️</div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Försök igen
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Page Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Kalender</h1>
          <p className="text-gray-600 mt-1">
            Hantera dina möten, samtal och uppgifter
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={handleRefresh}
            className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Uppdatera
          </button>
          
          <div className="text-sm text-gray-500">
            {events.length} händelse{events.length !== 1 ? 'r' : ''}
          </div>
        </div>
      </div>

      {/* Calendar Component */}
      <div className="flex-1 overflow-hidden">
        <Calendar
          events={events}
          onEventCreate={handleEventCreate}
          onEventUpdate={handleEventUpdate}
          onEventDelete={handleEventDelete}
        />
      </div>

      {/* Quick Stats */}
      <div className="p-6 border-t border-gray-200 bg-gray-50">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {events.filter(e => e.type === 'meeting').length}
            </div>
            <div className="text-sm text-gray-600">Möten</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {events.filter(e => e.type === 'call').length}
            </div>
            <div className="text-sm text-gray-600">Samtal</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {events.filter(e => e.type === 'task').length}
            </div>
            <div className="text-sm text-gray-600">Uppgifter</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {events.filter(e => e.type === 'note').length}
            </div>
            <div className="text-sm text-gray-600">Anteckningar</div>
          </div>
        </div>
      </div>
    </div>
  )
}
