// Test script to debug UI registration vs API registration discrepancy
const { createClient } = require('@supabase/supabase-js')

// Use the same configuration as the UI
const supabaseUrl = 'https://zgdakjulguivtdogqskl.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpnZGFranVsZ3VpdnRkb2dxc2tsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2NDQxNTksImV4cCI6MjA3MDIyMDE1OX0.yiDeC-f1mlWGPjDlKgQHTqRp5kC-4GD7wLU6GfUdbxE'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testUIRegistration() {
  console.log('Testing UI-style registration...')
  
  const formData = {
    email: 'ui.test@example.com',
    password: 'testpass123',
    fullName: 'UI Test User',
    companyName: 'UI Test Company'
  }

  try {
    console.log('Attempting signUp with:', { 
      email: formData.email, 
      fullName: formData.fullName, 
      companyName: formData.companyName 
    })

    // This mimics exactly what the UI does
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          full_name: formData.fullName,
          company_name: formData.companyName
        }
      }
    })

    if (authError) {
      console.error('Auth Error:', authError)
      throw authError
    }

    console.log('Registration successful!')
    console.log('Auth Data:', JSON.stringify(authData, null, 2))

    if (authData.user) {
      console.log('User created with ID:', authData.user.id)
      console.log('User metadata:', authData.user.user_metadata)
    }

  } catch (error) {
    console.error('Registration failed:', error.message)
    console.error('Full error:', error)
  }
}

testUIRegistration()
