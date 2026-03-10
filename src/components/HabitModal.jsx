import { useState, useEffect } from 'react'
import { X, Check } from 'lucide-react'

const PRESET_COLORS = [
  '#6366f1', '#3b82f6', '#06b6d4', '#14b8a6',
  '#22c55e', '#84cc16', '#eab308', '#f97316',
  '#ef4444', '#ec4899', '#a855f7', '#f43f5e',
]

export default function HabitModal({ userId, habit, onSave, onClose }) {
  const todayStr = new Date().toISOString().split('T')[0]
  const [name, setName] = useState('')
  const [color, setColor] = useState('#6366f1')
  const [dailyMin, setDailyMin] = useState('30')
  const [penaltyDays, setPenaltyDays] = useState('2')
  const [startDate, setStartDate] = useState(todayStr)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (habit) {
      setName(habit.name)
      setColor(habit.color || '#6366f1')
      setDailyMin(habit.daily_min_minutes?.toString() || '30')
      setPenaltyDays((habit.penalty_days || 2).toString())
      setStartDate(habit.start_date || todayStr)
    }
  }, [habit])

  const handleBackdrop = (e) => {
    if (e.target === e.currentTarget) onClose()
  }

  const handleSave = async () => {
    if (!name.trim()) { setError('Habit name is required'); return }
    const mins = parseInt(dailyMin)
    if (!mins || mins <= 0) { setError('Daily minimum must be greater than 0'); return }
    const pdays = parseInt(penaltyDays)
    if (!pdays || pdays < 1) { setError('Penalty days must be at least 1'); return }

    setSaving(true)
    setError('')
    try {
      const url = habit ? `/api/habits/${habit.id}` : '/api/habits'
      const method = habit ? 'PUT' : 'POST'
      const body = habit
        ? { name: name.trim(), color, dailyMinMinutes: mins, penaltyDays: pdays, startDate }
        : { userId, name: name.trim(), color, dailyMinMinutes: mins, penaltyDays: pdays, startDate }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      if (!res.ok) {
        const d = await res.json()
        setError(d.error || 'Failed to save habit')
        return
      }
      onSave()
    } catch {
      setError('Failed to save habit')
    } finally {
      setSaving(false)
    }
  }

  const quickMins = [15, 20, 30, 45, 60, 90]

  return (
    <div className="modal-backdrop" onClick={handleBackdrop}>
      <div className="modal-sheet">
        <div className="modal-handle" />

        {/* Fixed header — always visible, never scrolls away */}
        <div className="flex-shrink-0 px-5 pt-2 pb-4 border-b border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900 text-lg">
              {habit ? 'Edit Habit' : 'New Habit'}
            </h3>
            <button onClick={onClose} className="btn btn-secondary btn-icon">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Name input — pinned above the scroll area, always visible */}
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">
              Habit Name
            </label>
            <input
              type="text"
              className="input text-base"
              value={name}
              onChange={e => { setName(e.target.value); setError('') }}
              placeholder="e.g. Reading, Guitar, Exercise..."
              autoFocus
            />
            {error && <p className="text-sm text-danger font-medium mt-2">{error}</p>}
          </div>
        </div>

        {/* Scrollable settings below */}
        <div className="modal-scroll px-5 py-5 space-y-6">
          {/* Color */}
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3 block">
              Color
            </label>
            <div className="flex flex-wrap gap-3">
              {PRESET_COLORS.map(c => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className="color-swatch relative"
                  style={{
                    background: c,
                    borderColor: color === c ? 'white' : 'transparent',
                    boxShadow: color === c ? `0 0 0 3px ${c}` : 'none'
                  }}
                >
                  {color === c && (
                    <Check className="w-4 h-4 text-white absolute inset-0 m-auto" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Start date */}
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 block">
              Start Date
            </label>
            <input
              type="date"
              className="input text-base"
              value={startDate}
              max={todayStr}
              onChange={e => setStartDate(e.target.value)}
            />
            <p className="text-xs text-slate-400 mt-1.5">
              Days before this date won't count as missed.
            </p>
          </div>

          {/* Daily minimum */}
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 block">
              Daily Minimum
            </label>
            <div className="relative">
              <input
                type="number"
                inputMode="numeric"
                className="input text-xl font-bold text-center py-4"
                value={dailyMin}
                onChange={e => { setDailyMin(e.target.value); setError('') }}
                placeholder="30"
                min="1"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">
                min/day
              </div>
            </div>
            <div className="flex gap-2 flex-wrap mt-3">
              {quickMins.map(v => (
                <button
                  key={v}
                  onClick={() => setDailyMin(v.toString())}
                  className="px-3.5 py-2 rounded-xl text-sm font-semibold transition-all"
                  style={
                    dailyMin === v.toString()
                      ? { background: color, color: 'white' }
                      : { background: '#f1f5f9', color: '#475569' }
                  }
                >
                  {v}m
                </button>
              ))}
            </div>
          </div>

          {/* Penalty days */}
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 block">
              Penalty After Missed Days in a Row
            </label>
            <div className="flex gap-2">
              {[2, 3, 4, 5, 7].map(v => (
                <button
                  key={v}
                  onClick={() => setPenaltyDays(v.toString())}
                  className="flex-1 py-3 rounded-xl text-sm font-bold transition-all"
                  style={
                    penaltyDays === v.toString()
                      ? { background: '#ef4444', color: 'white' }
                      : { background: '#fef2f2', color: '#ef4444' }
                  }
                >
                  {v}d
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-400 mt-2">
              A penalty is recorded after missing {penaltyDays || 2} days in a row.
            </p>
          </div>

          {/* Preview */}
          <div className="card overflow-hidden">
            <div className="flex items-stretch">
              <div className="w-1.5" style={{ background: color }} />
              <div className="p-4 flex-1">
                <div className="font-semibold text-slate-900">{name || 'Habit Name'}</div>
                <div className="text-sm text-slate-500 mt-0.5">
                  Min {dailyMin || 0} min/day · penalty after {penaltyDays || 2} missed days
                </div>
                <div className="progress-bar mt-3">
                  <div className="progress-fill w-0" style={{ background: color }} />
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="btn btn-primary w-full text-base py-4"
          >
            {saving ? 'Saving...' : habit ? 'Save Changes' : 'Create Habit'}
          </button>
        </div>
      </div>
    </div>
  )
}
