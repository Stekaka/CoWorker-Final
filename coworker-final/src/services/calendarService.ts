import { supabase } from '@/lib/supabase'
import { UserCompanyService } from './userCompanyService'

export interface CalendarEvent {
  id: string
  title: string
  description?: string
  start: Date
  end: Date
  allDay: boolean
  type: 'meeting' | 'call' | 'task' | 'note' | 'email'
  contactId?: string
  dealId?: string
  color?: string
  metadata?: Record<string, any>
  created_at: Date
  updated_at: Date
}

export interface CreateEventData {
  title: string
  description?: string
  start: Date
  end: Date
  allDay: boolean
  type: 'meeting' | 'call' | 'task' | 'note' | 'email'
  contactId?: string
  dealId?: string
  color?: string
  metadata?: Record<string, any>
}

export interface UpdateEventData extends Partial<CreateEventData> {
  id: string
}

export class CalendarService {
  static async getEvents(startDate: Date, endDate: Date): Promise<CalendarEvent[]> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError) {
        console.log('Auth error in getEvents:', authError.message)
        // Don't throw for auth errors, just return empty array
        return []
      }
      
      if (!user) {
        console.log('No user found in getEvents')
        return []
      }

      const { data, error } = await supabase
        .from('activities')
        .select(`
          id,
          title,
          description,
          date,
          duration_minutes,
          type,
          contact_id,
          deal_id,
          metadata,
          created_at,
          updated_at
        `)
        .eq('user_id', user.id)
        .gte('date', startDate.toISOString())
        .lte('date', endDate.toISOString())
        .order('date')

      if (error) {
        console.error('Error fetching events:', error)
        return []
      }

      return (data || []).map(row => {
        const start = new Date(row.date)
        const end = row.duration_minutes 
          ? new Date(start.getTime() + row.duration_minutes * 60000)
          : new Date(start.getTime() + 60 * 60000) // Default 1 hour duration

        return {
          id: row.id,
          title: row.title,
          description: row.description,
          start,
          end,
          allDay: false, // Activities are typically not all-day
          type: row.type as CalendarEvent['type'],
          contactId: row.contact_id,
          dealId: row.deal_id,
          color: this.getEventColor(row.type),
          metadata: row.metadata || {},
          created_at: new Date(row.created_at),
          updated_at: new Date(row.updated_at)
        }
      })
    } catch (error) {
      console.error('Error fetching events:', error)
      // Check if it's an auth-related error
      if (error instanceof Error && (
        error.message.includes('auth') || 
        error.message.includes('token') ||
        error.message.includes('refresh')
      )) {
        console.log('Auth-related error in getEvents, returning empty array')
        return []
      }
      return []
    }
  }

  static async createEvent(eventData: CreateEventData): Promise<CalendarEvent | null> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError) {
        console.log('Auth error in createEvent:', authError.message)
        throw new Error('Authentication error: ' + authError.message)
      }
      
      if (!user) {
        throw new Error('User not authenticated')
      }

      const { data, error } = await supabase
        .from('activities')
        .insert({
          user_id: user.id,
          title: eventData.title,
          description: eventData.description,
          date: eventData.start.toISOString(),
          duration_minutes: eventData.allDay ? null : Math.round((eventData.end.getTime() - eventData.start.getTime()) / 60000),
          type: eventData.type,
          contact_id: eventData.contactId,
          deal_id: eventData.dealId,
          metadata: {
            ...eventData.metadata,
            allDay: eventData.allDay,
            color: eventData.color
          }
        })
        .select(`
          id,
          title,
          description,
          date,
          duration_minutes,
          type,
          contact_id,
          deal_id,
          metadata,
          created_at,
          updated_at
        `)
        .single()

      if (error) {
        console.error('Error creating event:', error)
        throw error
      }

      const start = new Date(data.date)
      const end = data.duration_minutes 
        ? new Date(start.getTime() + data.duration_minutes * 60000)
        : new Date(start.getTime() + 60 * 60000)

      return {
        id: data.id,
        title: data.title,
        description: data.description,
        start,
        end,
        allDay: data.metadata?.allDay || false,
        type: data.type as CalendarEvent['type'],
        contactId: data.contact_id,
        dealId: data.deal_id,
        color: data.metadata?.color || this.getEventColor(data.type),
        metadata: data.metadata || {},
        created_at: new Date(data.created_at),
        updated_at: new Date(data.updated_at)
      }
    } catch (error) {
      console.error('Error creating event:', error)
      // Check if it's an auth-related error
      if (error instanceof Error && (
        error.message.includes('auth') || 
        error.message.includes('token') ||
        error.message.includes('refresh')
      )) {
        throw new Error('Authentication error: ' + error.message)
      }
      throw error
    }
  }

  static async updateEvent(eventData: UpdateEventData): Promise<CalendarEvent | null> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError) {
        console.log('Auth error in updateEvent:', authError.message)
        throw new Error('Authentication error: ' + authError.message)
      }
      
      if (!user) {
        throw new Error('User not authenticated')
      }

      const updateData: any = {}
      
      if (eventData.title !== undefined) updateData.title = eventData.title
      if (eventData.description !== undefined) updateData.description = eventData.description
      if (eventData.start !== undefined) updateData.date = eventData.start.toISOString()
      if (eventData.end !== undefined && eventData.start !== undefined) {
        updateData.duration_minutes = Math.round((eventData.end.getTime() - eventData.start.getTime()) / 60000)
      }
      if (eventData.type !== undefined) updateData.type = eventData.type
      if (eventData.contactId !== undefined) updateData.contact_id = eventData.contactId
      if (eventData.dealId !== undefined) updateData.deal_id = eventData.dealId
      if (eventData.metadata !== undefined) {
        updateData.metadata = {
          ...eventData.metadata,
          allDay: eventData.allDay,
          color: eventData.color
        }
      }

      const { data, error } = await supabase
        .from('activities')
        .update(updateData)
        .eq('id', eventData.id)
        .eq('user_id', user.id) // Ensure user can only update their own events
        .select(`
          id,
          title,
          description,
          date,
          duration_minutes,
          type,
          contact_id,
          deal_id,
          metadata,
          created_at,
          updated_at
        `)
        .single()

      if (error) {
        console.error('Error updating event:', error)
        throw error
      }

      const start = new Date(data.date)
      const end = data.duration_minutes 
        ? new Date(start.getTime() + data.duration_minutes * 60000)
        : new Date(start.getTime() + 60 * 60000)

      return {
        id: data.id,
        title: data.title,
        description: data.description,
        start,
        end,
        allDay: data.metadata?.allDay || false,
        type: data.type as CalendarEvent['type'],
        contactId: data.contact_id,
        dealId: data.deal_id,
        color: data.metadata?.color || this.getEventColor(data.type),
        metadata: data.metadata || {},
        created_at: new Date(data.created_at),
        updated_at: new Date(data.updated_at)
      }
    } catch (error) {
      console.error('Error updating event:', error)
      // Check if it's an auth-related error
      if (error instanceof Error && (
        error.message.includes('auth') || 
        error.message.includes('token') ||
        error.message.includes('refresh')
      )) {
        throw new Error('Authentication error: ' + error.message)
      }
      throw error
    }
  }

  static async deleteEvent(eventId: string): Promise<void> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError) {
        console.log('Auth error in deleteEvent:', authError.message)
        throw new Error('Authentication error: ' + authError.message)
      }
      
      if (!user) {
        throw new Error('User not authenticated')
      }

      const { error } = await supabase
        .from('activities')
        .delete()
        .eq('id', eventId)
        .eq('user_id', user.id) // Ensure user can only delete their own events

      if (error) {
        console.error('Error deleting event:', error)
        throw error
      }
    } catch (error) {
      console.error('Error deleting event:', error)
      // Check if it's an auth-related error
      if (error instanceof Error && (
        error.message.includes('auth') || 
        error.message.includes('token') ||
        error.message.includes('refresh')
      )) {
        throw new Error('Authentication error: ' + error.message)
      }
      throw error
    }
  }

  static async getEvent(eventId: string): Promise<CalendarEvent | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return null

      const { data, error } = await supabase
        .from('activities')
        .select(`
          id,
          title,
          description,
          date,
          duration_minutes,
          type,
          contact_id,
          deal_id,
          metadata,
          created_at,
          updated_at
        `)
        .eq('id', eventId)
        .eq('user_id', user.id)
        .single()

      if (error) {
        console.error('Error fetching event:', error)
        return null
      }

      const start = new Date(data.date)
      const end = data.duration_minutes 
        ? new Date(start.getTime() + data.duration_minutes * 60000)
        : new Date(start.getTime() + 60 * 60000)

      return {
        id: data.id,
        title: data.title,
        description: data.description,
        start,
        end,
        allDay: data.metadata?.allDay || false,
        type: data.type as CalendarEvent['type'],
        contactId: data.contact_id,
        dealId: data.deal_id,
        color: data.metadata?.color || this.getEventColor(data.type),
        metadata: data.metadata || {},
        created_at: new Date(data.created_at),
        updated_at: new Date(data.updated_at)
      }
    } catch (error) {
      console.error('Error fetching event:', error)
      return null
    }
  }

  private static getEventColor(type: string): string {
    const colors: Record<string, string> = {
      meeting: '#3B82F6', // Blue
      call: '#10B981',    // Green
      task: '#F59E0B',    // Yellow
      note: '#8B5CF6',    // Purple
      email: '#EF4444'    // Red
    }
    return colors[type] || '#6B7280' // Default gray
  }
}
