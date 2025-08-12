import { NextResponse } from 'next/server'

// Deprecated: Custom signup route is disabled. Use Supabase Auth directly from the client.
export async function POST() {
  return NextResponse.json(
    { error: 'Deprecated endpoint. Use Supabase Auth signUp from the client.' },
    { status: 410 }
  )
}
