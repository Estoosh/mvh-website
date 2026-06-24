import { useState } from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import Link from 'next/link'

const ADMIN_PASSWORD = 'mvh2025admin'
const BROWN = '#7E4821'

const SUBJECT_PLACEHOLDER = 'עזוב, מה יש לעשות שם? אז זהו, שיש.'
const INTRO_PLACEHOLDER = `יש לנו חדשות טובות וחדשות רעות.
החדשות הרעות הן שנגמרו לכם התירוצים להישאר בבית.
החדשות הטובות הן שהוספנו כמה סיורים חדשים במקומות שאם היו מציעים לכם לנסוע אליהם לפני שבוע, כנראה שהייתם אומרים "עזוב, מה יש לעשות שם?"
ואם אתם בכל זאת במצב בטטות ספה, לפחות תקשיבו לפרק החדש בפודקאסט, ובפעם הבאה שמישהו בעבודה ישאל מה עשיתם בסופ"ש, תזרקו שם של מקום שאף אחד לא שמע עליו וכולם יהיו בטוחים שיש לכם חיים מעניינים במיוחד :)`
const OUTRO_PLACEHOLDER = `נרדמתם באמצע הפרק? לא נורא. המינימום שאתם יכולים לעשות זה להעביר את המייל הזה למישהו שצריך לצאת מהבית יותר מכם.`

