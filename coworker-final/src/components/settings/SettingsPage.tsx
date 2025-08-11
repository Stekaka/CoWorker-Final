import React, { useState } from 'react'
import {
  User,
  Building,
  CreditCard,
  Bell,
  Shield,
  Database,
  Palette,
  Globe,
  Save,
  Eye,
  EyeOff
} from 'lucide-react'
import { GlassCard, GlassButton } from '../ui/glass'
import { useAuth } from '../../hooks/useAuth'
import { useAppearance } from '../../contexts/AppearanceContext'
import { cn } from '../../lib/utils'

interface SettingsTabProps {
  activeTab: string
  setActiveTab: (tab: string) => void
}

const SettingsTabs: React.FC<SettingsTabProps> = ({ activeTab, setActiveTab }) => {
  const { getCurrentTheme } = useAppearance()
  const isDark = getCurrentTheme() === 'dark'
  
  const tabs = [
    { id: 'profile', label: 'Profil', icon: User },
    { id: 'company', label: 'Företag', icon: Building },
    { id: 'billing', label: 'Fakturering', icon: CreditCard },
    { id: 'notifications', label: 'Notifikationer', icon: Bell },
    { id: 'security', label: 'Säkerhet', icon: Shield },
    { id: 'integrations', label: 'Integrationer', icon: Database },
    { id: 'appearance', label: 'Utseende', icon: Palette },
    { id: 'general', label: 'Allmänt', icon: Globe }
  ]

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {tabs.map((tab) => {
        const Icon = tab.icon
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              activeTab === tab.id
                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                : isDark ? 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white' : 'bg-black/5 text-gray-600 hover:bg-black/10 hover:text-gray-900'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        )
      })}
    </div>
  )
}

