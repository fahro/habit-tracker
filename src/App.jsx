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
      
      if (usersData.length > 0 && !selectedUserId) {
        // Try to restore from localStorage
        const savedUserId = localStorage.getItem('selectedUserId')
        const savedUserExists = savedUserId && usersData.find(u => u.id === parseInt(savedUserId))
        
        if (savedUserExists) {
          setSelectedUserId(parseInt(savedUserId))
        } else {
          // Auto-select first user if no saved user
          setSelectedUserId(usersData[0].id)
          localStorage.setItem('selectedUserId', usersData[0].id.toString())
        }
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
      // Save to localStorage whenever user changes
      localStorage.setItem('selectedUserId', selectedUserId.toString())
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
        <div className="text-center bg-white p-8 rounded-lg shadow-card">
          <Clock className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-gray-700 font-medium">Učitavanje...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-soft">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex items-center space-x-4">
              <div className="p-2.5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-md">
                <BookOpen className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Study Tracker</h1>
                <p className="text-xs text-gray-500">Prati svoj napredak</p>
              </div>
            </div>
            
            {/* User Selector */}
            {users.length > 0 && (
              <div className="flex items-center gap-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl px-5 py-3 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-blue-500 rounded-lg">
                    <Users className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-bold text-gray-700">Korisnik:</span>
                </div>
                <select
                  value={selectedUserId || ''}
                  onChange={(e) => setSelectedUserId(parseInt(e.target.value))}
                  className="bg-white border-2 border-blue-300 rounded-xl px-4 py-2 text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-blue-400 transition-all cursor-pointer shadow-sm"
                >
                  {users.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.display_name || user.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
          {/* Navigation */}
          <div className="flex items-center gap-2 pb-4 pt-3 border-t border-gray-100 mt-3">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-5 py-2.5 rounded-xl font-semibold transition-all ${
                  activeTab === 'dashboard'
                    ? 'bg-primary text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <TrendingUp className="w-4 h-4 inline mr-2" />
                Dashboard
              </button>
              <button
                onClick={() => setActiveTab('add')}
                className={`px-5 py-2.5 rounded-xl font-semibold transition-all ${
                  activeTab === 'add'
                    ? 'bg-primary text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <Calendar className="w-4 h-4 inline mr-2" />
                Dodaj Sesiju
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`px-5 py-2.5 rounded-xl font-semibold transition-all ${
                  activeTab === 'users'
                    ? 'bg-primary text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <Users className="w-4 h-4 inline mr-2" />
                Korisnici
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`px-5 py-2.5 rounded-xl font-semibold transition-all ${
                  activeTab === 'settings'
                    ? 'bg-primary text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
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
          <div className="text-center py-12 bg-white rounded-lg shadow-card p-8">
            <p className="text-gray-700 mb-6 font-medium text-lg">Nema korisnika. Kreirajte prvog korisnika.</p>
            <div className="flex justify-center space-x-3">
              <button
                onClick={() => setActiveTab('users')}
                className="px-6 py-3 bg-primary text-white rounded-lg hover:shadow-card-hover font-medium transition-all"
              >
                Kreiraj Korisnika
              </button>
              <button
                onClick={() => setActiveTab('add')}
                className="px-6 py-3 border border-gray-300 bg-white rounded-lg hover:bg-gray-50 font-medium transition-all"
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
