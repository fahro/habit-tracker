import { useState, useEffect, useRef } from 'react'
import { X, Clock } from 'lucide-react'

export default function LogModal({ habit, userId, date, onSave, onClose }) {
  const [minutes, setMinutes] = useState('')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef(null)

  useEffect(() => {
    // Focus input on mount
    setTimeout(() => inputRef.current?.focus(), 100)
  }, [])

  // Close on backdrop click
  const handleBackdrop = (e) => {
    if (e.target === e.currentTarget) onClose()
  }

  const handleSave = async () => {
    const mins = parseInt(minutes)
    if (!mins || mins <= 0) { setError('Enter a valid number of minutes'); return }
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          habitId: habit.id,
          userId,
          date,
          durationMinutes: mins,
          notes: notes.trim() || null
        })
      })
      if (!res.ok) {
        const d = await res.json()
        setError(d.error || 'Failed to save')
        return
      }
      onSave()
    } catch {
      setError('Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const quickValues = [15, 30, 45, 60, 90]
  const dateLabel = new Date(date + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric'
  })

  return (
    <div className="modal-backdrop" onClick={handleBackdrop}>
      <div className="modal-sheet">
        <div className="modal-handle" />

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full" style={{ background: habit.color }} />
            <div>
              <h3 className="font-bold text-slate-900 text-lg leading-tight">{habit.name}</h3>
              <p className="text-xs text-slate-500 mt-0.5">{dateLabel}</p>
            </div>
          </div>
          <button onClick={onClose} className="btn btn-secondary btn-icon">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="modal-scroll px-5 pb-8 space-y-5">
          {/* Minutes input */}
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 block">
              Minutes spent
            </label>
            <div className="relative">
              <input
                ref={inputRef}
                type="number"
                inputMode="numeric"
                pattern="[0-9]*"
                className="input text-3xl font-bold text-center py-5"
                value={minutes}
                onChange={e => { setMinutes(e.target.value); setError('') }}
                placeholder="0"
                min="1"
                onKeyDown={e => e.key === 'Enter' && handleSave()}
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1 text-slate-400">
                <Clock className="w-4 h-4" />
                <span className="text-sm font-medium">min</span>
              </div>
            </div>

            {/* Goal hint */}
            <p className="text-xs text-slate-400 text-center mt-2">
              Daily minimum: <span className="font-semibold text-slate-600">{habit.daily_min_minutes} min</span>
            </p>
          </div>

          {/* Quick values */}
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 block">
              Quick select
            </label>
            <div className="flex gap-2 flex-wrap">
              {quickValues.map(v => (
                <button
                  key={v}
                  onClick={() => { setMinutes(v.toString()); setError('') }}
                  className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    minutes === v.toString()
                      ? 'text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                  style={minutes === v.toString() ? { background: habit.color } : {}}
                >
                  {v}m
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 block">
              Notes <span className="normal-case font-normal">(optional)</span>
            </label>
            <input
              type="text"
              className="input"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="e.g. Chapter 3, Level 5..."
              onKeyDown={e => e.key === 'Enter' && handleSave()}
            />
          </div>

          {error && (
            <p className="text-sm text-danger font-medium text-center">{error}</p>
          )}

          {/* Save button */}
          <button
            onClick={handleSave}
            disabled={saving || !minutes}
            className="btn btn-primary w-full text-base py-4"
          >
            {saving ? 'Saving...' : `Log ${minutes || '0'} minutes`}
          </button>
        </div>
      </div>
    </div>
  )
}
