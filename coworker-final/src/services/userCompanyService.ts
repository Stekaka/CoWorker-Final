import { supabase } from '@/lib/supabase'
import type { Database } from '@/types/database'

type UserCompany = Database['public']['Tables']['user_companies']['Row']
type UserCompanyInsert = Database['public']['Tables']['user_companies']['Insert']

export class UserCompanyService {
  // Hämta användarens primära företag
  static async getUserPrimaryCompany(userId: string): Promise<string | null> {
    try {
      const { data } = await supabase.rpc('get_user_company_id', {
        user_uuid: userId
      })
      
      return data
    } catch (error) {
      console.error('Error getting user company:', error)
      return null
    }
  }

  // Hämta alla företag för en användare
  static async getUserCompanies(userId: string): Promise<UserCompany[]> {
    try {
      const { data, error } = await supabase
        .from('user_companies')
        .select(`
          *,
          companies:company_id (
            id,
            name,
            org_number,
            email
          )
        `)
        .eq('user_id', userId)
        .order('is_primary', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching user companies:', error)
      return []
    }
  }

  // Lägg till användare till företag
  static async addUserToCompany(
    userId: string, 
    companyId: string, 
    role: 'admin' | 'user' | 'viewer' = 'user',
    isPrimary: boolean = false
  ): Promise<UserCompany | null> {
    try {
      const insert: UserCompanyInsert = {
        user_id: userId,
        company_id: companyId,
        role,
        is_primary: isPrimary
      }

      const { data, error } = await supabase
        .from('user_companies')
        .insert(insert)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error adding user to company:', error)
      return null
    }
  }

  // Sätt ett företag som primärt för användaren
  static async setPrimaryCompany(userId: string, companyId: string): Promise<boolean> {
    try {
      // Först, sätt alla andra till false
      await supabase
        .from('user_companies')
        .update({ is_primary: false })
        .eq('user_id', userId)

      // Sedan sätt det valda till true
      const { error } = await supabase
        .from('user_companies')
        .update({ is_primary: true })
        .eq('user_id', userId)
        .eq('company_id', companyId)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error setting primary company:', error)
      return false
    }
  }

  // Ta bort användare från företag
  static async removeUserFromCompany(userId: string, companyId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_companies')
        .delete()
        .eq('user_id', userId)
        .eq('company_id', companyId)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error removing user from company:', error)
      return false
    }
  }
}
