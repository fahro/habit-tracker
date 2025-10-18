import { useState, useEffect } from 'react'
import { TrendingUp, Calendar, Clock, Award, AlertCircle, Target, BookOpen, Settings, Users } from 'lucide-react'
import Dashboard from './components/Dashboard'
import AddSession from './components/AddSession'
import SettingsPanel from './components/SettingsPanel'
import UserManagement from './components/UserManagement'

function App() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [stats, setStats] = useState(null)
  const [dailyStats, setDailyStats] = useState(null)
  const [users, setUsers] = useState([])
  const [selectedUserId, setSelectedUserId] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users')
      const usersData = await res.json()
      setUsers(usersData)
      
      // Auto-select first user if none selected
      if (usersData.length > 0 && !selectedUserId) {
        setSelectedUserId(usersData[0].id)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    }
  }

  const fetchData = async () => {
    if (!selectedUserId) {
      setLoading(false)
      return
    }
    
    try {
      const [overallRes, dailyRes] = await Promise.all([
        fetch(`/api/stats/overall?userId=${selectedUserId}`),
        fetch(`/api/stats/daily?days=30&userId=${selectedUserId}`)
      ])

      const overallData = await overallRes.json()
      const dailyData = await dailyRes.json()

      setStats(overallData)
      setDailyStats(dailyData)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching data:', error)
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])
  
  useEffect(() => {
    if (selectedUserId) {
      fetchData()
    }
  }, [selectedUserId])

  const handleSessionAdded = () => {
    fetchUsers()
    fetchData()
  }

  const handleSettingsUpdated = () => {
    fetchData()
  }
  
  const handleUsersUpdated = async () => {
    await fetchUsers()
    
    // Check if currently selected user still exists
    const res = await fetch('/api/users')
    const usersData = await res.json()
    
    if (selectedUserId && !usersData.find(u => u.id === selectedUserId)) {
      // Current user was deleted, select first available user
      if (usersData.length > 0) {
        setSelectedUserId(usersData[0].id)
      } else {
        setSelectedUserId(null)
      }
    }
  }
  
  const selectedUser = users.find(u => u.id === selectedUserId)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Clock className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Učitavanje...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b border-border sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <BookOpen className="w-8 h-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold text-foreground">Study Tracker</h1>
                {selectedUser && (
                  <p className="text-sm text-muted-foreground">Korisnik: {selectedUser.display_name || selectedUser.name}</p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {/* User Selector */}
              {users.length > 0 && (
                <select
                  value={selectedUserId || ''}
                  onChange={(e) => setSelectedUserId(parseInt(e.target.value))}
                  className="px-3 py-2 border border-border rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {users.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.display_name || user.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2 mt-4">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'dashboard'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-secondary'
                }`}
              >
                <TrendingUp className="w-4 h-4 inline mr-2" />
                Dashboard
              </button>
              <button
                onClick={() => setActiveTab('add')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'add'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-secondary'
                }`}
              >
                <Calendar className="w-4 h-4 inline mr-2" />
                Dodaj Sesiju
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'users'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-secondary'
                }`}
              >
                <Users className="w-4 h-4 inline mr-2" />
                Korisnici
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'settings'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-secondary'
                }`}
              >
                <Settings className="w-4 h-4 inline mr-2" />
                Postavke
              </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!selectedUserId && users.length === 0 && activeTab !== 'users' ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">Nema korisnika. Kreirajte prvog korisnika.</p>
            <div className="flex justify-center space-x-3">
              <button
                onClick={() => setActiveTab('users')}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
              >
                Kreiraj Korisnika
              </button>
              <button
                onClick={() => setActiveTab('add')}
                className="px-4 py-2 border border-border rounded-lg hover:bg-secondary"
              >
                Dodaj Sesiju
              </button>
            </div>
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <Dashboard stats={stats} dailyStats={dailyStats} user={selectedUser} />
            )}
            {activeTab === 'add' && (
              <AddSession userId={selectedUserId} onSessionAdded={handleSessionAdded} users={users} />
            )}
            {activeTab === 'users' && (
              <UserManagement users={users} onUsersUpdated={handleUsersUpdated} />
            )}
            {activeTab === 'settings' && (
              <SettingsPanel user={selectedUser} userId={selectedUserId} onSettingsUpdated={handleSettingsUpdated} />
            )}
          </>
        )}
      </main>
    </div>
  )
}

export default App
