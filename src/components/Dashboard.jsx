import { TrendingUp, Clock, Award, AlertCircle, Target, Flame, CheckCircle, XCircle, MinusCircle } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

export default function Dashboard({ stats, dailyStats, user }) {
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

  // Prepare chart data (last 14 days)
  const chartData = dailyStats.stats.slice(0, 14).reverse().map(day => ({
    date: new Date(day.date).toLocaleDateString('sr-Latn', { month: 'short', day: 'numeric' }),
    minutes: day.totalMinutes,
    metGoal: day.metGoal
  }))

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
          Aktivnost (Zadnjih 14 Dana)
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="date" stroke="#6b7280" />
            <YAxis stroke="#6b7280" label={{ value: 'Minuta', angle: -90, position: 'insideLeft' }} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'white', 
                border: '1px solid #e5e7eb',
                borderRadius: '8px'
              }}
              formatter={(value) => [`${value} min`, 'Vrijeme']}
            />
            <Bar dataKey="minutes" radius={[8, 8, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.metGoal ? '#16a34a' : '#ea580c'} />
              ))}
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
            <span>Ispod cilja</span>
          </div>
        </div>
      </div>

      {/* Daily Breakdown */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-border">
        <h2 className="text-xl font-bold mb-4 flex items-center">
          <Award className="w-5 h-5 mr-2" />
          Detaljan Pregled (Zadnjih 30 Dana)
        </h2>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {dailyStats.stats.map((day, index) => {
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
          })}
        </div>
      </div>
    </div>
  )
}
