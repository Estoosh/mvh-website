import { useState, useEffect } from 'react'

const RED = '#ef4444'
const AMBER = '#f59e0b'
const GREEN = '#22c55e'

// Must stay in sync with VALID_BENEFIT_TYPES in
// pages/api/finance/create-benefit.js.
const BENEFIT_TYPES = ['Founder', 'Podcast', 'Strategic Partner', 'Promotional Campaign', 'Other']
const LIFETIME_PRESET_TYPES = ['Founder', 'Podcast']

const STATUS_COLOR = {
  'Active': GREEN,
  'Expired': '#999',
  'Manually Removed': RED
}

export default function BenefitPanel({ adminId, tableStyles }) {
  const { th, td } = tableStyles
  const [benefits, setBenefits] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [creating, setCreating] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ tour_id: '', guide_id: '', benefit_type: '', discount_percentage: '', end_date: '', notes: '' })

  const isPreset = LIFETIME_PRESET_TYPES.includes(form.benefit_type)

  const load = async function() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/finance/list-benefits?limit=100')
      const data = await res.json()
      if (!data.ok) { setError(data.error || 'load_failed'); setBenefits([]); return }
      setBenefits(data.records || [])
    } catch (e) {
      setError(e.message)
    }
    setLoading(false)
  }

  useEffect(function() { load() }, [])

  const handleCreate = async function(e) {
    e.preventDefault()
    if (!form.tour_id || !form.guide_id || !form.benefit_type) {
      window.alert('נא למלא Tour ID, Guide ID וסוג הטבה')
      return
    }
    if (!isPreset && !form.discount_percentage) {
      window.alert('נא להזין אחוז הנחה')
      return
    }
    setCreating(true)
    setError(null)
    try {
      const body = {
        tour_id: form.tour_id,
        guide_id: form.guide_id,
        benefit_type: form.benefit_type,
        created_by: adminId
      }
      if (!isPreset) {
        body.discount_percentage = Number(form.discount_percentage)
        if (form.end_date) body.end_date = form.end_date
      }
      if (form.notes) body.notes = form.notes

      const res = await fetch('/api/finance/create-benefit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      const data = await res.json()
      if (!data.ok) { setError(data.error || 'create_failed'); setCreating(false); return }
      setForm({ tour_id: '', guide_id: '', benefit_type: '', discount_percentage: '', end_date: '', notes: '' })
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
        <p style={{ fontSize: 13, color: '#888' }}>{benefits.length} הטבות</p>
        <button onClick={() => setShowForm(!showForm)}
          style={{ background: '#111', color: '#fff', padding: '10px 24px', borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: 'pointer', border: 'none', fontFamily: 'Heebo, Arial, sans-serif' }}>
          {showForm ? 'ביטול' : '+ הטבה חדשה'}
        </button>
      </div>

      {/* NOTE: no "remove benefit" action here yet — no backend route
          exists for deactivating a Benefit. Assign-only for now. */}
      {showForm && (
        <form onSubmit={handleCreate} style={{ background: '#fff', border: '1px solid #EDE7DF', borderRadius: 14, padding: 24, marginBottom: 24 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 12, marginBottom: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>Tour ID</label>
              <input type="text" value={form.tour_id} onChange={e => setForm(Object.assign({}, form, { tour_id: e.target.value }))} style={inp} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>Guide ID</label>
              <input type="text" value={form.guide_id} onChange={e => setForm(Object.assign({}, form, { guide_id: e.target.value }))} style={inp} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>סוג הטבה</label>
              <select value={form.benefit_type} onChange={e => setForm(Object.assign({}, form, { benefit_type: e.target.value }))} style={inp}>
                <option value="">בחר...</option>
                {BENEFIT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            {!isPreset && (
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>אחוז הנחה</label>
                <input type="number" min="1" max="100" value={form.discount_percentage} onChange={e => setForm(Object.assign({}, form, { discount_percentage: e.target.value }))} style={inp} />
              </div>
            )}
            {!isPreset && (
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>תאריך סיום (ריק = ללא הגבלה)</label>
                <input type="date" value={form.end_date} onChange={e => setForm(Object.assign({}, form, { end_date: e.target.value }))} style={inp} />
              </div>
            )}
          </div>
          {isPreset && (
            <p style={{ fontSize: 12, color: '#888', marginBottom: 12 }}>Preset: 100% הנחה, Lifetime, ללא תאריך סיום — נקבע אוטומטית.</p>
          )}
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>הערות (אופציונלי)</label>
            <input type="text" value={form.notes} onChange={e => setForm(Object.assign({}, form, { notes: e.target.value }))} style={inp} />
          </div>
          <button type="submit" disabled={creating}
            style={{ background: AMBER, color: '#fff', padding: '10px 24px', borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: creating ? 'not-allowed' : 'pointer', border: 'none', fontFamily: 'Heebo, Arial, sans-serif', opacity: creating ? 0.7 : 1 }}>
            {creating ? 'יוצר...' : 'הקצה הטבה'}
          </button>
        </form>
      )}

      {error && <p style={{ color: RED, fontSize: 13, marginBottom: 16 }}>שגיאה: {error}</p>}
      {loading && <p style={{ color: '#888' }}>טוען...</p>}

      {!loading && benefits.length === 0 && (
        <div style={{ background: '#fff', borderRadius: 14, padding: 40, textAlign: 'center', border: '1px solid #EDE7DF' }}>
          <p style={{ color: '#B0A89E', fontSize: 15 }}>אין הטבות</p>
        </div>
      )}

      {!loading && benefits.length > 0 && (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['מדריך (ID)', 'סיור (ID)', 'סוג', 'אחוז', 'Lifetime', 'התחלה', 'סיום', 'סטטוס'].map(h => <th key={h} style={th}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {benefits.map(function(b) {
                return (
                  <tr key={b.id}>
                    <td style={td}>{Array.isArray(b.Guide_ID) ? b.Guide_ID.join(', ') : b.Guide_ID}</td>
                    <td style={td}>{Array.isArray(b.Tour_ID) ? b.Tour_ID.join(', ') : b.Tour_ID}</td>
                    <td style={td}>{b.Benefit_Type}</td>
                    <td style={td}>{b.Discount_Percentage}%</td>
                    <td style={td}>{b.Lifetime_Benefit ? '✓' : '-'}</td>
                    <td style={td}>{b.Start_Date}</td>
                    <td style={td}>{b.End_Date || '-'}</td>
                    <td style={td}>
                      <span style={{ background: (STATUS_COLOR[b.Benefit_Status] || '#999') + '22', color: STATUS_COLOR[b.Benefit_Status] || '#999', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 12 }}>
                        {b.Benefit_Status}
                      </span>
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
