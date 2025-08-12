'use client'

import Link from 'next/link'
import { motion, MotionConfig, useReducedMotion } from 'framer-motion'

export default function VerifiedPage() {
  const prefersReducedMotion = useReducedMotion()
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
            <h1 className="text-white text-3xl font-bold">E-post verifierad</h1>
            <p className="text-white/70 mt-3">Din e-postadress har verifierats.</p>
            <div className="mt-6">
              <Link href="/auth/signin" className="inline-block text-white/80 hover:text-white bg-white/10 border border-white/20 px-4 py-2 rounded-xl">
                Logga in
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </MotionConfig>
  )
}
