import { useState, useEffect } from 'react'
import { TrendingUp, Clock, Award, AlertCircle, Target, Flame, CheckCircle, XCircle, MinusCircle, ChevronLeft, ChevronRight, Calendar } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts'

export default function Dashboard({ stats, dailyStats, user }) {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [monthlyGoal, setMonthlyGoal] = useState(30)
  
  // Fetch monthly goal when month/year changes
  useEffect(() => {
    fetch(`/api/settings/monthly/${selectedYear}/${selectedMonth}`)
      .then(res => res.json())
      .then(data => setMonthlyGoal(data.dailyGoalMinutes))
      .catch(err => console.error('Error fetching monthly goal:', err))
  }, [selectedMonth, selectedYear])
  
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

  // Filter stats by selected month
  const monthlyStats = dailyStats.stats.filter(day => {
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

  const StatCard = ({ icon: Icon, title, value, subtitle, color = 'primary' }) => (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-border hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
          <p className={`text-3xl font-bold text-${color}`}>{value}</p>
          {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-lg bg-${color}/10`}>
          <Icon className={`w-6 h-6 text-${color}`} />
        </div>
      </div>
    </div>
  )

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
      <div className="bg-white rounded-xl p-6 shadow-sm border border-border">
        <h2 className="text-xl font-bold mb-4 flex items-center">
          <TrendingUp className="w-5 h-5 mr-2" />
          Aktivnost ({monthNames[selectedMonth]} {selectedYear})
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
      <div className="bg-white rounded-xl p-6 shadow-sm border border-border">
        {/* Month Selector */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            Mjesečni Pregled
          </h2>
          
          <div className="flex items-center gap-4">
            <button
              onClick={goToPreviousMonth}
              className="p-2 hover:bg-secondary rounded-lg transition-colors"
              title="Prethodni mjesec"
            >
              <ChevronLeft className="w-5 h-5" />
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
              className="p-2 hover:bg-secondary rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Sljedeći mjesec"
            >
              <ChevronRight className="w-5 h-5" />
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
            
            return (
              <div
                key={day.date}
                className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${
                  isToday ? 'bg-primary/5 border-primary' : 'bg-background border-border hover:bg-secondary'
                }`}
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
                  <div>
                    <p className="font-medium">
                      {date.toLocaleDateString('sr-Latn', { 
                        weekday: 'long', 
                        day: 'numeric', 
                        month: 'long' 
                      })}
                      {isToday && <span className="ml-2 text-xs bg-primary text-primary-foreground px-2 py-1 rounded">Danas</span>}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {day.sessionCount} {day.sessionCount === 1 ? 'sesija' : 'sesija'} · {formatTime(day.totalSeconds)}
                    </p>
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
    </div>
  )
}
