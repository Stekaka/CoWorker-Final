'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'

export default function SignUpPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    companyName: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Validering
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
      // Skapa användare i Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            company_name: formData.companyName
          }
        }
      })

      if (authError) throw authError

      if (authData.user) {
        // Företaget skapas automatiskt av triggern i databasen
        // Visa bekräftelsemeddelande
        alert('Konto skapat! Kolla din e-post för bekräftelselänk.')
        router.push('/auth/signin')
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Ett fel uppstod vid registrering'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-100 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-indigo-400/20 to-purple-600/20 rounded-full blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, -100, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-emerald-400/20 to-teal-600/20 rounded-full blur-3xl"
          animate={{
            x: [0, -100, 0],
            y: [0, 100, 0],
            scale: [1.2, 1, 1.2],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      {/* Header */}
      <motion.header 
        className="relative z-10 bg-white/70 backdrop-blur-xl border-b border-white/20"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <motion.div whileHover={{ scale: 1.05 }}>
              <Link href="/" className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 rounded-2xl flex items-center justify-center shadow-xl">
                    <span className="text-white font-bold text-xl">C</span>
                  </div>
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 rounded-2xl opacity-50 blur-xl"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  />
                </div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-indigo-900 to-purple-900 bg-clip-text text-transparent">
                  CoWorker
                </h1>
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }}>
              <Link href="/auth/signin" className="text-gray-700 hover:text-indigo-600 font-medium px-4 py-2 rounded-xl hover:bg-white/50 transition-all duration-300">
                Har redan konto?
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.header>

      <div className="relative z-10 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="max-w-md w-full space-y-8"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="text-center">
            <motion.h2 
              className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-indigo-900 to-purple-900 bg-clip-text text-transparent mb-4"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              Välkommen till framtiden
            </motion.h2>
            <motion.p 
              className="text-gray-600 text-lg"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              Skapa ditt konto och börja hantera ditt företag som aldrig förr
            </motion.p>
          </div>
          
          <motion.form 
            className="mt-8 space-y-6 bg-white/40 backdrop-blur-xl p-8 rounded-3xl border border-white/20 shadow-2xl"
            onSubmit={handleSubmit}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            {error && (
              <motion.div 
                className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                {error}
              </motion.div>
            )}
            
            <div className="space-y-5">
              {[
                { name: 'fullName', label: 'Ditt namn', type: 'text', placeholder: 'För- och efternamn' },
                { name: 'companyName', label: 'Företagsnamn', type: 'text', placeholder: 'Ditt företags namn' },
                { name: 'email', label: 'E-postadress', type: 'email', placeholder: 'din@email.com' },
                { name: 'password', label: 'Lösenord', type: 'password', placeholder: 'Minst 6 tecken' },
                { name: 'confirmPassword', label: 'Bekräfta lösenord', type: 'password', placeholder: 'Upprepa lösenordet' }
              ].map((field, index) => (
                <motion.div
                  key={field.name}
                  initial={{ x: -50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 1 + index * 0.1 }}
                >
                  <label htmlFor={field.name} className="block text-sm font-semibold text-gray-700 mb-2">
                    {field.label}
                  </label>
                  <motion.input
                    id={field.name}
                    name={field.name}
                    type={field.type}
                    required
                    value={formData[field.name as keyof typeof formData]}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white/50 backdrop-blur-sm border border-white/30 text-gray-900 placeholder-gray-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300"
                    placeholder={field.placeholder}
                    whileFocus={{ scale: 1.02 }}
                  />
                </motion.div>
              ))}
            </div>

            <motion.div 
              className="pt-4"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 1.5 }}
            >
              <motion.button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-xl"
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                {loading ? (
                  <motion.div
                    className="flex items-center justify-center"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"></div>
                    <span className="ml-2">Skapar konto...</span>
                  </motion.div>
                ) : (
                  'Skapa konto gratis'
                )}
              </motion.button>
            </motion.div>

            <motion.div 
              className="flex items-center justify-center space-x-6 pt-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 1.7 }}
            >
              {[
                { icon: "✓", text: "30 dagar gratis" },
                { icon: "✓", text: "Ingen bindning" },
                { icon: "✓", text: "Svensk support" }
              ].map((item, index) => (
                <motion.div 
                  key={index}
                  className="flex items-center text-gray-500 text-sm bg-white/30 backdrop-blur-sm px-3 py-1 rounded-full"
                  whileHover={{ scale: 1.05, backgroundColor: "rgba(255, 255, 255, 0.5)" }}
                >
                  <span className="text-emerald-500 font-bold mr-1">{item.icon}</span>
                  {item.text}
                </motion.div>
              ))}
            </motion.div>

            <motion.div 
              className="text-center pt-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 1.9 }}
            >
              <Link href="/" className="text-gray-500 hover:text-indigo-600 text-sm transition-colors">
                ← Tillbaka till startsidan
              </Link>
            </motion.div>
          </motion.form>
        </motion.div>
      </div>
    </div>
  )
}
