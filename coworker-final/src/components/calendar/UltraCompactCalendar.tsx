'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CalendarEvent, CreateEventData, UpdateEventData } from '@/services/calendarService'
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Calendar as CalendarIcon,
  Search,
  Filter,
  Sun,
  Moon,
  X
} from 'lucide-react'
import ModernEventModal from './ModernEventModal'

interface UltraCompactCalendarProps {
  events: CalendarEvent[]
  onEventUpdate: (eventData: UpdateEventData) => Promise<void>
  onEventCreate: (eventData: CreateEventData) => Promise<void>
  onEventDelete: (eventId: string) => Promise<void>
}

export default function UltraCompactCalendar({ 
  events, 
  onEventUpdate, 
  onEventCreate, 
  onEventDelete 
}: UltraCompactCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Get week dates for current view
  const getWeekDates = useCallback(() => {
    const startOfWeek = new Date(currentDate)
    const day = startOfWeek.getDay()
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1)
    startOfWeek.setDate(diff)

    const dates = []
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek)
      date.setDate(startOfWeek.getDate() + i)
      dates.push(date)
    }
    return dates
  }, [currentDate])

  // Navigation functions
  const goToToday = () => setCurrentDate(new Date())
  const goToPrevious = () => {
    const newDate = new Date(currentDate)
    newDate.setDate(newDate.getDate() - 7)
    setCurrentDate(newDate)
  }
  const goToNext = () => {
    const newDate = new Date(currentDate)
    newDate.setDate(newDate.getDate() + 7)
    setCurrentDate(newDate)
  }

  // Handle double-click to create new event
  const handleCalendarDoubleClick = (e: React.MouseEvent, date: Date) => {
    const clickTime = new Date(date)
    clickTime.setHours(9, 0, 0, 0)
    
    const endTime = new Date(clickTime)
    endTime.setHours(10, 0, 0, 0)

    setSelectedEvent({
      id: '',
      title: '',
      description: '',
      start: clickTime,
      end: endTime,
      allDay: false,
      type: 'meeting',
      color: '#6366f1',
      metadata: {},
      created_at: new Date(),
      updated_at: new Date()
    })
    setIsModalOpen(true)
  }

  // Handle event click
  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event)
    setIsModalOpen(true)
  }

  // Filter events based on search and type
  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.description?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = filterType === 'all' || event.type === filterType
    return matchesSearch && matchesType
  })

  // Get upcoming events for sidebar
  const upcomingEvents = filteredEvents
    .filter(event => new Date(event.start) > new Date())
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
    .slice(0, 3)

  return (
    <div className="h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900 flex overflow-hidden">
      {/* Floating Action Button */}
      <button
        onClick={() => {
          setSelectedEvent(null)
          setIsModalOpen(true)
        }}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full shadow-2xl hover:shadow-3xl transform hover:scale-110 transition-all duration-200 flex items-center justify-center"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Main Calendar Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Compact Header */}
        <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Left side - Navigation and title */}
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <CalendarIcon className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              </button>
              
              <div className="flex items-center space-x-1">
                <button
                  onClick={goToPrevious}
                  className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                </button>
                
                <button
                  onClick={goToToday}
                  className="px-3 py-1.5 text-sm font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors"
                >
                  Idag
                </button>
                
                <button
                  onClick={goToNext}
                  className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  <ChevronRight className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                </button>
              </div>

              <h1 className="text-lg font-bold text-slate-900 dark:text-white">
                {getWeekDates()[0].toLocaleDateString('sv-SE', { month: 'short', day: 'numeric' })} - {getWeekDates()[6].toLocaleDateString('sv-SE', { month: 'short', day: 'numeric' })}
              </h1>
            </div>

            {/* Right side - Controls */}
            <div className="flex items-center space-x-2">
              {/* Theme toggle */}
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                {isDarkMode ? (
                  <Sun className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                ) : (
                  <Moon className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Ultra Compact Calendar Grid */}
        <div className="flex-1 bg-white dark:bg-slate-800 overflow-hidden">
          {/* Week header */}
          <div className="grid grid-cols-7 gap-px bg-slate-200 dark:bg-slate-700 border-b border-slate-200 dark:border-slate-700">
            {getWeekDates().map((date, index) => (
              <div
                key={index}
                className={`p-2 text-center ${
                  date.toDateString() === new Date().toDateString()
                    ? 'bg-indigo-50 dark:bg-indigo-900/20 border-b-2 border-indigo-500'
                    : 'bg-slate-50 dark:bg-slate-800'
                }`}
              >
                <div className="text-xs font-medium text-slate-600 dark:text-slate-400">
                  {date.toLocaleDateString('sv-SE', { weekday: 'short' })}
                </div>
                <div className={`text-lg font-bold ${
                  date.toDateString() === new Date().toDateString()
                    ? 'text-indigo-600 dark:text-indigo-400'
                    : 'text-slate-900 dark:text-white'
                }`}>
                  {date.getDate()}
                </div>
              </div>
            ))}
          </div>

          {/* Time grid - Ultra compact */}
          <div className="grid grid-cols-7 h-full">
            {getWeekDates().map((date, dayIndex) => {
              const eventsInDay = filteredEvents.filter(event => {
                const eventDate = new Date(event.start)
                return (
                  eventDate.getDate() === date.getDate() &&
                  eventDate.getMonth() === date.getMonth() &&
                  eventDate.getFullYear() === date.getFullYear()
                )
              })

              return (
                <div
                  key={dayIndex}
                  className="border-r border-slate-200 dark:border-slate-700 last:border-r-0 relative group hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                  onDoubleClick={(e) => handleCalendarDoubleClick(e, date)}
                >
                  {/* Events for this day */}
                  <div className="p-1 space-y-1">
                    {eventsInDay.slice(0, 4).map((event, eventIndex) => (
                      <motion.div
                        key={event.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.2, delay: eventIndex * 0.1 }}
                        className="px-2 py-1 text-xs text-white rounded cursor-pointer shadow-sm hover:shadow-md transform hover:scale-105 transition-all duration-200"
                        style={{ backgroundColor: event.color }}
                        onClick={(e) => {
                          e.stopPropagation()
                          handleEventClick(event)
                        }}
                      >
                        <div className="truncate font-medium text-xs">{event.title}</div>
                      </motion.div>
                    ))}
                    
                    {eventsInDay.length > 4 && (
                      <div className="text-xs text-slate-500 dark:text-slate-400 px-2 py-1 text-center">
                        +{eventsInDay.length - 4} fler
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Floating Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="fixed right-0 top-0 h-full w-80 bg-white dark:bg-slate-800 border-l border-slate-200 dark:border-slate-700 shadow-2xl z-40 overflow-hidden"
          >
            <div className="p-6 h-full flex flex-col">
              {/* Sidebar Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Kalender</h2>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  <X className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                </button>
              </div>

              {/* Search */}
              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Sök händelser..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm"
                  />
                </div>
              </div>

              {/* Filter */}
              <div className="mb-6">
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm"
                >
                  <option value="all">Alla typer</option>
                  <option value="meeting">Möten</option>
                  <option value="call">Samtal</option>
                  <option value="task">Uppgifter</option>
                  <option value="note">Anteckningar</option>
                  <option value="email">E-post</option>
                </select>
              </div>

              {/* Upcoming Events */}
              <div className="flex-1 overflow-hidden">
                <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Kommande händelser</h3>
                <div className="space-y-2 overflow-y-auto max-h-64">
                  {upcomingEvents.map((event) => (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="p-3 bg-slate-50 dark:bg-slate-700 rounded-lg cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
                      onClick={() => handleEventClick(event)}
                    >
                      <div className="flex items-start space-x-3">
                        <div 
                          className="w-3 h-3 rounded-full mt-1.5 flex-shrink-0"
                          style={{ backgroundColor: event.color }}
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-slate-900 dark:text-white truncate">
                            {event.title}
                          </h4>
                          <p className="text-xs text-slate-600 dark:text-slate-400">
                            {new Date(event.start).toLocaleDateString('sv-SE', { 
                              month: 'short', 
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  {upcomingEvents.length === 0 && (
                    <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">
                      Inga kommande händelser
                    </p>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Event Modal */}
      <ModernEventModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedEvent(null)
        }}
        event={selectedEvent}
        onSave={async (eventData) => {
          if ('id' in eventData && eventData.id) {
            await onEventUpdate(eventData)
          } else {
            await onEventCreate(eventData)
          }
        }}
        onDelete={onEventDelete}
      />
    </div>
  )
}
