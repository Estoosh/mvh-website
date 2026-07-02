import { useState, useEffect } from 'react'

const RED = '#ef4444'
const AMBER = '#f59e0b'
const GREEN = '#22c55e'

const ENTRY_TYPES = ['Email', 'Phone', 'Guide_ID', 'IP_Address']

export default function BlocklistPanel({ adminId, tableStyles }) {
  const { th, td } = tableStyles
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const [showEntryForm, setShowEntryForm] = useState(false)
  const [entryForm, setEntryForm] = useState({ type: '', value: '', reason: '', expires_at: '' })
  const [creatingEntry, setCreatingEntry] = useState(false)

  const [blockTarget, setBlockTarget] = useState({ kind: 'guide', id: '', reason: '' })
  const [blocking, setBlocking] = useState(false)
  const [unblockGuideId, setUnblockGuideId] = useState('')
  const [unblocking, setUnblocking] = useState(false)
  const [actionResult, setActionResult] = useState(null)

  const load = async function() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/control/list-blocklist?limit=100')
      const data = await res.json()
      if (!data.ok) { setError(data.error || 'load_failed'); setEntries([]); return }
      setEntries(data.records || [])
    } catch (e) {
      setError(e.message)
    }
    setLoading(false)
  }

  useEffect(function() { load() }, [])

  const inp = { width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #ddd', fontSize: 13, fontFamily: 'Heebo, Arial, sans-serif', outline: 'none', boxSizing: 'border-box' }

  const handleAddEntry = async function(e) {
    e.preventDefault()
    if (!entryForm.type || !entryForm.value || !entryForm.reason) {
      window.alert('נא למלא סוג, ערך וסיבה')
      return
    }
    setCreatingEntry(true)
    setError(null)
    try {
      const res = await fetch('/api/control/add-blocklist-entry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Object.assign({}, entryForm, { created_by: adminId }))
      })
      const data = await res.json()
      if (!data.ok) { setError(data.error || 'create_failed'); setCreatingEntry(false); return }
      setEntryForm({ type: '', value: '', reason: '', expires_at: '' })
      setShowEntryForm(false)
      await load()
    } catch (e) {
      setError(e.message)
    }
    setCreatingEntry(false)
  }

  const handleBlock = async function(e) {
    e.preventDefault()
    if (!blockTarget.id || !blockTarget.reason) {
      window.alert('נא למלא ID וסיבה')
      return
    }
    setBlocking(true)
    setError(null)
    setActionResult(null)
    try {
      const endpoint = blockTarget.kind === 'guide' ? '/api/control/block-guide' : '/api/control/block-signup'
      const body = blockTarget.kind === 'guide'
        ? { guide_id: blockTarget.id, reason: blockTarget.reason, created_by: adminId }
        : { signup_id: blockTarget.id, reason: blockTarget.reason, created_by: adminId }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      const data = await res.json()
      if (!data.ok) { setError(data.error || 'block_failed'); setBlocking(false); return }
      setActionResult(data)
      setBlockTarget({ kind: 'guide', id: '', reason: '' })
      await load()
    } catch (e) {
      setError(e.message)
    }
    setBlocking(false)
  }

  const handleUnblockGuide = async function(e) {
    e.preventDefault()
    if (!unblockGuideId) { window.alert('נא להזין Guide ID'); return }
    setUnblocking(true)
    setError(null)
    try {
      const res = await fetch('/api/control/unblock-guide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guide_id: unblockGuideId, updated_by: adminId })
      })
      const data = await res.json()
      if (!data.ok) { setError(data.error || 'unblock_failed'); setUnblocking(false); return }
      setUnblockGuideId('')
    } catch (e) {
      setError(e.message)
    }
    setUnblocking(false)
  }

  return (
    <div>
      {/* Block / Unblock an existing guide or community member */}
      <div style={{ background: '#fff', border: '1px solid #EDE7DF', borderRadius: 14, padding: 24, marginBottom: 24 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>חסימת מדריך / חבר קהילה קיים</h3>
        <form onSubmit={handleBlock} style={{ marginBottom: 20 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 12, marginBottom: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>סוג</label>
              <select value={blockTarget.kind} onChange={e => setBlockTarget(Object.assign({}, blockTarget, { kind: e.target.value }))} style={inp}>
                <option value="guide">מדריך</option>
                <option value="signup">חבר קהילה</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>{blockTarget.kind === 'guide' ? 'Guide ID' : 'Signup ID'}</label>
              <input type="text" value={blockTarget.id} onChange={e => setBlockTarget(Object.assign({}, blockTarget, { id: e.target.value }))} style={inp} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>סיבה</label>
              <input type="text" value={blockTarget.reason} onChange={e => setBlockTarget(Object.assign({}, blockTarget, { reason: e.target.value }))} style={inp} />
            </div>
          </div>
          <button type="submit" disabled={blocking}
            style={{ background: RED, color: '#fff', padding: '10px 24px', borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: blocking ? 'not-allowed' : 'pointer', border: 'none', fontFamily: 'Heebo, Arial, sans-serif', opacity: blocking ? 0.7 : 1 }}>
            {blocking ? 'חוסם...' : 'חסום'}
          </button>
        </form>

        {actionResult && (
          <p style={{ fontSize: 12, color: '#888', marginBottom: 16 }}>
            נוצרו {actionResult.blocklistEntriesCreated} רשומות Blocklist{actionResult.toursHidden !== undefined ? `, ${actionResult.toursHidden} סיורים הוסתרו` : ''}
          </p>
        )}

        <form onSubmit={handleUnblockGuide} style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>ביטול חסימת מדריך — Guide ID</label>
            <input type="text" value={unblockGuideId} onChange={e => setUnblockGuideId(e.target.value)} style={inp} />
          </div>
          <button type="submit" disabled={unblocking}
            style={{ background: GREEN, color: '#fff', padding: '10px 24px', borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: unblocking ? 'not-allowed' : 'pointer', border: 'none', fontFamily: 'Heebo, Arial, sans-serif', opacity: unblocking ? 0.7 : 1 }}>
            {unblocking ? 'מבטל...' : 'בטל חסימה'}
          </button>
        </form>
        <p style={{ fontSize: 11, color: '#B0A89E', marginTop: 8 }}>ביטול חסימה לא משחזר אוטומטית נראות של סיורים שהוסתרו.</p>
      </div>

      {/* Manual Blocklist entries (path B) */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <p style={{ fontSize: 13, color: '#888' }}>{entries.length} רשומות ברשימה השחורה</p>
        <button onClick={() => setShowEntryForm(!showEntryForm)}
          style={{ background: '#111', color: '#fff', padding: '10px 24px', borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: 'pointer', border: 'none', fontFamily: 'Heebo, Arial, sans-serif' }}>
          {showEntryForm ? 'ביטול' : '+ חסימה ידנית מראש'}
        </button>
      </div>

      {showEntryForm && (
        <form onSubmit={handleAddEntry} style={{ background: '#fff', border: '1px solid #EDE7DF', borderRadius: 14, padding: 24, marginBottom: 24 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 12, marginBottom: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>סוג</label>
              <select value={entryForm.type} onChange={e => setEntryForm(Object.assign({}, entryForm, { type: e.target.value }))} style={inp}>
                <option value="">בחר...</option>
                {ENTRY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>ערך</label>
              <input type="text" value={entryForm.value} onChange={e => setEntryForm(Object.assign({}, entryForm, { value: e.target.value }))} style={inp} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>תוקף (ריק = לצמיתות)</label>
              <input type="date" value={entryForm.expires_at} onChange={e => setEntryForm(Object.assign({}, entryForm, { expires_at: e.target.value }))} style={inp} />
            </div>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>סיבה</label>
            <input type="text" value={entryForm.reason} onChange={e => setEntryForm(Object.assign({}, entryForm, { reason: e.target.value }))} style={inp} />
          </div>
          <button type="submit" disabled={creatingEntry}
            style={{ background: AMBER, color: '#fff', padding: '10px 24px', borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: creatingEntry ? 'not-allowed' : 'pointer', border: 'none', fontFamily: 'Heebo, Arial, sans-serif', opacity: creatingEntry ? 0.7 : 1 }}>
            {creatingEntry ? 'יוצר...' : 'הוסף לרשימה השחורה'}
          </button>
        </form>
      )}

      {error && <p style={{ color: RED, fontSize: 13, marginBottom: 16 }}>שגיאה: {error}</p>}
      {loading && <p style={{ color: '#888' }}>טוען...</p>}

      {!loading && entries.length === 0 && (
        <div style={{ background: '#fff', borderRadius: 14, padding: 40, textAlign: 'center', border: '1px solid #EDE7DF' }}>
          <p style={{ color: '#B0A89E', fontSize: 15 }}>הרשימה השחורה ריקה</p>
        </div>
      )}

      {!loading && entries.length > 0 && (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>{['סוג', 'ערך', 'מקור', 'סיבה', 'נוצר', 'תוקף', 'סטטוס'].map(h => <th key={h} style={th}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {entries.map(function(e) {
                return (
                  <tr key={e.id}>
                    <td style={td}>{e.Type}</td>
                    <td style={td}>{e.Value}</td>
                    <td style={td}>{e.Block_Source}</td>
                    <td style={td}>{e.Reason}</td>
                    <td style={td}>{e.Created_At ? new Date(e.Created_At).toLocaleDateString('he-IL') : '-'}</td>
                    <td style={td}>{e.Expires_At || 'לצמיתות'}</td>
                    <td style={td}>{e.Status}</td>
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
