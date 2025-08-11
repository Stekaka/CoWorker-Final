'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

interface AppearanceSettings {
  theme: 'dark' | 'light' | 'auto'
  accentColor: 'blue' | 'purple' | 'green' | 'orange'
  compactMode: boolean
  animations: boolean
  glassMorphism: 'minimal' | 'subtle' | 'enhanced'
  sidebar: 'expanded' | 'compact'
}

interface AppearanceContextType {
  settings: AppearanceSettings
  updateSetting: <K extends keyof AppearanceSettings>(key: K, value: AppearanceSettings[K]) => void
  getGlassVariant: () => 'minimal' | 'subtle' | 'elevated'
  getAccentColors: () => {
    primary: string
    hover: string
    light: string
    border: string
  }
  getAnimationClass: () => string
  getSpacingClass: () => string
  getCurrentTheme: () => 'dark' | 'light'
}

const defaultSettings: AppearanceSettings = {
  theme: 'dark',
  accentColor: 'blue',
  compactMode: false,
  animations: true,
  glassMorphism: 'subtle',
  sidebar: 'expanded'
}

const AppearanceContext = createContext<AppearanceContextType | undefined>(undefined)

export const useAppearance = () => {
  const context = useContext(AppearanceContext)
  if (!context) {
    throw new Error('useAppearance must be used within an AppearanceProvider')
  }
  return context
}

export const AppearanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AppearanceSettings>(defaultSettings)

  // Ladda inställningar från localStorage vid start
  useEffect(() => {
    const savedSettings = localStorage.getItem('appearance-settings')
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings)
        const newSettings = { ...defaultSettings, ...parsed }
        setSettings(newSettings)
        applyTheme(newSettings.theme)
      } catch {
        console.warn('Failed to parse saved appearance settings')
        applyTheme(defaultSettings.theme)
      }
    } else {
      applyTheme(defaultSettings.theme)
    }
  }, [])

  // Spara inställningar till localStorage när de ändras
  useEffect(() => {
    localStorage.setItem('appearance-settings', JSON.stringify(settings))
    applyTheme(settings.theme)
  }, [settings])

  const applyTheme = (theme: 'dark' | 'light' | 'auto') => {
    const root = document.documentElement
    
    if (theme === 'auto') {
      // Använd system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      root.setAttribute('data-theme', prefersDark ? 'dark' : 'light')
      
      // Lyssna på ändringar av system preference
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      const handleChange = (e: MediaQueryListEvent) => {
        root.setAttribute('data-theme', e.matches ? 'dark' : 'light')
      }
      
      mediaQuery.addEventListener('change', handleChange)
      return () => mediaQuery.removeEventListener('change', handleChange)
    } else {
      root.setAttribute('data-theme', theme)
    }
  }

  const updateSetting = <K extends keyof AppearanceSettings>(
    key: K,
    value: AppearanceSettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const getGlassVariant = (): 'minimal' | 'subtle' | 'elevated' => {
    switch (settings.glassMorphism) {
      case 'minimal':
        return 'minimal'
      case 'enhanced':
        return 'elevated'
      default:
        return 'subtle'
    }
  }

  const getAccentColors = () => {
    const colors = {
      blue: {
        primary: 'rgb(59 130 246)', // blue-500
        hover: 'rgb(29 78 216)', // blue-700
        light: 'rgba(59, 130, 246, 0.1)',
        border: 'rgba(59, 130, 246, 0.2)'
      },
      purple: {
        primary: 'rgb(147 51 234)', // purple-500
        hover: 'rgb(109 40 217)', // purple-700
        light: 'rgba(147, 51, 234, 0.1)',
        border: 'rgba(147, 51, 234, 0.2)'
      },
      green: {
        primary: 'rgb(34 197 94)', // green-500
        hover: 'rgb(21 128 61)', // green-700
        light: 'rgba(34, 197, 94, 0.1)',
        border: 'rgba(34, 197, 94, 0.2)'
      },
      orange: {
        primary: 'rgb(249 115 22)', // orange-500
        hover: 'rgb(194 65 12)', // orange-700
        light: 'rgba(249, 115, 22, 0.1)',
        border: 'rgba(249, 115, 22, 0.2)'
      }
    }
    return colors[settings.accentColor]
  }

  const getAnimationClass = () => {
    return settings.animations ? 'transition-all duration-200' : ''
  }

  const getSpacingClass = () => {
    return settings.compactMode ? 'space-y-1' : 'space-y-2'
  }

  const getCurrentTheme = (): 'dark' | 'light' => {
    if (settings.theme === 'auto') {
      if (typeof window !== 'undefined') {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      }
      return 'dark' // fallback
    }
    return settings.theme as 'dark' | 'light'
  }

  const value: AppearanceContextType = {
    settings,
    updateSetting,
    getGlassVariant,
    getAccentColors,
    getAnimationClass,
    getSpacingClass,
    getCurrentTheme
  }

  return (
    <AppearanceContext.Provider value={value}>
      {children}
    </AppearanceContext.Provider>
  )
}
