import { supabase } from '../supabase'
import type { 
  Contact, 
  Deal, 
  Activity, 
  Task, 
  UserProfile,
  Pipeline,
  TimelineEvent
} from '../../types'

// Generic database operations
export class DatabaseService {
  static async create<T>(table: string, data: Omit<T, 'id' | 'created_at' | 'updated_at'>): Promise<T> {
    const { data: result, error } = await supabase
      .from(table)
      .insert(data)
      .select()
      .single()

    if (error) throw error
    return result
  }

  static async findById<T>(table: string, id: string): Promise<T | null> {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .eq('id', id)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data
  }

  static async findByUserId<T>(table: string, userId: string, limit?: number): Promise<T[]> {
    let query = supabase
      .from(table)
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (limit) {
      query = query.limit(limit)
    }

    const { data, error } = await query

    if (error) throw error
    return data || []
  }

  static async update<T>(table: string, id: string, data: Partial<T>): Promise<T> {
    const { data: result, error } = await supabase
      .from(table)
      .update(data)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return result
  }

  static async delete(table: string, id: string): Promise<void> {
    const { error } = await supabase
      .from(table)
      .delete()
      .eq('id', id)

    if (error) throw error
  }

  static async search<T>(
    table: string, 
    userId: string, 
    searchTerm: string, 
    searchColumns: string[] = ['name']
  ): Promise<T[]> {
    let query = supabase
      .from(table)
      .select('*')
      .eq('user_id', userId)

    // Build OR condition for multiple columns
    const orConditions = searchColumns
      .map(col => `${col}.ilike.%${searchTerm}%`)
      .join(',')

    query = query.or(orConditions)

    const { data, error } = await query

    if (error) throw error
    return data || []
  }
}

// User Profile operations
export class UserProfileService extends DatabaseService {
  static async getProfile(userId: string): Promise<UserProfile | null> {
    return this.findById<UserProfile>('user_profiles', userId)
  }

  static async createProfile(data: Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>): Promise<UserProfile> {
    return this.create<UserProfile>('user_profiles', data)
  }

  static async updateProfile(userId: string, data: Partial<UserProfile>): Promise<UserProfile> {
    return this.update<UserProfile>('user_profiles', userId, data)
  }
}

// Contact operations
export class ContactService extends DatabaseService {
  static async getContacts(userId: string, limit?: number): Promise<Contact[]> {
    return this.findByUserId<Contact>('contacts', userId, limit)
  }

  static async getContact(id: string): Promise<Contact | null> {
    const { data, error } = await supabase
      .from('contacts')
      .select(`
        *,
        deals:deals(count),
        activities:activities(count),
        tasks:tasks(count)
      `)
      .eq('id', id)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data
  }

  static async createContact(data: Omit<Contact, 'id' | 'created_at' | 'updated_at'>): Promise<Contact> {
    return this.create<Contact>('contacts', data)
  }

  static async updateContact(id: string, data: Partial<Contact>): Promise<Contact> {
    return this.update<Contact>('contacts', id, data)
  }

  static async deleteContact(id: string): Promise<void> {
    return this.delete('contacts', id)
  }

  static async searchContacts(userId: string, searchTerm: string): Promise<Contact[]> {
    return this.search<Contact>('contacts', userId, searchTerm, ['name', 'email', 'company', 'phone'])
  }

  static async getContactsByCompany(userId: string, company: string): Promise<Contact[]> {
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .eq('user_id', userId)
      .eq('company', company)

    if (error) throw error
    return data || []
  }

  static async getRecentContacts(userId: string, limit: number = 10): Promise<Contact[]> {
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .eq('user_id', userId)
      .order('last_contacted', { ascending: false, nullsFirst: false })
      .limit(limit)

    if (error) throw error
    return data || []
  }
}

