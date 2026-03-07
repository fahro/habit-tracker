import { useState, useEffect } from 'react'
import { X, Check } from 'lucide-react'

const PRESET_COLORS = [
  '#6366f1', '#3b82f6', '#06b6d4', '#14b8a6',
  '#22c55e', '#84cc16', '#eab308', '#f97316',
  '#ef4444', '#ec4899', '#a855f7', '#f43f5e',
]

export default function HabitModal({ userId, habit, onSave, onClose }) {
  const [name, setName] = useState('')
  const [color, setColor] = useState('#6366f1')
  const [dailyMin, setDailyMin] = useState('30')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (habit) {
      setName(habit.name)
      setColor(habit.color || '#6366f1')
      setDailyMin(habit.daily_min_minutes?.toString() || '30')
    }
  }, [habit])

  const handleBackdrop = (e) => {
    if (e.target === e.currentTarget) onClose()
  }

  const handleSave = async () => {
    if (!name.trim()) { setError('Habit name is required'); return }
    const mins = parseInt(dailyMin)
    if (!mins || mins <= 0) { setError('Daily minimum must be greater than 0'); return }

    setSaving(true)
    setError('')
    try {
      const url = habit ? `/api/habits/${habit.id}` : '/api/habits'
      const method = habit ? 'PUT' : 'POST'
      const body = habit
        ? { name: name.trim(), color, dailyMinMinutes: mins }
        : { userId, name: name.trim(), color, dailyMinMinutes: mins }

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

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4">
          <h3 className="font-bold text-slate-900 text-lg">
            {habit ? 'Edit Habit' : 'New Habit'}
          </h3>
          <button onClick={onClose} className="btn btn-secondary btn-icon">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="modal-scroll px-5 pb-8 space-y-6">
          {/* Name */}
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 block">
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
          </div>

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

          {/* Daily minimum */}
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 block">
              Daily Minimum (minutes)
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
                  onClick={() => { setDailyMin(v.toString()); setError('') }}
                  className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${
                    dailyMin === v.toString()
                      ? 'text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                  style={dailyMin === v.toString() ? { background: color } : {}}
                >
                  {v}m
                </button>
              ))}
            </div>

            <p className="text-xs text-slate-400 mt-3">
              Missing this minimum for 2+ consecutive days will count as a penalty.
            </p>
          </div>

          {/* Preview */}
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 block">
              Preview
            </label>
            <div className="card overflow-hidden">
              <div className="flex items-stretch">
                <div className="w-1.5" style={{ background: color }} />
                <div className="p-4 flex-1">
                  <div className="font-semibold text-slate-900">{name || 'Habit Name'}</div>
                  <div className="text-sm text-slate-500 mt-0.5">Min {dailyMin || 0} min/day</div>
                  <div className="progress-bar mt-3">
                    <div className="progress-fill w-0" style={{ background: color }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {error && (
            <p className="text-sm text-danger font-medium text-center">{error}</p>
          )}

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
