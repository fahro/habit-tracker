import { useState, useEffect } from 'react'
import { Home, ListChecks, Calendar, BarChart2, Settings } from 'lucide-react'
import TodayView from './components/TodayView'
import HabitsView from './components/HabitsView'
import CalendarView from './components/CalendarView'
import StatsView from './components/StatsView'
import SettingsView from './components/SettingsView'

const TABS = [
  { id: 'today', label: 'Today', Icon: Home },
  { id: 'habits', label: 'Habits', Icon: ListChecks },
  { id: 'calendar', label: 'Calendar', Icon: Calendar },
  { id: 'stats', label: 'Stats', Icon: BarChart2 },
  { id: 'settings', label: 'Settings', Icon: Settings },
]

function App() {
  const [activeTab, setActiveTab] = useState('today')
  const [users, setUsers] = useState([])
  const [selectedUserId, setSelectedUserId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users')
      const data = await res.json()
      setUsers(data)

      if (data.length > 0) {
        const saved = localStorage.getItem('selectedUserId')
        const exists = saved && data.find(u => u.id === parseInt(saved))
        const id = exists ? parseInt(saved) : data[0].id
        setSelectedUserId(id)
        localStorage.setItem('selectedUserId', id.toString())
      }
    } catch (err) {
      console.error('Failed to fetch users:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchUsers() }, [])

  const handleUserChange = (id) => {
    setSelectedUserId(id)
    localStorage.setItem('selectedUserId', id.toString())
  }

  const refresh = () => setRefreshKey(k => k + 1)

  const selectedUser = users.find(u => u.id === selectedUserId)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-background">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-slate-500 font-medium">Loading...</p>
        </div>
      </div>
    )
  }

  if (users.length === 0 && activeTab !== 'settings') {
    return (
      <div className="flex flex-col h-full bg-background">
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center max-w-sm">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <ListChecks className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Welcome!</h2>
            <p className="text-slate-500 mb-6">Create your first user profile to start tracking habits.</p>
            <button className="btn btn-primary w-full" onClick={() => setActiveTab('settings')}>
              Get Started
            </button>
          </div>
        </div>
        <BottomNav activeTab={activeTab} onChange={setActiveTab} />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <header className="bg-white border-b border-slate-100 flex-shrink-0 px-4 pt-[env(safe-area-inset-top)]">
        <div className="max-w-2xl mx-auto flex items-center justify-between h-14">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center">
              <ListChecks className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-slate-900 text-lg">Habits</span>
          </div>

          {users.length > 1 && selectedUser && (
            <select
              value={selectedUserId || ''}
              onChange={e => handleUserChange(parseInt(e.target.value))}
              className="text-sm font-semibold text-slate-700 bg-slate-100 border-0 rounded-xl px-3 py-2 outline-none cursor-pointer"
            >
              {users.map(u => (
                <option key={u.id} value={u.id}>{u.display_name || u.name}</option>
              ))}
            </select>
          )}

          {users.length === 1 && selectedUser && (
            <span className="text-sm font-semibold text-slate-500">
              {selectedUser.display_name || selectedUser.name}
            </span>
          )}
        </div>
      </header>

      {/* Content */}
      <div className="content-area">
        <div className="max-w-2xl mx-auto px-4 py-4">
          {activeTab === 'today' && (
            <TodayView key={refreshKey} userId={selectedUserId} onRefresh={refresh} />
          )}
          {activeTab === 'habits' && (
            <HabitsView key={refreshKey} userId={selectedUserId} onRefresh={refresh} />
          )}
          {activeTab === 'calendar' && (
            <CalendarView key={refreshKey} userId={selectedUserId} />
          )}
          {activeTab === 'stats' && (
            <StatsView key={refreshKey} userId={selectedUserId} />
          )}
          {activeTab === 'settings' && (
            <SettingsView
              users={users}
              selectedUserId={selectedUserId}
              onUsersUpdated={fetchUsers}
              onUserChange={handleUserChange}
            />
          )}
        </div>
      </div>

      <BottomNav activeTab={activeTab} onChange={setActiveTab} />
    </div>
  )
}

function BottomNav({ activeTab, onChange }) {
  return (
    <nav className="bottom-nav">
      <div className="flex w-full max-w-2xl mx-auto px-2">
        {TABS.map(({ id, label, Icon }) => {
          const active = activeTab === id
          return (
            <button
              key={id}
              onClick={() => onChange(id)}
              className={`nav-item ${active ? 'active' : ''}`}
            >
              <Icon
                className={`nav-icon w-6 h-6 ${active ? 'text-primary' : 'text-slate-400'}`}
                strokeWidth={active ? 2.5 : 1.8}
              />
              <span className={`text-[11px] font-semibold leading-tight ${active ? 'text-primary' : 'text-slate-400'}`}>
                {label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}

export default App
