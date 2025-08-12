'use client'

import { motion, useReducedMotion } from 'framer-motion'
import React from 'react'
import { Users, Mail, Building2, FileText, Send, Eye, ClipboardList, ChevronRight } from 'lucide-react'

export default function HeroPreview() {
  const prefersReducedMotion = useReducedMotion()

  return (
    <div className="relative bg-black/40 backdrop-blur-2xl border border-white/10 rounded-3xl p-4 sm:p-6 lg:p-8 shadow-2xl overflow-hidden h-[320px] sm:h-[360px] lg:h-[400px]">
      {/* Soft background glow */}
      {!prefersReducedMotion && (
        <motion.div
          className="absolute -inset-24 bg-gradient-to-tr from-indigo-500/10 via-purple-600/10 to-transparent"
          animate={{ opacity: [0.15, 0.4, 0.15] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}

      {/* Contacts Panel (primary) */}
      <motion.div
        className="absolute inset-y-6 left-6 right-24 sm:right-32 lg:right-40 rounded-2xl bg-white/[0.06] border border-white/10 shadow-xl p-3 sm:p-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        {...(!prefersReducedMotion && { whileHover: { scale: 1.01 } })}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="inline-flex items-center gap-2 text-white/80 text-xs bg-white/5 border border-white/10 px-2.5 py-1 rounded-full">
            <Users className="w-3.5 h-3.5" /> Kunder
          </div>
          <span className="text-[11px] text-white/60">3 kunder</span>
        </div>
        <div className="space-y-2.5">
          {[
            { n: 'Anna Andersson', c: 'Tech Innovate AB', e: 'anna@techinnovate.se', st: 'Aktiv' },
            { n: 'Erik Nilsson', c: 'Design Studio', e: 'erik@designstudio.se', st: 'Prospekt' },
          ].map((c) => (
            <div key={c.e} className="group rounded-xl p-3 bg-white/[0.02] border border-white/10 flex items-center gap-3 hover:bg-white/[0.05] transition-colors">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-semibold">
                {c.n.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] sm:text-[14px] text-white truncate flex items-center gap-2">
                  <span className="font-medium">{c.n}</span>
                  <span className={`${c.st === 'Aktiv' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'} px-2 py-0.5 rounded-full text-[10px]`}>{c.st}</span>
                </div>
                <div className="text-[11px] text-gray-400 truncate flex items-center gap-3">
                  <Building2 className="w-3.5 h-3.5 text-gray-400" />
                  <span className="truncate">{c.c}</span>
                  <span className="opacity-40">•</span>
                  <Mail className="w-3.5 h-3.5 text-gray-400" />
                  <span className="truncate">{c.e}</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-white/80 transition-colors" />
            </div>
          ))}
        </div>
      </motion.div>

      {/* Quotes Panel (overlay) */}
      <motion.div
        className="absolute top-6 right-6 w-[52%] sm:w-[46%] lg:w-[42%] rounded-2xl bg-white/[0.06] border border-white/10 shadow-xl p-3"
        initial={{ opacity: 0, y: -10, x: 10 }}
        animate={{ opacity: 1, y: 0, x: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <div className="inline-flex items-center gap-2 text-white/80 text-xs bg-white/5 border border-white/10 px-2 py-1 rounded-full mb-2"><FileText className="w-3.5 h-3.5" /> Offerter</div>
        <div className="overflow-hidden rounded-xl border border-white/10">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.06] bg-white/5">
                <th className="text-left py-1.5 px-3 text-[10px] font-medium text-gray-300">Nr</th>
                <th className="text-left py-1.5 px-3 text-[10px] font-medium text-gray-300">Kund</th>
                <th className="text-left py-1.5 px-3 text-[10px] font-medium text-gray-300">Belopp</th>
                <th className="text-left py-1.5 px-3 text-[10px] font-medium text-gray-300">Status</th>
              </tr>
            </thead>
            <tbody>
              {[
                { no: 'OFF-2025-001', cu: 'Tech Innovate AB', amt: '58 850 kr', st: 'Skickad', stIcon: <Send className="w-3.5 h-3.5 text-blue-400" /> },
                { no: 'OFF-2025-002', cu: 'Design Studio', amt: '15 938 kr', st: 'Öppnad', stIcon: <Eye className="w-3.5 h-3.5 text-yellow-400" /> },
              ].map((q) => (
                <tr key={q.no} className="border-t border-white/[0.06]">
                  <td className="py-1.5 px-3 text-xs text-white font-medium">{q.no}</td>
                  <td className="py-1.5 px-3 text-xs text-white/90 truncate">{q.cu}</td>
                  <td className="py-1.5 px-3 text-xs text-white/90">{q.amt}</td>
                  <td className="py-1.5 px-3">
                    <div className="flex items-center gap-1.5">
                      {q.stIcon}
                      <span className="text-[10px] text-white/70">{q.st}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Tasks Panel (overlay) */}
      <motion.div
        className="absolute bottom-6 right-10 w-[46%] sm:w-[40%] lg:w-[36%] rounded-2xl bg-white/[0.06] border border-white/10 shadow-xl p-3"
        initial={{ opacity: 0, y: 10, x: 10 }}
        animate={{ opacity: 1, y: 0, x: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <div className="inline-flex items-center gap-2 text-white/80 text-xs bg-white/5 border border-white/10 px-2 py-1 rounded-full mb-2"><ClipboardList className="w-3.5 h-3.5" /> Uppgifter</div>
        <div className="grid grid-cols-2 gap-2">
          {['Todo', 'Pågår'].map((col) => (
            <div key={col} className="bg-white/5 border border-white/10 rounded-lg p-2">
              <div className="text-[10px] text-white/70 mb-1">{col}</div>
              <div className="space-y-1.5">
                {[1, 2].map((i) => (
                  <div key={i} className="rounded bg-white/10 border border-white/10 py-1.5 px-2 text-[10px] text-white/80">
                    {col} – uppgift {i}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
