import { useState, useEffect } from 'react'
import Link from 'next/link'
import Header from '../components/Header'
import FinanceTab from '../components/admin/FinanceTab'
import ControlCenterTab from '../components/admin/ControlCenterTab'

const ADMIN_PASSWORD = 'mvh2025admin'
const BROWN = '#7E4821'

const SUBJECT_PLACEHOLDER = 'עזוב, מה יש לעשות שם? אז זהו, שיש.'
const INTRO_PLACEHOLDER = `יש לנו חדשות טובות וחדשות רעות.
החדשות הרעות הן שנגמרו לכם התירוצים להישאר בבית.
החדשות הטובות הן שהוספנו כמה סיורים חדשים במקומות שאם היו מציעים לכם לנסוע אליהם לפני שבוע, כנראה שהייתם אומרים "עזוב, מה יש לעשות שם?"
ואם אתם בכל זאת במצב בטטות ספה, לפחות תקשיבו לפרק החדש בפודקאסט, ובפעם הבאה שמישהו בעבודה ישאל מה עשיתם בסופ"ש, תזרקו שם של מקום שאף אחד לא שמע עליו וכולם יהיו בטוחים שיש לכם חיים מעניינים במיוחד :)`
const OUTRO_PLACEHOLDER = `נרדמתם באמצע הפרק? לא נורא. המינימום שאתם יכולים לעשות זה להעביר את המייל הזה למישהו שצריך לצאת מהבית יותר מכם.`

