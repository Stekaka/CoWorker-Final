'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { CalendarEvent, CreateEventData, UpdateEventData, CalendarService } from '@/services/calendarService'
import { supabase } from '@/lib/supabase'
import CompactCalendar from './CompactCalendar'

export default function CompactCalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<any>(null)

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser()
        
        if (error) {
          console.log('Auth error:', error.message)
          setIsAuthenticated(false)
          setUser(null)
          setIsLoading(false)
          return
        }

        if (user) {
          setIsAuthenticated(true)
          setUser(user)
          // Only load events if user is authenticated
          await loadEvents()
        } else {
          setIsAuthenticated(false)
          setUser(null)
          setIsLoading(false)
        }
      } catch (err) {
        console.error('Error checking auth:', err)
        setIsAuthenticated(false)
        setUser(null)
        setIsLoading(false)
      }
    }

    checkAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          setIsAuthenticated(true)
          setUser(session.user)
          await loadEvents()
        } else if (event === 'SIGNED_OUT') {
          setIsAuthenticated(false)
          setUser(null)
          setEvents([])
          setIsLoading(false)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  // Load events for current month
  const loadEvents = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setEvents([])
      setIsLoading(false)
      return
    }

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
      // Don't show error for auth issues, just log them
      if (err instanceof Error && err.message.includes('auth')) {
        console.log('Auth-related error, user may need to sign in again')
        setEvents([])
      } else {
        setError('Kunde inte ladda händelser')
      }
    } finally {
      setIsLoading(false)
    }
  }, [isAuthenticated, user])

  // Handle event creation
  const handleEventCreate = async (eventData: CreateEventData): Promise<void> => {
    if (!isAuthenticated) {
      throw new Error('Du måste vara inloggad för att skapa händelser')
    }

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
    if (!isAuthenticated) {
      throw new Error('Du måste vara inloggad för att uppdatera händelser')
    }

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
    if (!isAuthenticated) {
      throw new Error('Du måste vara inloggad för att ta bort händelser')
    }

    try {
      await CalendarService.deleteEvent(eventId)
      setEvents(prev => prev.filter(event => event.id !== eventId))
    } catch (err) {
      console.error('Error deleting event:', err)
      throw err
    }
  }

  // Show sign-in prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md mx-auto p-8"
        >
          <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Inloggning krävs</h3>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            Du måste logga in för att komma åt kalendern
          </p>
          <button
            onClick={() => window.location.href = '/auth/signin'}
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            Logga in
          </button>
        </motion.div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-slate-600 dark:text-slate-400">Laddar kalender...</p>
        </motion.div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md mx-auto p-8"
        >
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Ett fel uppstod</h3>
          <p className="text-slate-600 dark:text-slate-400 mb-6">{error}</p>
          <button
            onClick={() => loadEvents()}
            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Försök igen
          </button>
        </motion.div>
      </div>
    )
  }

  return (
    <CompactCalendar
      events={events}
      onEventCreate={handleEventCreate}
      onEventUpdate={handleEventUpdate}
      onEventDelete={handleEventDelete}
    />
  )
}
