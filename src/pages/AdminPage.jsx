import { useState } from 'react'
import { ArrowLeft, ListChecks, Calendar, BarChart2, Users } from 'lucide-react'
import HabitsView from '../components/HabitsView'
import CalendarView from '../components/CalendarView'
import StatsView from '../components/StatsView'
import SettingsView from '../components/SettingsView'

const TABS = [
  { id: 'habits', label: 'Habits', Icon: ListChecks },
  { id: 'calendar', label: 'Calendar', Icon: Calendar },
  { id: 'stats', label: 'Stats', Icon: BarChart2 },
  { id: 'users', label: 'Users', Icon: Users },
]

export default function AdminPage({ users, selectedUserId, onUserChange, onUsersUpdated }) {
  const [tab, setTab] = useState('habits')
  const [refreshKey, setRefreshKey] = useState(0)

  const selectedUser = users.find(u => u.id === selectedUserId)
  const goHome = () => { window.location.hash = '' }
  const refresh = () => setRefreshKey(k => k + 1)

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            <button
              onClick={goHome}
              className="flex items-center gap-1.5 text-sm font-semibold text-primary"
            >
              <ArrowLeft className="w-4 h-4" />
              Home
            </button>
            <span className="font-bold text-slate-900">Admin</span>

            {/* User selector */}
            {users.length > 0 && (
              <select
                value={selectedUserId || ''}
                onChange={e => onUserChange(parseInt(e.target.value))}
                className="text-sm font-semibold text-slate-700 bg-slate-100 border-0 rounded-xl px-3 py-2 outline-none cursor-pointer max-w-[130px] truncate"
              >
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.display_name || u.name}</option>
                ))}
              </select>
            )}
          </div>

          {/* Tab bar */}
          <div className="flex gap-1 pb-3">
            {TABS.map(({ id, label, Icon }) => {
              const active = tab === id
              return (
                <button
                  key={id}
                  onClick={() => setTab(id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
                    active
                      ? 'bg-primary text-white'
                      : 'text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-4 h-4" strokeWidth={active ? 2.5 : 1.8} />
                  {label}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-4 py-4">
          {tab === 'habits' && (
            <HabitsView key={refreshKey} userId={selectedUserId} onRefresh={refresh} />
          )}
          {tab === 'calendar' && (
            <CalendarView key={refreshKey} userId={selectedUserId} />
          )}
          {tab === 'stats' && (
            <StatsView key={refreshKey} userId={selectedUserId} />
          )}
          {tab === 'users' && (
            <SettingsView
              users={users}
              selectedUserId={selectedUserId}
              onUsersUpdated={onUsersUpdated}
              onUserChange={onUserChange}
            />
          )}
        </div>
      </div>
    </div>
  )
}
