import { useState, useEffect } from 'react'
import Header from '../components/Header'

const ADMIN_PASSWORD = 'mvh2025admin'

export default function Admin() {
  const [authed, setAuthed] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [tab, setTab] = useState('tours')
  const [tours, setTours] = useState([])
  const [guides, setGuides] = useState([])
  const [signups, setSignups] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(function() {
    if (!authed) return
    setLoading(true)
    Promise.all([
      fetch('/api/admin-data?type=tours').then(function(r) { return r.json() }),
      fetch('/api/admin-data?type=guides').then(function(r) { return r.json() }),
      fetch('/api/admin-data?type=signups').then(function(r) { return r.json() }),
    ]).then(function(results) {
      setTours(results[0].records || [])
      setGuides(results[1].records || [])
      setSignups(results[2].records || [])
      setLoading(false)
    })
  }, [authed])

  const handleLogin = function(e) {
    e.preventDefault()
    if (password === ADMIN_PASSWORD) {
      setAuthed(true)
      setError('')
    } else {
      setError('סיסמה שגויה')
    }
  }

  const updateTourStatus = async function(tourId, status) {
    await fetch('/api/admin-update-tour', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tour_id: tourId, status: status })
    })
    setTours(function(prev) {
      return prev.map(function(t) {
        if (t.id === tourId) return Object.assign({}, t, { Tour_Status: status })
        return t
      })
    })
  }

  const inputStyle = { padding: '10px 14px', borderRadius: 6, border: '1px solid #ddd', fontSize: 15, fontFamily: 'Heebo, Arial, sans-serif', outline: 'none' }
  const thStyle = { padding: '10px 12px', textAlign: 'right', fontSize: 12, fontWeight: 700, color: '#888', borderBottom: '2px solid #eee', whiteSpace: 'nowrap' }
  const tdStyle = { padding: '10px 12px', fontSize: 13, borderBottom: '1px solid #f0f0f0', verticalAlign: 'middle' }

  const statusBadge = function(status) {
    var colors = { paid: '#22c55e', frozen: '#f59e0b', removed: '#ef4444', collab: '#3b82f6' }
    var labels = { paid: 'פעיל', frozen: 'מוקפא', removed: 'מוסר', collab: 'שת"פ' }
    return (
      <span style={{ background: colors[status] || '#999', color: '#fff', padding: '3px 10px', borderRadius: 12, fontSize: 11, fontWeight: 700 }}>
        {labels[status] || status}
      </span>
    )
  }

  if (!authed) {
    return (
      <div>
        <Header />
        <div style={{ maxWidth: 400, margin: '120px auto', padding: '0 24px', textAlign: 'center' }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>MvH Mission Control</h1>
          <p style={{ color: '#888', fontSize: 13, marginBottom: 32 }}>גישה מורשית בלבד</p>
          <form onSubmit={handleLogin}>
            <input type="password" value={password} onChange={function(e) { setPassword(e.target.value) }}
              placeholder="סיסמה" style={Object.assign({}, inputStyle, { width: '100%', marginBottom: 12, boxSizing: 'border-box' })} />
            {error && <p style={{ color: '#e00', fontSize: 13, marginBottom: 12 }}>{error}</p>}
            <button type="submit" style={{ width: '100%', background: '#0A0A0A', color: '#fff', padding: '12px', borderRadius: 8, fontSize: 15, fontWeight: 700, cursor: 'pointer', border: 'none' }}>
              כניסה
            </button>
          </form>
        </div>
      </div>
    )
  }

  const totalLeads = tours.reduce(function(acc, t) { return acc + (Number(t.Lead_Count) || 0) }, 0)
  const totalViews = tours.reduce(function(acc, t) { return acc + (Number(t.View_Count) || 0) }, 0)
  const totalNewsletter = tours.reduce(function(acc, t) { return acc + (Number(t.Newsletter_Click_Count) || 0) }, 0)
  const activeTours = tours.filter(function(t) { return t.Tour_Status === 'paid' })

  return (
    <div>
      <Header />
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px' }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 32 }}>MvH Mission Control</h1>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 40 }}>
          {[
            ['סיורים פעילים', activeTours.length, '#22c55e'],
            ['מדריכים', guides.length, '#3b82f6'],
            ['חברי קהילה', signups.length, '#C4922A'],
            ['צפיות באתר', totalViews, '#8b5cf6'],
            ['לחיצות ניוזלטר', totalNewsletter, '#06b6d4'],
            ['לחיצות וואטסאפ', totalLeads, '#25D366'],
          ].map(function(item) {
            return (
              <div key={item[0]} style={{ background: '#F9F9F9', borderRadius: 8, padding: '20px 16px', textAlign: 'center', borderTop: '3px solid ' + item[2] }}>
                <p style={{ fontSize: 32, fontWeight: 800, marginBottom: 4, color: item[2] }}>{item[1]}</p>
                <p style={{ fontSize: 12, color: '#666' }}>{item[0]}</p>
              </div>
            )
          })}
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 32, flexWrap: 'wrap' }}>
          {[['tours', 'סיורים (' + tours.length + ')'], ['guides', 'מדריכים (' + guides.length + ')'], ['signups', 'קהילה (' + signups.length + ')']].map(function(item) {
            return (
              <button key={item[0]} onClick={function() { setTab(item[0]) }}
                style={{ padding: '8px 20px', borderRadius: 20, border: '1px solid', fontSize: 14, cursor: 'pointer',
                  background: tab === item[0] ? '#0A0A0A' : '#fff', color: tab === item[0] ? '#fff' : '#444',
                  borderColor: tab === item[0] ? '#0A0A0A' : '#ddd' }}>
                {item[1]}
              </button>
            )
          })}
        </div>

        {loading && <p style={{ color: '#888' }}>טוען...</p>}

        {!loading && tab === 'tours' && (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['שם סיור', 'מדריך', 'עיר', 'מחיר', 'צפיות', 'ניוזלטר', 'וואטסאפ', 'סה"כ', 'סטטוס', 'פעולות'].map(function(h) {
                    return <th key={h} style={thStyle}>{h}</th>
                  })}
                </tr>
              </thead>
              <tbody>
                {tours.map(function(t) {
                  var views = Number(t.View_Count) || 0
                  var newsletter = Number(t.Newsletter_Click_Count) || 0
                  var leads = Number(t.Lead_Count) || 0
                  var total = views + newsletter + leads
                  return (
                    <tr key={t.id}>
                      <td style={tdStyle}>
                        <a href={'/tours/' + t.id} target="_blank" rel="noopener noreferrer"
                          style={{ color: '#0A0A0A', fontWeight: 600, textDecoration: 'none' }}>
                          {t.Tour_Title}
                        </a>
                      </td>
                      <td style={tdStyle}>{t.Guide_Name}</td>
                      <td style={tdStyle}>{t.Cities_Tags}</td>
                      <td style={tdStyle}>{t.Price_Per_Person} ₪</td>
                      <td style={tdStyle}>{views}</td>
                      <td style={tdStyle}>{newsletter}</td>
                      <td style={tdStyle}>{leads}</td>
                      <td style={Object.assign({}, tdStyle, { fontWeight: 700, color: '#C4922A' })}>{total}</td>
                      <td style={tdStyle}>{statusBadge(t.Tour_Status)}</td>
                      <td style={tdStyle}>
                        <div style={{ display: 'flex', gap: 6 }}>
                          {t.Tour_Status !== 'paid' && (
                            <button onClick={function() { updateTourStatus(t.id, 'paid') }}
                              style={{ padding: '4px 10px', fontSize: 12, borderRadius: 6, border: '1px solid #22c55e', color: '#22c55e', cursor: 'pointer', background: '#fff' }}>
                              הפעל
                            </button>
                          )}
                          {t.Tour_Status !== 'frozen' && (
                            <button onClick={function() { updateTourStatus(t.id, 'frozen') }}
                              style={{ padding: '4px 10px', fontSize: 12, borderRadius: 6, border: '1px solid #f59e0b', color: '#f59e0b', cursor: 'pointer', background: '#fff' }}>
                              הקפא
                            </button>
                          )}
                          {t.Tour_Status !== 'removed' && (
                            <button onClick={function() {
                              if (window.confirm('להסיר את הסיור לצמיתות?')) updateTourStatus(t.id, 'removed')
                            }}
                              style={{ padding: '4px 10px', fontSize: 12, borderRadius: 6, border: '1px solid #ef4444', color: '#ef4444', cursor: 'pointer', background: '#fff' }}>
                              הסר
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {!loading && tab === 'guides' && (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['שם מדריך', 'אימייל', 'וואטסאפ', 'תאריך הצטרפות'].map(function(h) {
                    return <th key={h} style={thStyle}>{h}</th>
                  })}
                </tr>
              </thead>
              <tbody>
                {guides.map(function(g) {
                  return (
                    <tr key={g.id}>
                      <td style={Object.assign({}, tdStyle, { fontWeight: 600 })}>{g.Guide_Name}</td>
                      <td style={tdStyle}>{g.Guide_Email}</td>
                      <td style={tdStyle}>{g.WhatsApp_Number}</td>
                      <td style={tdStyle}>{g.Join_Date || '-'}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {!loading && tab === 'signups' && (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['שם', 'אימייל', 'וואטסאפ', 'אזורים', 'תאריך הרשמה', 'הסכמת קבוצה'].map(function(h) {
                    return <th key={h} style={thStyle}>{h}</th>
                  })}
                </tr>
              </thead>
              <tbody>
                {signups.map(function(s) {
                  return (
                    <tr key={s.id}>
                      <td style={Object.assign({}, tdStyle, { fontWeight: 600 })}>{s.First_Name} {s.Last_Name}</td>
                      <td style={tdStyle}>{s.Email}</td>
                      <td style={tdStyle}>{s.WhatsApp_Phone}</td>
                      <td style={tdStyle}>{s.Regions_Interest}</td>
                      <td style={tdStyle}>{s.Signup_Date}</td>
                      <td style={tdStyle}>{s.WhatsApp_Group_Consent ? '✓' : '-'}</td>
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
