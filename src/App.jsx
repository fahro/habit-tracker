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
      } else if (usersData.length === 0) {
        // No users, stop loading
        setLoading(false)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
      setLoading(false)
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
    
    // Failsafe: stop loading after 10 seconds
    const timeout = setTimeout(() => {
      setLoading(false)
    }, 10000)
    
    return () => clearTimeout(timeout)
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
        <div className="text-center glass-card p-8 rounded-2xl">
          <Clock className="w-12 h-12 animate-spin mx-auto mb-4 text-purple-600" />
          <p className="text-gray-700 font-medium">Učitavanje...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="glass-card border-b border-white/20 sticky top-0 z-10 shadow-lg backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-gradient-primary rounded-xl shadow-glow">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">Study Tracker</h1>
                {selectedUser && (
                  <p className="text-sm text-gray-600 font-medium">Korisnik: {selectedUser.display_name || selectedUser.name}</p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {/* User Selector */}
              {users.length > 0 && (
                <select
                  value={selectedUserId || ''}
                  onChange={(e) => setSelectedUserId(parseInt(e.target.value))}
                  className="px-4 py-2 border border-white/30 rounded-xl bg-white/50 backdrop-blur-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-sm hover:bg-white/70 transition-all"
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
                className={`px-4 py-2 rounded-xl font-medium transition-all transform hover:scale-105 ${
                  activeTab === 'dashboard'
                    ? 'bg-gradient-primary text-white shadow-glow'
                    : 'text-gray-600 hover:bg-white/50 backdrop-blur-sm'
                }`}
              >
                <TrendingUp className="w-4 h-4 inline mr-2" />
                Dashboard
              </button>
              <button
                onClick={() => setActiveTab('add')}
                className={`px-4 py-2 rounded-xl font-medium transition-all transform hover:scale-105 ${
                  activeTab === 'add'
                    ? 'bg-gradient-primary text-white shadow-glow'
                    : 'text-gray-600 hover:bg-white/50 backdrop-blur-sm'
                }`}
              >
                <Calendar className="w-4 h-4 inline mr-2" />
                Dodaj Sesiju
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`px-4 py-2 rounded-xl font-medium transition-all transform hover:scale-105 ${
                  activeTab === 'users'
                    ? 'bg-gradient-primary text-white shadow-glow'
                    : 'text-gray-600 hover:bg-white/50 backdrop-blur-sm'
                }`}
              >
                <Users className="w-4 h-4 inline mr-2" />
                Korisnici
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`px-4 py-2 rounded-xl font-medium transition-all transform hover:scale-105 ${
                  activeTab === 'settings'
                    ? 'bg-gradient-primary text-white shadow-glow'
                    : 'text-gray-600 hover:bg-white/50 backdrop-blur-sm'
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
          <div className="text-center py-12 glass-card rounded-2xl p-8">
            <p className="text-gray-700 mb-6 font-medium text-lg">Nema korisnika. Kreirajte prvog korisnika.</p>
            <div className="flex justify-center space-x-3">
              <button
                onClick={() => setActiveTab('users')}
                className="px-6 py-3 bg-gradient-primary text-white rounded-xl hover:shadow-glow transform hover:scale-105 font-medium transition-all"
              >
                Kreiraj Korisnika
              </button>
              <button
                onClick={() => setActiveTab('add')}
                className="px-6 py-3 border border-white/30 bg-white/50 backdrop-blur-sm rounded-xl hover:bg-white/70 font-medium transition-all transform hover:scale-105"
              >
                Dodaj Sesiju
              </button>
            </div>
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <Dashboard stats={stats} dailyStats={dailyStats} user={selectedUser} onDataRefresh={handleSessionAdded} />
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
