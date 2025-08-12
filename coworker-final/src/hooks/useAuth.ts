import { useEffect, useRef, useState, useCallback } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { UserProfile } from '../types'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  
  const [loading, setLoading] = useState(true)
  const didInit = useRef(false)
  const lastLoadedUserId = useRef<string | null>(null)
  const inFlight = useRef(false)

  const loadUserProfile = useCallback(async (userId: string) => {
    if (inFlight.current) return
    if (lastLoadedUserId.current === userId) return
    inFlight.current = true
    try {
      // Basprofil endast från auth metadata (ingen RLS-känslig SELECT)
      const baseProfile: UserProfile = {
        id: userId,
        user_id: userId,
        full_name: (user as User | null)?.user_metadata?.full_name || 'Användare',
        company_name: (user as User | null)?.user_metadata?.company_name || 'Mitt Företag',
        avatar_url: undefined,
        plan_type: 'professional',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      setProfile(baseProfile)

  // Ingen extra nätverksfråga här – undvik RLS-blockerade tabeller vid inloggning
      lastLoadedUserId.current = userId
    } catch (error) {
      console.error('Error loading user profile:', error)
    }
    finally {
      inFlight.current = false
    }
  }, [user])

  useEffect(() => {
    if (didInit.current) return
    didInit.current = true

    // Hämta initial session (en gång)
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      const u = session?.user ?? null
      setUser(u)
      if (u) await loadUserProfile(u.id)
      setLoading(false)
    }
    init()

    // Lyssna på auth-ändringar (ignorera TOKEN_REFRESH för att undvika spam)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const u = session?.user ?? null
        setUser(u)
        if (u && (event === 'SIGNED_IN' || event === 'USER_UPDATED' || event === 'PASSWORD_RECOVERY')) {
          await loadUserProfile(u.id)
        }
        if (!u) {
          setProfile(null)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [loadUserProfile])

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
