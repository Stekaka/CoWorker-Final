import React, { useState, useEffect } from 'react'
import {
  TrendingUp,
  Plus,
  Search,
  DollarSign,
  Calendar,
  CheckCircle,
  Star,
  ChevronRight,
  Clock,
  Target,
  X,
  Edit
} from 'lucide-react'
import { GlassCard, GlassButton } from '../../ui/glass'
import { formatDate, formatCurrency, cn } from '../../../lib/utils'
import { useAuth } from '../../../hooks/useAuth'
import { useAppearance } from '../../../contexts/AppearanceContext'
import { MockDealService, MockContactService } from '../../../lib/database/mockServices'
import type { Deal, Contact } from '../../../types'

interface DealListItemProps {
  deal: Deal
  onClick: () => void
  isSelected: boolean
}

const DealListItem: React.FC<DealListItemProps> = ({ deal, onClick, isSelected }) => {
  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'prospect':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'qualified':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30'
      case 'proposal':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/30'
      case 'negotiation':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'won':
        return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'lost':
        return 'bg-red-500/20 text-red-400 border-red-500/30'
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const getStageText = (stage: string) => {
    switch (stage) {
      case 'prospect': return 'Prospekt'
      case 'qualified': return 'Kvalificerad'
      case 'proposal': return 'Offert'
      case 'negotiation': return 'Förhandling'
      case 'won': return 'Vunnen'
      case 'lost': return 'Förlorad'
      default: return stage
    }
  }

  return (
    <div
      onClick={onClick}
      className={cn(
        'p-5 border border-white/10 rounded-lg cursor-pointer transition-all duration-200 hover:bg-white/5 group',
        isSelected ? 'bg-green-500/10 border-green-400/30' : 'bg-white/[0.02]'
      )}
    >
      <div className="flex items-center gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-xl font-semibold text-white truncate">{deal.title}</h3>
            <div className={cn('px-3 py-1 text-sm rounded-full border', getStageColor(deal.stage))}>
              {getStageText(deal.stage)}
            </div>
          </div>
          
          <div className="flex items-center gap-6 text-sm text-gray-300 mb-3">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-green-400" />
              <span className="text-green-400 font-semibold text-lg">{formatCurrency(deal.amount)}</span>
            </div>
            {deal.probability && (
              <div className="flex items-center gap-1">
                <Target className="w-4 h-4 text-blue-400" />
                <span>{deal.probability}% sannolikhet</span>
              </div>
            )}
            {deal.expected_close_date && (
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4 text-purple-400" />
                <span>Förväntas {formatDate(deal.expected_close_date)}</span>
              </div>
            )}
          </div>
          
          {deal.description && (
            <p className="text-gray-400 text-sm line-clamp-2">{deal.description}</p>
          )}
        </div>

        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors flex-shrink-0" />
      </div>
    </div>
  )
}

interface DealDetailProps {
  deal: Deal
  onClose: () => void
  contact?: Contact
}

