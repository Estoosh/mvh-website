import { useState, useEffect } from 'react'

const RED = '#ef4444'
const AMBER = '#f59e0b'
const GREEN = '#22c55e'
const BROWN = '#7E4821'

const FILTERS = [
  ['has_whatsapp', 'יש WhatsApp'],
  ['has_email', 'יש אימייל'],
  ['missing_contact', 'חסר קשר'],
  ['founder_candidate', 'מועמד Founder'],
  ['registered', 'כבר נרשמו']
]

export default function DiscoveryQueuePanel({ adminId, tableStyles }) {
  const { th, td } = tableStyles

  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [activeFilters, setActiveFilters] = useState([])
  const [search, setSearch] = useState('')

  const [showAddForm, setShowAddForm] = useState(false)
  const [addForm, setAddForm] = useState({ guide_name: '', business_name: '', email: '', whatsapp_number: '', guide_title: '', invite_source: '' })
  const [adding, setAdding] = useState(false)

  const [importing, setImporting] = useState(false)
  const [importSummary, setImportSummary] = useState(null)

  const inp = { width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #ddd', fontSize: 13, fontFamily: 'Heebo, Arial, sans-serif', outline: 'none', boxSizing: 'border-box' }

  const load = async function() {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      activeFilters.forEach((f) => params.set(f, 'true'))
      if (search) params.set('search', search)

      const res = await fetch('/api/discovery/list-discovery?' + params.toString())
      const data = await res.json()
      if (!data.ok) { setError(data.error || 'load_failed'); setRecords([]); return }
      setRecords(data.records || [])
    } catch (e) {
      setError(e.message)
    }
    setLoading(false)
  }

  useEffect(function() { load() }, [activeFilters, search])

  const toggleFilter = function(key) {
    setActiveFilters((prev) => (prev.includes(key) ? prev.filter((f) => f !== key) : prev.concat(key)))
  }

  const handleAdd = async function(e) {
    e.preventDefault()
    if (!addForm.guide_name) { window.alert('שם המדריך חובה'); return }
    setAdding(true)
    setError(null)
    try {
      const res = await fetch('/api/discovery/add-discovery-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Object.assign({}, addForm, { created_by: adminId }))
      })
      const data = await res.json()
      if (!data.ok) { setError(data.error || 'add_failed'); setAdding(false); return }
      setAddForm({ guide_name: '', business_name: '', email: '', whatsapp_number: '', guide_title: '', invite_source: '' })
      setShowAddForm(false)
      await load()
    } catch (e) {
      setError(e.message)
    }
    setAdding(false)
  }

  const handleFileUpload = function(e) {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = async function(event) {
      setImporting(true)
      setError(null)
      setImportSummary(null)
      try {
        const res = await fetch('/api/discovery/import-csv', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ csv_text: event.target.result, created_by: adminId })
        })
        const data = await res.json()
        if (!data.ok) { setError(data.error || 'import_failed'); setImporting(false); return }
        setImportSummary(data)
        await load()
      } catch (e) {
        setError(e.message)
      }
      setImporting(false)
    }
    reader.readAsText(file, 'UTF-8')
    e.target.value = ''
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <p style={{ fontSize: 13, color: '#888' }}>{records.length} רשומות</p>
        <div style={{ display: 'flex', gap: 10 }}>
          <label style={{ background: '#fff', color: BROWN, border: '1.5px solid #EDE7DF', padding: '10px 20px', borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: importing ? 'not-allowed' : 'pointer', fontFamily: 'Heebo, Arial, sans-serif', opacity: importing ? 0.7 : 1 }}>
            {importing ? 'מייבא...' : '📄 ייבוא CSV'}
            <input type="file" accept=".csv" onChange={handleFileUpload} disabled={importing} style={{ display: 'none' }} />
          </label>
          <button onClick={() => setShowAddForm(!showAddForm)}
            style={{ background: '#111', color: '#fff', padding: '10px 24px', borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: 'pointer', border: 'none', fontFamily: 'Heebo, Arial, sans-serif' }}>
            {showAddForm ? 'ביטול' : '+ הוספה ידנית'}
          </button>
        </div>
      </div>

      {importSummary && (
        <div style={{ background: '#fff', border: '1px solid ' + GREEN, borderRadius: 10, padding: 14, marginBottom: 16, fontSize: 13 }}>
          {importSummary.totalRows} שורות · {importSummary.created} חדשות · {importSummary.updated} עודכנו · {importSummary.skipped} דולגו
          {importSummary.errors && importSummary.errors.length > 0 && <span style={{ color: RED }}> · {importSummary.errors.length} שגיאות</span>}
        </div>
      )}

      {showAddForm && (
        <form onSubmit={handleAdd} style={{ background: '#fff', border: '1px solid #EDE7DF', borderRadius: 14, padding: 24, marginBottom: 24 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 12, marginBottom: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>שם המדריך *</label>
              <input type="text" value={addForm.guide_name} onChange={e => setAddForm(Object.assign({}, addForm, { guide_name: e.target.value }))} style={inp} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>שם עסק</label>
              <input type="text" value={addForm.business_name} onChange={e => setAddForm(Object.assign({}, addForm, { business_name: e.target.value }))} style={inp} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>אימייל</label>
              <input type="email" value={addForm.email} onChange={e => setAddForm(Object.assign({}, addForm, { email: e.target.value }))} style={inp} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>WhatsApp</label>
              <input type="text" value={addForm.whatsapp_number} onChange={e => setAddForm(Object.assign({}, addForm, { whatsapp_number: e.target.value }))} style={inp} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>תואר</label>
              <input type="text" value={addForm.guide_title} onChange={e => setAddForm(Object.assign({}, addForm, { guide_title: e.target.value }))} style={inp} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>מקור</label>
              <input type="text" value={addForm.invite_source} onChange={e => setAddForm(Object.assign({}, addForm, { invite_source: e.target.value }))} style={inp} />
            </div>
          </div>
          <button type="submit" disabled={adding}
            style={{ background: AMBER, color: '#fff', padding: '10px 24px', borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: adding ? 'not-allowed' : 'pointer', border: 'none', fontFamily: 'Heebo, Arial, sans-serif', opacity: adding ? 0.7 : 1 }}>
            {adding ? 'שומר...' : 'Save Discovery Lead'}
          </button>
        </form>
      )}

      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="חיפוש: שם, עסק, מייל, טלפון..." style={Object.assign({}, inp, { maxWidth: 260 })} />
        {FILTERS.map(function(f) {
          const active = activeFilters.includes(f[0])
          return (
            <button key={f[0]} onClick={() => toggleFilter(f[0])}
              style={{ padding: '6px 14px', borderRadius: 20, border: '1.5px solid', fontSize: 12, cursor: 'pointer', fontFamily: 'Heebo, Arial, sans-serif', fontWeight: 700,
                background: active ? BROWN : '#fff', color: active ? '#fff' : '#444', borderColor: active ? BROWN : '#ddd' }}>
              {f[1]}
            </button>
          )
        })}
      </div>

      {error && <p style={{ color: RED, fontSize: 13, marginBottom: 16 }}>שגיאה: {error}</p>}
      {loading && <p style={{ color: '#888' }}>טוען...</p>}

      {!loading && records.length === 0 && (
        <div style={{ background: '#fff', borderRadius: 14, padding: 40, textAlign: 'center', border: '1px solid #EDE7DF' }}>
          <p style={{ color: '#B0A89E', fontSize: 15 }}>אין רשומות תואמות</p>
        </div>
      )}

      {!loading && records.length > 0 && (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>{['שם', 'עסק', 'תואר', 'קשר', 'מקור', 'סטטוס פרופיל', 'שלב Founder', 'נרשם?'].map(h => <th key={h} style={th}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {records.map(function(r) {
                return (
                  <tr key={r.id}>
                    <td style={td}>{r.Guide_Name}</td>
                    <td style={td}>{r.Business_Name}</td>
                    <td style={td}>{r.Guide_title}</td>
                    <td style={td}>{r.WhatsApp_Number || r.Email || '—'}</td>
                    <td style={td}>{r.Invite_Source}</td>
                    <td style={td}>{r.Profile_Status}</td>
                    <td style={td}>{r.Founder_Stage}</td>
                    <td style={td}>{r.Guide_Status ? '✓ ' + r.Guide_Status : '—'}</td>
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
