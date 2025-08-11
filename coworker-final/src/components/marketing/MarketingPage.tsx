import React, { useState, useEffect } from 'react'
import {
  Mail,
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Send,
  Users,
  TrendingUp,
  Download,
  Upload,
  Eye,
  Star,
  MessageSquare
} from 'lucide-react'
import { GlassCard, GlassButton } from '../ui/glass'
import { formatDate } from '../../lib/utils'
import { useAuth } from '../../hooks/useAuth'

interface Campaign {
  id: string
  name: string
  type: 'email' | 'sms' | 'social'
  status: 'draft' | 'scheduled' | 'sent' | 'active'
  recipients: number
  sent_at?: string
  created_at: string
  open_rate?: number
  click_rate?: number
}

interface CampaignCardProps {
  campaign: Campaign
  onEdit: (campaign: Campaign) => void
  onDelete: (id: string) => void
}

const CampaignCard: React.FC<CampaignCardProps> = ({ campaign, onEdit, onDelete }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'text-gray-400 bg-gray-500/20'
      case 'scheduled':
        return 'text-blue-400 bg-blue-500/20'
      case 'sent':
        return 'text-green-400 bg-green-500/20'
      case 'active':
        return 'text-purple-400 bg-purple-500/20'
      default:
        return 'text-gray-400 bg-gray-500/20'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'email':
        return <Mail className="w-5 h-5" />
      case 'sms':
        return <MessageSquare className="w-5 h-5" />
      case 'social':
        return <Users className="w-5 h-5" />
      default:
        return <Mail className="w-5 h-5" />
    }
  }

  return (
    <GlassCard className="p-6 hover:bg-white/10 transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
            {getTypeIcon(campaign.type)}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">{campaign.name}</h3>
            <p className="text-gray-400 text-sm capitalize">{campaign.type} kampanj</p>
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
                  onEdit(campaign)
                  setIsMenuOpen(false)
                }}
                className="w-full px-4 py-2 text-left text-white hover:bg-white/10 flex items-center gap-2 first:rounded-t-lg"
              >
                <Edit className="w-4 h-4" />
                Redigera
              </button>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="w-full px-4 py-2 text-left text-white hover:bg-white/10 flex items-center gap-2"
              >
                <Eye className="w-4 h-4" />
                Visa rapport
              </button>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="w-full px-4 py-2 text-left text-white hover:bg-white/10 flex items-center gap-2"
              >
                <Star className="w-4 h-4" />
                Favorit
              </button>
              <button
                onClick={() => {
                  onDelete(campaign.id)
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

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-purple-400" />
          <span className="text-white text-sm">{campaign.recipients} mottagare</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(campaign.status)}`}>
            {campaign.status}
          </span>
        </div>
        {campaign.open_rate !== undefined && (
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-green-400" />
            <span className="text-white text-sm">{(campaign.open_rate * 100).toFixed(1)}% öppningar</span>
          </div>
        )}
        {campaign.click_rate !== undefined && (
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-400" />
            <span className="text-white text-sm">{(campaign.click_rate * 100).toFixed(1)}% klick</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-400">
          {campaign.sent_at ? `Skickad ${formatDate(campaign.sent_at)}` : `Skapad ${formatDate(campaign.created_at)}`}
        </span>
        {campaign.status === 'draft' && (
          <GlassButton size="sm" className="flex items-center gap-1">
            <Send className="w-3 h-3" />
            Skicka
          </GlassButton>
        )}
      </div>
    </GlassCard>
  )
}

const MarketingPage: React.FC = () => {
  const { user } = useAuth()
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'email' | 'sms' | 'social'>('all')
  const [filterStatus, setFilterStatus] = useState<'all' | 'draft' | 'scheduled' | 'sent' | 'active'>('all')

  useEffect(() => {
    if (user) {
      loadCampaigns()
    }
  }, [user])

  const loadCampaigns = async () => {
    try {
      setLoading(true)
      // Mock data för nu
      const mockCampaigns: Campaign[] = [
        {
          id: '1',
          name: 'Välkomstmail för nya kunder',
          type: 'email',
          status: 'sent',
          recipients: 150,
          sent_at: '2024-01-15',
          created_at: '2024-01-14',
          open_rate: 0.68,
          click_rate: 0.23
        },
        {
          id: '2',
          name: 'Månatligt nyhetsbrev',
          type: 'email',
          status: 'scheduled',
          recipients: 500,
          created_at: '2024-01-10'
        },
        {
          id: '3',
          name: 'SMS-påminnelse för möten',
          type: 'sms',
          status: 'active',
          recipients: 50,
          created_at: '2024-01-05'
        }
      ]
      setCampaigns(mockCampaigns)
    } catch (error) {
      console.error('Fel vid laddning av kampanjer:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (campaign: Campaign) => {
    console.log('Redigera kampanj:', campaign)
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('Är du säker på att du vill ta bort denna kampanj?')) {
      setCampaigns(campaigns.filter(campaign => campaign.id !== id))
    }
  }

  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = campaign.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === 'all' || campaign.type === filterType
    const matchesStatus = filterStatus === 'all' || campaign.status === filterStatus
    
    return matchesSearch && matchesType && matchesStatus
  })

  // Beräkna statistik
  const totalCampaigns = campaigns.length
  const sentCampaigns = campaigns.filter(c => c.status === 'sent').length
  const avgOpenRate = campaigns.filter(c => c.open_rate).reduce((sum, c) => sum + (c.open_rate || 0), 0) / 
                     campaigns.filter(c => c.open_rate).length || 0
  const totalRecipients = campaigns.reduce((sum, c) => sum + c.recipients, 0)

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
          <h1 className="text-3xl font-bold text-white mb-2">Marknadsföring</h1>
          <p className="text-gray-300">Hantera e-postkampanjer, SMS och sociala medier</p>
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
            Ny kampanj
          </GlassButton>
        </div>
      </div>

      {/* Statistik */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <GlassCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-300 text-sm">Totalt kampanjer</p>
              <p className="text-2xl font-bold text-white">{totalCampaigns}</p>
            </div>
            <div className="p-3 bg-blue-500/20 rounded-lg">
              <Mail className="w-6 h-6 text-blue-400" />
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-300 text-sm">Skickade kampanjer</p>
              <p className="text-2xl font-bold text-white">{sentCampaigns}</p>
            </div>
            <div className="p-3 bg-green-500/20 rounded-lg">
              <Send className="w-6 h-6 text-green-400" />
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-300 text-sm">Genomsnittlig öppningsgrad</p>
              <p className="text-2xl font-bold text-white">{(avgOpenRate * 100).toFixed(1)}%</p>
            </div>
            <div className="p-3 bg-purple-500/20 rounded-lg">
              <Eye className="w-6 h-6 text-purple-400" />
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-300 text-sm">Totalt mottagare</p>
              <p className="text-2xl font-bold text-white">{totalRecipients}</p>
            </div>
            <div className="p-3 bg-orange-500/20 rounded-lg">
              <Users className="w-6 h-6 text-orange-400" />
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
              placeholder="Sök kampanjer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>
          
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as 'all' | 'email' | 'sms' | 'social')}
            className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          >
            <option value="all">Alla typer</option>
            <option value="email">E-post</option>
            <option value="sms">SMS</option>
            <option value="social">Sociala medier</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as 'all' | 'draft' | 'scheduled' | 'sent' | 'active')}
            className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          >
            <option value="all">Alla status</option>
            <option value="draft">Utkast</option>
            <option value="scheduled">Schemalagd</option>
            <option value="sent">Skickad</option>
            <option value="active">Aktiv</option>
          </select>
        </div>
      </GlassCard>

      {/* Kampanjlista */}
      {filteredCampaigns.length === 0 ? (
        <GlassCard className="p-12 text-center">
          <Mail className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Inga kampanjer hittades</h3>
          <p className="text-gray-300 mb-6">
            {searchTerm || filterType !== 'all' || filterStatus !== 'all'
              ? 'Försök att ändra dina sökkriterier eller filter.'
              : 'Kom igång genom att skapa din första marknadsföringskampanj.'}
          </p>
          <GlassButton className="flex items-center gap-2 mx-auto">
            <Plus className="w-4 h-4" />
            Skapa kampanj
          </GlassButton>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredCampaigns.map((campaign) => (
            <CampaignCard
              key={campaign.id}
              campaign={campaign}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default MarketingPage
