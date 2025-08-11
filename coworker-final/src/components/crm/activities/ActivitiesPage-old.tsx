'use client'

import React, { useState, useEffect } from 'react'
import {
  Calendar,
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Clock,
  User,
  Building,
  Phone,
  Mail,
  MessageSquare,
  FileText,
  CheckCircle,
  Download,
  Upload
} from 'lucide-react'
import { GlassCard, GlassButton } from '../../ui/glass'
import { formatDate, cn } from '../../../lib/utils'
import { useAuth } from '../../../hooks/useAuth'
import { MockActivityService } from '../../../lib/database/mockServices'
import type { Activity } from '../../../types'

interface ActivityCardProps {
  activity: Activity
  onEdit: (activity: Activity) => void
  onDelete: (id: string) => void
}

const ActivityCard: React.FC<ActivityCardProps> = ({ activity, onEdit, onDelete }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'call':
        return <Phone className="w-4 h-4" />
      case 'email':
        return <Mail className="w-4 h-4" />
      case 'meeting':
        return <Calendar className="w-4 h-4" />
      case 'note':
        return <FileText className="w-4 h-4" />
      case 'task':
        return <CheckCircle className="w-4 h-4" />
      default:
        return <MessageSquare className="w-4 h-4" />
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'call':
        return 'text-green-400 bg-green-500/20'
      case 'email':
        return 'text-blue-400 bg-blue-500/20'
      case 'meeting':
        return 'text-purple-400 bg-purple-500/20'
      case 'note':
        return 'text-yellow-400 bg-yellow-500/20'
      case 'task':
        return 'text-orange-400 bg-orange-500/20'
      default:
        return 'text-gray-400 bg-gray-500/20'
    }
  }

  const getActivityLabel = (type: string) => {
    switch (type) {
      case 'call':
        return 'Samtal'
      case 'email':
        return 'E-post'
      case 'meeting':
        return 'Möte'
      case 'note':
        return 'Anteckning'
      case 'task':
        return 'Uppgift'
      default:
        return 'Aktivitet'
    }
  }

  return (
    <GlassCard className="p-6 hover:bg-white/10 transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3 flex-1">
          <div className={`p-2 rounded-lg ${getActivityColor(activity.type)}`}>
            {getActivityIcon(activity.type)}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-semibold text-white">{activity.title}</h3>
              <span className={`px-2 py-1 text-xs rounded-full ${getActivityColor(activity.type)}`}>
                {getActivityLabel(activity.type)}
              </span>
            </div>
            <p className="text-gray-300 text-sm line-clamp-2 mb-2">{activity.description}</p>
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(activity.date)}</span>
              </div>
              {activity.duration_minutes && (
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{activity.duration_minutes} min</span>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="relative">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <MoreHorizontal className="w-4 h-4 text-gray-300" />
          </button>
          {isMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-black/90 backdrop-blur-xl border border-white/20 rounded-lg shadow-xl z-10">
              <button
                onClick={() => {
                  onEdit(activity)
                  setIsMenuOpen(false)
                }}
                className="w-full px-4 py-2 text-left text-white hover:bg-white/10 flex items-center gap-2 first:rounded-t-lg"
              >
                <Edit className="w-4 h-4" />
                Redigera
              </button>
              <button
                onClick={() => {
                  onDelete(activity.id)
                  setIsMenuOpen(false)
                }}
                className="w-full px-4 py-2 text-left text-red-400 hover:bg-red-500/20 flex items-center gap-2 last:rounded-b-lg"
              >
                <Trash2 className="w-4 h-4" />
                Ta bort
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {activity.contact_id && (
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-blue-400" />
            <span className="text-gray-300 text-sm">Kontakt kopplad</span>
          </div>
        )}
        {activity.deal_id && (
          <div className="flex items-center gap-2">
            <Building className="w-4 h-4 text-purple-400" />
            <span className="text-gray-300 text-sm">Affär kopplad</span>
          </div>
        )}
        {activity.outcome && (
          <div className="col-span-2">
            <p className="text-gray-300 text-sm">
              <span className="text-gray-400">Resultat:</span> {activity.outcome}
            </p>
          </div>
        )}
        {activity.next_action && (
          <div className="col-span-2">
            <p className="text-gray-300 text-sm">
              <span className="text-gray-400">Nästa steg:</span> {activity.next_action}
            </p>
          </div>
        )}
      </div>
    </GlassCard>
  )
}

const ActivitiesPage: React.FC = () => {
  const { user } = useAuth()
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'call' | 'email' | 'meeting' | 'note' | 'task'>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'timeline'>('grid')

  useEffect(() => {
    const loadActivitiesData = async () => {
      if (user) {
        try {
          setLoading(true)
          const activitiesData = await MockActivityService.getActivities(user.id)
          setActivities(activitiesData)
        } catch (error) {
          console.error('Fel vid laddning av aktiviteter:', error)
        } finally {
          setLoading(false)
        }
      }
    }
    
    loadActivitiesData()
  }, [user])

  const handleEdit = (activity: Activity) => {
    console.log('Redigera aktivitet:', activity)
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('Är du säker på att du vill ta bort denna aktivitet?')) {
      try {
        await MockActivityService.deleteActivity(id)
        setActivities(activities.filter(activity => activity.id !== id))
      } catch (error) {
        console.error('Fel vid borttagning av aktivitet:', error)
      }
    }
  }

  const filteredActivities = activities.filter(activity => {
    const matchesSearch = activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         activity.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === 'all' || activity.type === filterType
    
    return matchesSearch && matchesType
  })

  // Beräkna statistik
  const totalActivities = activities.length
  const thisWeekActivities = activities.filter(activity => {
    const activityDate = new Date(activity.date)
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
    return activityDate >= oneWeekAgo
  }).length

  const activityTypeStats = activities.reduce((acc, activity) => {
    acc[activity.type] = (acc[activity.type] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Aktiviteter</h1>
          <p className="text-gray-300">Håll koll på alla dina kundinteraktioner och aktiviteter</p>
        </div>
        <div className="flex items-center gap-3">
          <GlassButton
            variant="secondary"
            size="sm"
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Exportera
          </GlassButton>
          <GlassButton
            variant="secondary"
            size="sm"
            className="flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            Importera
          </GlassButton>
          <GlassButton size="sm" className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Ny aktivitet
          </GlassButton>
        </div>
      </div>

      {/* Statistik */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <GlassCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-300 text-sm">Totala aktiviteter</p>
              <p className="text-2xl font-bold text-white">{totalActivities}</p>
            </div>
            <div className="p-3 bg-blue-500/20 rounded-lg">
              <Calendar className="w-6 h-6 text-blue-400" />
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-300 text-sm">Denna vecka</p>
              <p className="text-2xl font-bold text-white">{thisWeekActivities}</p>
            </div>
            <div className="p-3 bg-green-500/20 rounded-lg">
              <Clock className="w-6 h-6 text-green-400" />
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-300 text-sm">Samtal</p>
              <p className="text-2xl font-bold text-white">{activityTypeStats.call || 0}</p>
            </div>
            <div className="p-3 bg-purple-500/20 rounded-lg">
              <Phone className="w-6 h-6 text-purple-400" />
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-300 text-sm">Möten</p>
              <p className="text-2xl font-bold text-white">{activityTypeStats.meeting || 0}</p>
            </div>
            <div className="p-3 bg-orange-500/20 rounded-lg">
              <Calendar className="w-6 h-6 text-orange-400" />
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Sök och filter */}
      <GlassCard className="p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Sök aktiviteter..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>
          
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as 'all' | 'call' | 'email' | 'meeting' | 'note' | 'task')}
            className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          >
            <option value="all">Alla typer</option>
            <option value="call">Samtal</option>
            <option value="email">E-post</option>
            <option value="meeting">Möten</option>
            <option value="note">Anteckningar</option>
            <option value="task">Uppgifter</option>
          </select>

          <div className="flex bg-white/10 border border-white/20 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                'px-3 py-1 rounded text-sm transition-colors',
                viewMode === 'grid' ? 'bg-white/20 text-white' : 'text-gray-400'
              )}
            >
              Rutnät
            </button>
            <button
              onClick={() => setViewMode('timeline')}
              className={cn(
                'px-3 py-1 rounded text-sm transition-colors',
                viewMode === 'timeline' ? 'bg-white/20 text-white' : 'text-gray-400'
              )}
            >
              Tidslinje
            </button>
          </div>
        </div>
      </GlassCard>

      {/* Resultat */}
      <div className="flex items-center justify-between">
        <p className="text-gray-300">
          Visar {filteredActivities.length} av {activities.length} aktiviteter
        </p>
      </div>

      {/* Aktivitetslista */}
      {filteredActivities.length === 0 ? (
        <GlassCard className="p-12 text-center">
          <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Inga aktiviteter hittades</h3>
          <p className="text-gray-300 mb-6">
            {searchTerm || filterType !== 'all'
              ? 'Försök att ändra dina sökkriterier eller filter.'
              : 'Kom igång genom att logga din första aktivitet.'}
          </p>
          <GlassButton className="flex items-center gap-2 mx-auto">
            <Plus className="w-4 h-4" />
            Skapa aktivitet
          </GlassButton>
        </GlassCard>
      ) : (
        <div className={cn(
          viewMode === 'grid' 
            ? 'grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6'
            : 'space-y-4'
        )}>
          {filteredActivities
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .map((activity) => (
              <ActivityCard
                key={activity.id}
                activity={activity}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
        </div>
      )}
    </div>
  )
}

export default ActivitiesPage
