'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { CalendarEvent, CreateEventData, UpdateEventData } from '@/services/calendarService'

// Mock data for testing without authentication
const mockEvents: CalendarEvent[] = [
  {
    id: '1',
    title: 'Möte med kund',
    description: 'Diskutera projektplan',
    start: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
    end: new Date(Date.now() + 3 * 60 * 60 * 1000),   // 3 hours from now
    allDay: false,
    type: 'meeting',
    color: '#6366f1',
    metadata: {},
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: '2',
    title: 'Följ upp offert',
    description: 'Ring kund om offert',
    start: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
    end: new Date(Date.now() + 24 * 60 * 60 * 1000 + 30 * 60 * 1000), // Tomorrow + 30 min
    allDay: false,
    type: 'call',
    color: '#10b981',
    metadata: {},
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: '3',
    title: 'Planera veckan',
    description: 'Gå igenom veckans uppgifter',
    start: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Next week
    end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000), // Next week + 1 hour
    allDay: false,
    type: 'task',
    color: '#f59e0b',
    metadata: {},
    created_at: new Date(),
    updated_at: new Date()
  }
]

export default function TestCalendarSimple() {
  const [events, setEvents] = useState<CalendarEvent[]>(mockEvents)
  const [isLoading, setIsLoading] = useState(false)

  // Mock handlers for testing
  const handleEventCreate = async (eventData: CreateEventData): Promise<void> => {
    setIsLoading(true)
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const newEvent: CalendarEvent = {
      id: Date.now().toString(),
      ...eventData,
      color: eventData.color || '#6366f1',
      metadata: eventData.metadata || {},
      created_at: new Date(),
      updated_at: new Date()
    }
    
    setEvents(prev => [...prev, newEvent])
    setIsLoading(false)
  }

  const handleEventUpdate = async (eventData: UpdateEventData): Promise<void> => {
    setIsLoading(true)
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500))
    
    setEvents(prev => prev.map(event => 
      event.id === eventData.id 
        ? { ...event, ...eventData, updated_at: new Date() }
        : event
    ))
    setIsLoading(false)
  }

  const handleEventDelete = async (eventId: string): Promise<void> => {
    setIsLoading(true)
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500))
    
    setEvents(prev => prev.filter(event => event.id !== eventId))
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Test Kalender (Enkel)</h1>
              <p className="text-slate-600">Testa kalenderfunktionalitet utan autentisering</p>
            </div>
            <div className="text-sm text-slate-500">
              {events.length} händelser
            </div>
          </div>
        </div>
      </div>

      {/* Calendar Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200/50 overflow-hidden">
          {/* Simple Calendar Grid */}
          <div className="p-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">
              {new Date().toLocaleDateString('sv-SE', { 
                month: 'long', 
                year: 'numeric' 
              })}
            </h2>
            
            {/* Events List */}
            <div className="space-y-4">
              {events.map((event) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 border border-slate-200 rounded-lg hover:shadow-md transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: event.color }}
                      />
                      <div>
                        <h3 className="font-medium text-slate-900">{event.title}</h3>
                        <p className="text-sm text-slate-600">{event.description}</p>
                        <p className="text-xs text-slate-500">
                          {event.start.toLocaleDateString('sv-SE')} {event.start.toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' })}
                          {' - '}
                          {event.end.toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-1 text-xs font-medium bg-slate-100 text-slate-700 rounded-full">
                        {event.type}
                      </span>
                      <button
                        onClick={() => handleEventDelete(event.id)}
                        disabled={isLoading}
                        className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Add Event Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                const newEvent: CreateEventData = {
                  title: 'Ny testhändelse',
                  description: 'Skapad för att testa funktionalitet',
                  start: new Date(Date.now() + 4 * 60 * 60 * 1000),
                  end: new Date(Date.now() + 5 * 60 * 60 * 1000),
                  allDay: false,
                  type: 'meeting',
                  color: '#8b5cf6'
                }
                handleEventCreate(newEvent)
              }}
              disabled={isLoading}
              className="mt-6 w-full px-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50"
            >
              {isLoading ? 'Lägger till...' : 'Lägg till testhändelse'}
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  )
}
