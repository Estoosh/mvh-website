import { useState, useEffect } from 'react'

const RED = '#ef4444'
const AMBER = '#f59e0b'

// Must stay in sync with CREDIT_PERCENTAGE_PRESETS in lib/finance-calc.js.
const CREDIT_PERCENTAGE_PRESETS = [5, 10, 25, 50, 75, 100]

// Must stay in sync with VALID_REASON_CATEGORIES in
// pages/api/finance/create-credit.js.
const REASON_CATEGORIES = [
  'Duplicate billing',
  'Incorrect discount application',
  'Billing calculation errors',
  'Incorrect proration calculations',
  'Administrative errors',
  'Technical failures',
  'Strategic goodwill gesture',
  'Exceptional customer support case',
  'Military reserve service compensation',
  'Injury related compensation',
  'Executive management decision'
]

const STATUS_COLOR = {
  'Pending': AMBER,
  'Submitted': '#3b82f6',
  'Completed': '#22c55e',
  'Cancelled': '#999',
  'Failed': RED,
  'Retry Pending': AMBER,
  'Manual Review Required': RED
}

export default function CreditPanel({ adminId, tableStyles }) {
  const { th, td } = tableStyles
  const [credits, setCredits] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [creating, setCreating] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ invoice_id: '', guide_id: '', credit_percentage: '', reason: '', internal_notes: '' })

  const load = async function() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/finance/list-credits?limit=100')
      const data = await res.json()
      if (!data.ok) { setError(data.error || 'load_failed'); setCredits([]); return }
      setCredits(data.records || [])
    } catch (e) {
      setError(e.message)
    }
    setLoading(false)
  }

  useEffect(function() { load() }, [])

  const handleCreate = async function(e) {
    e.preventDefault()
    if (!form.invoice_id || !form.guide_id || !form.credit_percentage || !form.reason) {
      window.alert('נא למלא Invoice ID, Guide ID, אחוז וסיבה')
      return
    }
    setCreating(true)
    setError(null)
    try {
      const res = await fetch('/api/finance/create-credit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Object.assign({}, form, { credit_percentage: Number(form.credit_percentage), created_by: adminId }))
      })
      const data = await res.json()
      if (!data.ok) { setError(data.error || 'create_failed'); setCreating(false); return }
      setForm({ invoice_id: '', guide_id: '', credit_percentage: '', reason: '', internal_notes: '' })
      setShowForm(false)
      await load()
    } catch (e) {
      setError(e.message)
    }
    setCreating(false)
  }

  const inp = { width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #ddd', fontSize: 13, fontFamily: 'Heebo, Arial, sans-serif', outline: 'none', boxSizing: 'border-box' }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <p style={{ fontSize: 13, color: '#888' }}>{credits.length} זיכויים</p>
        <button onClick={() => setShowForm(!showForm)}
          style={{ background: '#111', color: '#fff', padding: '10px 24px', borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: 'pointer', border: 'none', fontFamily: 'Heebo, Arial, sans-serif' }}>
          {showForm ? 'ביטול' : '+ זיכוי חדש'}
        </button>
      </div>

      {/* NOTE: Guide ID / Invoice ID are entered as raw Airtable record IDs.
          No guide/invoice picker is wired into this panel yet. */}
      {showForm && (
        <form onSubmit={handleCreate} style={{ background: '#fff', border: '1px solid #EDE7DF', borderRadius: 14, padding: 24, marginBottom: 24 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 12, marginBottom: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>Invoice ID</label>
              <input type="text" value={form.invoice_id} onChange={e => setForm(Object.assign({}, form, { invoice_id: e.target.value }))} style={inp} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>Guide ID</label>
              <input type="text" value={form.guide_id} onChange={e => setForm(Object.assign({}, form, { guide_id: e.target.value }))} style={inp} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>אחוז זיכוי</label>
              <select value={form.credit_percentage} onChange={e => setForm(Object.assign({}, form, { credit_percentage: e.target.value }))} style={inp}>
                <option value="">בחר...</option>
                {CREDIT_PERCENTAGE_PRESETS.map(p => <option key={p} value={p}>{p}%</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>סיבה</label>
              <select value={form.reason} onChange={e => setForm(Object.assign({}, form, { reason: e.target.value }))} style={inp}>
                <option value="">בחר...</option>
                {REASON_CATEGORIES.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>הערות פנימיות (אופציונלי)</label>
            <input type="text" value={form.internal_notes} onChange={e => setForm(Object.assign({}, form, { internal_notes: e.target.value }))} style={inp} />
          </div>
          <button type="submit" disabled={creating}
            style={{ background: AMBER, color: '#fff', padding: '10px 24px', borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: creating ? 'not-allowed' : 'pointer', border: 'none', fontFamily: 'Heebo, Arial, sans-serif', opacity: creating ? 0.7 : 1 }}>
            {creating ? 'יוצר...' : 'צור זיכוי'}
          </button>
        </form>
      )}

      {error && <p style={{ color: RED, fontSize: 13, marginBottom: 16 }}>שגיאה: {error}</p>}
      {loading && <p style={{ color: '#888' }}>טוען...</p>}

      {!loading && credits.length === 0 && (
        <div style={{ background: '#fff', borderRadius: 14, padding: 40, textAlign: 'center', border: '1px solid #EDE7DF' }}>
          <p style={{ color: '#B0A89E', fontSize: 15 }}>אין זיכויים</p>
        </div>
      )}

      {!loading && credits.length > 0 && (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['מדריך (ID)', 'חשבונית (ID)', 'אחוז', 'סכום', 'סיבה', 'סטטוס', 'נוצר'].map(h => <th key={h} style={th}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {credits.map(function(c) {
                return (
                  <tr key={c.id}>
                    <td style={td}>{Array.isArray(c.Guide_ID) ? c.Guide_ID.join(', ') : c.Guide_ID}</td>
                    <td style={td}>{Array.isArray(c.Invoice_ID) ? c.Invoice_ID.join(', ') : c.Invoice_ID}</td>
                    <td style={td}>{c.Credit_Percentage}%</td>
                    <td style={td}>{c.Credit_Amount} ₪</td>
                    <td style={td}>{c.Reason}</td>
                    <td style={td}>
                      <span style={{ background: (STATUS_COLOR[c.Status] || '#999') + '22', color: STATUS_COLOR[c.Status] || '#999', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 12 }}>
                        {c.Status}
                      </span>
                    </td>
                    <td style={td}>{c.Created_At ? new Date(c.Created_At).toLocaleDateString('he-IL') : '-'}</td>
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
