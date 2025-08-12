import CalendarPage from '@/components/calendar/CalendarPage'

export default function TestCalendar() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6">
        <div className="bg-white rounded-lg shadow">
          <CalendarPage />
        </div>
      </div>
    </div>
  )
}
