import { useState, useEffect } from 'react'
import Link from 'next/link'
import Header from '../components/Header'

const ADMIN_PASSWORD = 'mvh2025admin'

const SUBJECT_PLACEHOLDER = 'עזוב, מה יש לעשות שם? אז זהו, שיש.'
const INTRO_PLACEHOLDER = `יש לנו חדשות טובות וחדשות רעות.
החדשות הרעות הן שנגמרו לכם התירוצים להישאר בבית.
החדשות הטובות הן שהוספנו כמה סיורים חדשים במקומות שאם היו מציעים לכם לנסוע אליהם לפני שבוע, כנראה שהייתם אומרים "עזוב, מה יש לעשות שם?"
ואם אתם בכל זאת במצב בטטות ספה, לפחות תקשיבו לפרק החדש בפודקאסט, ובפעם הבאה שמישהו בעבודה ישאל מה עשיתם בסופ"ש, תזרקו שם של מקום שאף אחד לא שמע עליו וכולם יהיו בטוחים שיש לכם חיים מעניינים במיוחד :)`
const OUTRO_PLACEHOLDER = `נרדמתם באמצע הפרק? לא נורא. המינימום שאתם יכולים לעשות זה להעביר את המייל הזה למישהו שצריך לצאת מהבית יותר מכם.`

