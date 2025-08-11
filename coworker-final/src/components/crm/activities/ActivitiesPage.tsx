'use client'

import React, { useState, useEffect } from 'react'
import {
  Calendar,
  Plus,
  Search,
  Phone,
  Mail,
  MessageSquare,
  FileText,
  CheckCircle,
  Clock,
  User,
  Building,
  ChevronRight,
  X,
  Edit,
  Star
} from 'lucide-react'
import { GlassCard, GlassButton } from '../../ui/glass'
import { formatDate, cn } from '../../../lib/utils'
import { useAuth } from '../../../hooks/useAuth'
import { useAppearance } from '../../../contexts/AppearanceContext'
import { MockActivityService, MockContactService } from '../../../lib/database/mockServices'
import type { Activity, Contact } from '../../../types'

interface ActivityListItemProps {
  activity: Activity
  onClick: () => void
  contact?: Contact
  isSelected: boolean
}

const ActivityListItem: React.FC<ActivityListItemProps> = ({ activity, onClick, contact, isSelected }) => {
  const { getCurrentTheme } = useAppearance()
  const isDark = getCurrentTheme() === 'dark'
  
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'call':
        return <Phone className="w-5 h-5 text-green-400" />
      case 'email':
        return <Mail className="w-5 h-5 text-blue-400" />
      case 'meeting':
        return <Calendar className="w-5 h-5 text-purple-400" />
      case 'note':
        return <FileText className="w-5 h-5 text-yellow-400" />
      case 'task':
        return <CheckCircle className="w-5 h-5 text-orange-400" />
      default:
        return <MessageSquare className="w-5 h-5 text-gray-400" />
    }
  }

  const getActivityLabel = (type: string) => {
    switch (type) {
      case 'call': return 'Samtal'
      case 'email': return 'E-post'
      case 'meeting': return 'Möte'
      case 'note': return 'Anteckning'
      case 'task': return 'Uppgift'
      default: return type
    }
  }

  return (
    <div
      className={cn(
        'p-5 border border-white/10 rounded-lg transition-all duration-200 group cursor-pointer',
        isSelected ? 'bg-blue-500/10 border-blue-400/30' : 'bg-white/[0.02] hover:bg-white/[0.05]'
      )}
      onClick={onClick}
    >
      <div className="flex items-start gap-4">
        <div className="p-2 bg-white/10 rounded-lg flex-shrink-0">
          {getActivityIcon(activity.type)}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <h3 className={`text-lg font-medium truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {activity.title}
            </h3>
            <span className="px-2 py-1 text-xs rounded-full bg-gray-500/20 text-gray-300 flex-shrink-0">
              {getActivityLabel(activity.type)}
            </span>
          </div>
          
          <div className="flex items-center gap-6 text-sm text-gray-300 mb-2">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4 text-blue-400" />
              <span>{formatDate(activity.date)}</span>
            </div>
            {contact && (
              <div className="flex items-center gap-1">
                <User className="w-4 h-4 text-green-400" />
                <span className="truncate">{contact.name}</span>
              </div>
            )}
            {contact?.company && (
              <div className="flex items-center gap-1">
                <Building className="w-4 h-4 text-purple-400" />
                <span className="truncate">{contact.company}</span>
              </div>
            )}
          </div>
          
          {activity.description && (
            <p className="text-gray-400 text-sm truncate max-w-2xl">{activity.description}</p>
          )}
        </div>

        <ChevronRight className={`w-5 h-5 text-gray-400 transition-colors flex-shrink-0 ${isDark ? 'group-hover:text-white' : 'group-hover:text-gray-700'}`} />
      </div>
    </div>
  )
}

interface ActivityDetailProps {
  activity: Activity
  onClose: () => void
  contact?: Contact
}

const ActivityDetail: React.FC<ActivityDetailProps> = ({ activity, onClose, contact }) => {
  const { getCurrentTheme } = useAppearance()
  const isDark = getCurrentTheme() === 'dark'
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'call':
        return <Phone className="w-6 h-6 text-green-400" />
      case 'email':
        return <Mail className="w-6 h-6 text-blue-400" />
      case 'meeting':
        return <Calendar className="w-6 h-6 text-purple-400" />
      case 'note':
        return <FileText className="w-6 h-6 text-yellow-400" />
      case 'task':
        return <CheckCircle className="w-6 h-6 text-orange-400" />
      default:
        return <MessageSquare className="w-6 h-6 text-gray-400" />
    }
  }

  const getActivityLabel = (type: string) => {
    switch (type) {
      case 'call': return 'Samtal'
      case 'email': return 'E-post'
      case 'meeting': return 'Möte'
      case 'note': return 'Anteckning'
      case 'task': return 'Uppgift'
      default: return type
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <GlassCard className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-white/10 bg-gradient-to-r from-blue-500/10 to-purple-500/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/10 rounded-lg">
                {getActivityIcon(activity.type)}
              </div>
              <div>
                <h2 className={`text-3xl font-bold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>{activity.title}</h2>
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 text-sm rounded-full bg-gray-500/20 text-gray-300">
                    {getActivityLabel(activity.type)}
                  </span>
                  <span className="text-gray-300">{formatDate(activity.date)}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <GlassButton variant="secondary" size="sm">
                <Star className="w-4 h-4 mr-2" />
                Favorit
              </GlassButton>
              <GlassButton variant="secondary" size="sm">
                <Edit className="w-4 h-4 mr-2" />
                Redigera
              </GlassButton>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-400" />
              </button>
            </div>
          </div>
        </div>

        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 140px)' }}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Vänster kolumn */}
            <div>
              <h3 className={`text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Aktivitetsdetaljer</h3>
              
              <div className="space-y-4">
                {activity.description && (
                  <div className="bg-white/5 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-400 mb-2">Beskrivning</h4>
                    <p className={`leading-relaxed ${isDark ? 'text-white' : 'text-gray-800'}`}>{activity.description}</p>
                  </div>
                )}

                {contact && (
                  <div className="bg-white/5 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-400 mb-2">Relaterad kontakt</h4>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-semibold text-lg">
                        {contact.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className={`font-medium text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>{contact.name}</p>
                        {contact.company && <p className="text-gray-400">{contact.company}</p>}
                        {contact.email && (
                          <div className="flex items-center gap-1 mt-1">
                            <Mail className="w-4 h-4 text-blue-400" />
                            <span className="text-sm text-blue-400">{contact.email}</span>
                          </div>
                        )}
                        {contact.phone && (
                          <div className="flex items-center gap-1 mt-1">
                            <Phone className="w-4 h-4 text-green-400" />
                            <span className="text-sm text-green-400">{contact.phone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <div className="bg-white/5 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-400 mb-2">Datum och tid</h4>
                  <p className={`text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>{formatDate(activity.date, 'long')}</p>
                </div>

                {activity.duration_minutes && (
                  <div className="bg-white/5 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-400 mb-2">Varaktighet</h4>
                    <p className={`${isDark ? 'text-white' : 'text-gray-900'}`}>{activity.duration_minutes} minuter</p>
                  </div>
                )}
              </div>
            </div>

            {/* Höger kolumn */}
            <div>
              <h3 className={`text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Åtgärder</h3>
              
              <div className="space-y-4">
                <GlassButton className="w-full" variant="primary">
                  <Plus className="w-4 h-4 mr-2" />
                  Skapa uppföljning
                </GlassButton>
                
                <GlassButton variant="secondary" className="w-full">
                  <Calendar className="w-4 h-4 mr-2" />
                  Boka nytt möte
                </GlassButton>
                
                <GlassButton variant="secondary" className="w-full">
                  <Mail className="w-4 h-4 mr-2" />
                  Skicka e-post
                </GlassButton>

                <GlassButton variant="secondary" className="w-full">
                  <Phone className="w-4 h-4 mr-2" />
                  Ring upp
                </GlassButton>

                {/* Aktivitetsinfo */}
                <div className="mt-8 p-4 bg-white/5 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-400 mb-3">Information</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Typ</span>
                      <span className={`${isDark ? 'text-white' : 'text-gray-900'}`}>{getActivityLabel(activity.type)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Skapad</span>
                      <span className={`${isDark ? 'text-white' : 'text-gray-900'}`}>{formatDate(activity.created_at)}</span>
                    </div>
                    {activity.outcome && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300">Resultat</span>
                        <span className={`${isDark ? 'text-white' : 'text-gray-900'}`}>{activity.outcome}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </GlassCard>
    </div>
  )
}

const ActivitiesPage: React.FC = () => {
  const { user } = useAuth()
  const { getCurrentTheme } = useAppearance()
  const isDark = getCurrentTheme() === 'dark'
  const [activities, setActivities] = useState<Activity[]>([])
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'call' | 'email' | 'meeting' | 'note' | 'task'>('all')
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null)

  useEffect(() => {
    const loadActivitiesData = async () => {
      if (user) {
        try {
          setLoading(true)
          const [activitiesData, contactsData] = await Promise.all([
            MockActivityService.getActivities(user.id),
            MockContactService.getContacts(user.id)
          ])
          setActivities(activitiesData)
          setContacts(contactsData)
        } catch (error) {
          console.error('Fel vid laddning av aktiviteter:', error)
        } finally {
          setLoading(false)
        }
      }
    }
    
    loadActivitiesData()
  }, [user])

  const handleActivityClick = (activity: Activity) => {
    setSelectedActivity(activity)
  }

  const filteredActivities = activities.filter(activity => {
    const matchesSearch = activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         activity.description?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesFilter = filterType === 'all' || activity.type === filterType
    
    return matchesSearch && matchesFilter
  })

  // Enkla statistik för småföretag
  const todayActivities = activities.filter(activity => {
    const today = new Date()
    const activityDate = new Date(activity.date)
    return activityDate.toDateString() === today.toDateString()
  })

  const thisWeekActivities = activities.filter(activity => {
    const now = new Date()
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const activityDate = new Date(activity.date)
    return activityDate >= weekAgo && activityDate <= now
  })

  const callsThisWeek = activities.filter(activity => 
    activity.type === 'call' && thisWeekActivities.includes(activity)
  )

  const meetingsThisWeek = activities.filter(activity => 
    activity.type === 'meeting' && thisWeekActivities.includes(activity)
  )

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
          <h1 className={`text-4xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Aktiviteter</h1>
          <p className={`text-xl ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>All din kommunikation och interaktioner - enkelt och överskådligt</p>
        </div>
        <GlassButton size="lg" className="flex items-center gap-3">
          <Plus className="w-5 h-5" />
          Ny aktivitet
        </GlassButton>
      </div>

      {/* Enkla statistik */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <GlassCard className="p-6 bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-blue-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-300 text-sm font-medium">Idag</p>
              <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{todayActivities.length}</p>
              <p className="text-blue-400 text-sm">Aktiviteter idag</p>
            </div>
            <div className="p-3 bg-blue-500/20 rounded-lg">
              <Calendar className="w-8 h-8 text-blue-400" />
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6 bg-gradient-to-br from-green-500/10 to-green-600/10 border-green-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-300 text-sm font-medium">Samtal</p>
              <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{callsThisWeek.length}</p>
              <p className="text-green-400 text-sm">Denna vecka</p>
            </div>
            <div className="p-3 bg-green-500/20 rounded-lg">
              <Phone className="w-8 h-8 text-green-400" />
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6 bg-gradient-to-br from-purple-500/10 to-purple-600/10 border-purple-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-300 text-sm font-medium">Möten</p>
              <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{meetingsThisWeek.length}</p>
              <p className="text-purple-400 text-sm">Denna vecka</p>
            </div>
            <div className="p-3 bg-purple-500/20 rounded-lg">
              <Calendar className="w-8 h-8 text-purple-400" />
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6 bg-gradient-to-br from-orange-500/10 to-orange-600/10 border-orange-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-300 text-sm font-medium">Totalt</p>
              <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{activities.length}</p>
              <p className="text-orange-400 text-sm">Alla aktiviteter</p>
            </div>
            <div className="p-3 bg-orange-500/20 rounded-lg">
              <MessageSquare className="w-8 h-8 text-orange-400" />
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Enkel sökning och filter */}
      <GlassCard className="p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
            <input
              type="text"
              placeholder="Sök efter aktivitet..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-12 pr-6 py-4 bg-white/10 border border-white/20 rounded-lg text-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 ${isDark ? 'text-white' : 'text-gray-900'}`}
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as 'all' | 'call' | 'email' | 'meeting' | 'note' | 'task')}
            className={`px-4 py-4 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${isDark ? 'text-white' : 'text-gray-900'}`}
          >
            <option value="all">Alla typer</option>
            <option value="call">Samtal</option>
            <option value="email">E-post</option>
            <option value="meeting">Möten</option>
            <option value="note">Anteckningar</option>
            <option value="task">Uppgifter</option>
          </select>
        </div>
        <p className="text-gray-400 text-sm mt-2">
          Visar {filteredActivities.length} av {activities.length} aktiviteter
        </p>
      </GlassCard>

      {/* Aktivitetslista */}
      {filteredActivities.length === 0 ? (
        <GlassCard className="p-12 text-center">
          <Calendar className="w-20 h-20 text-gray-400 mx-auto mb-6" />
          <h3 className={`text-2xl font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {searchTerm ? 'Inga aktiviteter hittades' : 'Inga aktiviteter än'}
          </h3>
          <p className="text-gray-300 text-lg mb-8">
            {searchTerm
              ? 'Försök med ett annat sökord eller logga en ny aktivitet.'
              : 'Kom igång genom att logga din första aktivitet.'}
          </p>
          <GlassButton size="lg" className="flex items-center gap-3 mx-auto">
            <Plus className="w-5 h-5" />
            Logga din första aktivitet
          </GlassButton>
        </GlassCard>
      ) : (
        <GlassCard className="p-6">
          <div className="space-y-3">
            {filteredActivities
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .map((activity) => (
                <ActivityListItem
                  key={activity.id}
                  activity={activity}
                  onClick={() => handleActivityClick(activity)}
                  contact={contacts.find(c => c.id === activity.contact_id)}
                  isSelected={selectedActivity?.id === activity.id}
                />
              ))}
          </div>
        </GlassCard>
      )}

      {/* Detaljerat aktivitetskort */}
      {selectedActivity && (
        <ActivityDetail
          activity={selectedActivity}
          onClose={() => setSelectedActivity(null)}
          contact={contacts.find(c => c.id === selectedActivity.contact_id)}
        />
      )}
    </div>
  )
}

export default ActivitiesPage
