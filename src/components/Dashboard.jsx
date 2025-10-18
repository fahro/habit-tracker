import { useState, useEffect } from 'react'
import { TrendingUp, Clock, Award, AlertCircle, Target, Flame, CheckCircle, XCircle, MinusCircle, ChevronLeft, ChevronRight, Calendar, X, BookOpen, Edit2, Trash2, Save, Plus } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts'

export default function Dashboard({ stats, dailyStats, user, onDataRefresh }) {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [monthlyGoal, setMonthlyGoal] = useState(30)
  const [selectedDate, setSelectedDate] = useState(null)
  const [daySessions, setDaySessions] = useState([])
  const [loadingSessions, setLoadingSessions] = useState(false)
  const [editingSessionId, setEditingSessionId] = useState(null)
  const [editFormData, setEditFormData] = useState({ lessonName: '', minutes: 0, seconds: 0 })
  const [monthlyDailyStats, setMonthlyDailyStats] = useState(null)
  const [batchMessage, setBatchMessage] = useState('')
  const [addingBatch, setAddingBatch] = useState(false)
  
  // Fetch monthly data when month/year changes
  useEffect(() => {
    if (!user) return
    
    // Get first and last day of selected month
    const firstDay = new Date(selectedYear, selectedMonth, 1)
    const lastDay = new Date(selectedYear, selectedMonth + 1, 0)
    const daysInMonth = lastDay.getDate()
    
    Promise.all([
      fetch(`/api/settings/monthly/${selectedYear}/${selectedMonth + 1}`).then(res => res.json()),
      fetch(`/api/stats/daily?days=${daysInMonth + 30}&userId=${user.id}`).then(res => res.json())
    ]).then(([goalData, statsData]) => {
      setMonthlyGoal(goalData.dailyGoalMinutes)
      setMonthlyDailyStats(statsData)
    }).catch(err => console.error('Error fetching monthly data:', err))
  }, [selectedMonth, selectedYear, user])
  
  // Fetch sessions for selected date
  const fetchDaySessions = async (date) => {
    setSelectedDate(date)
    setLoadingSessions(true)
    try {
      const res = await fetch(`/api/sessions?userId=${user.id}&startDate=${date}&endDate=${date}`)
      const sessions = await res.json()
      setDaySessions(sessions)
    } catch (error) {
      console.error('Error fetching sessions:', error)
      setDaySessions([])
    }
    setLoadingSessions(false)
  }
  
  const closeDayDetails = () => {
    setSelectedDate(null)
    setDaySessions([])
    setEditingSessionId(null)
    setBatchMessage('')
  }
  
  // Check if date is editable (today or yesterday only)
  const isEditableDate = (date) => {
    const today = new Date().toISOString().split('T')[0]
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
    return date === today || date === yesterday
  }
  
  // Start editing session
  const startEditSession = (session) => {
    const minutes = Math.floor(session.duration_seconds / 60)
    const seconds = session.duration_seconds % 60
    setEditFormData({
      lessonName: session.lesson_name,
      minutes,
      seconds
    })
    setEditingSessionId(session.id)
  }
  
  // Save edited session
  const saveEditSession = async (sessionId) => {
    const totalSeconds = (parseInt(editFormData.minutes) || 0) * 60 + (parseInt(editFormData.seconds) || 0)
    
    if (totalSeconds === 0) {
      alert('Trajanje mora biti veće od 0')
      return
    }
    
    try {
      const res = await fetch(`/api/sessions/${sessionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lessonName: editFormData.lessonName,
          duration: totalSeconds,
          date: selectedDate
        })
      })
      
      if (res.ok) {
        setEditingSessionId(null)
        await fetchDaySessions(selectedDate)
        // Trigger parent refresh without losing state
        if (onDataRefresh) onDataRefresh()
      } else {
        const data = await res.json()
        alert(data.error || 'Greška pri ažuriranju sesije')
      }
    } catch (error) {
      console.error('Error updating session:', error)
      alert('Greška pri ažuriranju sesije')
    }
  }
  
  // Delete session
  const deleteSessionHandler = async (sessionId) => {
    if (!confirm('Da li ste sigurni da želite obrisati ovu sesiju?')) {
      return
    }
    
    try {
      const res = await fetch(`/api/sessions/${sessionId}`, {
        method: 'DELETE'
      })
      
      if (res.ok) {
        await fetchDaySessions(selectedDate)
        // Trigger parent refresh without losing state
        if (onDataRefresh) onDataRefresh()
      } else {
        const data = await res.json()
        alert(data.error || 'Greška pri brisanju sesije')
      }
    } catch (error) {
      console.error('Error deleting session:', error)
      alert('Greška pri brisanju sesije')
    }
  }

  // Add batch sessions
  const handleBatchSubmit = async (e) => {
    e.preventDefault()
    setAddingBatch(true)
    
    if (!batchMessage.trim()) {
      alert('Molimo unesite sesije')
      setAddingBatch(false)
      return
    }
    
    try {
      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: batchMessage,
          userId: user.id,
          date: selectedDate
        })
      })
      
      const data = await response.json()
      
      if (response.ok) {
        setBatchMessage('')
        await fetchDaySessions(selectedDate)
        // Trigger parent refresh without losing state
        if (onDataRefresh) onDataRefresh()
      } else {
        alert(data.error || 'Greška pri dodavanju sesija')
      }
    } catch (error) {
      console.error('Error adding batch sessions:', error)
      alert('Greška pri dodavanju sesija')
    } finally {
      setAddingBatch(false)
    }
  }
  
  if (!stats || !dailyStats) return null

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`
    }
    return `${secs}s`
  }

  // Use monthly stats if available, otherwise fallback to dailyStats
  const statsToUse = monthlyDailyStats || dailyStats
  
  // Filter stats by selected month
  const monthlyStats = statsToUse.stats.filter(day => {
    const dayDate = new Date(day.date)
    return dayDate.getMonth() === selectedMonth && dayDate.getFullYear() === selectedYear
  }).reverse()

  // Calculate monthly penalties
  const monthlyPenalties = monthlyStats.filter(day => day.penalty).length

  // Calculate user's first activity date
  const userCreatedDate = user?.created_at ? new Date(user.created_at) : new Date()

  // Month navigation
  const monthNames = ['Januar', 'Februar', 'Mart', 'April', 'Maj', 'Jun', 'Jul', 'Avgust', 'Septembar', 'Oktobar', 'Novembar', 'Decembar']
  
  const goToPreviousMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11)
      setSelectedYear(selectedYear - 1)
    } else {
      setSelectedMonth(selectedMonth - 1)
    }
  }
  
  const goToNextMonth = () => {
    const now = new Date()
    if (selectedYear === now.getFullYear() && selectedMonth === now.getMonth()) {
      return // Don't go beyond current month
    }
    if (selectedMonth === 11) {
      setSelectedMonth(0)
      setSelectedYear(selectedYear + 1)
    } else {
      setSelectedMonth(selectedMonth + 1)
    }
  }

  // Prepare chart data (all days in selected month)
  const chartData = monthlyStats.map(day => ({
    date: new Date(day.date).toLocaleDateString('sr-Latn', { day: 'numeric' }),
    minutes: day.totalMinutes,
    metGoal: day.metGoal
  })).reverse() // Reverse to show chronologically (oldest to newest)

  const StatCard = ({ icon: Icon, title, value, subtitle, color = 'primary' }) => {
    const colorClasses = {
      'orange-500': { bg: 'bg-orange-500', text: 'text-orange-600' },
      'primary': { bg: 'bg-primary', text: 'text-primary' },
      'success': { bg: 'bg-success', text: 'text-success' },
      'destructive': { bg: 'bg-destructive', text: 'text-destructive' }
    }
    const colors = colorClasses[color] || colorClasses['primary']
    
    return (
      <div className="bg-white rounded-lg p-6 shadow-card hover:shadow-card-hover transition-all border border-gray-200">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-600 mb-2">{title}</p>
            <p className={`text-4xl font-bold ${colors.text}`}>{value}</p>
            {subtitle && <p className="text-sm text-gray-500 mt-2 font-medium">{subtitle}</p>}
          </div>
          <div className={`p-3 rounded-lg ${colors.bg}`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>
    )
  }

  // Custom tick component for colored day numbers
  const CustomXAxisTick = ({ x, y, payload }) => {
    const dayData = chartData.find(d => d.date === payload.value)
    const color = dayData?.metGoal ? '#16a34a' : dayData?.minutes > 0 ? '#ea580c' : '#dc2626'
    
    return (
      <g transform={`translate(${x},${y})`}>
        <text 
          x={0} 
          y={0} 
          dy={16} 
          textAnchor="middle" 
          fill={color}
          fontSize="12"
          fontWeight="600"
        >
          {payload.value}
        </text>
      </g>
    )
  }

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Flame}
          title="Trenutni Niz"
          value={stats.currentStreak}
          subtitle={`Najduži: ${stats.longestStreak} dana`}
          color="orange-500"
        />
        <StatCard
          icon={Clock}
          title="Ukupno Vrijeme"
          value={`${stats.totalHours}h ${stats.totalMinutes}m`}
          subtitle={`${stats.totalSessions} sesija`}
        />
        <StatCard
          icon={Target}
          title="Aktivnih Dana"
          value={stats.daysActive}
          subtitle={`Cilj: ${user.daily_goal_minutes}min/dan`}
        />
        <StatCard
          icon={AlertCircle}
          title="Kazneni Bodovi"
          value={dailyStats.totalPenalties}
          subtitle="2+ uzastopna dana propusta"
          color={dailyStats.totalPenalties > 0 ? 'destructive' : 'success'}
        />
      </div>

      {/* Chart */}
      <div className="bg-white rounded-lg p-6 shadow-card border border-gray-200">
        <h2 className="text-xl font-bold mb-6 flex items-center">
          <div className="p-2 bg-primary rounded-lg mr-3">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <span className="text-gray-900">
            Aktivnost ({monthNames[selectedMonth]} {selectedYear})
          </span>
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="date" 
              tick={<CustomXAxisTick />}
              stroke="#e5e7eb"
            />
            <YAxis 
              stroke="#6b7280" 
              label={{ value: 'Minuta', angle: -90, position: 'insideLeft' }}
              domain={[0, 'auto']}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'white', 
                border: '1px solid #e5e7eb',
                borderRadius: '8px'
              }}
              formatter={(value) => [`${value} min`, 'Vrijeme']}
            />
            <ReferenceLine 
              y={monthlyGoal} 
              stroke="#3b82f6" 
              strokeWidth={2}
              strokeDasharray="5 5"
              label={{ 
                value: `Cilj: ${monthlyGoal}m`, 
                position: 'right',
                fill: '#3b82f6',
                fontSize: 12,
                fontWeight: 600
              }}
            />
            <Bar dataKey="minutes" radius={[8, 8, 0, 0]}>
              {chartData.map((entry, index) => {
                const color = entry.metGoal ? '#16a34a' : entry.minutes > 0 ? '#ea580c' : '#dc2626'
                return <Cell key={`cell-${index}`} fill={color} />
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div className="flex items-center justify-center gap-6 mt-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-600"></div>
            <span>Cilj postignut</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-orange-600"></div>
            <span>Djelimično</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-red-600"></div>
            <span>Propušten (0m)</span>
          </div>
        </div>
      </div>

      {/* Daily Breakdown */}
      <div className="bg-white rounded-lg p-6 shadow-card border border-gray-200">
        {/* Month Selector */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold flex items-center">
            <div className="p-2 bg-primary rounded-lg mr-3">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <span className="text-gray-900">
              Mjesečni Pregled
            </span>
          </h2>
          
          <div className="flex items-center gap-4">
            <button
              onClick={goToPreviousMonth}
              className="p-2 hover:bg-white/50 rounded-xl transition-all transform hover:scale-110 backdrop-blur-sm"
              title="Prethodni mjesec"
            >
              <ChevronLeft className="w-5 h-5 text-gray-700" />
            </button>
            
            <div className="text-center min-w-[180px]">
              <div className="font-bold text-lg">
                {monthNames[selectedMonth]} {selectedYear}
              </div>
              <div className="text-xs text-muted-foreground">
                {monthlyPenalties > 0 && `⚠️ ${monthlyPenalties} penala ovaj mjesec`}
              </div>
            </div>
            
            <button
              onClick={goToNextMonth}
              disabled={selectedYear === new Date().getFullYear() && selectedMonth === new Date().getMonth()}
              className="p-2 hover:bg-white/50 rounded-xl transition-all transform hover:scale-110 backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed"
              title="Sljedeći mjesec"
            >
              <ChevronRight className="w-5 h-5 text-gray-700" />
            </button>
          </div>
        </div>

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {monthlyStats.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>Nema aktivnosti za {monthNames[selectedMonth]} {selectedYear}</p>
              {userCreatedDate > new Date(selectedYear, selectedMonth, 1) && (
                <p className="text-xs mt-2">Korisnik kreiran: {userCreatedDate.toLocaleDateString('sr-Latn', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              )}
            </div>
          ) : (
            monthlyStats.map((day, index) => {
            const date = new Date(day.date)
            const isToday = day.date === new Date().toISOString().split('T')[0]
            const isYesterday = day.date === new Date(Date.now() - 86400000).toISOString().split('T')[0]
            const isEditable = isEditableDate(day.date)
            const canInteract = day.sessionCount > 0 || isEditable
            const needsSession = isEditable && day.sessionCount === 0
            
            return (
              <div
                key={day.date}
                onClick={() => canInteract && fetchDaySessions(day.date)}
                className={`relative flex items-center justify-between p-4 rounded-xl border transition-all ${
                  needsSession 
                    ? 'bg-red-50 border-2 border-red-300 shadow-md animate-pulse cursor-pointer hover:shadow-lg' 
                    : isEditable
                      ? 'bg-blue-50 border-2 border-blue-300 shadow-sm cursor-pointer hover:shadow-md'
                      : isToday
                        ? 'bg-gray-50 border-gray-200'
                        : 'bg-white border-gray-200'
                } ${canInteract && !isEditable ? 'cursor-pointer hover:shadow-md' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    day.metGoal 
                      ? 'bg-success/10 text-success' 
                      : day.totalSeconds > 0 
                        ? 'bg-orange-500/10 text-orange-600'
                        : 'bg-muted text-muted-foreground'
                  }`}>
                    {day.metGoal ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : day.totalSeconds > 0 ? (
                      <MinusCircle className="w-5 h-5" />
                    ) : (
                      <XCircle className="w-5 h-5" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium">
                        {date.toLocaleDateString('sr-Latn', { 
                          weekday: 'long', 
                          day: 'numeric', 
                          month: 'long' 
                        })}
                      </p>
                      {isToday && <span className="text-xs bg-gray-900 text-white px-2 py-1 rounded-md font-semibold">Danas</span>}
                      {isYesterday && <span className="text-xs bg-gray-600 text-white px-2 py-1 rounded-md font-semibold">Juče</span>}
                      {isEditable && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-md font-semibold flex items-center gap-1">
                          <Edit2 className="w-3 h-3" />
                          Može se editovati
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {day.sessionCount} {day.sessionCount === 1 ? 'sesija' : 'sesija'} · {formatTime(day.totalSeconds)}
                    </p>
                    {needsSession && (
                      <div className="mt-2 flex items-center gap-2 text-red-600 font-semibold text-sm">
                        <AlertCircle className="w-4 h-4" />
                        <span>Unesi sesiju za ovaj dan!</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {day.penalty && (
                    <div className="flex items-center gap-1 text-destructive bg-destructive/10 px-3 py-1 rounded-full">
                      <AlertCircle className="w-4 h-4" />
                      <span className="text-sm font-medium">Penal</span>
                    </div>
                  )}
                  {day.consecutiveMisses > 0 && !day.metGoal && (
                    <span className="text-sm text-muted-foreground">
                      {day.consecutiveMisses} {day.consecutiveMisses === 1 ? 'dan' : 'dana'} propust
                    </span>
                  )}
                </div>
              </div>
            )
          })
          )}
        </div>
      </div>

      {/* Day Details Modal */}
      {selectedDate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={closeDayDetails}>
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden shadow-2xl border border-gray-200" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-border flex items-center justify-between sticky top-0 bg-white">
              <div>
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Calendar className="w-6 h-6 text-primary" />
                  Detalji za {new Date(selectedDate).toLocaleDateString('sr-Latn', { 
                    weekday: 'long', 
                    day: 'numeric', 
                    month: 'long',
                    year: 'numeric'
                  })}
                </h3>
                {!loadingSessions && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {daySessions.length} {daySessions.length === 1 ? 'sesija' : 'sesija'}
                  </p>
                )}
              </div>
              <button
                onClick={closeDayDetails}
                className="p-2 hover:bg-secondary rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(80vh-100px)]">
              {loadingSessions ? (
                <div className="text-center py-12">
                  <Clock className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
                  <p className="text-muted-foreground">Učitavanje...</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {daySessions.length === 0 && isEditableDate(selectedDate) ? (
                    <div className="text-center py-8 glass-card rounded-2xl border-2 border-orange-300">
                      <AlertCircle className="w-16 h-16 mx-auto mb-4 text-orange-500" />
                      <h4 className="text-lg font-bold text-gray-800 mb-2">Nema unesenih sesija!</h4>
                      <p className="text-gray-600 mb-4">Dodaj sesije za ovaj dan ispod</p>
                    </div>
                  ) : daySessions.length === 0 ? (
                    <div className="text-center py-12">
                      <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground">Nema sesija za ovaj dan</p>
                    </div>
                  ) : (
                <div className="space-y-3">
                  {daySessions.map((session, index) => {
                    const minutes = Math.floor(session.duration_seconds / 60)
                    const seconds = session.duration_seconds % 60
                    const isEditing = editingSessionId === session.id
                    const canEdit = isEditableDate(selectedDate)
                    
                    return (
                      <div
                        key={session.id}
                        className="p-4 rounded-lg border border-border bg-background hover:bg-secondary transition-colors"
                      >
                        {isEditing ? (
                          /* Edit Mode */
                          <div className="space-y-3">
                            <div>
                              <label className="block text-sm font-medium mb-1">Naziv lekcije</label>
                              <input
                                type="text"
                                value={editFormData.lessonName}
                                onChange={(e) => setEditFormData({ ...editFormData, lessonName: e.target.value })}
                                className="w-full px-3 py-2 border border-border rounded-lg"
                                placeholder="npr. Lekcija 1"
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-sm font-medium mb-1">Minuti</label>
                                <input
                                  type="number"
                                  value={editFormData.minutes}
                                  onChange={(e) => setEditFormData({ ...editFormData, minutes: e.target.value })}
                                  className="w-full px-3 py-2 border border-border rounded-lg"
                                  min="0"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium mb-1">Sekundi</label>
                                <input
                                  type="number"
                                  value={editFormData.seconds}
                                  onChange={(e) => setEditFormData({ ...editFormData, seconds: e.target.value })}
                                  className="w-full px-3 py-2 border border-border rounded-lg"
                                  min="0"
                                  max="59"
                                />
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => saveEditSession(session.id)}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                              >
                                <Save className="w-4 h-4" />
                                Sačuvaj
                              </button>
                              <button
                                onClick={() => setEditingSessionId(null)}
                                className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-secondary transition-colors"
                              >
                                Odustani
                              </button>
                            </div>
                          </div>
                        ) : (
                          /* View Mode */
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-xs font-medium text-muted-foreground bg-secondary px-2 py-1 rounded">
                                  #{index + 1}
                                </span>
                                <h4 className="font-semibold text-lg">{session.lesson_name}</h4>
                              </div>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Clock className="w-4 h-4" />
                                  <span>
                                    {minutes > 0 && `${minutes}m `}
                                    {seconds > 0 && `${seconds}s`}
                                    {minutes === 0 && seconds === 0 && '0s'}
                                  </span>
                                </div>
                                <div>
                                  Dodato: {new Date(session.created_at).toLocaleTimeString('sr-Latn', { 
                                    hour: '2-digit', 
                                    minute: '2-digit' 
                                  })}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="text-right mr-2">
                                <div className="text-2xl font-bold text-primary">
                                  {minutes}'
                                </div>
                                {seconds > 0 && (
                                  <div className="text-xs text-muted-foreground">
                                    {seconds}s
                                  </div>
                                )}
                              </div>
                              {canEdit && (
                                <div className="flex gap-1">
                                  <button
                                    onClick={() => startEditSession(session)}
                                    className="p-2 hover:bg-primary/10 rounded-lg transition-colors"
                                    title="Edituj sesiju"
                                  >
                                    <Edit2 className="w-4 h-4 text-primary" />
                                  </button>
                                  <button
                                    onClick={() => deleteSessionHandler(session.id)}
                                    className="p-2 hover:bg-destructive/10 rounded-lg transition-colors"
                                    title="Obriši sesiju"
                                  >
                                    <Trash2 className="w-4 h-4 text-destructive" />
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                  
                  {/* Total Summary */}
                  {daySessions.length > 0 && (
                    <div className="mt-6 p-4 rounded-lg bg-primary/5 border border-primary">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Ukupno vrijeme</p>
                          <p className="text-2xl font-bold text-primary">
                            {formatTime(daySessions.reduce((sum, s) => sum + s.duration_seconds, 0))}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Ukupno sesija</p>
                          <p className="text-2xl font-bold">
                            {daySessions.length}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                  )}
                  
                  {/* Batch Add Sessions Form - Only for today/yesterday */}
                  {isEditableDate(selectedDate) && (
                    <div className="bg-white rounded-lg p-6 border-2 border-blue-300 shadow-sm">
                      <h4 className="text-lg font-bold mb-4 flex items-center">
                        <div className="p-2 bg-primary rounded-lg mr-3">
                          <Plus className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-gray-900">
                          Dodaj Sesije
                        </span>
                      </h4>
                      <form onSubmit={handleBatchSubmit} className="space-y-4">
                        <div>
                          <label className="block text-sm font-semibold mb-2 text-gray-700">
                            Unesi sesije (jedna po liniji ili inline)
                          </label>
                          <textarea
                            value={batchMessage}
                            onChange={(e) => setBatchMessage(e.target.value)}
                            placeholder="Game 1. Test\n30m 15s\nGame 2. Test 2\n45m"
                            rows={6}
                            className="w-full px-4 py-3 border border-white/30 bg-white/50 backdrop-blur-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all font-mono text-sm"
                          />
                          <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <p className="text-xs font-semibold text-blue-900 mb-1">📝 Primjeri:</p>
                            <div className="text-xs text-blue-700 space-y-1 font-mono">
                              <p>✓ Lekcija 1<br/>&nbsp;&nbsp;30m</p>
                              <p>✓ Lekcija 2 45m 30s</p>
                            </div>
                          </div>
                        </div>
                        <button
                          type="submit"
                          disabled={addingBatch}
                          className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:shadow-card-hover transition-all disabled:opacity-50"
                        >
                          {addingBatch ? 'Dodavanje...' : 'Dodaj Sesije'}
                        </button>
                      </form>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
