'use client'

import Link from 'next/link'
import { motion, useReducedMotion, MotionConfig } from 'framer-motion'
import { useMemo } from 'react'
import DemoShowcase from '@/components/marketing/DemoShowcase'
import Pricing from '@/components/marketing/Pricing'
import HeroPreview from '@/components/marketing/HeroPreview'

export default function Home() {
  const prefersReducedMotion = useReducedMotion()

  const floatingCount = useMemo(() => (prefersReducedMotion ? 0 : 3), [prefersReducedMotion])

  return (
    <MotionConfig reducedMotion={prefersReducedMotion ? 'always' : 'user'}>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-gray-900 relative overflow-hidden">
        {/* Background: fewer, softer elements for performance */}
        <div className="absolute inset-0 overflow-hidden">
          {!prefersReducedMotion && (
            <>
              <motion.div
                className="absolute -top-40 -right-40 w-[520px] h-[520px] bg-gradient-to-br from-gray-600/15 via-slate-500/20 to-gray-700/15 rounded-full blur-3xl"
                animate={{ x: [0, 100, -50, 0], y: [0, -80, 60, 0], scale: [1, 1.2, 0.9, 1] }}
                transition={{ duration: 28, repeat: Infinity, ease: 'easeInOut' }}
              />
              <motion.div
                className="absolute -bottom-40 -left-40 w-[480px] h-[480px] bg-gradient-to-tr from-slate-600/15 via-gray-500/10 to-slate-700/15 rounded-full blur-3xl"
                animate={{ x: [0, -120, 80, 0], y: [0, 120, -60, 0], scale: [1.1, 0.8, 1.2, 1.1] }}
                transition={{ duration: 32, repeat: Infinity, ease: 'easeInOut' }}
              />
              <motion.div
                className="absolute top-1/3 right-1/4 w-[420px] h-[420px] bg-gradient-to-r from-purple-500/10 via-slate-600/10 to-gray-600/10 rounded-full blur-3xl"
                animate={{ x: [0, 60, -120, 30, 0], y: [0, -60, 90, -30, 0], scale: [1, 1.3, 0.95, 1.15, 1] }}
                transition={{ duration: 36, repeat: Infinity, ease: 'easeInOut' }}
              />
            </>
          )}
        </div>

        {/* Floating glass accents (lower count) */}
        {Array.from({ length: floatingCount }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-14 h-14 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl"
            style={{ top: `${25 + i * 15}%`, left: `${12 + i * 22}%` }}
            animate={{ y: [0, -20, 0], rotate: [0, 10, -10, 0], scale: [1, 1.05, 1] }}
            transition={{ duration: 5 + i, repeat: Infinity, ease: 'easeInOut', delay: i * 0.6 }}
            whileHover={{ scale: 1.15, rotate: 35 }}
          />
        ))}

        {/* Header */}
        <motion.header 
          className="relative z-20 bg-black/20 backdrop-blur-2xl border-b border-white/10 shadow-2xl"
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4 sm:py-6">
              <motion.div 
                className="flex items-center space-x-2 sm:space-x-4"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <div className="relative">
                  <motion.div 
                    className="w-10 h-10 sm:w-14 sm:h-14 bg-gradient-to-br from-gray-700 via-slate-600 to-gray-800 rounded-2xl flex items-center justify-center shadow-2xl border border-white/10"
                    whileHover={{
                      scale: 1.1,
                      borderColor: "rgba(255, 255, 255, 0.3)"
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    <span className="text-white font-bold text-lg sm:text-xl">C</span>
                  </motion.div>
                </div>
                <motion.h1 
                  className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-white via-gray-200 to-gray-300 bg-clip-text text-transparent"
                  whileHover={{ scale: 1.02 }}
                >
                  CoWorker
                </motion.h1>
              </motion.div>
              <div className="flex items-center space-x-3 sm:space-x-6">
                <motion.div 
                  whileHover={{ scale: 1.05, y: -2 }} 
                  whileTap={{ scale: 0.95 }}
                  className="relative hidden sm:block"
                >
                  <Link 
                    href="/auth/signin" 
                    className="text-white/90 hover:text-white font-medium px-4 sm:px-6 py-2 sm:py-3 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 hover:bg-white/10 transition-all duration-300 text-sm sm:text-base"
                  >
                    Logga in
                  </Link>
                </motion.div>
                <motion.div 
                  whileHover={{ scale: 1.05, y: -2 }} 
                  whileTap={{ scale: 0.95 }}
                  className="relative"
                >
                  <Link 
                    href="/auth/signup" 
                    className="relative bg-white/8 backdrop-blur-2xl text-white px-4 sm:px-8 py-2 sm:py-3 rounded-2xl font-bold border border-white/30 hover:border-white/50 transition-all duration-300 shadow-2xl text-sm sm:text-base"
                  >
                    <span className="sm:hidden">Start</span>
                    <span className="hidden sm:inline">Kom igång</span>
                  </Link>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.header>

        {/* Modern Hero Section (replaces previous heavy hero) */}
        <main className="relative z-10">
          <section className="min-h-[72vh] flex items-center px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-10 items-center w-full">
              {/* Copy */}
              <div className="lg:col-span-6 text-center lg:text-left">
                <motion.h1
                  className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white leading-[1.05] tracking-tight"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7 }}
                >
                  Hantera hela ditt företag med elegans
                </motion.h1>
                <motion.p
                  className="mt-5 text-lg md:text-xl text-white/70 max-w-2xl mx-auto lg:mx-0"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.15 }}
                >
                  Kunder, offerter, order, uppgifter och mer – samlat i en snabb och vacker upplevelse.
                </motion.p>

                <motion.div
                  className="mt-8 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.25 }}
                >
                  <Link href="/auth/signup" className="transform-gpu will-change-transform inline-flex items-center justify-center px-6 py-3 rounded-2xl font-semibold text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 border border-white/20 shadow-2xl">
                    Kom igång gratis
                  </Link>
                  <Link href="#demo" className="inline-flex items-center justify-center px-6 py-3 rounded-2xl font-semibold text-white/90 bg-white/10 hover:bg-white/15 border border-white/20">
                    Se demo
                  </Link>
                </motion.div>

                {/* Trust row */}
                <motion.div
                  className="mt-8 grid grid-cols-3 gap-4 max-w-md mx-auto lg:mx-0"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.35 }}
                >
                  {[
                    '30 dagar gratis', 'Ingen bindning', 'Svensk support'
                  ].map((t) => (
                    <div key={t} className="text-center text-white/70 text-sm bg-white/10 rounded-xl py-2 border border-white/10">
                      {t}
                    </div>
                  ))}
                </motion.div>
              </div>

              {/* Visual */}
              <div className="lg:col-span-6">
                {!prefersReducedMotion && (
                  <motion.div
                    className="relative"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                  >
                    <HeroPreview />
                  </motion.div>
                )}
                {prefersReducedMotion && (
                  <div className="relative bg-black/30 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 shadow-2xl overflow-hidden">
                    <p className="text-white/70">Förhandsvisning av appen visas här.</p>
                  </div>
                )}
              </div>
            </div>
          </section>

          <DemoShowcase />

          <Pricing />

          {/* Footer remains */}
          {/* ...existing code... */}
        </main>

        {/* Footer remains */}
        {/* ...existing code... */}
      </div>
    </MotionConfig>
  )
}
