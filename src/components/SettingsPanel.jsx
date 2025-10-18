import { useState, useEffect } from 'react'
import { Settings, Target, Save } from 'lucide-react'

export default function SettingsPanel({ user, userId, onSettingsUpdated }) {
  const [dailyGoal, setDailyGoal] = useState(30)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (user) {
      setDailyGoal(user.daily_goal_minutes)
    }
  }, [user])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setSuccess(false)

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
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
          Postavke
        </h2>

        {success && (
          <div className="mb-4 bg-success/10 border border-success text-success px-4 py-3 rounded-lg flex items-center gap-2">
            <Save className="w-5 h-5" />
            <span className="font-medium">Postavke uspješno ažurirane!</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">
              <Target className="w-4 h-4 inline mr-1" />
              Dnevni Cilj (minuta)
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
              Koliko minuta dnevno želite učiti? Ako ne postignete cilj 2 dana uzastopno, dobijate kazneni bod.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            {loading ? 'Čuvanje...' : 'Sačuvaj Postavke'}
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
