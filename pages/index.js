import { useState, useEffect, useRef } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useUser } from '@clerk/nextjs'
import Header from '../components/Header'
import TourCard from '../components/TourCard'

const REGIONS = ["צפון", "גליל עליון", "גליל מערבי", "גולן", "חיפה", "השרון", "מרכז", "תל אביב", "ירושלים", "שפלה", "יו\"ש", "צפון הנגב", "באר שבע", "נגב", "ערבה", "דרום", "אילת", "ים המלח", "עין גדי", "מצדה"]
const PERIODS = ["תקופת המקרא / ימי האבות", "בית ראשון (ממלכת ישראל ויהודה)", "בית שני", "התקופה הרומית-ביזנטית", "התקופה המוסלמית הקדומה", "תקופת הצלבנים", "התקופה הממלוכית", "התקופה העות'מאנית", "המנדט הבריטי", "מדינת ישראל (1948 ואילך)"]

function TourGrid({ tours, emptyText }) {
  if (!tours || tours.length === 0) return <p style={{ color: '#999', fontSize: 14, padding: '16px 0' }}>{emptyText || 'אין סיורים להצגה'}</p>
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
      {tours.map(function(tour) { return <TourCard key={tour.id} tour={tour} /> })}
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 56 }}>
      <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 20, color: '#0A0A0A', borderRight: '4px solid #C4922A', paddingRight: 12 }}>{title}</h2>
      {children}
    </div>
  )
}

