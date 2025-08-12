import { supabase } from '@/lib/supabase'
import { UserCompanyService } from './userCompanyService'

export interface UIProduct {
  id: string
  name: string
  description: string
  category: string
  price: number
  unit: string
}

function toUIProduct(row: Record<string, unknown>): UIProduct {
  const id = String(row['id'])
  const name = row['name'] !== undefined ? String(row['name']) : ''
  const description = row['description'] !== undefined ? String(row['description']) : ''
  const categorySource = row['category'] ?? row['sku']
  const category = categorySource !== undefined ? String(categorySource) : 'Okategoriserad'
  const priceRaw = row['price']
  const price = typeof priceRaw === 'number' ? priceRaw : Number(priceRaw ?? 0) || 0
  const unit = row['unit'] !== undefined ? String(row['unit']) : 'styck'
  return { id, name, description, category, price, unit }
}

export class ProductService {
  static async getProducts(): Promise<UIProduct[]> {
    try {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User not authenticated')

  const companyId = await UserCompanyService.getUserPrimaryCompany()
  if (!companyId) return []

      // Try a safe select with a company filter if possible; fallback to unfiltered select (RLS should protect visibility)
    let res = companyId
    ? await supabase
      .from('products')
      .select('id, name, description, price, unit')
      .eq('company_id', companyId)
      .order('name')
    : await supabase
      .from('products')
      .select('id, name, description, price, unit')
      .order('name')

      if (res.error) {
  // Fallback: retry with the same minimal set of columns
        res = companyId
          ? await supabase
              .from('products')
              .select('id, name, description, price, unit')
              .eq('company_id', companyId)
              .order('name')
          : await supabase
              .from('products')
              .select('id, name, description, price, unit')
              .order('name')
      }

      if (res.error) throw res.error

      const rows = (res.data ?? []) as Record<string, unknown>[]
      return rows.map(toUIProduct)
    } catch (error) {
      console.error('Error fetching products:', error)
      return []
    }
  }

  static async getProduct(id: string): Promise<UIProduct | null> {
    try {
      // Prefer a broader select first; fallback to minimal
      let res = await supabase
        .from('products')
        .select('id, name, description, price, unit, sku')
        .eq('id', id)
        .single()

      if (res.error) {
        res = await supabase
          .from('products')
          .select('id, name, description, price, unit')
          .eq('id', id)
          .single()
      }

      if (res.error) throw res.error
      return toUIProduct((res.data ?? {}) as Record<string, unknown>)
    } catch (error) {
      console.error('Error fetching product:', error)
      return null
    }
  }

  static async createProduct(product: { name: string; description?: string; category?: string; price: number; unit?: string }): Promise<UIProduct | null> {
    try {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User not authenticated')
  let companyId = await UserCompanyService.getUserPrimaryCompany()
  if (!companyId) {
    companyId = await UserCompanyService.getOrCreatePrimaryCompany()
  }
  if (!companyId) throw new Error('User not associated with any company')

      // Try inserting with a category column; fallback to minimal columns only
      let ins = await supabase
        .from('products')
        .insert({
          ...(companyId ? { company_id: companyId } : {}),
          name: product.name,
          description: product.description ?? '',
          category: product.category ?? 'Okategoriserad',
          price: product.price,
          unit: product.unit ?? 'styck',
        })
        .select('id, name, description, price, unit, sku')
        .single()

      if (ins.error) {
        ins = await supabase
          .from('products')
          .insert({
            ...(companyId ? { company_id: companyId } : {}),
            name: product.name,
            description: product.description ?? '',
            price: product.price,
            unit: product.unit ?? 'styck',
          })
          .select('id, name, description, price, unit')
          .single()
      }

      if (ins.error) throw ins.error
      return toUIProduct((ins.data ?? {}) as Record<string, unknown>)
    } catch (error) {
      console.error('Error creating product:', error)
      return null
    }
  }

  static async updateProduct(id: string, updates: { name?: string; description?: string; category?: string; price?: number; unit?: string }): Promise<UIProduct | null> {
    try {
      let upd = await supabase
        .from('products')
        .update({
          name: updates.name,
          description: updates.description,
          category: updates.category,
          price: updates.price,
          unit: updates.unit,
        })
        .eq('id', id)
        .select('id, name, description, price, unit, sku')
        .single()

      if (upd.error) {
        upd = await supabase
          .from('products')
          .update({
            name: updates.name,
            description: updates.description,
            price: updates.price,
            unit: updates.unit,
          })
          .eq('id', id)
          .select('id, name, description, price, unit')
          .single()
      }

      if (upd.error) throw upd.error
      return toUIProduct((upd.data ?? {}) as Record<string, unknown>)
    } catch (error) {
      console.error('Error updating product:', error)
      return null
    }
  }

  static async deleteProduct(id: string): Promise<boolean> {
    try {
      let res = await supabase
        .from('products')
        .update({ is_active: false })
        .eq('id', id)

      if (res.error) {
        res = await supabase
          .from('products')
          .delete()
          .eq('id', id)
      }

      if (res.error) throw res.error
      return true
    } catch (error) {
      console.error('Error deleting product:', error)
      return false
    }
  }

  static async getProductsByCategory(category: string): Promise<UIProduct[]> {
    try {
  // Reuse getProducts and filter client-side to avoid schema assumptions
  const products = await this.getProducts()
  if (category === 'all') return products
  return products.filter(p => p.category === category)
    } catch (error) {
      console.error('Error fetching products by category:', error)
      return []
    }
  }

  static async getCategories(): Promise<string[]> {
    try {
      const products = await this.getProducts()
      const cats = [...new Set(products.map(p => p.category).filter(Boolean))]
      return ['all', ...cats].filter((v, i, a) => a.indexOf(v) === i)
    } catch (error) {
      console.error('Error fetching categories:', error)
      return ['all']
    }
  }

  static async searchProducts(query: string): Promise<UIProduct[]> {
    try {
      // Fetch and filter client-side to avoid referencing missing columns
      const products = await this.getProducts()
      const q = query.trim().toLowerCase()
      if (!q) return products
      return products.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      )
    } catch (error) {
      console.error('Error searching products:', error)
      return []
    }
  }

  static async searchProducts_old(searchTerm: string): Promise<UIProduct[]> {
    return this.searchProducts(searchTerm)
  }

  static async getProductStats() {
    try {
      const products = await this.getProducts()
      const totalProducts = products.length
      const activeProducts = totalProducts
      const categories = [...new Set(products.map(p => p.category))].length
      return {
        totalProducts,
        activeProducts,
        categories,
        inactiveProducts: 0
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
