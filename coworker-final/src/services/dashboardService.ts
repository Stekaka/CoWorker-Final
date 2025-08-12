import { ContactService } from './contactService'
import { DealService } from './dealService'
import { TaskService } from './taskService'
import { ProductService } from './productService'

export class DashboardService {
  static async getDashboardStats() {
    try {
      // Get stats from all services
      const [
        contactStats,
        dealStats,
        taskStats,
        productStats
      ] = await Promise.all([
        ContactService.getContactStats(),
        DealService.getDealStats(),
        TaskService.getTaskStats(),
        ProductService.getProductStats()
      ])

      return {
        contacts: contactStats,
        deals: dealStats,
        tasks: taskStats,
        products: productStats,
        // Calculate some derived metrics
        totalValue: dealStats.totalValue,
        conversionRate: dealStats.total > 0 ? (dealStats.won / dealStats.total) * 100 : 0,
        taskCompletionRate: taskStats.total > 0 ? (taskStats.completed / taskStats.total) * 100 : 0
      }
    } catch (error) {
      console.error('Error getting dashboard stats:', error)
      return {
        contacts: { total: 0, active: 0, inactive: 0, prospects: 0 },
        deals: { total: 0, totalValue: 0, won: 0, lost: 0, active: 0 },
        tasks: { total: 0, completed: 0, pending: 0, overdue: 0 },
        products: { total: 0, active: 0, inactive: 0 },
        totalValue: 0,
        conversionRate: 0,
        taskCompletionRate: 0
      }
    }
  }

  static async getRecentActivity() {
    try {
      // Get recent items from different services
      const [recentContacts, recentDeals, recentTasks] = await Promise.all([
        ContactService.getContacts().then(contacts => contacts.slice(0, 5)),
        DealService.getDeals().then(deals => deals.slice(0, 5)),
        TaskService.getTasks().then(tasks => tasks.slice(0, 5))
      ])

      return {
        recentContacts,
        recentDeals,
        recentTasks
      }
    } catch (error) {
      console.error('Error getting recent activity:', error)
      return {
        recentContacts: [],
        recentDeals: [],
        recentTasks: []
      }
    }
  }

  static async getQuickActions() {
    try {
      // Return available quick actions based on current data
      const contactStats = await ContactService.getContactStats()
      const taskStats = await TaskService.getTaskStats()

      return {
        canAddContact: true,
        canAddTask: true,
        canAddDeal: true,
        canAddProduct: true,
        urgentTasks: taskStats.overdue,
        newProspects: contactStats.prospects
      }
    } catch (error) {
      console.error('Error getting quick actions:', error)
      return {
        canAddContact: true,
        canAddTask: true,
        canAddDeal: true,
        canAddProduct: true,
        urgentTasks: 0,
        newProspects: 0
      }
    }
  }
}