export default function Newsletter() {
  const [authed, setAuthed] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [step, setStep] = useState('compose')
  const [subject, setSubject] = useState('')
  const [intro, setIntro] = useState('')
  const [outro, setOutro] = useState('')
  const [newTours, setNewTours] = useState([])
  const [selectedTours, setSelectedTours] = useState([])
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [signupCount, setSignupCount] = useState(0)
  const [history, setHistory] = useState([])
  const [tab, setTab] = useState('compose')

  const handleLogin = function(e) {
    e.preventDefault()
    if (password === ADMIN_PASSWORD) { setAuthed(true); loadData() }
    else setError('סיסמה שגויה')
  }

  const loadData = async function() {
    setLoading(true)
    try {
      const [toursRes, signupsRes, newslettersRes] = await Promise.all([
        fetch('/api/admin-data?type=tours').then(r => r.json()),
        fetch('/api/admin-data?type=signups').then(r => r.json()),
        fetch('/api/admin-data?type=newsletters').then(r => r.json()),
      ])
      const allTours = toursRes.records || []
      const newsletters = newslettersRes.records || []
      setHistory(newsletters)
      setSignupCount((signupsRes.records || []).length)
      const sentTourIds = new Set()
      newsletters.forEach(function(n) {
        if (n.Tours_Included) n.Tours_Included.split(',').forEach(id => sentTourIds.add(id.trim()))
      })
      const unsent = allTours.filter(t => t.Tour_Status === 'paid' && !sentTourIds.has(t.id))
      setNewTours(unsent)
      setSelectedTours(unsent.map(t => t.id))
    } catch(e) { console.error(e) }
    setLoading(false)
  }

  const moveUp = function(index) {
    if (index === 0) return
    var l = selectedTours.slice(); var t = l[index-1]; l[index-1] = l[index]; l[index] = t; setSelectedTours(l)
  }
  const moveDown = function(index) {
    if (index === selectedTours.length - 1) return
    var l = selectedTours.slice(); var t = l[index+1]; l[index+1] = l[index]; l[index] = t; setSelectedTours(l)
  }
  const removeTour = id => setSelectedTours(selectedTours.filter(t => t !== id))
  const getTourById = id => newTours.find(t => t.id === id)

  const handleSend = async function() {
    if (!subject.trim()) { alert('יש להזין נושא'); return }
    if (selectedTours.length === 0) { alert('יש לבחור לפחות סיור אחד'); return }
    setSending(true)
    try {
      await fetch('/api/send-newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, intro, outro, tour_ids: selectedTours })
      })
      setStep('sent')
    } catch(e) { alert('שגיאה בשליחה') }
    setSending(false)
  }

  const inp = { width: '100%', padding: '10px 14px', borderRadius: 8, border: '1.5px solid #EDE7DF', fontSize: 14, fontFamily: 'Heebo, Arial, sans-serif', outline: 'none', boxSizing: 'border-box', background: '#fff' }
  const th = { padding: '10px 12px', textAlign: 'right', fontSize: 12, fontWeight: 700, color: '#888', borderBottom: '2px solid #EDE7DF' }
  const td = { padding: '10px 12px', fontSize: 13, borderBottom: '1px solid #F7F1EA', verticalAlign: 'middle' }

  if (!authed) return (
    <div style={{ fontFamily: 'Heebo, Arial, sans-serif', background: '#F7F1EA', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ maxWidth: 400, width: '100%', padding: '0 24px', textAlign: 'center' }}>
          <h1 style={{ fontSize: 24, fontWeight: 900, marginBottom: 8 }}>ניוזלטר</h1>
          <p style={{ color: '#888', fontSize: 13, marginBottom: 32 }}>גישה מורשית בלבד</p>
          <form onSubmit={handleLogin}>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="סיסמה" style={Object.assign({}, inp, { marginBottom: 12 })} />
            {error && <p style={{ color: '#e00', fontSize: 13, marginBottom: 12 }}>{error}</p>}
            <button type="submit" style={{ width: '100%', background: '#111', color: '#fff', padding: 12, borderRadius: 8, fontSize: 15, fontWeight: 800, cursor: 'pointer', border: 'none', fontFamily: 'Heebo, Arial, sans-serif' }}>כניסה</button>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  )

  return (
    <div style={{ fontFamily: 'Heebo, Arial, sans-serif', background: '#F7F1EA', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <main style={{ flex: 1, maxWidth: 1000, margin: '0 auto', padding: '40px 24px', width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <h1 style={{ fontSize: 28, fontWeight: 900, letterSpacing: '-0.5px' }}>ניוזלטר</h1>
          <Link href="/admin" style={{ color: BROWN, fontSize: 14, textDecoration: 'none', fontWeight: 700 }}>← Mission Control</Link>
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 32 }}>
          {[['compose','ניוזלטר חדש'],['history','היסטוריה ('+history.length+')']].map(function(item) {
            return (
              <button key={item[0]} onClick={() => setTab(item[0])}
                style={{ padding: '8px 20px', borderRadius: 20, border: '1.5px solid', fontSize: 14, cursor: 'pointer', fontFamily: 'Heebo, Arial, sans-serif', fontWeight: 700,
                  background: tab===item[0] ? '#111' : '#fff', color: tab===item[0] ? '#fff' : '#444',
                  borderColor: tab===item[0] ? '#111' : '#EDE7DF' }}>
                {item[1]}
              </button>
            )
          })}
        </div>

        {loading && <p style={{ color: '#888' }}>טוען...</p>}

        {/* COMPOSE */}
        {!loading && tab==='compose' && step==='compose' && (
          <div>
            <div style={{ background: '#fff', border: '1px solid #EDE7DF', borderRadius: 10, padding: '12px 16px', marginBottom: 24, fontSize: 13, color: '#6B6B6B' }}>
              {signupCount} נמענים · {selectedTours.length} סיורים חדשים שלא נשלחו עדיין
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 6 }}>נושא המייל</label>
              <input type="text" value={subject} onChange={e => setSubject(e.target.value)} placeholder={SUBJECT_PLACEHOLDER} style={inp} />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 6 }}>טקסט פתיחה</label>
              <textarea value={intro} onChange={e => setIntro(e.target.value)} placeholder={INTRO_PLACEHOLDER} rows={6} style={Object.assign({},inp,{resize:'vertical',lineHeight:1.7})} />
            </div>
            <div style={{ marginBottom: 32 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 6 }}>טקסט סיום</label>
              <textarea value={outro} onChange={e => setOutro(e.target.value)} placeholder={OUTRO_PLACEHOLDER} rows={3} style={Object.assign({},inp,{resize:'vertical',lineHeight:1.7})} />
            </div>
            <div style={{ marginBottom: 32 }}>
              <h2 style={{ fontSize: 16, fontWeight: 800, marginBottom: 16 }}>סיורים שייכללו ({selectedTours.length})</h2>
              {selectedTours.length===0
                ? <p style={{ color:'#B0A89E', fontSize:14 }}>אין סיורים חדשים — כל הסיורים כבר נשלחו בעבר</p>
                : selectedTours.map(function(id, index) {
                    var t=getTourById(id); if (!t) return null
                    var thumb=t.Tour_Images?t.Tour_Images.split('|')[0]:null
                    var dp=Math.round((Number(t.Price_Per_Person)||0)*0.9)
                    return (
                      <div key={id} style={{ display:'flex', alignItems:'center', gap:12, padding:12, border:'1px solid #EDE7DF', borderRadius:10, marginBottom:8, background:'#fff' }}>
                        <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
                          <button onClick={() => moveUp(index)} disabled={index===0} style={{ border:'1px solid #ddd', background:'#fff', borderRadius:4, padding:'2px 8px', cursor:'pointer', opacity:index===0?0.3:1 }}>↑</button>
                          <button onClick={() => moveDown(index)} disabled={index===selectedTours.length-1} style={{ border:'1px solid #ddd', background:'#fff', borderRadius:4, padding:'2px 8px', cursor:'pointer', opacity:index===selectedTours.length-1?0.3:1 }}>↓</button>
                        </div>
                        {thumb && <img src={thumb} alt="" style={{ width:56, height:56, objectFit:'cover', borderRadius:8 }} />}
                        <div style={{ flex:1 }}>
                          <p style={{ fontWeight:800, fontSize:14, marginBottom:2 }}>{t.Tour_Title}</p>
                          <p style={{ fontSize:12, color:'#888' }}>{t.Cities_Tags} · {t.Guide_Name} · <span style={{ textDecoration:'line-through' }}>{t.Price_Per_Person} ₪</span> → {dp} ₪</p>
                        </div>
                        <button onClick={() => removeTour(id)} style={{ border:'1px solid #ef4444', color:'#ef4444', background:'#fff', borderRadius:6, padding:'4px 10px', fontSize:12, cursor:'pointer' }}>הסר</button>
                      </div>
                    )
                  })
              }
            </div>
            <div style={{ display:'flex', gap:12 }}>
              <button onClick={() => setStep('preview')} style={{ background:'#F7F1EA', color:'#111', padding:'12px 24px', borderRadius:8, fontSize:15, fontWeight:700, cursor:'pointer', border:'1px solid #EDE7DF', fontFamily:'Heebo,Arial,sans-serif' }}>
                תצוגה מקדימה
              </button>
              <button onClick={handleSend} disabled={sending} style={{ background:'#111', color:'#fff', padding:'12px 32px', borderRadius:8, fontSize:15, fontWeight:800, cursor:sending?'not-allowed':'pointer', border:'none', opacity:sending?0.7:1, fontFamily:'Heebo,Arial,sans-serif' }}>
                {sending ? 'שולח...' : 'שלח ל-'+signupCount+' נמענים'}
              </button>
            </div>
          </div>
        )}

        {/* PREVIEW */}
        {!loading && tab==='compose' && step==='preview' && (
          <div>
            <button onClick={() => setStep('compose')} style={{ background:'none', border:'none', color:BROWN, fontSize:14, cursor:'pointer', marginBottom:24, padding:0, fontFamily:'Heebo,Arial,sans-serif', fontWeight:700 }}>
              ← חזרה לעריכה
            </button>
            <div style={{ border:'1px solid #EDE7DF', borderRadius:12, overflow:'hidden', maxWidth:600 }}>
              <div style={{ background:'#111', padding:'20px 24px', textAlign:'center' }}>
                <img src="/Logo-white.png" alt="מאז ועד היום" style={{ height:40 }} onError={e=>e.target.style.display='none'} />
              </div>
              <div style={{ padding:'32px 24px', direction:'rtl', fontFamily:'Arial, sans-serif', background:'#fff' }}>
                <p style={{ fontSize:13, color:'#888', marginBottom:8 }}>נושא: <strong>{subject||SUBJECT_PLACEHOLDER}</strong></p>
                <hr style={{ marginBottom:24, borderColor:'#EDE7DF' }} />
                <p style={{ whiteSpace:'pre-line', fontSize:15, lineHeight:1.8, marginBottom:32 }}>{intro||INTRO_PLACEHOLDER}</p>
                {selectedTours.map(function(id) {
                  var t=getTourById(id); if (!t) return null
                  var thumb=t.Tour_Images?t.Tour_Images.split('|')[0]:null
                  var fp=Number(t.Price_Per_Person)||0
                  var dp=Math.round(fp*0.9)
                  return (
                    <div key={id} style={{ border:'1px solid #EDE7DF', borderRadius:10, overflow:'hidden', marginBottom:20 }}>
                      {thumb && <img src={thumb} alt="" style={{ width:'100%', height:200, objectFit:'cover', display:'block' }} />}
                      <div style={{ padding:16 }}>
                        <p style={{ fontWeight:800, fontSize:18, marginBottom:6 }}>{t.Tour_Title}</p>
                        <p style={{ fontSize:14, color:'#666', marginBottom:8 }}>{t.Tour_Teaser}</p>
                        <p style={{ fontSize:13, color:'#888', marginBottom:12 }}>{t.Cities_Tags} · {t.Duration_Hours} שעות · {t.Guide_Name}</p>
                        <p style={{ fontSize:14, marginBottom:16 }}>
                          <span style={{ textDecoration:'line-through', color:'#B0A89E' }}>{fp} ₪</span>{' '}
                          <span style={{ fontWeight:700, color:BROWN, fontSize:16 }}>{dp} ₪ לחברי קהילה</span>
                        </p>
                        <div style={{ background:BROWN, color:'#fff', padding:'10px 20px', borderRadius:6, textAlign:'center', fontWeight:700, fontSize:14 }}>
                          מה יש לעשות שם?
                        </div>
                      </div>
                    </div>
                  )
                })}
                <p style={{ whiteSpace:'pre-line', fontSize:14, lineHeight:1.8, color:'#555', marginTop:32 }}>{outro||OUTRO_PLACEHOLDER}</p>
                <div style={{ marginTop:32, paddingTop:20, borderTop:'1px solid #EDE7DF', fontSize:12, color:'#888', textAlign:'center' }}>
                  <strong style={{ color:'#222' }}>מאז ועד היום | MvH.co.il</strong><br />
                  פודקאסט ומורי דרך שיגרמו לכם להבחין בשלטי הכוונה בצבע חום.
                </div>
              </div>
            </div>
            <button onClick={handleSend} disabled={sending} style={{ marginTop:24, background:'#111', color:'#fff', padding:'12px 32px', borderRadius:8, fontSize:15, fontWeight:800, cursor:sending?'not-allowed':'pointer', border:'none', opacity:sending?0.7:1, fontFamily:'Heebo,Arial,sans-serif' }}>
              {sending ? 'שולח...' : 'שלח ל-'+signupCount+' נמענים'}
            </button>
          </div>
        )}

        {/* SENT */}
        {!loading && tab==='compose' && step==='sent' && (
          <div style={{ textAlign:'center', padding:'64px 0' }}>
            <p style={{ fontSize:48, marginBottom:16 }}>🎉</p>
            <h2 style={{ fontSize:24, fontWeight:900, marginBottom:8 }}>הניוזלטר נשלח!</h2>
            <p style={{ color:'#6B6B6B', marginBottom:32 }}>נשלח ל-{signupCount} חברי קהילה</p>
            <button onClick={() => { setStep('compose'); loadData() }} style={{ background:'#111', color:'#fff', padding:'12px 32px', borderRadius:8, fontSize:15, fontWeight:800, cursor:'pointer', border:'none', fontFamily:'Heebo,Arial,sans-serif' }}>
              ניוזלטר חדש
            </button>
          </div>
        )}

        {/* HISTORY */}
        {!loading && tab==='history' && (
          <div>
            {history.length===0
              ? <p style={{ color:'#B0A89E' }}>עדיין לא נשלח אף ניוזלטר</p>
              : <table style={{ width:'100%', borderCollapse:'collapse' }}>
                  <thead><tr>{['תאריך','נושא','נמענים','סיורים'].map(h=><th key={h} style={th}>{h}</th>)}</tr></thead>
                  <tbody>
                    {history.map(function(n) {
                      return (
                        <tr key={n.id}>
                          <td style={td}>{n.Sent_At||'-'}</td>
                          <td style={Object.assign({},td,{fontWeight:700})}>{n.Subject}</td>
                          <td style={td}>{n.Recipients_Count||'-'}</td>
                          <td style={td}>{n.Tours_Included?n.Tours_Included.split(',').length:0}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
            }
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
