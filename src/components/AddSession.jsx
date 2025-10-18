import { useState } from 'react'
import { Plus, Clock, BookOpen, CheckCircle, Link2 } from 'lucide-react'

export default function AddSession({ userId, onSessionAdded, users }) {
  const [lessonName, setLessonName] = useState('')
  const [hours, setHours] = useState(0)
  const [minutes, setMinutes] = useState(0)
  const [seconds, setSeconds] = useState(0)
  const [message, setMessage] = useState('')
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [sessionsAdded, setSessionsAdded] = useState(0)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setSuccess(false)

    const totalSeconds = (parseInt(hours) || 0) * 3600 + (parseInt(minutes) || 0) * 60 + (parseInt(seconds) || 0)

    if (totalSeconds === 0) {
      alert('Molimo unesite trajanje')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          lessonName,
          duration: totalSeconds,
          userId: userId
        })
      })

      if (response.ok) {
        setSuccess(true)
        setLessonName('')
        setHours(0)
        setMinutes(0)
        setSeconds(0)
        onSessionAdded()
        
        setTimeout(() => setSuccess(false), 3000)
      }
    } catch (error) {
      console.error('Error adding session:', error)
      alert('Greška pri dodavanju sesije')
    } finally {
      setLoading(false)
    }
  }

  const handleMessageSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setSuccess(false)
    setError('')
    setSessionsAdded(0)

    // Validacija
    if (!message.trim()) {
      setError('Molimo unesite podatke o sesijama')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: message,
          username: username || undefined,
          userId: userId
        })
      })

      const data = await response.json()

      if (response.ok) {
        const count = data.count || data.sessions?.length || 1
        setSessionsAdded(count)
        setSuccess(true)
        setMessage('')
        setUsername('')
        onSessionAdded()
        
        setTimeout(() => {
          setSuccess(false)
          setSessionsAdded(0)
        }, 5000)
      } else {
        setError(data.error || 'Greška pri dodavanju sesija. Provjerite format poruke.')
      }
    } catch (error) {
      console.error('Error adding sessions:', error)
      setError('Greška pri dodavanju sesija. Provjerite konekciju ili format podataka.')
    } finally {
      setLoading(false)
    }
  }

  const webhookUrl = `${window.location.origin}/api/webhook/message`

  return (
    <div className="space-y-6">
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center gap-2">
          <CheckCircle className="w-5 h-5" />
          <span className="font-medium">
            {sessionsAdded > 0 
              ? `✅ Uspješno dodano ${sessionsAdded} ${sessionsAdded === 1 ? 'sesija' : sessionsAdded < 5 ? 'sesije' : 'sesija'}!`
              : '✅ Sesija uspješno dodana!'}
          </span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
          <span className="font-medium">❌ {error}</span>
        </div>
      )}

      {/* Manual Entry */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-border">
        <h2 className="text-xl font-bold mb-4 flex items-center">
          <Plus className="w-5 h-5 mr-2" />
          Dodaj Sesiju Ručno
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              <BookOpen className="w-4 h-4 inline mr-1" />
              Naziv Lekcije
            </label>
            <input
              type="text"
              value={lessonName}
              onChange={(e) => setLessonName(e.target.value)}
              placeholder='Game 1. Steinitz W. - Lipke P. "Play against isolated pawn"'
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              <Clock className="w-4 h-4 inline mr-1" />
              Trajanje
            </label>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <input
                  type="number"
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                  min="0"
                  placeholder="0"
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-center"
                />
                <p className="text-xs text-muted-foreground text-center mt-1">Sati</p>
              </div>
              <div>
                <input
                  type="number"
                  value={minutes}
                  onChange={(e) => setMinutes(e.target.value)}
                  min="0"
                  max="59"
                  placeholder="0"
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-center"
                />
                <p className="text-xs text-muted-foreground text-center mt-1">Minuta</p>
              </div>
              <div>
                <input
                  type="number"
                  value={seconds}
                  onChange={(e) => setSeconds(e.target.value)}
                  min="0"
                  max="59"
                  placeholder="0"
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-center"
                />
                <p className="text-xs text-muted-foreground text-center mt-1">Sekundi</p>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {loading ? 'Dodavanje...' : 'Dodaj Sesiju'}
          </button>
        </form>
      </div>

      {/* Message Format Entry */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-border">
        <h2 className="text-xl font-bold mb-4 flex items-center">
          <BookOpen className="w-5 h-5 mr-2" />
          Dodaj Više Sesija Odjednom
        </h2>
        <p className="text-sm text-muted-foreground mb-4">
          Zalijepite poruku u formatu sa Vibera/WhatsAppa. Prva linija može biti ime korisnika (opciono).
        </p>
        <form onSubmit={handleMessageSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Ime Korisnika (opciono)
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Npr: Fahro, Marko..."
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Ako je prazno, koristi se trenutno izabrani korisnik. Novi korisnik će biti automatski kreiran.
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              Poruka sa Sesijama
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={`Fahro:\nGame 1. Steinitz W. - Lipke P. "Play against isolated pawn"\n18m 32s\nGame 1. Schlechter C. - John W. "2 Important Rules"\n22m 11s\n\nIli bez imena:\nGame 1. Test\n25m`}
              rows={8}
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm"
              required
            />
            <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs font-semibold text-blue-900 mb-1">📝 Primjeri formata:</p>
              <div className="text-xs text-blue-700 space-y-1 font-mono">
                <p>✓ Lekcija 1<br/>&nbsp;&nbsp;30m</p>
                <p>✓ Lekcija 2 45m 30s</p>
                <p>✓ Lekcija 3 1h 15m</p>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {loading ? 'Dodavanje...' : 'Dodaj Sesije'}
          </button>
        </form>
      </div>

      {/* Webhook Info */}
      <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
        <h2 className="text-xl font-bold mb-4 flex items-center text-blue-900">
          <Link2 className="w-5 h-5 mr-2" />
          Webhook URL za Integraciju
        </h2>
        <p className="text-sm text-blue-800 mb-3">
          Koristite ovaj URL za automatsko slanje poruka iz Viber/WhatsApp bota:
        </p>
        <div className="bg-white rounded-lg p-3 border border-blue-300 font-mono text-sm break-all mb-4">
          {webhookUrl}
        </div>
        
        <div className="space-y-3">
          <div>
            <p className="text-xs font-semibold text-blue-900 mb-2">📋 Format Zahtjeva (JSON)</p>
            
            <div className="space-y-2 mb-3">
              <div>
                <p className="text-xs text-blue-700 mb-1">Sa novim linijama:</p>
                <code className="block bg-white px-3 py-2 rounded text-xs border border-blue-200 overflow-x-auto">
                  {'{\n  "author": "Ime",\n  "content": "Game 1\\n30m\\nGame 2\\n25m"\n}'}
                </code>
              </div>
              
              <div>
                <p className="text-xs text-blue-700 mb-1">Inline (bez novih linija):</p>
                <code className="block bg-white px-3 py-2 rounded text-xs border border-blue-200 overflow-x-auto">
                  {'{\n  "author": "Ime",\n  "content": "Game 1 30m Game 2 25m"\n}'}
                </code>
              </div>
            </div>
            
            <p className="text-xs text-blue-500 mb-2">💡 Možete koristiti <code className="bg-white px-1 border border-blue-200">"message"</code> umjesto <code className="bg-white px-1 border border-blue-200">"content"</code></p>
            
            <div className="mt-2 space-y-1">
              <p className="text-xs text-blue-600">
                ✅ <strong>author</strong> - Korisničko ime (obavezno)
              </p>
              <p className="text-xs text-blue-600">
                ✅ <strong>content/message</strong> - Lekcije sa trajanjima
              </p>
              <p className="text-xs text-blue-700 mt-2">
                🤖 Automatski kreira korisnika | Prepoznaje trajanja
              </p>
            </div>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-blue-200">
          <p className="text-xs text-blue-700 mb-2">
            <strong>Podržani formati trajanja:</strong>
          </p>
          <div className="flex flex-wrap gap-2">
            <code className="text-xs bg-white px-2 py-1 rounded border border-blue-200">30m</code>
            <code className="text-xs bg-white px-2 py-1 rounded border border-blue-200">1h 30m</code>
            <code className="text-xs bg-white px-2 py-1 rounded border border-blue-200">45m 30s</code>
            <code className="text-xs bg-white px-2 py-1 rounded border border-blue-200">2h</code>
          </div>
        </div>
      </div>
    </div>
  )
}
