import { useUser, SignedIn, SignedOut } from '@clerk/nextjs'
import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'

const REGIONS = ["צפון", "שפלה", "מרכז", 'יו"ש', "צפון הנגב", "דרום"]
const TOUR_TYPES = ["סיורים עירוניים", "סיורי שווקים"]
const TRAVEL_WITH = ["משפחה", "חברים לעבודה", "בן/בת זוג", "מצטרף כיחיד", "לא משנה לי, העיקר לטייל"]

export default function Discount() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [alreadySignedUp, setAlreadySignedUp] = useState(false)
  const [isGuide, setIsGuide] = useState(false)
  const [regions, setRegions] = useState([])
  const [tourTypes, setTourTypes] = useState([])
  const [travelWith, setTravelWith] = useState([])
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    whatsapp_phone: '',
    whatsapp_group_consent: false,
  })

  useEffect(function() {
    if (!isLoaded || !user) return
    setForm(function(prev) {
      return Object.assign({}, prev, {
        first_name: user.firstName || '',
        last_name: user.lastName || '',
      })
    })
    fetch('/api/get-guide?clerk_id=' + user.id + '&email=' + encodeURIComponent(user.emailAddresses?.[0]?.emailAddress || ''))
      .then(function(r) { return r.json() })
      .then(function(data) { if (data.found) setIsGuide(true) })
    fetch('/api/get-signup?clerk_id=' + user.id)
      .then(function(r) { return r.json() })
      .then(function(data) {
        if (data.found) {
          setAlreadySignedUp(true)
          // Already a member — send them to their real dashboard instead
          // of showing a static status card here.
          router.replace('/member')
        }
      })
  }, [isLoaded, user])

  const toggle = function(list, setList, value) {
    setList(function(prev) {
      return prev.includes(value) ? prev.filter(function(v) { return v !== value }) : prev.concat(value)
    })
  }

  const handleSubmit = async function(e) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/register-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Object.assign({}, form, {
          clerk_id: user.id,
          email: user.emailAddresses?.[0]?.emailAddress || '',
          regions: regions,
          tour_types: tourTypes,
          travel_with: travelWith,
        }))
      })
      const data = await res.json()
      if (data.id) {
        setDone(true)
        // New signup — send them into the welcome flow on their new
        // dashboard instead of leaving them on a static success card.
        router.replace('/member?welcome=1')
      }
      else { console.error(data); setLoading(false) }
    } catch(err) { console.error(err); setLoading(false) }
  }

  const lbl = { display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 6, color: '#111', fontFamily: 'Heebo, Arial, sans-serif' }
  const inp = { width: '100%', padding: '10px 14px', borderRadius: 8, border: '1.5px solid #EDE7DF', fontSize: 14, fontFamily: 'Heebo, Arial, sans-serif', outline: 'none', background: '#fff', boxSizing: 'border-box' }
  const sec = { marginBottom: 24, paddingBottom: 24, borderBottom: '1px solid #EDE7DF' }

  function Chip({ value, selected, onClick }) {
    return (
      <button type="button" onClick={onClick} style={{ padding: '8px 18px', borderRadius: 20, border: '1.5px solid', fontSize: 13, cursor: 'pointer', fontFamily: 'Heebo, Arial, sans-serif', fontWeight: 700, background: selected ? '#111' : '#fff', color: selected ? '#fff' : '#444', borderColor: selected ? '#111' : '#EDE7DF' }}>
        {value}
      </button>
    )
  }

  function StatusCard({ emoji, title, text }) {
    return (
      <div style={{ textAlign: 'center', background: '#fff', borderRadius: 18, padding: 40, border: '1px solid #EDE7DF', boxShadow: '0 8px 28px rgba(0,0,0,0.07)' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>{emoji}</div>
        <p style={{ fontSize: 20, fontWeight: 900, marginBottom: 8 }}>{title}</p>
        <p style={{ color: '#6B6B6B', lineHeight: 1.7 }}>{text}</p>
      </div>
    )
  }

  return (
    <div style={{ fontFamily: 'Heebo, Arial, sans-serif', background: '#F7F1EA', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <main style={{ flex: 1, maxWidth: 600, margin: '0 auto', padding: '56px 24px', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <h1 style={{ fontSize: 'clamp(28px,5vw,40px)', fontWeight: 900, marginBottom: 10, letterSpacing: '-0.5px' }}>10% הנחה על כל הסיורים</h1>
          <p style={{ color: '#6B6B6B', fontSize: 16, lineHeight: 1.7 }}>הרשמה חד פעמית, ותקבלו הנחה גורפת בכל סיור שתבחרו באתר</p>
        </div>

        <SignedOut>
          <div style={{ background: '#fff', borderRadius: 18, padding: 40, border: '1px solid #EDE7DF', boxShadow: '0 8px 28px rgba(0,0,0,0.07)', textAlign: 'center' }}>
            <p style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>הצטרפו לקהילה וקבלו 10% הנחה</p>
            <p style={{ color: '#6B6B6B', marginBottom: 24, fontSize: 14 }}>נדרש חשבון כדי לשמור את ההנחה שלכם</p>
            <a href="/sign-up" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#111', color: '#fff', padding: '13px 32px', borderRadius: 8, fontSize: 15, fontWeight: 800, textDecoration: 'none', fontFamily: 'Heebo, Arial, sans-serif' }}>
              הרשמה חינמית ←
            </a>
          </div>
        </SignedOut>

        <SignedIn>
          {isGuide ? (
            <StatusCard emoji="🎉" title="ברוכים הבאים, מורה דרך!" text="כמורה דרך ב-MvH, הנחת חברי הקהילה של 10% חלה עליך אוטומטית בכל סיור שתבחרו" />
          ) : alreadySignedUp ? (
            <StatusCard emoji="✅" title="אתם כבר רשומים!" text="פשוט בחרו סיור ולחצו וואטסאפ — ההנחה תוזכר אוטומטית בהודעה" />
          ) : done ? (
            <StatusCard emoji="🎉" title="נרשמתם בהצלחה!" text="מעתה, בכל סיור שתבחרו ותלחצו וואטסאפ — ההנחה תוזכר אוטומטית בהודעה למדריך" />
          ) : (
            <div style={{ background: '#fff', borderRadius: 18, padding: 36, border: '1px solid #EDE7DF', boxShadow: '0 8px 28px rgba(0,0,0,0.07)' }}>
              <form onSubmit={handleSubmit}>
                <div style={sec}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                    {[['first_name','שם פרטי'],['last_name','שם משפחה']].map(function(f) {
                      return (
                        <div key={f[0]}>
                          <label style={lbl}>{f[1]} <span style={{ color: '#7E4821' }}>*</span></label>
                          <input type="text" value={form[f[0]]} onChange={function(e) { setForm(Object.assign({}, form, { [f[0]]: e.target.value })) }} required style={inp} />
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div style={sec}>
                  <label style={lbl}>מספר וואטסאפ <span style={{ color: '#7E4821' }}>*</span></label>
                  <input type="tel" value={form.whatsapp_phone} onChange={function(e) { setForm(Object.assign({}, form, { whatsapp_phone: e.target.value })) }} required style={inp} placeholder="05X-XXXXXXX" />
                  <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13, color: '#6B6B6B', marginTop: 14, cursor: 'pointer', lineHeight: 1.5 }}>
                    <input type="checkbox" checked={form.whatsapp_group_consent} onChange={function(e) { setForm(Object.assign({}, form, { whatsapp_group_consent: e.target.checked })) }} style={{ marginTop: 2, flexShrink: 0 }} />
                    אני מאשר/ת שתצרפו אותי לקבוצת וואטסאפ עתידית עם מבצעים והטבות בלעדיות
                  </label>
                </div>

                {[
                  { label: 'אזורים שמעניינים אתכם', list: regions, setList: setRegions, items: REGIONS },
                  { label: 'סוגי סיורים שמעניינים אתכם', list: tourTypes, setList: setTourTypes, items: TOUR_TYPES },
                  { label: 'בעיקר מטיילים עם', list: travelWith, setList: setTravelWith, items: TRAVEL_WITH },
                ].map(function(section) {
                  return (
                    <div key={section.label} style={sec}>
                      <label style={lbl}>{section.label}</label>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
                        {section.items.map(function(item) {
                          return <Chip key={item} value={item} selected={section.list.includes(item)} onClick={function() { toggle(section.list, section.setList, item) }} />
                        })}
                      </div>
                    </div>
                  )
                })}

                <button type="submit" disabled={loading} style={{ width: '100%', background: '#111', color: '#fff', padding: '14px', borderRadius: 8, fontSize: 16, fontWeight: 800, cursor: loading ? 'not-allowed' : 'pointer', border: 'none', opacity: loading ? 0.7 : 1, fontFamily: 'Heebo, Arial, sans-serif' }}>
                  {loading ? 'שומר...' : 'קבלו 10% הנחה ←'}
                </button>
              </form>
            </div>
          )}
        </SignedIn>
      </main>
      <Footer />
    </div>
  )
}
