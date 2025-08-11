import { supabase } from '@/lib/supabase'
import type { Database } from '@/types/database'
import { UserCompanyService } from './userCompanyService'

type Product = Database['public']['Tables']['products']['Row']
type ProductInsert = Database['public']['Tables']['products']['Insert']
type ProductUpdate = Database['public']['Tables']['products']['Update']

export class ProductService {
  // Hämta alla produkter för användarens företag
  static async getProducts(): Promise<Product[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const companyId = await UserCompanyService.getUserPrimaryCompany(user.id)
      if (!companyId) throw new Error('User not associated with any company')

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('company_id', companyId)
        .eq('is_active', true)
        .order('name')

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching products:', error)
      return []
    }
  }

  // Hämta produkt efter ID
  static async getProduct(id: string): Promise<Product | null> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error fetching product:', error)
      return null
    }
  }

  // Skapa ny produkt
  static async createProduct(product: Omit<ProductInsert, 'company_id'>): Promise<Product | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const companyId = await UserCompanyService.getUserPrimaryCompany(user.id)
      if (!companyId) throw new Error('User not associated with any company')

      const insert: ProductInsert = {
        ...product,
        company_id: companyId
      }

      const { data, error } = await supabase
        .from('products')
        .insert(insert)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error creating product:', error)
      return null
    }
  }

  // Uppdatera produkt
  static async updateProduct(id: string, updates: ProductUpdate): Promise<Product | null> {
    try {
      const { data, error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error updating product:', error)
      return null
    }
  }

  // Ta bort produkt (soft delete)
  static async deleteProduct(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('products')
        .update({ is_active: false })
        .eq('id', id)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error deleting product:', error)
      return false
    }
  }

  // Hämta produkter efter kategori
  static async getProductsByCategory(category: string): Promise<Product[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const companyId = await UserCompanyService.getUserPrimaryCompany(user.id)
      if (!companyId) throw new Error('User not associated with any company')

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('company_id', companyId)
        .eq('category', category)
        .eq('is_active', true)
        .order('name')

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching products by category:', error)
      return []
    }
  }

  // Hämta alla kategorier
  static async getCategories(): Promise<string[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const companyId = await UserCompanyService.getUserPrimaryCompany(user.id)
      if (!companyId) throw new Error('User not associated with any company')

      const { data, error } = await supabase
        .from('products')
        .select('category')
        .eq('company_id', companyId)
        .eq('is_active', true)

      if (error) throw error
      
      const categories = data?.map(item => item.category) || []
      return [...new Set(categories)].sort()
    } catch (error) {
      console.error('Error fetching categories:', error)
      return []
    }
  }

  // Sök produkter
  static async searchProducts(query: string): Promise<Product[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const companyId = await UserCompanyService.getUserPrimaryCompany(user.id)
      if (!companyId) throw new Error('User not associated with any company')

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('company_id', companyId)
        .eq('is_active', true)
        .or(`name.ilike.%${query}%,description.ilike.%${query}%,category.ilike.%${query}%`)
        .order('name')

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error searching products:', error)
      return []
    }
  }

  // Lägg till metod för kompatibilitet med gamla systemet
  static async searchProducts_old(searchTerm: string): Promise<Product[]> {
    return this.searchProducts(searchTerm)
  }

  // Hämta produktstatistik för företaget
  static async getProductStats() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const companyId = await UserCompanyService.getUserPrimaryCompany(user.id)
      if (!companyId) throw new Error('User not associated with any company')

      const { data, error } = await supabase
        .from('products')
        .select('category, is_active')
        .eq('company_id', companyId)

      if (error) throw error

      const totalProducts = data?.length || 0
      const activeProducts = data?.filter(p => p.is_active).length || 0
      const categories = [...new Set(data?.filter(p => p.is_active).map(p => p.category) || [])].length

      return {
        totalProducts,
        activeProducts,
        categories,
        inactiveProducts: totalProducts - activeProducts
      }
    } catch (error) {
      console.error('Error fetching product stats:', error)
      return {
        totalProducts: 0,
        activeProducts: 0,
        categories: 0,
        inactiveProducts: 0
      }
    }
  }
}
