import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, CheckCircle2, XCircle, MinusCircle, Clock } from 'lucide-react'

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]
const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function CalendarView({ userId }) {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())
  const [calData, setCalData] = useState([])
  const [habits, setHabits] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedDay, setSelectedDay] = useState(null)
  const [dayDetail, setDayDetail] = useState(null)
  const [loadingDetail, setLoadingDetail] = useState(false)

  const fetchData = async () => {
    if (!userId) return
    setLoading(true)
    try {
      const [calRes, habitsRes] = await Promise.all([
        fetch(`/api/stats/calendar?userId=${userId}&year=${year}&month=${month}`),
        fetch(`/api/habits?userId=${userId}`)
      ])
      setCalData(await calRes.json())
      setHabits(await habitsRes.json())
    } catch (err) {
      console.error('Failed to fetch calendar:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    setSelectedDay(null)
    setDayDetail(null)
  }, [userId, year, month])

  const fetchDayDetail = async (date) => {
    setLoadingDetail(true)
    try {
      const res = await fetch(`/api/logs?userId=${userId}&date=${date}`)
      setDayDetail(await res.json())
    } catch {
      setDayDetail([])
    } finally {
      setLoadingDetail(false)
    }
  }

  const handleDayClick = (dateStr) => {
    if (selectedDay === dateStr) {
      setSelectedDay(null)
      setDayDetail(null)
    } else {
      setSelectedDay(dateStr)
      fetchDayDetail(dateStr)
    }
  }

  const prevMonth = () => {
    if (month === 0) { setYear(y => y - 1); setMonth(11) }
    else setMonth(m => m - 1)
  }

  const nextMonth = () => {
    const nextIsAfterNow = (year === now.getFullYear() && month >= now.getMonth())
    if (nextIsAfterNow) return
    if (month === 11) { setYear(y => y + 1); setMonth(0) }
    else setMonth(m => m + 1)
  }

  const isNextDisabled = year === now.getFullYear() && month >= now.getMonth()
  const today = now.toISOString().split('T')[0]

  // Build calendar grid
  const firstDay = new Date(year, month, 1)
  const startPad = firstDay.getDay() // 0=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const dataMap = new Map((calData || []).map(d => [d.date, d]))

  const cells = []
  for (let i = 0; i < startPad; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    cells.push({ d, dateStr, data: dataMap.get(dateStr) })
  }

  // Monthly summary
  const activeDays = calData.filter(d => d.hasActivity).length
  const perfectDays = calData.filter(d => d.allMet && d.habitsTotal > 0).length

  return (
    <div className="space-y-4 fade-in">
      <div className="pt-1">
        <h1 className="text-2xl font-bold text-slate-900">Calendar</h1>
        <p className="text-slate-500 text-sm mt-0.5">Monthly habit overview</p>
      </div>

      {/* Month navigation */}
      <div className="card p-4">
        <div className="flex items-center justify-between mb-4">
          <button onClick={prevMonth} className="btn btn-secondary btn-icon">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="text-center">
            <div className="font-bold text-slate-900 text-lg">
              {MONTH_NAMES[month]} {year}
            </div>
            {!loading && (
              <div className="text-xs text-slate-500 mt-0.5">
                {perfectDays} perfect · {activeDays} active days
              </div>
            )}
          </div>
          <button onClick={nextMonth} disabled={isNextDisabled} className="btn btn-secondary btn-icon disabled:opacity-30">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Day labels */}
        <div className="grid grid-cols-7 mb-1">
          {DAY_LABELS.map(d => (
            <div key={d} className="text-center text-xs font-semibold text-slate-400 py-1">{d}</div>
          ))}
        </div>

        {/* Calendar grid */}
        {loading ? (
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: 35 }).map((_, i) => (
              <div key={i} className="aspect-square rounded-xl bg-slate-100 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-1">
            {cells.map((cell, i) => {
              if (!cell) return <div key={`pad-${i}`} />
              const { d, dateStr, data } = cell
              const isToday = dateStr === today
              const isFuture = dateStr > today
              const isSelected = selectedDay === dateStr

              let bgClass = 'bg-slate-50'
              let dotColor = null

              if (!isFuture && data) {
                if (data.allMet && data.habitsTotal > 0) {
                  bgClass = 'bg-green-50'
                  dotColor = '#22c55e'
                } else if (data.anyMet) {
                  bgClass = 'bg-amber-50'
                  dotColor = '#f59e0b'
                } else if (data.hasActivity) {
                  bgClass = 'bg-red-50'
                  dotColor = '#ef4444'
                } else {
                  bgClass = 'bg-slate-50'
                  dotColor = '#cbd5e1'
                }
              }

              return (
                <button
                  key={dateStr}
                  onClick={() => !isFuture && handleDayClick(dateStr)}
                  disabled={isFuture}
                  className={`aspect-square rounded-xl flex flex-col items-center justify-center gap-0.5 transition-all
                    ${isFuture ? 'opacity-20 cursor-not-allowed' : 'cursor-pointer active:scale-90'}
                    ${bgClass}
                    ${isSelected ? 'ring-2 ring-primary ring-offset-1' : ''}
                    ${isToday ? 'ring-2 ring-primary' : ''}
                  `}
                >
                  <span className={`text-sm leading-none font-semibold ${isToday ? 'text-primary' : 'text-slate-700'}`}>
                    {d}
                  </span>
                  {dotColor && (
                    <div className="cal-dot" style={{ background: dotColor }} />
                  )}
                </button>
              )
            })}
          </div>
        )}

        {/* Legend */}
        <div className="flex items-center justify-center gap-4 mt-4 pt-3 border-t border-slate-100">
          <LegendItem color="#22c55e" label="All done" />
          <LegendItem color="#f59e0b" label="Partial" />
          <LegendItem color="#ef4444" label="Missed" />
          <LegendItem color="#cbd5e1" label="None" />
        </div>
      </div>

      {/* Day detail */}
      {selectedDay && (
        <div className="card p-4 fade-in">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-slate-900">
              {new Date(selectedDay + 'T12:00:00').toLocaleDateString('en-US', {
                weekday: 'long', month: 'long', day: 'numeric'
              })}
            </h3>
            <button
              onClick={() => { setSelectedDay(null); setDayDetail(null) }}
              className="text-slate-400 hover:text-slate-600 text-sm font-medium"
            >
              Close
            </button>
          </div>

          {loadingDetail ? (
            <div className="space-y-2">
              {[1, 2].map(i => <div key={i} className="h-10 bg-slate-100 rounded-xl animate-pulse" />)}
            </div>
          ) : (
            <DayDetail
              date={selectedDay}
              logs={dayDetail || []}
              habits={habits}
              calData={dataMap.get(selectedDay)}
            />
          )}
        </div>
      )}
    </div>
  )
}

