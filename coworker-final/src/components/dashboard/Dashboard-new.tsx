'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Users,
  CheckSquare,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  Calendar,
  Clock,
  Star
} from 'lucide-react'
import { XAxis, YAxis, ResponsiveContainer, AreaChart, Area } from 'recharts'
import { GlassCard, GlassButton } from '../ui/glass'
import { formatCurrency, formatDate } from '../../lib/utils'
import { useAuth } from '../../hooks/useAuth'
import { MockDashboardService, MockContactService, MockDealService, MockTaskService } from '../../lib/database/mockServices'
import type { DashboardStats, Contact, Deal, Task } from '../../types'

interface StatCardProps {
  title: string
  value: string | number
  change?: {
    value: number
    type: 'increase' | 'decrease'
  }
  icon: React.ComponentType<{ className?: string }>
  gradient: string
  onClick?: () => void
}

function StatCard({ title, value, change, icon: Icon, gradient, onClick }: StatCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
      className="cursor-pointer"
    >
      <GlassCard className="p-6 relative overflow-hidden" variant="subtle">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-400 mb-2">
              {title}
            </p>
            <p className="text-2xl font-semibold text-white mb-1">
              {value}
            </p>
            {change && (
              <div className={`flex items-center text-sm ${
                change.type === 'increase' ? 'text-green-400' : 'text-red-400'
              }`}>
                {change.type === 'increase' ? (
                  <ArrowUpRight className="w-4 h-4 mr-1" />
                ) : (
                  <ArrowDownRight className="w-4 h-4 mr-1" />
                )}
                {change.value}% från förra månaden
              </div>
            )}
          </div>
          <div className={`p-3 rounded-xl ${gradient}`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
      </GlassCard>
    </motion.div>
  )
}

const chartData = [
  { name: 'Jan', value: 4000 },
  { name: 'Feb', value: 3000 },
  { name: 'Mar', value: 5000 },
  { name: 'Apr', value: 4500 },
  { name: 'Maj', value: 6000 },
  { name: 'Jun', value: 5500 },
]

export default function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentContacts, setRecentContacts] = useState<Contact[]>([])
  const [activeDeals, setActiveDeals] = useState<Deal[]>([])
  const [upcomingTasks, setUpcomingTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadDashboardData = async () => {
      if (user) {
        try {
          setLoading(true)
          const [dashboardStats, contacts, deals, tasks] = await Promise.all([
            MockDashboardService.getDashboardStats(user.id),
            MockContactService.getContacts(user.id),
            MockDealService.getDeals(user.id),
            MockTaskService.getTasks(user.id)
          ])
          
          setStats(dashboardStats)
          setRecentContacts(contacts.slice(0, 5))
          setActiveDeals(deals.slice(0, 5))
          setUpcomingTasks(tasks.slice(0, 5))
        } catch (error) {
          console.error('Fel vid laddning av dashboard-data:', error)
        } finally {
          setLoading(false)
        }
      }
    }

    loadDashboardData()
  }, [user])

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-16 w-16 border-2 border-white/20 border-t-white"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-semibold text-white mb-2">Hej! 👋</h1>
          <p className="text-xl text-gray-300">
            Här är en överblick av ditt företag idag, {formatDate(new Date())}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <GlassButton variant="secondary" size="md">
            <Calendar className="w-4 h-4 mr-2" />
            Denna vecka
          </GlassButton>
          <GlassButton variant="primary" size="md">
            <TrendingUp className="w-4 h-4 mr-2" />
            Visa rapport
          </GlassButton>
        </div>
      </div>

      {/* Huvudstatistik */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Totala kunder"
          value={stats.total_contacts}
          change={{ value: 12, type: 'increase' }}
          icon={Users}
          gradient="bg-gradient-to-br from-blue-500/20 to-blue-600/20"
        />
        <StatCard
          title="Aktiva affärer"
          value={stats.total_deals}
          change={{ value: 8, type: 'increase' }}
          icon={Activity}
          gradient="bg-gradient-to-br from-green-500/20 to-green-600/20"
        />
        <StatCard
          title="Månadens försäljning"
          value={formatCurrency(stats.total_revenue)}
          change={{ value: 23, type: 'increase' }}
          icon={TrendingUp}
          gradient="bg-gradient-to-br from-purple-500/20 to-purple-600/20"
        />
        <StatCard
          title="Att göra idag"
          value={stats.tasks_due_today}
          icon={CheckSquare}
          gradient="bg-gradient-to-br from-orange-500/20 to-orange-600/20"
        />
      </div>

      {/* Försäljningstrend */}
      <GlassCard className="p-8" variant="subtle">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-semibold text-white mb-1">Försäljningstrend</h3>
            <p className="text-gray-400">Utveckling de senaste 6 månaderna</p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-blue-400"></div>
            <span className="text-sm text-gray-300">Försäljning</span>
          </div>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="rgba(59, 130, 246, 0.3)" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="rgba(59, 130, 246, 0.1)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="name" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#9CA3AF', fontSize: 12 }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#9CA3AF', fontSize: 12 }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#3B82F6"
                strokeWidth={2}
                fill="url(#colorGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Senaste kunder */}
        <GlassCard className="p-6" variant="subtle">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-white">Senaste kunder</h3>
            <GlassButton variant="ghost" size="sm">
              Visa alla
            </GlassButton>
          </div>
          <div className="space-y-4">
            {recentContacts.map((contact) => (
              <div key={contact.id} className="flex items-center space-x-4 p-3 rounded-xl hover:bg-white/[0.02] transition-colors">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-semibold">
                  {contact.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{contact.name}</p>
                  <p className="text-xs text-gray-400 truncate">{contact.company || contact.email}</p>
                </div>
                <div className="text-xs text-gray-400">
                  {formatDate(contact.created_at)}
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Pågående affärer */}
        <GlassCard className="p-6" variant="subtle">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-white">Pågående affärer</h3>
            <GlassButton variant="ghost" size="sm">
              Visa alla
            </GlassButton>
          </div>
          <div className="space-y-4">
            {activeDeals.map((deal) => (
              <div key={deal.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/[0.02] transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 rounded-full bg-green-400"></div>
                  <div>
                    <p className="text-sm font-medium text-white">{deal.title}</p>
                    <p className="text-xs text-gray-400">{deal.stage}</p>
                  </div>
                </div>
                <div className="text-sm font-medium text-white">
                  {formatCurrency(deal.amount)}
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Kommande uppgifter */}
      <GlassCard className="p-6" variant="subtle">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-white">Att göra idag</h3>
          <GlassButton variant="ghost" size="sm">
            <Clock className="w-4 h-4 mr-2" />
            Visa alla
          </GlassButton>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {upcomingTasks.map((task) => (
            <div key={task.id} className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] transition-colors">
              <div className="flex items-start justify-between mb-2">
                <h4 className="text-sm font-medium text-white truncate">{task.title}</h4>
                {task.priority === 'high' && (
                  <Star className="w-4 h-4 text-orange-400 flex-shrink-0 ml-2" />
                )}
              </div>
              <p className="text-xs text-gray-400 mb-3 line-clamp-2">{task.description}</p>
              <div className="flex items-center text-xs text-gray-400">
                <Clock className="w-3 h-3 mr-1" />
                {task.due_date ? formatDate(task.due_date) : 'Inget datum'}
              </div>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  )
}
