'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CalendarEvent, CreateEventData, UpdateEventData } from '@/services/calendarService'
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Calendar as CalendarIcon,
  Clock,
  Search,
  Filter,
  Sun,
  Moon,
  Grid3X3,
  List,
  MoreHorizontal,
  X,
  Settings,
  RefreshCw
} from 'lucide-react'
import ModernEventModal from './ModernEventModal'

interface CompactCalendarProps {
  events: CalendarEvent[]
  onEventUpdate: (eventData: UpdateEventData) => Promise<void>
  onEventCreate: (eventData: CreateEventData) => Promise<void>
  onEventDelete: (eventId: string) => Promise<void>
}

export default function CompactCalendar({ 
  events, 
  onEventUpdate, 
  onEventCreate, 
  onEventDelete 
}: CompactCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week')
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [showSettings, setShowSettings] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

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
    .slice(0, 5)

  // Get today's events
  const todaysEvents = filteredEvents.filter(event => {
    const eventDate = new Date(event.start)
    const today = new Date()
    return (
      eventDate.getDate() === today.getDate() &&
      eventDate.getMonth() === today.getMonth() &&
      eventDate.getFullYear() === today.getFullYear()
    )
  })

  // Refresh calendar
  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1)
  }

  return (
    <div className="h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900 flex overflow-hidden">
      {/* Enhanced Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 320, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex-shrink-0 overflow-hidden shadow-xl"
          >
            <div className="p-6 h-full flex flex-col">
              {/* Enhanced Sidebar Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                    <CalendarIcon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Kalender</h2>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {todaysEvents.length} händelser idag
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleRefresh}
                    className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    title="Uppdatera"
                  >
                    <RefreshCw className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                  </button>
                  <button
                    onClick={() => setShowSettings(!showSettings)}
                    className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    title="Inställningar"
                  >
                    <Settings className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                  </button>
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  >
                    <X className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                  </button>
                </div>
              </div>

              {/* Enhanced Quick Actions */}
              <div className="mb-6">
                <button
                  onClick={() => {
                    setSelectedEvent(null)
                    setIsModalOpen(true)
                  }}
                  className="w-full inline-flex items-center justify-center px-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Ny händelse
                </button>
              </div>

              {/* Enhanced Search */}
              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Sök händelser..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm shadow-sm"
                  />
                </div>
              </div>

              {/* Enhanced Filter */}
              <div className="mb-6">
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm shadow-sm"
                >
                  <option value="all">Alla typer</option>
                  <option value="meeting">Möten</option>
                  <option value="call">Samtal</option>
                  <option value="task">Uppgifter</option>
                  <option value="note">Anteckningar</option>
                  <option value="email">E-post</option>
                </select>
              </div>

              {/* Today's Events */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3 flex items-center">
                  <Clock className="w-4 h-4 mr-2" />
                  Idag
                </h3>
                <div className="space-y-2">
                  {todaysEvents.slice(0, 3).map((event) => (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="p-3 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg cursor-pointer hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-all"
                      onClick={() => handleEventClick(event)}
                    >
                      <div className="flex items-start space-x-3">
                        <div 
                          className="w-3 h-3 rounded-full mt-1.5 flex-shrink-0"
                          style={{ backgroundColor: event.color }}
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-indigo-900 dark:text-indigo-100 truncate">
                            {event.title}
                          </h4>
                          <p className="text-xs text-indigo-700 dark:text-indigo-300">
                            {new Date(event.start).toLocaleTimeString('sv-SE', { 
                              hour: '2-digit', 
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  {todaysEvents.length === 0 && (
                    <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">
                      Inga händelser idag
                    </p>
                  )}
                </div>
              </div>

              {/* Upcoming Events */}
              <div className="flex-1 overflow-hidden">
                <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3 flex items-center">
                  <CalendarIcon className="w-4 h-4 mr-2" />
                  Kommande händelser
                </h3>
                <div className="space-y-2 overflow-y-auto max-h-48">
                  {upcomingEvents.map((event) => (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="p-3 bg-slate-50 dark:bg-slate-700 rounded-lg cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-600 transition-all border border-slate-200 dark:border-slate-600"
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

      {/* Enhanced Main Calendar Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Enhanced Header */}
        <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            {/* Left side - Navigation and title */}
            <div className="flex items-center space-x-4">
              {!sidebarOpen && (
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  <CalendarIcon className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                </button>
              )}
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={goToPrevious}
                  className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                </button>
                
                <button
                  onClick={goToToday}
                  className="px-4 py-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-all shadow-sm"
                >
                  Idag
                </button>
                
                <button
                  onClick={goToNext}
                  className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  <ChevronRight className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                </button>
              </div>

              <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                {viewMode === 'week' 
                  ? `${getWeekDates()[0].toLocaleDateString('sv-SE', { month: 'short', day: 'numeric' })} - ${getWeekDates()[6].toLocaleDateString('sv-SE', { month: 'short', day: 'numeric' })}`
                  : currentDate.toLocaleDateString('sv-SE', { month: 'long', year: 'numeric' })
                }
              </h1>
            </div>

            {/* Right side - Enhanced Controls */}
            <div className="flex items-center space-x-3">
              {/* View mode toggle */}
              <div className="flex items-center bg-slate-100 dark:bg-slate-700 rounded-lg p-1 shadow-sm">
                <button
                  onClick={() => setViewMode('week')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                    viewMode === 'week'
                      ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Vecka
                </button>
                <button
                  onClick={() => setViewMode('month')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                    viewMode === 'month'
                      ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Månad
                </button>
              </div>

              {/* Theme toggle */}
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                {isDarkMode ? (
                  <Sun className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                ) : (
                  <Moon className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Enhanced Calendar Content */}
        <div className="flex-1 overflow-hidden">
          {viewMode === 'week' ? (
            <EnhancedWeekView
              dates={getWeekDates()}
              events={filteredEvents}
              onEventClick={handleEventClick}
              onDoubleClick={handleCalendarDoubleClick}
              currentDate={currentDate}
            />
          ) : (
            <EnhancedMonthView
              dates={getMonthDates()}
              events={filteredEvents}
              onEventClick={handleEventClick}
              onDoubleClick={handleCalendarDoubleClick}
              currentDate={currentDate}
            />
          )}
        </div>
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
            await onEventUpdate(eventData as UpdateEventData)
          } else {
            await onEventCreate(eventData as CreateEventData)
          }
        }}
        onDelete={onEventDelete}
      />
    </div>
  )
}

// Enhanced Week View Component
function EnhancedWeekView({ 
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
  const timeSlots = Array.from({ length: 12 }, (_, i) => i + 8) // 8 AM to 8 PM

  return (
    <div className="h-full bg-white dark:bg-slate-800 overflow-hidden">
      {/* Enhanced Week header */}
      <div className="grid grid-cols-8 gap-px bg-slate-200 dark:bg-slate-700 border-b border-slate-200 dark:border-slate-700">
        <div className="bg-slate-50 dark:bg-slate-800 p-3"></div>
        {dates.map((date, index) => (
          <div
            key={index}
            className={`p-3 text-center ${
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

      {/* Enhanced Time grid */}
      <div className="grid grid-cols-8 gap-px bg-slate-200 dark:bg-slate-700 h-full overflow-y-auto">
        {timeSlots.map((hour) => (
          <React.Fragment key={hour}>
            {/* Enhanced Time label */}
            <div className="bg-slate-50 dark:bg-slate-800 p-2 text-xs text-slate-500 dark:text-slate-400 text-right font-medium">
              {hour.toString().padStart(2, '0')}:00
            </div>
            
            {/* Enhanced Day columns */}
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
                  className="bg-white dark:bg-slate-800 min-h-[50px] relative group hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer border-r border-slate-100 dark:border-slate-700 last:border-r-0"
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

// Enhanced Month View Component
function EnhancedMonthView({ 
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
    <div className="h-full bg-white dark:bg-slate-800 p-4 overflow-y-auto">
      {/* Enhanced Weekday headers */}
      <div className="grid grid-cols-7 gap-1 mb-3">
        {weekdays.map((day) => (
          <div key={day} className="text-center text-sm font-medium text-slate-600 dark:text-slate-400 py-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
            {day}
          </div>
        ))}
      </div>

      {/* Enhanced Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
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
              className={`min-h-[100px] p-2 relative group transition-all duration-200 rounded-lg ${
                isCurrentMonth
                  ? 'bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-100 dark:border-slate-700'
                  : 'bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600'
              } ${isToday ? 'ring-2 ring-indigo-500 ring-inset bg-indigo-50 dark:bg-indigo-900/20' : ''}`}
              onDoubleClick={(e) => onDoubleClick(e, date)}
            >
              {/* Enhanced Date number */}
              <div className={`text-sm font-medium mb-2 ${
                isCurrentMonth
                  ? isToday
                    ? 'text-indigo-600 dark:text-indigo-400'
                    : 'text-slate-900 dark:text-white'
                  : 'text-slate-400 dark:text-slate-500'
              }`}>
                {date.getDate()}
              </div>

              {/* Enhanced Events */}
              <div className="space-y-1">
                {eventsInDay.slice(0, 3).map((event, eventIndex) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, x: -5 }}
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
                  <div className="text-xs text-slate-500 dark:text-slate-400 px-2 py-1 text-center bg-slate-100 dark:bg-slate-600 rounded">
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