const ProfileSettings: React.FC = () => {
  const { user } = useAuth()
  const { getCurrentTheme } = useAppearance()
  const isDark = getCurrentTheme() === 'dark'
  const [formData, setFormData] = useState({
    fullName: '',
    email: user?.email || '',
    phone: '',
    bio: '',
    avatarUrl: ''
  })

  return (
    <GlassCard className="p-6">
      <h3 className={`text-xl font-semibold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>Profilinställningar</h3>
      
      <div className="space-y-6">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
            {formData.fullName ? formData.fullName.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <GlassButton size="sm" className="mb-2">Ladda upp bild</GlassButton>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>JPG, PNG upp till 5MB</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Fullständigt namn</label>
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              className={`w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${isDark ? 'text-white' : 'text-gray-900'}`}
            />
          </div>
          
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>E-post</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className={`w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${isDark ? 'text-white' : 'text-gray-900'}`}
            />
          </div>
          
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Telefon</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className={`w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${isDark ? 'text-white' : 'text-gray-900'}`}
            />
          </div>
        </div>

        <div>
          <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Biografi</label>
          <textarea
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            rows={4}
            className={`w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${isDark ? 'text-white' : 'text-gray-900'}`}
            placeholder="Berätta lite om dig själv..."
          />
        </div>

        <div className="flex justify-end">
          <GlassButton className="flex items-center gap-2">
            <Save className="w-4 h-4" />
            Spara ändringar
          </GlassButton>
        </div>
      </div>
    </GlassCard>
  )
}

const SecuritySettings: React.FC = () => {
  const { getCurrentTheme } = useAppearance()
  const isDark = getCurrentTheme() === 'dark'
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  })

  return (
    <GlassCard className="p-6">
      <h3 className={`text-xl font-semibold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>Säkerhetsinställningar</h3>
      
      <div className="space-y-8">
        {/* Lösenord */}
        <div>
          <h4 className={`text-lg font-medium mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Ändra lösenord</h4>
          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Nuvarande lösenord</label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={passwords.current}
                  onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                  className={`w-full px-4 py-2 pr-10 bg-white/10 border border-white/20 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${isDark ? 'text-white' : 'text-gray-900'}`}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
                >
                  {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Nytt lösenord</label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={passwords.new}
                  onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                  className={`w-full px-4 py-2 pr-10 bg-white/10 border border-white/20 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${isDark ? 'text-white' : 'text-gray-900'}`}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Bekräfta nytt lösenord</label>
              <input
                type="password"
                value={passwords.confirm}
                onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                className={`w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${isDark ? 'text-white' : 'text-gray-900'}`}
              />
            </div>
          </div>
        </div>

        {/* Tvåfaktorsautentisering */}
        <div>
          <h4 className={`text-lg font-medium mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Tvåfaktorsautentisering</h4>
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
            <div>
              <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Aktivera 2FA</p>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Lägg till extra säkerhet till ditt konto</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
            </label>
          </div>
        </div>

        {/* Sessioner */}
        <div>
          <h4 className={`text-lg font-medium mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Aktiva sessioner</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
              <div>
                <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>MacBook Pro - Chrome</p>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Stockholm, Sverige - Aktiv nu</p>
              </div>
              <span className="px-2 py-1 text-xs bg-green-500/20 text-green-400 rounded-full">Aktuell</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
              <div>
                <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>iPhone - Safari</p>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Stockholm, Sverige - 2 timmar sedan</p>
              </div>
              <GlassButton variant="secondary" size="sm">Logga ut</GlassButton>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <GlassButton className="flex items-center gap-2">
            <Save className="w-4 h-4" />
            Spara ändringar
          </GlassButton>
        </div>
      </div>
    </GlassCard>
  )
}

const BillingSettings: React.FC = () => {
  const { getCurrentTheme } = useAppearance()
  const isDark = getCurrentTheme() === 'dark'
  
  return (
    <GlassCard className="p-6">
      <h3 className={`text-xl font-semibold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>Faktureringsinställningar</h3>
      
      <div className="space-y-8">
        {/* Aktuell plan */}
        <div>
          <h4 className={`text-lg font-medium mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Aktuell plan</h4>
          <div className="p-6 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg border border-blue-500/30">
            <div className="flex items-center justify-between">
              <div>
                <h5 className="text-xl font-semibold text-white">Professional Plan</h5>
                <p className="text-gray-300">€79/månad - Faktureras månadsvis</p>
                <p className="text-gray-400 text-sm mt-1">Nästa faktura: 15 februari 2024</p>
              </div>
              <div className="text-right">
                <GlassButton variant="secondary" size="sm" className="mb-2">Ändra plan</GlassButton>
                <br />
                <GlassButton variant="secondary" size="sm">Avbryt prenumeration</GlassButton>
              </div>
            </div>
          </div>
        </div>

        {/* Betalningsmetod */}
        <div>
          <h4 className="text-lg font-medium text-white mb-4">Betalningsmetod</h4>
          <div className="p-4 bg-white/5 rounded-lg border border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-6 bg-gradient-to-r from-blue-500 to-blue-600 rounded"></div>
                <div>
                  <p className="text-white font-medium">•••• •••• •••• 4242</p>
                  <p className="text-gray-400 text-sm">Upphör 12/2025</p>
                </div>
              </div>
              <GlassButton variant="secondary" size="sm">Uppdatera</GlassButton>
            </div>
          </div>
        </div>

        {/* Faktureringshistorik */}
        <div>
          <h4 className="text-lg font-medium text-white mb-4">Faktureringshistorik</h4>
          <div className="space-y-2">
            {[
              { date: '15 jan 2024', amount: '€79.00', status: 'Betald' },
              { date: '15 dec 2023', amount: '€79.00', status: 'Betald' },
              { date: '15 nov 2023', amount: '€79.00', status: 'Betald' }
            ].map((invoice, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div className="flex items-center gap-4">
                  <span className="text-white">{invoice.date}</span>
                  <span className="text-white font-medium">{invoice.amount}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-2 py-1 text-xs bg-green-500/20 text-green-400 rounded-full">
                    {invoice.status}
                  </span>
                  <GlassButton variant="ghost" size="sm">Ladda ner</GlassButton>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </GlassCard>
  )
}

const CompanySettings: React.FC = () => {
  const { getCurrentTheme } = useAppearance()
  const isDark = getCurrentTheme() === 'dark'
  const [companyData, setCompanyData] = useState({
    name: 'Mitt Företag AB',
    orgNumber: '556123-4567',
    address: 'Storgatan 1',
    postalCode: '123 45',
    city: 'Stockholm',
    country: 'Sverige',
    phone: '+46 8 123 456 78',
    email: 'info@mittforetag.se',
    website: 'www.mittforetag.se',
    industry: 'konsultverksamhet',
    employees: '1-5',
    vatNumber: 'SE556123456701'
  })

  return (
    <GlassCard className="p-6">
      <h3 className={`text-xl font-semibold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>Företagsinställningar</h3>
      
      <div className="space-y-8">
        {/* Grundläggande företagsinformation */}
        <div>
          <h4 className={`text-lg font-medium mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Grundläggande information</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Företagsnamn</label>
              <input
                type="text"
                value={companyData.name}
                onChange={(e) => setCompanyData({ ...companyData, name: e.target.value })}
                className={`w-full px-4 py-2 border rounded-xl placeholder-gray-400 focus:outline-none focus:ring-1 backdrop-blur-xl transition-all ${
                  isDark 
                    ? 'bg-white/[0.08] border-white/[0.15] text-white focus:ring-white/[0.15] focus:border-white/[0.15]' 
                    : 'bg-gray-50/80 border-gray-200/60 text-gray-900 focus:ring-blue-500/50 focus:border-blue-500/50'
                }`}
              />
            </div>
            
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Organisationsnummer</label>
              <input
                type="text"
                value={companyData.orgNumber}
                onChange={(e) => setCompanyData({ ...companyData, orgNumber: e.target.value })}
                className={`w-full px-4 py-2 border rounded-xl placeholder-gray-400 focus:outline-none focus:ring-1 backdrop-blur-xl transition-all ${
                  isDark 
                    ? 'bg-white/[0.08] border-white/[0.15] text-white focus:ring-white/[0.15] focus:border-white/[0.15]' 
                    : 'bg-gray-50/80 border-gray-200/60 text-gray-900 focus:ring-blue-500/50 focus:border-blue-500/50'
                }`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Bransch</label>
              <select
                value={companyData.industry}
                onChange={(e) => setCompanyData({ ...companyData, industry: e.target.value })}
                className={`w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-1 backdrop-blur-xl transition-all ${
                  isDark 
                    ? 'bg-white/[0.08] border-white/[0.15] text-white focus:ring-white/[0.15] focus:border-white/[0.15]' 
                    : 'bg-gray-50/80 border-gray-200/60 text-gray-900 focus:ring-blue-500/50 focus:border-blue-500/50'
                }`}
              >
                <option value="konsultverksamhet">Konsultverksamhet</option>
                <option value="handel">Handel</option>
                <option value="it">IT & Teknik</option>
                <option value="bygg">Bygg & Anläggning</option>
                <option value="transport">Transport & Logistik</option>
                <option value="vard">Vård & Omsorg</option>
                <option value="annat">Annat</option>
              </select>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Antal anställda</label>
              <select
                value={companyData.employees}
                onChange={(e) => setCompanyData({ ...companyData, employees: e.target.value })}
                className={`w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-1 backdrop-blur-xl transition-all ${
                  isDark 
                    ? 'bg-white/[0.08] border-white/[0.15] text-white focus:ring-white/[0.15] focus:border-white/[0.15]' 
                    : 'bg-gray-50/80 border-gray-200/60 text-gray-900 focus:ring-blue-500/50 focus:border-blue-500/50'
                }`}
              >
                <option value="1">1 person (egenföretagare)</option>
                <option value="2-3">2-3 personer</option>
                <option value="4-5">4-5 personer</option>
                <option value="6-10">6-10 personer</option>
              </select>
            </div>
          </div>
        </div>

        {/* Adressinformation */}
        <div>
          <h4 className={`text-lg font-medium mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Adressinformation</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Gatuadress</label>
              <input
                type="text"
                value={companyData.address}
                onChange={(e) => setCompanyData({ ...companyData, address: e.target.value })}
                className={`w-full px-4 py-2 border rounded-xl placeholder-gray-400 focus:outline-none focus:ring-1 backdrop-blur-xl transition-all ${
                  isDark 
                    ? 'bg-white/[0.08] border-white/[0.15] text-white focus:ring-white/[0.15] focus:border-white/[0.15]' 
                    : 'bg-gray-50/80 border-gray-200/60 text-gray-900 focus:ring-blue-500/50 focus:border-blue-500/50'
                }`}
              />
            </div>
            
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Postnummer</label>
              <input
                type="text"
                value={companyData.postalCode}
                onChange={(e) => setCompanyData({ ...companyData, postalCode: e.target.value })}
                className={`w-full px-4 py-2 border rounded-xl placeholder-gray-400 focus:outline-none focus:ring-1 backdrop-blur-xl transition-all ${
                  isDark 
                    ? 'bg-white/[0.08] border-white/[0.15] text-white focus:ring-white/[0.15] focus:border-white/[0.15]' 
                    : 'bg-gray-50/80 border-gray-200/60 text-gray-900 focus:ring-blue-500/50 focus:border-blue-500/50'
                }`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Stad</label>
              <input
                type="text"
                value={companyData.city}
                onChange={(e) => setCompanyData({ ...companyData, city: e.target.value })}
                className={`w-full px-4 py-2 border rounded-xl placeholder-gray-400 focus:outline-none focus:ring-1 backdrop-blur-xl transition-all ${
                  isDark 
                    ? 'bg-white/[0.08] border-white/[0.15] text-white focus:ring-white/[0.15] focus:border-white/[0.15]' 
                    : 'bg-gray-50/80 border-gray-200/60 text-gray-900 focus:ring-blue-500/50 focus:border-blue-500/50'
                }`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Land</label>
              <input
                type="text"
                value={companyData.country}
                onChange={(e) => setCompanyData({ ...companyData, country: e.target.value })}
                className={`w-full px-4 py-2 border rounded-xl placeholder-gray-400 focus:outline-none focus:ring-1 backdrop-blur-xl transition-all ${
                  isDark 
                    ? 'bg-white/[0.08] border-white/[0.15] text-white focus:ring-white/[0.15] focus:border-white/[0.15]' 
                    : 'bg-gray-50/80 border-gray-200/60 text-gray-900 focus:ring-blue-500/50 focus:border-blue-500/50'
                }`}
              />
            </div>
          </div>
        </div>

        {/* Kontaktinformation */}
        <div>
          <h4 className={`text-lg font-medium mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Kontaktinformation</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Telefon</label>
              <input
                type="tel"
                value={companyData.phone}
                onChange={(e) => setCompanyData({ ...companyData, phone: e.target.value })}
                className={`w-full px-4 py-2 border rounded-xl placeholder-gray-400 focus:outline-none focus:ring-1 backdrop-blur-xl transition-all ${
                  isDark 
                    ? 'bg-white/[0.08] border-white/[0.15] text-white focus:ring-white/[0.15] focus:border-white/[0.15]' 
                    : 'bg-gray-50/80 border-gray-200/60 text-gray-900 focus:ring-blue-500/50 focus:border-blue-500/50'
                }`}
              />
            </div>
            
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>E-post</label>
              <input
                type="email"
                value={companyData.email}
                onChange={(e) => setCompanyData({ ...companyData, email: e.target.value })}
                className={`w-full px-4 py-2 border rounded-xl placeholder-gray-400 focus:outline-none focus:ring-1 backdrop-blur-xl transition-all ${
                  isDark 
                    ? 'bg-white/[0.08] border-white/[0.15] text-white focus:ring-white/[0.15] focus:border-white/[0.15]' 
                    : 'bg-gray-50/80 border-gray-200/60 text-gray-900 focus:ring-blue-500/50 focus:border-blue-500/50'
                }`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Webbsida</label>
              <input
                type="url"
                value={companyData.website}
                onChange={(e) => setCompanyData({ ...companyData, website: e.target.value })}
                className={`w-full px-4 py-2 border rounded-xl placeholder-gray-400 focus:outline-none focus:ring-1 backdrop-blur-xl transition-all ${
                  isDark 
                    ? 'bg-white/[0.08] border-white/[0.15] text-white focus:ring-white/[0.15] focus:border-white/[0.15]' 
                    : 'bg-gray-50/80 border-gray-200/60 text-gray-900 focus:ring-blue-500/50 focus:border-blue-500/50'
                }`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Momsregistreringsnummer</label>
              <input
                type="text"
                value={companyData.vatNumber}
                onChange={(e) => setCompanyData({ ...companyData, vatNumber: e.target.value })}
                className={`w-full px-4 py-2 border rounded-xl placeholder-gray-400 focus:outline-none focus:ring-1 backdrop-blur-xl transition-all ${
                  isDark 
                    ? 'bg-white/[0.08] border-white/[0.15] text-white focus:ring-white/[0.15] focus:border-white/[0.15]' 
                    : 'bg-gray-50/80 border-gray-200/60 text-gray-900 focus:ring-blue-500/50 focus:border-blue-500/50'
                }`}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <GlassButton className="flex items-center gap-2">
            <Save className="w-4 h-4" />
            Spara företagsinformation
          </GlassButton>
        </div>
      </div>
    </GlassCard>
  )
}

const AppearanceSettings: React.FC = () => {
  const { settings, updateSetting, getAccentColors, getCurrentTheme } = useAppearance()
  const accentColors = getAccentColors()
  const isDark = getCurrentTheme() === 'dark'

  return (
    <GlassCard className="p-6">
      <h3 className={`text-xl font-semibold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>Utseendeinställningar</h3>
      
      <div className="space-y-8">
        {/* Tema */}
        <div>
          <h4 className={`text-lg font-medium mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Tema & Färger</h4>
          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Färgtema</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { id: 'dark', name: 'Mörkt (Premium)', desc: 'Liquid Glass design', color: 'from-gray-900 to-black' },
                  { id: 'light', name: 'Ljust', desc: 'Premium glasdesign', color: 'from-gray-100 to-white' },
                  { id: 'auto', name: 'Automatiskt', desc: 'Följer systemets tema', color: 'from-gray-500 to-gray-300' }
                ].map((theme) => (
                  <div
                    key={theme.id}
                    className={cn(
                      `p-4 rounded-xl border-2 transition-all cursor-pointer`,
                      settings.theme === theme.id
                        ? isDark ? 'border-white/20 bg-white/[0.05]' : 'border-black/20 bg-black/[0.05]'
                        : isDark ? 'border-white/[0.05] hover:border-white/10' : 'border-black/[0.1] hover:border-black/15'
                    )}
                    onClick={() => updateSetting('theme', theme.id as 'dark' | 'light' | 'auto')}
                  >
                    <div className={`w-full h-12 rounded-lg bg-gradient-to-r ${theme.color} mb-3`}></div>
                    <h5 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{theme.name}</h5>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{theme.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Accent-färg</label>
              <div className="flex gap-3">
                {[
                  { id: 'blue', color: 'bg-blue-500', name: 'Blå' },
                  { id: 'purple', color: 'bg-purple-500', name: 'Lila' },
                  { id: 'green', color: 'bg-green-500', name: 'Grön' },
                  { id: 'orange', color: 'bg-orange-500', name: 'Orange' }
                ].map((color) => (
                  <div key={color.id} className="flex flex-col items-center gap-2">
                    <button
                      onClick={() => updateSetting('accentColor', color.id as 'blue' | 'purple' | 'green' | 'orange')}
                      className={`w-10 h-10 rounded-full ${color.color} border-2 transition-all ${
                        settings.accentColor === color.id 
                          ? isDark ? 'border-white scale-110' : 'border-gray-700 scale-110'
                          : isDark ? 'border-white/20 hover:scale-105' : 'border-gray-300 hover:scale-105'
                      }`}
                    />
                    <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{color.name}</span>
                  </div>
                ))}
              </div>
              <div className={`mt-3 p-3 rounded-lg border ${isDark ? 'bg-white/[0.03] border-white/[0.05]' : 'bg-gray-50/80 border-gray-200/60'}`}>
                <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Aktuell accent-färg: <span style={{ color: accentColors.primary }}>●</span> {settings.accentColor}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Layout */}
        <div>
          <h4 className={`text-lg font-medium mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Layout & Navigation</h4>
          <div className="space-y-4">
            <div className={`flex items-center justify-between p-4 rounded-xl border ${isDark ? 'bg-white/[0.03] border-white/[0.05]' : 'bg-gray-50/80 border-gray-200/60'}`}>
              <div>
                <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Kompakt läge</p>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Mindre avstånd mellan element</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={settings.compactMode}
                  onChange={(e) => updateSetting('compactMode', e.target.checked)}
                />
                <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-white/20"></div>
              </label>
            </div>

            <div className={`flex items-center justify-between p-4 rounded-xl border ${isDark ? 'bg-white/[0.03] border-white/[0.05]' : 'bg-gray-50/80 border-gray-200/60'}`}>
              <div>
                <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Mjuka animationer</p>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Aktivera övergångseffekter</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={settings.animations}
                  onChange={(e) => updateSetting('animations', e.target.checked)}
                />
                <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-white/20"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Glass Morphism */}
        <div>
          <h4 className={`text-lg font-medium mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Liquid Glass Effekter</h4>
          <div>
            <label className={`block text-sm font-medium mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Glasintensitet</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { id: 'minimal', name: 'Minimal', desc: 'Diskreta effekter' },
                { id: 'subtle', name: 'Subtil', desc: 'Rekommenderat för business' },
                { id: 'enhanced', name: 'Förstärkt', desc: 'Mer synliga effekter' }
              ].map((level) => (
                <div
                  key={level.id}
                  className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                    settings.glassMorphism === level.id
                      ? isDark ? 'border-white/20 bg-white/[0.08]' : 'border-black/20 bg-black/[0.05]'
                      : isDark ? 'border-white/[0.05] hover:border-white/10 bg-white/[0.02]' : 'border-gray-200/60 hover:border-gray-300 bg-gray-50/40'
                  }`}
                  onClick={() => updateSetting('glassMorphism', level.id as 'minimal' | 'subtle' | 'enhanced')}
                >
                  <h5 className={`font-medium mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>{level.name}</h5>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{level.desc}</p>
                </div>
              ))}
            </div>
            <div className={`mt-3 p-3 rounded-lg border ${isDark ? 'bg-white/[0.03] border-white/[0.05]' : 'bg-gray-50/80 border-gray-200/60'}`}>
              <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Aktuell nivå: <strong>{settings.glassMorphism}</strong> - Påverkar alla glaselement i systemet
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <GlassButton className="flex items-center gap-2">
            <Save className="w-4 h-4" />
            Spara utseendeinställningar
          </GlassButton>
        </div>
      </div>
    </GlassCard>
  )
}

const GeneralSettings: React.FC = () => {
  const { getCurrentTheme } = useAppearance()
  const currentTheme = getCurrentTheme()
  const isDark = currentTheme === 'dark'
  
  const [general, setGeneral] = useState({
    language: 'sv',
    timezone: 'Europe/Stockholm',
    dateFormat: 'YYYY-MM-DD',
    timeFormat: '24h',
    currency: 'SEK',
    autoSave: true,
    confirmDelete: true,
    showTips: true,
    weekStart: 'monday'
  })

  return (
    <GlassCard className="p-6">
      <h3 className={`text-xl font-semibold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>Allmänna inställningar</h3>
      
      <div className="space-y-8">
        {/* Språk & Region */}
        <div>
          <h4 className={`text-lg font-medium mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Språk & Region</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Språk</label>
              <select
                value={general.language}
                onChange={(e) => setGeneral({ ...general, language: e.target.value })}
                className={`w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-1 backdrop-blur-xl transition-all ${
                  isDark 
                    ? 'bg-white/[0.08] border-white/[0.15] text-white focus:ring-white/[0.15] focus:border-white/[0.15]' 
                    : 'bg-gray-50/80 border-gray-200/60 text-gray-900 focus:ring-blue-500/50 focus:border-blue-500/50'
                }`}
              >
                <option value="sv">Svenska</option>
                <option value="en">English (kommer snart)</option>
                <option value="no">Norsk (kommer snart)</option>
                <option value="da">Dansk (kommer snart)</option>
              </select>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Tidszon</label>
              <select
                value={general.timezone}
                onChange={(e) => setGeneral({ ...general, timezone: e.target.value })}
                className={`w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-1 backdrop-blur-xl transition-all ${
                  isDark 
                    ? 'bg-white/[0.08] border-white/[0.15] text-white focus:ring-white/[0.15] focus:border-white/[0.15]' 
                    : 'bg-gray-50/80 border-gray-200/60 text-gray-900 focus:ring-blue-500/50 focus:border-blue-500/50'
                }`}
              >
                <option value="Europe/Stockholm">Stockholm, Sverige</option>
                <option value="Europe/Oslo">Oslo, Norge</option>
                <option value="Europe/Copenhagen">Köpenhamn, Danmark</option>
                <option value="Europe/Helsinki">Helsingfors, Finland</option>
              </select>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Valuta</label>
              <select
                value={general.currency}
                onChange={(e) => setGeneral({ ...general, currency: e.target.value })}
                className={`w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-1 backdrop-blur-xl transition-all ${
                  isDark 
                    ? 'bg-white/[0.08] border-white/[0.15] text-white focus:ring-white/[0.15] focus:border-white/[0.15]' 
                    : 'bg-gray-50/80 border-gray-200/60 text-gray-900 focus:ring-blue-500/50 focus:border-blue-500/50'
                }`}
              >
                <option value="SEK">SEK - Svenska kronor</option>
                <option value="NOK">NOK - Norska kronor</option>
                <option value="DKK">DKK - Danska kronor</option>
                <option value="EUR">EUR - Euro</option>
              </select>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Veckan börjar</label>
              <select
                value={general.weekStart}
                onChange={(e) => setGeneral({ ...general, weekStart: e.target.value })}
                className={`w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-1 backdrop-blur-xl transition-all ${
                  isDark 
                    ? 'bg-white/[0.08] border-white/[0.15] text-white focus:ring-white/[0.15] focus:border-white/[0.15]' 
                    : 'bg-gray-50/80 border-gray-200/60 text-gray-900 focus:ring-blue-500/50 focus:border-blue-500/50'
                }`}
              >
                <option value="monday">Måndag</option>
                <option value="sunday">Söndag</option>
              </select>
            </div>
          </div>
        </div>

        {/* Format */}
        <div>
          <h4 className={`text-lg font-medium mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Datum & Tid Format</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Datumformat</label>
              <select
                value={general.dateFormat}
                onChange={(e) => setGeneral({ ...general, dateFormat: e.target.value })}
                className={`w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-1 backdrop-blur-xl transition-all ${
                  isDark 
                    ? 'bg-white/[0.08] border-white/[0.15] text-white focus:ring-white/[0.15] focus:border-white/[0.15]' 
                    : 'bg-gray-50/80 border-gray-200/60 text-gray-900 focus:ring-blue-500/50 focus:border-blue-500/50'
                }`}
              >
                <option value="YYYY-MM-DD">2025-08-11 (ISO)</option>
                <option value="DD/MM/YYYY">11/08/2025 (Europeiskt)</option>
                <option value="MM/DD/YYYY">08/11/2025 (Amerikanskt)</option>
                <option value="DD MMM YYYY">11 aug 2025 (Månadsnamn)</option>
              </select>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Tidsformat</label>
              <select
                value={general.timeFormat}
                onChange={(e) => setGeneral({ ...general, timeFormat: e.target.value })}
                className={`w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-1 backdrop-blur-xl transition-all ${
                  isDark 
                    ? 'bg-white/[0.08] border-white/[0.15] text-white focus:ring-white/[0.15] focus:border-white/[0.15]' 
                    : 'bg-gray-50/80 border-gray-200/60 text-gray-900 focus:ring-blue-500/50 focus:border-blue-500/50'
                }`}
              >
                <option value="24h">24-timmars (14:30)</option>
                <option value="12h">12-timmars (2:30 PM)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Beteende */}
        <div>
          <h4 className={`text-lg font-medium mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Systembeteende</h4>
          <div className="space-y-4">
            <div className={`flex items-center justify-between p-4 rounded-xl border ${isDark ? 'bg-white/[0.03] border-white/[0.05]' : 'bg-gray-50/80 border-gray-200/60'}`}>
              <div>
                <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Automatisk sparning</p>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Spara ändringar automatiskt när du skriver</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={general.autoSave}
                  onChange={(e) => setGeneral({ ...general, autoSave: e.target.checked })}
                />
                <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-white/20"></div>
              </label>
            </div>

            <div className={`flex items-center justify-between p-4 rounded-xl border ${isDark ? 'bg-white/[0.03] border-white/[0.05]' : 'bg-gray-50/80 border-gray-200/60'}`}>
              <div>
                <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Bekräfta borttagning</p>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Visa bekräftelse innan viktiga poster tas bort</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={general.confirmDelete}
                  onChange={(e) => setGeneral({ ...general, confirmDelete: e.target.checked })}
                />
                <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-white/20"></div>
              </label>
            </div>

            <div className={`flex items-center justify-between p-4 rounded-xl border ${isDark ? 'bg-white/[0.03] border-white/[0.05]' : 'bg-gray-50/80 border-gray-200/60'}`}>
              <div>
                <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Visa hjälptips</p>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Visa tips för att bättre använda systemet</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={general.showTips}
                  onChange={(e) => setGeneral({ ...general, showTips: e.target.checked })}
                />
                <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-white/20"></div>
              </label>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <GlassButton className="flex items-center gap-2">
            <Save className="w-4 h-4" />
            Spara allmänna inställningar
          </GlassButton>
        </div>
      </div>
    </GlassCard>
  )
}

const NotificationSettings: React.FC = () => {
  const { getCurrentTheme } = useAppearance()
  const currentTheme = getCurrentTheme()
  const isDark = currentTheme === 'dark'
  
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    pushNotifications: true,
    newContacts: true,
    dealUpdates: true,
    taskReminders: true,
    weeklyReports: false,
    marketingEmails: false
  })

  const handleToggle = (key: keyof typeof notifications) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <GlassCard className="p-6">
      <h3 className={`text-xl font-semibold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>Notifikationsinställningar</h3>
      
      <div className="space-y-6">
        <div>
          <h4 className={`text-lg font-medium mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Allmänna inställningar</h4>
          <div className="space-y-4">
            {[
              { key: 'emailNotifications', label: 'E-postnotifikationer', description: 'Få notifikationer via e-post' },
              { key: 'pushNotifications', label: 'Push-notifikationer', description: 'Få notifikationer i webbläsaren' }
            ].map((item) => (
              <div key={item.key} className={`flex items-center justify-between p-4 rounded-lg ${isDark ? 'bg-white/5' : 'bg-gray-50/80'}`}>
                <div>
                  <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{item.label}</p>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{item.description}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={notifications[item.key as keyof typeof notifications] as boolean}
                    onChange={() => handleToggle(item.key as keyof typeof notifications)}
                  />
                  <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                </label>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className={`text-lg font-medium mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>CRM-notifikationer</h4>
          <div className="space-y-4">
            {[
              { key: 'newContacts', label: 'Nya kontakter', description: 'När nya kontakter läggs till' },
              { key: 'dealUpdates', label: 'Affärsuppdateringar', description: 'När affärer ändrar status' },
              { key: 'taskReminders', label: 'Uppgiftspåminnelser', description: 'När uppgifter närmar sig deadline' }
            ].map((item) => (
              <div key={item.key} className={`flex items-center justify-between p-4 rounded-lg ${isDark ? 'bg-white/5' : 'bg-gray-50/80'}`}>
                <div>
                  <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{item.label}</p>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{item.description}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={notifications[item.key as keyof typeof notifications] as boolean}
                    onChange={() => handleToggle(item.key as keyof typeof notifications)}
                  />
                  <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <GlassButton className="flex items-center gap-2">
            <Save className="w-4 h-4" />
            Spara inställningar
          </GlassButton>
        </div>
      </div>
    </GlassCard>
  )
}

const SettingsPage: React.FC = () => {
  const { getCurrentTheme } = useAppearance()
  const isDark = getCurrentTheme() === 'dark'
  const [activeTab, setActiveTab] = useState('profile')

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return <ProfileSettings />
      case 'security':
        return <SecuritySettings />
      case 'billing':
        return <BillingSettings />
      case 'notifications':
        return <NotificationSettings />
      case 'company':
        return <CompanySettings />
      case 'integrations':
        return (
          <GlassCard className="p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Integrationer</h3>
            <p className="text-gray-400">Kommer snart...</p>
          </GlassCard>
        )
      case 'appearance':
        return <AppearanceSettings />
      case 'general':
        return <GeneralSettings />
      default:
        return <ProfileSettings />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Inställningar</h1>
        <p className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Hantera ditt konto och inställningar</p>
      </div>

      {/* Tabs */}
      <SettingsTabs activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Tab Content */}
      {renderTabContent()}
    </div>
  )
}

export default SettingsPage
