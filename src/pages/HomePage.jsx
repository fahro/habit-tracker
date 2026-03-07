import { useState, useEffect, useCallback } from 'react'
import { Flame, Settings2, CheckCircle2, AlertTriangle, Plus, Clock, Trash2, CalendarDays, BarChart2, ListChecks } from 'lucide-react'
import CalendarView from '../components/CalendarView'
import StatsView from '../components/StatsView'

const TABS = [
  { id: 'today', label: 'Today', Icon: ListChecks },
  { id: 'calendar', label: 'Calendar', Icon: CalendarDays },
  { id: 'stats', label: 'Stats', Icon: BarChart2 },
]

export default function HomePage({ users, selectedUserId, onUserChange }) {
  const [tab, setTab] = useState('today')
  const [habitStats, setHabitStats] = useState([])
  const [todayLogs, setTodayLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [logInputs, setLogInputs] = useState({})   // habitId -> { mins, notes }
  const [logging, setLogging] = useState({})        // habitId -> bool
  const [deletingLog, setDeletingLog] = useState({}) // logId -> bool
  const [toast, setToast] = useState(null)

  const today = new Date()
  const todayStr = today.toISOString().split('T')[0]
  const dateLabel = today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

  const fetchData = useCallback(async () => {
    if (!selectedUserId) { setLoading(false); return }
    try {
      const [statsRes, logsRes] = await Promise.all([
        fetch(`/api/stats/today?userId=${selectedUserId}`),
        fetch(`/api/logs?userId=${selectedUserId}&date=${todayStr}`)
      ])
      setHabitStats(await statsRes.json())
      setTodayLogs(await logsRes.json())
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [selectedUserId, todayStr])

  useEffect(() => {
    setLoading(true)
    fetchData()
  }, [fetchData])

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 2500)
  }

  const getInput = (habitId) => logInputs[habitId] || { mins: '', notes: '' }

  const logMinutes = async (habitId, mins, notes) => {
    const m = parseInt(mins)
    if (!m || m <= 0) return
    setLogging(prev => ({ ...prev, [habitId]: true }))
    try {
      await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ habitId, userId: selectedUserId, date: todayStr, durationMinutes: m, notes: notes?.trim() || null })
      })
      setLogInputs(prev => ({ ...prev, [habitId]: { mins: '', notes: '' } }))
      await fetchData()
      showToast(`+${m} min logged`)
    } catch {
      showToast('Failed to log', 'error')
    } finally {
      setLogging(prev => ({ ...prev, [habitId]: false }))
    }
  }

  const deleteLog = async (logId) => {
    setDeletingLog(prev => ({ ...prev, [logId]: true }))
    try {
      await fetch(`/api/logs/${logId}`, { method: 'DELETE' })
      await fetchData()
    } catch {
      showToast('Failed to delete', 'error')
    } finally {
      setDeletingLog(prev => ({ ...prev, [logId]: false }))
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
      {/* Sticky header */}
      <div className="bg-white border-b border-slate-100 sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 pt-3 pb-0">
          {/* Top row: date + admin icon */}
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400 font-medium">{dateLabel}</span>
            <button
              onClick={goAdmin}
              className="text-slate-300 hover:text-slate-500 transition-colors p-1 -mr-1"
              aria-label="Admin"
            >
              <Settings2 className="w-4 h-4" />
            </button>
          </div>

          {/* User pills */}
          <div className="flex gap-2 overflow-x-auto pb-3" style={{ scrollbarWidth: 'none' }}>
            {users.map(u => {
              const active = u.id === selectedUserId
              const name = u.display_name || u.name
              return (
                <button
                  key={u.id}
                  onClick={() => onUserChange(u.id)}
                  className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold transition-all"
                  style={active ? { background: '#6366f1', color: 'white' } : { background: '#f1f5f9', color: '#64748b' }}
                >
                  <span
                    className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={active ? { background: 'rgba(255,255,255,0.25)' } : { background: '#e2e8f0' }}
                  >
                    {name[0].toUpperCase()}
                  </span>
                  {name}
                </button>
              )
            })}
          </div>

          {/* Tab bar */}
          <div className="flex gap-1 -mx-1">
            {TABS.map(({ id, label, Icon }) => {
              const active = tab === id
              return (
                <button
                  key={id}
                  onClick={() => setTab(id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-t-xl text-sm font-semibold transition-all flex-1 justify-center ${
                    active ? 'text-primary border-b-2 border-primary' : 'text-slate-400'
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
      <div className="max-w-lg mx-auto px-4 py-5">

        {/* ── TODAY ── */}
        {tab === 'today' && (
          <div className="space-y-4">
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
                      <div className="w-1 h-24 bg-slate-200 rounded-full" />
                      <div className="flex-1 space-y-3">
                        <div className="h-5 bg-slate-200 rounded w-1/3" />
                        <div className="h-3 bg-slate-100 rounded" />
                        <div className="h-10 bg-slate-100 rounded-xl" />
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
                const input = getInput(habit.id)
                const habitLogs = todayLogs.filter(l => l.habit_id === habit.id)

                return (
                  <div
                    key={habit.id}
                    className={`bg-white rounded-2xl shadow-card overflow-hidden border-2 transition-colors ${
                      done ? 'border-success/30' : partial ? 'border-warning/30' : 'border-transparent'
                    }`}
                  >
                    <div className="flex items-stretch">
                      <div className="w-1.5 flex-shrink-0" style={{ background: habit.color }} />
                      <div className="flex-1 p-4 space-y-3">
                        {/* Name + progress numbers */}
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-slate-900 text-lg leading-tight">{habit.name}</span>
                            {done && <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0" />}
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-sm flex-wrap">
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

                        {/* Logged entries */}
                        {habitLogs.length > 0 && (
                          <div className="space-y-1.5">
                            {habitLogs.map(log => (
                              <div key={log.id} className="flex items-center gap-2">
                                <div className="flex-1 flex items-center gap-2 bg-slate-50 rounded-xl px-3 py-2 text-sm min-w-0">
                                  {log.notes ? (
                                    <>
                                      <span className="text-slate-600 font-medium truncate flex-1">{log.notes}</span>
                                      <span className="text-slate-400 font-semibold flex-shrink-0">{log.duration_minutes} min</span>
                                    </>
                                  ) : (
                                    <span className="text-slate-600 font-semibold">{log.duration_minutes} min</span>
                                  )}
                                </div>
                                <button
                                  onClick={() => deleteLog(log.id)}
                                  disabled={deletingLog[log.id]}
                                  className="text-slate-300 hover:text-danger active:text-danger transition-colors p-1.5 flex-shrink-0 disabled:opacity-40"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Log form */}
                        <div className="space-y-2">
                          <input
                            type="text"
                            placeholder="What did you do? (optional)"
                            value={input.notes}
                            onChange={e => setLogInputs(prev => ({
                              ...prev,
                              [habit.id]: { ...getInput(habit.id), notes: e.target.value }
                            }))}
                            className="w-full px-3 py-2 text-sm bg-slate-50 border-2 border-slate-200 rounded-xl outline-none focus:border-primary transition-colors placeholder-slate-400"
                          />
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              inputMode="numeric"
                              placeholder="min"
                              value={input.mins}
                              onChange={e => setLogInputs(prev => ({
                                ...prev,
                                [habit.id]: { ...getInput(habit.id), mins: e.target.value }
                              }))}
                              onKeyDown={e => e.key === 'Enter' && logMinutes(habit.id, input.mins, input.notes)}
                              className="w-20 px-3 py-2 text-center font-bold text-base bg-slate-50 border-2 border-slate-200 rounded-xl outline-none focus:border-primary transition-colors"
                              min="1"
                            />
                            <QuickBtn label="+15" color={habit.color} onClick={() => logMinutes(habit.id, 15, input.notes)} loading={logging[habit.id]} />
                            <QuickBtn label="+30" color={habit.color} onClick={() => logMinutes(habit.id, 30, input.notes)} loading={logging[habit.id]} />
                            <button
                              onClick={() => logMinutes(habit.id, input.mins, input.notes)}
                              disabled={!input.mins || logging[habit.id]}
                              className="btn btn-sm ml-auto px-4 font-bold disabled:opacity-30 text-white"
                              style={{ background: habit.color }}
                            >
                              {logging[habit.id] ? '...' : 'Log'}
                            </button>
                          </div>
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
        )}

        {/* ── CALENDAR ── */}
        {tab === 'calendar' && (
          <CalendarView key={selectedUserId} userId={selectedUserId} />
        )}

        {/* ── STATS ── */}
        {tab === 'stats' && (
          <StatsView key={selectedUserId} userId={selectedUserId} />
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 px-5 py-3 rounded-2xl font-semibold text-sm shadow-lg z-50 ${
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
