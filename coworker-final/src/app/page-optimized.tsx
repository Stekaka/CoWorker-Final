'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'

// Clean TypeWriter-komponent
const TypewriterText = () => {
  const [text, setText] = useState('')
  const [isTyping, setIsTyping] = useState(true)
  
  const fullText = "Din verksamhet. Förenklad."
  
  useEffect(() => {
    let index = 0
    const timer = setInterval(() => {
      if (index <= fullText.length) {
        setText(fullText.slice(0, index))
        index++
      } else {
        setIsTyping(false)
        clearInterval(timer)
      }
    }, 100)
    
    return () => clearInterval(timer)
  }, [])
  
  return (
    <motion.h1 
      className="text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-black leading-tight text-white mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <span className="relative">
        {text}
        {isTyping && (
          <motion.span
            className="inline-block w-1.5 md:w-2 h-16 md:h-20 lg:h-24 xl:h-28 bg-white ml-2"
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 0.8, repeat: Infinity }}
          />
        )}
      </span>
    </motion.h1>
  )
}

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-gray-900 relative overflow-hidden">
      {/* Förenklad bakgrund utan tunga animationer */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Enkel gradient overlay */}
        <div className="absolute -top-60 -right-60 w-[800px] h-[800px] bg-gradient-to-br from-gray-600/20 via-slate-500/25 to-gray-700/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-60 -left-60 w-[700px] h-[700px] bg-gradient-to-tr from-slate-600/20 via-gray-500/20 to-slate-700/20 rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-1/4 w-[600px] h-[600px] bg-gradient-to-r from-purple-500/15 via-slate-600/15 to-gray-600/15 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <motion.header 
        className="relative z-20 bg-black/20 backdrop-blur-2xl border-b border-white/10 shadow-2xl"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
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
                  <div className="text-lg sm:text-2xl font-black text-white">C</div>
                </motion.div>
              </div>
              <span className="text-xl sm:text-3xl font-black text-white">CoWorker</span>
            </motion.div>

            <nav className="hidden md:flex items-center space-x-8">
              <Link 
                href="/dashboard" 
                className="text-white/90 hover:text-white font-medium px-4 sm:px-6 py-2 sm:py-3 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 hover:bg-white/10 transition-all duration-300 text-sm sm:text-base"
              >
                Dashboard
              </Link>
              <Link 
                href="/auth" 
                className="relative bg-white/8 backdrop-blur-2xl text-white px-4 sm:px-8 py-2 sm:py-3 rounded-2xl font-bold border border-white/30 hover:border-white/50 transition-all duration-300 shadow-2xl text-sm sm:text-base"
              >
                Kom igång
              </Link>
            </nav>
          </div>
        </div>
      </motion.header>

      {/* Hero Section - Förenklad utan tunga animationer */}
      <motion.main 
        className="relative z-10 flex items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <div className="text-center max-w-5xl mx-auto">
          <TypewriterText />
          
          <motion.p 
            className="text-xl md:text-2xl lg:text-3xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 2 }}
          >
            CoWorker är den ultimata plattformen för moderna företag. 
            <span className="text-white font-semibold"> Automatisera processer</span>, 
            <span className="text-white font-semibold"> optimera workflows</span> och 
            <span className="text-white font-semibold"> skala din verksamhet</span> med vår AI-drivna lösning.
          </motion.p>

          <motion.div 
            className="flex flex-col sm:flex-row items-center justify-center gap-6"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 2.5 }}
          >
            <Link href="/auth">
              <motion.div
                className="relative group cursor-pointer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
                <div className="relative block bg-black text-white px-8 sm:px-12 py-4 sm:py-5 rounded-2xl text-lg sm:text-xl font-bold transition-all duration-500 shadow-2xl text-center">
                  Kom igång gratis
                </div>
              </motion.div>
            </Link>

            <Link href="/demo">
              <motion.div
                className="relative group cursor-pointer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="relative block bg-transparent text-white/90 hover:text-white px-8 sm:px-12 py-4 sm:py-5 rounded-2xl text-lg sm:text-xl font-semibold border border-white/30 hover:border-white/50 transition-all duration-500 text-center">
                  Se demo
                </div>
              </motion.div>
            </Link>
          </motion.div>
        </div>
      </motion.main>

      {/* Features Section - Förenklad */}
      <motion.section
        className="relative z-10 py-32 px-4 sm:px-6 lg:px-8"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1 }}
        viewport={{ once: true }}
      >
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-20"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl sm:text-6xl font-black text-white mb-6">
              Funktioner som <span className="bg-gradient-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent">förändrar</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Upptäck kraften i modern automatisering och AI-driven produktivitet
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "AI-Automatisering",
                description: "Låt AI hantera repetitiva uppgifter medan du fokuserar på strategi och tillväxt.",
                icon: "🤖"
              },
              {
                title: "Smart Analytics",
                description: "Få djupgående insikter i din verksamhet med våra avancerade analysverktyg.",
                icon: "📊"
              },
              {
                title: "Skalbar Arkitektur",
                description: "Växer med ditt företag från startup till enterprise utan kompromisser.",
                icon: "🚀"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                className="relative bg-black/30 backdrop-blur-2xl rounded-3xl p-8 border border-white/20 shadow-2xl"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.02 }}
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-2xl font-bold text-white mb-4">{feature.title}</h3>
                <p className="text-gray-300 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section
        className="relative z-10 py-32 px-4 sm:px-6 lg:px-8 text-center"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
        viewport={{ once: true }}
      >
        <div className="max-w-4xl mx-auto">
          <motion.h2 
            className="text-4xl sm:text-6xl font-black text-white mb-8"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            Redo att <span className="bg-gradient-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent">transformera</span> din verksamhet?
          </motion.h2>
          
          <motion.p 
            className="text-xl text-gray-300 mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            viewport={{ once: true }}
          >
            Gå med tusentals företag som redan använder CoWorker för att automatisera och optimera sina processer.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            viewport={{ once: true }}
          >
            <Link href="/auth">
              <motion.div
                className="relative group cursor-pointer inline-block"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
                <div className="relative block bg-black text-white px-12 py-6 rounded-2xl text-xl font-bold transition-all duration-500 shadow-2xl">
                  Starta din gratis provperiod
                </div>
              </motion.div>
            </Link>
          </motion.div>
        </div>
      </motion.section>

      {/* Footer */}
      <motion.footer 
        className="relative z-10 bg-black/20 backdrop-blur-2xl border-t border-white/10 py-16 mt-32"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
        viewport={{ once: true }}
      >
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div 
            className="flex items-center justify-center space-x-4 mb-8"
            whileHover={{ scale: 1.05 }}
          >
            <div className="relative">
              <motion.div 
                className="w-12 h-12 bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-2xl"
                animate={{
                  boxShadow: [
                    "0 0 20px rgba(99, 102, 241, 0.3)",
                    "0 0 40px rgba(99, 102, 241, 0.5)",
                    "0 0 20px rgba(99, 102, 241, 0.3)"
                  ]
                }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <div className="text-2xl font-black text-white">C</div>
              </motion.div>
            </div>
            <span className="text-3xl font-black text-white">CoWorker</span>
          </motion.div>
          
          <p className="text-gray-400 mb-8">
            Framtidens verksamhetshantering, tillgänglig idag.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-8 text-gray-400">
            <Link href="/privacy" className="hover:text-white transition-colors">Integritetspolicy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Användarvillkor</Link>
            <Link href="/contact" className="hover:text-white transition-colors">Kontakt</Link>
          </div>
          
          <div className="mt-8 pt-8 border-t border-white/10 text-gray-500 text-sm">
            © 2025 CoWorker. Alla rättigheter förbehållna.
          </div>
        </div>
      </motion.footer>
    </div>
  )
}