export default function Admin() {
  const [authed, setAuthed] = useState(false)
  const [password, setPassword] = useState('')
  const [pwError, setPwError] = useState('')
  const [tab, setTab] = useState('tours')
  const [tours, setTours] = useState([])
  const [guides, setGuides] = useState([])
  const [signups, setSignups] = useState([])
  const [newsletters, setNewsletters] = useState([])
  const [loading, setLoading] = useState(false)
  const [nlStep, setNlStep] = useState('compose')
  const [nlSubject, setNlSubject] = useState('')
  const [nlIntro, setNlIntro] = useState('')
  const [nlOutro, setNlOutro] = useState('')
  const [newTours, setNewTours] = useState([])
  const [selectedTours, setSelectedTours] = useState([])
  const [sending, setSending] = useState(false)
  const [savingDraft, setSavingDraft] = useState(false)

  useEffect(function() {
    if (!authed) return
    loadData()
  }, [authed])

  const loadData = async function() {
    setLoading(true)
    try {
      const [toursRes, guidesRes, signupsRes, newslettersRes] = await Promise.all([
        fetch('/api/admin-data?type=tours').then(function(r) { return r.json() }),
        fetch('/api/admin-data?type=guides').then(function(r) { return r.json() }),
        fetch('/api/admin-data?type=signups').then(function(r) { return r.json() }),
        fetch('/api/admin-data?type=newsletters').then(function(r) { return r.json() }),
      ])
      setTours(toursRes.records || [])
      setGuides(guidesRes.records || [])
      setSignups(signupsRes.records || [])
      const allNewsletters = newslettersRes.records || []
      setNewsletters(allNewsletters)
      const sentTourIds = new Set()
      allNewsletters.filter(function(n) { return n.Status === 'Sent' }).forEach(function(n) {
        if (n.Tours_Included) n.Tours_Included.split(',').forEach(function(id) { sentTourIds.add(id.trim()) })
      })
      const unsent = (toursRes.records || []).filter(function(t) {
        return t.Tour_Status === 'paid' && !sentTourIds.has(t.id)
      })
      setNewTours(unsent)
      setSelectedTours(unsent.map(function(t) { return t.id }))
    } catch(e) { console.error(e) }
    setLoading(false)
  }

  const handleLogin = function(e) {
    e.preventDefault()
    if (password === ADMIN_PASSWORD) { setAuthed(true); setPwError('') }
    else setPwError('סיסמה שגויה')
  }

  const updateTourStatus = async function(tourId, status) {
    await fetch('/api/admin-update-tour', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tour_id: tourId, status: status })
    })
    setTours(function(prev) { return prev.map(function(t) { return t.id === tourId ? Object.assign({}, t, { Tour_Status: status }) : t }) })
  }

  const moveUp = function(index) {
    if (index === 0) return
    var list = selectedTours.slice(); var tmp = list[index-1]; list[index-1] = list[index]; list[index] = tmp; setSelectedTours(list)
  }
  const moveDown = function(index) {
    if (index === selectedTours.length - 1) return
    var list = selectedTours.slice(); var tmp = list[index+1]; list[index+1] = list[index]; list[index] = tmp; setSelectedTours(list)
  }
  const removeTour = function(id) { setSelectedTours(selectedTours.filter(function(t) { return t !== id })) }
  const getTourById = function(id) { return newTours.find(function(t) { return t.id === id }) }

  const saveDraft = async function() {
    setSavingDraft(true)
    await fetch('/api/save-newsletter-draft', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subject: nlSubject, intro: nlIntro, outro: nlOutro, tour_ids: selectedTours })
    })
    setSavingDraft(false)
    loadData()
    alert('הטיוטה נשמרה!')
  }

  const loadDraft = function(draft) {
    setNlSubject(draft.Subject || '')
    setNlIntro(draft.Intro_Text || '')
    setNlOutro(draft.Outro_Text || '')
    if (draft.Tours_Included) setSelectedTours(draft.Tours_Included.split(',').map(function(s) { return s.trim() }))
    setNlStep('compose')
  }

  const handleSend = async function() {
    if (!nlSubject.trim()) { alert('יש להזין נושא'); return }
    if (selectedTours.length === 0) { alert('יש לבחור לפחות סיור אחד'); return }
    setSending(true)
    try {
      await fetch('/api/send-newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject: nlSubject, intro: nlIntro, outro: nlOutro, tour_ids: selectedTours })
      })
      setNlStep('sent')
      loadData()
    } catch(e) { alert('שגיאה בשליחה') }
    setSending(false)
  }

  const inputStyle = { width: '100%', padding: '10px 14px', borderRadius: 6, border: '1px solid #ddd', fontSize: 14, fontFamily: 'Heebo, Arial, sans-serif', outline: 'none', boxSizing: 'border-box' }
  const thStyle = { padding: '10px 12px', textAlign: 'right', fontSize: 12, fontWeight: 700, color: '#888', borderBottom: '2px solid #eee', whiteSpace: 'nowrap' }
  const tdStyle = { padding: '10px 12px', fontSize: 13, borderBottom: '1px solid #f0f0f0', verticalAlign: 'middle' }

  if (!authed) {
    return (
      <div>
        <Header />
        <div style={{ maxWidth: 400, margin: '120px auto', padding: '0 24px', textAlign: 'center' }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>MvH Mission Control</h1>
  <button onClick={async function() {
  if (window.confirm('לשלוח חשבוניות לכל המדריכים הפעילים?')) {
    const res = await fetch('/api/send-billing-email', { method: 'POST' })
    const data = await res.json()
    alert('נשלחו ' + data.sent + ' חשבוניות!')
  }
}} style={{ marginBottom: 32, background: '#0A0A0A', color: '#fff', padding: '10px 24px', borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: 'pointer', border: 'none' }}>
  💳 שלח חשבוניות חודשיות
</button>
          <p style={{ color: '#888', fontSize: 13, marginBottom: 32 }}>גישה מורשית בלבד</p>
          <form onSubmit={handleLogin}>
            <input type="password" value={password} onChange={function(e) { setPassword(e.target.value) }}
              placeholder="סיסמה" style={Object.assign({}, inputStyle, { marginBottom: 12 })} />
            {pwError && <p style={{ color: '#e00', fontSize: 13, marginBottom: 12 }}>{pwError}</p>}
            <button type="submit" style={{ width: '100%', background: '#0A0A0A', color: '#fff', padding: '12px', borderRadius: 8, fontSize: 15, fontWeight: 700, cursor: 'pointer', border: 'none' }}>כניסה</button>
          </form>
        </div>
      </div>
    )
  }

  const totalLeads = tours.reduce(function(acc, t) { return acc + (Number(t.Lead_Count) || 0) }, 0)
  const totalViews = tours.reduce(function(acc, t) { return acc + (Number(t.View_Count) || 0) }, 0)
  const totalNewsletter = tours.reduce(function(acc, t) { return acc + (Number(t.Newsletter_Click_Count) || 0) }, 0)
  const activeTours = tours.filter(function(t) { return t.Tour_Status === 'paid' })
  const sentNewsletters = newsletters.filter(function(n) { return n.Status === 'Sent' })
  const draftNewsletters = newsletters.filter(function(n) { return n.Status === 'Draft' })

  const statusBadge = function(status) {
    var colors = { paid: '#22c55e', frozen: '#f59e0b', removed: '#ef4444', collab: '#3b82f6' }
    var labels = { paid: 'פעיל', frozen: 'מוקפא', removed: 'מוסר', collab: 'שת"פ' }
    return <span style={{ background: colors[status] || '#999', color: '#fff', padding: '3px 10px', borderRadius: 12, fontSize: 11, fontWeight: 700 }}>{labels[status] || status}</span>
  }

  return (
    <div>
      <Header />
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px' }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 32 }}>MvH Mission Control</h1>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 16, marginBottom: 40 }}>
          {[
            ['סיורים פעילים', activeTours.length, '#22c55e'],
            ['מדריכים', guides.length, '#3b82f6'],
            ['חברי קהילה', signups.length, '#C4922A'],
            ['צפיות באתר', totalViews, '#8b5cf6'],
            ['לחיצות ניוזלטר', totalNewsletter, '#06b6d4'],
            ['לחיצות וואטסאפ', totalLeads, '#25D366'],
            ['ניוזלטרים שנשלחו', sentNewsletters.length, '#f59e0b'],
          ].map(function(item) {
            return (
              <div key={item[0]} style={{ background: '#F9F9F9', borderRadius: 8, padding: '20px 16px', textAlign: 'center', borderTop: '3px solid ' + item[2] }}>
                <p style={{ fontSize: 28, fontWeight: 800, marginBottom: 4, color: item[2] }}>{item[1]}</p>
                <p style={{ fontSize: 11, color: '#666' }}>{item[0]}</p>
              </div>
            )
          })}
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 32, flexWrap: 'wrap' }}>
          {[['tours','סיורים (' + tours.length + ')'],['guides','מדריכים (' + guides.length + ')'],['signups','קהילה (' + signups.length + ')'],['newsletter','ניוזלטר']].map(function(item) {
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
              <thead><tr>{['שם סיור','מדריך','עיר','מחיר','צפיות','ניוזלטר','וואטסאפ','סה"כ','סטטוס','פעולות'].map(function(h) { return <th key={h} style={thStyle}>{h}</th> })}</tr></thead>
              <tbody>
                {tours.map(function(t) {
                  var views = Number(t.View_Count) || 0
                  var nl = Number(t.Newsletter_Click_Count) || 0
                  var leads = Number(t.Lead_Count) || 0
                  return (
                    <tr key={t.id}>
                      <td style={tdStyle}><a href={'/tours/' + t.id} target="_blank" rel="noopener noreferrer" style={{ color: '#0A0A0A', fontWeight: 600, textDecoration: 'none' }}>{t.Tour_Title}</a></td>
                      <td style={tdStyle}>{t.Guide_Name}</td>
                      <td style={tdStyle}>{t.Cities_Tags}</td>
                      <td style={tdStyle}>{t.Price_Per_Person} ₪</td>
                      <td style={tdStyle}>{views}</td>
                      <td style={tdStyle}>{nl}</td>
                      <td style={tdStyle}>{leads}</td>
                      <td style={Object.assign({}, tdStyle, { fontWeight: 700, color: '#C4922A' })}>{views + nl + leads}</td>
                      <td style={tdStyle}>{statusBadge(t.Tour_Status)}</td>
                      <td style={tdStyle}>
                        <div style={{ display: 'flex', gap: 6 }}>
                          {t.Tour_Status !== 'paid' && <button onClick={function() { updateTourStatus(t.id, 'paid') }} style={{ padding: '4px 10px', fontSize: 12, borderRadius: 6, border: '1px solid #22c55e', color: '#22c55e', cursor: 'pointer', background: '#fff' }}>הפעל</button>}
                          {t.Tour_Status !== 'frozen' && <button onClick={function() { updateTourStatus(t.id, 'frozen') }} style={{ padding: '4px 10px', fontSize: 12, borderRadius: 6, border: '1px solid #f59e0b', color: '#f59e0b', cursor: 'pointer', background: '#fff' }}>הקפא</button>}
                          {t.Tour_Status !== 'removed' && <button onClick={function() { if (window.confirm('להסיר?')) updateTourStatus(t.id, 'removed') }} style={{ padding: '4px 10px', fontSize: 12, borderRadius: 6, border: '1px solid #ef4444', color: '#ef4444', cursor: 'pointer', background: '#fff' }}>הסר</button>}
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
              <thead><tr>{['שם מדריך','אימייל','וואטסאפ','תאריך הצטרפות'].map(function(h) { return <th key={h} style={thStyle}>{h}</th> })}</tr></thead>
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
              <thead><tr>{['שם','אימייל','וואטסאפ','אזורים','תאריך הרשמה','הסכמת קבוצה'].map(function(h) { return <th key={h} style={thStyle}>{h}</th> })}</tr></thead>
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

        {!loading && tab === 'newsletter' && (
          <div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
              {[['compose','ניוזלטר חדש'],['drafts','טיוטות (' + draftNewsletters.length + ')'],['sent','נשלחו (' + sentNewsletters.length + ')']].map(function(item) {
                return (
                  <button key={item[0]} onClick={function() { setNlStep(item[0]) }}
                    style={{ padding: '6px 16px', borderRadius: 20, border: '1px solid', fontSize: 13, cursor: 'pointer',
                      background: nlStep === item[0] ? '#C4922A' : '#fff', color: nlStep === item[0] ? '#fff' : '#444',
                      borderColor: nlStep === item[0] ? '#C4922A' : '#ddd' }}>
                    {item[1]}
                  </button>
                )
              })}
            </div>

            {nlStep === 'compose' && (
              <div>
                <div style={{ background: '#FDF6EA', borderRadius: 8, padding: '12px 16px', marginBottom: 24, fontSize: 13, color: '#666' }}>
                  {signups.length} נמענים · {selectedTours.length} סיורים חדשים שלא נשלחו עדיין
                </div>
                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 6 }}>נושא המייל</label>
                  <input type="text" value={nlSubject} onChange={function(e) { setNlSubject(e.target.value) }} placeholder={SUBJECT_PLACEHOLDER} style={inputStyle} />
                </div>
                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 6 }}>טקסט פתיחה</label>
                  <textarea value={nlIntro} onChange={function(e) { setNlIntro(e.target.value) }} placeholder={INTRO_PLACEHOLDER} rows={6} style={Object.assign({}, inputStyle, { resize: 'vertical', lineHeight: 1.7 })} />
                </div>
                <div style={{ marginBottom: 32 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 6 }}>טקסט סיום</label>
                  <textarea value={nlOutro} onChange={function(e) { setNlOutro(e.target.value) }} placeholder={OUTRO_PLACEHOLDER} rows={3} style={Object.assign({}, inputStyle, { resize: 'vertical', lineHeight: 1.7 })} />
                </div>
                <div style={{ marginBottom: 32 }}>
                  <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>סיורים שייכללו ({selectedTours.length})</h3>
                  {selectedTours.length === 0 ? (
                    <p style={{ color: '#999', fontSize: 14 }}>אין סיורים חדשים</p>
                  ) : selectedTours.map(function(id, index) {
                    var t = getTourById(id)
                    if (!t) return null
                    var thumb = t.Tour_Images ? t.Tour_Images.split('|')[0] : null
                    var discountedPrice = Math.round((Number(t.Price_Per_Person) || 0) * 0.9)
                    return (
                      <div key={id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px', border: '1px solid #eee', borderRadius: 8, marginBottom: 8 }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                          <button onClick={function() { moveUp(index) }} disabled={index === 0} style={{ border: '1px solid #ddd', background: '#fff', borderRadius: 4, padding: '2px 8px', cursor: 'pointer', opacity: index === 0 ? 0.3 : 1 }}>↑</button>
                          <button onClick={function() { moveDown(index) }} disabled={index === selectedTours.length - 1} style={{ border: '1px solid #ddd', background: '#fff', borderRadius: 4, padding: '2px 8px', cursor: 'pointer', opacity: index === selectedTours.length - 1 ? 0.3 : 1 }}>↓</button>
                        </div>
                        {thumb && <img src={thumb} alt="" style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 6 }} />}
                        <div style={{ flex: 1 }}>
                          <p style={{ fontWeight: 700, fontSize: 14, marginBottom: 2 }}>{t.Tour_Title}</p>
                          <p style={{ fontSize: 12, color: '#888' }}>{t.Cities_Tags} · {t.Guide_Name} · <span style={{ textDecoration: 'line-through' }}>{t.Price_Per_Person} ₪</span> → {discountedPrice} ₪</p>
                        </div>
                        <button onClick={function() { removeTour(id) }} style={{ border: '1px solid #ef4444', color: '#ef4444', background: '#fff', borderRadius: 6, padding: '4px 10px', fontSize: 12, cursor: 'pointer' }}>הסר</button>
                      </div>
                    )
                  })}
                </div>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  <button onClick={saveDraft} disabled={savingDraft}
                    style={{ background: '#F5F5F5', color: '#444', padding: '12px 24px', borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: 'pointer', border: '1px solid #ddd', opacity: savingDraft ? 0.7 : 1 }}>
                    {savingDraft ? 'שומר...' : '💾 שמור טיוטה'}
                  </button>
                  <button onClick={handleSend} disabled={sending}
                    style={{ background: '#0A0A0A', color: '#fff', padding: '12px 32px', borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: sending ? 'not-allowed' : 'pointer', border: 'none', opacity: sending ? 0.7 : 1 }}>
                    {sending ? 'שולח...' : '✉️ שלח ל-' + signups.length + ' נמענים'}
                  </button>
                </div>
              </div>
            )}

            {nlStep === 'drafts' && (
              <div>
                {draftNewsletters.length === 0 ? (
                  <p style={{ color: '#999' }}>אין טיוטות שמורות</p>
                ) : draftNewsletters.map(function(draft) {
                  return (
                    <div key={draft.id} style={{ border: '1px solid #eee', borderRadius: 8, padding: 16, marginBottom: 12 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <p style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{draft.Subject || '(ללא נושא)'}</p>
                          <p style={{ fontSize: 12, color: '#888' }}>{draft.Tours_Included ? draft.Tours_Included.split(',').length : 0} סיורים</p>
                        </div>
                        <button onClick={function() { loadDraft(draft); setNlStep('compose') }}
                          style={{ background: '#C4922A', color: '#fff', padding: '8px 16px', borderRadius: 6, fontSize: 13, fontWeight: 700, cursor: 'pointer', border: 'none' }}>
                          המשך עריכה
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {nlStep === 'sent' && (
              <div>
                {sentNewsletters.length === 0 ? (
                  <p style={{ color: '#999' }}>עדיין לא נשלח אף ניוזלטר</p>
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead><tr>{['תאריך שליחה','נושא','נמענים','נמסר','סיורים'].map(function(h) { return <th key={h} style={thStyle}>{h}</th> })}</tr></thead>
                    <tbody>
                      {sentNewsletters.map(function(n) {
                        return (
                          <tr key={n.id}>
                            <td style={tdStyle}>{n.Sent_At ? new Date(n.Sent_At).toLocaleDateString('he-IL') : '-'}</td>
                            <td style={Object.assign({}, tdStyle, { fontWeight: 600 })}>{n.Subject}</td>
                            <td style={tdStyle}>{n.Recipients_Count || '-'}</td>
                            <td style={tdStyle}>{n.Delivered_Count || '-'}</td>
                            <td style={tdStyle}>{n.Tours_Included ? n.Tours_Included.split(',').length : 0}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
