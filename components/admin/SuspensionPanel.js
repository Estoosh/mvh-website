import { useState, useEffect } from 'react'

const RED = '#ef4444'
const GREEN = '#22c55e'
const AMBER = '#f59e0b'

function daysRemaining(endDate) {
  if (!endDate) return null
  const diffMs = new Date(endDate) - new Date()
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24))
}

export default function SuspensionPanel({ adminId, tableStyles }) {
  const { th, td } = tableStyles
  const [suspensions, setSuspensions] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [creating, setCreating] = useState(false)
  const [endingId, setEndingId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ guide_id: '', invoice_id: '', start_date: '', end_date: '', notes: '' })

  const load = async function() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/finance/list-suspensions?limit=100')
      const data = await res.json()
      if (!data.ok) { setError(data.error || 'load_failed'); setSuspensions([]); return }
      setSuspensions(data.records || [])
    } catch (e) {
      setError(e.message)
    }
    setLoading(false)
  }

  useEffect(function() { load() }, [])

  const handleCreate = async function(e) {
    e.preventDefault()
    if (!form.guide_id || !form.invoice_id || !form.start_date || !form.end_date) {
      window.alert('נא למלא Guide ID, Invoice ID, תאריך התחלה ותאריך סיום')
      return
    }
    setCreating(true)
    setError(null)
    try {
      const res = await fetch('/api/finance/create-suspension', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Object.assign({}, form, { created_by: adminId }))
      })
      const data = await res.json()
      if (!data.ok) { setError(data.error || 'create_failed'); setCreating(false); return }
      setForm({ guide_id: '', invoice_id: '', start_date: '', end_date: '', notes: '' })
      setShowForm(false)
      await load()
    } catch (e) {
      setError(e.message)
    }
    setCreating(false)
  }

  const handleEnd = async function(suspensionId) {
    if (!window.confirm('לסיים את ההשהיה הזו?')) return
    setEndingId(suspensionId)
    setError(null)
    try {
      const res = await fetch('/api/finance/end-suspension', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ suspension_id: suspensionId, updated_by: adminId })
      })
      const data = await res.json()
      if (!data.ok) { setError(data.error || 'end_failed'); setEndingId(null); return }
      await load()
    } catch (e) {
      setError(e.message)
    }
    setEndingId(null)
  }

  const inp = { width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #ddd', fontSize: 13, fontFamily: 'Heebo, Arial, sans-serif', outline: 'none', boxSizing: 'border-box' }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <p style={{ fontSize: 13, color: '#888' }}>{suspensions.length} השהיות</p>
        <button onClick={() => setShowForm(!showForm)}
          style={{ background: '#111', color: '#fff', padding: '10px 24px', borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: 'pointer', border: 'none', fontFamily: 'Heebo, Arial, sans-serif' }}>
          {showForm ? 'ביטול' : '+ השהיה חדשה'}
        </button>
      </div>

      {/* NOTE: Guide ID / Invoice ID are entered as raw Airtable record IDs.
          No guide/invoice picker is wired into this panel yet. */}
      {showForm && (
        <form onSubmit={handleCreate} style={{ background: '#fff', border: '1px solid #EDE7DF', borderRadius: 14, padding: 24, marginBottom: 24 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 12, marginBottom: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>Guide ID</label>
              <input type="text" value={form.guide_id} onChange={e => setForm(Object.assign({}, form, { guide_id: e.target.value }))} style={inp} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>Invoice ID</label>
              <input type="text" value={form.invoice_id} onChange={e => setForm(Object.assign({}, form, { invoice_id: e.target.value }))} style={inp} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>תאריך התחלה</label>
              <input type="date" value={form.start_date} onChange={e => setForm(Object.assign({}, form, { start_date: e.target.value }))} style={inp} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>תאריך סיום</label>
              <input type="date" value={form.end_date} onChange={e => setForm(Object.assign({}, form, { end_date: e.target.value }))} style={inp} />
            </div>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>הערות (אופציונלי)</label>
            <input type="text" value={form.notes} onChange={e => setForm(Object.assign({}, form, { notes: e.target.value }))} style={inp} />
          </div>
          <p style={{ fontSize: 12, color: '#888', marginBottom: 12 }}>סיבה: Failed to charge the payment method on file. (קבועה)</p>
          <button type="submit" disabled={creating}
            style={{ background: AMBER, color: '#fff', padding: '10px 24px', borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: creating ? 'not-allowed' : 'pointer', border: 'none', fontFamily: 'Heebo, Arial, sans-serif', opacity: creating ? 0.7 : 1 }}>
            {creating ? 'יוצר...' : 'צור השהיה'}
          </button>
        </form>
      )}

      {error && <p style={{ color: RED, fontSize: 13, marginBottom: 16 }}>שגיאה: {error}</p>}
      {loading && <p style={{ color: '#888' }}>טוען...</p>}

      {!loading && suspensions.length === 0 && (
        <div style={{ background: '#fff', borderRadius: 14, padding: 40, textAlign: 'center', border: '1px solid #EDE7DF' }}>
          <p style={{ color: '#B0A89E', fontSize: 15 }}>אין השהיות</p>
        </div>
      )}

      {!loading && suspensions.length > 0 && (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['מדריך (ID)', 'התחלה', 'סיום', 'ימים נותרו', 'סטטוס', 'פעולות'].map(h => <th key={h} style={th}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {suspensions.map(function(s) {
                const remaining = s.Status === 'Active' ? daysRemaining(s.End_Date) : null
                return (
                  <tr key={s.id}>
                    <td style={td}>{Array.isArray(s.Guide_ID) ? s.Guide_ID.join(', ') : s.Guide_ID}</td>
                    <td style={td}>{s.Start_Date}</td>
                    <td style={td}>{s.End_Date}</td>
                    <td style={td}>{remaining !== null ? (remaining >= 0 ? remaining + ' ימים' : 'עבר המועד') : '-'}</td>
                    <td style={td}>
                      <span style={{ background: (s.Status === 'Active' ? AMBER : '#999') + '22', color: s.Status === 'Active' ? AMBER : '#999', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 12 }}>
                        {s.Status}
                      </span>
                    </td>
                    <td style={td}>
                      {s.Status === 'Active' && (
                        <button onClick={() => handleEnd(s.id)} disabled={endingId === s.id}
                          style={{ padding: '4px 10px', fontSize: 12, borderRadius: 6, border: '1px solid ' + GREEN, color: GREEN, cursor: 'pointer', background: '#fff' }}>
                          סיים השהיה
                        </button>
                      )}
                    </td>
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