const DealDetail: React.FC<DealDetailProps> = ({ deal, onClose, contact }) => {
  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'prospect': return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'qualified': return 'bg-purple-500/20 text-purple-400 border-purple-500/30'
      case 'proposal': return 'bg-orange-500/20 text-orange-400 border-orange-500/30'
      case 'negotiation': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'won': return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'lost': return 'bg-red-500/20 text-red-400 border-red-500/30'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const getStageText = (stage: string) => {
    switch (stage) {
      case 'prospect': return 'Prospekt'
      case 'qualified': return 'Kvalificerad'
      case 'proposal': return 'Offert'
      case 'negotiation': return 'Förhandling'
      case 'won': return 'Vunnen'
      case 'lost': return 'Förlorad'
      default: return stage
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <GlassCard className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-white/10 bg-gradient-to-r from-green-500/10 to-blue-500/10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">{deal.title}</h2>
              <div className="flex items-center gap-4">
                <div className={cn('px-3 py-1 text-sm rounded-full border', getStageColor(deal.stage))}>
                  {getStageText(deal.stage)}
                </div>
                <span className="text-2xl font-bold text-green-400">{formatCurrency(deal.amount)}</span>
                {deal.probability && (
                  <span className="text-gray-300">{deal.probability}% sannolikhet</span>
                )}
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
              <h3 className="text-xl font-semibold text-white mb-4">Affärsdetaljer</h3>
              
              <div className="space-y-4">
                {deal.description && (
                  <div className="bg-white/5 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-400 mb-2">Beskrivning</h4>
                    <p className="text-white">{deal.description}</p>
                  </div>
                )}

                {contact && (
                  <div className="bg-white/5 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-400 mb-2">Kontakt</h4>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-semibold">
                        {contact.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-white font-medium">{contact.name}</p>
                        {contact.company && <p className="text-gray-400 text-sm">{contact.company}</p>}
                      </div>
                    </div>
                  </div>
                )}

                {deal.expected_close_date && (
                  <div className="bg-white/5 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-400 mb-2">Förväntad avslut</h4>
                    <p className="text-white">{formatDate(deal.expected_close_date)}</p>
                  </div>
                )}

                <div className="bg-white/5 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-400 mb-2">Skapad</h4>
                  <p className="text-white">{formatDate(deal.created_at)}</p>
                </div>
              </div>
            </div>

            {/* Höger kolumn */}
            <div>
              <h3 className="text-xl font-semibold text-white mb-4">Nästa steg</h3>
              
              <div className="space-y-4">
                <GlassButton className="w-full">
                  <Calendar className="w-4 h-4 mr-2" />
                  Boka möte
                </GlassButton>
                
                <GlassButton variant="secondary" className="w-full">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Skicka offert
                </GlassButton>
                
                <GlassButton variant="secondary" className="w-full">
                  <Clock className="w-4 h-4 mr-2" />
                  Schemalägg uppföljning
                </GlassButton>

                {/* Timeline/Progress */}
                <div className="mt-8">
                  <h4 className="text-sm font-medium text-gray-400 mb-4">Försäljningsprocess</h4>
                  <div className="space-y-3">
                    {['prospect', 'qualified', 'proposal', 'negotiation', 'won'].map((stage, index) => {
                      const isCompleted = ['prospect', 'qualified', 'proposal', 'negotiation', 'won'].indexOf(deal.stage) >= index
                      const isCurrent = deal.stage === stage
                      
                      return (
                        <div key={stage} className="flex items-center gap-3">
                          <div className={cn(
                            'w-4 h-4 rounded-full border-2',
                            isCompleted ? 'bg-green-500 border-green-500' :
                            isCurrent ? 'bg-blue-500 border-blue-500' :
                            'bg-transparent border-gray-500'
                          )} />
                          <span className={cn(
                            'text-sm',
                            isCompleted ? 'text-green-400' :
                            isCurrent ? 'text-blue-400' :
                            'text-gray-500'
                          )}>
                            {getStageText(stage)}
                          </span>
                        </div>
                      )
                    })}
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

const DealsPage: React.FC = () => {
  const { user } = useAuth()
  const { getCurrentTheme } = useAppearance()
  const isDark = getCurrentTheme() === 'dark'
  const [deals, setDeals] = useState<Deal[]>([])
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null)

  useEffect(() => {
    const loadDealsData = async () => {
      if (user) {
        try {
          setLoading(true)
          const [dealsData, contactsData] = await Promise.all([
            MockDealService.getDeals(user.id),
            MockContactService.getContacts(user.id)
          ])
          setDeals(dealsData)
          setContacts(contactsData)
        } catch (error) {
          console.error('Fel vid laddning av affärer:', error)
        } finally {
          setLoading(false)
        }
      }
    }
    
    loadDealsData()
  }, [user])

  const handleDealClick = (deal: Deal) => {
    setSelectedDeal(deal)
  }

  const filteredDeals = deals.filter(deal =>
    deal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    deal.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Enkla statistik för småföretag
  const totalValue = deals.reduce((sum, deal) => sum + deal.amount, 0)
  const wonDeals = deals.filter(deal => deal.stage === 'won')
  const wonValue = wonDeals.reduce((sum, deal) => sum + deal.amount, 0)
  const activeDeals = deals.filter(deal => !['won', 'lost'].includes(deal.stage))

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
          <h1 className={`text-4xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Affärer</h1>
          <p className={`text-xl ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Dina försäljningsmöjligheter - enkelt och tydligt</p>
        </div>
        <GlassButton size="lg" className="flex items-center gap-3">
          <Plus className="w-5 h-5" />
          Ny affär
        </GlassButton>
      </div>

      {/* Enkla statistik */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassCard className="p-6 bg-gradient-to-br from-green-500/10 to-green-600/10 border-green-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-300 text-sm font-medium">Vunna affärer</p>
              <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{formatCurrency(wonValue)}</p>
              <p className="text-green-400 text-sm">{wonDeals.length} st avslutade</p>
            </div>
            <div className="p-3 bg-green-500/20 rounded-lg">
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6 bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-blue-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-300 text-sm font-medium">Pågående affärer</p>
              <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{activeDeals.length}</p>
              <p className="text-blue-400 text-sm">{formatCurrency(activeDeals.reduce((sum, deal) => sum + deal.amount, 0))} i pipeline</p>
            </div>
            <div className="p-3 bg-blue-500/20 rounded-lg">
              <TrendingUp className="w-8 h-8 text-blue-400" />
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6 bg-gradient-to-br from-purple-500/10 to-purple-600/10 border-purple-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-300 text-sm font-medium">Totalt värde</p>
              <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{formatCurrency(totalValue)}</p>
              <p className="text-purple-400 text-sm">Alla affärer totalt</p>
            </div>
            <div className="p-3 bg-purple-500/20 rounded-lg">
              <DollarSign className="w-8 h-8 text-purple-400" />
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
            placeholder="Sök efter affär eller beskrivning..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-6 py-4 bg-white/10 border border-white/20 rounded-lg text-white text-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
          />
        </div>
        <p className="text-gray-400 text-sm mt-2">
          Visar {filteredDeals.length} av {deals.length} affärer
        </p>
      </GlassCard>

      {/* Affärslista */}
      {filteredDeals.length === 0 ? (
        <GlassCard className="p-12 text-center">
          <TrendingUp className="w-20 h-20 text-gray-400 mx-auto mb-6" />
          <h3 className="text-2xl font-semibold text-white mb-3">
            {searchTerm ? 'Inga affärer hittades' : 'Inga affärer än'}
          </h3>
          <p className="text-gray-300 text-lg mb-8">
            {searchTerm
              ? 'Försök med ett annat sökord eller skapa en ny affär.'
              : 'Kom igång genom att lägga till din första affär.'}
          </p>
          <GlassButton size="lg" className="flex items-center gap-3 mx-auto">
            <Plus className="w-5 h-5" />
            Skapa din första affär
          </GlassButton>
        </GlassCard>
      ) : (
        <GlassCard className="p-6">
          <div className="space-y-3">
            {filteredDeals.map((deal) => (
              <DealListItem
                key={deal.id}
                deal={deal}
                onClick={() => handleDealClick(deal)}
                isSelected={selectedDeal?.id === deal.id}
              />
            ))}
          </div>
        </GlassCard>
      )}

      {/* Detaljerat affärskort */}
      {selectedDeal && (
        <DealDetail
          deal={selectedDeal}
          onClose={() => setSelectedDeal(null)}
          contact={contacts.find(c => c.id === selectedDeal.contact_id)}
        />
      )}
    </div>
  )
}

export default DealsPage
