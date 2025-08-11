import { supabase } from './supabase'
import type { Session, User } from '@supabase/supabase-js'

const MOCK_USER_ID = '12345678-1234-5678-9abc-123456789abc'

// Mock user data
const mockUser: User = {
  id: MOCK_USER_ID,
  aud: 'authenticated',
  role: 'authenticated',
  email: 'demo@crm.se',
  email_confirmed_at: new Date().toISOString(),
  phone: '',
  last_sign_in_at: new Date().toISOString(),
  app_metadata: {
    provider: 'email',
    providers: ['email']
  },
  user_metadata: {
    full_name: 'Demo Användare'
  },
  identities: [],
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
}

// Mock session data
const mockSession: Session = {
  access_token: 'mock-access-token',
  refresh_token: 'mock-refresh-token',
  expires_in: 3600,
  expires_at: Math.floor(Date.now() / 1000) + 3600,
  token_type: 'bearer',
  user: mockUser
}

export async function initializeMockAuth() {
  try {
    // Set the session in Supabase client
    const { error } = await supabase.auth.setSession({
      access_token: mockSession.access_token,
      refresh_token: mockSession.refresh_token
    })
    
    if (error) {
      console.warn('Could not set mock session:', error.message)
      return false
    }

    console.log('Mock authentication initialized')
    return true
  } catch (error) {
    console.error('Error initializing mock auth:', error)
    return false
  }
}

// Alternative approach - override the auth methods
export function setupMockAuthOverrides() {
  // Override getUser method to return our mock user
  supabase.auth.getUser = async () => {
    return {
      data: {
        user: mockSession.user
      },
      error: null
    }
  }

  // Override getSession method
  supabase.auth.getSession = async () => {
    return {
      data: {
        session: mockSession
      },
      error: null
    }
  }

  console.log('Mock auth overrides setup complete')
}

export { MOCK_USER_ID }
