import { useState } from 'react'
import { UserPlus, Users, Trash2, Edit2, Save, X } from 'lucide-react'

export default function UserManagement({ users, onUsersUpdated }) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [deletingUser, setDeletingUser] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    displayName: '',
    dailyGoalMinutes: 30
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const resetForm = () => {
    setFormData({
      name: '',
      displayName: '',
      dailyGoalMinutes: 30
    })
    setShowAddForm(false)
    setEditingUser(null)
    setError('')
  }

  const handleAddUser = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          displayName: formData.displayName.trim() || formData.name.trim(),
          dailyGoalMinutes: parseInt(formData.dailyGoalMinutes)
        })
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(true)
        resetForm()
        onUsersUpdated()
        
        setTimeout(() => setSuccess(false), 3000)
      } else {
        setError(data.error || 'Greška pri kreiranju korisnika')
      }
    } catch (error) {
      console.error('Error adding user:', error)
      setError('Greška pri kreiranju korisnika')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateUser = async (userId) => {
    setLoading(true)
    setError('')

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          dailyGoalMinutes: parseInt(formData.dailyGoalMinutes)
        })
      })

      if (response.ok) {
        setSuccess(true)
        resetForm()
        onUsersUpdated()
        
        setTimeout(() => setSuccess(false), 3000)
      } else {
        setError('Greška pri ažuriranju korisnika')
      }
    } catch (error) {
      console.error('Error updating user:', error)
      setError('Greška pri ažuriranju korisnika')
    } finally {
      setLoading(false)
    }
  }

  const startEdit = (user) => {
    setEditingUser(user.id)
    setFormData({
      name: user.name,
      displayName: user.display_name || user.name,
      dailyGoalMinutes: user.daily_goal_minutes
    })
    setShowAddForm(false)
  }

  const handleDeleteUser = async (userId) => {
    setLoading(true)
    setError('')

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(true)
        setDeletingUser(null)
        onUsersUpdated()
        
        setTimeout(() => setSuccess(false), 3000)
      } else {
        setError(data.error || 'Greška pri brisanju korisnika')
        setDeletingUser(null)
      }
    } catch (error) {
      console.error('Error deleting user:', error)
      setError('Greška pri brisanju korisnika')
      setDeletingUser(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Users className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold">Upravljanje Korisnicima</h2>
        </div>
        
        {!showAddForm && !editingUser && (
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            <span>Dodaj Korisnika</span>
          </button>
        )}
      </div>

      {/* Success Message */}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
          ✅ Uspješno sačuvano!
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
          ❌ {error}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deletingUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md mx-4 shadow-xl">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Potvrda Brisanja</h3>
                <p className="text-sm text-muted-foreground">Ova akcija se ne može poništiti</p>
              </div>
            </div>
            
            <div className="mb-6">
              <p className="text-sm mb-2">
                Da li ste sigurni da želite obrisati korisnika <strong>{deletingUser.display_name || deletingUser.name}</strong>?
              </p>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-3">
                <p className="text-sm text-yellow-800">
                  ⚠️ <strong>Upozorenje:</strong> Sve sesije ovog korisnika će biti trajno obrisane.
                </p>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => handleDeleteUser(deletingUser.id)}
                disabled={loading}
                className="flex-1 bg-red-600 text-white py-2 rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>{loading ? 'Brisanje...' : 'Obriši Korisnika'}</span>
              </button>
              
              <button
                onClick={() => setDeletingUser(null)}
                disabled={loading}
                className="px-6 py-2 border border-border rounded-lg hover:bg-secondary transition-colors disabled:opacity-50"
              >
                Otkaži
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add User Form */}
      {showAddForm && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-border">
          <h3 className="text-lg font-bold mb-4">Novi Korisnik</h3>
          
          <form onSubmit={handleAddUser} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Korisničko Ime *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Npr: fahro, marko, ana"
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
              <p className="text-xs text-muted-foreground mt-1">
                Jedinstveno ime koje će se koristiti za identifikaciju
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Prikazno Ime
              </label>
              <input
                type="text"
                value={formData.displayName}
                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                placeholder="Npr: Fahro Mehmedović"
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Opciono - ako je prazno, koristiće se korisničko ime
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Dnevni Cilj (minute)
              </label>
              <input
                type="number"
                value={formData.dailyGoalMinutes}
                onChange={(e) => setFormData({ ...formData, dailyGoalMinutes: e.target.value })}
                min="1"
                max="1440"
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
              <p className="text-xs text-muted-foreground mt-1">
                Koliko minuta dnevno treba učiti da bi dan bio uspješan
              </p>
            </div>

            <div className="flex space-x-3">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-primary text-primary-foreground py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>{loading ? 'Čuvanje...' : 'Kreiraj Korisnika'}</span>
              </button>
              
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 border border-border rounded-lg hover:bg-secondary transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Users List */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-border">
        <h3 className="text-lg font-bold mb-4">Postojeći Korisnici ({users.length})</h3>
        
        {users.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            Nema korisnika. Dodajte prvog korisnika da biste počeli!
          </p>
        ) : (
          <div className="space-y-3">
            {users.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-secondary/50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-primary font-bold text-lg">
                        {(user.display_name || user.name).charAt(0).toUpperCase()}
                      </span>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold">{user.display_name || user.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        @{user.name} • Cilj: {user.daily_goal_minutes} min/dan
                      </p>
                    </div>
                  </div>

                  {editingUser === user.id && (
                    <div className="mt-3 pl-13">
                      <label className="block text-sm font-medium mb-2">
                        Novi Dnevni Cilj (minute)
                      </label>
                      <div className="flex space-x-2">
                        <input
                          type="number"
                          value={formData.dailyGoalMinutes}
                          onChange={(e) => setFormData({ ...formData, dailyGoalMinutes: e.target.value })}
                          min="1"
                          max="1440"
                          className="flex-1 px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                        <button
                          onClick={() => handleUpdateUser(user.id)}
                          disabled={loading}
                          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                        >
                          <Save className="w-4 h-4" />
                        </button>
                        <button
                          onClick={resetForm}
                          className="px-4 py-2 border border-border rounded-lg hover:bg-secondary transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {!editingUser && (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => startEdit(user)}
                      className="p-2 hover:bg-secondary rounded-lg transition-colors"
                      title="Uredi postavke"
                    >
                      <Edit2 className="w-4 h-4 text-muted-foreground" />
                    </button>
                    <button
                      onClick={() => setDeletingUser(user)}
                      className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                      title="Obriši korisnika"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2">💡 Savjeti</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Korisničko ime mora biti jedinstveno</li>
          <li>• Novi korisnici se mogu kreirati i automatski pri dodavanju sesija</li>
          <li>• Svaki korisnik ima svoje statistike, nizove i kaznene bodove</li>
          <li>• Možete urediti dnevni cilj za svakog korisnika</li>
          <li>• ⚠️ Brisanje korisnika će trajno obrisati sve njegove sesije</li>
        </ul>
      </div>
    </div>
  )
}
