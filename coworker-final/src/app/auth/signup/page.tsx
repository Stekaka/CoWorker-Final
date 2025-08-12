'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, useReducedMotion, MotionConfig } from 'framer-motion'
import { supabase } from '@/lib/supabase'

export default function SignUpPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    companyName: '',
    acceptTerms: false,
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const router = useRouter()
  const prefersReducedMotion = useReducedMotion()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const strength = useMemo(() => {
    const pwd = formData.password
    let score = 0
    if (pwd.length >= 6) score++
    if (/[A-ZÅÄÖ]/.test(pwd)) score++
    if (/[a-zåäö]/.test(pwd)) score++
    if (/[0-9]/.test(pwd)) score++
    if (/[^A-Za-z0-9]/.test(pwd)) score++
    return Math.min(score, 4)
  }, [formData.password])

  const strengthText = ['Svagt', 'Okej', 'Bra', 'Starkt', 'Mycket starkt'][strength]
  const strengthColor = ['bg-red-400','bg-amber-400','bg-yellow-400','bg-emerald-500','bg-emerald-600'][strength]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setInfo('')
    setLoading(true)

    if (!formData.acceptTerms) {
      setError('Du måste acceptera villkoren')
      setLoading(false)
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Lösenorden matchar inte')
      setLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError('Lösenordet måste vara minst 6 tecken')
      setLoading(false)
      return
    }

    try {
      const redirectTo = typeof window !== 'undefined' ? `${window.location.origin}/auth/confirm` : undefined
      const { data, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            company_name: formData.companyName
          },
          emailRedirectTo: redirectTo,
        }
      })

      if (authError) throw authError

      if (data?.user) {
        router.push(`/auth/check-email?email=${encodeURIComponent(formData.email)}`)
      } else {
        setError('Ett fel uppstod vid registrering')
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Ett fel uppstod vid registrering'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const isDisabled = loading || !formData.email || !formData.password || !formData.fullName || !formData.companyName || !formData.acceptTerms

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
          initial={{ y: -100, opacity: 0 }}
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
                <Link href="/auth/signin" className="text-white/80 hover:text-white font-medium px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all duration-300">
                  Har redan konto?
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
                Välkommen till framtiden
              </motion.h2>
              <motion.p
                className="text-white/70 text-lg"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                Skapa ditt konto och börja hantera ditt företag som aldrig förr
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

              {info && (
                <motion.div
                  className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 px-4 py-3 rounded-xl"
                  initial={{ x: -10, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.25 }}
                >
                  {info}
                </motion.div>
              )}

              <div className="space-y-5">
                {[
                  { name: 'fullName', label: 'Ditt namn', type: 'text', placeholder: 'För- och efternamn' },
                  { name: 'companyName', label: 'Företagsnamn', type: 'text', placeholder: 'Ditt företags namn' },
                  { name: 'email', label: 'E-postadress', type: 'email', placeholder: 'din@email.com' },
                ].map((field, index) => (
                  <motion.div
                    key={field.name}
                    initial={{ x: -12, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.35, delay: 0.45 + index * 0.05 }}
                  >
                    <label htmlFor={field.name} className="block text-sm font-semibold text-white/80 mb-2">
                      {field.label}
                    </label>
                    <motion.input
                      id={field.name}
                      name={field.name}
                      type={field.type}
                      required
                      value={formData[field.name as keyof typeof formData] as string}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-white/[0.06] backdrop-blur-sm border border-white/10 text-white placeholder:text-gray-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all duration-200"
                      placeholder={field.placeholder}
                      whileFocus={prefersReducedMotion ? undefined : { scale: 1.01 }}
                    />
                  </motion.div>
                ))}

                {/* Password */}
                <motion.div
                  initial={{ x: -12, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.35, delay: 0.6 }}
                >
                  <label htmlFor="password" className="block text-sm font-semibold text-white/80 mb-2">
                    Lösenord
                  </label>
                  <div className="relative">
                    <motion.input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full pl-4 pr-12 py-3 bg-white/[0.06] backdrop-blur-sm border border-white/10 text-white placeholder:text-gray-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all duration-200"
                      placeholder="Minst 6 tecken"
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
                  {/* Strength */}
                  <div className="mt-2">
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <div className={`h-full ${strengthColor} transition-all`} style={{ width: `${(strength+1) * 20}%` }} />
                    </div>
                    <p className="mt-1 text-xs text-white/70">Styrka: {strengthText}</p>
                  </div>
                </motion.div>

                {/* Confirm */}
                <motion.div
                  initial={{ x: -12, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.35, delay: 0.65 }}
                >
                  <label htmlFor="confirmPassword" className="block text-sm font-semibold text-white/80 mb-2">
                    Bekräfta lösenord
                  </label>
                  <div className="relative">
                    <motion.input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirm ? 'text' : 'password'}
                      required
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full pl-4 pr-12 py-3 bg-white/[0.06] backdrop-blur-sm border border-white/10 text-white placeholder:text-gray-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all duration-200"
                      placeholder="Upprepa lösenordet"
                      whileFocus={prefersReducedMotion ? undefined : { scale: 1.01 }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(v => !v)}
                      className="absolute inset-y-0 right-0 px-3 text-sm text-white/70 hover:text-white"
                      aria-label={showConfirm ? 'Dölj lösenord' : 'Visa lösenord'}
                    >
                      {showConfirm ? 'Dölj' : 'Visa'}
                    </button>
                  </div>
                </motion.div>

                {/* Terms */}
                <motion.div
                  className="flex items-start gap-3"
                  initial={{ x: -12, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.35, delay: 0.7 }}
                >
                  <input
                    id="acceptTerms"
                    name="acceptTerms"
                    type="checkbox"
                    checked={formData.acceptTerms}
                    onChange={handleChange}
                    className="mt-1 h-4 w-4 rounded border-white/20 bg-white/5 text-indigo-400 focus:ring-indigo-400"
                  />
                  <label htmlFor="acceptTerms" className="text-sm text-white/70">
                    Jag accepterar{' '}
                    <Link href="/terms" className="text-indigo-300 hover:text-indigo-200 underline underline-offset-2">villkor</Link>{' '}och{' '}
                    <Link href="/privacy" className="text-indigo-300 hover:text-indigo-200 underline underline-offset-2">integritetspolicy</Link>.
                  </label>
                </motion.div>
              </div>

              <motion.div
                className="pt-4"
                initial={{ y: 12, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.35, delay: 0.75 }}
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
                      <span className="ml-2">Skapar konto...</span>
                    </div>
                  ) : (
                    'Skapa konto gratis'
                  )}
                </motion.button>
              </motion.div>

              <motion.div
                className="flex items-center justify-center space-x-6 pt-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.85 }}
              >
                {[
                  { icon: '✓', text: '30 dagar gratis' },
                  { icon: '✓', text: 'Ingen bindning' },
                  { icon: '✓', text: 'Svensk support' }
                ].map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center text-white/70 text-sm bg-white/5 backdrop-blur-sm px-3 py-1 rounded-full border border-white/10"
                  >
                    <span className="text-emerald-300 font-bold mr-1">{item.icon}</span>
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
