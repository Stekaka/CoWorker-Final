'use client'

import Link from 'next/link'
import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion, MotionConfig, useReducedMotion } from 'framer-motion'

export default function CheckEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen grid place-items-center text-white/70">Laddar…</div>}>
      <CheckEmailInner />
    </Suspense>
  )
}

function CheckEmailInner() {
  const params = useSearchParams()
  const email = params.get('email')
  const prefersReducedMotion = useReducedMotion()

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
            <h1 className="text-white text-3xl font-bold">Bekräfta din e-post</h1>
            <p className="text-white/70 mt-3">
              Vi har skickat en bekräftelselänk till
              <span className="text-white ml-1 font-medium">{email ?? 'din e-post'}</span>.
            </p>
            <p className="text-white/60 mt-2 text-sm">Klicka på länken i mailet för att aktivera ditt konto.</p>

            <div className="mt-6">
              <Link href="/auth/signin" className="inline-block text-white/80 hover:text-white bg-white/10 border border-white/20 px-4 py-2 rounded-xl">
                Till inloggningen
              </Link>
            </div>

            <p className="text-white/50 text-xs mt-6">Har du inte fått mailet? Kolla skräpposten eller försök igen.</p>
          </motion.div>
        </div>
      </div>
    </MotionConfig>
  )
}
