// Mock data for demo purposes
import type { Contact, Deal, Task, Activity, DashboardStats } from '../../types'

// Mock contacts
const mockContacts: Contact[] = [
  {
    id: '1',
    user_id: 'mock-user-123',
    name: 'Anna Andersson',
    email: 'anna@techab.se',
    phone: '+46 70 123 45 67',
    company: 'Tech AB',
    position: 'VD',
    type: 'person',
    status: 'active',
    source: 'LinkedIn',
    notes: 'Intresserad av vår premium-lösning',
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    user_id: 'mock-user-123',
    name: 'Björn Nilsson',
    email: 'bjorn@designstudio.se',
    phone: '+46 70 987 65 43',
    company: 'Design Studio',
    position: 'Kreativ Direktör',
    type: 'person',
    status: 'prospect',
    source: 'Website',
    notes: 'Vill ha demo av vårt system',
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '3',
    user_id: 'mock-user-123',
    name: 'Cecilia Ström',
    email: 'cecilia@konsult.se',
    phone: '+46 70 555 12 34',
    company: 'Konsult & Co',
    position: 'Partner',
    type: 'person',
    status: 'active',
    source: 'Referral',
    notes: 'Kund sedan 2 år tillbaka',
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '4',
    user_id: 'mock-user-123',
    name: 'David Larsson',
    email: 'david@startup.se',
    phone: '+46 70 222 33 44',
    company: 'StartUp Sweden',
    position: 'Grundare',
    type: 'person',
    status: 'prospect',
    source: 'Trade Show',
    notes: 'Ny startup, intresserad av våra tjänster',
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '5',
    user_id: 'mock-user-123',
    name: 'Emma Johansson',
    email: 'emma@ecommerce.se',
    phone: '+46 70 888 99 00',
    company: 'E-commerce Solutions',
    position: 'Marknadsföringschef',
    type: 'person',
    status: 'active',
    source: 'Google Ads',
    notes: 'Stor kund med många projekt',
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
]

// Mock deals
const mockDeals: Deal[] = [
  {
    id: '1',
    user_id: 'mock-user-123',
    contact_id: '1',
    title: 'CRM Implementation - Tech AB',
    description: 'Fullständig CRM-implementering för Tech AB',
    amount: 150000,
    currency: 'SEK',
    stage: 'proposal',
    probability: 75,
    expected_close_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
    source: 'LinkedIn',
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    user_id: 'mock-user-123',
    contact_id: '2',
    title: 'Design Services Package',
    description: 'Designtjänster för Design Studio',
    amount: 85000,
    currency: 'SEK',
    stage: 'qualified',
    probability: 60,
    expected_close_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    source: 'Website',
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '3',
    user_id: 'mock-user-123',
    contact_id: '3',
    title: 'Consulting Services Renewal',
    description: 'Förnyelse av konsulttjänster för Konsult & Co',
    amount: 250000,
    currency: 'SEK',
    stage: 'won',
    probability: 100,
    expected_close_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    actual_close_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    source: 'Referral',
    created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '4',
    user_id: 'mock-user-123',
    contact_id: '4',
    title: 'Startup Package - StartUp Sweden',
    description: 'Specialpaket för startups',
    amount: 45000,
    currency: 'SEK',
    stage: 'prospect',
    probability: 30,
    expected_close_date: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
    source: 'Trade Show',
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '5',
    user_id: 'mock-user-123',
    contact_id: '5',
    title: 'E-commerce Platform Integration',
    description: 'Integration av CRM med e-handelsplattform',
    amount: 180000,
    currency: 'SEK',
    stage: 'negotiation',
    probability: 85,
    expected_close_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    source: 'Google Ads',
    created_at: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
]

// Mock tasks
const mockTasks: Task[] = [
  {
    id: '1',
    user_id: 'mock-user-123',
    contact_id: '1',
    deal_id: '1',
    title: 'Skicka förslag till Tech AB',
    description: 'Färdigställ och skicka projektförslag',
    completed: false,
    due_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    priority: 'high',
    category: 'sales',
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    user_id: 'mock-user-123',
    contact_id: '2',
    title: 'Boka demomöte med Design Studio',
    description: 'Schemalägg demo av vårt system',
    completed: false,
    due_date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    priority: 'medium',
    category: 'meeting',
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '3',
    user_id: 'mock-user-123',
    contact_id: '3',
    title: 'Månatlig check-in med Konsult & Co',
    description: 'Genomför månatligt uppföljningsmöte',
    completed: true,
    due_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    priority: 'low',
    category: 'follow-up',
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '4',
    user_id: 'mock-user-123',
    contact_id: '4',
    title: 'Följ upp efter mässan',
    description: 'Kontakta alla leads från mässan',
    completed: false,
    due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    priority: 'urgent',
    category: 'follow-up',
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '5',
    user_id: 'mock-user-123',
    contact_id: '5',
    title: 'Kontraktsförhandling E-commerce Solutions',
    description: 'Slutförhandla kontraktets detaljer',
    completed: false,
    due_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    priority: 'high',
    category: 'negotiation',
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
]

// Mock activities
const mockActivities: Activity[] = [
  {
    id: '1',
    user_id: 'mock-user-123',
    contact_id: '1',
    deal_id: '1',
    type: 'call',
    title: 'Telefonsamtal med Anna Andersson',
    description: 'Diskuterade projektets omfattning och tidsram',
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    duration_minutes: 45,
    outcome: 'Positivt, intresserad av att gå vidare',
    next_action: 'Skicka detaljerat förslag inom 3 dagar',
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    user_id: 'mock-user-123',
    contact_id: '2',
    type: 'email',
    title: 'E-post till Design Studio',
    description: 'Skickade information om våra designtjänster',
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    outcome: 'E-post öppnad och länkarna klickade',
    next_action: 'Följ upp med telefonsamtal',
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '3',
    user_id: 'mock-user-123',
    contact_id: '3',
    type: 'meeting',
    title: 'Månadsmöte med Konsult & Co',
    description: 'Genomgång av pågående projekt och framtida behov',
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    duration_minutes: 60,
    outcome: 'Mycket nöjda med leveranserna',
    next_action: 'Skicka förslag på utökning av tjänster',
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '4',
    user_id: 'mock-user-123',
    contact_id: '4',
    type: 'note',
    title: 'Anteckning från mässmöte',
    description: 'Träffade David på Tech Summit, intresserad av startup-paket',
    date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    outcome: 'Gav visitkort och broschyr',
    next_action: 'Ring inom en vecka',
    created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '5',
    user_id: 'mock-user-123',
    contact_id: '5',
    deal_id: '5',
    type: 'meeting',
    title: 'Teknisk demo för E-commerce Solutions',
    description: 'Visade integrationskapaciteter och API-funktioner',
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    duration_minutes: 90,
    outcome: 'Imponerade av teknisk kapacitet',
    next_action: 'Skicka teknisk dokumentation',
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
]

// Mock dashboard stats
const mockDashboardStats: DashboardStats = {
  total_contacts: mockContacts.length,
  total_deals: mockDeals.length,
  total_revenue: mockDeals.reduce((sum, deal) => sum + deal.amount, 0),
  deals_won_this_month: mockDeals.filter(deal => 
    deal.stage === 'won' && 
    deal.actual_close_date &&
    new Date(deal.actual_close_date).getMonth() === new Date().getMonth()
  ).length,
  pipeline_value: mockDeals
    .filter(deal => deal.stage !== 'won' && deal.stage !== 'lost')
  .reduce((sum, deal) => sum + deal.amount * ((deal.probability ?? 0) / 100), 0),
  conversion_rate: 25.5, // Example conversion rate
  average_deal_size: mockDeals.reduce((sum, deal) => sum + deal.amount, 0) / mockDeals.length,
  tasks_due_today: mockTasks.filter(task => 
    !task.completed && 
    task.due_date && 
    new Date(task.due_date).toDateString() === new Date().toDateString()
  ).length,
}

// Mock service classes
export class MockContactService {
  static async getContacts(userId: string, limit?: number): Promise<Contact[]> {
    console.log('Getting contacts for user:', userId)
    return limit ? mockContacts.slice(0, limit) : mockContacts
  }

  static async getRecentContacts(userId: string, limit: number = 10): Promise<Contact[]> {
    console.log('Getting recent contacts for user:', userId)
    return mockContacts
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
      .slice(0, limit)
  }

  static async deleteContact(id: string): Promise<void> {
    console.log('Deleting contact:', id)
    // In a real app, this would delete from the database
  }
}

export class MockDealService {
  static async getDeals(userId: string, limit?: number): Promise<Deal[]> {
    console.log('Getting deals for user:', userId)
    return limit ? mockDeals.slice(0, limit) : mockDeals
  }

  static async deleteDeal(id: string): Promise<void> {
    console.log('Deleting deal:', id)
    // In a real app, this would delete from the database
  }
}

export class MockTaskService {
  static async getTasks(userId: string, limit?: number): Promise<Task[]> {
    console.log('Getting tasks for user:', userId)
    return limit ? mockTasks.slice(0, limit) : mockTasks
  }

  static async deleteTask(id: string): Promise<void> {
    console.log('Deleting task:', id)
    // In a real app, this would delete from the database
  }

  static async updateTask(id: string, updates: Partial<Task>): Promise<Task> {
    console.log('Updating task:', id, updates)
    // In a real app, this would update in the database
    const task = mockTasks.find(t => t.id === id)
    if (!task) throw new Error('Task not found')
    return { ...task, ...updates }
  }

  static async getTasksDueToday(userId: string): Promise<Task[]> {
    console.log('Getting tasks due today for user:', userId)
    const today = new Date().toDateString()
    return mockTasks.filter(task => 
      !task.completed && 
      task.due_date && 
      new Date(task.due_date).toDateString() === today
    )
  }
}

export class MockActivityService {
  static async getActivities(userId: string, limit?: number): Promise<Activity[]> {
    console.log('Getting activities for user:', userId)
    return limit ? mockActivities.slice(0, limit) : mockActivities
  }

  static async deleteActivity(id: string): Promise<void> {
    console.log('Deleting activity:', id)
    // In a real app, this would delete from the database
  }
}

export class MockDashboardService {
  static async getDashboardStats(userId: string): Promise<DashboardStats> {
    console.log('Getting dashboard stats for user:', userId)
    return mockDashboardStats
  }
}
