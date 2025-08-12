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
  MessageSquare,
  FileText,
  Calendar
} from 'lucide-react'
import { GlassCard, GlassButton } from '../ui/glass'
import { cn } from '../../lib/utils'
import { useAuth } from '../../hooks/useAuth'
import { useAppearance } from '../../contexts/AppearanceContext'

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
  },
  {
    name: 'Affärer',
    href: '/dashboard/deals',
    icon: Briefcase,
  },
  {
    name: 'Att göra',
    href: '/dashboard/tasks',
    icon: CheckSquare,
  },
  {
    name: 'Kalender',
    href: '/dashboard/calendar-compact',
    icon: Calendar,
  },
  {
    name: 'Aktiviteter',
    href: '/dashboard/activities',
    icon: MessageSquare,
  },
  {
    name: 'Offerter',
    href: '/dashboard/quotes',
    icon: FileText,
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
  const { getAnimationClass, getCurrentTheme } = useAppearance()
  const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
  
  // Tema-specifika färger
  const isDark = getCurrentTheme() === 'dark'
  
  const getNavColors = () => {
    if (isDark) {
      return {
        active: 'bg-white/[0.08] text-white border border-white/[0.08]',
        inactive: 'text-gray-400 hover:text-white hover:bg-white/[0.03]',
        icon: isActive ? 'text-white' : 'text-gray-400 group-hover:text-white',
        badge: isActive ? 'bg-white/20 text-white' : 'bg-white/[0.05] text-gray-400 group-hover:bg-white/10 group-hover:text-white'
      }
    } else {
      return {
        active: 'bg-black/[0.08] text-gray-900 border border-black/[0.1] shadow-sm',
        inactive: 'text-gray-600 hover:text-gray-900 hover:bg-black/[0.04]',
        icon: isActive ? 'text-gray-900' : 'text-gray-600 group-hover:text-gray-900',
        badge: isActive ? 'bg-black/20 text-white' : 'bg-black/[0.08] text-gray-700 group-hover:bg-black/15 group-hover:text-gray-900'
      }
    }
  }

  const navColors = getNavColors()
  
  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={cn(
        `flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium relative group ${getAnimationClass()}`,
        isActive ? navColors.active : navColors.inactive
      )}
    >
      <div className="flex items-center space-x-3">
        <item.icon className={cn(
          `w-5 h-5 ${getAnimationClass()}`,
          navColors.icon
        )} />
        <span>{item.name}</span>
      </div>
      {item.badge && (
        <span className={cn(
          `px-2 py-0.5 text-xs font-medium rounded-full ${getAnimationClass()}`,
          navColors.badge
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
  const { getGlassVariant, getAnimationClass, getSpacingClass, getCurrentTheme } = useAppearance()
  const pathname = usePathname()

  // Theme detection
  const isDark = getCurrentTheme() === 'dark'

  // Dynamiska tema-klasser baserat på aktuellt tema
  const getThemeClasses = () => {
    const isDark = getCurrentTheme() === 'dark'
    
    if (isDark) {
      return {
        background: 'bg-gradient-to-br from-gray-950 via-gray-900 to-black',
        text: 'text-white',
        textSecondary: 'text-gray-400',
        textMuted: 'text-gray-500'
      }
    } else {
      return {
        background: 'bg-gradient-to-br from-slate-50 via-gray-100 to-slate-200',
        text: 'text-gray-900',
        textSecondary: 'text-gray-600',
        textMuted: 'text-gray-500'
      }
    }
  }

  const themeClasses = getThemeClasses()

  return (
    <div className={`min-h-screen ${themeClasses.background}`}>
      {/* Subtle background effects */}
      <div className="fixed inset-0 bg-[var(--background-overlay-1)] pointer-events-none" />
      <div className="fixed inset-0 bg-[var(--background-overlay-2)] pointer-events-none" />
      
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
          <GlassCard className="h-full m-4 p-8 flex flex-col" variant={getGlassVariant()} blur="xl">
            {/* Logo */}
            <div className="flex items-center space-x-4 mb-12">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-white/[0.08] to-white/[0.02] border border-white/[0.08] flex items-center justify-center backdrop-blur-xl">
                <BarChart3 className={`w-7 h-7 ${themeClasses.text}`} />
              </div>
              <div>
                <h1 className={`text-xl font-semibold ${themeClasses.text}`}>CoWorker</h1>
                <p className={`text-sm ${themeClasses.textSecondary}`}>CRM Premium</p>
              </div>
            </div>

            {/* Quick Action */}
            <div className="mb-8">
              <GlassButton
                variant="primary"
                className={`w-full justify-center text-sm font-medium ${getAnimationClass()}`}
                size="md"
              >
                <Plus className="w-4 h-4 mr-2" />
                Lägg till ny
              </GlassButton>
            </div>

            {/* Navigation */}
            <nav className={`flex-1 ${getSpacingClass()}`}>
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
          <GlassCard className="h-full m-4 p-8 flex flex-col" variant={getGlassVariant()} blur="xl">
            {/* Logo */}
            <div className="flex items-center justify-between mb-12">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-white/[0.08] to-white/[0.02] border border-white/[0.08] flex items-center justify-center backdrop-blur-xl">
                  <BarChart3 className={`w-7 h-7 ${themeClasses.text}`} />
                </div>
                <div>
                  <h1 className={`text-xl font-semibold ${themeClasses.text}`}>CoWorker</h1>
                  <p className={`text-sm ${themeClasses.textSecondary}`}>CRM Premium</p>
                </div>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className={`p-2 rounded-xl hover:bg-white/[0.03] ${getAnimationClass()}`}
              >
                <X className={`w-5 h-5 ${themeClasses.text}`} />
              </button>
            </div>

            {/* Quick Action */}
            <div className="mb-8">
              <GlassButton
                variant="primary"
                className={`w-full justify-center text-sm font-medium ${getAnimationClass()}`}
                size="md"
              >
                <Plus className="w-4 h-4 mr-2" />
                Lägg till ny
              </GlassButton>
            </div>

            {/* Navigation */}
            <nav className={`flex-1 ${getSpacingClass()}`}>
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
                  <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {user?.email?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'} truncate`}>
                    {user?.email}
                  </p>
                  <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Administratör</p>
                </div>
              </div>
              <GlassButton
                variant="ghost"
                size="sm"
                className={`w-full justify-start ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
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
                    className={`lg:hidden p-2 rounded-xl hover:bg-white/[0.03] ${getAnimationClass()}`}
                  >
                    <Menu className={`w-5 h-5 ${themeClasses.text}`} />
                  </button>
                  
                  {/* Search */}
                  <div className="hidden md:block relative">
                    <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${themeClasses.textMuted} w-4 h-4`} />
                    <input
                      type="text"
                      placeholder="Sök..."
                      className={cn(
                        `pl-10 pr-4 py-2 w-80 rounded-xl text-sm focus:outline-none focus:ring-1 backdrop-blur-xl ${getAnimationClass()}`,
                        getCurrentTheme() === 'dark' 
                          ? 'bg-white/[0.02] border border-white/[0.05] text-white placeholder-gray-400 focus:ring-white/[0.08] focus:border-white/[0.08]'
                          : 'bg-white/[0.8] border border-black/[0.1] text-gray-900 placeholder-gray-500 focus:ring-black/[0.15] focus:border-black/[0.15] shadow-sm'
                      )}
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