// Deal operations
export class DealService extends DatabaseService {
  static async getDeals(userId: string, limit?: number): Promise<Deal[]> {
    const { data, error } = await supabase
      .from('deals')
      .select(`
        *,
        contact:contacts(*),
        stage:deal_stages(*),
        pipeline:pipelines(*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit || 100)

    if (error) throw error
    return data || []
  }

  static async getDeal(id: string): Promise<Deal | null> {
    const { data, error } = await supabase
      .from('deals')
      .select(`
        *,
        contact:contacts(*),
        stage:deal_stages(*),
        pipeline:pipelines(*),
        activities:activities(*),
        tasks:tasks(*)
      `)
      .eq('id', id)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data
  }

  static async createDeal(data: Omit<Deal, 'id' | 'created_at' | 'updated_at'>): Promise<Deal> {
    return this.create<Deal>('deals', data)
  }

  static async updateDeal(id: string, data: Partial<Deal>): Promise<Deal> {
    return this.update<Deal>('deals', id, data)
  }

  static async deleteDeal(id: string): Promise<void> {
    return this.delete('deals', id)
  }

  static async getDealsByStage(userId: string, stageId: string): Promise<Deal[]> {
    const { data, error } = await supabase
      .from('deals')
      .select(`
        *,
        contact:contacts(*),
        stage:deal_stages(*)
      `)
      .eq('user_id', userId)
      .eq('stage_id', stageId)

    if (error) throw error
    return data || []
  }

  static async getDealsByPipeline(userId: string, pipelineId: string): Promise<Deal[]> {
    const { data, error } = await supabase
      .from('deals')
      .select(`
        *,
        contact:contacts(*),
        stage:deal_stages(*)
      `)
      .eq('user_id', userId)
      .eq('pipeline_id', pipelineId)

    if (error) throw error
    return data || []
  }

  static async getWonDealsThisMonth(userId: string): Promise<Deal[]> {
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const { data, error } = await supabase
      .from('deals')
      .select(`
        *,
        contact:contacts(*),
        stage:deal_stages(*)
      `)
      .eq('user_id', userId)
      .gte('actual_close_date', startOfMonth.toISOString())
      .in('stage', ['won'])

    if (error) throw error
    return data || []
  }
}

// Pipeline operations
export class PipelineService extends DatabaseService {
  static async getPipelines(userId: string): Promise<Pipeline[]> {
    const { data, error } = await supabase
      .from('pipelines')
      .select(`
        *,
        stages:deal_stages(*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  static async getDefaultPipeline(userId: string): Promise<Pipeline | null> {
    const { data, error } = await supabase
      .from('pipelines')
      .select(`
        *,
        stages:deal_stages(*)
      `)
      .eq('user_id', userId)
      .eq('is_default', true)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data
  }

  static async createPipeline(data: Omit<Pipeline, 'id' | 'created_at' | 'updated_at'>): Promise<Pipeline> {
    return this.create<Pipeline>('pipelines', data)
  }

  static async updatePipeline(id: string, data: Partial<Pipeline>): Promise<Pipeline> {
    return this.update<Pipeline>('pipelines', id, data)
  }

  static async deletePipeline(id: string): Promise<void> {
    return this.delete('pipelines', id)
  }
}

// Activity operations
export class ActivityService extends DatabaseService {
  static async getActivities(userId: string, limit?: number): Promise<Activity[]> {
    const { data, error } = await supabase
      .from('activities')
      .select(`
        *,
        contact:contacts(*),
        deal:deals(*)
      `)
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(limit || 50)

    if (error) throw error
    return data || []
  }

  static async getActivitiesForContact(contactId: string, limit?: number): Promise<Activity[]> {
    const { data, error } = await supabase
      .from('activities')
      .select(`
        *,
        contact:contacts(*),
        deal:deals(*)
      `)
      .eq('contact_id', contactId)
      .order('date', { ascending: false })
      .limit(limit || 20)

    if (error) throw error
    return data || []
  }

  static async createActivity(data: Omit<Activity, 'id' | 'created_at' | 'updated_at'>): Promise<Activity> {
    return this.create<Activity>('activities', data)
  }

  static async updateActivity(id: string, data: Partial<Activity>): Promise<Activity> {
    return this.update<Activity>('activities', id, data)
  }

  static async deleteActivity(id: string): Promise<void> {
    return this.delete('activities', id)
  }
}

// Task operations
export class TaskService extends DatabaseService {
  static async getTasks(userId: string, limit?: number): Promise<Task[]> {
    const { data, error } = await supabase
      .from('tasks')
      .select(`
        *,
        contact:contacts(*),
        deal:deals(*)
      `)
      .eq('user_id', userId)
      .order('due_date', { ascending: true, nullsFirst: false })
      .limit(limit || 50)

    if (error) throw error
    return data || []
  }

  static async getTasksDueToday(userId: string): Promise<Task[]> {
    const today = new Date()
    today.setHours(23, 59, 59, 999)
    const todayStr = today.toISOString().split('T')[0]

    const { data, error } = await supabase
      .from('tasks')
      .select(`
        *,
        contact:contacts(*),
        deal:deals(*)
      `)
      .eq('user_id', userId)
      .eq('completed', false)
      .lte('due_date', todayStr)

    if (error) throw error
    return data || []
  }

  static async getOverdueTasks(userId: string): Promise<Task[]> {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().split('T')[0]

    const { data, error } = await supabase
      .from('tasks')
      .select(`
        *,
        contact:contacts(*),
        deal:deals(*)
      `)
      .eq('user_id', userId)
      .eq('completed', false)
      .lt('due_date', yesterdayStr)

    if (error) throw error
    return data || []
  }

  static async createTask(data: Omit<Task, 'id' | 'created_at' | 'updated_at'>): Promise<Task> {
    return this.create<Task>('tasks', data)
  }

  static async updateTask(id: string, data: Partial<Task>): Promise<Task> {
    return this.update<Task>('tasks', id, data)
  }

  static async completeTask(id: string): Promise<Task> {
    return this.update<Task>('tasks', id, { 
      completed: true, 
      completed_at: new Date().toISOString() 
    })
  }

  static async deleteTask(id: string): Promise<void> {
    return this.delete('tasks', id)
  }
}

// Dashboard statistics
export class DashboardService {
  static async getDashboardStats(userId: string) {
    const [
      contacts,
      deals,
      wonDealsThisMonth,
      tasksDueToday,
      overdueTasks,
      recentActivities
    ] = await Promise.all([
      ContactService.getContacts(userId),
      DealService.getDeals(userId),
      DealService.getWonDealsThisMonth(userId),
      TaskService.getTasksDueToday(userId),
      TaskService.getOverdueTasks(userId),
      ActivityService.getActivities(userId, 10)
    ])

    const totalRevenue = wonDealsThisMonth.reduce((sum, deal) => sum + deal.amount, 0)
    const pipelineValue = deals
      .filter(deal => !['won', 'lost'].includes(deal.stage))
      .reduce((sum, deal) => sum + deal.amount, 0)

    return {
      total_contacts: contacts.length,
      total_deals: deals.length,
      total_revenue: totalRevenue,
      deals_won_this_month: wonDealsThisMonth.length,
      pipeline_value: pipelineValue,
      conversion_rate: deals.length > 0 ? (wonDealsThisMonth.length / deals.length) * 100 : 0,
      average_deal_size: wonDealsThisMonth.length > 0 ? totalRevenue / wonDealsThisMonth.length : 0,
      tasks_due_today: tasksDueToday.length,
      overdue_tasks: overdueTasks.length,
      recent_activities: recentActivities
    }
  }

  static async getRevenueChartData(userId: string, months: number = 6) {
    const startDate = new Date()
    startDate.setMonth(startDate.getMonth() - months)

    const { data, error } = await supabase
      .from('deals')
      .select('amount, actual_close_date')
      .eq('user_id', userId)
      .gte('actual_close_date', startDate.toISOString())
      .not('actual_close_date', 'is', null)
      .order('actual_close_date')

    if (error) throw error

    // Group by month
    const monthlyRevenue: Record<string, number> = {}
    data?.forEach(deal => {
      const month = deal.actual_close_date.substring(0, 7) // YYYY-MM
      monthlyRevenue[month] = (monthlyRevenue[month] || 0) + deal.amount
    })

    return Object.entries(monthlyRevenue).map(([month, revenue]) => ({
      name: month,
      value: revenue
    }))
  }

  static async getDealsByStageData(userId: string) {
    const { data, error } = await supabase
      .from('deals')
      .select('stage, amount')
      .eq('user_id', userId)

    if (error) throw error

    // Group by stage
    const stageData: Record<string, { value: number; color: string }> = {}
    const stageColors: Record<string, string> = {
      prospect: '#3B82F6',
      qualified: '#8B5CF6',
      proposal: '#F59E0B',
      negotiation: '#EAB308',
      won: '#10B981',
      lost: '#EF4444'
    }

    data?.forEach(deal => {
      const stageName = deal.stage || 'Unknown'
      const stageColor = stageColors[deal.stage as keyof typeof stageColors] || '#6B7280'
      
      if (!stageData[stageName]) {
        stageData[stageName] = { value: 0, color: stageColor }
      }
      stageData[stageName].value += deal.amount
    })

    return Object.entries(stageData).map(([name, data]) => ({
      name,
      value: data.value,
      color: data.color
    }))
  }
}

// Timeline operations
export class TimelineService extends DatabaseService {
  static async getTimelineEvents(contactId: string, limit?: number): Promise<TimelineEvent[]> {
    const { data, error } = await supabase
      .from('timeline_events')
      .select('*')
      .eq('contact_id', contactId)
      .order('date', { ascending: false })
      .limit(limit || 50)

    if (error) throw error
    return data || []
  }

  static async createTimelineEvent(data: Omit<TimelineEvent, 'id' | 'created_at'>): Promise<TimelineEvent> {
    return this.create<TimelineEvent>('timeline_events', data)
  }
}

// Classes are already individually exported above
// No need for additional export statement
