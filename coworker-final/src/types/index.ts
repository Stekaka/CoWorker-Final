// Minimal Database types aligned with Supabase schema
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      companies: {
        Row: { id: string; name: string; created_at: string; updated_at: string }
        Insert: { id?: string; name: string; created_at?: string; updated_at?: string }
        Update: Partial<{ id: string; name: string; created_at: string; updated_at: string }>
        Relationships: []
      }
      profiles: {
        Row: { id: string; full_name: string | null; avatar_url: string | null; created_at: string; updated_at: string }
        Insert: { id: string; full_name?: string | null; avatar_url?: string | null; created_at?: string; updated_at?: string }
        Update: Partial<{ id: string; full_name: string | null; avatar_url: string | null; created_at: string; updated_at: string }>
        Relationships: [{ foreignKeyName: 'profiles_id_fkey'; columns: ['id']; referencedRelation: 'users'; referencedSchema: 'auth' }]
      }
      user_companies: {
        Row: { user_id: string; company_id: string; role: 'owner' | 'admin' | 'member'; created_at: string }
        Insert: { user_id: string; company_id: string; role?: 'owner' | 'admin' | 'member'; created_at?: string }
        Update: Partial<{ user_id: string; company_id: string; role: 'owner' | 'admin' | 'member'; created_at: string }>
        Relationships: [
          { foreignKeyName: 'user_companies_user_id_fkey'; columns: ['user_id']; referencedRelation: 'users'; referencedSchema: 'auth' },
          { foreignKeyName: 'user_companies_company_id_fkey'; columns: ['company_id']; referencedRelation: 'companies'; referencedSchema: 'public' }
        ]
      }
      customers: {
        Row: { id: string; company_id: string; name: string; email: string | null; phone: string | null; billing_address: Json | null; notes: string | null; created_by: string | null; created_at: string; updated_at: string }
        Insert: { id?: string; company_id: string; name: string; email?: string | null; phone?: string | null; billing_address?: Json | null; notes?: string | null; created_by?: string | null; created_at?: string; updated_at?: string }
        Update: Partial<{ id: string; company_id: string; name: string; email: string | null; phone: string | null; billing_address: Json | null; notes: string | null; created_by: string | null; created_at: string; updated_at: string }>
        Relationships: [
          { foreignKeyName: 'customers_company_id_fkey'; columns: ['company_id']; referencedRelation: 'companies'; referencedSchema: 'public' }
        ]
      }
      contacts: {
        Row: { id: string; company_id: string; name: string; email: string | null; phone: string | null; position: string | null; created_by: string | null; created_at: string; updated_at: string }
        Insert: { id?: string; company_id: string; name: string; email?: string | null; phone?: string | null; position?: string | null; created_by?: string | null; created_at?: string; updated_at?: string }
        Update: Partial<{ id: string; company_id: string; name: string; email: string | null; phone: string | null; position: string | null; created_by: string | null; created_at: string; updated_at: string }>
        Relationships: [
          { foreignKeyName: 'contacts_company_id_fkey'; columns: ['company_id']; referencedRelation: 'companies'; referencedSchema: 'public' }
        ]
      }
      products: {
        Row: { id: string; company_id: string; name: string; sku: string | null; unit: string | null; price: number; currency: string; description: string | null; created_by: string | null; created_at: string; updated_at: string }
        Insert: { id?: string; company_id: string; name: string; sku?: string | null; unit?: string | null; price?: number; currency?: string; description?: string | null; created_by?: string | null; created_at?: string; updated_at?: string }
        Update: Partial<{ id: string; company_id: string; name: string; sku: string | null; unit: string | null; price: number; currency: string; description: string | null; created_by: string | null; created_at: string; updated_at: string }>
        Relationships: [
          { foreignKeyName: 'products_company_id_fkey'; columns: ['company_id']; referencedRelation: 'companies'; referencedSchema: 'public' }
        ]
      }
      quotes: {
        Row: { id: string; company_id: string; customer_id: string | null; status: 'draft' | 'sent' | 'accepted' | 'declined'; currency: string; total_amount: number; valid_until: string | null; created_by: string | null; created_at: string; updated_at: string }
        Insert: { id?: string; company_id: string; customer_id?: string | null; status?: 'draft' | 'sent' | 'accepted' | 'declined'; currency?: string; total_amount?: number; valid_until?: string | null; created_by?: string | null; created_at?: string; updated_at?: string }
        Update: Partial<{ id: string; company_id: string; customer_id: string | null; status: 'draft' | 'sent' | 'accepted' | 'declined'; currency: string; total_amount: number; valid_until: string | null; created_by: string | null; created_at: string; updated_at: string }>
        Relationships: [
          { foreignKeyName: 'quotes_company_id_fkey'; columns: ['company_id']; referencedRelation: 'companies'; referencedSchema: 'public' },
          { foreignKeyName: 'quotes_customer_id_fkey'; columns: ['customer_id']; referencedRelation: 'customers'; referencedSchema: 'public' }
        ]
      }
      quote_items: {
        Row: { id: string; quote_id: string; product_id: string | null; description: string | null; quantity: number; unit_price: number; total_amount: number }
        Insert: { id?: string; quote_id: string; product_id?: string | null; description?: string | null; quantity?: number; unit_price?: number; total_amount?: number }
        Update: Partial<{ id: string; quote_id: string; product_id: string | null; description: string | null; quantity: number; unit_price: number; total_amount: number }>
        Relationships: [
          { foreignKeyName: 'quote_items_quote_id_fkey'; columns: ['quote_id']; referencedRelation: 'quotes'; referencedSchema: 'public' },
          { foreignKeyName: 'quote_items_product_id_fkey'; columns: ['product_id']; referencedRelation: 'products'; referencedSchema: 'public' }
        ]
      }
      orders: {
        Row: { id: string; company_id: string; customer_id: string | null; status: 'draft' | 'confirmed' | 'shipped' | 'completed' | 'cancelled'; currency: string; total_amount: number; created_by: string | null; created_at: string; updated_at: string }
        Insert: { id?: string; company_id: string; customer_id?: string | null; status?: 'draft' | 'confirmed' | 'shipped' | 'completed' | 'cancelled'; currency?: string; total_amount?: number; created_by?: string | null; created_at?: string; updated_at?: string }
        Update: Partial<{ id: string; company_id: string; customer_id: string | null; status: 'draft' | 'confirmed' | 'shipped' | 'completed' | 'cancelled'; currency: string; total_amount: number; created_by: string | null; created_at: string; updated_at: string }>
        Relationships: [
          { foreignKeyName: 'orders_company_id_fkey'; columns: ['company_id']; referencedRelation: 'companies'; referencedSchema: 'public' },
          { foreignKeyName: 'orders_customer_id_fkey'; columns: ['customer_id']; referencedRelation: 'customers'; referencedSchema: 'public' }
        ]
      }
      order_items: {
        Row: { id: string; order_id: string; product_id: string | null; description: string | null; quantity: number; unit_price: number; total_amount: number }
        Insert: { id?: string; order_id: string; product_id?: string | null; description?: string | null; quantity?: number; unit_price?: number; total_amount?: number }
        Update: Partial<{ id: string; order_id: string; product_id: string | null; description: string | null; quantity: number; unit_price: number; total_amount: number }>
        Relationships: [
          { foreignKeyName: 'order_items_order_id_fkey'; columns: ['order_id']; referencedRelation: 'orders'; referencedSchema: 'public' },
          { foreignKeyName: 'order_items_product_id_fkey'; columns: ['product_id']; referencedRelation: 'products'; referencedSchema: 'public' }
        ]
      }
      tasks: {
        Row: { id: string; company_id: string; title: string; description: string | null; status: 'todo' | 'in_progress' | 'done'; due_date: string | null; assigned_to: string | null; created_by: string | null; created_at: string; updated_at: string }
        Insert: { id?: string; company_id: string; title: string; description?: string | null; status?: 'todo' | 'in_progress' | 'done'; due_date?: string | null; assigned_to?: string | null; created_by?: string | null; created_at?: string; updated_at?: string }
        Update: Partial<{ id: string; company_id: string; title: string; description: string | null; status: 'todo' | 'in_progress' | 'done'; due_date: string | null; assigned_to: string | null; created_by: string | null; created_at: string; updated_at: string }>
        Relationships: [
          { foreignKeyName: 'tasks_company_id_fkey'; columns: ['company_id']; referencedRelation: 'companies'; referencedSchema: 'public' },
          { foreignKeyName: 'tasks_assigned_to_fkey'; columns: ['assigned_to']; referencedRelation: 'users'; referencedSchema: 'auth' }
        ]
      }
      notes: {
        Row: { id: string; company_id: string; entity_type: 'customer' | 'order' | 'quote' | 'task' | 'company'; entity_id: string; body: string; created_by: string | null; created_at: string; updated_at: string }
        Insert: { id?: string; company_id: string; entity_type: 'customer' | 'order' | 'quote' | 'task' | 'company'; entity_id: string; body: string; created_by?: string | null; created_at?: string; updated_at?: string }
        Update: Partial<{ id: string; company_id: string; entity_type: 'customer' | 'order' | 'quote' | 'task' | 'company'; entity_id: string; body: string; created_by: string | null; created_at: string; updated_at: string }>
        Relationships: [
          { foreignKeyName: 'notes_company_id_fkey'; columns: ['company_id']; referencedRelation: 'companies'; referencedSchema: 'public' }
        ]
      }
    }
    Views: Record<string, never>
    Functions: {
      is_company_member: { Args: { p_company_id: string }; Returns: boolean }
      null_if_empty: { Args: { '': string }; Returns: string | null }
      set_updated_at: { Args: Record<string, never>; Returns: unknown }
      handle_new_user: { Args: Record<string, never>; Returns: unknown }
      handle_company_insert: { Args: Record<string, never>; Returns: unknown }
    }
    Enums: {
      user_role: 'owner' | 'admin' | 'member'
      quote_status: 'draft' | 'sent' | 'accepted' | 'declined'
      order_status: 'draft' | 'confirmed' | 'shipped' | 'completed' | 'cancelled'
      task_status: 'todo' | 'in_progress' | 'done'
      note_entity: 'customer' | 'order' | 'quote' | 'task' | 'company'
    }
  }
}
