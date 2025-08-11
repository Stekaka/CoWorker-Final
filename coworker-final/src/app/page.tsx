'use client'

import Link from 'next/link'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
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
  const [isHovering, setIsHovering] = useState(false)

  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  
  const springConfig = { damping: 25, stiffness: 300 }
  const springX = useSpring(mouseX, springConfig)
  const springY = useSpring(mouseY, springConfig)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e
      mouseX.set(clientX)
      mouseY.set(clientY)
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [mouseX, mouseY])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-gray-900 relative overflow-hidden">
      {/* Liquid Glass Background - Mindre blått, mer mörkt */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Dynamic Liquid Blobs - Mörka toner */}
        <motion.div
          className="absolute -top-60 -right-60 w-[800px] h-[800px] bg-gradient-to-br from-gray-600/20 via-slate-500/25 to-gray-700/20 rounded-full blur-3xl"
          animate={{
            x: [0, 200, -100, 0],
            y: [0, -150, 100, 0],
            scale: [1, 1.4, 0.8, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute -bottom-60 -left-60 w-[700px] h-[700px] bg-gradient-to-tr from-slate-600/20 via-gray-500/20 to-slate-700/20 rounded-full blur-3xl"
          animate={{
            x: [0, -250, 150, 0],
            y: [0, 200, -80, 0],
            scale: [1.2, 0.7, 1.5, 1.2],
            rotate: [360, 180, 0],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute top-1/3 right-1/4 w-[600px] h-[600px] bg-gradient-to-r from-purple-500/15 via-slate-600/15 to-gray-600/15 rounded-full blur-3xl"
          animate={{
            x: [0, 100, -200, 50, 0],
            y: [0, -100, 150, -50, 0],
            scale: [1, 1.6, 0.9, 1.3, 1],
            rotate: [0, 90, 270, 180, 360],
          }}
          transition={{
            duration: 35,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        {/* Interactive Liquid Elements that follow mouse - Mörka färger */}
        <motion.div
          className="absolute w-40 h-40 bg-gradient-to-br from-gray-400/30 to-slate-600/30 rounded-full blur-2xl pointer-events-none"
          style={{
            x: useTransform(springX, [0, typeof window !== 'undefined' ? window.innerWidth : 1920], [-200, 200]),
            y: useTransform(springY, [0, typeof window !== 'undefined' ? window.innerHeight : 1080], [-100, 100]),
          }}
          animate={{
            scale: isHovering ? 1.5 : 1,
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            scale: { duration: 0.3 },
            opacity: { duration: 2, repeat: Infinity }
          }}
        />
        <motion.div
          className="absolute w-32 h-32 bg-gradient-to-br from-purple-400/40 to-slate-600/40 rounded-full blur-xl pointer-events-none"
          style={{
            x: useTransform(springX, [0, typeof window !== 'undefined' ? window.innerWidth : 1920], [150, -150]),
            y: useTransform(springY, [0, typeof window !== 'undefined' ? window.innerHeight : 1080], [100, -100]),
          }}
          animate={{
            rotate: [0, 360],
            scale: [0.8, 1.2, 0.8],
          }}
          transition={{
            rotate: { duration: 20, repeat: Infinity, ease: "linear" },
            scale: { duration: 3, repeat: Infinity }
          }}
        />
      </div>

      {/* Floating Interactive Glass Elements */}
      {Array.from({ length: 8 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-16 h-16 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl cursor-pointer"
          style={{
            top: `${20 + i * 10}%`,
            left: `${10 + i * 12}%`,
          }}
          animate={{
            y: [0, -30, 0],
            rotate: [0, 15, -15, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 4 + i,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.5
          }}
          whileHover={{
            scale: 1.5,
            rotate: 45,
            backgroundColor: "rgba(255, 255, 255, 0.2)",
            transition: { duration: 0.3 }
          }}
          whileTap={{ scale: 0.9 }}
        />
      ))}

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
              onHoverStart={() => setIsHovering(true)}
              onHoverEnd={() => setIsHovering(false)}
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

      {/* Hero Section - Responsiv Full Viewport */}
      <main className="relative z-10">
        <div className="flex items-center justify-center min-h-[calc(100vh-120px)] px-4 sm:px-6 lg:px-8">
          <div className="text-center relative max-w-6xl mx-auto w-full">
            {/* Avancerade floating elements */}
            {Array.from({ length: 8 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-3 h-3 bg-gradient-to-br from-white/30 to-gray-300/20 rounded-full backdrop-blur-sm border border-white/20"
                style={{
                  top: `${15 + Math.random() * 70}%`,
                  left: `${10 + Math.random() * 80}%`,
                }}
                animate={{
                  y: [0, -30 - Math.random() * 20, 0],
                  x: [0, Math.random() * 20 - 10, 0],
                  opacity: [0.2, 0.8, 0.2],
                  scale: [0.5, 1.2, 0.5],
                  rotate: [0, 360],
                }}
                transition={{
                  duration: 6 + Math.random() * 4,
                  repeat: Infinity,
                  delay: Math.random() * 3,
                  ease: "easeInOut"
                }}
              />
            ))}

            {/* Hero Title - Responsiv */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="mb-8"
            >
              <TypewriterText />
            </motion.div>
            
            {/* Subtitle - Optimerad storlek */}
            <motion.p 
              className="text-xl md:text-2xl lg:text-3xl text-white/70 mb-12 max-w-4xl mx-auto leading-relaxed font-light"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              Hantera kunder, skapa offerter och följ upp affärer. 
              <motion.span 
                className="block mt-2 text-white/90 font-medium"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
              >
                Allt i en plattform som bara fungerar.
              </motion.span>
            </motion.p>
            
            {/* Spektakulära Liquid Glass CTA-knappar - Mobiloptimerade */}
            <motion.div 
              className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6 mb-12 sm:mb-16"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              {/* Primär Liquid Glass knapp */}
              <motion.div 
                whileHover={{ 
                  scale: 1.05, 
                  y: -5,
                  rotateX: 5,
                }} 
                whileTap={{ scale: 0.98 }}
                className="relative group perspective-1000 w-full sm:w-auto"
              >
                {/* Outer glow */}
                <motion.div
                  className="absolute -inset-3 bg-gradient-to-r from-white/20 via-gray-200/30 to-white/20 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100"
                  transition={{ duration: 0.5 }}
                />
                
                {/* Glass layers */}
                <div className="relative">
                  {/* Back glass layer */}
                  <motion.div
                    className="absolute inset-0 bg-white/5 backdrop-blur-3xl rounded-2xl border border-white/20 shadow-2xl"
                    animate={{
                      boxShadow: [
                        "0 8px 32px rgba(255, 255, 255, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2)",
                        "0 16px 48px rgba(255, 255, 255, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.3)",
                        "0 8px 32px rgba(255, 255, 255, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2)"
                      ]
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                  />
                  
                  {/* Front glass layer */}
                  <motion.div
                    className="absolute inset-[1px] bg-gradient-to-b from-white/10 to-white/5 backdrop-blur-2xl rounded-2xl"
                    animate={{
                      background: [
                        "linear-gradient(to bottom, rgba(255,255,255,0.1), rgba(255,255,255,0.05))",
                        "linear-gradient(to bottom, rgba(255,255,255,0.15), rgba(255,255,255,0.08))",
                        "linear-gradient(to bottom, rgba(255,255,255,0.1), rgba(255,255,255,0.05))"
                      ]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  
                  <Link 
                    href="/auth/signup" 
                    className="relative block bg-transparent text-white px-8 sm:px-12 py-4 sm:py-5 rounded-2xl text-lg sm:text-xl font-bold transition-all duration-500 shadow-2xl overflow-hidden z-10 text-center"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2 sm:gap-3">
                      <motion.span
                        animate={{ 
                          scale: [1, 1.2, 1],
                          rotate: [0, 5, -5, 0]
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="text-base sm:text-lg"
                      >
                        ✨
                      </motion.span>
                      <span className="whitespace-nowrap">
                        <span className="sm:hidden">Börja gratis</span>
                        <span className="hidden sm:inline">Kom igång gratis</span>
                      </span>
                    </span>
                    
                    {/* Liquid ripple-effekt */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-white/5 via-white/15 to-white/5 opacity-0 group-hover:opacity-100 rounded-2xl"
                      animate={{
                        x: ["-100%", "200%"],
                      }}
                      transition={{
                        duration: 1.5,
                        ease: "easeInOut",
                        repeat: Infinity,
                        repeatDelay: 2
                      }}
                    />
                    
                    {/* Inner shimmer */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12 opacity-0 group-hover:opacity-100"
                      animate={{
                        x: ["-200%", "200%"],
                      }}
                      transition={{
                        duration: 0.8,
                        ease: "easeOut",
                        repeat: Infinity,
                        repeatDelay: 3
                      }}
                    />
                  </Link>
                </div>
              </motion.div>

              {/* Sekundär Liquid Glass knapp */}
              <motion.div 
                whileHover={{ 
                  scale: 1.05, 
                  y: -3,
                }} 
                whileTap={{ scale: 0.98 }}
                className="relative group w-full sm:w-auto"
              >
                {/* Subtle glow */}
                <motion.div
                  className="absolute -inset-2 bg-gradient-to-r from-white/10 to-gray-200/15 rounded-3xl blur-xl opacity-0 group-hover:opacity-100"
                  transition={{ duration: 0.4 }}
                />
                
                <div className="relative">
                  <motion.div
                    className="absolute inset-0 bg-white/5 backdrop-blur-2xl rounded-2xl border-2 border-white/20 shadow-xl"
                    whileHover={{
                      borderColor: "rgba(255, 255, 255, 0.4)",
                      boxShadow: "0 12px 40px rgba(255, 255, 255, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.2)"
                    }}
                    transition={{ duration: 0.3 }}
                  />
                  
                  <Link 
                    href="#demo" 
                    className="relative block bg-transparent text-white/90 hover:text-white px-8 sm:px-12 py-4 sm:py-5 rounded-2xl text-lg sm:text-xl font-semibold transition-all duration-500 overflow-hidden z-10 text-center"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2 sm:gap-3">
                      <span className="whitespace-nowrap">
                        <span className="sm:hidden">Se demo</span>
                        <span className="hidden sm:inline">Se hur det fungerar</span>
                      </span>
                      <motion.span
                        animate={{ x: [0, 3, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="text-base sm:text-lg"
                      >
                        →
                      </motion.span>
                    </span>
                    
                    {/* Hover overlay */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-white/5 to-white/10 opacity-0 group-hover:opacity-100 rounded-2xl"
                      transition={{ duration: 0.4 }}
                    />
                  </Link>
                </div>
              </motion.div>
            </motion.div>

            {/* Premium trust indicators - Mobiloptimerade */}
            <motion.div 
              className="flex flex-wrap justify-center items-center gap-4 sm:gap-6 lg:gap-8 text-white/60 px-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 1.2 }}
            >
              {[
                { text: "30 dagar gratis", icon: "🎯" },
                { text: "Ingen bindning", icon: "🔓" },
                { text: "Svensk support", icon: "🇸🇪" }
              ].map((item, index) => (
                <motion.div 
                  key={index}
                  className="relative group cursor-pointer"
                  whileHover={{ 
                    scale: 1.05, 
                    y: -2,
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  {/* Glow-effekt */}
                  <motion.div
                    className="absolute -inset-2 bg-gradient-to-r from-white/10 to-gray-200/15 rounded-2xl blur-xl opacity-0 group-hover:opacity-100"
                    transition={{ duration: 0.4 }}
                  />
                  
                  <div className="relative flex items-center gap-2 sm:gap-3 bg-black/20 backdrop-blur-2xl px-3 sm:px-4 lg:px-6 py-2 sm:py-3 rounded-2xl border border-white/15 group-hover:border-white/30 transition-all duration-500 shadow-xl">
                    <motion.div
                      className="text-sm sm:text-base lg:text-lg"
                      animate={{ 
                        rotate: [0, 5, -5, 0],
                        scale: [1, 1.1, 1]
                      }}
                      transition={{ 
                        duration: 2,
                        repeat: Infinity,
                        delay: index * 0.3
                      }}
                    >
                      {item.icon}
                    </motion.div>
                    <span className="font-semibold text-white/80 group-hover:text-white transition-colors text-sm sm:text-base">
                      {item.text}
                    </span>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Tre olika Demo-vyer med animerad app-användning */}
        <section id="demo" className="mt-32 relative">
          <div className="max-w-7xl mx-auto px-6">
            <motion.h2 
              className="text-5xl font-bold text-center mb-20 bg-gradient-to-r from-white via-gray-200 to-gray-300 bg-clip-text text-transparent"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              Se hur CoWorker fungerar
            </motion.h2>

            <div className="space-y-32">
              {/* Demo 1: Dashboard Overview */}
              <motion.div 
                className="relative group"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, delay: 0.2 }}
                viewport={{ once: true }}
              >
                <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center">
                  <div className="px-4 sm:px-0">
                    <motion.h3 
                      className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4 sm:mb-6 text-center lg:text-left"
                      initial={{ opacity: 0, x: -50 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.8, delay: 0.3 }}
                      viewport={{ once: true }}
                    >
                      Komplett översikt av din verksamhet
                    </motion.h3>
                    <motion.p 
                      className="text-lg sm:text-xl text-gray-400 leading-relaxed text-center lg:text-left"
                      initial={{ opacity: 0, x: -50 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.8, delay: 0.4 }}
                      viewport={{ once: true }}
                    >
                      Få en tydlig bild av intäkter, kunder, pågående affärer och kommande uppgifter. 
                      Allt samlat på en plats för snabba beslut.
                    </motion.p>
                  </div>

                  {/* Animerad Dashboard */}
                  <motion.div 
                    className="relative"
                    initial={{ opacity: 0, x: 100 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 1, delay: 0.5 }}
                    viewport={{ once: true }}
                  >
                    <div className="relative bg-black/50 backdrop-blur-3xl border border-white/10 rounded-3xl p-8 shadow-2xl overflow-hidden">
                      {/* Header */}
                      <motion.div 
                        className="flex justify-between items-center mb-8"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.8 }}
                        viewport={{ once: true }}
                      >
                        <div>
                          <h4 className="text-xl font-bold text-white mb-1">Dashboard</h4>
                          <p className="text-gray-400 text-sm">Välkommen tillbaka!</p>
                        </div>
                        <div className="w-10 h-10 bg-gradient-to-br from-gray-600 to-gray-800 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-sm">JD</span>
                        </div>
                      </motion.div>

                      {/* Stats Cards med animerad data */}
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        {[
                          { label: "Intäkter", value: "847 500 kr", change: "+12%", color: "green", icon: "💰" },
                          { label: "Kunder", value: "156", change: "+8%", color: "blue", icon: "👥" },
                          { label: "Affärer", value: "23", change: "+15%", color: "purple", icon: "📊" },
                          { label: "Uppgifter", value: "12", change: "5 idag", color: "orange", icon: "✓" }
                        ].map((stat, index) => (
                          <motion.div 
                            key={index}
                            className="bg-black/40 backdrop-blur-2xl rounded-2xl p-4 border border-white/10"
                            initial={{ opacity: 0, scale: 0.8 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.4, delay: 0.9 + index * 0.1 }}
                            viewport={{ once: true }}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className={`w-8 h-8 bg-gradient-to-br from-${stat.color}-600 to-${stat.color}-800 rounded-lg flex items-center justify-center text-sm`}>
                                {stat.icon}
                              </div>
                              <span className={`text-${stat.color}-400 text-xs font-medium`}>{stat.change}</span>
                            </div>
                            <h5 className="text-white text-sm font-semibold">{stat.label}</h5>
                            <motion.p 
                              className="text-lg font-bold text-white"
                              initial={{ opacity: 0 }}
                              whileInView={{ opacity: 1 }}
                              transition={{ duration: 0.8, delay: 1.2 + index * 0.1 }}
                              viewport={{ once: true }}
                            >
                              {stat.value}
                            </motion.p>
                          </motion.div>
                        ))}
                      </div>

                      {/* Senaste aktivitet med animerad lista */}
                      <motion.div 
                        className="bg-black/40 backdrop-blur-2xl rounded-2xl p-4 border border-white/10"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 1.5 }}
                        viewport={{ once: true }}
                      >
                        <h5 className="text-white font-semibold mb-3 text-sm">Senaste aktivitet</h5>
                        <div className="space-y-2">
                          {[
                            "Ny kund registrerad - Anna Andersson",
                            "Offert skickad till Tech Solutions AB",
                            "Möte inbokat med Innovation Inc"
                          ].map((activity, index) => (
                            <motion.div 
                              key={index}
                              className="flex items-center space-x-2 text-gray-300 text-xs"
                              initial={{ opacity: 0, x: -20 }}
                              whileInView={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.4, delay: 1.7 + index * 0.2 }}
                              viewport={{ once: true }}
                            >
                              <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                              <span>{activity}</span>
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    </div>
                  </motion.div>
                </div>
              </motion.div>

              {/* Demo 2: Offert-skapande */}
              <motion.div 
                className="relative group"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1 }}
                viewport={{ once: true }}
              >
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                  {/* Animerad Offert-vy */}
                  <motion.div 
                    className="relative lg:order-1"
                    initial={{ opacity: 0, x: -100 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 1, delay: 0.3 }}
                    viewport={{ once: true }}
                  >
                    <div className="relative bg-black/50 backdrop-blur-3xl border border-white/10 rounded-3xl p-8 shadow-2xl overflow-hidden">
                      {/* Header */}
                      <motion.div 
                        className="flex justify-between items-center mb-8"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.6 }}
                        viewport={{ once: true }}
                      >
                        <div>
                          <h4 className="text-xl font-bold text-white mb-1">Skapa offert</h4>
                          <p className="text-gray-400 text-sm">Till: Tech Solutions AB</p>
                        </div>
                        <motion.button 
                          className="bg-gradient-to-r from-gray-600 to-slate-800 text-white px-4 py-2 rounded-xl text-sm font-bold"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          Skicka
                        </motion.button>
                      </motion.div>

                      {/* Offert detaljer */}
                      <div className="space-y-4">
                        {/* Produkter */}
                        <motion.div 
                          className="bg-black/40 backdrop-blur-2xl rounded-2xl p-4 border border-white/10"
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.6, delay: 0.8 }}
                          viewport={{ once: true }}
                        >
                          <h5 className="text-white font-semibold mb-3 text-sm">Valda produkter</h5>
                          {[
                            { name: "Webbdesign Premium", qty: "1", price: "45 000 kr" },
                            { name: "CRM Setup", qty: "1", price: "25 000 kr" },
                            { name: "Support 12 mån", qty: "1", price: "15 000 kr" }
                          ].map((product, index) => (
                            <motion.div 
                              key={index}
                              className="flex justify-between items-center py-2 border-b border-white/10 last:border-b-0"
                              initial={{ opacity: 0, scale: 0.9 }}
                              whileInView={{ opacity: 1, scale: 1 }}
                              transition={{ duration: 0.4, delay: 1 + index * 0.1 }}
                              viewport={{ once: true }}
                            >
                              <div>
                                <p className="text-white text-sm font-medium">{product.name}</p>
                                <p className="text-gray-400 text-xs">Antal: {product.qty}</p>
                              </div>
                              <span className="text-green-400 font-semibold text-sm">{product.price}</span>
                            </motion.div>
                          ))}
                        </motion.div>

                        {/* Total */}
                        <motion.div 
                          className="bg-black/40 backdrop-blur-2xl rounded-2xl p-4 border border-white/10"
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.6, delay: 1.4 }}
                          viewport={{ once: true }}
                        >
                          <div className="flex justify-between items-center">
                            <span className="text-white font-bold">Total exkl. moms:</span>
                            <motion.span 
                              className="text-2xl font-bold text-green-400"
                              initial={{ scale: 0 }}
                              whileInView={{ scale: 1 }}
                              transition={{ duration: 0.6, delay: 1.6 }}
                              viewport={{ once: true }}
                            >
                              85 000 kr
                            </motion.span>
                          </div>
                        </motion.div>
                      </div>
                    </div>
                  </motion.div>

                  <div className="lg:order-2">
                    <motion.h3 
                      className="text-4xl font-bold text-white mb-6"
                      initial={{ opacity: 0, x: 50 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.8, delay: 0.3 }}
                      viewport={{ once: true }}
                    >
                      Skapa professionella offerter på minuter
                    </motion.h3>
                    <motion.p 
                      className="text-xl text-gray-400 leading-relaxed"
                      initial={{ opacity: 0, x: 50 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.8, delay: 0.4 }}
                      viewport={{ once: true }}
                    >
                      Välj produkter från ditt bibliotek, anpassa priser och skicka direkt till kunden. 
                      Automatisk uppföljning och påminnelser inkluderat.
                    </motion.p>
                  </div>
                </div>
              </motion.div>

              {/* Demo 3: Kundlista */}
              <motion.div 
                className="relative group"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1 }}
                viewport={{ once: true }}
              >
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                  <div>
                    <motion.h3 
                      className="text-4xl font-bold text-white mb-6"
                      initial={{ opacity: 0, x: -50 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.8, delay: 0.3 }}
                      viewport={{ once: true }}
                    >
                      Hantera alla dina kunder smart
                    </motion.h3>
                    <motion.p 
                      className="text-xl text-gray-400 leading-relaxed"
                      initial={{ opacity: 0, x: -50 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.8, delay: 0.4 }}
                      viewport={{ once: true }}
                    >
                      Sök, filtrera och organisera dina kunder. Spåra kontakthistorik, 
                      pågående projekt och se vilka som behöver uppföljning.
                    </motion.p>
                  </div>

                  {/* Animerad Kundlista */}
                  <motion.div 
                    className="relative"
                    initial={{ opacity: 0, x: 100 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 1, delay: 0.5 }}
                    viewport={{ once: true }}
                  >
                    <div className="relative bg-black/50 backdrop-blur-3xl border border-white/10 rounded-3xl p-8 shadow-2xl overflow-hidden">
                      {/* Header med sök */}
                      <motion.div 
                        className="mb-6"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.8 }}
                        viewport={{ once: true }}
                      >
                        <h4 className="text-xl font-bold text-white mb-3">Kunder</h4>
                        <div className="relative">
                          <input 
                            type="text" 
                            placeholder="Sök kunder..."
                            className="w-full bg-black/40 border border-white/20 rounded-xl px-4 py-2 text-white placeholder-gray-400 text-sm"
                          />
                          <motion.div 
                            className="absolute right-3 top-2.5 text-gray-400"
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          >
                            🔍
                          </motion.div>
                        </div>
                      </motion.div>

                      {/* Kundlista */}
                      <div className="space-y-3">
                        {[
                          { 
                            name: "Anna Andersson", 
                            company: "Tech Solutions AB", 
                            status: "Aktiv", 
                            lastContact: "2 dagar sedan",
                            statusColor: "green"
                          },
                          { 
                            name: "Erik Johansson", 
                            company: "Innovation Inc", 
                            status: "Förhandling", 
                            lastContact: "1 vecka sedan",
                            statusColor: "yellow"
                          },
                          { 
                            name: "Maria Nilsson", 
                            company: "Creative Agency", 
                            status: "Behöver uppföljning", 
                            lastContact: "3 veckor sedan",
                            statusColor: "red"
                          }
                        ].map((customer, index) => (
                          <motion.div 
                            key={index}
                            className="flex items-center justify-between p-4 bg-black/40 backdrop-blur-2xl rounded-xl border border-white/10 hover:bg-white/5 transition-colors cursor-pointer"
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.4, delay: 1 + index * 0.2 }}
                            viewport={{ once: true }}
                            whileHover={{ x: 5 }}
                          >
                            <div className="flex items-center space-x-4">
                              <div className="w-10 h-10 bg-gradient-to-br from-gray-600 to-gray-800 rounded-full flex items-center justify-center">
                                <span className="text-white text-sm font-bold">
                                  {customer.name.split(' ').map(n => n[0]).join('')}
                                </span>
                              </div>
                              <div>
                                <p className="text-white font-medium text-sm">{customer.name}</p>
                                <p className="text-gray-400 text-xs">{customer.company}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <motion.span 
                                className={`inline-block px-2 py-1 rounded-full text-xs font-medium bg-${customer.statusColor}-900/30 text-${customer.statusColor}-400 border border-${customer.statusColor}-700/50`}
                                initial={{ scale: 0 }}
                                whileInView={{ scale: 1 }}
                                transition={{ duration: 0.3, delay: 1.2 + index * 0.2 }}
                                viewport={{ once: true }}
                              >
                                {customer.status}
                              </motion.span>
                              <p className="text-gray-500 text-xs mt-1">{customer.lastContact}</p>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Kraftfulla verktyg - Ultra Premium Revolution */}
        <motion.div 
          id="features" 
          className="mt-32 sm:mt-40 px-4 sm:px-6 lg:px-8"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1.5 }}
          viewport={{ once: true }}
        >
          {/* Massive Energy Field Background */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Quantum energy rings */}
            {Array.from({ length: 6 }).map((_, i) => (
              <motion.div
                key={`energy-ring-${i}`}
                className="absolute rounded-full border border-cyan-400/20"
                style={{
                  width: `${400 + i * 200}px`,
                  height: `${400 + i * 200}px`,
                  left: '50%',
                  top: '50%',
                  marginLeft: `-${200 + i * 100}px`,
                  marginTop: `-${200 + i * 100}px`,
                }}
                animate={{
                  rotate: [0, i % 2 === 0 ? 360 : -360],
                  scale: [1, 1.1, 1],
                  opacity: [0.1, 0.3, 0.1],
                }}
                transition={{
                  duration: 20 + i * 5,
                  repeat: Infinity,
                  ease: "linear"
                }}
              />
            ))}
            
            {/* Cosmic dust particles */}
            {Array.from({ length: 25 }).map((_, i) => (
              <motion.div
                key={`cosmic-${i}`}
                className="absolute w-1 h-1 bg-gradient-to-r from-cyan-400/60 to-purple-600/60 rounded-full"
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                }}
                animate={{
                  y: [0, -200 - Math.random() * 200, 0],
                  x: [0, Math.random() * 200 - 100, 0],
                  rotate: [0, 360],
                  scale: [0, 2, 0],
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 12 + Math.random() * 8,
                  repeat: Infinity,
                  delay: Math.random() * 10,
                  ease: "easeInOut"
                }}
              />
            ))}
          </div>

          <div className="text-center mb-16 sm:mb-24 relative max-w-7xl mx-auto">
            {/* Revolutionary 3D holographic title */}
            <motion.div
              className="relative perspective-1000"
              initial={{ y: 150, opacity: 0, rotateX: 45 }}
              whileInView={{ y: 0, opacity: 1, rotateX: 0 }}
              transition={{ duration: 1.5, ease: "backOut" }}
              viewport={{ once: true }}
            >
              {/* Multiple layered aurora backgrounds */}
              <motion.div
                className="absolute -inset-20 bg-gradient-to-r from-cyan-400/10 via-purple-500/20 to-pink-400/10 blur-3xl rounded-full"
                animate={{
                  scale: [1, 1.6, 1],
                  opacity: [0.2, 0.8, 0.2],
                  rotate: [0, 180, 360],
                }}
                transition={{
                  duration: 12,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              <motion.div
                className="absolute -inset-16 bg-gradient-to-l from-pink-400/15 via-cyan-500/25 to-purple-400/15 blur-2xl rounded-full"
                animate={{
                  scale: [1.2, 0.8, 1.2],
                  opacity: [0.3, 0.6, 0.3],
                  rotate: [360, 180, 0],
                }}
                transition={{
                  duration: 10,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              
              <motion.h2 
                className="relative text-4xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-black bg-gradient-to-r from-white via-cyan-200 to-purple-300 bg-clip-text text-transparent mb-8 leading-tight"
                whileHover={{ 
                  scale: 1.02,
                  rotateY: 5,
                  textShadow: "0 0 40px rgba(255,255,255,0.8)"
                }}
                animate={{
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
                }}
                transition={{
                  backgroundPosition: { duration: 8, repeat: Infinity, ease: "easeInOut" },
                  scale: { duration: 0.4 },
                  rotateY: { duration: 0.4 }
                }}
                style={{ 
                  backgroundSize: '200% 200%',
                  transformStyle: 'preserve-3d'
                }}
              >
                Kraftfulla verktyg
              </motion.h2>
              
              {/* Revolutionary animated underline with energy flow */}
              <motion.div
                className="mx-auto h-1 sm:h-2 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-400 rounded-full relative overflow-hidden"
                initial={{ width: 0, height: 0 }}
                whileInView={{ width: "16rem", height: "0.5rem" }}
                transition={{ duration: 2.5, delay: 0.8 }}
                viewport={{ once: true }}
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/80 to-transparent"
                  animate={{
                    x: ["-200%", "300%"],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                    repeatDelay: 2
                  }}
                />
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-cyan-300/50 via-purple-400/50 to-pink-300/50 blur-sm"
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.5, 1, 0.5]
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              </motion.div>
            </motion.div>
            
            <motion.p 
              className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-white/80 max-w-5xl mx-auto leading-relaxed mt-8 sm:mt-12 font-light px-4"
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 1.2, delay: 1 }}
              viewport={{ once: true }}
            >
              Designade för att <motion.span className="text-cyan-300 font-bold relative" whileHover={{ scale: 1.05, color: "#22d3ee" }}>
                förenkla komplexitet
                <motion.div 
                  className="absolute -bottom-1 left-0 w-full h-0.5 bg-cyan-400 origin-left"
                  initial={{ scaleX: 0 }}
                  whileHover={{ scaleX: 1 }}
                  transition={{ duration: 0.3 }}
                />
              </motion.span> och <motion.span className="text-purple-300 font-bold relative" whileHover={{ scale: 1.05, color: "#a855f7" }}>
                accelerera din tillväxt
                <motion.div 
                  className="absolute -bottom-1 left-0 w-full h-0.5 bg-purple-400 origin-left"
                  initial={{ scaleX: 0 }}
                  whileHover={{ scaleX: 1 }}
                  transition={{ duration: 0.3 }}
                />
              </motion.span>
            </motion.p>
          </div>

          {/* Revolutionary 3D Feature Grid - Mobiloptimerad */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 lg:gap-12 max-w-7xl mx-auto">
            {[
              {
                icon: "🧠",
                title: "Intelligent CRM",
                description: "AI-driven kundhantering som lär sig dina mönster och optimerar dina processer automatiskt med machine learning.",
                gradient: "from-purple-400 via-violet-500 to-purple-600",
                glowColor: "rgba(168, 85, 247, 0.4)",
                accentColor: "purple",
                direction: "diagonal-up"
              },
              {
                icon: "⚡",
                title: "Smart Offerter", 
                description: "Generera professionella offerter på sekunder med intelligent prissättning och automatisk uppföljning.",
                gradient: "from-cyan-400 via-blue-500 to-indigo-600",
                glowColor: "rgba(6, 182, 212, 0.4)",
                accentColor: "cyan",
                direction: "vertical"
              },
              {
                icon: "🌐",
                title: "Unified Workspace",
                description: "All företagsdata centraliserad i en elegant, säker miljö med realtidsuppdateringar och liquid glass-interface.",
                gradient: "from-pink-400 via-rose-500 to-red-500", 
                glowColor: "rgba(236, 72, 153, 0.4)",
                accentColor: "pink",
                direction: "diagonal-down"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                className="group relative w-full"
                initial={{ 
                  y: feature.direction === 'vertical' ? 150 : feature.direction === 'diagonal-up' ? -100 : 100,
                  x: feature.direction === 'diagonal-up' ? -100 : feature.direction === 'diagonal-down' ? 100 : 0,
                  opacity: 0,
                  rotateY: -20,
                  scale: 0.8
                }}
                whileInView={{ y: 0, x: 0, opacity: 1, rotateY: 0, scale: 1 }}
                transition={{ 
                  duration: 1.4, 
                  delay: index * 0.4,
                  ease: "backOut"
                }}
                whileHover={{ 
                  y: -20, 
                  scale: 1.03,
                  rotateY: feature.direction === 'diagonal-up' ? 8 : feature.direction === 'diagonal-down' ? -8 : 4,
                  z: 100
                }}
                viewport={{ once: true }}
                style={{ perspective: "1500px" }}
              >
                {/* Ultra-premium multi-dimensional aura */}
                <motion.div
                  className="absolute -inset-8 rounded-3xl blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000"
                  style={{ backgroundColor: feature.glowColor }}
                  animate={{
                    scale: [1, 1.3, 1],
                    rotate: [0, 10, -10, 0],
                  }}
                  transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
                
                {/* Secondary energy field */}
                <motion.div
                  className={`absolute -inset-4 rounded-3xl blur-xl opacity-0 group-hover:opacity-60 bg-gradient-to-r ${feature.gradient}`}
                  animate={{
                    scale: [1.1, 0.9, 1.1],
                    opacity: [0, 0.6, 0],
                  }}
                  transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
                
                <motion.div 
                  className="relative bg-black/50 backdrop-blur-3xl rounded-3xl p-6 sm:p-8 lg:p-10 border border-white/20 shadow-2xl hover:shadow-4xl transition-all duration-700 overflow-hidden transform-gpu min-h-[400px] sm:min-h-[450px] flex flex-col"
                  whileHover={{
                    borderColor: "rgba(255, 255, 255, 0.4)",
                    backgroundColor: "rgba(0, 0, 0, 0.6)"
                  }}
                >
                  {/* Revolutionary liquid matrix background */}
                  <motion.div
                    className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 rounded-3xl`}
                    animate={{
                      backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
                      scale: [1, 1.2, 1],
                    }}
                    transition={{
                      backgroundPosition: { duration: 8, repeat: Infinity, ease: "easeInOut" },
                      scale: { duration: 4, repeat: Infinity, ease: "easeInOut" }
                    }}
                    style={{ backgroundSize: '200% 200%' }}
                  />
                  
                  {/* Quantum holographic grid */}
                  <motion.div
                    className="absolute inset-0 opacity-0 group-hover:opacity-30 rounded-3xl overflow-hidden"
                    animate={{
                      rotate: [0, 360],
                    }}
                    transition={{
                      duration: 15,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                  >
                    <div 
                      className="absolute inset-0"
                      style={{ 
                        background: `radial-gradient(circle at 30% 30%, ${feature.glowColor}, transparent 50%), radial-gradient(circle at 70% 70%, ${feature.glowColor}, transparent 50%)`,
                      }}
                    />
                  </motion.div>
                  
                  {/* Ultra-advanced icon with quantum effects */}
                  <motion.div 
                    className={`w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br ${feature.gradient} rounded-3xl flex items-center justify-center mb-6 sm:mb-8 text-3xl sm:text-4xl shadow-2xl relative overflow-hidden mx-auto lg:mx-0`}
                    whileHover={{ 
                      rotate: 360, 
                      scale: 1.2,
                      boxShadow: `0 25px 60px ${feature.glowColor}`,
                    }}
                    transition={{ 
                      rotate: { duration: 1.2, ease: "backOut" },
                      scale: { duration: 0.4 },
                      boxShadow: { duration: 0.4 }
                    }}
                  >
                    {/* Triple-layer energy pulse */}
                    <motion.div
                      className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} rounded-3xl blur-lg`}
                      animate={{
                        scale: [1, 1.6, 1],
                        opacity: [0.4, 1, 0.4]
                      }}
                      transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                    
                    {/* Orbital energy rings */}
                    <motion.div
                      className="absolute inset-0 rounded-3xl"
                      animate={{
                        rotate: [0, 360],
                      }}
                      transition={{
                        duration: 10,
                        repeat: Infinity,
                        ease: "linear"
                      }}
                    >
                      <div 
                        className="absolute inset-0 rounded-3xl"
                        style={{ 
                          background: `conic-gradient(from 0deg, transparent, ${feature.glowColor}, transparent)`,
                          mask: 'radial-gradient(circle, transparent 60%, black 65%, black 70%, transparent 75%)'
                        }}
                      />
                    </motion.div>
                    
                    {/* Lightning energy streams */}
                    <motion.div
                      className="absolute inset-0 rounded-3xl overflow-hidden"
                      animate={{
                        rotate: [0, -360],
                      }}
                      transition={{
                        duration: 12,
                        repeat: Infinity,
                        ease: "linear"
                      }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent" 
                           style={{ 
                             clipPath: 'polygon(0% 40%, 100% 45%, 100% 55%, 0% 50%)',
                             transform: 'skewX(-20deg)'
                           }} 
                      />
                    </motion.div>
                    
                    <span className="relative z-10 filter drop-shadow-lg">{feature.icon}</span>
                  </motion.div>
                  
                  <div className="flex-1 flex flex-col text-center lg:text-left">
                    <motion.h3 
                      className={`text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4 sm:mb-6 group-hover:text-${feature.accentColor}-300 transition-colors duration-500`}
                      whileHover={{ scale: 1.02 }}
                    >
                      {feature.title}
                    </motion.h3>
                    
                    <motion.p 
                      className="text-white/70 text-base sm:text-lg leading-relaxed group-hover:text-white/90 transition-colors duration-500 flex-1"
                      whileHover={{ scale: 1.01 }}
                    >
                      {feature.description}
                    </motion.p>
                  </div>

                  {/* Revolutionary quantum corner effects */}
                  <div className="absolute top-4 sm:top-6 right-4 sm:right-6 flex gap-1 sm:gap-2">
                    {[0, 1, 2].map((dot) => (
                      <motion.div
                        key={dot}
                        className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white/20 rounded-full"
                        animate={{
                          scale: [1, 3, 1],
                          opacity: [0.2, 1, 0.2],
                          rotate: [0, 180, 360]
                        }}
                        transition={{
                          duration: 4,
                          repeat: Infinity,
                          delay: dot * 0.8,
                          ease: "easeInOut"
                        }}
                        whileHover={{ 
                          scale: 4, 
                          backgroundColor: feature.glowColor,
                          boxShadow: `0 0 25px ${feature.glowColor}`
                        }}
                      />
                    ))}
                  </div>
                  
                  {/* Floating quantum micro-elements */}
                  {Array.from({ length: 6 }).map((_, i) => (
                    <motion.div
                      key={`micro-${i}`}
                      className="absolute w-1 h-1 bg-white/20 rounded-full"
                      style={{
                        top: `${15 + Math.random() * 70}%`,
                        left: `${15 + Math.random() * 70}%`,
                      }}
                      animate={{
                        y: [0, -30, 0],
                        x: [0, 20, 0],
                        opacity: [0, 1, 0],
                        scale: [0, 2, 0],
                      }}
                      transition={{
                        duration: 6 + Math.random() * 4,
                        repeat: Infinity,
                        delay: Math.random() * 4,
                        ease: "easeInOut"
                      }}
                    />
                  ))}
                  
                  {/* Hyperdimensional progress indicator */}
                  <motion.div
                    className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    animate={{
                      scaleX: [0, 1, 0],
                      opacity: [0, 0.8, 0]
                    }}
                    transition={{
                      duration: 6,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: index * 2
                    }}
                  />
                </motion.div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Liquid Glass CTA Section */}
        <motion.div 
          className="mt-40 text-center relative"
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5 }}
          viewport={{ once: true }}
        >
          {/* Floating liquid elements */}
          {Array.from({ length: 6 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-20 h-20 bg-gradient-to-br from-cyan-400/20 to-purple-600/20 rounded-full blur-xl"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
              }}
              animate={{
                x: [0, 100, -100, 0],
                y: [0, -100, 100, 0],
                scale: [1, 1.5, 0.5, 1],
                rotate: [0, 180, 360],
              }}
              transition={{
                duration: 15 + Math.random() * 10,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 2
              }}
            />
          ))}

          <div className="relative bg-black/30 backdrop-blur-2xl rounded-3xl p-8 sm:p-12 lg:p-16 border border-white/20 shadow-2xl overflow-hidden group">
            {/* Animated liquid background */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-cyan-400/10 via-purple-400/10 to-pink-400/10"
              animate={{
                opacity: [0.1, 0.3, 0.1],
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            
            <div className="relative z-10">
              <motion.h2 
                className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-black bg-gradient-to-r from-white via-cyan-200 to-purple-300 bg-clip-text text-transparent mb-6 sm:mb-8 leading-tight"
                animate={{
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                whileHover={{ scale: 1.02 }}
              >
                Redo för framtiden?
              </motion.h2>
              
              <motion.p 
                className="text-lg sm:text-xl lg:text-2xl text-white/80 mb-8 sm:mb-12 max-w-3xl mx-auto leading-relaxed px-4 sm:px-0"
                whileHover={{ scale: 1.01, color: "#93c5fd" }}
              >
                Gå med i revolutionen av företag som redan bygger sin framtid med <span className="text-cyan-300 font-bold">CoWorker</span>
              </motion.p>
              
              <motion.div 
                whileHover={{ scale: 1.05, y: -5 }} 
                whileTap={{ scale: 0.95 }}
                className="relative inline-block w-full sm:w-auto"
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-purple-600 rounded-3xl blur-xl opacity-70"
                  animate={{
                    scale: [1, 1.2, 1],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                  }}
                />
                <Link 
                  href="/auth/signup" 
                  className="relative block bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 text-white px-8 sm:px-12 lg:px-16 py-4 sm:py-5 lg:py-6 rounded-3xl text-lg sm:text-xl lg:text-2xl font-black shadow-2xl transition-all duration-500 overflow-hidden group text-center"
                >
                  <span className="relative z-10">🚀 Starta din transformation</span>
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-500 opacity-0 group-hover:opacity-100"
                    transition={{ duration: 0.5 }}
                  />
                  <motion.div
                    className="absolute top-0 left-0 w-full h-full bg-white/20"
                    animate={{
                      x: ["-100%", "100%"],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut",
                      repeatDelay: 2
                    }}
                  />
                </Link>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Liquid Glass Footer */}
      <motion.footer 
        className="relative z-10 bg-black/20 backdrop-blur-2xl border-t border-white/10 py-16 mt-32 overflow-hidden"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
        viewport={{ once: true }}
      >
        {/* Floating footer particles */}
        {Array.from({ length: 15 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-gradient-to-r from-cyan-400 to-purple-600 rounded-full"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -50, 0],
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: 4 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 3,
              ease: "easeInOut"
            }}
          />
        ))}

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
                    "0 0 20px rgba(59, 130, 246, 0.5)",
                    "0 0 40px rgba(147, 51, 234, 0.7)",
                    "0 0 20px rgba(59, 130, 246, 0.5)"
                  ]
                }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <span className="text-white font-bold text-lg">C</span>
              </motion.div>
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 rounded-3xl opacity-50 blur-xl"
                animate={{ 
                  scale: [1, 1.3, 1],
                  rotate: [0, 180, 360]
                }}
                transition={{ duration: 8, repeat: Infinity }}
              />
            </div>
            <motion.h3 
              className="text-3xl font-bold bg-gradient-to-r from-white via-cyan-200 to-purple-300 bg-clip-text text-transparent"
              animate={{
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              CoWorker
            </motion.h3>
          </motion.div>
          <motion.p 
            className="text-xl text-white/70 font-medium"
            whileHover={{ scale: 1.05, color: "#93c5fd" }}
          >
            Framtiden för företagshantering är här
          </motion.p>
        </div>
      </motion.footer>
    </div>
  )
}
