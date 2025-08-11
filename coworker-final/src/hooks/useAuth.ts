import { useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { UserProfile } from '../types'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Hämta initial session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
      
      if (session?.user) {
        await loadUserProfile(session.user.id)
      }
      
      setLoading(false)
    }

    getInitialSession()

    // Lyssna på auth-ändringar
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
        
        if (session?.user) {
          await loadUserProfile(session.user.id)
        } else {
          setProfile(null)
        }
        
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const loadUserProfile = async (userId: string) => {
    try {
      // Hämta användarens företag
      const { data: userCompany } = await supabase
        .from('user_companies')
        .select('companies(*)')
        .eq('user_id', userId)
        .eq('is_primary', true)
        .single()

      if (userCompany?.companies) {
        const mockProfile: UserProfile = {
          id: userId,
          user_id: userId,
          full_name: user?.user_metadata?.full_name || 'Användare',
          company_name: userCompany.companies.name,
          avatar_url: undefined,
          plan_type: 'professional',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
        setProfile(mockProfile)
      }
    } catch (error) {
      console.error('Error loading user profile:', error)
    }
  }

  const signUp = async (email: string, password: string, fullName: string, companyName: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          company_name: companyName
        }
      }
    })
    
    if (error) throw error
    return { user: data.user, needsConfirmation: !data.session }
  }

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    
    if (error) throw error
    return { user: data.user }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email)
    if (error) throw error
  }

  const updatePassword = async (password: string) => {
    const { error } = await supabase.auth.updateUser({ password })
    if (error) throw error
  }

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!profile || !user) throw new Error('No profile to update')
    
    // Uppdatera user metadata
    const { error: userError } = await supabase.auth.updateUser({
      data: {
        full_name: updates.full_name || profile.full_name
      }
    })
    
    if (userError) throw userError
    
    const updatedProfile = { ...profile, ...updates }
    setProfile(updatedProfile)
    return updatedProfile
  }

  return {
    user,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
    updateProfile,
    isAuthenticated: !!user,
  }
}

export function useRequireAuth() {
  const auth = useAuth()

  useEffect(() => {
    if (!auth.loading && !auth.isAuthenticated) {
      // Redirect till inloggning om inte autentiserad
      window.location.href = '/auth/signin'
    }
  }, [auth.loading, auth.isAuthenticated])

  return auth
}
