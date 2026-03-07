import { useState, useEffect, useCallback } from 'react'
import { Flame, Settings2, CheckCircle2, AlertTriangle, Plus, ChevronDown, Clock } from 'lucide-react'

export default function HomePage({ users, selectedUserId, onUserChange, onUsersUpdated }) {
  const [habitStats, setHabitStats] = useState([])
  const [loading, setLoading] = useState(true)
  const [logInputs, setLogInputs] = useState({})   // habitId -> string
  const [logging, setLogging] = useState({})        // habitId -> bool
  const [toast, setToast] = useState(null)

  const today = new Date()
  const todayStr = today.toISOString().split('T')[0]
  const dateLabel = today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
  const selectedUser = users.find(u => u.id === selectedUserId)

  const fetchStats = useCallback(async () => {
    if (!selectedUserId) { setLoading(false); return }
    try {
      const res = await fetch(`/api/stats/today?userId=${selectedUserId}`)
      setHabitStats(await res.json())
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [selectedUserId])

  useEffect(() => {
    setLoading(true)
    fetchStats()
  }, [fetchStats])

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 2500)
  }

  const logMinutes = async (habitId, minutes) => {
    const mins = parseInt(minutes)
    if (!mins || mins <= 0) return
    setLogging(prev => ({ ...prev, [habitId]: true }))
    try {
      await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ habitId, userId: selectedUserId, date: todayStr, durationMinutes: mins })
      })
      setLogInputs(prev => ({ ...prev, [habitId]: '' }))
      await fetchStats()
      showToast(`+${mins} min logged`)
    } catch {
      showToast('Failed to log', 'error')
    } finally {
      setLogging(prev => ({ ...prev, [habitId]: false }))
    }
  }

  const goAdmin = () => { window.location.hash = '#admin' }

  const habitsComplete = habitStats.filter(h => h.today.metGoal).length
  const totalMinutes = habitStats.reduce((sum, h) => sum + h.today.totalMinutes, 0)

  if (users.length === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
          <CheckCircle2 className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Welcome to Habit Tracker</h2>
        <p className="text-slate-500 mb-6">Go to Admin to create your first user and habits.</p>
        <button onClick={goAdmin} className="btn btn-primary">Go to Admin</button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          {/* User selector */}
          <div className="relative">
            {users.length > 1 ? (
              <label className="flex items-center gap-2 cursor-pointer group">
                <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  {(selectedUser?.display_name || selectedUser?.name || '?')[0].toUpperCase()}
                </div>
                <div>
                  <div className="font-bold text-slate-900 text-base leading-tight">
                    {selectedUser?.display_name || selectedUser?.name}
                  </div>
                  <div className="text-xs text-slate-400">{dateLabel}</div>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400" />
                <select
                  value={selectedUserId || ''}
                  onChange={e => onUserChange(parseInt(e.target.value))}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full"
                >
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.display_name || u.name}</option>
                  ))}
                </select>
              </label>
            ) : (
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  {(selectedUser?.display_name || selectedUser?.name || '?')[0].toUpperCase()}
                </div>
                <div>
                  <div className="font-bold text-slate-900 text-base leading-tight">
                    {selectedUser?.display_name || selectedUser?.name}
                  </div>
                  <div className="text-xs text-slate-400">{dateLabel}</div>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={goAdmin}
            className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-primary transition-colors bg-slate-100 hover:bg-primary/10 px-3 py-2 rounded-xl"
          >
            <Settings2 className="w-4 h-4" />
            Admin
          </button>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-5 space-y-4">
        {/* Summary bar */}
        {!loading && habitStats.length > 0 && (
          <div className="flex items-center justify-between bg-white rounded-2xl px-4 py-3 shadow-card">
            <div>
              <span className="text-2xl font-bold text-slate-900">{habitsComplete}</span>
              <span className="text-slate-400 font-medium">/{habitStats.length} done</span>
            </div>
            <div className="h-6 w-px bg-slate-200" />
            <div className="text-sm font-semibold text-slate-600">
              <Clock className="w-4 h-4 inline mr-1 text-slate-400" />
              {formatMinutes(totalMinutes)} today
            </div>
            {habitsComplete === habitStats.length && habitStats.length > 0 && (
              <>
                <div className="h-6 w-px bg-slate-200" />
                <div className="text-sm font-bold text-success flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> All done!
                </div>
              </>
            )}
          </div>
        )}

        {/* Habit cards */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-2xl p-5 shadow-card animate-pulse">
                <div className="flex gap-3">
                  <div className="w-1 h-20 bg-slate-200 rounded-full" />
                  <div className="flex-1 space-y-3">
                    <div className="h-5 bg-slate-200 rounded w-1/3" />
                    <div className="h-3 bg-slate-100 rounded" />
                    <div className="h-10 bg-slate-100 rounded-xl" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : habitStats.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 shadow-card text-center">
            <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Plus className="w-7 h-7 text-slate-400" />
            </div>
            <h3 className="font-bold text-slate-800 mb-1">No habits yet</h3>
            <p className="text-slate-500 text-sm mb-4">Go to Admin to add your first habit.</p>
            <button onClick={goAdmin} className="btn btn-primary btn-sm">Go to Admin</button>
          </div>
        ) : (
          habitStats.map(({ habit, today: todayData, streak }) => {
            const done = todayData.metGoal
            const partial = !done && todayData.totalMinutes > 0
            const inputVal = logInputs[habit.id] || ''

            return (
              <div
                key={habit.id}
                className={`bg-white rounded-2xl shadow-card overflow-hidden border-2 transition-colors ${
                  done ? 'border-success/30' : partial ? 'border-warning/30' : 'border-transparent'
                }`}
              >
                <div className="flex items-stretch">
                  {/* Color strip */}
                  <div className="w-1.5 flex-shrink-0" style={{ background: habit.color }} />

                  <div className="flex-1 p-4 space-y-3">
                    {/* Top row: name + streak + status */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-slate-900 text-lg leading-tight">
                            {habit.name}
                          </span>
                          {done && <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0" />}
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-sm text-slate-500 flex-wrap">
                          <span>
                            <span className={`font-bold text-base ${done ? 'text-success' : partial ? 'text-warning' : 'text-slate-700'}`}>
                              {todayData.totalMinutes}
                            </span>
                            <span className="text-slate-400"> / {habit.daily_min_minutes} min</span>
                          </span>
                          {streak > 0 && (
                            <span className="streak-badge">
                              <Flame className="w-3.5 h-3.5" />
                              {streak} day{streak !== 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{
                          width: `${todayData.progress}%`,
                          background: done ? '#22c55e' : partial ? '#f59e0b' : habit.color
                        }}
                      />
                    </div>

                    {/* Quick log row */}
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        inputMode="numeric"
                        placeholder="min"
                        value={inputVal}
                        onChange={e => setLogInputs(prev => ({ ...prev, [habit.id]: e.target.value }))}
                        onKeyDown={e => e.key === 'Enter' && logMinutes(habit.id, inputVal)}
                        className="w-20 px-3 py-2 text-center font-bold text-base bg-slate-50 border-2 border-slate-200 rounded-xl outline-none focus:border-primary transition-colors"
                        min="1"
                      />
                      <QuickBtn label="+15" color={habit.color} onClick={() => logMinutes(habit.id, 15)} loading={logging[habit.id]} />
                      <QuickBtn label="+30" color={habit.color} onClick={() => logMinutes(habit.id, 30)} loading={logging[habit.id]} />
                      <button
                        onClick={() => logMinutes(habit.id, inputVal)}
                        disabled={!inputVal || logging[habit.id]}
                        className="btn btn-sm ml-auto px-4 font-bold disabled:opacity-30 text-white"
                        style={{ background: habit.color }}
                      >
                        {logging[habit.id] ? '...' : 'Log'}
                      </button>
                    </div>

                    {/* Penalty warning */}
                    {!done && todayData.totalMinutes === 0 && (
                      <div className="flex items-center gap-2 text-xs text-amber-600 font-medium">
                        <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                        Miss {habit.penalty_days || 2} days in a row = penalty
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 px-5 py-3 rounded-2xl font-semibold text-sm shadow-lg z-50 transition-all ${
          toast.type === 'error' ? 'bg-danger text-white' : 'bg-slate-900 text-white'
        }`}>
          {toast.msg}
        </div>
      )}
    </div>
  )
}

function QuickBtn({ label, color, onClick, loading }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="px-3 py-2 rounded-xl text-sm font-bold transition-all active:scale-95 disabled:opacity-40"
      style={{ background: `${color}18`, color }}
    >
      {label}
    </button>
  )
}

function formatMinutes(mins) {
  if (!mins) return '0m'
  const h = Math.floor(mins / 60)
  const m = mins % 60
  if (h > 0 && m > 0) return `${h}h ${m}m`
  if (h > 0) return `${h}h`
  return `${m}m`
}
