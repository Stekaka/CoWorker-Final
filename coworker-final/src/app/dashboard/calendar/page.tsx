'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function CalendarRedirect() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/dashboard/calendar-compact')
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-lg text-slate-600 dark:text-slate-400">Omdirigerar till ny kalender...</p>
      </div>
    </div>
  )
}
