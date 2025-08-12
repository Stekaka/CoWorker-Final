'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { CalendarEvent, CreateEventData, UpdateEventData } from '@/services/calendarService'
import EventModal from './EventModal'

interface CalendarProps {
  events: CalendarEvent[]
  onEventUpdate: (eventData: UpdateEventData) => Promise<void>
  onEventCreate: (eventData: CreateEventData) => Promise<void>
  onEventDelete: (eventId: string) => Promise<void>
}

interface DragState {
  isDragging: boolean
  eventId: string | null
  startY: number
  startTime: Date
  originalEvent: CalendarEvent | null
}

export default function Calendar({ 
  events, 
  onEventUpdate, 
  onEventCreate, 
  onEventDelete 
}: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('week')
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    eventId: null,
    startY: 0,
    startTime: new Date(),
    originalEvent: null
  })

  const calendarRef = useRef<HTMLDivElement>(null)
  const timeSlots = generateTimeSlots()

  // Navigation functions
  const goToToday = () => setCurrentDate(new Date())
  const goToPrevious = () => {
    const newDate = new Date(currentDate)
    if (viewMode === 'day') newDate.setDate(newDate.getDate() - 1)
    else if (viewMode === 'week') newDate.setDate(newDate.getDate() - 7)
    else if (viewMode === 'month') newDate.setMonth(newDate.getMonth() - 1)
    setCurrentDate(newDate)
  }
  const goToNext = () => {
    const newDate = new Date(currentDate)
    if (viewMode === 'day') newDate.setDate(newDate.getDate() + 1)
    else if (viewMode === 'week') newDate.setDate(newDate.getDate() + 7)
    else if (viewMode === 'month') newDate.setMonth(newDate.getMonth() + 1)
    setCurrentDate(newDate)
  }

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

  // Handle double-click to create new event
  const handleCalendarDoubleClick = (e: React.MouseEvent, timeSlot: Date, dayIndex: number) => {
    const rect = calendarRef.current?.getBoundingClientRect()
    if (!rect) return

    const clickY = e.clientY - rect.top
    const clickTime = new Date(timeSlot)
    clickTime.setHours(Math.floor(clickY / 60))
    clickTime.setMinutes((clickY % 60) * 15)

    const weekDates = getWeekDates()
    const selectedDate = weekDates[dayIndex]
    clickTime.setDate(selectedDate.getDate())
    clickTime.setMonth(selectedDate.getMonth())
    clickTime.setFullYear(selectedDate.getFullYear())

    const endTime = new Date(clickTime)
    endTime.setHours(endTime.getHours() + 1)

    setSelectedEvent({
      id: '',
      title: '',
      description: '',
      start: clickTime,
      end: endTime,
      allDay: false,
      type: 'meeting',
      color: '#3B82F6',
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

  // Drag and drop handlers
  const handleEventMouseDown = (e: React.MouseEvent, event: CalendarEvent) => {
    e.preventDefault()
    setDragState({
      isDragging: true,
      eventId: event.id,
      startY: e.clientY,
      startTime: event.start,
      originalEvent: { ...event }
    })
  }

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!dragState.isDragging || !dragState.originalEvent) return

    const deltaY = e.clientY - dragState.startY
    const deltaMinutes = Math.round(deltaY / 15) * 15 // Snap to 15-minute intervals

    const newStart = new Date(dragState.originalEvent.start.getTime() + deltaMinutes * 60000)
    const newEnd = new Date(dragState.originalEvent.end.getTime() + deltaMinutes * 60000)

    // Update the event visually (optimistic update)
    const updatedEvent = { ...dragState.originalEvent, start: newStart, end: newEnd }
    setSelectedEvent(updatedEvent)
  }, [dragState])

  const handleMouseUp = useCallback(async () => {
    if (!dragState.isDragging || !dragState.originalEvent || !selectedEvent) return

    try {
      await onEventUpdate({
        id: selectedEvent.id,
        start: selectedEvent.start,
        end: selectedEvent.end
      })
    } catch (error) {
      console.error('Error updating event:', error)
      // Revert to original state on error
      setSelectedEvent(dragState.originalEvent)
    }

    setDragState({
      isDragging: false,
      eventId: null,
      startY: 0,
      startTime: new Date(),
      originalEvent: null
    })
  }, [dragState, selectedEvent, onEventUpdate])

  // Add/remove event listeners
  useEffect(() => {
    if (dragState.isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [dragState.isDragging, handleMouseMove, handleMouseUp])

  // Get events for a specific time slot and day
  const getEventsForTimeSlot = (timeSlot: Date, dayIndex: number) => {
    const weekDates = getWeekDates()
    const dayDate = weekDates[dayIndex]
    
    return events.filter(event => {
      const eventDate = new Date(event.start)
      return (
        eventDate.getDate() === dayDate.getDate() &&
        eventDate.getMonth() === dayDate.getMonth() &&
        eventDate.getFullYear() === dayDate.getFullYear() &&
        eventDate.getHours() === timeSlot.getHours() &&
        Math.floor(eventDate.getMinutes() / 15) === Math.floor(timeSlot.getMinutes() / 15)
      )
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

  // Format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('sv-SE', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    })
  }

  return (
    <div className="h-full flex flex-col">
      {/* Calendar Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold text-gray-900">
            {viewMode === 'day' && currentDate.toLocaleDateString('sv-SE', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
            {viewMode === 'week' && `${formatDate(getWeekDates()[0])} - ${formatDate(getWeekDates()[6])}`}
            {viewMode === 'month' && currentDate.toLocaleDateString('sv-SE', { 
              year: 'numeric', 
              month: 'long' 
            })}
          </h1>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={goToPrevious}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <button
            onClick={goToToday}
            className="px-4 py-2 text-sm font-medium text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50"
          >
            Idag
          </button>
          
          <button
            onClick={goToNext}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <div className="flex items-center space-x-1">
          {(['day', 'week', 'month'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-3 py-1 text-sm font-medium rounded-md ${
                viewMode === mode
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              {mode === 'day' ? 'Dag' : mode === 'week' ? 'Vecka' : 'Månad'}
            </button>
          ))}
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 overflow-auto" ref={calendarRef}>
        <div className="grid grid-cols-8 gap-0 border border-gray-200">
          {/* Time column header */}
          <div className="bg-gray-50 border-r border-gray-200">
            <div className="h-12 border-b border-gray-200"></div>
            {timeSlots.map((timeSlot, index) => (
              <div key={index} className="h-15 border-b border-gray-100 text-xs text-gray-500 px-2 py-1">
                {formatTime(timeSlot)}
              </div>
            ))}
          </div>

          {/* Day columns */}
          {getWeekDates().map((date, dayIndex) => (
            <div key={dayIndex} className="border-r border-gray-200">
              {/* Day header */}
              <div className="h-12 border-b border-gray-200 bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-sm font-medium text-gray-900">
                    {date.toLocaleDateString('sv-SE', { weekday: 'short' })}
                  </div>
                  <div className={`text-lg font-bold ${
                    date.toDateString() === new Date().toDateString() 
                      ? 'text-blue-600' 
                      : 'text-gray-700'
                  }`}>
                    {date.getDate()}
                  </div>
                </div>
              </div>

              {/* Time slots */}
              {timeSlots.map((timeSlot, timeIndex) => {
                const eventsInSlot = getEventsForTimeSlot(timeSlot, dayIndex)
                
                return (
                  <div
                    key={timeIndex}
                    className="h-15 border-b border-gray-100 relative group hover:bg-gray-50 cursor-pointer"
                    onDoubleClick={(e) => handleCalendarDoubleClick(e, timeSlot, dayIndex)}
                  >
                    {eventsInSlot.map((event) => (
                      <div
                        key={event.id}
                        className="absolute left-1 right-1 mx-1 px-2 py-1 text-xs text-white rounded cursor-pointer shadow-sm"
                        style={{
                          backgroundColor: event.color,
                          top: '2px',
                          bottom: '2px',
                          zIndex: 10
                        }}
                        onClick={(e) => {
                          e.stopPropagation()
                          handleEventClick(event)
                        }}
                        onMouseDown={(e) => handleEventMouseDown(e, event)}
                      >
                        <div className="font-medium truncate">{event.title}</div>
                        {!event.allDay && (
                          <div className="text-xs opacity-90">
                            {formatTime(event.start)} - {formatTime(event.end)}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Event Modal */}
      <EventModal
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

// Helper function to generate time slots
function generateTimeSlots(): Date[] {
  const slots = []
  const startHour = 8 // 8 AM
  const endHour = 20 // 8 PM
  
  for (let hour = startHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      const time = new Date()
      time.setHours(hour, minute, 0, 0)
      slots.push(time)
    }
  }
  
  return slots
}