export default function Home({ tours, guides }) {
  const { user, isLoaded } = useUser()
  const [search, setSearch] = useState('')
  const [selectedRegion, setSelectedRegion] = useState('')
  const [selectedPeriod, setSelectedPeriod] = useState('')
  const [guideSearch, setGuideSearch] = useState('')
  const [guideMatches, setGuideMatches] = useState([])
  const [selectedGuide, setSelectedGuide] = useState('')
  const [showNotFound, setShowNotFound] = useState(false)
  const [notFoundText, setNotFoundText] = useState('')
  const [notFoundSent, setNotFoundSent] = useState(false)
  const [userRegions, setUserRegions] = useState([])

  useEffect(function() {
    if (!isLoaded || !user) return
    fetch('/api/get-signup?clerk_id=' + user.id)
      .then(function(r) { return r.json() })
      .then(function(data) {
        if (data.found && data.signup.Regions_Interest) {
          setUserRegions(data.signup.Regions_Interest.split(', ').filter(Boolean))
        }
      })
  }, [isLoaded, user])

  const activeTours = tours.filter(function(t) { return t.Tour_Status === 'paid' })
  const isSearching = search || selectedRegion || selectedPeriod || selectedGuide

  const filteredTours = isSearching ? activeTours.filter(function(t) {
    var matchSearch = !search || (t.Tour_Title && t.Tour_Title.includes(search)) || (t.Tour_Story && t.Tour_Story.includes(search))
    var matchRegion = !selectedRegion || t.Cities_Tags === selectedRegion
    var matchPeriod = !selectedPeriod || (t.Historical_Period && t.Historical_Period.includes(selectedPeriod))
    var matchGuide = !selectedGuide || t.Guide_Name === selectedGuide
    return matchSearch && matchRegion && matchPeriod && matchGuide
  }) : []

  const recentTours = activeTours.slice().sort(function(a, b) {
    return new Date(b.Created_At || 0) - new Date(a.Created_At || 0)
  }).slice(0, 6)

  const popularTours = activeTours.slice().sort(function(a, b) {
    return (Number(b.Lead_Count) || 0) - (Number(a.Lead_Count) || 0)
  }).slice(0, 6)

  const myRegionTours = userRegions.length > 0
    ? activeTours.filter(function(t) { return userRegions.includes(t.Cities_Tags) }).slice(0, 6)
    : []

  const handleGuideInput = function(val) {
    setGuideSearch(val)
    setSelectedGuide('')
    if (val.length < 2) { setGuideMatches([]); return }
    var matches = guides.filter(function(g) { return g.includes(val) })
    setGuideMatches(matches.slice(0, 5))
  }

  const handleNotFoundSubmit = async function(e) {
    e.preventDefault()
    if (!notFoundText.trim()) return
    await fetch('/api/send-not-found', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: notFoundText })
    })
    setNotFoundSent(true)
  }

  const searchBarStyle = { padding: '12px 16px', borderRadius: 8, border: '1px solid #ddd', fontSize: 14, fontFamily: 'Heebo, Arial, sans-serif', outline: 'none', width: '100%', boxSizing: 'border-box' }

  return (
    <div style={{ fontFamily: 'Heebo, Arial, sans-serif' }}>
      <Head>
        <title>מאז ועד היום | סיורים היסטוריים בישראל</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="סיורים היסטוריים ייחודיים בישראל עם מורי דרך מהשורה הראשונה" />
      </Head>
      <Header />

      <div style={{ background: 'linear-gradient(135deg, #0A0A0A 0%, #1a1208 60%, #2d1f0a 100%)', padding: '64px 24px 48px', textAlign: 'center' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <p style={{ color: '#C4922A', fontSize: 13, fontWeight: 700, letterSpacing: '3px', marginBottom: 12 }}>פודקאסט וסיורים היסטוריים</p>
          <h1 style={{ fontSize: 'clamp(32px, 6vw, 56px)', fontWeight: 800, color: '#ffffff', lineHeight: 1.15, marginBottom: 16 }}>
            גלו את ישראל<br />מאז ועד היום
          </h1>
          <p style={{ color: '#aaa', fontSize: 'clamp(14px, 2vw, 18px)', marginBottom: 36, lineHeight: 1.6 }}>
            סיורים ייחודיים עם מורי דרך שמחיים את ההיסטוריה
          </p>

          <div style={{ background: '#fff', borderRadius: 12, padding: 20, maxWidth: 680, margin: '0 auto', textAlign: 'right' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10, marginBottom: 10 }}>
              <input type="text" value={search} onChange={function(e) { setSearch(e.target.value) }}
                placeholder="חפשו סיור..." style={searchBarStyle} />
              <select value={selectedRegion} onChange={function(e) { setSelectedRegion(e.target.value) }} style={searchBarStyle}>
                <option value="">כל האזורים</option>
                {REGIONS.map(function(r) { return <option key={r} value={r}>{r}</option> })}
              </select>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10, marginBottom: 10 }}>
              <select value={selectedPeriod} onChange={function(e) { setSelectedPeriod(e.target.value) }} style={searchBarStyle}>
                <option value="">כל התקופות ההיסטוריות</option>
                {PERIODS.map(function(p) { return <option key={p} value={p}>{p}</option> })}
              </select>
              <div style={{ position: 'relative' }}>
                <input type="text" value={guideSearch} onChange={function(e) { handleGuideInput(e.target.value) }}
                  placeholder="שם מורה דרך..." style={searchBarStyle} />
                {guideMatches.length > 0 && (
                  <div style={{ position: 'absolute', top: '100%', right: 0, left: 0, background: '#fff', border: '1px solid #ddd', borderRadius: 8, zIndex: 10, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                    {guideMatches.map(function(g) {
                      return (
                        <div key={g} onClick={function() { setSelectedGuide(g); setGuideSearch(g); setGuideMatches([]) }}
                          style={{ padding: '10px 14px', cursor: 'pointer', fontSize: 14 }}>
                          {g}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
            <button onClick={function() { setShowNotFound(!showNotFound) }}
              style={{ background: 'none', border: 'none', color: '#C4922A', fontSize: 13, cursor: 'pointer', textDecoration: 'underline', padding: 0 }}>
              לא מצאתי מה שחיפשתי — תמצאו לי מורה דרך שיקח אותי ל...
            </button>
            {showNotFound && !notFoundSent && (
              <form onSubmit={handleNotFoundSubmit} style={{ marginTop: 10 }}>
                <input type="text" value={notFoundText} onChange={function(e) { if (e.target.value.length <= 120) setNotFoundText(e.target.value) }}
                  placeholder="לאן תרצו ללכת? מה מעניין אתכם?" style={Object.assign({}, searchBarStyle, { marginBottom: 8 })} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 12, color: '#999' }}>{notFoundText.length}/120</span>
                  <button type="submit" style={{ background: '#C4922A', color: '#fff', padding: '8px 20px', borderRadius: 6, fontSize: 13, fontWeight: 700, cursor: 'pointer', border: 'none' }}>שלח</button>
                </div>
              </form>
            )}
            {notFoundSent && <p style={{ color: '#22c55e', fontSize: 13, marginTop: 8 }}>✓ ההודעה נשלחה! נחזור אליכם בהקדם</p>}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '48px 24px' }}>

        {isSearching && (
          <Section title={'תוצאות חיפוש (' + filteredTours.length + ')'}>
            <TourGrid tours={filteredTours} emptyText="לא נמצאו סיורים התואמים לחיפוש" />
          </Section>
        )}

        {!isSearching && user && myRegionTours.length > 0 && (
          <Section title="סיורים באזור שלך">
            <TourGrid tours={myRegionTours} />
          </Section>
        )}

        {!isSearching && (
          <Section title="סיורים מומלצים">
            <TourGrid tours={popularTours} emptyText="עדיין אין סיורים מומלצים" />
          </Section>
        )}

        {!isSearching && (
          <Section title="סיורים חדשים">
            <TourGrid tours={recentTours} emptyText="עדיין אין סיורים" />
          </Section>
        )}

        {!isSearching && (
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 28, color: '#0A0A0A', borderRight: '4px solid #C4922A', paddingRight: 12 }}>סיורים לפי אזור</h2>
            {['צפון', 'מרכז', 'ירושלים', 'שפלה', 'צפון הנגב', 'דרום'].map(function(region) {
              var regionTours = activeTours.filter(function(t) {
                var city = t.Cities_Tags || ''
                if (region === 'צפון') return ['צפון', 'גליל', 'גולן', 'חיפה', 'נהריה', 'עכו', 'טבריה', 'צפת', 'קריית שמונה'].some(function(r) { return city.includes(r) })
                if (region === 'מרכז') return ['מרכז', 'תל אביב', 'השרון', 'רמת גן', 'גבעתיים', 'פתח תקווה', 'ראשון לציון', 'רחובות', 'נתניה', 'הרצליה', 'כפר סבא', 'רעננה'].some(function(r) { return city.includes(r) })
                if (region === 'ירושלים') return city.includes('ירושלים')
                if (region === 'שפלה') return ['שפלה', 'לוד', 'רמלה', 'יבנה', 'אשדוד', 'נס ציונה', 'בית שמש'].some(function(r) { return city.includes(r) })
                if (region === 'צפון הנגב') return ['צפון הנגב', 'באר שבע', 'נתיבות', 'שדרות', 'אופקים'].some(function(r) { return city.includes(r) })
                if (region === 'דרום') return ['דרום', 'נגב', 'ערבה', 'אילת', 'ים המלח', 'מצדה', 'עין גדי', 'דימונה'].some(function(r) { return city.includes(r) })
                return false
              }).slice(0, 4)
              if (regionTours.length === 0) return null
              return (
                <div key={region} style={{ marginBottom: 40 }}>
                  <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 14, color: '#444' }}>{region}</h3>
                  <TourGrid tours={regionTours} />
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div style={{ background: '#0A0A0A', padding: '56px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: 560, margin: '0 auto' }}>
          <p style={{ color: '#C4922A', fontSize: 13, fontWeight: 700, letterSpacing: '2px', marginBottom: 12 }}>לחברי הקהילה</p>
          <h2 style={{ fontSize: 28, fontWeight: 800, color: '#fff', marginBottom: 16 }}>הצטרפו וקבלו 10% הנחה על כל הסיורים</h2>
          <p style={{ color: '#888', fontSize: 15, marginBottom: 28 }}>הרשמה חד פעמית, הנחה לכל החיים</p>
          <Link href="/discount" style={{ background: '#C4922A', color: '#fff', padding: '14px 36px', borderRadius: 8, fontSize: 16, fontWeight: 700, textDecoration: 'none', display: 'inline-block' }}>
            הצטרפו עכשיו
          </Link>
        </div>
      </div>

      <footer style={{ background: '#050505', borderTop: '1px solid #1a1a1a', padding: '24px', textAlign: 'center' }}>
        <p style={{ color: '#444', fontSize: 12 }}>© 2025 מאז ועד היום</p>
      </footer>
    </div>
  )
}

export async function getServerSideProps() {
  try {
    const token = process.env.AIRTABLE_TOKEN
    const baseId = process.env.AIRTABLE_BASE_ID
    const response = await fetch(
      `https://api.airtable.com/v0/${baseId}/tbltsGvfPLMAmJ764?pageSize=100`,
      { headers: { Authorization: `Bearer ${token}` } }
    )
    const data = await response.json()
    const tours = (data.records || []).map(function(r) { return Object.assign({ id: r.id }, r.fields) })
    const guides = [...new Set(tours.map(function(t) { return t.Guide_Name }).filter(Boolean))].sort()
    return { props: { tours, guides } }
  } catch(e) {
    return { props: { tours: [], guides: [] } }
  }
}
