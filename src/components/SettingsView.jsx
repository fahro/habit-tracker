import { useState } from 'react'
import { UserCircle, Plus, Edit2, Trash2, Check, X } from 'lucide-react'

export default function SettingsView({ users, selectedUserId, onUsersUpdated, onUserChange }) {
  const [showAddUser, setShowAddUser] = useState(false)
  const [newName, setNewName] = useState('')
  const [newDisplayName, setNewDisplayName] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [editingUser, setEditingUser] = useState(null)
  const [editDisplayName, setEditDisplayName] = useState('')
  const [deletingId, setDeletingId] = useState(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState(null)

  const handleAddUser = async () => {
    if (!newName.trim()) { setError('Name is required'); return }
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName.trim(), displayName: newDisplayName.trim() || newName.trim() })
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Failed to create user'); return }
      setNewName('')
      setNewDisplayName('')
      setShowAddUser(false)
      await onUsersUpdated()
      onUserChange(data.id)
    } catch {
      setError('Failed to create user')
    } finally {
      setSaving(false)
    }
  }

  const handleUpdateDisplayName = async (userId) => {
    if (!editDisplayName.trim()) return
    try {
      await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayName: editDisplayName.trim() })
      })
      setEditingUser(null)
      await onUsersUpdated()
    } catch {
      console.error('Failed to update user')
    }
  }

  const handleDelete = async (userId) => {
    setDeletingId(userId)
    try {
      const res = await fetch(`/api/users/${userId}`, { method: 'DELETE' })
      if (!res.ok) {
        const d = await res.json()
        alert(d.error || 'Failed to delete user')
        return
      }
      setConfirmDeleteId(null)
      if (selectedUserId === userId) {
        const remaining = users.filter(u => u.id !== userId)
        if (remaining.length > 0) onUserChange(remaining[0].id)
      }
      await onUsersUpdated()
    } catch {
      alert('Failed to delete user')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="space-y-6 fade-in">
      <div className="pt-1">
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
      </div>

      {/* User management */}
      <div>
        <p className="section-header">Users</p>
        <div className="card overflow-hidden">
          {users.map((user, i) => (
            <div key={user.id}>
              {i > 0 && <div className="h-px bg-slate-100 mx-4" />}
              <div className="p-4">
                {editingUser === user.id ? (
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-500 mb-1 block">Display Name</label>
                      <input
                        className="input text-base"
                        value={editDisplayName}
                        onChange={e => setEditDisplayName(e.target.value)}
                        autoFocus
                        onKeyDown={e => e.key === 'Enter' && handleUpdateDisplayName(user.id)}
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUpdateDisplayName(user.id)}
                        className="btn btn-primary btn-sm flex-1"
                      >
                        <Check className="w-4 h-4" /> Save
                      </button>
                      <button
                        onClick={() => setEditingUser(null)}
                        className="btn btn-secondary btn-sm flex-1"
                      >
                        <X className="w-4 h-4" /> Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${user.id === selectedUserId ? 'bg-primary' : 'bg-slate-100'}`}>
                      <UserCircle className={`w-6 h-6 ${user.id === selectedUserId ? 'text-white' : 'text-slate-400'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-slate-900 text-sm truncate">
                        {user.display_name || user.name}
                      </div>
                      <div className="text-xs text-slate-400 truncate">@{user.name}</div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {user.id !== selectedUserId && (
                        <button
                          onClick={() => onUserChange(user.id)}
                          className="text-xs font-semibold text-primary bg-primary/10 px-2.5 py-1.5 rounded-lg"
                        >
                          Switch
                        </button>
                      )}
                      <button
                        onClick={() => { setEditingUser(user.id); setEditDisplayName(user.display_name || user.name) }}
                        className="btn btn-icon btn-secondary"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      {confirmDeleteId === user.id ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleDelete(user.id)}
                            disabled={deletingId === user.id}
                            className="text-xs font-semibold text-danger bg-red-50 px-2.5 py-1.5 rounded-lg"
                          >
                            {deletingId === user.id ? '...' : 'Delete'}
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(null)}
                            className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1.5 rounded-lg"
                          >
                            No
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmDeleteId(user.id)}
                          disabled={users.length === 1}
                          className="btn btn-icon btn-secondary disabled:opacity-30"
                        >
                          <Trash2 className="w-4 h-4 text-danger" />
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Add user row */}
          {showAddUser ? (
            <div className="p-4 border-t border-slate-100 space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-500 mb-1 block">Username (unique)</label>
                <input
                  className="input text-base"
                  value={newName}
                  onChange={e => { setNewName(e.target.value); setError('') }}
                  placeholder="e.g. john"
                  autoFocus
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 mb-1 block">Display Name (optional)</label>
                <input
                  className="input text-base"
                  value={newDisplayName}
                  onChange={e => setNewDisplayName(e.target.value)}
                  placeholder="e.g. John"
                />
              </div>
              {error && <p className="text-sm text-danger font-medium">{error}</p>}
              <div className="flex gap-2">
                <button
                  onClick={handleAddUser}
                  disabled={saving}
                  className="btn btn-primary btn-sm flex-1"
                >
                  {saving ? 'Creating...' : 'Create User'}
                </button>
                <button
                  onClick={() => { setShowAddUser(false); setNewName(''); setNewDisplayName(''); setError('') }}
                  className="btn btn-secondary btn-sm flex-1"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="p-3 border-t border-slate-100">
              <button
                onClick={() => setShowAddUser(true)}
                className="w-full flex items-center gap-2 text-sm font-semibold text-primary py-2 px-3 rounded-xl hover:bg-primary/5 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add User
              </button>
            </div>
          )}
        </div>
      </div>

      {/* About */}
      <div>
        <p className="section-header">About</p>
        <div className="card p-4">
          <div className="space-y-2">
            <InfoRow label="App" value="Habit Tracker" />
            <InfoRow label="Penalty Rule" value="2+ consecutive missed days" />
            <InfoRow label="Data" value="Stored locally on server" />
          </div>
        </div>
      </div>
    </div>
  )
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="text-sm font-medium text-slate-800">{value}</span>
    </div>
  )
}
