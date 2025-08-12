import { supabase } from '@/lib/supabase'
import { UserCompanyService } from './userCompanyService'
import type { Task } from '@/types'

export interface CreateTaskData {
  title: string
  description?: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'todo' | 'in_progress' | 'done' | 'blocked'
  due_date?: string
  estimated_time?: number // in minutes
  contact_id?: string
  deal_id?: string
  tags?: string[]
  recurring?: {
    type: 'daily' | 'weekly' | 'monthly' | 'none'
    interval?: number
    end_date?: string
  }
  subtasks?: string[]
  notes?: string
}

export interface TaskWithDetails extends Task {
  contact?: {
    name: string
    email: string
    company: string
  }
  deal?: {
    title: string
    amount: number
  }
  subtasks?: string[]
  tags?: string[]
  estimated_time?: number
  recurring?: {
    type: 'daily' | 'weekly' | 'monthly' | 'none'
    interval?: number
    end_date?: string
  }
}

export class TaskService {
  static async getTasks(): Promise<TaskWithDetails[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return []

      const companyId = await UserCompanyService.getUserPrimaryCompany()
      if (!companyId) {
        console.log('User not associated with any company')
        return []
      }

      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('company_id', companyId)
        .order('due_date', { ascending: true })
        .order('priority', { ascending: false })
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching tasks:', error)
        return []
      }

      // Transform data to match TaskWithDetails interface
      const tasksWithDetails: TaskWithDetails[] = (data || []).map(task => ({
        ...task,
        contact: undefined, // contacts table doesn't exist yet
        deal: undefined,    // deals table doesn't exist yet
        subtasks: task.subtasks || [],
        tags: task.tags || [],
        estimated_time: task.estimated_time || undefined,
        recurring: task.recurring || { type: 'none' }
      }))

