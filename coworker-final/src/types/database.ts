export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      companies: {
        Row: {
          id: string
          name: string
          org_number: string | null
          email: string | null
          phone: string | null
          address: string | null
          city: string | null
          postal_code: string | null
          website: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          org_number?: string | null
          email?: string | null
          phone?: string | null
          address?: string | null
          city?: string | null
          postal_code?: string | null
          website?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          org_number?: string | null
          email?: string | null
          phone?: string | null
          address?: string | null
          city?: string | null
          postal_code?: string | null
          website?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      user_companies: {
        Row: {
          id: string
          user_id: string
          company_id: string
          role: 'admin' | 'user' | 'viewer'
          is_primary: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          company_id: string
          role?: 'admin' | 'user' | 'viewer'
          is_primary?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          company_id?: string
          role?: 'admin' | 'user' | 'viewer'
          is_primary?: boolean
          created_at?: string
        }
      }
      products: {
        Row: {
          id: string
          company_id: string
          name: string
          description: string | null
          category: string
          price: number
          unit: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          name: string
          description?: string | null
          category: string
          price: number
          unit?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          name?: string
          description?: string | null
          category?: string
          price?: number
          unit?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      customers: {
        Row: {
          id: string
          company_id: string
          name: string
          email: string
          phone: string | null
          company_name: string | null
          address: string | null
          city: string | null
          postal_code: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          name: string
          email: string
          phone?: string | null
          company_name?: string | null
          address?: string | null
          city?: string | null
          postal_code?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          name?: string
          email?: string
          phone?: string | null
          company_name?: string | null
          address?: string | null
          city?: string | null
          postal_code?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      quotes: {
        Row: {
          id: string
          user_id: string
          company_id: string
          customer_id: string
          quote_number: string
          title: string | null
          status: 'draft' | 'sent' | 'viewed' | 'accepted' | 'rejected' | 'expired'
          subtotal: number
          tax_rate: number
          tax_amount: number
          total_amount: number
          global_discount: number | null
          notes: string | null
          valid_until: string | null
          sent_at: string | null
          viewed_at: string | null
          accepted_at: string | null
          rejected_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          company_id: string
          customer_id: string
          quote_number: string
          title?: string | null
          status?: 'draft' | 'sent' | 'viewed' | 'accepted' | 'rejected' | 'expired'
          subtotal?: number
          tax_rate?: number
          tax_amount?: number
          total_amount?: number
          global_discount?: number | null
          notes?: string | null
          valid_until?: string | null
          sent_at?: string | null
          viewed_at?: string | null
          accepted_at?: string | null
          rejected_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          company_id?: string
          customer_id?: string
          quote_number?: string
          title?: string | null
          status?: 'draft' | 'sent' | 'viewed' | 'accepted' | 'rejected' | 'expired'
          subtotal?: number
          tax_rate?: number
          tax_amount?: number
          total_amount?: number
          global_discount?: number | null
          notes?: string | null
          valid_until?: string | null
          sent_at?: string | null
          viewed_at?: string | null
          accepted_at?: string | null
          rejected_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      quote_items: {
        Row: {
          id: string
          quote_id: string
          product_id: string | null
          description: string
          quantity: number
          unit_price: number
          discount_percent: number | null
          total: number
          sort_order: number | null
          created_at: string
        }
        Insert: {
          id?: string
          quote_id: string
          product_id?: string | null
          description: string
          quantity: number
          unit_price: number
          discount_percent?: number | null
          total: number
          sort_order?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          quote_id?: string
          product_id?: string | null
          description?: string
          quantity?: number
          unit_price?: number
          discount_percent?: number | null
          total?: number
          sort_order?: number | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_company_id: {
        Args: {
          user_uuid: string
        }
        Returns: string | null
      }
      generate_quote_number: {
        Args: {
          company_uuid: string
        }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}
