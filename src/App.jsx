import { useState, useEffect } from 'react'
import HomePage from './pages/HomePage'
import AdminPage from './pages/AdminPage'

function getPage() {
  return window.location.hash === '#admin' ? 'admin' : 'home'
}

function App() {
  const [page, setPage] = useState(getPage)
  const [users, setUsers] = useState([])
  const [selectedUserId, setSelectedUserId] = useState(null)
  const [loadingUsers, setLoadingUsers] = useState(true)

  useEffect(() => {
    const onHash = () => setPage(getPage())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users')
      const data = await res.json()
      setUsers(data)
      if (data.length > 0) {
        const saved = localStorage.getItem('selectedUserId')
        const valid = saved && data.find(u => u.id === parseInt(saved))
        const id = valid ? parseInt(saved) : data[0].id
        setSelectedUserId(id)
        localStorage.setItem('selectedUserId', id.toString())
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingUsers(false)
    }
  }

  useEffect(() => { fetchUsers() }, [])

  const handleUserChange = (id) => {
    setSelectedUserId(id)
    localStorage.setItem('selectedUserId', id.toString())
  }

  if (loadingUsers) {
    return (
      <div className="flex items-center justify-center h-full bg-background">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (page === 'admin') {
    return (
      <AdminPage
        users={users}
        selectedUserId={selectedUserId}
        onUserChange={handleUserChange}
        onUsersUpdated={fetchUsers}
      />
    )
  }

  return (
    <HomePage
      users={users}
      selectedUserId={selectedUserId}
      onUserChange={handleUserChange}
      onUsersUpdated={fetchUsers}
    />
  )
}

export default App
