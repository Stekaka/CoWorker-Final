import React, { useState, useEffect } from 'react'
import {
  CheckSquare,
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Calendar,
  User,
  Clock,
  AlertCircle,
  CheckCircle2,
  Download,
  Upload,
  Eye,
  Star
} from 'lucide-react'
import { GlassCard, GlassButton } from '../../ui/glass'
import { formatDate, cn } from '../../../lib/utils'
import { useAuth } from '../../../hooks/useAuth'
import { MockTaskService } from '../../../lib/database/mockServices'
import type { Task } from '../../../types'

interface TaskCardProps {
  task: Task
  onEdit: (task: Task) => void
  onDelete: (id: string) => void
  onToggleComplete: (id: string, completed: boolean) => void
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onEdit, onDelete, onToggleComplete }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'text-red-400 bg-red-500/20 border-red-500/30'
      case 'high':
        return 'text-orange-400 bg-orange-500/20 border-orange-500/30'
      case 'medium':
        return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30'
      case 'low':
        return 'text-green-400 bg-green-500/20 border-green-500/30'
      default:
        return 'text-gray-400 bg-gray-500/20 border-gray-500/30'
    }
  }

  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && !task.completed

  return (
    <GlassCard className={cn(
      "p-6 hover:bg-white/10 transition-all duration-300",
      task.completed && "opacity-75",
      isOverdue && "border-red-500/50"
    )}>
      <div className="flex items-start gap-4">
        <button
          onClick={() => onToggleComplete(task.id, !task.completed)}
          className={cn(
            "flex-shrink-0 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-colors",
            task.completed 
              ? "bg-green-500 border-green-500 text-white" 
              : "border-gray-400 hover:border-green-400"
          )}
        >
          {task.completed && <CheckCircle2 className="w-4 h-4" />}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <h3 className={cn(
              "text-lg font-semibold",
              task.completed ? "text-gray-400 line-through" : "text-white"
            )}>
              {task.title}
            </h3>
            <div className="relative">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-1 hover:bg-white/10 rounded-lg transition-colors"
              >
                <MoreHorizontal className="w-4 h-4 text-gray-300" />
              </button>
              {isMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-black/90 backdrop-blur-xl border border-white/20 rounded-lg shadow-xl z-10">
                  <button
                    onClick={() => {
                      onEdit(task)
                      setIsMenuOpen(false)
                    }}
                    className="w-full px-4 py-2 text-left text-white hover:bg-white/10 flex items-center gap-2 first:rounded-t-lg"
                  >
                    <Edit className="w-4 h-4" />
                    Redigera
                  </button>
                  <button
                    onClick={() => {
                      setIsMenuOpen(false)
                    }}
                    className="w-full px-4 py-2 text-left text-white hover:bg-white/10 flex items-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    Visa detaljer
                  </button>
                  <button
                    onClick={() => {
                      setIsMenuOpen(false)
                    }}
                    className="w-full px-4 py-2 text-left text-white hover:bg-white/10 flex items-center gap-2"
                  >
                    <Star className="w-4 h-4" />
                    Favorit
                  </button>
                  <button
                    onClick={() => {
                      onDelete(task.id)
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

          {task.description && (
            <p className={cn(
              "text-sm mb-3",
              task.completed ? "text-gray-500" : "text-gray-300"
            )}>
              {task.description}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-3 mb-3">
            <span className={`px-2 py-1 text-xs rounded-full border ${getPriorityColor(task.priority)}`}>
              {task.priority}
            </span>
            
            {task.category && (
              <span className="px-2 py-1 text-xs rounded-full bg-blue-500/20 text-blue-400">
                {task.category}
              </span>
            )}

            {isOverdue && (
              <span className="px-2 py-1 text-xs rounded-full bg-red-500/20 text-red-400 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                Försenad
              </span>
            )}
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              {task.due_date && (
                <div className="flex items-center gap-1 text-gray-400">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(task.due_date)}</span>
                </div>
              )}
              
              {task.assigned_to && (
                <div className="flex items-center gap-1 text-gray-400">
                  <User className="w-4 h-4" />
                  <span>{task.assigned_to}</span>
                </div>
              )}
            </div>

            <span className="text-gray-500 text-xs">
              {formatDate(task.updated_at)}
            </span>
          </div>
        </div>
      </div>
    </GlassCard>
  )
}

const TasksPage: React.FC = () => {
  const { user } = useAuth()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'completed'>('all')
  const [filterPriority, setFilterPriority] = useState<'all' | 'urgent' | 'high' | 'medium' | 'low'>('all')
  const [sortBy, setSortBy] = useState<'due_date' | 'priority' | 'created_at'>('due_date')

  useEffect(() => {
    const loadTasksData = async () => {
      if (user) {
        try {
          setLoading(true)
          const tasksData = await MockTaskService.getTasks(user.id)
          setTasks(tasksData)
        } catch (error) {
          console.error('Fel vid laddning av uppgifter:', error)
        } finally {
          setLoading(false)
        }
      }
    }
    
    loadTasksData()
  }, [user])



  const handleEdit = (task: Task) => {
    console.log('Redigera uppgift:', task)
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('Är du säker på att du vill ta bort denna uppgift?')) {
      try {
        await MockTaskService.deleteTask(id)
        setTasks(tasks.filter(task => task.id !== id))
      } catch (error) {
        console.error('Fel vid borttagning av uppgift:', error)
      }
    }
  }

  const handleToggleComplete = async (id: string, completed: boolean) => {
    try {
      await MockTaskService.updateTask(id, { completed })
      setTasks(tasks.map(task => 
        task.id === id ? { ...task, completed } : task
      ))
    } catch (error) {
      console.error('Fel vid uppdatering av uppgift:', error)
    }
  }

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.category?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'completed' && task.completed) ||
                         (filterStatus === 'pending' && !task.completed)
    const matchesPriority = filterPriority === 'all' || task.priority === filterPriority
    
    return matchesSearch && matchesStatus && matchesPriority
  })

  // Sortera uppgifter
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    switch (sortBy) {
      case 'due_date':
        if (!a.due_date) return 1
        if (!b.due_date) return -1
        return new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
      case 'priority':
        const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 }
        return priorityOrder[a.priority as keyof typeof priorityOrder] - priorityOrder[b.priority as keyof typeof priorityOrder]
      case 'created_at':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      default:
        return 0
    }
  })

  // Beräkna statistik
  const totalTasks = tasks.length
  const completedTasks = tasks.filter(task => task.completed).length
  const pendingTasks = totalTasks - completedTasks
  const overdueTasks = tasks.filter(task => 
    task.due_date && new Date(task.due_date) < new Date() && !task.completed
  ).length
  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

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
          <h1 className="text-3xl font-bold text-white mb-2">Uppgifter</h1>
          <p className="text-gray-300">Hantera dina uppgifter och deadlines</p>
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
            Ny uppgift
          </GlassButton>
        </div>
      </div>

      {/* Statistik */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <GlassCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-300 text-sm">Totalt antal uppgifter</p>
              <p className="text-2xl font-bold text-white">{totalTasks}</p>
            </div>
            <div className="p-3 bg-blue-500/20 rounded-lg">
              <CheckSquare className="w-6 h-6 text-blue-400" />
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-300 text-sm">Slutförda</p>
              <p className="text-2xl font-bold text-white">{completedTasks}</p>
            </div>
            <div className="p-3 bg-green-500/20 rounded-lg">
              <CheckCircle2 className="w-6 h-6 text-green-400" />
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-300 text-sm">Väntande</p>
              <p className="text-2xl font-bold text-white">{pendingTasks}</p>
            </div>
            <div className="p-3 bg-yellow-500/20 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-400" />
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-300 text-sm">Slutförandegrad</p>
              <p className="text-2xl font-bold text-white">{completionRate.toFixed(1)}%</p>
            </div>
            <div className="p-3 bg-purple-500/20 rounded-lg">
              <CheckCircle2 className="w-6 h-6 text-purple-400" />
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
              placeholder="Sök uppgifter..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as 'all' | 'pending' | 'completed')}
            className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          >
            <option value="all">Alla status</option>
            <option value="pending">Väntande</option>
            <option value="completed">Slutförda</option>
          </select>

          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value as 'all' | 'urgent' | 'high' | 'medium' | 'low')}
            className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          >
            <option value="all">Alla prioriteter</option>
            <option value="urgent">Brådskande</option>
            <option value="high">Hög</option>
            <option value="medium">Medium</option>
            <option value="low">Låg</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'due_date' | 'priority' | 'created_at')}
            className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          >
            <option value="due_date">Sortera efter datum</option>
            <option value="priority">Sortera efter prioritet</option>
            <option value="created_at">Sortera efter skapad</option>
          </select>
        </div>
      </GlassCard>

      {/* Försenade uppgifter varning */}
      {overdueTasks > 0 && (
        <GlassCard className="p-4 border-red-500/50 bg-red-500/10">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <p className="text-red-400">
              Du har {overdueTasks} försenade uppgifter som behöver uppmärksamhet.
            </p>
          </div>
        </GlassCard>
      )}

      {/* Resultat */}
      <div className="flex items-center justify-between">
        <p className="text-gray-300">
          Visar {sortedTasks.length} av {totalTasks} uppgifter
        </p>
      </div>

      {/* Uppgiftslista */}
      {sortedTasks.length === 0 ? (
        <GlassCard className="p-12 text-center">
          <CheckSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Inga uppgifter hittades</h3>
          <p className="text-gray-300 mb-6">
            {searchTerm || filterStatus !== 'all' || filterPriority !== 'all'
              ? 'Försök att ändra dina sökkriterier eller filter.'
              : 'Kom igång genom att skapa din första uppgift.'}
          </p>
          <GlassButton className="flex items-center gap-2 mx-auto">
            <Plus className="w-4 h-4" />
            Skapa uppgift
          </GlassButton>
        </GlassCard>
      ) : (
        <div className="space-y-4">
          {sortedTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggleComplete={handleToggleComplete}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default TasksPage
