'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BarChart3,
  Users,
  Briefcase,
  CheckSquare,
  Settings,
  Search,
  Bell,
  Plus,
  Menu,
  X,
  Home,
  MessageSquare
} from 'lucide-react'
import { GlassCard, GlassButton } from '../ui/glass'
import { cn } from '../../lib/utils'
import { useAuth } from '../../hooks/useAuth'

interface NavigationItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: number
}

// Förenklad navigation för småföretag - fokus på det viktigaste
const navigation: NavigationItem[] = [
  {
    name: 'Översikt',
    href: '/dashboard',
    icon: Home,
  },
  {
    name: 'Kunder',
    href: '/dashboard/contacts',
    icon: Users,
    badge: 12,
  },
  {
    name: 'Affärer',
    href: '/dashboard/deals',
    icon: Briefcase,
    badge: 5,
  },
  {
    name: 'Att göra',
    href: '/dashboard/tasks',
    icon: CheckSquare,
    badge: 3,
  },
  {
    name: 'Aktiviteter',
    href: '/dashboard/activities',
    icon: MessageSquare,
  },
  {
    name: 'Inställningar',
    href: '/dashboard/settings',
    icon: Settings,
  },
]

interface NavigationItemProps {
  item: NavigationItem
  pathname: string
  onClick?: () => void
}

const NavigationItem: React.FC<NavigationItemProps> = ({ item, pathname, onClick }) => {
  const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
  
  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={cn(
        'flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 relative group',
        isActive
          ? 'bg-white/[0.08] text-white border border-white/[0.08]'
          : 'text-gray-400 hover:text-white hover:bg-white/[0.03]'
      )}
    >
      <div className="flex items-center space-x-3">
        <item.icon className={cn(
          'w-5 h-5 transition-colors',
          isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'
        )} />
        <span>{item.name}</span>
      </div>
      {item.badge && (
        <span className={cn(
          'px-2 py-0.5 text-xs font-medium rounded-full transition-colors',
          isActive
            ? 'bg-white/20 text-white'
            : 'bg-white/[0.05] text-gray-400 group-hover:bg-white/10 group-hover:text-white'
        )}>
          {item.badge}
        </span>
      )}
    </Link>
  )
}

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, signOut } = useAuth()
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black">
      {/* Subtle background effects */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.003),transparent_50%)] pointer-events-none" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(255,255,255,0.002),transparent_50%)] pointer-events-none" />
      
      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      <div className="flex min-h-screen">
        {/* Desktop Sidebar - Always visible on large screens */}
        <aside className="hidden lg:block lg:w-72 xl:w-80 flex-shrink-0">
          <GlassCard className="h-full m-4 p-8 flex flex-col" variant="subtle" blur="xl">
            {/* Logo */}
            <div className="flex items-center space-x-4 mb-12">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-white/[0.08] to-white/[0.02] border border-white/[0.08] flex items-center justify-center backdrop-blur-xl">
                <BarChart3 className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-white">CoWorker</h1>
                <p className="text-sm text-gray-400">CRM Premium</p>
              </div>
            </div>

            {/* Quick Action */}
            <div className="mb-8">
              <GlassButton
                variant="primary"
                className="w-full justify-center text-sm font-medium"
                size="md"
              >
                <Plus className="w-4 h-4 mr-2" />
                Lägg till ny
              </GlassButton>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-1">
              {navigation.map((item) => (
                <NavigationItem
                  key={item.name}
                  item={item}
                  pathname={pathname}
                />
              ))}
            </nav>

            {/* User section */}
            <div className="mt-8 pt-6 border-t border-white/[0.05]">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-white/[0.08] to-white/[0.02] border border-white/[0.08] flex items-center justify-center">
                  <span className="text-sm font-medium text-white">
                    {user?.email?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {user?.email}
                  </p>
                  <p className="text-xs text-gray-400">Administratör</p>
                </div>
              </div>
              <GlassButton
                variant="ghost"
                size="sm"
                className="w-full justify-start text-gray-400 hover:text-white"
                onClick={signOut}
              >
                <Settings className="w-4 h-4 mr-2" />
                Logga ut
              </GlassButton>
            </div>
          </GlassCard>
        </aside>

        {/* Mobile Sidebar */}
        <motion.aside
          initial={false}
          animate={{
            x: sidebarOpen ? 0 : '-100%',
          }}
          className="fixed inset-y-0 left-0 z-50 w-80 lg:hidden"
        >
          <GlassCard className="h-full m-4 p-8 flex flex-col" variant="subtle" blur="xl">
            {/* Logo */}
            <div className="flex items-center justify-between mb-12">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-white/[0.08] to-white/[0.02] border border-white/[0.08] flex items-center justify-center backdrop-blur-xl">
                  <BarChart3 className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-white">CoWorker</h1>
                  <p className="text-sm text-gray-400">CRM Premium</p>
                </div>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 rounded-xl hover:bg-white/[0.03] transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Quick Action */}
            <div className="mb-8">
              <GlassButton
                variant="primary"
                className="w-full justify-center text-sm font-medium"
                size="md"
              >
                <Plus className="w-4 h-4 mr-2" />
                Lägg till ny
              </GlassButton>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-1">
              {navigation.map((item) => (
                <NavigationItem
                  key={item.name}
                  item={item}
                  pathname={pathname}
                  onClick={() => setSidebarOpen(false)}
                />
              ))}
            </nav>

            {/* User section */}
            <div className="mt-8 pt-6 border-t border-white/[0.05]">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-white/[0.08] to-white/[0.02] border border-white/[0.08] flex items-center justify-center">
                  <span className="text-sm font-medium text-white">
                    {user?.email?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {user?.email}
                  </p>
                  <p className="text-xs text-gray-400">Administratör</p>
                </div>
              </div>
              <GlassButton
                variant="ghost"
                size="sm"
                className="w-full justify-start text-gray-400 hover:text-white"
                onClick={signOut}
              >
                <Settings className="w-4 h-4 mr-2" />
                Logga ut
              </GlassButton>
            </div>
          </GlassCard>
        </motion.aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <header className="sticky top-0 z-30 bg-transparent backdrop-blur-xl border-b border-white/[0.03]">
            <div className="px-6 lg:px-8 py-4 max-w-7xl mx-auto w-full">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setSidebarOpen(true)}
                    className="lg:hidden p-2 rounded-xl hover:bg-white/[0.03] transition-colors"
                  >
                    <Menu className="w-5 h-5 text-white" />
                  </button>
                  
                  {/* Search */}
                  <div className="hidden md:block relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Sök..."
                      className="pl-10 pr-4 py-2 w-80 bg-white/[0.02] border border-white/[0.05] rounded-xl text-white text-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-white/[0.08] focus:border-white/[0.08] backdrop-blur-xl transition-all"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <button className="p-2 rounded-xl hover:bg-white/[0.03] transition-colors relative">
                    <Bell className="w-5 h-5 text-gray-400" />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-white/40 rounded-full"></span>
                  </button>
                </div>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 px-6 lg:px-8 py-8">
            <div className="max-w-7xl mx-auto w-full">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