function DayDetail({ date, logs, habits, calData }) {
  if (!logs || logs.length === 0) {
    return (
      <div className="text-center py-6 text-slate-400">
        <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No activity logged</p>
      </div>
    )
  }

  // Group logs by habit
  const byHabit = {}
  for (const log of logs) {
    if (!byHabit[log.habit_id]) {
      byHabit[log.habit_id] = { logs: [], total: 0, habitName: log.habit_name, habitColor: log.habit_color }
    }
    byHabit[log.habit_id].logs.push(log)
    byHabit[log.habit_id].total += log.duration_minutes
  }

  return (
    <div className="space-y-3">
      {Object.values(byHabit).map(({ logs: hLogs, total, habitName, habitColor }) => {
        const habit = habits.find(h => h.name === habitName)
        const metGoal = habit && total >= habit.daily_min_minutes
        return (
          <div key={habitName} className="flex items-start gap-3">
            <div className="w-2 h-2 rounded-full mt-2 flex-shrink-0" style={{ background: habitColor }} />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium text-slate-800 text-sm">{habitName}</span>
                {metGoal
                  ? <CheckCircle2 className="w-4 h-4 text-success" />
                  : habit
                    ? <MinusCircle className="w-4 h-4 text-warning" />
                    : null
                }
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                {total}m logged
                {habit && ` · goal ${habit.daily_min_minutes}m`}
              </div>
              {hLogs.length > 1 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {hLogs.map(l => (
                    <span key={l.id} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                      {l.duration_minutes}m{l.notes ? ` · ${l.notes}` : ''}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )
      })}

      {calData && (
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>{calData.habitsMetCount}/{calData.habitsTotal} habits met goal</span>
          <span>{calData.totalMinutes}m total</span>
        </div>
      )}
    </div>
  )
}

function LegendItem({ color, label }) {
  return (
    <div className="flex items-center gap-1.5 text-xs text-slate-500">
      <div className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
      {label}
    </div>
  )
}