      return tasksWithDetails
    } catch (error) {
      console.error('Error fetching tasks:', error)
      return []
    }
  }

  static async getTasksByStatus(status: string): Promise<TaskWithDetails[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return []

      const companyId = await UserCompanyService.getUserPrimaryCompany()
      if (!companyId) return []

      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('company_id', companyId)
        .eq('status', status)
        .order('due_date', { ascending: true })
        .order('priority', { ascending: false })

      if (error) {
        console.error('Error fetching tasks by status:', error)
        return []
      }

      return this.transformTasks(data || [])
    } catch (error) {
      console.error('Error fetching tasks by status:', error)
      return []
    }
  }

  static async getTasksByPriority(priority: string): Promise<TaskWithDetails[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return []

      const companyId = await UserCompanyService.getUserPrimaryCompany()
      if (!companyId) return []

      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('company_id', companyId)
        .eq('priority', priority)
        .order('due_date', { ascending: true })

      if (error) {
        console.error('Error fetching tasks by priority:', error)
        return []
      }

      return this.transformTasks(data || [])
    } catch (error) {
      console.error('Error fetching tasks by priority:', error)
      return []
    }
  }

  static async getTasksDueToday(): Promise<TaskWithDetails[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return []

      const companyId = await UserCompanyService.getUserPrimaryCompany()
      if (!companyId) return []

      const today = new Date()
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
      const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)

      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('company_id', companyId)
        .gte('due_date', startOfDay.toISOString())
        .lt('due_date', endOfDay.toISOString())
        .order('priority', { ascending: false })
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching tasks due today:', error)
        return []
      }

      return this.transformTasks(data || [])
    } catch (error) {
      console.error('Error fetching tasks due today:', error)
      return []
    }
  }

  static async getTasksDueThisWeek(): Promise<TaskWithDetails[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return []

      const companyId = await UserCompanyService.getUserPrimaryCompany()
      if (!companyId) return []

      const today = new Date()
      const endOfWeek = new Date(today)
      endOfWeek.setDate(today.getDate() + 7)

      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('company_id', companyId)
        .gte('due_date', today.toISOString())
        .lte('due_date', endOfWeek.toISOString())
        .order('due_date', { ascending: true })
        .order('priority', { ascending: false })

      if (error) {
        console.error('Error fetching tasks due this week:', error)
        return []
      }

      return this.transformTasks(data || [])
    } catch (error) {
      console.error('Error fetching tasks due this week:', error)
      return []
    }
  }

  static async getOverdueTasks(): Promise<TaskWithDetails[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return []

      const companyId = await UserCompanyService.getUserPrimaryCompany()
      if (!companyId) return []

      const today = new Date()

      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('company_id', companyId)
        .lt('due_date', today.toISOString())
        .neq('status', 'done')
        .order('due_date', { ascending: true })
        .order('priority', { ascending: false })

      if (error) {
        console.error('Error fetching overdue tasks:', error)
        return []
      }

      return this.transformTasks(data || [])
    } catch (error) {
      console.error('Error fetching overdue tasks:', error)
      return []
    }
  }

  static async createTask(taskData: CreateTaskData): Promise<Task | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const companyId = await UserCompanyService.getUserPrimaryCompany()
      if (!companyId) {
        throw new Error('User not associated with any company')
      }

      // Prepare task data for database
      const taskToInsert = {
        company_id: companyId,
        created_by: user.id,
        title: taskData.title,
        description: taskData.description || null,
        priority: taskData.priority,
        status: taskData.status,
        due_date: taskData.due_date || null,
        estimated_time: taskData.estimated_time || null,
        contact_id: taskData.contact_id || null,
        deal_id: taskData.deal_id || null,
        tags: taskData.tags || [],
        recurring: taskData.recurring || null,
        subtasks: taskData.subtasks || [],
        notes: taskData.notes || null
      }

      const { data, error } = await supabase
        .from('tasks')
        .insert(taskToInsert)
        .select()
        .single()

      if (error) {
        console.error('Error creating task:', error)
        throw error
      }

      return data
    } catch (error) {
      console.error('Error creating task:', error)
      throw error
    }
  }

  static async updateTask(id: string, updates: Partial<Task>): Promise<Task | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const companyId = await UserCompanyService.getUserPrimaryCompany()
      if (!companyId) {
        throw new Error('User not associated with any company')
      }

      const { data, error } = await supabase
        .from('tasks')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('company_id', companyId)
        .select()
        .single()

      if (error) {
        console.error('Error updating task:', error)
        throw error
      }

      return data
    } catch (error) {
      console.error('Error updating task:', error)
      throw error
    }
  }

  static async deleteTask(id: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const companyId = await UserCompanyService.getUserPrimaryCompany()
      if (!companyId) {
        throw new Error('User not associated with any company')
      }

      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id)
        .eq('company_id', companyId)

      if (error) {
        console.error('Error deleting task:', error)
        throw error
      }

      return true
    } catch (error) {
      console.error('Error deleting task:', error)
      throw error
    }
  }

  static async completeTask(id: string, completed: boolean): Promise<Task | null> {
    try {
      const status = completed ? 'done' : 'todo'
      return await this.updateTask(id, { status })
    } catch (error) {
      console.error('Error completing task:', error)
      throw error
    }
  }

  static async startTask(id: string): Promise<Task | null> {
    try {
      return await this.updateTask(id, { status: 'in_progress' })
    } catch (error) {
      console.error('Error starting task:', error)
      throw error
    }
  }

  static async blockTask(id: string, reason?: string): Promise<Task | null> {
    try {
      const updates: Partial<Task> = { status: 'blocked' }
      if (reason) {
        updates.notes = reason
      }
      return await this.updateTask(id, updates)
    } catch (error) {
      console.error('Error blocking task:', error)
      throw error
    }
  }

  static async addSubtask(taskId: string, subtask: string): Promise<Task | null> {
    try {
      const currentTask = await this.getTaskById(taskId)
      if (!currentTask) throw new Error('Task not found')

      const currentSubtasks = currentTask.subtasks || []
      const updatedSubtasks = [...currentSubtasks, subtask]

      return await this.updateTask(taskId, { subtasks: updatedSubtasks })
    } catch (error) {
      console.error('Error adding subtask:', error)
      throw error
    }
  }

  static async removeSubtask(taskId: string, subtaskIndex: number): Promise<Task | null> {
    try {
      const currentTask = await this.getTaskById(taskId)
      if (!currentTask) throw new Error('Task not found')

      const currentSubtasks = currentTask.subtasks || []
      const updatedSubtasks = currentSubtasks.filter((_, index) => index !== subtaskIndex)

      return await this.updateTask(taskId, { subtasks: updatedSubtasks })
    } catch (error) {
      console.error('Error removing subtask:', error)
      throw error
    }
  }

  static async getTaskById(id: string): Promise<TaskWithDetails | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return null

      const companyId = await UserCompanyService.getUserPrimaryCompany()
      if (!companyId) return null

      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', id)
        .eq('company_id', companyId)
        .single()

      if (error) {
        console.error('Error fetching task by id:', error)
        return null
      }

      return this.transformTasks([data])[0] || null
    } catch (error) {
      console.error('Error fetching task by id:', error)
      return null
    }
  }

  static async searchTasks(query: string): Promise<TaskWithDetails[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return []

      const companyId = await UserCompanyService.getUserPrimaryCompany()
      if (!companyId) return []

      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('company_id', companyId)
        .or(`title.ilike.%${query}%,description.ilike.%${query}%,notes.ilike.%${query}%`)
        .order('due_date', { ascending: true })
        .order('priority', { ascending: false })

      if (error) {
        console.error('Error searching tasks:', error)
        return []
      }

      return this.transformTasks(data || [])
    } catch (error) {
      console.error('Error searching tasks:', error)
      return []
    }
  }

  static async getTaskStats(): Promise<{
    total: number
    completed: number
    pending: number
    overdue: number
  }> {
    try {
      const allTasks = await this.getTasks()
      const overdueTasks = await this.getOverdueTasks()

      return {
        total: allTasks.length,
        completed: allTasks.filter(t => t.status === 'done').length,
        pending: allTasks.filter(t => t.status !== 'done').length,
        overdue: overdueTasks.length
      }
    } catch (error) {
      console.error('Error getting task stats:', error)
      return {
        total: 0,
        completed: 0,
        pending: 0,
        overdue: 0
      }
    }
  }

  static async getTaskStatistics(): Promise<{
    total: number
    todo: number
    in_progress: number
    done: number
    blocked: number
    overdue: number
    due_today: number
    due_this_week: number
    high_priority: number
    urgent: number
  }> {
    try {
      const allTasks = await this.getTasks()
      const overdueTasks = await this.getOverdueTasks()
      const dueTodayTasks = await this.getTasksDueToday()
      const dueThisWeekTasks = await this.getTasksDueThisWeek()

      return {
        total: allTasks.length,
        todo: allTasks.filter(t => t.status === 'todo').length,
        in_progress: allTasks.filter(t => t.status === 'in_progress').length,
        done: allTasks.filter(t => t.status === 'done').length,
        blocked: allTasks.filter(t => t.status === 'blocked').length,
        overdue: overdueTasks.length,
        due_today: dueTodayTasks.length,
        due_this_week: dueThisWeekTasks.length,
        high_priority: allTasks.filter(t => t.priority === 'high').length,
        urgent: allTasks.filter(t => t.priority === 'urgent').length
      }
    } catch (error) {
      console.error('Error getting task statistics:', error)
      return {
        total: 0,
        todo: 0,
        in_progress: 0,
        done: 0,
        blocked: 0,
        overdue: 0,
        due_today: 0,
        due_this_week: 0,
        high_priority: 0,
        urgent: 0
      }
    }
  }

  // Helper method to transform raw task data
  private static transformTasks(tasks: any[]): TaskWithDetails[] {
    return tasks.map(task => ({
      ...task,
      contact: undefined, // contacts table doesn't exist yet
      deal: undefined,    // deals table doesn't exist yet
      subtasks: task.subtasks || [],
      tags: task.tags || [],
      estimated_time: task.estimated_time || undefined,
      recurring: task.recurring || { type: 'none' }
    }))
  }
}
