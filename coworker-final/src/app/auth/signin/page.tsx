'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, useReducedMotion, MotionConfig } from 'framer-motion'
import { supabase } from '@/lib/supabase'

export default function SignInPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const prefersReducedMotion = useReducedMotion()

  useEffect(() => {
    let mounted = true
    supabase.auth.getUser().then(({ data }) => {
      if (!mounted) return
      if (data.user) router.replace('/dashboard')
    })
    return () => {
      mounted = false
    }
  }, [router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const mapError = (msg: string) => {
    const lower = msg.toLowerCase()
    if (lower.includes('invalid login') || lower.includes('invalid email or password')) return 'Fel e-post eller lösenord'
    if (lower.includes('email not confirmed')) return 'E-postadressen är inte bekräftad. Kolla din inkorg.'
    return 'Ett fel uppstod vid inloggning'
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      })

      if (error) throw error
      if (data.user) router.push('/dashboard')
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? mapError(error.message) : 'Ett fel uppstod vid inloggning'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const isDisabled = loading || !formData.email || !formData.password

  return (
    <MotionConfig reducedMotion={prefersReducedMotion ? 'always' : 'user'}>
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-gray-950 to-black relative overflow-hidden">
        {/* Subtle animated glows */}
        <div className="absolute inset-0 overflow-hidden">
          {!prefersReducedMotion && (
            <>
              <motion.div
                className="absolute -top-40 -right-32 w-72 h-72 bg-gradient-to-br from-indigo-500/15 to-purple-600/15 rounded-full blur-3xl will-change-transform"
                animate={{ x: [0, 60, 0], y: [0, -60, 0], scale: [1, 1.08, 1] }}
                transition={{ duration: 24, repeat: Infinity, ease: 'easeInOut' }}
              />
              <motion.div
                className="absolute -bottom-40 -left-32 w-72 h-72 bg-gradient-to-tr from-emerald-500/12 to-teal-600/12 rounded-full blur-3xl will-change-transform"
                animate={{ x: [0, -60, 0], y: [0, 60, 0], scale: [1.06, 0.96, 1.06] }}
                transition={{ duration: 28, repeat: Infinity, ease: 'easeInOut' }}
              />
            </>
          )}
        </div>

        {/* Header */}
        <motion.header
          className="relative z-10 bg-white/[0.06] backdrop-blur-xl border-b border-white/10"
          initial={{ y: -80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <motion.div whileHover={{ scale: prefersReducedMotion ? 1 : 1.03 }}>
                <Link href="/" className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 rounded-2xl flex items-center justify-center shadow-xl">
                      <span className="text-white font-bold text-xl">C</span>
                    </div>
                  </div>
                  <h1 className="text-3xl font-bold text-white">CoWorker</h1>
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: prefersReducedMotion ? 1 : 1.03 }}>
                <Link href="/auth/signup" className="text-white/80 hover:text-white font-medium px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all duration-300">
                  Skapa konto gratis
                </Link>
              </motion.div>
            </div>
          </div>
        </motion.header>

        <div className="relative z-10 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <motion.div
            className="max-w-md w-full space-y-8"
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="text-center">
              <motion.h2
                className="text-4xl font-bold text-white mb-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                Välkommen tillbaka
              </motion.h2>
              <motion.p
                className="text-white/70 text-lg"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                Logga in för att fortsätta hantera ditt företag
              </motion.p>
            </div>

            <motion.form
              className="mt-8 space-y-6 bg-white/[0.06] backdrop-blur-xl p-8 rounded-3xl border border-white/10 shadow-2xl"
              onSubmit={handleSubmit}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.35 }}
            >
              {error && (
                <motion.div
                  className="bg-red-500/10 border border-red-500/30 text-red-300 px-4 py-3 rounded-xl"
                  initial={{ x: -10, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.25 }}
                >
                  {error}
                </motion.div>
              )}

              <div className="space-y-5">
                <motion.div
                  initial={{ x: -12, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.35, delay: 0.45 }}
                >
                  <label htmlFor="email" className="block text-sm font-semibold text-white/80 mb-2">
                    E-postadress
                  </label>
                  <motion.input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white/[0.06] backdrop-blur-sm border border-white/10 text-white placeholder:text-gray-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all duration-200"
                    placeholder="din@email.com"
                    whileFocus={prefersReducedMotion ? undefined : { scale: 1.01 }}
                  />
                </motion.div>

                <motion.div
                  initial={{ x: -12, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.35, delay: 0.5 }}
                >
                  <label htmlFor="password" className="block text-sm font-semibold text-white/80 mb-2">
                    Lösenord
                  </label>
                  <div className="relative">
                    <motion.input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full pl-4 pr-12 py-3 bg-white/[0.06] backdrop-blur-sm border border-white/10 text-white placeholder:text-gray-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all duration-200"
                      placeholder="Ditt lösenord"
                      whileFocus={prefersReducedMotion ? undefined : { scale: 1.01 }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(v => !v)}
                      className="absolute inset-y-0 right-0 px-3 text-sm text-white/70 hover:text-white"
                      aria-label={showPassword ? 'Dölj lösenord' : 'Visa lösenord'}
                    >
                      {showPassword ? 'Dölj' : 'Visa'}
                    </button>
                  </div>
                  <div className="mt-2 text-right">
                    <Link href="/auth/reset" className="text-sm text-white/70 hover:text-white">
                      Glömt lösenordet?
                    </Link>
                  </div>
                </motion.div>
              </div>

              <motion.div
                className="pt-4"
                initial={{ y: 12, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.35, delay: 0.65 }}
              >
                <motion.button
                  type="submit"
                  disabled={isDisabled}
                  className="w-full text-white py-3 px-4 rounded-xl font-semibold bg-white/10 hover:bg-white/15 border border-white/20 focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-xl"
                  whileHover={prefersReducedMotion ? undefined : { scale: 1.01, y: -1 }}
                  whileTap={prefersReducedMotion ? undefined : { scale: 0.99 }}
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span className="ml-2">Loggar in...</span>
                    </div>
                  ) : (
                    'Logga in'
                  )}
                </motion.button>
              </motion.div>

              <motion.div
                className="text-center pt-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.75 }}
              >
                <motion.div whileHover={{ scale: prefersReducedMotion ? 1 : 1.03 }}>
                  <Link href="/auth/signup" className="text-white/80 hover:text-white font-medium bg-white/5 backdrop-blur-sm px-4 py-2 rounded-xl hover:bg-white/10 border border-white/10 transition-all duration-300">
                    Har inget konto? Skapa ett gratis →
                  </Link>
                </motion.div>
              </motion.div>

              <motion.div
                className="flex items-center justify-center space-x-6 pt-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.85 }}
              >
                {[
                  { icon: '🔒', text: 'Säker inloggning' },
                  { icon: '⚡', text: 'Snabb åtkomst' },
                  { icon: '💼', text: 'Ditt företag väntar' }
                ].map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center text-white/70 text-sm bg-white/5 backdrop-blur-sm px-3 py-1 rounded-full border border-white/10"
                  >
                    <span className="mr-1">{item.icon}</span>
                    {item.text}
                  </div>
                ))}
              </motion.div>

              <motion.div
                className="text-center pt-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.95 }}
              >
                <Link href="/" className="text-white/60 hover:text-white text-sm transition-colors">
                  ← Tillbaka till startsidan
                </Link>
              </motion.div>
            </motion.form>
          </motion.div>
        </div>
      </div>
    </MotionConfig>
  )
}
