import { supabase } from '@/lib/supabase'
import type { Database } from '@/types/database'
import { UserCompanyService } from './userCompanyService'

type Customer = Database['public']['Tables']['customers']['Row']
type CustomerInsert = Database['public']['Tables']['customers']['Insert']
type CustomerUpdate = Database['public']['Tables']['customers']['Update']

export class CustomerService {
  // Hämta alla kunder för användarens företag
  static async getCustomers(): Promise<Customer[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

  const companyId = await UserCompanyService.getUserPrimaryCompany()
      if (!companyId) throw new Error('User not associated with any company')

      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('company_id', companyId)
        .order('name')

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching customers:', error)
      return []
    }
  }

  // Hämta kund efter ID
  static async getCustomer(id: string): Promise<Customer | null> {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error fetching customer:', error)
      return null
    }
  }

  // Skapa ny kund
  static async createCustomer(customer: Omit<CustomerInsert, 'company_id'>): Promise<Customer | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

  const companyId = await UserCompanyService.getUserPrimaryCompany()
      if (!companyId) throw new Error('User not associated with any company')

      const insert: CustomerInsert = {
        ...customer,
        company_id: companyId
      }

      const { data, error } = await supabase
        .from('customers')
        .insert(insert)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error creating customer:', error)
      return null
    }
  }

  // Uppdatera kund
  static async updateCustomer(id: string, updates: CustomerUpdate): Promise<Customer | null> {
    try {
      const { data, error } = await supabase
        .from('customers')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error updating customer:', error)
      return null
    }
  }

  // Ta bort kund
  static async deleteCustomer(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', id)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error deleting customer:', error)
      return false
    }
  }

  // Sök kunder
  static async searchCustomers(query: string): Promise<Customer[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

  const companyId = await UserCompanyService.getUserPrimaryCompany()
      if (!companyId) throw new Error('User not associated with any company')

      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('company_id', companyId)
        .or(`name.ilike.%${query}%,company_name.ilike.%${query}%,email.ilike.%${query}%`)
        .order('name')

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error searching customers:', error)
      return []
    }
  }

  // Hämta kundstatistik för företaget
  static async getCustomerStats() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

  const companyId = await UserCompanyService.getUserPrimaryCompany()
      if (!companyId) throw new Error('User not associated with any company')

      const { data, error } = await supabase
        .from('customers')
        .select('id, created_at')
        .eq('company_id', companyId)

      if (error) throw error

      const totalCustomers = data?.length || 0
      const currentMonth = new Date().getMonth()
      const currentYear = new Date().getFullYear()
      
      const newThisMonth = data?.filter(customer => {
        const createdDate = new Date(customer.created_at)
        return createdDate.getMonth() === currentMonth && createdDate.getFullYear() === currentYear
      }).length || 0

      return {
        totalCustomers,
        newThisMonth
      }
    } catch (error) {
      console.error('Error fetching customer stats:', error)
      return {
        totalCustomers: 0,
        newThisMonth: 0
      }
    }
  }
}
