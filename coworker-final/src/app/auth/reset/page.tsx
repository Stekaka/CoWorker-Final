'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, MotionConfig, useReducedMotion } from 'framer-motion'
import { supabase } from '@/lib/supabase'

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const prefersReducedMotion = useReducedMotion()

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const redirectTo = typeof window !== 'undefined' ? `${window.location.origin}/auth/update-password` : undefined
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo })
    if (error) setError(error.message)
    else setSent(true)
  }

  return (
    <MotionConfig reducedMotion={prefersReducedMotion ? 'always' : 'user'}>
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-gray-950 to-black relative overflow-hidden">
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
            <h1 className="text-white text-3xl font-bold">Återställ lösenord</h1>
            <p className="text-white/70 mt-3">Ange din e-postadress så skickar vi en återställningslänk.</p>

            <form onSubmit={onSubmit} className="mt-6 space-y-4 text-left">
              {error && <div className="text-red-300 text-sm bg-red-500/10 border border-red-500/30 p-2 rounded-lg">{error}</div>}
              {!sent ? (
                <>
                  <label htmlFor="email" className="block text-sm text-white/80">E-postadress</label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-white/[0.06] backdrop-blur-sm border border-white/10 text-white placeholder:text-gray-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    placeholder="din@email.com"
                  />
                  <button type="submit" className="w-full text-white py-3 px-4 rounded-xl font-semibold bg-white/10 hover:bg-white/15 border border-white/20 transition-all">
                    Skicka länk
                  </button>
                </>
              ) : (
                <div className="text-white/80">Länk skickad! Kolla din e-post.</div>
              )}
            </form>

            <div className="mt-6">
              <Link href="/auth/signin" className="inline-block text-white/80 hover:text-white bg-white/10 border border-white/20 px-4 py-2 rounded-xl">
                Till inloggningen
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </MotionConfig>
  )
}
