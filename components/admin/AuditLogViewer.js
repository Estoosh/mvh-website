import { useState, useEffect, useMemo } from 'react'

const RED = '#ef4444'

const MODULES = ['All', 'Finance', 'Moderation', 'Control Center', 'Other']

export default function AuditLogViewer({ tableStyles }) {
  const { th, td } = tableStyles
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [moduleFilter, setModuleFilter] = useState('All')
  const [actorFilter, setActorFilter] = useState('')

  const load = async function() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/finance/list-audit-log?limit=100')
      const data = await res.json()
      if (!data.ok) { setError(data.error || 'load_failed'); setLogs([]); return }
      setLogs(data.records || [])
    } catch (e) {
      setError(e.message)
    }
    setLoading(false)
  }

  useEffect(function() { load() }, [])

  const filteredLogs = useMemo(function() {
    return logs.filter(function(l) {
      if (moduleFilter !== 'All' && l.Module !== moduleFilter) return false
      if (actorFilter && !(l.Actor || '').toLowerCase().includes(actorFilter.toLowerCase())) return false
      return true
    })
  }, [logs, moduleFilter, actorFilter])

  const inp = { padding: '8px 12px', borderRadius: 6, border: '1px solid #ddd', fontSize: 13, fontFamily: 'Heebo, Arial, sans-serif', outline: 'none' }

  return (
    <div>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 20, flexWrap: 'wrap' }}>
        <p style={{ fontSize: 13, color: '#888' }}>{filteredLogs.length} מתוך {logs.length} רשומות</p>
        <select value={moduleFilter} onChange={e => setModuleFilter(e.target.value)} style={inp}>
          {MODULES.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
        <input type="text" placeholder="סינון לפי מבצע (Actor)" value={actorFilter} onChange={e => setActorFilter(e.target.value)} style={inp} />
      </div>

      {error && <p style={{ color: RED, fontSize: 13, marginBottom: 16 }}>שגיאה: {error}</p>}
      {loading && <p style={{ color: '#888' }}>טוען...</p>}

      {!loading && filteredLogs.length === 0 && (
        <div style={{ background: '#fff', borderRadius: 14, padding: 40, textAlign: 'center', border: '1px solid #EDE7DF' }}>
          <p style={{ color: '#B0A89E', fontSize: 15 }}>אין רשומות תואמות</p>
        </div>
      )}

      {!loading && filteredLogs.length > 0 && (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['זמן', 'מבצע', 'מודול', 'פעולה', 'סוג יעד', 'יעד', 'סיבה'].map(h => <th key={h} style={th}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map(function(l) {
                return (
                  <tr key={l.id}>
                    <td style={td}>{l.Timestamp ? new Date(l.Timestamp).toLocaleString('he-IL') : '-'}</td>
                    <td style={td}>{l.Actor}</td>
                    <td style={td}>{l.Module}</td>
                    <td style={td}>{l.Action_Type}</td>
                    <td style={td}>{l.Target_Type || '-'}</td>
                    <td style={td}>{l.Target_ID || '-'}</td>
                    <td style={td}>{l.Reason || '-'}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