export default function Admin() {
  const [authed, setAuthed] = useState(false)
  const [password, setPassword] = useState('')
  const [actorName, setActorName] = useState('')
  const [pwError, setPwError] = useState('')
  const [tab, setTab] = useState('pending')
  const [tours, setTours] = useState([])
  const [guides, setGuides] = useState([])
  const [pendingGuides, setPendingGuides] = useState([])
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
  const [approvingId, setApprovingId] = useState(null)

  useEffect(function() { if (!authed) return; loadData() }, [authed])

  const loadData = async function() {
    setLoading(true)
    try {
      const [toursRes, guidesRes, signupsRes, newslettersRes] = await Promise.all([
        fetch('/api/admin-data?type=tours').then(r => r.json()),
        fetch('/api/admin-data?type=guides').then(r => r.json()),
        fetch('/api/admin-data?type=signups').then(r => r.json()),
        fetch('/api/admin-data?type=newsletters').then(r => r.json()),
      ])
      const allGuides = guidesRes.records || []
      setTours(toursRes.records || [])
      setGuides(allGuides.filter(g => g.Guide_Status !== 'pending'))
      setPendingGuides(allGuides.filter(g => g.Guide_Status === 'pending'))
      setSignups(signupsRes.records || [])
      const allNewsletters = newslettersRes.records || []
      setNewsletters(allNewsletters)
      const sentTourIds = new Set()
      allNewsletters.filter(n => n.Status === 'Sent').forEach(n => {
        if (n.Tours_Included) n.Tours_Included.split(',').forEach(id => sentTourIds.add(id.trim()))
      })
      const unsent = (toursRes.records || []).filter(t => t.Tour_Status === 'paid' && !sentTourIds.has(t.id))
      setNewTours(unsent)
      setSelectedTours(unsent.map(t => t.id))
    } catch(e) { console.error(e) }
    setLoading(false)
  }

  const handleLogin = function(e) {
    e.preventDefault()
    if (!actorName.trim()) { setPwError('נא להזין שם'); return }
    if (password === ADMIN_PASSWORD) { setAuthed(true); setPwError('') }
    else setPwError('סיסמה שגויה')
  }

  const updateTourStatus = async function(tourId, status) {
    await fetch('/api/admin-update-tour', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ tour_id: tourId, status }) })
    setTours(prev => prev.map(t => t.id === tourId ? Object.assign({}, t, { Tour_Status: status }) : t))
  }

  const handleGuideAction = async function(guideId, action) {
    setApprovingId(guideId)
    await fetch('/api/approve-guide', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ guide_id: guideId, action }) })
    setPendingGuides(prev => prev.filter(g => g.id !== guideId))
    setApprovingId(null)
    loadData()
  }

  const moveUp = function(index) { if (index===0) return; var l=selectedTours.slice(); var t=l[index-1]; l[index-1]=l[index]; l[index]=t; setSelectedTours(l) }
  const moveDown = function(index) { if (index===selectedTours.length-1) return; var l=selectedTours.slice(); var t=l[index+1]; l[index+1]=l[index]; l[index]=t; setSelectedTours(l) }
  const removeTour = function(id) { setSelectedTours(selectedTours.filter(t => t !== id)) }
  const getTourById = function(id) { return newTours.find(t => t.id === id) }

  const saveDraft = async function() {
    setSavingDraft(true)
    await fetch('/api/save-newsletter-draft', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ subject: nlSubject, intro: nlIntro, outro: nlOutro, tour_ids: selectedTours }) })
    setSavingDraft(false); loadData(); alert('הטיוטה נשמרה!')
  }

  const loadDraft = function(draft) {
    setNlSubject(draft.Subject||''); setNlIntro(draft.Intro_Text||''); setNlOutro(draft.Outro_Text||'')
    if (draft.Tours_Included) setSelectedTours(draft.Tours_Included.split(',').map(s => s.trim()))
    setNlStep('compose')
  }

  const handleSend = async function() {
    if (!nlSubject.trim()) { alert('יש להזין נושא'); return }
    if (selectedTours.length===0) { alert('יש לבחור לפחות סיור אחד'); return }
    setSending(true)
    try {
      await fetch('/api/send-newsletter', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ subject: nlSubject, intro: nlIntro, outro: nlOutro, tour_ids: selectedTours }) })
      setNlStep('sent'); loadData()
    } catch(e) { alert('שגיאה בשליחה') }
    setSending(false)
  }

  const handleSendBilling = async function() {
    if (window.confirm('לשלוח חשבוניות לכל המדריכים הפעילים?')) {
      const res = await fetch('/api/send-billing-email', { method: 'POST' })
      const data = await res.json()
      alert('נשלחו ' + data.sent + ' חשבוניות!')
    }
  }

  const inp = { width: '100%', padding: '10px 14px', borderRadius: 6, border: '1px solid #ddd', fontSize: 14, fontFamily: 'Heebo, Arial, sans-serif', outline: 'none', boxSizing: 'border-box' }
  const th = { padding: '10px 12px', textAlign: 'right', fontSize: 12, fontWeight: 700, color: '#888', borderBottom: '2px solid #eee', whiteSpace: 'nowrap' }
  const td = { padding: '10px 12px', fontSize: 13, borderBottom: '1px solid #f0f0f0', verticalAlign: 'middle' }

  if (!authed) return (
    <div style={{ fontFamily: 'Heebo, Arial, sans-serif', background: '#F7F1EA', minHeight: '100vh' }}>
      <Header />
      <div style={{ maxWidth: 400, margin: '120px auto', padding: '0 24px', textAlign: 'center' }}>
        <h1 style={{ fontSize: 24, fontWeight: 900, marginBottom: 8 }}>MvH Mission Control</h1>
        <p style={{ color: '#888', fontSize: 13, marginBottom: 32 }}>גישה מורשית בלבד</p>
        <form onSubmit={handleLogin}>
          <input type="text" value={actorName} onChange={e => setActorName(e.target.value)} placeholder="שם (לתיעוד פעולות בכספים)" style={Object.assign({}, inp, { marginBottom: 12 })} />
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="סיסמה" style={Object.assign({}, inp, { marginBottom: 12 })} />
          {pwError && <p style={{ color: '#e00', fontSize: 13, marginBottom: 12 }}>{pwError}</p>}
          <button type="submit" style={{ width: '100%', background: '#111', color: '#fff', padding: 12, borderRadius: 8, fontSize: 15, fontWeight: 800, cursor: 'pointer', border: 'none', fontFamily: 'Heebo, Arial, sans-serif' }}>כניסה</button>
        </form>
      </div>
    </div>
  )

  const activeTours = tours.filter(t => t.Tour_Status === 'paid')
  const totalLeads = tours.reduce((a,t) => a+(Number(t.Lead_Count)||0), 0)
  const totalViews = tours.reduce((a,t) => a+(Number(t.View_Count)||0), 0)
  const totalNL = tours.reduce((a,t) => a+(Number(t.Newsletter_Click_Count)||0), 0)
  const sentNewsletters = newsletters.filter(n => n.Status === 'Sent')
  const draftNewsletters = newsletters.filter(n => n.Status === 'Draft')

  const statusBadge = function(status) {
    var c = { paid:'#22c55e', frozen:'#f59e0b', removed:'#ef4444', collab:'#3b82f6' }
    var l = { paid:'פעיל', frozen:'מוקפא', removed:'מוסר', collab:'שת"פ' }
    return <span style={{ background: c[status]||'#999', color:'#fff', padding:'3px 10px', borderRadius:12, fontSize:11, fontWeight:700 }}>{l[status]||status}</span>
  }

  const TABS = [
    ['pending', `ממתינים לאישור (${pendingGuides.length})`],
    ['tours', `סיורים (${tours.length})`],
    ['guides', `מדריכים (${guides.length})`],
    ['signups', `קהילה (${signups.length})`],
    ['newsletter', 'ניוזלטר'],
    ['finance', 'כספים'],
    ['control', 'בקרה'],
  ]

  return (
    <div style={{ fontFamily: 'Heebo, Arial, sans-serif', background: '#F7F1EA', minHeight: '100vh' }}>
      <Header />
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px' }}>

        {/* header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <h1 style={{ fontSize: 28, fontWeight: 900, letterSpacing: '-0.5px' }}>MvH Mission Control</h1>
          <button onClick={handleSendBilling} style={{ background: '#111', color: '#fff', padding: '10px 24px', borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: 'pointer', border: 'none', fontFamily: 'Heebo, Arial, sans-serif' }}>
            💳 שלח חשבוניות חודשיות
          </button>
        </div>

        {/* stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 14, marginBottom: 36 }}>
          {[
            ['ממתינים לאישור', pendingGuides.length, '#f59e0b'],
            ['סיורים פעילים', activeTours.length, '#22c55e'],
            ['מדריכים', guides.length, '#3b82f6'],
            ['חברי קהילה', signups.length, BROWN],
            ['צפיות', totalViews, '#8b5cf6'],
            ['וואטסאפ', totalLeads, '#25D366'],
            ['ניוזלטרים', sentNewsletters.length, '#f59e0b'],
          ].map(function(s) {
            return (
              <div key={s[0]} style={{ background: '#fff', borderRadius: 10, padding: '18px 14px', textAlign: 'center', borderTop: '3px solid '+s[2], border: '1px solid #EDE7DF', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                <p style={{ fontSize: 26, fontWeight: 900, color: s[2], marginBottom: 4 }}>{s[1]}</p>
                <p style={{ fontSize: 11, color: '#888' }}>{s[0]}</p>
              </div>
            )
          })}
        </div>

        {/* tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 28, flexWrap: 'wrap' }}>
          {TABS.map(function(item) {
            const active = tab === item[0]
            const isPending = item[0] === 'pending'
            return (
              <button key={item[0]} onClick={() => setTab(item[0])}
                style={{ padding: '8px 20px', borderRadius: 20, border: '1.5px solid', fontSize: 14, cursor: 'pointer', fontFamily: 'Heebo, Arial, sans-serif', fontWeight: 700,
                  background: active ? (isPending ? '#f59e0b' : '#111') : '#fff',
                  color: active ? '#fff' : (isPending && pendingGuides.length > 0 ? '#f59e0b' : '#444'),
                  borderColor: active ? (isPending ? '#f59e0b' : '#111') : (isPending && pendingGuides.length > 0 ? '#f59e0b' : '#ddd') }}>
                {item[1]}
              </button>
            )
          })}
        </div>

        {loading && <p style={{ color: '#888' }}>טוען...</p>}

        {/* ── PENDING GUIDES ── */}
        {!loading && tab === 'pending' && (
          <div>
            {pendingGuides.length === 0 ? (
              <div style={{ background: '#fff', borderRadius: 14, padding: 48, textAlign: 'center', border: '1px solid #EDE7DF' }}>
                <p style={{ fontSize: 32, marginBottom: 12 }}>✅</p>
                <p style={{ color: '#888', fontSize: 15 }}>אין מדריכים הממתינים לאישור</p>
              </div>
            ) : pendingGuides.map(function(g) {
              return (
                <div key={g.id} style={{ background: '#fff', border: '1px solid #EDE7DF', borderRadius: 14, padding: 24, marginBottom: 16, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                        <h3 style={{ fontSize: 18, fontWeight: 900 }}>{g.Guide_Name}</h3>
                        <span style={{ background: '#FEF3C7', color: '#f59e0b', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 12 }}>ממתין לאישור</span>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: '6px 24px', fontSize: 13, color: '#555' }}>
                        {g.Business_Name && <p><strong>עסק:</strong> {g.Business_Name}</p>}
                        {g.Email && <p><strong>מייל:</strong> {g.Email}</p>}
                        {g.Phone_Number && <p><strong>טלפון:</strong> {g.Phone_Number}</p>}
                        {g.Street_Address && <p><strong>כתובת:</strong> {g.Street_Address}</p>}
                      </div>
                      {g.Certificate_URL && (
                        <div style={{ marginTop: 14 }}>
                          <a href={g.Certificate_URL} target="_blank" rel="noopener noreferrer"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#F7F1EA', border: '1px solid #EDE7DF', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 700, color: BROWN, textDecoration: 'none' }}>
                            📄 צפייה בתעודת מורה דרך ↗
                          </a>
                        </div>
                      )}
                      {!g.Certificate_URL && (
                        <p style={{ marginTop: 12, fontSize: 12, color: '#ef4444', fontWeight: 700 }}>⚠️ לא הועלתה תעודה</p>
                      )}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, minWidth: 140 }}>
                      <button onClick={() => handleGuideAction(g.id, 'approve')} disabled={approvingId === g.id}
                        style={{ background: '#22c55e', color: '#fff', border: 'none', borderRadius: 8, padding: '11px 20px', fontSize: 14, fontWeight: 800, cursor: 'pointer', fontFamily: 'Heebo, Arial, sans-serif', opacity: approvingId===g.id ? 0.7 : 1 }}>
                        {approvingId === g.id ? 'מאשר...' : '✓ אשר מדריך'}
                      </button>
                      <button onClick={() => { if (window.confirm('לדחות את ' + g.Guide_Name + '?')) handleGuideAction(g.id, 'reject') }} disabled={approvingId === g.id}
                        style={{ background: '#fff', color: '#ef4444', border: '1.5px solid #ef4444', borderRadius: 8, padding: '11px 20px', fontSize: 14, fontWeight: 800, cursor: 'pointer', fontFamily: 'Heebo, Arial, sans-serif' }}>
                        ✕ דחה
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* ── TOURS ── */}
        {!loading && tab === 'tours' && (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr>{['שם סיור','מדריך','עיר','מחיר','צפיות','ניוזלטר','וואטסאפ','סה"כ','סטטוס','פעולות'].map(h => <th key={h} style={th}>{h}</th>)}</tr></thead>
              <tbody>
                {tours.map(function(t) {
                  var views=Number(t.View_Count)||0, nl=Number(t.Newsletter_Click_Count)||0, leads=Number(t.Lead_Count)||0
                  return (
                    <tr key={t.id}>
                      <td style={td}><a href={'/tours/'+t.id} target="_blank" rel="noopener noreferrer" style={{ color:'#111', fontWeight:700, textDecoration:'none' }}>{t.Tour_Title}</a></td>
                      <td style={td}>{t.Guide_Name}</td>
                      <td style={td}>{t.Cities_Tags}</td>
                      <td style={td}>{t.Price_Per_Person} ₪</td>
                      <td style={td}>{views}</td>
                      <td style={td}>{nl}</td>
                      <td style={td}>{leads}</td>
                      <td style={Object.assign({},td,{fontWeight:700,color:BROWN})}>{views+nl+leads}</td>
                      <td style={td}>{statusBadge(t.Tour_Status)}</td>
                      <td style={td}>
                        <div style={{ display:'flex', gap:6 }}>
                          {t.Tour_Status!=='paid' && <button onClick={() => updateTourStatus(t.id,'paid')} style={{ padding:'4px 10px', fontSize:12, borderRadius:6, border:'1px solid #22c55e', color:'#22c55e', cursor:'pointer', background:'#fff' }}>הפעל</button>}
                          {t.Tour_Status!=='frozen' && <button onClick={() => updateTourStatus(t.id,'frozen')} style={{ padding:'4px 10px', fontSize:12, borderRadius:6, border:'1px solid #f59e0b', color:'#f59e0b', cursor:'pointer', background:'#fff' }}>הקפא</button>}
                          {t.Tour_Status!=='removed' && <button onClick={() => { if(window.confirm('להסיר?')) updateTourStatus(t.id,'removed') }} style={{ padding:'4px 10px', fontSize:12, borderRadius:6, border:'1px solid #ef4444', color:'#ef4444', cursor:'pointer', background:'#fff' }}>הסר</button>}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* ── GUIDES ── */}
        {!loading && tab === 'guides' && (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr>{['שם מדריך','אימייל','טלפון','סטטוס','תעודה'].map(h => <th key={h} style={th}>{h}</th>)}</tr></thead>
              <tbody>
                {guides.map(function(g) {
                  return (
                    <tr key={g.id}>
                      <td style={Object.assign({},td,{fontWeight:700})}>{g.Guide_Name}</td>
                      <td style={td}>{g.Email}</td>
                      <td style={td}>{g.Phone_Number}</td>
                      <td style={td}>
                        <span style={{ background: g.Guide_Status==='active'?'#dcfce7':'#f3f4f6', color: g.Guide_Status==='active'?'#16a34a':'#666', fontSize:11, fontWeight:700, padding:'3px 10px', borderRadius:12 }}>
                          {g.Guide_Status==='active' ? 'פעיל' : g.Guide_Status || 'פעיל'}
                        </span>
                      </td>
                      <td style={td}>
                        {g.Certificate_URL
                          ? <a href={g.Certificate_URL} target="_blank" rel="noopener noreferrer" style={{ color:BROWN, fontSize:12, fontWeight:700, textDecoration:'none' }}>📄 צפייה</a>
                          : <span style={{ color:'#ccc', fontSize:12 }}>—</span>
                        }
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* ── SIGNUPS ── */}
        {!loading && tab === 'signups' && (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr>{['שם','אימייל','וואטסאפ','אזורים','תאריך הרשמה','הסכמת קבוצה'].map(h => <th key={h} style={th}>{h}</th>)}</tr></thead>
              <tbody>
                {signups.map(function(s) {
                  return (
                    <tr key={s.id}>
                      <td style={Object.assign({},td,{fontWeight:600})}>{s.First_Name} {s.Last_Name}</td>
                      <td style={td}>{s.Email}</td>
                      <td style={td}>{s.WhatsApp_Phone}</td>
                      <td style={td}>{s.Regions_Interest}</td>
                      <td style={td}>{s.Signup_Date}</td>
                      <td style={td}>{s.WhatsApp_Group_Consent ? '✓' : '-'}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* ── NEWSLETTER ── */}
        {!loading && tab === 'newsletter' && (
          <div>
            <div style={{ display:'flex', gap:8, marginBottom:24 }}>
              {[['compose','ניוזלטר חדש'],['drafts','טיוטות ('+draftNewsletters.length+')'],['sent','נשלחו ('+sentNewsletters.length+')']].map(function(item) {
                return (
                  <button key={item[0]} onClick={() => setNlStep(item[0])}
                    style={{ padding:'6px 16px', borderRadius:20, border:'1px solid', fontSize:13, cursor:'pointer', fontFamily:'Heebo,Arial,sans-serif', fontWeight:700,
                      background: nlStep===item[0] ? BROWN : '#fff', color: nlStep===item[0] ? '#fff' : '#444',
                      borderColor: nlStep===item[0] ? BROWN : '#ddd' }}>
                    {item[1]}
                  </button>
                )
              })}
            </div>

            {nlStep === 'compose' && (
              <div>
                <div style={{ background:'#FDF6EA', borderRadius:8, padding:'12px 16px', marginBottom:24, fontSize:13, color:'#666' }}>
                  {signups.length} נמענים · {selectedTours.length} סיורים חדשים שלא נשלחו עדיין
                </div>
                <div style={{ marginBottom:20 }}>
                  <label style={{ display:'block', fontSize:13, fontWeight:700, marginBottom:6 }}>נושא המייל</label>
                  <input type="text" value={nlSubject} onChange={e => setNlSubject(e.target.value)} placeholder={SUBJECT_PLACEHOLDER} style={inp} />
                </div>
                <div style={{ marginBottom:20 }}>
                  <label style={{ display:'block', fontSize:13, fontWeight:700, marginBottom:6 }}>טקסט פתיחה</label>
                  <textarea value={nlIntro} onChange={e => setNlIntro(e.target.value)} placeholder={INTRO_PLACEHOLDER} rows={6} style={Object.assign({},inp,{resize:'vertical',lineHeight:1.7})} />
                </div>
                <div style={{ marginBottom:32 }}>
                  <label style={{ display:'block', fontSize:13, fontWeight:700, marginBottom:6 }}>טקסט סיום</label>
                  <textarea value={nlOutro} onChange={e => setNlOutro(e.target.value)} placeholder={OUTRO_PLACEHOLDER} rows={3} style={Object.assign({},inp,{resize:'vertical',lineHeight:1.7})} />
                </div>
                <div style={{ marginBottom:32 }}>
                  <h3 style={{ fontSize:15, fontWeight:700, marginBottom:12 }}>סיורים שייכללו ({selectedTours.length})</h3>
                  {selectedTours.length===0 ? <p style={{ color:'#999', fontSize:14 }}>אין סיורים חדשים</p>
                  : selectedTours.map(function(id, index) {
                    var t=getTourById(id); if (!t) return null
                    var thumb=t.Tour_Images?t.Tour_Images.split('|')[0]:null
                    var dp=Math.round((Number(t.Price_Per_Person)||0)*0.9)
                    return (
                      <div key={id} style={{ display:'flex', alignItems:'center', gap:12, padding:12, border:'1px solid #eee', borderRadius:8, marginBottom:8 }}>
                        <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
                          <button onClick={() => moveUp(index)} disabled={index===0} style={{ border:'1px solid #ddd', background:'#fff', borderRadius:4, padding:'2px 8px', cursor:'pointer', opacity:index===0?0.3:1 }}>↑</button>
                          <button onClick={() => moveDown(index)} disabled={index===selectedTours.length-1} style={{ border:'1px solid #ddd', background:'#fff', borderRadius:4, padding:'2px 8px', cursor:'pointer', opacity:index===selectedTours.length-1?0.3:1 }}>↓</button>
                        </div>
                        {thumb && <img src={thumb} alt="" style={{ width:56, height:56, objectFit:'cover', borderRadius:6 }} />}
                        <div style={{ flex:1 }}>
                          <p style={{ fontWeight:700, fontSize:14, marginBottom:2 }}>{t.Tour_Title}</p>
                          <p style={{ fontSize:12, color:'#888' }}>{t.Cities_Tags} · {t.Guide_Name} · <span style={{ textDecoration:'line-through' }}>{t.Price_Per_Person} ₪</span> → {dp} ₪</p>
                        </div>
                        <button onClick={() => removeTour(id)} style={{ border:'1px solid #ef4444', color:'#ef4444', background:'#fff', borderRadius:6, padding:'4px 10px', fontSize:12, cursor:'pointer' }}>הסר</button>
                      </div>
                    )
                  })}
                </div>
                <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
                  <button onClick={saveDraft} disabled={savingDraft} style={{ background:'#F5F5F5', color:'#444', padding:'12px 24px', borderRadius:8, fontSize:14, fontWeight:700, cursor:'pointer', border:'1px solid #ddd', opacity:savingDraft?0.7:1, fontFamily:'Heebo,Arial,sans-serif' }}>
                    {savingDraft ? 'שומר...' : '💾 שמור טיוטה'}
                  </button>
                  <button onClick={handleSend} disabled={sending} style={{ background:'#111', color:'#fff', padding:'12px 32px', borderRadius:8, fontSize:14, fontWeight:700, cursor:sending?'not-allowed':'pointer', border:'none', opacity:sending?0.7:1, fontFamily:'Heebo,Arial,sans-serif' }}>
                    {sending ? 'שולח...' : '✉️ שלח ל-'+signups.length+' נמענים'}
                  </button>
                </div>
              </div>
            )}

            {nlStep==='drafts' && (
              <div>
                {draftNewsletters.length===0 ? <p style={{ color:'#999' }}>אין טיוטות שמורות</p>
                : draftNewsletters.map(function(draft) {
                  return (
                    <div key={draft.id} style={{ border:'1px solid #eee', borderRadius:8, padding:16, marginBottom:12 }}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                        <div>
                          <p style={{ fontWeight:700, fontSize:15, marginBottom:4 }}>{draft.Subject||'(ללא נושא)'}</p>
                          <p style={{ fontSize:12, color:'#888' }}>{draft.Tours_Included?draft.Tours_Included.split(',').length:0} סיורים</p>
                        </div>
                        <button onClick={() => { loadDraft(draft); setNlStep('compose') }} style={{ background:BROWN, color:'#fff', padding:'8px 16px', borderRadius:6, fontSize:13, fontWeight:700, cursor:'pointer', border:'none', fontFamily:'Heebo,Arial,sans-serif' }}>
                          המשך עריכה
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {nlStep==='sent' && (
              <div>
                {sentNewsletters.length===0 ? <p style={{ color:'#999' }}>עדיין לא נשלח אף ניוזלטר</p>
                : <table style={{ width:'100%', borderCollapse:'collapse' }}>
                    <thead><tr>{['תאריך שליחה','נושא','נמענים','נמסר','סיורים'].map(h => <th key={h} style={th}>{h}</th>)}</tr></thead>
                    <tbody>
                      {sentNewsletters.map(function(n) {
                        return (
                          <tr key={n.id}>
                            <td style={td}>{n.Sent_At?new Date(n.Sent_At).toLocaleDateString('he-IL'):'-'}</td>
                            <td style={Object.assign({},td,{fontWeight:600})}>{n.Subject}</td>
                            <td style={td}>{n.Recipients_Count||'-'}</td>
                            <td style={td}>{n.Delivered_Count||'-'}</td>
                            <td style={td}>{n.Tours_Included?n.Tours_Included.split(',').length:0}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                }
              </div>
            )}
          </div>
        )}

        {/* ── FINANCE ── */}
        {!loading && tab === 'finance' && (
          <FinanceTab adminId={actorName} />
        )}

        {/* ── CONTROL CENTER ── */}
        {!loading && tab === 'control' && (
          <ControlCenterTab adminId={actorName} />
        )}
      </div>
    </div>
  )
}
