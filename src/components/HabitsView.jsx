import { useState, useEffect } from 'react'
import { Plus, Flame, Clock, Edit2, Trash2, ToggleLeft, ToggleRight } from 'lucide-react'
import HabitModal from './HabitModal'

export default function HabitsView({ userId, onRefresh }) {
  const [habits, setHabits] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingHabit, setEditingHabit] = useState(null)
  const [deletingId, setDeletingId] = useState(null)
  const [habitStats, setHabitStats] = useState({})

  const fetchHabits = async () => {
    if (!userId) return
    try {
      const res = await fetch(`/api/habits?userId=${userId}&includeInactive=true`)
      const data = await res.json()
      setHabits(data)

      // Fetch stats for each habit in parallel
      const statsResults = await Promise.allSettled(
        data.map(h => fetch(`/api/stats/habit/${h.id}?days=30`).then(r => r.json()))
      )
      const statsMap = {}
      data.forEach((h, i) => {
        if (statsResults[i].status === 'fulfilled') {
          statsMap[h.id] = statsResults[i].value
        }
      })
      setHabitStats(statsMap)
    } catch (err) {
      console.error('Failed to fetch habits:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchHabits() }, [userId])

  const handleSaved = () => {
    setShowModal(false)
    setEditingHabit(null)
    fetchHabits()
    onRefresh()
  }

  const handleToggleActive = async (habit) => {
    await fetch(`/api/habits/${habit.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !habit.is_active })
    })
    fetchHabits()
    onRefresh()
  }

  const handleDelete = async (habitId) => {
    setDeletingId(habitId)
    await fetch(`/api/habits/${habitId}`, { method: 'DELETE' })
    setDeletingId(null)
    fetchHabits()
    onRefresh()
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2].map(i => (
          <div key={i} className="card p-5 animate-pulse">
            <div className="flex gap-3">
              <div className="w-3 h-16 bg-slate-200 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-slate-200 rounded w-1/3" />
                <div className="h-3 bg-slate-200 rounded w-1/4" />
                <div className="flex gap-3 mt-3">
                  <div className="h-8 bg-slate-200 rounded w-16" />
                  <div className="h-8 bg-slate-200 rounded w-16" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  const activeHabits = habits.filter(h => h.is_active)
  const archivedHabits = habits.filter(h => !h.is_active)

  return (
    <div className="space-y-4 fade-in">
      <div className="flex items-center justify-between pt-1">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Habits</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {activeHabits.length} active habit{activeHabits.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => { setEditingHabit(null); setShowModal(true) }}
          className="btn btn-primary btn-sm gap-1.5"
        >
          <Plus className="w-4 h-4" />
          Add Habit
        </button>
      </div>

      {habits.length === 0 && (
        <div className="card p-8 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Plus className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="font-bold text-slate-800 text-lg mb-1">No habits yet</h3>
          <p className="text-slate-500 text-sm mb-4">Create your first habit to start tracking.</p>
          <button
            className="btn btn-primary"
            onClick={() => { setEditingHabit(null); setShowModal(true) }}
          >
            <Plus className="w-4 h-4" />
            Create First Habit
          </button>
        </div>
      )}

      {/* Active habits */}
      {activeHabits.length > 0 && (
        <div className="space-y-3">
          {activeHabits.map(habit => (
            <HabitCard
              key={habit.id}
              habit={habit}
              stats={habitStats[habit.id]}
              onEdit={() => { setEditingHabit(habit); setShowModal(true) }}
              onToggle={() => handleToggleActive(habit)}
              onDelete={() => handleDelete(habit.id)}
              deleting={deletingId === habit.id}
            />
          ))}
        </div>
      )}

      {/* Archived */}
      {archivedHabits.length > 0 && (
        <div className="space-y-3">
          <p className="section-header mt-2">Archived</p>
          {archivedHabits.map(habit => (
            <HabitCard
              key={habit.id}
              habit={habit}
              stats={habitStats[habit.id]}
              onEdit={() => { setEditingHabit(habit); setShowModal(true) }}
              onToggle={() => handleToggleActive(habit)}
              onDelete={() => handleDelete(habit.id)}
              deleting={deletingId === habit.id}
              archived
            />
          ))}
        </div>
      )}

      {showModal && (
        <HabitModal
          userId={userId}
          habit={editingHabit}
          onSave={handleSaved}
          onClose={() => { setShowModal(false); setEditingHabit(null) }}
        />
      )}
    </div>
  )
}

function HabitCard({ habit, stats, onEdit, onToggle, onDelete, deleting, archived }) {
  const [confirmDelete, setConfirmDelete] = useState(false)

  return (
    <div className={`card overflow-hidden ${archived ? 'opacity-60' : ''}`}>
      <div className="flex items-stretch">
        <div className="w-1.5 flex-shrink-0" style={{ background: habit.color }} />
        <div className="flex-1 p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-slate-900 text-base">{habit.name}</div>
              <div className="text-sm text-slate-500 mt-0.5">
                Min {habit.daily_min_minutes} min/day
              </div>
            </div>

            <div className="flex items-center gap-1.5 flex-shrink-0">
              <button
                onClick={onToggle}
                className="btn-icon btn flex items-center justify-center text-slate-400 hover:text-primary transition-colors"
                title={archived ? 'Restore' : 'Archive'}
              >
                {archived
                  ? <ToggleLeft className="w-5 h-5" />
                  : <ToggleRight className="w-5 h-5 text-primary" />
                }
              </button>
              <button
                onClick={onEdit}
                className="btn-icon btn flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              {!confirmDelete ? (
                <button
                  onClick={() => setConfirmDelete(true)}
                  disabled={deleting}
                  className="btn-icon btn flex items-center justify-center text-slate-400 hover:text-danger transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              ) : (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => { onDelete(); setConfirmDelete(false) }}
                    disabled={deleting}
                    className="text-xs font-semibold text-danger bg-red-50 px-2.5 py-1.5 rounded-lg"
                  >
                    {deleting ? '...' : 'Delete'}
                  </button>
                  <button
                    onClick={() => setConfirmDelete(false)}
                    className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1.5 rounded-lg"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Stats row */}
          {stats && (
            <div className="flex items-center gap-4 mt-3 pt-3 border-t border-slate-100">
              <StatPill icon={<Flame className="w-3.5 h-3.5 text-orange-400" />} label={`${stats.currentStreak}d streak`} />
              <StatPill icon={<Clock className="w-3.5 h-3.5 text-slate-400" />} label={formatMinutes(stats.totalMinutes) + ' total'} />
              {stats.totalPenalties > 0 && (
                <StatPill
                  icon={<span className="text-xs">⚠️</span>}
                  label={`${stats.totalPenalties} penalty${stats.totalPenalties > 1 ? 's' : ''}`}
                  danger
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function StatPill({ icon, label, danger }) {
  return (
    <div className={`flex items-center gap-1.5 text-xs font-medium ${danger ? 'text-danger' : 'text-slate-500'}`}>
      {icon}
      <span>{label}</span>
    </div>
  )
}

function formatMinutes(mins) {
  if (!mins || mins === 0) return '0m'
  const h = Math.floor(mins / 60)
  const m = mins % 60
  if (h > 0 && m > 0) return `${h}h ${m}m`
  if (h > 0) return `${h}h`
  return `${m}m`
}
