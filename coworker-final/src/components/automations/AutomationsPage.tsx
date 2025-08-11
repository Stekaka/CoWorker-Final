import React, { useState, useEffect } from 'react'
import {
  Zap,
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Play,
  Pause,
  Settings,
  Clock,
  Download,
  Upload,
  Eye,
  Star,
  ArrowRight
} from 'lucide-react'
import { GlassCard, GlassButton } from '../ui/glass'
import { formatDate } from '../../lib/utils'
import { useAuth } from '../../hooks/useAuth'

interface Automation {
  id: string
  name: string
  trigger: string
  description: string
  status: 'active' | 'inactive' | 'draft'
  execution_count: number
  last_executed?: string
  created_at: string
}

interface AutomationCardProps {
  automation: Automation
  onEdit: (automation: Automation) => void
  onDelete: (id: string) => void
  onToggleStatus: (id: string, status: 'active' | 'inactive') => void
}

const AutomationCard: React.FC<AutomationCardProps> = ({ 
  automation, 
  onEdit, 
  onDelete, 
  onToggleStatus 
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-400 bg-green-500/20'
      case 'inactive':
        return 'text-red-400 bg-red-500/20'
      case 'draft':
        return 'text-gray-400 bg-gray-500/20'
      default:
        return 'text-gray-400 bg-gray-500/20'
    }
  }

  return (
    <GlassCard className="p-6 hover:bg-white/10 transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-500/20 rounded-lg text-purple-400">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">{automation.name}</h3>
            <p className="text-gray-400 text-sm">{automation.trigger}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onToggleStatus(
              automation.id, 
              automation.status === 'active' ? 'inactive' : 'active'
            )}
            className={`p-2 rounded-lg transition-colors ${
              automation.status === 'active' 
                ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' 
                : 'bg-gray-500/20 text-gray-400 hover:bg-gray-500/30'
            }`}
          >
            {automation.status === 'active' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
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
                    onEdit(automation)
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
                  Visa logg
                </button>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="w-full px-4 py-2 text-left text-white hover:bg-white/10 flex items-center gap-2"
                >
                  <Settings className="w-4 h-4" />
                  Inställningar
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
                    onDelete(automation.id)
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
      </div>

      <p className="text-gray-300 text-sm mb-4">{automation.description}</p>

      <div className="flex items-center justify-between mb-4">
        <span className={`px-3 py-1 text-sm rounded-full ${getStatusColor(automation.status)}`}>
          {automation.status === 'active' ? 'Aktiv' : automation.status === 'inactive' ? 'Inaktiv' : 'Utkast'}
        </span>
        <div className="flex items-center gap-4 text-sm text-gray-400">
          <span>{automation.execution_count} körningar</span>
          {automation.last_executed && (
            <span>Senast: {formatDate(automation.last_executed)}</span>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>Skapad {formatDate(automation.created_at)}</span>
        <div className="flex items-center gap-1">
          <ArrowRight className="w-3 h-3" />
          <span>Automatisering</span>
        </div>
      </div>
    </GlassCard>
  )
}

const AutomationsPage: React.FC = () => {
  const { user } = useAuth()
  const [automations, setAutomations] = useState<Automation[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive' | 'draft'>('all')

  useEffect(() => {
    if (user) {
      loadAutomations()
    }
  }, [user])

  const loadAutomations = async () => {
    try {
      setLoading(true)
      // Mock data för nu
      const mockAutomations: Automation[] = [
        {
          id: '1',
          name: 'Välkomstsekvens för nya kontakter',
          trigger: 'När ny kontakt läggs till',
          description: 'Skickar automatiskt en välkomstmail och skapar en uppföljningsuppgift',
          status: 'active',
          execution_count: 45,
          last_executed: '2024-01-15',
          created_at: '2024-01-01'
        },
        {
          id: '2',
          name: 'Månadsrapport till teamet',
          trigger: 'Första dagen varje månad',
          description: 'Genererar och skickar en sammanfattning av månadens försäljning',
          status: 'active',
          execution_count: 12,
          last_executed: '2024-01-01',
          created_at: '2023-12-15'
        },
        {
          id: '3',
          name: 'Förlorade affärer uppföljning',
          trigger: 'När affär markeras som förlorad',
          description: 'Skapar uppföljningsuppgift för feedback från kund',
          status: 'draft',
          execution_count: 0,
          created_at: '2024-01-10'
        }
      ]
      setAutomations(mockAutomations)
    } catch (error) {
      console.error('Fel vid laddning av automationer:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (automation: Automation) => {
    console.log('Redigera automation:', automation)
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('Är du säker på att du vill ta bort denna automation?')) {
      setAutomations(automations.filter(automation => automation.id !== id))
    }
  }

  const handleToggleStatus = async (id: string, status: 'active' | 'inactive') => {
    setAutomations(automations.map(automation => 
      automation.id === id ? { ...automation, status } : automation
    ))
  }

  const filteredAutomations = automations.filter(automation => {
    const matchesSearch = automation.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         automation.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || automation.status === filterStatus
    
    return matchesSearch && matchesStatus
  })

  // Beräkna statistik
  const totalAutomations = automations.length
  const activeAutomations = automations.filter(a => a.status === 'active').length
  const totalExecutions = automations.reduce((sum, a) => sum + a.execution_count, 0)
  const avgExecutions = totalAutomations > 0 ? totalExecutions / totalAutomations : 0

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
          <h1 className="text-3xl font-bold text-white mb-2">Automationer</h1>
          <p className="text-gray-300">Automatisera återkommande uppgifter och arbetsflöden</p>
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
            Mallar
          </GlassButton>
          <GlassButton size="sm" className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Ny automation
          </GlassButton>
        </div>
      </div>

      {/* Statistik */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <GlassCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-300 text-sm">Totalt automationer</p>
              <p className="text-2xl font-bold text-white">{totalAutomations}</p>
            </div>
            <div className="p-3 bg-purple-500/20 rounded-lg">
              <Zap className="w-6 h-6 text-purple-400" />
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-300 text-sm">Aktiva automationer</p>
              <p className="text-2xl font-bold text-white">{activeAutomations}</p>
            </div>
            <div className="p-3 bg-green-500/20 rounded-lg">
              <Play className="w-6 h-6 text-green-400" />
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-300 text-sm">Totalt körningar</p>
              <p className="text-2xl font-bold text-white">{totalExecutions}</p>
            </div>
            <div className="p-3 bg-blue-500/20 rounded-lg">
              <Settings className="w-6 h-6 text-blue-400" />
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-300 text-sm">Snitt körningar</p>
              <p className="text-2xl font-bold text-white">{avgExecutions.toFixed(1)}</p>
            </div>
            <div className="p-3 bg-orange-500/20 rounded-lg">
              <Clock className="w-6 h-6 text-orange-400" />
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
              placeholder="Sök automationer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as 'all' | 'active' | 'inactive' | 'draft')}
            className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          >
            <option value="all">Alla status</option>
            <option value="active">Aktiva</option>
            <option value="inactive">Inaktiva</option>
            <option value="draft">Utkast</option>
          </select>
        </div>
      </GlassCard>

      {/* Automationslista */}
      {filteredAutomations.length === 0 ? (
        <GlassCard className="p-12 text-center">
          <Zap className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Inga automationer hittades</h3>
          <p className="text-gray-300 mb-6">
            {searchTerm || filterStatus !== 'all'
              ? 'Försök att ändra dina sökkriterier eller filter.'
              : 'Kom igång genom att skapa din första automation för att spara tid.'}
          </p>
          <GlassButton className="flex items-center gap-2 mx-auto">
            <Plus className="w-4 h-4" />
            Skapa automation
          </GlassButton>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredAutomations.map((automation) => (
            <AutomationCard
              key={automation.id}
              automation={automation}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggleStatus={handleToggleStatus}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default AutomationsPage
