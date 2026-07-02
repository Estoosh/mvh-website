import { useState, useEffect } from 'react'

const RED = '#ef4444'
const AMBER = '#f59e0b'
const GREEN = '#22c55e'

export default function ContentModerationPanel({ adminId, tableStyles }) {
  const { th, td } = tableStyles

  const [query, setQuery] = useState('')
  const [searching, setSearching] = useState(false)
  const [results, setResults] = useState([])
  const [selected, setSelected] = useState([])
  const [error, setError] = useState(null)

  const [guideHide, setGuideHide] = useState({ guide_id: '', reason: '' })
  const [guideHiding, setGuideHiding] = useState(false)

  const [hiddenTours, setHiddenTours] = useState([])
  const [loadingHidden, setLoadingHidden] = useState(false)

  const inp = { width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #ddd', fontSize: 13, fontFamily: 'Heebo, Arial, sans-serif', outline: 'none', boxSizing: 'border-box' }

  const loadHidden = async function() {
    setLoadingHidden(true)
    try {
      const res = await fetch('/api/control/list-hidden-tours?limit=100')
      const data = await res.json()
      if (data.ok) setHiddenTours(data.records || [])
    } catch (e) {
      // non-fatal for this secondary list
    }
    setLoadingHidden(false)
  }

  useEffect(function() { loadHidden() }, [])

  const handleSearch = async function(e) {
    e.preventDefault()
    if (!query.trim()) return
    setSearching(true)
    setError(null)
    setSelected([])
    try {
      const res = await fetch('/api/control/search-content?q=' + encodeURIComponent(query))
      const data = await res.json()
      if (!data.ok) { setError(data.error || 'search_failed'); setResults([]); return }
      setResults(data.results || [])
    } catch (e) {
      setError(e.message)
    }
    setSearching(false)
  }

  const toggleSelect = function(tourId) {
    setSelected(prev => prev.includes(tourId) ? prev.filter(id => id !== tourId) : prev.concat(tourId))
  }

  const applyStatus = async function(tourIds, contentStatus, reasonPrompt) {
    if (tourIds.length === 0) { window.alert('לא נבחרו סיורים'); return }
    const reason = window.prompt(reasonPrompt || 'סיבה:')
    if (!reason) return
    setError(null)
    try {
      const res = await fetch('/api/control/update-content-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tour_ids: tourIds, content_status: contentStatus, reason, updated_by: adminId })
      })
      const data = await res.json()
      if (!data.ok) { setError(data.error || 'update_failed'); return }
      window.alert(`עודכנו ${data.updatedCount} סיורים ל-${contentStatus}`)
      setSelected([])
      setResults(prev => prev.map(r => tourIds.includes(r.id) ? Object.assign({}, r, { content_status: contentStatus }) : r))
      await loadHidden()
    } catch (e) {
      setError(e.message)
    }
  }

  const handleHideByGuide = async function(e) {
    e.preventDefault()
    if (!guideHide.guide_id || !guideHide.reason) {
      window.alert('נא למלא Guide ID וסיבה')
      return
    }
    setGuideHiding(true)
    setError(null)
    try {
      const res = await fetch('/api/control/update-content-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guide_id: guideHide.guide_id, content_status: 'Hidden', reason: guideHide.reason, updated_by: adminId })
      })
      const data = await res.json()
      if (!data.ok) { setError(data.error || 'update_failed'); setGuideHiding(false); return }
      window.alert(`הוסתרו ${data.updatedCount} סיורים`)
      setGuideHide({ guide_id: '', reason: '' })
      await loadHidden()
    } catch (e) {
      setError(e.message)
    }
    setGuideHiding(false)
  }

  return (
    <div>
      {/* Method A: hide all of a guide's tours at once */}
      <div style={{ background: '#fff', border: '1px solid #EDE7DF', borderRadius: 14, padding: 24, marginBottom: 24 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>הסתרת כל הסיורים של מדריך</h3>
        <form onSubmit={handleHideByGuide}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 12, marginBottom: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>Guide ID</label>
              <input type="text" value={guideHide.guide_id} onChange={e => setGuideHide(Object.assign({}, guideHide, { guide_id: e.target.value }))} style={inp} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>סיבה</label>
              <input type="text" value={guideHide.reason} onChange={e => setGuideHide(Object.assign({}, guideHide, { reason: e.target.value }))} style={inp} />
            </div>
          </div>
          <button type="submit" disabled={guideHiding}
            style={{ background: AMBER, color: '#fff', padding: '10px 24px', borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: guideHiding ? 'not-allowed' : 'pointer', border: 'none', fontFamily: 'Heebo, Arial, sans-serif', opacity: guideHiding ? 0.7 : 1 }}>
            {guideHiding ? 'מסתיר...' : 'הסתר את כל הסיורים'}
          </button>
        </form>
      </div>

      {/* Methods B + C: search, then multi-select */}
      <div style={{ background: '#fff', border: '1px solid #EDE7DF', borderRadius: 14, padding: 24, marginBottom: 24 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>חיפוש תוכן</h3>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <input type="text" value={query} onChange={e => setQuery(e.target.value)} placeholder="חיפוש בכותרת, תיאור, ביו מדריך ושם מדריך" style={inp} />
          <button type="submit" disabled={searching}
            style={{ background: '#111', color: '#fff', padding: '8px 24px', borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: 'pointer', border: 'none', fontFamily: 'Heebo, Arial, sans-serif', whiteSpace: 'nowrap' }}>
            {searching ? 'מחפש...' : 'חפש'}
          </button>
        </form>

        {results.length > 0 && (
          <div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              <button onClick={() => applyStatus(selected, 'Hidden', 'סיבת הסתרה:')}
                style={{ padding: '6px 14px', fontSize: 12, borderRadius: 6, border: '1px solid ' + AMBER, color: AMBER, background: '#fff', cursor: 'pointer' }}>
                הסתר נבחרים ({selected.length})
              </button>
              <button onClick={() => applyStatus(selected, 'Removed', 'סיבת הסרה קבועה:')}
                style={{ padding: '6px 14px', fontSize: 12, borderRadius: 6, border: '1px solid ' + RED, color: RED, background: '#fff', cursor: 'pointer' }}>
                הסר לצמיתות ({selected.length})
              </button>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={th}></th>
                    {['כותרת', 'מדריך', 'סטטוס תוכן'].map(h => <th key={h} style={th}>{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {results.map(function(r) {
                    return (
                      <tr key={r.id}>
                        <td style={td}><input type="checkbox" checked={selected.includes(r.id)} onChange={() => toggleSelect(r.id)} /></td>
                        <td style={td}>{r.tour_title}</td>
                        <td style={td}>{r.guide_name}</td>
                        <td style={td}>{r.content_status}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {!searching && results.length === 0 && query && <p style={{ color: '#999', fontSize: 13 }}>אין תוצאות</p>}
      </div>

      {error && <p style={{ color: RED, fontSize: 13, marginBottom: 16 }}>שגיאה: {error}</p>}

      {/* Overview of currently hidden/removed tours, with restore */}
      <div>
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>סיורים מוסתרים/מוסרים כרגע ({hiddenTours.length})</h3>
        {loadingHidden && <p style={{ color: '#888' }}>טוען...</p>}
        {!loadingHidden && hiddenTours.length === 0 && <p style={{ color: '#999', fontSize: 13 }}>אין סיורים מוסתרים</p>}
        {!loadingHidden && hiddenTours.length > 0 && (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>{['כותרת', 'מדריך', 'סטטוס', 'סיבה', 'עדכון אחרון', 'פעולות'].map(h => <th key={h} style={th}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {hiddenTours.map(function(t) {
                  return (
                    <tr key={t.id}>
                      <td style={td}>{t.Tour_Title}</td>
                      <td style={td}>{t.Guide_Name}</td>
                      <td style={td}>{t.Content_Status}</td>
                      <td style={td}>{t.Status_Change_Reason}</td>
                      <td style={td}>{t.Status_Changed_At ? new Date(t.Status_Changed_At).toLocaleDateString('he-IL') : '-'}</td>
                      <td style={td}>
                        <button onClick={() => applyStatus([t.id], 'Visible', 'סיבת שחזור:')}
                          style={{ padding: '4px 10px', fontSize: 12, borderRadius: 6, border: '1px solid ' + GREEN, color: GREEN, cursor: 'pointer', background: '#fff' }}>
                          שחזר
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
