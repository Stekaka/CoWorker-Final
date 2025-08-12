'use client'

import { motion, useReducedMotion } from 'framer-motion'
import type { TargetAndTransition } from 'framer-motion'
import {
  Users,
  FileText,
  ShoppingCart,
  ClipboardList,
  Mail,
  Building2,
  CheckCircle,
  Send,
  Eye,
  ChevronRight,
  Edit,
  Download,
  Search,
  Plus,
} from 'lucide-react'
import React from 'react'

const cardVariants = {
  initial: { opacity: 0, y: 16 },
  inView: { opacity: 1, y: 0 },
}

function DemoWindow({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative rounded-2xl bg-white/[0.06] border border-white/10 shadow-2xl overflow-hidden backdrop-blur-xl">
      <div className="p-4 md:p-5 h-[220px] md:h-[300px] overflow-hidden">{children}</div>
    </div>
  )
}

export function DemoShowcase() {
  const prefersReducedMotion = useReducedMotion()
  const rowAnimate: TargetAndTransition | undefined = prefersReducedMotion
    ? undefined
    : { y: [0, -6, 0], transition: { duration: 3, repeat: Infinity } }

  const sections = [
    {
      key: 'contacts',
      title: 'Kunder',
      icon: <Users className="w-5 h-5 text-emerald-400" />,
      blurb: 'Kundlistan precis som i appen – snabb sök och tydliga statusar.',
      windowTitle: 'Kundregister',
      windowIcon: <Users className="w-3.5 h-3.5" />,
      visual: (
        <div>
          {/* Toolbar */}
          <div className="mb-3 flex items-center justify-between">
            <div className="relative w-full max-w-[220px]">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                placeholder="Sök kund..."
                className="w-full pl-8 pr-2 py-1.5 text-xs rounded-md bg-white/[0.06] border border-white/10 text-white placeholder:text-gray-400"
              />
            </div>
            <div className="hidden md:flex items-center gap-2">
              <span className="text-[11px] text-white/70 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full">3 kunder</span>
              <span className="text-[11px] text-emerald-300 bg-emerald-500/10 border border-emerald-400/20 px-2 py-0.5 rounded-full">Aktiva</span>
            </div>
          </div>

          {/* List */}
          <div className="space-y-2.5">
            {[
              { n: 'Anna Andersson', c: 'Tech Innovate AB', e: 'anna@techinnovate.se', st: 'Aktiv' },
              { n: 'Erik Nilsson', c: 'Design Studio', e: 'erik@designstudio.se', st: 'Prospekt' },
              { n: 'Acme AB', c: 'Acme AB', e: 'info@acme.se', st: 'Aktiv' },
            ].map((c, i) => (
              <motion.div
                key={c.e}
                className="group rounded-lg p-3.5 bg-white/[0.02] border border-white/10 flex items-center gap-3 hover:bg-white/[0.05] transition-colors"
                animate={rowAnimate}
                style={{ animationDelay: `${i * 0.15}s` }}
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-semibold text-base">
                  {c.n.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[14px] text-white truncate flex items-center gap-2">
                    <span className="font-medium">{c.n}</span>
                    <span className={`${c.st === 'Aktiv' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'} px-2 py-0.5 rounded-full text-[10px]`}>{c.st}</span>
                  </div>
                  <div className="text-xs text-gray-400 truncate flex items-center gap-3">
                    <Building2 className="w-3.5 h-3.5 text-gray-400" />
                    <span className="truncate">{c.c}</span>
                    <span className="opacity-40">•</span>
                    <Mail className="w-3.5 h-3.5 text-gray-400" />
                    <span className="truncate">{c.e}</span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-white/80 transition-colors" />
              </motion.div>
            ))}
          </div>
        </div>
      ),
    },
    {
      key: 'quotes',
      title: 'Offerter',
      icon: <FileText className="w-5 h-5 text-indigo-400" />,
      blurb: 'Listvy med status, belopp, giltighet och åtgärder – precis som i appen.',
      windowTitle: 'Offerter',
      windowIcon: <FileText className="w-3.5 h-3.5" />,
      visual: (
        <div>
          {/* Mini stats */}
          <div className="mb-3 grid grid-cols-3 gap-2">
            <div className="rounded-lg bg-indigo-500/10 border border-indigo-400/20 px-3 py-2">
              <div className="text-[10px] text-indigo-300">Totala</div>
              <div className="text-sm font-semibold text-white">2</div>
            </div>
            <div className="rounded-lg bg-emerald-500/10 border border-emerald-400/20 px-3 py-2">
              <div className="text-[10px] text-emerald-300">Värde</div>
              <div className="text-sm font-semibold text-white">74 788 kr</div>
            </div>
            <div className="rounded-lg bg-yellow-500/10 border border-yellow-400/20 px-3 py-2">
              <div className="text-[10px] text-yellow-300">Väntar</div>
              <div className="text-sm font-semibold text-white">1</div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-hidden rounded-xl border border-white/10">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.06] bg-white/5">
                  <th className="text-left py-2.5 px-4 text-[11px] font-medium text-gray-300">Offertnummer</th>
                  <th className="text-left py-2.5 px-4 text-[11px] font-medium text-gray-300">Kund</th>
                  <th className="text-left py-2.5 px-4 text-[11px] font-medium text-gray-300">Belopp</th>
                  <th className="text-left py-2.5 px-4 text-[11px] font-medium text-gray-300">Status</th>
                  <th className="text-left py-2.5 px-4 text-[11px] font-medium text-gray-300">Giltig till</th>
                  <th className="text-left py-2.5 px-4 text-[11px] font-medium text-gray-300">Åtgärder</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { no: 'OFF-2025-001', cu: 'Tech Innovate AB', amt: '58 850 kr', st: 'Skickad', stIcon: <Send className="w-3.5 h-3.5 text-blue-400" />, d: '2025-09-11' },
                  { no: 'OFF-2025-002', cu: 'Design Studio', amt: '15 938 kr', st: 'Öppnad', stIcon: <Eye className="w-3.5 h-3.5 text-yellow-400" />, d: '2025-08-25' },
                ].map((q, i) => (
                  <motion.tr
                    key={q.no}
                    className="border-t border-white/[0.06] hover:bg-white/[0.05] transition-colors"
                    animate={rowAnimate}
                    style={{ animationDelay: `${i * 0.15}s` }}
                  >
                    <td className="py-2.5 px-4 text-sm text-white font-medium">{q.no}</td>
                    <td className="py-2.5 px-4 text-sm text-white/90 truncate">{q.cu}</td>
                    <td className="py-2.5 px-4 text-sm text-white/90">{q.amt}</td>
                    <td className="py-2.5 px-4">
                      <div className="flex items-center gap-2">
                        {q.stIcon}
                        <span className="text-xs text-white/70">{q.st}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-4 text-xs text-white/60">{q.d}</td>
                    <td className="py-2.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <button className="p-1.5 rounded-md hover:bg-white/10"><Edit className="w-4 h-4 text-white/70" /></button>
                        <button className="p-1.5 rounded-md hover:bg-white/10"><Download className="w-4 h-4 text-white/70" /></button>
                        <button className="p-1.5 rounded-md hover:bg-white/10"><Send className="w-4 h-4 text-white/70" /></button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ),
    },
    {
      key: 'orders',
      title: 'Order',
      icon: <ShoppingCart className="w-5 h-5 text-amber-400" />,
      blurb: 'Från offert till order – samma tydliga listvy.',
      windowTitle: 'Order',
      windowIcon: <ShoppingCart className="w-3.5 h-3.5" />,
      visual: (
        <div>
          {/* Toolbar */}
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-white/80 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full">Bekräftade</span>
              <span className="text-[11px] text-white/80 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full">Skickade</span>
            </div>
            <button className="inline-flex items-center gap-1.5 text-[11px] text-white/80 bg-amber-500/10 border border-amber-400/20 px-2.5 py-1 rounded-md">
              <Plus className="w-3.5 h-3.5" /> Ny order
            </button>
          </div>

          {/* List */}
          <div className="space-y-2.5">
            {[
              { id: 'ORD-845', amt: '9 499 kr', st: 'Bekräftad' },
              { id: 'ORD-846', amt: '2 300 kr', st: 'Skickad' },
            ].map((o, i) => (
              <motion.div
                key={o.id}
                className="h-12 rounded-lg bg-white/[0.02] border border-white/10 flex items-center gap-3 px-3 hover:bg-white/[0.05] transition-colors"
                animate={rowAnimate}
                style={{ animationDelay: `${i * 0.15}s` }}
              >
                <div className="text-sm text-white font-medium">{o.id}</div>
                <div className="ml-auto flex items-center gap-3">
                  <span className="text-xs text-white/80">{o.amt}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full border border-white/10 text-white/70">
                    {o.st}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      ),
    },
    {
      key: 'tasks',
      title: 'Uppgifter',
      icon: <ClipboardList className="w-5 h-5 text-rose-400" />,
      blurb: 'Håll koll på allt som ska göras – personligt och i teamet.',
      windowTitle: 'Uppgifter',
      windowIcon: <ClipboardList className="w-3.5 h-3.5" />,
      visual: (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {['Todo', 'Pågår', 'Klart'].map((col, idx) => (
            <div key={col} className="bg-white/5 border border-white/10 rounded-lg p-2">
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs text-white/70">{col}</div>
                <span className="text-[10px] text-white/70 bg-white/10 border border-white/10 px-1.5 py-0.5 rounded-full">{idx === 2 ? 2 : 2}</span>
              </div>
              <div className="space-y-2">
                {[1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="rounded bg-white/10 border border-white/10 py-2 px-2 text-[11px] text-white/80"
                    animate={rowAnimate}
                  >
                    {col} – uppgift {i}
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ),
    },
  ] as const

  return (
    <section id="demo" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <motion.h2
            className="text-3xl md:text-5xl font-extrabold text-white tracking-tight"
            initial="initial"
            whileInView="inView"
            viewport={{ once: true, amount: 0.3 }}
            variants={cardVariants}
          >
            Så funkar CoWorker CRM
          </motion.h2>
          <motion.p
            className="mt-3 text-white/70 max-w-2xl mx-auto"
            initial="initial"
            whileInView="inView"
            viewport={{ once: true, amount: 0.3 }}
            variants={cardVariants}
            transition={{ delay: 0.1 }}
          >
            Snabba glimtar från riktiga vyer i appen. Lätt, snabbt och precis det du behöver.
          </motion.p>
        </div>

        <div className="space-y-12 md:space-y-16">
          {sections.map((s, idx) => {
            const reversed = idx % 2 === 1
            return (
              <motion.div
                key={s.key}
                className={`flex flex-col items-center md:items-center gap-6 md:gap-10 ${reversed ? 'md:flex-row-reverse' : 'md:flex-row'}`}
                initial="initial"
                whileInView="inView"
                viewport={{ once: true, amount: 0.25 }}
                variants={cardVariants}
              >
                {/* Visual */}
                <div className="w-full md:max-w-[520px] lg:max-w-[560px] xl:max-w-[600px] shrink-0">
                  <DemoWindow>
                    {s.visual}
                  </DemoWindow>
                </div>

                {/* Copy */}
                <div className="w-full md:flex-1 max-w-sm md:max-w-[360px] md:self-center">
                  <div className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/80 text-xs">
                    {s.icon}
                    <span>{s.title}</span>
                  </div>
                  <h3 className="mt-3 text-xl md:text-2xl font-semibold text-white leading-tight">{s.title}</h3>
                  <p className="mt-2 text-white/75 leading-relaxed">{s.blurb}</p>
                </div>
              </motion.div>
            )
          })}
        </div>

        <div className="mt-12 text-center">
          <p className="text-white/50 text-sm">Visar förenklade komponenter för prestanda på landningssidan.</p>
        </div>
      </div>
    </section>
  )
}

export default DemoShowcase
