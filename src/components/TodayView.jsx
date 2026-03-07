import { useState, useEffect } from 'react'
import { Flame, Plus, CheckCircle2, AlertTriangle, Clock, ChevronRight } from 'lucide-react'
import LogModal from './LogModal'

export default function TodayView({ userId, onRefresh }) {
  const [habitStats, setHabitStats] = useState([])
  const [loading, setLoading] = useState(true)
  const [logTarget, setLogTarget] = useState(null) // habit to log for
  const [selectedHabit, setSelectedHabit] = useState(null) // habit for detail view

  const today = new Date()
  const dateLabel = today.toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric'
  })
  const todayStr = today.toISOString().split('T')[0]

  const fetchStats = async () => {
    if (!userId) return
    try {
      const res = await fetch(`/api/stats/today?userId=${userId}`)
      const data = await res.json()
      setHabitStats(data)
    } catch (err) {
      console.error('Failed to fetch today stats:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchStats() }, [userId])

  const habitsComplete = habitStats.filter(h => h.today.metGoal).length
  const totalMinutes = habitStats.reduce((sum, h) => sum + h.today.totalMinutes, 0)
  const totalGoalMinutes = habitStats.reduce((sum, h) => sum + h.habit.daily_min_minutes, 0)

  const handleLogSaved = () => {
    setLogTarget(null)
    fetchStats()
    onRefresh()
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="card p-5 animate-pulse">
            <div className="flex items-center gap-3">
              <div className="w-3 h-12 bg-slate-200 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-slate-200 rounded w-1/3" />
                <div className="h-3 bg-slate-200 rounded w-1/2" />
                <div className="h-2 bg-slate-200 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (habitStats.length === 0) {
    return (
      <div className="space-y-4">
        <TodayHeader dateLabel={dateLabel} />
        <div className="card p-8 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Plus className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="font-bold text-slate-800 text-lg mb-1">No habits yet</h3>
          <p className="text-slate-500 text-sm">Go to the Habits tab to create your first habit.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 fade-in">
      <TodayHeader dateLabel={dateLabel} />

      {/* Summary banner */}
      <div className="card p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold text-slate-900">
              {habitsComplete}/{habitStats.length}
              <span className="text-base font-medium text-slate-400 ml-1">habits done</span>
            </div>
            <div className="text-sm text-slate-500 mt-0.5">
              {formatMinutes(totalMinutes)} logged
              {totalGoalMinutes > 0 && ` · goal ${formatMinutes(totalGoalMinutes)}`}
            </div>
          </div>
          <div className="relative w-14 h-14">
            <ProgressRing
              percent={totalGoalMinutes > 0 ? Math.min(100, (totalMinutes / totalGoalMinutes) * 100) : 0}
              size={56}
              stroke={5}
              color="#6366f1"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-bold text-primary">
                {totalGoalMinutes > 0 ? Math.round(Math.min(100, (totalMinutes / totalGoalMinutes) * 100)) : 0}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Habit cards */}
      <div className="space-y-3">
        {habitStats.map(({ habit, today: todayData, streak }) => {
          const pct = todayData.progress
          const done = todayData.metGoal
          const hasActivity = todayData.totalMinutes > 0

          return (
            <div key={habit.id} className="card overflow-hidden">
              <div className="flex items-stretch">
                {/* Color bar */}
                <div
                  className="w-1.5 flex-shrink-0"
                  style={{ background: habit.color }}
                />

                <div className="flex-1 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-slate-900 text-base truncate">
                          {habit.name}
                        </span>
                        {done && (
                          <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" />
                        )}
                      </div>

                      <div className="flex items-center gap-3 mt-1 text-sm text-slate-500">
                        <span>
                          <span className={`font-semibold ${done ? 'text-success' : hasActivity ? 'text-warning' : 'text-slate-400'}`}>
                            {todayData.totalMinutes}m
                          </span>
                          <span> / {habit.daily_min_minutes}m min</span>
                        </span>
                        {streak > 0 && (
                          <span className="streak-badge">
                            <Flame className="w-3.5 h-3.5" />
                            {streak}
                          </span>
                        )}
                      </div>

                      {/* Progress bar */}
                      <div className="progress-bar mt-3">
                        <div
                          className="progress-fill"
                          style={{
                            width: `${pct}%`,
                            background: done ? '#22c55e' : hasActivity ? '#f59e0b' : habit.color
                          }}
                        />
                      </div>
                    </div>

                    {/* Log button */}
                    <button
                      onClick={() => setLogTarget(habit)}
                      className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all active:scale-90"
                      style={{ background: `${habit.color}18` }}
                    >
                      <Plus className="w-5 h-5" style={{ color: habit.color }} />
                    </button>
                  </div>

                  {/* Logs for today */}
                  {todayData.logCount > 0 && (
                    <button
                      onClick={() => setSelectedHabit(selectedHabit?.id === habit.id ? null : habit)}
                      className="mt-3 w-full flex items-center justify-between text-xs text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      <span>{todayData.logCount} {todayData.logCount === 1 ? 'entry' : 'entries'} today</span>
                      <ChevronRight className={`w-3.5 h-3.5 transition-transform ${selectedHabit?.id === habit.id ? 'rotate-90' : ''}`} />
                    </button>
                  )}

                  {/* Expanded log entries */}
                  {selectedHabit?.id === habit.id && (
                    <DayLogs habitId={habit.id} date={todayStr} onRefresh={fetchStats} />
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Warning for missed habits */}
      {habitStats.some(h => !h.today.metGoal && h.today.totalMinutes === 0) && (
        <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-2xl border border-amber-200">
          <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-800">Don't forget!</p>
            <p className="text-sm text-amber-700 mt-0.5">
              {habitStats.filter(h => !h.today.metGoal && h.today.totalMinutes === 0).length} habit
              {habitStats.filter(h => !h.today.metGoal && h.today.totalMinutes === 0).length > 1 ? 's' : ''} with no activity today.
              Missing 2 days in a row earns a penalty.
            </p>
          </div>
        </div>
      )}

      {logTarget && (
        <LogModal
          habit={logTarget}
          userId={userId}
          date={todayStr}
          onSave={handleLogSaved}
          onClose={() => setLogTarget(null)}
        />
      )}
    </div>
  )
}

function TodayHeader({ dateLabel }) {
  return (
    <div className="pt-1">
      <h1 className="text-2xl font-bold text-slate-900">Today</h1>
      <p className="text-slate-500 text-sm mt-0.5">{dateLabel}</p>
    </div>
  )
}

function DayLogs({ habitId, date, onRefresh }) {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/logs?habitId=${habitId}&date=${date}`)
      .then(r => r.json())
      .then(data => { setLogs(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [habitId, date])

  const deleteLog = async (id) => {
    await fetch(`/api/logs/${id}`, { method: 'DELETE' })
    setLogs(prev => prev.filter(l => l.id !== id))
    onRefresh()
  }

  if (loading) return <div className="mt-2 h-8 bg-slate-100 rounded animate-pulse" />

  return (
    <div className="mt-2 space-y-1.5 pt-2 border-t border-slate-100">
      {logs.map(log => (
        <div key={log.id} className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-slate-600">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>{log.duration_minutes}m</span>
            {log.notes && <span className="text-slate-400 truncate max-w-[160px]">· {log.notes}</span>}
          </div>
          <button
            onClick={() => deleteLog(log.id)}
            className="text-xs text-slate-400 hover:text-danger transition-colors px-2 py-0.5"
          >
            remove
          </button>
        </div>
      ))}
    </div>
  )
}

function ProgressRing({ percent, size, stroke, color }) {
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const offset = circ - (percent / 100) * circ

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#e2e8f0" strokeWidth={stroke} />
      <circle
        cx={size/2} cy={size/2} r={r}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        style={{ transition: 'stroke-dashoffset 0.4s ease' }}
      />
    </svg>
  )
}

function formatMinutes(mins) {
  if (mins === 0) return '0m'
  const h = Math.floor(mins / 60)
  const m = mins % 60
  if (h > 0 && m > 0) return `${h}h ${m}m`
  if (h > 0) return `${h}h`
  return `${m}m`
}
