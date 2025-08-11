'use client'

import React, { useState, useEffect } from 'react'
import {
  Users,
  Plus,
  Search,
  Phone,
  Mail,
  Building,
  MapPin,
  Calendar,
  MessageSquare,
  DollarSign,
  FileText,
  X,
  Edit,
  Star,
  Clock,
  ChevronRight
} from 'lucide-react'
import { GlassCard, GlassButton } from '../../ui/glass'
import { formatDate, formatCurrency, cn } from '../../../lib/utils'
import { useAuth } from '../../../hooks/useAuth'
import { useAppearance } from '../../../contexts/AppearanceContext'
import { MockContactService, MockDealService, MockActivityService } from '../../../lib/database/mockServices'
import type { Contact, Deal, Activity } from '../../../types'

interface ContactListItemProps {
  contact: Contact
  onClick: () => void
  isSelected: boolean
}

const ContactListItem: React.FC<ContactListItemProps> = ({ contact, onClick, isSelected }) => {
  const { getCurrentTheme } = useAppearance()
  const isDark = getCurrentTheme() === 'dark'
  
  return (
    <div
      onClick={onClick}
      className={cn(
        'p-4 border border-white/10 rounded-lg cursor-pointer transition-all duration-200 hover:bg-white/5 group',
        isSelected ? 'bg-blue-500/10 border-blue-400/30' : 'bg-white/[0.02]'
      )}
    >
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-semibold text-lg flex-shrink-0">
          {contact.name.charAt(0).toUpperCase()}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1">
            <h3 className={`text-lg font-medium truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>{contact.name}</h3>
            {contact.type === 'company' && <Building className="w-4 h-4 text-gray-500 flex-shrink-0" />}
            <div className={cn(
              'px-2 py-1 text-xs rounded-full flex-shrink-0',
              contact.status === 'active' ? 'bg-green-500/20 text-green-400' :
              contact.status === 'prospect' ? 'bg-yellow-500/20 text-yellow-400' :
              'bg-gray-500/20 text-gray-400'
            )}>
              {contact.status === 'active' ? 'Aktiv' : 
               contact.status === 'prospect' ? 'Prospekt' : 'Inaktiv'}
            </div>
          </div>
          
          <div className="flex items-center gap-6 text-sm text-gray-500">
            {contact.company && (
              <div className="flex items-center gap-1">
                <Building className="w-4 h-4 text-gray-400" />
                <span className="truncate">{contact.company}</span>
              </div>
            )}
            {contact.email && (
              <div className="flex items-center gap-1">
                <Mail className="w-4 h-4 text-gray-400" />
                <span className="truncate">{contact.email}</span>
              </div>
            )}
            {contact.phone && (
              <div className="flex items-center gap-1">
                <Phone className="w-4 h-4 text-gray-400" />
                <span>{contact.phone}</span>
              </div>
            )}
          </div>
        </div>

        <ChevronRight className={`w-5 h-5 text-gray-400 transition-colors flex-shrink-0 ${isDark ? 'group-hover:text-white' : 'group-hover:text-gray-700'}`} />
      </div>
    </div>
  )
}

interface ContactDetailProps {
  contact: Contact
  onClose: () => void
  deals: Deal[]
  activities: Activity[]
}

const ContactDetail: React.FC<ContactDetailProps> = ({ contact, onClose, deals, activities }) => {
  const { getCurrentTheme } = useAppearance()
  const isDark = getCurrentTheme() === 'dark'

  const totalDealsValue = deals.reduce((sum, deal) => sum + deal.amount, 0)
  const wonDeals = deals.filter(deal => deal.stage === 'won')
  const wonValue = wonDeals.reduce((sum, deal) => sum + deal.amount, 0)
  const recentActivities = activities.slice(0, 5)

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <GlassCard className="w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-blue-500/10 to-indigo-500/10">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold text-3xl">
              {contact.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{contact.name}</h2>
              <div className={`flex items-center gap-3 mt-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                {contact.position && <span className="text-lg">{contact.position}</span>}
                {contact.company && contact.position && <span>•</span>}
                {contact.company && <span className="text-lg">{contact.company}</span>}
              </div>
              <div className={cn(
                'inline-flex px-3 py-1 text-sm rounded-full mt-2',
                contact.status === 'active' ? 'bg-green-500/20 text-green-400' :
                contact.status === 'prospect' ? 'bg-yellow-500/20 text-yellow-400' :
                'bg-gray-500/20 text-gray-400'
              )}>
                {contact.status === 'active' ? 'Aktiv kund' : 
                 contact.status === 'prospect' ? 'Prospekt' : 'Inaktiv'}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <GlassButton size="sm" variant="secondary">
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

        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 140px)' }}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Vänster kolumn */}
            <div>
              <h3 className={`text-xl font-semibold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                <FileText className="w-5 h-5" />
                Kontaktinformation
              </h3>
              
              <div className="space-y-4">
                {contact.email && (
                  <div className="bg-white/5 p-4 rounded-lg">
                    <div className="flex items-start gap-3">
                      <Mail className="w-5 h-5 text-blue-400 mt-1" />
                      <div>
                        <h4 className="text-sm font-medium text-gray-400 mb-1">E-post</h4>
                        <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{contact.email}</p>
                      </div>
                    </div>
                  </div>
                )}

                {contact.phone && (
                  <div className="bg-white/5 p-4 rounded-lg">
                    <div className="flex items-start gap-3">
                      <Phone className="w-5 h-5 text-green-400 mt-1" />
                      <div>
                        <h4 className="text-sm font-medium text-gray-400 mb-1">Telefon</h4>
                        <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{contact.phone}</p>
                      </div>
                    </div>
                  </div>
                )}

                {contact.address && (
                  <div className="bg-white/5 p-4 rounded-lg">
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-red-400 mt-1" />
                      <div>
                        <h4 className="text-sm font-medium text-gray-400 mb-1">Adress</h4>
                        <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{contact.address}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="bg-white/5 p-4 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-purple-400 mt-1" />
                    <div>
                      <h4 className="text-sm font-medium text-gray-400 mb-1">Skapad</h4>
                      <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{formatDate(contact.created_at)}</p>
                    </div>
                  </div>
                </div>

                {contact.source && (
                  <div className="bg-white/5 p-4 rounded-lg">
                    <div className="flex items-start gap-3">
                      <Star className="w-5 h-5 text-yellow-400 mt-1" />
                      <div>
                        <h4 className="text-sm font-medium text-gray-400 mb-1">Källa</h4>
                        <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{contact.source}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <h4 className={`text-lg font-semibold mb-4 flex items-center gap-2 mt-8 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                <DollarSign className="w-5 h-5" />
                Affärsstatistik
              </h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 p-4 rounded-lg border border-blue-500/20">
                  <p className="text-blue-300 text-sm font-medium">Totalt värde</p>
                  <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{formatCurrency(totalDealsValue)}</p>
                </div>
                <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 p-4 rounded-lg border border-green-500/20">
                  <p className="text-green-300 text-sm font-medium">Antal affärer</p>
                  <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{deals.length}</p>
                </div>
                <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/10 p-4 rounded-lg border border-emerald-500/20">
                  <p className="text-emerald-300 text-sm font-medium">Vunnet värde</p>
                  <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{formatCurrency(wonValue)}</p>
                </div>
                <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 p-4 rounded-lg border border-purple-500/20">
                  <p className="text-purple-300 text-sm font-medium">Aktiviteter</p>
                  <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{activities.length}</p>
                </div>
              </div>

              {recentActivities.length > 0 && (
                <div className="mt-8">
                  <h4 className={`text-lg font-semibold mb-3 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    <Clock className="w-5 h-5" />
                    Senaste aktiviteter
                  </h4>
                  <div className="space-y-3">
                    {recentActivities.map((activity) => (
                      <div key={activity.id} className="bg-white/5 p-4 rounded-lg">
                        <div className="flex items-start gap-3">
                          <div className={cn(
                            'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1',
                            activity.type === 'call' ? 'bg-green-500/20' :
                            activity.type === 'email' ? 'bg-blue-500/20' :
                            activity.type === 'meeting' ? 'bg-purple-500/20' :
                            'bg-gray-500/20'
                          )}>
                            {activity.type === 'call' && <Phone className="w-4 h-4 text-green-400" />}
                            {activity.type === 'email' && <Mail className="w-4 h-4 text-blue-400" />}
                            {activity.type === 'meeting' && <Calendar className="w-4 h-4 text-purple-400" />}
                            {activity.type === 'note' && <FileText className="w-4 h-4 text-gray-400" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{activity.title}</h4>
                            <p className="text-gray-400 text-sm mt-1">{formatDate(activity.created_at)}</p>
                            {activity.description && (
                              <p className={`text-sm mt-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{activity.description}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Höger kolumn */}
            <div>
              <div className="sticky top-0">
                <h3 className={`text-xl font-semibold flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  <DollarSign className="w-5 h-5" />
                  Affärer ({deals.length})
                </h3>
                
                {deals.length === 0 ? (
                  <div className="bg-white/5 p-8 rounded-lg text-center mt-6">
                    <DollarSign className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h4 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Inga affärer än</h4>
                    <p className="text-gray-400 mb-6">
                      Denna kund har inga affärer registrerade.
                    </p>
                    <GlassButton>
                      <Plus className="w-4 h-4 mr-2" />
                      Skapa affär
                    </GlassButton>
                  </div>
                ) : (
                  <div className="space-y-4 mt-6">
                    {deals.map((deal) => (
                      <div key={deal.id} className="bg-white/5 p-6 rounded-lg hover:bg-white/10 transition-colors">
                        <div className="flex items-start justify-between mb-4">
                          <h4 className={`font-semibold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>{deal.title}</h4>
                          <div className={cn(
                            'px-3 py-1 text-sm rounded-full font-medium',
                            deal.stage === 'prospect' ? 'bg-yellow-500/20 text-yellow-400' :
                            deal.stage === 'qualified' ? 'bg-blue-500/20 text-blue-400' :
                            deal.stage === 'proposal' ? 'bg-purple-500/20 text-purple-400' :
                            deal.stage === 'negotiation' ? 'bg-orange-500/20 text-orange-400' :
                            deal.stage === 'won' ? 'bg-green-500/20 text-green-400' :
                            'bg-red-500/20 text-red-400'
                          )}>
                            {deal.stage === 'prospect' ? 'Prospekt' :
                             deal.stage === 'qualified' ? 'Kvalificerad' :
                             deal.stage === 'proposal' ? 'Förslag' :
                             deal.stage === 'negotiation' ? 'Förhandling' :
                             deal.stage === 'won' ? 'Vunnen' : 'Förlorad'}
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-400">Värde:</span>
                          <span className={`font-semibold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>{formatCurrency(deal.amount)}</span>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm mt-2">
                          <span className="text-gray-400">Skapad:</span>
                          <span className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{formatDate(deal.created_at)}</span>
                        </div>
                        
                        {deal.description && (
                          <p className={`text-sm mt-3 p-3 bg-white/5 rounded ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                            {deal.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </GlassCard>
    </div>
  )
}

const ContactsPage: React.FC = () => {
  const { user } = useAuth()
  const { getCurrentTheme } = useAppearance()
  const isDark = getCurrentTheme() === 'dark'
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [contactDeals, setContactDeals] = useState<Deal[]>([])
  const [contactActivities, setContactActivities] = useState<Activity[]>([])

  useEffect(() => {
    const loadContactsData = async () => {
      if (user) {
        try {
          setLoading(true)
          const contactsList = await MockContactService.getContacts(user.id)
          setContacts(contactsList)
        } catch (error) {
          console.error('Fel vid laddning av kontakter:', error)
        } finally {
          setLoading(false)
        }
      }
    }
    
    loadContactsData()
  }, [user])

  const handleContactClick = async (contact: Contact) => {
    setSelectedContact(contact)
    
    // Ladda kontaktens affärer och aktiviteter
    try {
      const [deals, activities] = await Promise.all([
        MockDealService.getDeals(user!.id),
        MockActivityService.getActivities(user!.id)
      ])
      
      setContactDeals(deals.filter(deal => deal.contact_id === contact.id))
      setContactActivities(activities.filter(activity => activity.contact_id === contact.id))
    } catch (error) {
      console.error('Fel vid laddning av kontaktdata:', error)
    }
  }

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.company?.toLowerCase().includes(searchTerm.toLowerCase())
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
          <h1 className={`text-4xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Kundregister</h1>
          <p className={`text-xl ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Dina kunder på ett ställe - enkelt och överskådligt</p>
        </div>
        <GlassButton size="lg" className="flex items-center gap-3">
          <Plus className="w-5 h-5" />
          Lägg till kund
        </GlassButton>
      </div>

      {/* Enkla statistik */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassCard className="p-6 bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-blue-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-300 text-sm font-medium">Totala kunder</p>
              <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{contacts.length}</p>
            </div>
            <div className="p-3 bg-blue-500/20 rounded-lg">
              <Users className="w-8 h-8 text-blue-400" />
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6 bg-gradient-to-br from-green-500/10 to-green-600/10 border-green-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-300 text-sm font-medium">Aktiva kunder</p>
              <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {contacts.filter(c => c.status === 'active').length}
              </p>
            </div>
            <div className="p-3 bg-green-500/20 rounded-lg">
              <Star className="w-8 h-8 text-green-400" />
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6 bg-gradient-to-br from-yellow-500/10 to-yellow-600/10 border-yellow-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-300 text-sm font-medium">Nya prospekt</p>
              <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {contacts.filter(c => c.status === 'prospect').length}
              </p>
            </div>
            <div className="p-3 bg-yellow-500/20 rounded-lg">
              <Users className="w-8 h-8 text-yellow-400" />
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Enkel sökning */}
      <GlassCard className="p-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
          <input
            type="text"
            placeholder="Sök efter kund, företag eller e-post..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pl-12 pr-6 py-4 bg-white/10 border border-white/20 rounded-lg text-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 ${isDark ? 'text-white' : 'text-gray-900'}`}
          />
        </div>
        <p className="text-gray-400 text-sm mt-2">
          Visar {filteredContacts.length} av {contacts.length} kunder
        </p>
      </GlassCard>

      {/* Kundlista */}
      {filteredContacts.length === 0 ? (
        <GlassCard className="p-12 text-center">
          <Users className="w-20 h-20 text-gray-400 mx-auto mb-6" />
          <h3 className={`text-2xl font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {searchTerm ? 'Inga kunder hittades' : 'Inga kunder än'}
          </h3>
          <p className={`text-lg mb-8 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            {searchTerm
              ? 'Försök med ett annat sökord eller lägg till en ny kund.'
              : 'Kom igång genom att lägga till din första kund.'}
          </p>
          <GlassButton size="lg" className="flex items-center gap-3 mx-auto">
            <Plus className="w-5 h-5" />
            Lägg till din första kund
          </GlassButton>
        </GlassCard>
      ) : (
        <GlassCard className="p-6">
          <div className="space-y-2">
            {filteredContacts.map((contact) => (
              <ContactListItem
                key={contact.id}
                contact={contact}
                onClick={() => handleContactClick(contact)}
                isSelected={selectedContact?.id === contact.id}
              />
            ))}
          </div>
        </GlassCard>
      )}

      {/* Detaljerat kundkort */}
      {selectedContact && (
        <ContactDetail
          contact={selectedContact}
          onClose={() => setSelectedContact(null)}
          deals={contactDeals}
          activities={contactActivities}
        />
      )}
    </div>
  )
}

export default ContactsPage
