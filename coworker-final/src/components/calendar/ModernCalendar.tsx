'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CalendarEvent, CreateEventData, UpdateEventData } from '@/services/calendarService'
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Users,
  MoreHorizontal,
  Search,
  Filter,
  Grid3X3,
  List,
  Sun,
  Moon
} from 'lucide-react'
import ModernEventModal from './ModernEventModal'

interface ModernCalendarProps {
  events: CalendarEvent[]
  onEventUpdate: (eventData: UpdateEventData) => Promise<void>
  onEventCreate: (eventData: CreateEventData) => Promise<void>
  onEventDelete: (eventId: string) => Promise<void>
}

export default function ModernCalendar({ 
  events, 
  onEventUpdate, 
  onEventCreate, 
  onEventDelete 
}: ModernCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week')
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [isDarkMode, setIsDarkMode] = useState(false)

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

  // Get month dates
  const getMonthDates = useCallback(() => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())
    
    const dates = []
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate)
      date.setDate(startDate.getDate() + i)
      dates.push(date)
    }
    return dates
  }, [currentDate])

  // Navigation functions
  const goToToday = () => setCurrentDate(new Date())
  const goToPrevious = () => {
    const newDate = new Date(currentDate)
    if (viewMode === 'week') newDate.setDate(newDate.getDate() - 7)
    else newDate.setMonth(newDate.getMonth() - 1)
    setCurrentDate(newDate)
  }
  const goToNext = () => {
    const newDate = new Date(currentDate)
    if (viewMode === 'week') newDate.setDate(newDate.getDate() + 7)
    else newDate.setMonth(newDate.getMonth() + 1)
    setCurrentDate(newDate)
  }

  // Handle double-click to create new event
  const handleCalendarDoubleClick = (e: React.MouseEvent, date: Date) => {
    const clickTime = new Date(date)
    clickTime.setHours(9, 0, 0, 0) // Default to 9 AM
    
    const endTime = new Date(clickTime)
    endTime.setHours(10, 0, 0, 0) // Default to 10 AM

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

  // Get events for a specific date
  const getEventsForDate = (date: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.start)
      return (
        eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear()
      )
    })
  }

  // Format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('sv-SE', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    })
  }

  // Format time for display
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('sv-SE', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    })
  }

  // Filter events based on search and type
  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.description?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = filterType === 'all' || event.type === filterType
    return matchesSearch && matchesType
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900">
      {/* Header */}
      <div className="sticky top-0 z-40 backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border-b border-slate-200/50 dark:border-slate-700/50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Left side - Title and navigation */}
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                  <CalendarIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent">
                    Kalender
                  </h1>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {viewMode === 'week' ? 'Veckovisning' : 'Månadsvisning'}
                  </p>
                </div>
              </div>

              {/* Navigation */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={goToPrevious}
                  className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                </button>
                
                <button
                  onClick={goToToday}
                  className="px-4 py-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors"
                >
                  Idag
                </button>
                
                <button
                  onClick={goToNext}
                  className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <ChevronRight className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                </button>
              </div>
            </div>

            {/* Right side - Actions and controls */}
            <div className="flex items-center space-x-4">
              {/* View mode toggle */}
              <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('week')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                    viewMode === 'week'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Vecka
                </button>
                <button
                  onClick={() => setViewMode('month')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                    viewMode === 'month'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Månad
                </button>
              </div>

              {/* Theme toggle */}
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                {isDarkMode ? (
                  <Sun className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                ) : (
                  <Moon className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                )}
              </button>

              {/* Create event button */}
              <button
                onClick={() => {
                  setSelectedEvent(null)
                  setIsModalOpen(true)
                }}
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <Plus className="w-4 h-4 mr-2" />
                Ny händelse
              </button>
            </div>
          </div>

          {/* Search and filters */}
          <div className="flex items-center space-x-4 mt-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Sök händelser..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Type filter */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            >
              <option value="all">Alla typer</option>
              <option value="meeting">Möten</option>
              <option value="call">Samtal</option>
              <option value="task">Uppgifter</option>
              <option value="note">Anteckningar</option>
              <option value="email">E-post</option>
            </select>
          </div>
        </div>
      </div>

      {/* Calendar Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {viewMode === 'week' ? (
          <WeekView
            dates={getWeekDates()}
            events={filteredEvents}
            onEventClick={handleEventClick}
            onDoubleClick={handleCalendarDoubleClick}
            currentDate={currentDate}
          />
        ) : (
          <MonthView
            dates={getMonthDates()}
            events={filteredEvents}
            onEventClick={handleEventClick}
            onDoubleClick={handleCalendarDoubleClick}
            currentDate={currentDate}
          />
        )}
      </div>

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

// Week View Component
function WeekView({ 
  dates, 
  events, 
  onEventClick, 
  onDoubleClick, 
  currentDate 
}: {
  dates: Date[]
  events: CalendarEvent[]
  onEventClick: (event: CalendarEvent) => void
  onDoubleClick: (e: React.MouseEvent, date: Date) => void
  currentDate: Date
}) {
  const timeSlots = Array.from({ length: 24 }, (_, i) => i)

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200/50 dark:border-slate-700/50 overflow-hidden">
      {/* Week header */}
      <div className="grid grid-cols-8 gap-px bg-slate-200 dark:bg-slate-700">
        <div className="bg-slate-50 dark:bg-slate-800 p-4"></div>
        {dates.map((date, index) => (
          <div
            key={index}
            className={`p-4 text-center ${
              date.toDateString() === new Date().toDateString()
                ? 'bg-indigo-50 dark:bg-indigo-900/20 border-b-2 border-indigo-500'
                : 'bg-slate-50 dark:bg-slate-800'
            }`}
          >
            <div className="text-sm font-medium text-slate-600 dark:text-slate-400">
              {date.toLocaleDateString('sv-SE', { weekday: 'short' })}
            </div>
            <div className={`text-2xl font-bold ${
              date.toDateString() === new Date().toDateString()
                ? 'text-indigo-600 dark:text-indigo-400'
                : 'text-slate-900 dark:text-white'
            }`}>
              {date.getDate()}
            </div>
          </div>
        ))}
      </div>

      {/* Time grid */}
      <div className="grid grid-cols-8 gap-px bg-slate-200 dark:bg-slate-700">
        {timeSlots.map((hour) => (
          <React.Fragment key={hour}>
            {/* Time label */}
            <div className="bg-slate-50 dark:bg-slate-800 p-2 text-xs text-slate-500 dark:text-slate-400 text-right">
              {hour.toString().padStart(2, '0')}:00
            </div>
            
            {/* Day columns */}
            {dates.map((date, dayIndex) => {
              const eventsInSlot = events.filter(event => {
                const eventDate = new Date(event.start)
                return (
                  eventDate.getDate() === date.getDate() &&
                  eventDate.getMonth() === date.getMonth() &&
                  eventDate.getFullYear() === date.getFullYear() &&
                  eventDate.getHours() === hour
                )
              })

              return (
                <div
                  key={dayIndex}
                  className="bg-white dark:bg-slate-800 min-h-[60px] relative group hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                  onDoubleClick={(e) => onDoubleClick(e, date)}
                >
                  {eventsInSlot.map((event, eventIndex) => (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.2 }}
                      className="absolute left-1 right-1 mx-1 px-2 py-1 text-xs text-white rounded-lg cursor-pointer shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                      style={{
                        backgroundColor: event.color,
                        top: '2px',
                        bottom: '2px',
                        zIndex: 10
                      }}
                      onClick={(e) => {
                        e.stopPropagation()
                        onEventClick(event)
                      }}
                    >
                      <div className="font-medium truncate">{event.title}</div>
                      <div className="text-xs opacity-90">
                        {new Date(event.start).toLocaleTimeString('sv-SE', { 
                          hour: '2-digit', 
                          minute: '2-digit',
                          hour12: false 
                        })}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  )
}

// Month View Component
function MonthView({ 
  dates, 
  events, 
  onEventClick, 
  onDoubleClick, 
  currentDate 
}: {
  dates: Date[]
  events: CalendarEvent[]
  onEventClick: (event: CalendarEvent) => void
  onDoubleClick: (e: React.MouseEvent, date: Date) => void
  currentDate: Date
}) {
  const weekdays = ['Sön', 'Mån', 'Tis', 'Ons', 'Tor', 'Fre', 'Lör']

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200/50 dark:border-slate-700/50 overflow-hidden">
      {/* Month header */}
      <div className="p-6 border-b border-slate-200 dark:border-slate-700">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          {currentDate.toLocaleDateString('sv-SE', { 
            month: 'long', 
            year: 'numeric' 
          })}
        </h2>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-px bg-slate-200 dark:bg-slate-700">
        {weekdays.map((day) => (
          <div key={day} className="bg-slate-50 dark:bg-slate-800 p-4 text-center">
            <div className="text-sm font-medium text-slate-600 dark:text-slate-400">
              {day}
            </div>
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-px bg-slate-200 dark:bg-slate-700">
        {dates.map((date, index) => {
          const isCurrentMonth = date.getMonth() === currentDate.getMonth()
          const isToday = date.toDateString() === new Date().toDateString()
          const eventsInDay = events.filter(event => {
            const eventDate = new Date(event.start)
            return (
              eventDate.getDate() === date.getDate() &&
              eventDate.getMonth() === date.getMonth() &&
              eventDate.getFullYear() === date.getFullYear()
            )
          })

          return (
            <div
              key={index}
              className={`min-h-[120px] p-2 relative group transition-all duration-200 ${
                isCurrentMonth
                  ? 'bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700'
                  : 'bg-slate-50 dark:bg-slate-700'
              } ${isToday ? 'ring-2 ring-indigo-500 ring-inset' : ''}`}
              onDoubleClick={(e) => onDoubleClick(e, date)}
            >
              {/* Date number */}
              <div className={`text-sm font-medium mb-2 ${
                isCurrentMonth
                  ? isToday
                    ? 'text-indigo-600 dark:text-indigo-400'
                    : 'text-slate-900 dark:text-white'
                  : 'text-slate-400 dark:text-slate-500'
              }`}>
                {date.getDate()}
              </div>

              {/* Events */}
              <div className="space-y-1">
                {eventsInDay.slice(0, 3).map((event, eventIndex) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2, delay: eventIndex * 0.1 }}
                    className="px-2 py-1 text-xs text-white rounded cursor-pointer shadow-sm hover:shadow-md transform hover:scale-105 transition-all duration-200"
                    style={{ backgroundColor: event.color }}
                    onClick={(e) => {
                      e.stopPropagation()
                      onEventClick(event)
                    }}
                  >
                    <div className="truncate font-medium">{event.title}</div>
                  </motion.div>
                ))}
                
                {eventsInDay.length > 3 && (
                  <div className="text-xs text-slate-500 dark:text-slate-400 px-2 py-1">
                    +{eventsInDay.length - 3} fler
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
