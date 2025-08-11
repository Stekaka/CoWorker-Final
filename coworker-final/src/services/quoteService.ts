import { supabase } from '@/lib/supabase'
import type { Database } from '@/types/database'
import { UserCompanyService } from './userCompanyService'

type Quote = Database['public']['Tables']['quotes']['Row']
type QuoteInsert = Database['public']['Tables']['quotes']['Insert']
type QuoteUpdate = Database['public']['Tables']['quotes']['Update']
type QuoteItem = Database['public']['Tables']['quote_items']['Row']
type QuoteItemInsert = Database['public']['Tables']['quote_items']['Insert']

export interface QuoteWithItems extends Omit<Quote, 'customer_id'> {
  items: QuoteItem[]
  customer?: {
    id: string
    name: string
    email: string
    company_name?: string
    phone?: string
    address?: string
    city?: string
    postal_code?: string
  }
}

export class QuoteService {
  // Hämta alla offerter för användaren
  static async getQuotes(): Promise<QuoteWithItems[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { data, error } = await supabase
        .from('quotes')
        .select(`
          *,
          customers!inner(id, name, email, company_name, phone, address, city, postal_code),
          quote_items(*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      return data?.map(quote => ({
        ...quote,
        customer: Array.isArray(quote.customers) ? quote.customers[0] : quote.customers,
        items: quote.quote_items || []
      })) || []
    } catch (error) {
      console.error('Error fetching quotes:', error)
      return []
    }
  }

  // Hämta offert med ID
  static async getQuote(id: string): Promise<QuoteWithItems | null> {
    try {
      const { data, error } = await supabase
        .from('quotes')
        .select(`
          *,
          customers!inner(id, name, email, company_name, phone, address, city, postal_code),
          quote_items(*)
        `)
        .eq('id', id)
        .single()

      if (error) throw error

      return {
        ...data,
        customer: Array.isArray(data.customers) ? data.customers[0] : data.customers,
        items: data.quote_items || []
      }
    } catch (error) {
      console.error('Error fetching quote:', error)
      return null
    }
  }

  // Skapa ny offert
  static async createQuote(
    quoteData: Omit<QuoteInsert, 'user_id' | 'company_id' | 'quote_number'>,
    items: Omit<QuoteItemInsert, 'quote_id'>[]
  ): Promise<QuoteWithItems | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const companyId = await UserCompanyService.getUserPrimaryCompany(user.id)
      if (!companyId) throw new Error('User not associated with any company')

      // Generera offertnummer
      const { data: quoteNumber, error: numberError } = await supabase
        .rpc('generate_quote_number', { company_uuid: companyId })

      if (numberError || !quoteNumber) {
        throw new Error('Could not generate quote number')
      }

      // Skapa offerten
      const insert: QuoteInsert = {
        ...quoteData,
        user_id: user.id,
        company_id: companyId,
        quote_number: quoteNumber
      }

      const { data: quote, error: quoteError } = await supabase
        .from('quotes')
        .insert(insert)
        .select()
        .single()

      if (quoteError) throw quoteError

      // Skapa offert-items
      if (items.length > 0) {
        const { error: itemsError } = await supabase
          .from('quote_items')
          .insert(
            items.map((item, index) => ({
              ...item,
              quote_id: quote.id,
              sort_order: index
            }))
          )

        if (itemsError) throw itemsError
      }

      // Hämta den kompletta offerten
      return await this.getQuote(quote.id)
    } catch (error) {
      console.error('Error creating quote:', error)
      return null
    }
  }

  // Uppdatera offert
  static async updateQuote(id: string, updates: QuoteUpdate): Promise<QuoteWithItems | null> {
    try {
      const { error } = await supabase
        .from('quotes')
        .update(updates)
        .eq('id', id)

      if (error) throw error

      return await this.getQuote(id)
    } catch (error) {
      console.error('Error updating quote:', error)
      return null
    }
  }

  // Ta bort offert
  static async deleteQuote(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('quotes')
        .delete()
        .eq('id', id)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error deleting quote:', error)
      return false
    }
  }

  // Sök offerter
  static async searchQuotes(query: string): Promise<QuoteWithItems[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { data, error } = await supabase
        .from('quotes')
        .select(`
          *,
          customers!inner(id, name, email, company_name, phone, address, city, postal_code),
          quote_items(*)
        `)
        .eq('user_id', user.id)
        .or(`quote_number.ilike.%${query}%,title.ilike.%${query}%`)
        .order('created_at', { ascending: false })

      if (error) throw error

      return data?.map(quote => ({
        ...quote,
        customer: Array.isArray(quote.customers) ? quote.customers[0] : quote.customers,
        items: quote.quote_items || []
      })) || []
    } catch (error) {
      console.error('Error searching quotes:', error)
      return []
    }
  }

  // Filtrera offerter efter status
  static async getQuotesByStatus(status: string): Promise<QuoteWithItems[]> {
    try {
      if (status === 'all') {
        return this.getQuotes()
      }

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { data, error } = await supabase
        .from('quotes')
        .select(`
          *,
          customers!inner(id, name, email, company_name, phone, address, city, postal_code),
          quote_items(*)
        `)
        .eq('user_id', user.id)
        .eq('status', status)
        .order('created_at', { ascending: false })

      if (error) throw error

      return data?.map(quote => ({
        ...quote,
        customer: Array.isArray(quote.customers) ? quote.customers[0] : quote.customers,
        items: quote.quote_items || []
      })) || []
    } catch (error) {
      console.error('Error fetching quotes by status:', error)
      return []
    }
  }

  // Markera offert som skickad
  static async markQuoteAsSent(id: string): Promise<QuoteWithItems | null> {
    return this.updateQuote(id, {
      status: 'sent',
      sent_at: new Date().toISOString()
    })
  }

  // Markera offert som öppnad
  static async markQuoteAsViewed(id: string): Promise<QuoteWithItems | null> {
    const quote = await this.getQuote(id)
    if (!quote || quote.status === 'draft') {
      throw new Error('Quote must be sent before it can be marked as viewed')
    }

    return this.updateQuote(id, {
      status: 'viewed',
      viewed_at: new Date().toISOString()
    })
  }

  // Markera offert som accepterad
  static async markQuoteAsAccepted(id: string): Promise<QuoteWithItems | null> {
    return this.updateQuote(id, {
      status: 'accepted',
      accepted_at: new Date().toISOString()
    })
  }

  // Markera offert som avvisad
  static async markQuoteAsRejected(id: string): Promise<QuoteWithItems | null> {
    return this.updateQuote(id, {
      status: 'rejected',
      rejected_at: new Date().toISOString()
    })
  }

  // Hämta offertstatistik för användaren
  static async getQuoteStats() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { data, error } = await supabase
        .from('quotes')
        .select('status, total_amount, created_at')
        .eq('user_id', user.id)

      if (error) throw error

      const quotes = data || []
      const totalQuotes = quotes.length

      const statusCounts = {
        draft: quotes.filter(q => q.status === 'draft').length,
        sent: quotes.filter(q => q.status === 'sent').length,
        viewed: quotes.filter(q => q.status === 'viewed').length,
        accepted: quotes.filter(q => q.status === 'accepted').length,
        rejected: quotes.filter(q => q.status === 'rejected').length,
        expired: quotes.filter(q => q.status === 'expired').length
      }

      const totalValue = quotes.reduce((sum, quote) => sum + quote.total_amount, 0)
      const acceptedValue = quotes
        .filter(q => q.status === 'accepted')
        .reduce((sum, quote) => sum + quote.total_amount, 0)

      const currentMonth = new Date().getMonth()
      const currentYear = new Date().getFullYear()
      
      const quotesThisMonth = quotes.filter(quote => {
        const createdDate = new Date(quote.created_at)
        return createdDate.getMonth() === currentMonth && createdDate.getFullYear() === currentYear
      }).length

      return {
        totalQuotes,
        statusCounts,
        totalValue,
        acceptedValue,
        quotesThisMonth,
        conversionRate: totalQuotes > 0 ? (statusCounts.accepted / totalQuotes) * 100 : 0
      }
    } catch (error) {
      console.error('Error fetching quote stats:', error)
      return {
        totalQuotes: 0,
        statusCounts: {
          draft: 0,
          sent: 0,
          viewed: 0,
          accepted: 0,
          rejected: 0,
          expired: 0
        },
        totalValue: 0,
        acceptedValue: 0,
        quotesThisMonth: 0,
        conversionRate: 0
      }
    }
  }
}
