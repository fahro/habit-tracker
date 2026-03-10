import { useState, useEffect } from 'react'
import { Flame, Clock, CalendarCheck, AlertTriangle, TrendingUp } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from 'recharts'

export default function StatsView({ userId }) {
  const [habits, setHabits] = useState([])
  const [allStats, setAllStats] = useState({})
  const [loading, setLoading] = useState(true)
  const [selectedHabitId, setSelectedHabitId] = useState('all')

  const fetchStats = async () => {
    if (!userId) return
    try {
      const habitsRes = await fetch(`/api/habits?userId=${userId}`)
      const habitsData = await habitsRes.json()
      setHabits(habitsData)

      const statsResults = await Promise.allSettled(
        habitsData.map(h =>
          fetch(`/api/stats/habit/${h.id}?days=30`).then(r => r.json())
        )
      )
      const map = {}
      habitsData.forEach((h, i) => {
        if (statsResults[i].status === 'fulfilled') {
          map[h.id] = statsResults[i].value
        }
      })
      setAllStats(map)
    } catch (err) {
      console.error('Failed to fetch stats:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchStats() }, [userId])

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="pt-1 h-12 bg-slate-100 rounded-xl animate-pulse" />
        <div className="grid grid-cols-2 gap-3">
          {[1,2,3,4].map(i => <div key={i} className="card h-24 animate-pulse" />)}
        </div>
        <div className="card h-56 animate-pulse" />
      </div>
    )
  }

  if (habits.length === 0) {
    return (
      <div className="space-y-4">
        <div className="pt-1">
          <h1 className="text-2xl font-bold text-slate-900">Stats</h1>
        </div>
        <div className="card p-8 text-center">
          <TrendingUp className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">No habits tracked yet.</p>
        </div>
      </div>
    )
  }

  const selectedHabit = habits.find(h => h.id === parseInt(selectedHabitId))
  const selectedStats = selectedHabitId === 'all'
    ? aggregateStats(allStats, habits)
    : allStats[parseInt(selectedHabitId)]

  const chartData = buildChartData(selectedHabitId, allStats, habits)
  const dailyMin = selectedHabit?.daily_min_minutes

  return (
    <div className="space-y-4 fade-in">
      <div className="pt-1">
        <h1 className="text-2xl font-bold text-slate-900">Stats</h1>
        <p className="text-slate-500 text-sm mt-0.5">Last 30 days</p>
      </div>

      {/* Habit filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4">
        <TabChip
          label="All Habits"
          active={selectedHabitId === 'all'}
          onClick={() => setSelectedHabitId('all')}
          color="#6366f1"
        />
        {habits.map(h => (
          <TabChip
            key={h.id}
            label={h.name}
            active={selectedHabitId === h.id.toString()}
            onClick={() => setSelectedHabitId(h.id.toString())}
            color={h.color}
          />
        ))}
      </div>

      {/* Stat cards */}
      {selectedStats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard
            icon={<Flame className="w-5 h-5 text-orange-400" />}
            label="Current Streak"
            value={selectedStats.currentStreak}
            suffix="days"
            sub={`Best: ${selectedStats.longestStreak}d`}
            bg="bg-orange-50"
          />
          <StatCard
            icon={<Clock className="w-5 h-5 text-primary" />}
            label="Total Time"
            value={formatMinutes(selectedStats.totalMinutes)}
            suffix=""
            sub={`${selectedStats.totalLogs || selectedStats.daysActive} entries`}
            bg="bg-indigo-50"
          />
          <StatCard
            icon={<CalendarCheck className="w-5 h-5 text-success" />}
            label="Active Days"
            value={selectedStats.daysActive}
            suffix="days"
            sub="days with activity"
            bg="bg-green-50"
          />
          <StatCard
            icon={<AlertTriangle className="w-5 h-5 text-danger" />}
            label="Penalties"
            value={selectedStats.totalPenalties || 0}
            suffix=""
            sub="2+ consecutive misses"
            bg={selectedStats.totalPenalties > 0 ? "bg-red-50" : "bg-slate-50"}
            valueColor={selectedStats.totalPenalties > 0 ? "text-danger" : "text-slate-600"}
          />
        </div>
      )}

      {/* Bar chart */}
      {chartData.length > 0 && (
        <div className="card p-4">
          <h3 className="font-semibold text-slate-800 mb-4 text-sm">Daily Activity</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }}
                axisLine={false}
                tickLine={false}
                interval={Math.floor(chartData.length / 6)}
              />
              <YAxis
                tick={{ fontSize: 10, fill: '#94a3b8' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.1)', fontSize: 13 }}
                formatter={(val) => [`${val} min`, 'Duration']}
                labelStyle={{ fontWeight: 600, color: '#0f172a' }}
              />
              {dailyMin && (
                <ReferenceLine
                  y={dailyMin}
                  stroke="#6366f1"
                  strokeDasharray="4 3"
                  strokeWidth={1.5}
                  label={{ value: `${dailyMin}m`, position: 'right', fill: '#6366f1', fontSize: 10, fontWeight: 700 }}
                />
              )}
              <Bar dataKey="minutes" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, i) => (
                  <Cell
                    key={i}
                    fill={entry.metGoal ? '#22c55e' : entry.minutes > 0 ? '#f59e0b' : '#e2e8f0'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          <div className="flex items-center justify-center gap-4 mt-3 pt-3 border-t border-slate-100">
            <LegendDot color="#22c55e" label="Goal met" />
            <LegendDot color="#f59e0b" label="Partial" />
            <LegendDot color="#e2e8f0" label="None" />
          </div>
        </div>
      )}

      {/* Per-habit breakdown (when All is selected) */}
      {selectedHabitId === 'all' && habits.length > 1 && (
        <div className="card p-4">
          <h3 className="font-semibold text-slate-800 mb-3 text-sm">Per Habit</h3>
          <div className="space-y-3">
            {habits.map(h => {
              const s = allStats[h.id]
              if (!s) return null
              return (
                <div key={h.id} className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: h.color }} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-slate-800 truncate">{h.name}</span>
                      <span className="text-slate-500 flex-shrink-0 ml-2 font-semibold">
                        🔥 {s.currentStreak}d
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                      <span>{formatMinutes(s.totalMinutes)}</span>
                      <span>·</span>
                      <span>{s.daysActive} days</span>
                      {s.totalPenalties > 0 && (
                        <>
                          <span>·</span>
                          <span className="text-danger">{s.totalPenalties} penalties</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

function TabChip({ label, active, onClick, color }) {
  return (
    <button
      onClick={onClick}
      className={`flex-shrink-0 px-3.5 py-2 rounded-full text-sm font-semibold transition-all ${
        active
          ? 'text-white shadow-sm'
          : 'bg-white text-slate-500 border border-slate-200'
      }`}
      style={active ? { background: color } : {}}
    >
      {label}
    </button>
  )
}

function StatCard({ icon, label, value, suffix, sub, bg, valueColor = 'text-slate-900' }) {
  return (
    <div className={`card p-4 ${bg}`}>
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</span>
      </div>
      <div className={`text-2xl font-bold ${valueColor}`}>
        {value}<span className="text-base font-medium text-slate-400 ml-1">{suffix}</span>
      </div>
      {sub && <div className="text-xs text-slate-400 mt-1">{sub}</div>}
    </div>
  )
}

function LegendDot({ color, label }) {
  return (
    <div className="flex items-center gap-1.5 text-xs text-slate-500">
      <div className="w-2.5 h-2.5 rounded-sm" style={{ background: color }} />
      {label}
    </div>
  )
}

function aggregateStats(allStats, habits) {
  const values = Object.values(allStats)
  if (values.length === 0) return null

  const maxStreak = Math.max(...values.map(s => s.currentStreak || 0))
  const maxLongest = Math.max(...values.map(s => s.longestStreak || 0))
  const totalMinutes = values.reduce((sum, s) => sum + (s.totalMinutes || 0), 0)
  const totalLogs = values.reduce((sum, s) => sum + (s.totalLogs || 0), 0)
  const daysActive = Math.max(...values.map(s => s.daysActive || 0))
  const totalPenalties = values.reduce((sum, s) => sum + (s.totalPenalties || 0), 0)

  return { currentStreak: maxStreak, longestStreak: maxLongest, totalMinutes, totalLogs, daysActive, totalPenalties }
}

function buildChartData(selectedHabitId, allStats, habits) {
  if (selectedHabitId !== 'all') {
    const stats = allStats[parseInt(selectedHabitId)]
    if (!stats?.dailyStats) return []
    const habit = habits.find(h => h.id === parseInt(selectedHabitId))
    return (stats.dailyStats.stats || []).map(day => ({
      label: new Date(day.date).getDate().toString(),
      minutes: day.totalMinutes,
      metGoal: day.metGoal,
      dailyMin: habit?.daily_min_minutes
    }))
  }

  // All: sum up minutes per day across habits
  if (habits.length === 0) return []
  const firstStats = Object.values(allStats)[0]
  if (!firstStats?.dailyStats) return []

  const days = firstStats.dailyStats.stats || []
  return days.map(day => {
    let totalMins = 0
    for (const h of habits) {
      const s = allStats[h.id]
      if (s?.dailyStats?.stats) {
        const d = s.dailyStats.stats.find(sd => sd.date === day.date)
        if (d) totalMins += d.totalMinutes
      }
    }
    const totalGoal = habits.reduce((sum, h) => sum + h.daily_min_minutes, 0)
    return {
      label: new Date(day.date).getDate().toString(),
      minutes: totalMins,
      metGoal: totalGoal > 0 && totalMins >= totalGoal
    }
  })
}

function formatMinutes(mins) {
  if (!mins || mins === 0) return '0m'
  const h = Math.floor(mins / 60)
  const m = mins % 60
  if (h > 0 && m > 0) return `${h}h ${m}m`
  if (h > 0) return `${h}h`
  return `${m}m`
}
