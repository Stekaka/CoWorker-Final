import React, { useState, useEffect } from 'react'
import {
  CheckSquare,
  Plus,
  Search,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle2,
  Star,
  X,
  Edit,
  ChevronRight
} from 'lucide-react'
import { GlassCard, GlassButton } from '../../ui/glass'
import { formatDate, cn } from '../../../lib/utils'
import { useAuth } from '../../../hooks/useAuth'
import { MockTaskService, MockContactService } from '../../../lib/database/mockServices'
import type { Task, Contact } from '../../../types'

interface TaskListItemProps {
  task: Task
  onClick: () => void
  onToggleComplete: (id: string, completed: boolean) => void
  isSelected: boolean
}

const TaskListItem: React.FC<TaskListItemProps> = ({ task, onClick, onToggleComplete, isSelected }) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-500/20 text-red-400 border-red-500/30'
      case 'high':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/30'
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'low':
        return 'bg-green-500/20 text-green-400 border-green-500/30'
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'Brådskande'
      case 'high': return 'Hög'
      case 'medium': return 'Medel'
      case 'low': return 'Låg'
      default: return priority
    }
  }

  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && !task.completed

  return (
    <div
      className={cn(
        'p-5 border border-white/10 rounded-lg transition-all duration-200 group',
        isSelected ? 'bg-blue-500/10 border-blue-400/30' : 'bg-white/[0.02]',
        task.completed ? 'opacity-60' : ''
      )}
    >
      <div className="flex items-center gap-4">
        <button
          onClick={(e) => {
            e.stopPropagation()
            onToggleComplete(task.id, !task.completed)
          }}
          className={cn(
            'w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors',
            task.completed
              ? 'bg-green-500 border-green-500 text-white'
              : 'border-gray-400 hover:border-green-400'
          )}
        >
          {task.completed && <CheckCircle2 className="w-4 h-4" />}
        </button>

        <div 
          className="flex-1 min-w-0 cursor-pointer"
          onClick={onClick}
        >
          <div className="flex items-center gap-3 mb-2">
            <h3 className={cn(
              'text-lg font-medium truncate',
              task.completed ? 'text-gray-400 line-through' : 'text-white'
            )}>
              {task.title}
            </h3>
            <div className={cn('px-2 py-1 text-xs rounded-full border', getPriorityColor(task.priority))}>
              {getPriorityText(task.priority)}
            </div>
            {isOverdue && (
              <div className="flex items-center gap-1 px-2 py-1 bg-red-500/20 text-red-400 rounded-full text-xs">
                <AlertCircle className="w-3 h-3" />
                Försenad
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-6 text-sm text-gray-300">
            {task.due_date && (
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4 text-blue-400" />
                <span className={isOverdue ? 'text-red-400' : ''}>
                  {formatDate(task.due_date)}
                </span>
              </div>
            )}
            {task.description && (
              <p className="text-gray-400 truncate max-w-md">{task.description}</p>
            )}
          </div>
        </div>

        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors flex-shrink-0" />
      </div>
    </div>
  )
}

interface TaskDetailProps {
  task: Task
  onClose: () => void
  contact?: Contact
}

const TaskDetail: React.FC<TaskDetailProps> = ({ task, onClose, contact }) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500/20 text-red-400 border-red-500/30'
      case 'high': return 'bg-orange-500/20 text-orange-400 border-orange-500/30'
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'low': return 'bg-green-500/20 text-green-400 border-green-500/30'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'Brådskande'
      case 'high': return 'Hög'
      case 'medium': return 'Medel'
      case 'low': return 'Låg'
      default: return priority
    }
  }

  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && !task.completed

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <GlassCard className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-white/10 bg-gradient-to-r from-blue-500/10 to-purple-500/10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">{task.title}</h2>
              <div className="flex items-center gap-4">
                <div className={cn('px-3 py-1 text-sm rounded-full border', getPriorityColor(task.priority))}>
                  {getPriorityText(task.priority)}
                </div>
                {task.completed ? (
                  <div className="flex items-center gap-2 px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm">
                    <CheckCircle2 className="w-4 h-4" />
                    Klar
                  </div>
                ) : isOverdue ? (
                  <div className="flex items-center gap-2 px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-sm">
                    <AlertCircle className="w-4 h-4" />
                    Försenad
                  </div>
                ) : (
                  <div className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm">
                    Pågående
                  </div>
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
              <h3 className="text-xl font-semibold text-white mb-4">Uppgiftsdetaljer</h3>
              
              <div className="space-y-4">
                {task.description && (
                  <div className="bg-white/5 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-400 mb-2">Beskrivning</h4>
                    <p className="text-white leading-relaxed">{task.description}</p>
                  </div>
                )}

                {contact && (
                  <div className="bg-white/5 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-400 mb-2">Relaterad kontakt</h4>
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

                {task.due_date && (
                  <div className="bg-white/5 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-400 mb-2">Förfallodatum</h4>
                    <p className={cn(
                      'font-medium',
                      isOverdue ? 'text-red-400' : 'text-white'
                    )}>
                      {formatDate(task.due_date)}
                    </p>
                  </div>
                )}

                <div className="bg-white/5 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-400 mb-2">Skapad</h4>
                  <p className="text-white">{formatDate(task.created_at)}</p>
                </div>
              </div>
            </div>

            {/* Höger kolumn */}
            <div>
              <h3 className="text-xl font-semibold text-white mb-4">Åtgärder</h3>
              
              <div className="space-y-4">
                <GlassButton 
                  className="w-full"
                  variant={task.completed ? "secondary" : "primary"}
                >
                  {task.completed ? (
                    <>
                      <X className="w-4 h-4 mr-2" />
                      Markera som ej klar
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Markera som klar
                    </>
                  )}
                </GlassButton>
                
                <GlassButton variant="secondary" className="w-full">
                  <Calendar className="w-4 h-4 mr-2" />
                  Ändra datum
                </GlassButton>
                
                <GlassButton variant="secondary" className="w-full">
                  <Clock className="w-4 h-4 mr-2" />
                  Skjut upp
                </GlassButton>

                {/* Status */}
                <div className="mt-8 p-4 bg-white/5 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-400 mb-3">Status</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Prioritet</span>
                      <span className={cn('text-sm', 
                        task.priority === 'urgent' ? 'text-red-400' :
                        task.priority === 'high' ? 'text-orange-400' :
                        task.priority === 'medium' ? 'text-yellow-400' :
                        'text-green-400'
                      )}>
                        {getPriorityText(task.priority)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Status</span>
                      <span className={cn('text-sm',
                        task.completed ? 'text-green-400' :
                        isOverdue ? 'text-red-400' :
                        'text-blue-400'
                      )}>
                        {task.completed ? 'Klar' : isOverdue ? 'Försenad' : 'Pågående'}
                      </span>
                    </div>
                    {task.due_date && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300">Dagar kvar</span>
                        <span className={cn('text-sm',
                          isOverdue ? 'text-red-400' : 'text-blue-400'
                        )}>
                          {isOverdue 
                            ? `${Math.ceil((new Date().getTime() - new Date(task.due_date).getTime()) / (1000 * 3600 * 24))} dagar försenad`
                            : `${Math.ceil((new Date(task.due_date).getTime() - new Date().getTime()) / (1000 * 3600 * 24))} dagar`
                          }
                        </span>
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

const TasksPage: React.FC = () => {
  const { user } = useAuth()
  const [tasks, setTasks] = useState<Task[]>([])
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'completed' | 'overdue'>('all')
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)

  useEffect(() => {
    const loadTasksData = async () => {
      if (user) {
        try {
          setLoading(true)
          const [tasksData, contactsData] = await Promise.all([
            MockTaskService.getTasks(user.id),
            MockContactService.getContacts(user.id)
          ])
          setTasks(tasksData)
          setContacts(contactsData)
        } catch (error) {
          console.error('Fel vid laddning av uppgifter:', error)
        } finally {
          setLoading(false)
        }
      }
    }
    
    loadTasksData()
  }, [user])

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task)
  }

  const handleToggleComplete = async (id: string, completed: boolean) => {
    try {
      setTasks(tasks.map(task => 
        task.id === id ? { ...task, completed } : task
      ))
    } catch (error) {
      console.error('Fel vid uppdatering av uppgift:', error)
    }
  }

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const now = new Date()
    const isOverdue = task.due_date && new Date(task.due_date) < now && !task.completed
    
    const matchesFilter = 
      filterStatus === 'all' ||
      (filterStatus === 'completed' && task.completed) ||
      (filterStatus === 'pending' && !task.completed && !isOverdue) ||
      (filterStatus === 'overdue' && isOverdue)
    
    return matchesSearch && matchesFilter
  })

  // Enkla statistik för småföretag
  const completedTasks = tasks.filter(task => task.completed)
  const pendingTasks = tasks.filter(task => !task.completed)
  const overdueTasks = tasks.filter(task => {
    const now = new Date()
    return task.due_date && new Date(task.due_date) < now && !task.completed
  })
  const todayTasks = tasks.filter(task => {
    if (!task.due_date) return false
    const today = new Date()
    const taskDate = new Date(task.due_date)
    return taskDate.toDateString() === today.toDateString() && !task.completed
  })

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
          <h1 className="text-4xl font-bold text-white mb-2">Att göra</h1>
          <p className="text-xl text-gray-300">Håll koll på dina uppgifter - enkelt och tydligt</p>
        </div>
        <GlassButton size="lg" className="flex items-center gap-3">
          <Plus className="w-5 h-5" />
          Ny uppgift
        </GlassButton>
      </div>

      {/* Enkla statistik */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <GlassCard className="p-6 bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-blue-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-300 text-sm font-medium">Idag</p>
              <p className="text-3xl font-bold text-white">{todayTasks.length}</p>
              <p className="text-blue-400 text-sm">Ska göras idag</p>
            </div>
            <div className="p-3 bg-blue-500/20 rounded-lg">
              <Calendar className="w-8 h-8 text-blue-400" />
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6 bg-gradient-to-br from-orange-500/10 to-orange-600/10 border-orange-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-300 text-sm font-medium">Pågående</p>
              <p className="text-3xl font-bold text-white">{pendingTasks.length}</p>
              <p className="text-orange-400 text-sm">Väntar på att göras</p>
            </div>
            <div className="p-3 bg-orange-500/20 rounded-lg">
              <Clock className="w-8 h-8 text-orange-400" />
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6 bg-gradient-to-br from-red-500/10 to-red-600/10 border-red-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-300 text-sm font-medium">Försenade</p>
              <p className="text-3xl font-bold text-white">{overdueTasks.length}</p>
              <p className="text-red-400 text-sm">Behöver uppmärksamhet</p>
            </div>
            <div className="p-3 bg-red-500/20 rounded-lg">
              <AlertCircle className="w-8 h-8 text-red-400" />
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6 bg-gradient-to-br from-green-500/10 to-green-600/10 border-green-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-300 text-sm font-medium">Klara</p>
              <p className="text-3xl font-bold text-white">{completedTasks.length}</p>
              <p className="text-green-400 text-sm">Avklarade uppgifter</p>
            </div>
            <div className="p-3 bg-green-500/20 rounded-lg">
              <CheckCircle2 className="w-8 h-8 text-green-400" />
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
              placeholder="Sök efter uppgift..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-6 py-4 bg-white/10 border border-white/20 rounded-lg text-white text-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as 'all' | 'pending' | 'completed' | 'overdue')}
            className="px-4 py-4 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          >
            <option value="all">Alla uppgifter</option>
            <option value="pending">Pågående</option>
            <option value="overdue">Försenade</option>
            <option value="completed">Klara</option>
          </select>
        </div>
        <p className="text-gray-400 text-sm mt-2">
          Visar {filteredTasks.length} av {tasks.length} uppgifter
        </p>
      </GlassCard>

      {/* Uppgiftslista */}
      {filteredTasks.length === 0 ? (
        <GlassCard className="p-12 text-center">
          <CheckSquare className="w-20 h-20 text-gray-400 mx-auto mb-6" />
          <h3 className="text-2xl font-semibold text-white mb-3">
            {searchTerm ? 'Inga uppgifter hittades' : 'Inga uppgifter än'}
          </h3>
          <p className="text-gray-300 text-lg mb-8">
            {searchTerm
              ? 'Försök med ett annat sökord eller skapa en ny uppgift.'
              : 'Kom igång genom att lägga till din första uppgift.'}
          </p>
          <GlassButton size="lg" className="flex items-center gap-3 mx-auto">
            <Plus className="w-5 h-5" />
            Skapa din första uppgift
          </GlassButton>
        </GlassCard>
      ) : (
        <GlassCard className="p-6">
          <div className="space-y-3">
            {filteredTasks.map((task) => (
              <TaskListItem
                key={task.id}
                task={task}
                onClick={() => handleTaskClick(task)}
                onToggleComplete={handleToggleComplete}
                isSelected={selectedTask?.id === task.id}
              />
            ))}
          </div>
        </GlassCard>
      )}

      {/* Detaljerat uppgiftskort */}
      {selectedTask && (
        <TaskDetail
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          contact={contacts.find(c => c.id === selectedTask.contact_id)}
        />
      )}
    </div>
  )
}

export default TasksPage
