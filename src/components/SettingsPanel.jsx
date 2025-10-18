import { useState, useEffect } from 'react'
import { Settings, Target, Save, Calendar } from 'lucide-react'

export default function SettingsPanel({ user, userId, onSettingsUpdated }) {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [dailyGoal, setDailyGoal] = useState(30)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  
  const monthNames = ['Januar', 'Februar', 'Mart', 'April', 'Maj', 'Jun', 'Jul', 'Avgust', 'Septembar', 'Oktobar', 'Novembar', 'Decembar']

  useEffect(() => {
    // Fetch monthly goal for selected month
    fetch(`/api/settings/monthly/${selectedYear}/${selectedMonth}`)
      .then(res => res.json())
      .then(data => setDailyGoal(data.dailyGoalMinutes))
      .catch(err => console.error('Error fetching monthly goal:', err))
  }, [selectedMonth, selectedYear])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setSuccess(false)

    try {
      const response = await fetch('/api/settings/monthly', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          year: selectedYear,
          month: selectedMonth,
          dailyGoalMinutes: parseInt(dailyGoal)
        })
      })

      if (response.ok) {
        setSuccess(true)
        onSettingsUpdated()
        setTimeout(() => setSuccess(false), 3000)
      }
    } catch (error) {
      console.error('Error updating settings:', error)
      alert('Greška pri ažuriranju postavki')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-xl p-6 shadow-sm border border-border">
        <h2 className="text-xl font-bold mb-6 flex items-center">
          <Settings className="w-5 h-5 mr-2" />
          Globalne Postavke
        </h2>
        
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-900">
            <strong>📌 Napomena:</strong> Ove postavke važe za <strong>SVE korisnike</strong> za izabrani mjesec. Dnevni cilj će biti isti za sve.
          </p>
        </div>

        {success && (
          <div className="mb-4 bg-success/10 border border-success text-success px-4 py-3 rounded-lg flex items-center gap-2">
            <Save className="w-5 h-5" />
            <span className="font-medium">Mjesečni cilj uspješno postavljen!</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              Izaberi Mjesec
            </label>
            <select
              value={`${selectedYear}-${selectedMonth}`}
              onChange={(e) => {
                const [year, month] = e.target.value.split('-')
                setSelectedYear(parseInt(year))
                setSelectedMonth(parseInt(month))
              }}
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {Array.from({ length: 12 }, (_, i) => {
                const now = new Date()
                const targetDate = new Date(now.getFullYear(), now.getMonth() - 6 + i)
                const year = targetDate.getFullYear()
                const month = targetDate.getMonth()
                return (
                  <option key={`${year}-${month}`} value={`${year}-${month}`}>
                    {monthNames[month]} {year}
                  </option>
                )
              })}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              <Target className="w-4 h-4 inline mr-1" />
              Dnevni Cilj za {monthNames[selectedMonth]} {selectedYear} (minuta)
            </label>
            <input
              type="number"
              value={dailyGoal}
              onChange={(e) => setDailyGoal(e.target.value)}
              min="1"
              max="1440"
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
            <p className="text-sm text-muted-foreground mt-2">
              Koliko minuta dnevno svi korisnici treba da uče u ovom mjesecu? Cilj se prikazuje kao horizontalna linija na grafikonu.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            {loading ? 'Čuvanje...' : 'Sačuvaj Mjesečni Cilj'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-border">
          <h3 className="font-semibold mb-3">Kako funkcioniše praćenje?</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-success mt-0.5">✓</span>
              <span><strong>Uspješan dan:</strong> Kada postignete dnevni cilj</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange-600 mt-0.5">~</span>
              <span><strong>Djelimičan dan:</strong> Kada radite, ali ne dostignete cilj</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-destructive mt-0.5">✗</span>
              <span><strong>Propušteni dan:</strong> Kada ne radite ništa</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-destructive mt-0.5">⚠</span>
              <span><strong>Kazneni bod:</strong> Automatski se dobija nakon 2 uzastopna dana propusta</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
