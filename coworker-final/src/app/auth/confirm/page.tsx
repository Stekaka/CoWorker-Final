'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, MotionConfig, useReducedMotion } from 'framer-motion'
import { supabase } from '@/lib/supabase'

export default function EmailConfirmPage() {
  const router = useRouter()
  const params = useSearchParams()
  const token_hash = params.get('token_hash')
  const type = params.get('type')
  const [status, setStatus] = useState<'pending' | 'success' | 'error'>('pending')
  const prefersReducedMotion = useReducedMotion()

  useEffect(() => {
    async function verify() {
      if (!token_hash) return
      const supaType: 'signup' | 'recovery' | 'email_change' | undefined =
        type === 'recovery'
          ? 'recovery'
          : type === 'signup' || type === 'invite'
          ? 'signup'
          : type === 'email_change'
          ? 'email_change'
          : undefined

      if (!supaType) {
        setStatus('error')
        return
      }

      const { error } = await supabase.auth.verifyOtp({ type: supaType, token_hash })
      if (error) setStatus('error')
      else setStatus('success')
    }
    verify()
  }, [token_hash, type])

  useEffect(() => {
    if (status !== 'success') return
    const t = setTimeout(() => {
      router.replace('/auth/verified')
    }, 1500)
    return () => clearTimeout(t)
  }, [status, router])

  return (
    <MotionConfig reducedMotion={prefersReducedMotion ? 'always' : 'user'}>
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-gray-950 to-black relative overflow-hidden">
        {/* Glow */}
        <div className="absolute inset-0 overflow-hidden">
          {!prefersReducedMotion && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-600/10 to-emerald-500/10 blur-3xl"
              animate={{ opacity: [0.6, 0.9, 0.6] }}
              transition={{ duration: 10, repeat: Infinity }}
            />
          )}
        </div>

        <div className="relative z-10 max-w-md mx-auto px-4 py-28">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-white/[0.06] border border-white/10 backdrop-blur-xl rounded-3xl p-8 text-center shadow-2xl"
          >
            {status === 'pending' && (
              <>
                <h1 className="text-white text-3xl font-bold">Verifierar...</h1>
                <p className="text-white/70 mt-3">Vänligen vänta ett ögonblick.</p>
              </>
            )}
            {status === 'success' && (
              <>
                <h1 className="text-white text-3xl font-bold">Klart!</h1>
                <p className="text-white/70 mt-3">Din e-post är verifierad. Du kan nu logga in.</p>
                {/* Redirect hint */}
                <div className="mt-4 flex items-center justify-center gap-2 text-white/70 text-sm">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" aria-hidden="true"></div>
                  <span>Du skickas vidare…</span>
                </div>
                <div className="mt-3 h-1 w-full bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-white/40"
                    initial={{ width: 0 }}
                    animate={prefersReducedMotion ? undefined : { width: '100%' }}
                    transition={{ duration: 1.5, ease: 'easeInOut' }}
                  />
                </div>
                <div className="mt-6">
                  <Link href="/auth/signin" className="inline-block text-white/80 hover:text-white bg-white/10 border border-white/20 px-4 py-2 rounded-xl">
                    Till inloggningen
                  </Link>
                </div>
              </>
            )}
            {status === 'error' && (
              <>
                <h1 className="text-white text-3xl font-bold">Något gick fel</h1>
                <p className="text-white/70 mt-3">Länken är ogiltig eller utgången. Försök igen.</p>
                <div className="mt-6">
                  <Link href="/auth/signin" className="inline-block text-white/80 hover:text-white bg-white/10 border border-white/20 px-4 py-2 rounded-xl">
                    Till inloggningen
                  </Link>
                </div>
              </>
            )}
          </motion.div>
        </div>
      </div>
    </MotionConfig>
  )
}
