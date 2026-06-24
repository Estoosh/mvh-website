import { useUser, SignedIn, SignedOut, SignUp } from '@clerk/nextjs'
import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'
import Header from '../components/Header'

const REGIONS = ["צפון", "שפלה", "מרכז", "יו\"ש", "צפון הנגב", "דרום"]
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
    })fetch('/api/get-guide?clerk_id=' + user.id + '&email=' + encodeURIComponent(user.emailAddresses?.[0]?.emailAddress || ''))
      .then(function(r) { return r.json() })
      .then(function(data) { if (data.found) setIsGuide(true) })
    fetch('/api/get-guide?clerk_id=' + user.id + '&email=' + encodeURIComponent(user.emailAddresses?.[0]?.emailAddress || ''))
      .then(function(r) { return r.json() })
      .then(function(data) {
        if (data.found) setAlreadySignedUp(true)
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
          email: user.emailAddresses && user.emailAddresses[0] ? user.emailAddresses[0].emailAddress : '',
          regions: regions,
          tour_types: tourTypes,
          travel_with: travelWith,
        }))
      })
      const data = await res.json()
      if (data.id) {
        setDone(true)
      } else {
        console.error(data)
        setLoading(false)
      }
    } catch (err) {
      console.error(err)
      setLoading(false)
    }
  }

  const inputStyle = { width: '100%', padding: '10px 14px', borderRadius: 6, border: '1px solid #ddd', fontSize: 15, fontFamily: 'Heebo, Arial, sans-serif', outline: 'none' }
  const labelStyle = { display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: '#444' }
  const sectionStyle = { marginBottom: 24, paddingBottom: 24, borderBottom: '1px solid #eee' }

  const chip = function(value, selected, onClick) {
    return (
      <button key={value} type="button" onClick={onClick}
        style={{ padding: '8px 16px', borderRadius: 20, border: '1px solid', fontSize: 13, cursor: 'pointer',
          background: selected ? '#0A0A0A' : '#fff', color: selected ? '#fff' : '#444',
          borderColor: selected ? '#0A0A0A' : '#ddd' }}>
        {value}
      </button>
    )
  }

  return (
    <div>
      <Header />
      <div style={{ maxWidth: 600, margin: '0 auto', padding: '48px 24px' }}>
        <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 8, textAlign: 'center' }}>10% הנחה על כל הסיורים</h1>
        <p style={{ color: '#666', marginBottom: 40, textAlign: 'center' }}>הרשמה חד פעמית, ותקבלו הנחה גורפת בכל סיור שתבחרו באתר</p>

        <SignedOut>
          <div style={{ textAlign: 'center', background: '#FDF6EA', borderRadius: 8, padding: 32 }}>
            <p style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>הצטרפו לקהילה וקבלו 10% הנחה</p>
            <a href="/sign-up" style={{ background: '#0A0A0A', color: '#fff', padding: '12px 32px', borderRadius: 8, fontSize: 15, fontWeight: 700, textDecoration: 'none', display: 'inline-block' }}>
              הרשמה חינמית
            </a>
          </div>
        </SignedOut>

        <SignedIn>
          {isGuide ? (
            <div style={{ textAlign: 'center', background: '#FDF6EA', borderRadius: 8, padding: 32 }}>
              <p style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>ברוכים הבאים, מורה דרך! 🎉</p>
              <p style={{ color: '#666' }}>כמורה דרך ב-MvH, הנחת חברי הקהילה של 10% חלה עליך אוטומטית בכל סיור שתבחרו</p>
            </div>
          ) : alreadySignedUp ? (
            <div style={{ textAlign: 'center', background: '#FDF6EA', borderRadius: 8, padding: 32 }}>
              <p style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>אתם כבר רשומים! 🎉</p>
              <p style={{ color: '#666' }}>פשוט בחרו סיור ולחצו וואטסאפ — ההנחה תוזכר אוטומטית בהודעה</p>
            </div>
          ) : done ? (
            <div style={{ textAlign: 'center', background: '#FDF6EA', borderRadius: 8, padding: 32 }}>
              <p style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>נרשמתם בהצלחה! 🎉</p>
              <p style={{ color: '#666' }}>מעתה, בכל סיור שתבחרו ותלחצו וואטסאפ — ההנחה תוזכר אוטומטית בהודעה למדריך</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div style={sectionStyle}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <label style={labelStyle}>שם פרטי <span style={{ color: '#C4922A' }}>*</span></label>
                    <input type="text" value={form.first_name} onChange={function(e) { setForm(Object.assign({}, form, { first_name: e.target.value })) }} required style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>שם משפחה <span style={{ color: '#C4922A' }}>*</span></label>
                    <input type="text" value={form.last_name} onChange={function(e) { setForm(Object.assign({}, form, { last_name: e.target.value })) }} required style={inputStyle} />
                  </div>
                </div>
              </div>

              <div style={sectionStyle}>
                <label style={labelStyle}>מספר וואטסאפ <span style={{ color: '#C4922A' }}>*</span></label>
                <input type="tel" value={form.whatsapp_phone} onChange={function(e) { setForm(Object.assign({}, form, { whatsapp_phone: e.target.value })) }} required style={inputStyle} placeholder="05X-XXXXXXX" />
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13, color: '#666', marginTop: 12, cursor: 'pointer' }}>
                  <input type="checkbox" checked={form.whatsapp_group_consent} onChange={function(e) { setForm(Object.assign({}, form, { whatsapp_group_consent: e.target.checked })) }} style={{ marginTop: 2 }} />
                  אני מאשר/ת שתצרפו אותי לקבוצת וואטסאפ עתידית עם מבצעים והטבות בלעדיות
                </label>
              </div>

              <div style={sectionStyle}>
                <label style={labelStyle}>אזורים שמעניינים אתכם</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {REGIONS.map(function(r) { return chip(r, regions.includes(r), function() { toggle(regions, setRegions, r) }) })}
                </div>
              </div>

              <div style={sectionStyle}>
                <label style={labelStyle}>סוגי סיורים שמעניינים אתכם</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {TOUR_TYPES.map(function(t) { return chip(t, tourTypes.includes(t), function() { toggle(tourTypes, setTourTypes, t) }) })}
                </div>
              </div>

              <div style={sectionStyle}>
                <label style={labelStyle}>בעיקר מטיילים עם</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {TRAVEL_WITH.map(function(t) { return chip(t, travelWith.includes(t), function() { toggle(travelWith, setTravelWith, t) }) })}
                </div>
              </div>

              <button type="submit" disabled={loading}
                style={{ width: '100%', background: '#0A0A0A', color: '#fff', padding: '14px', borderRadius: 8, fontSize: 16, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
                {loading ? 'שומר...' : 'קבלו 10% הנחה'}
              </button>
            </form>
          )}
        </SignedIn>
      </div>
    </div>
  )
}
