import { useState } from 'react'
import { Plus, Clock, BookOpen, CheckCircle, Link2, Calendar, Users } from 'lucide-react'

export default function AddSession({ userId, onSessionAdded, users }) {
  const [lessonName, setLessonName] = useState('')
  const [hours, setHours] = useState(0)
  const [minutes, setMinutes] = useState(0)
  const [seconds, setSeconds] = useState(0)
  const [message, setMessage] = useState('')
  const [username, setUsername] = useState('')
  const [selectedDate, setSelectedDate] = useState('today')
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

    // Calculate the date based on selection
    const date = selectedDate === 'today' 
      ? new Date().toISOString().split('T')[0]
      : new Date(Date.now() - 86400000).toISOString().split('T')[0]

    try {
      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          lessonName,
          duration: totalSeconds,
          userId: userId,
          date: date
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
        <div className="bg-green-50 border-2 border-green-400 px-6 py-4 rounded-lg flex items-center gap-3 shadow-sm">
          <div className="p-2 bg-success rounded-lg">
            <CheckCircle className="w-5 h-5 text-white" />
          </div>
          <span className="font-semibold text-gray-800">
            {sessionsAdded > 0 
              ? `✅ Uspješno dodano ${sessionsAdded} ${sessionsAdded === 1 ? 'sesija' : sessionsAdded < 5 ? 'sesije' : 'sesija'}!`
              : '✅ Sesija uspješno dodana!'}
          </span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border-2 border-red-400 px-6 py-4 rounded-lg shadow-sm">
          <span className="font-semibold text-red-700">❌ {error}</span>
        </div>
      )}

      {/* Manual Entry */}
      <div className="card p-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
            <Plus className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Dodaj Novu Sesiju</h2>
            <p className="text-sm text-gray-500 mt-1">Unesi detalje studijske sesije</p>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="form-section">
          <div>
            <label className="block text-sm font-medium mb-2">
              <BookOpen className="w-4 h-4 inline mr-1" />
              Naziv Lekcije
            </label>
            <input
              type="text"
              value={lessonName}
              onChange={(e) => setLessonName(e.target.value)}
              placeholder="npr. Lekcija 1, Game 1, Poglavlje 3..."
              className="input-modern"
              required
            />
          </div>

          <div>
            <label className="form-label flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-600" />
              Trajanje
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <input
                  type="number"
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                  placeholder="0"
                  min="0"
                  className="input-modern text-center"
                  required
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium">h</span>
              </div>
              <div className="relative">
                <input
                  type="number"
                  value={minutes}
                  onChange={(e) => setMinutes(e.target.value)}
                  placeholder="0"
                  min="0"
                  max="59"
                  className="input-modern text-center"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium">min</span>
              </div>
              <div className="relative">
                <input
                  type="number"
                  value={seconds}
                  onChange={(e) => setSeconds(e.target.value)}
                  placeholder="0"
                  min="0"
                  max="59"
                  className="input-modern text-center"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium">sek</span>
              </div>
            </div>
          </div>

          <div>
            <label className="form-label flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-600" />
              Datum
            </label>
            <select
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="input-modern cursor-pointer"
            >
              <option value="today">Danas ({new Date().toLocaleDateString('sr-Latn', { day: 'numeric', month: 'long' })})</option>
              <option value="yesterday">Juče ({new Date(Date.now() - 86400000).toLocaleDateString('sr-Latn', { day: 'numeric', month: 'long' })})</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full mt-2"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Clock className="w-4 h-4 animate-spin" />
                Dodavanje...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Plus className="w-5 h-5" />
                Dodaj Sesiju
              </span>
            )}
          </button>
        </form>
      </div>

      {/* Message Format Entry */}
      <div className="card p-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Batch Import</h2>
            <p className="text-sm text-gray-500 mt-1">Dodaj više sesija odjednom</p>
          </div>
        </div>
        <form onSubmit={handleMessageSubmit} className="form-section">
          <div>
            <label className="form-label flex items-center gap-2">
              <Users className="w-4 h-4 text-gray-600" />
              Ime Korisnika (opciono)
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Npr: Fahro, Marko..."
              className="input-modern"
            />
            <p className="text-xs text-gray-500 mt-2">
              💡 Ako je prazno, koristi se trenutno izabrani korisnik
            </p>
          </div>
          <div>
            <label className="form-label text-base font-bold text-gray-900 mb-3">
              📝 Unesi sesije
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={`Game 1. Steinitz\n18m 32s\nGame 2. Schlechter\n22m 11s`}
              rows={10}
              className="input-modern font-mono text-base bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 focus:border-green-500 focus:bg-white shadow-sm"
              required
            />
            <div className="mt-4 p-4 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl">
              <p className="text-sm font-bold text-green-900 mb-3 flex items-center gap-2">
                <span className="text-lg">📝</span>
                Format primjeri:
              </p>
              <div className="text-sm text-green-800 space-y-2 font-mono bg-white/70 p-3 rounded-lg">
                <p className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span>Lekcija 1<br/>&nbsp;&nbsp;30m</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span>Lekcija 2 45m 30s</span>
                </p>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full mt-2"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Clock className="w-4 h-4 animate-spin" />
                Dodavanje...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <BookOpen className="w-5 h-5" />
                Dodaj Sesije
              </span>
            )}
          </button>
        </form>
      </div>

      {/* Webhook Info */}
      <div className="card p-8 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl shadow-lg">
            <Link2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">API Webhook</h2>
            <p className="text-sm text-gray-600 mt-1">Za automatsku integraciju</p>
          </div>
        </div>
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
