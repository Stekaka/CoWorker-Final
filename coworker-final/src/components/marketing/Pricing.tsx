'use client'

import { motion, useReducedMotion } from 'framer-motion'
import Link from 'next/link'
import { Check } from 'lucide-react'

export default function Pricing() {
  const prefersReducedMotion = useReducedMotion()

  return (
    <section id="priser" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <motion.h2
            className="text-3xl md:text-5xl font-extrabold text-white tracking-tight"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5 }}
          >
            Priser
          </motion.h2>
          <motion.p
            className="mt-3 text-white/70 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Enkelt och förutsägbart. Betala bara för det ni använder.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {/* Huvudanvändare */}
          <motion.div
            className="relative rounded-2xl bg-white/[0.06] border border-white/10 shadow-2xl p-6 overflow-hidden"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.45 }}
          >
            {!prefersReducedMotion && (
              <motion.div className="absolute -inset-1 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-transparent blur-2xl" animate={{ opacity: [0.12, 0.25, 0.12] }} transition={{ duration: 6, repeat: Infinity }} />
            )}
            <div className="relative">
              <div className="flex items-end justify-between">
                <div>
                  <div className="inline-flex items-center text-xs px-2 py-1 rounded-full border border-indigo-400/30 text-indigo-300 bg-indigo-500/10 mb-2">Rekommenderad</div>
                  <h3 className="text-xl font-bold text-white">Huvudanvändare</h3>
                  <p className="text-white/60">Full åtkomst för kontoägare</p>
                </div>
                <div className="text-right">
                  <div className="text-4xl md:text-5xl font-extrabold text-white">299 kr</div>
                  <div className="text-white/60">per månad</div>
                </div>
              </div>
              <ul className="mt-6 space-y-3 text-white/80 text-sm">
                {[
                  'Kunder, offerter, order, uppgifter',
                  'Skapa och administrera företag',
                  'Roller och behörigheter',
                  'E-postutskick och mallar'
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> {f}</li>
                ))}
              </ul>
              <div className="mt-6">
                <Link href="/auth/signup" className="inline-flex items-center justify-center px-5 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-indigo-500 to-purple-600 border border-white/20 shadow-2xl">
                  Starta gratis
                </Link>
              </div>
            </div>
          </motion.div>

          {/* Extra användare */}
          <motion.div
            className="relative rounded-2xl bg-white/[0.06] border border-white/10 shadow-2xl p-6 overflow-hidden"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.45, delay: 0.05 }}
          >
            {!prefersReducedMotion && (
              <motion.div className="absolute -inset-1 bg-gradient-to-br from-emerald-500/10 via-teal-500/10 to-transparent blur-2xl" animate={{ opacity: [0.1, 0.2, 0.1] }} transition={{ duration: 6, repeat: Infinity }} />
            )}
            <div className="relative">
              <div className="flex items-end justify-between">
                <div>
                  <h3 className="text-xl font-bold text-white">Extra användare</h3>
                  <p className="text-white/60">Lägg till fler i ert företag</p>
                </div>
                <div className="text-right">
                  <div className="text-4xl md:text-5xl font-extrabold text-white">99 kr</div>
                  <div className="text-white/60">per månad / användare</div>
                </div>
              </div>
              <ul className="mt-6 space-y-3 text-white/80 text-sm">
                {[
                  'Delad åtkomst till företagets data',
                  'Teamarbetsflöden',
                  'Rättigheter per roll',
                  'Kommentarer och aktivitetslogg'
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> {f}</li>
                ))}
              </ul>
              <div className="mt-6">
                <Link href="/auth/signup" className="inline-flex items-center justify-center px-5 py-3 rounded-xl font-semibold text-white bg-white/10 hover:bg-white/15 border border-white/20">
                  Lägg till användare
                </Link>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="text-center text-white/50 text-xs mt-6">Priser exkl. moms. Avsluta när som helst.</div>
      </div>
    </section>
  )
}
