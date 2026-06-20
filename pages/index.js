import { useState, useEffect, useRef } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useUser } from '@clerk/nextjs'

const BROWN = '#7E4821'
const BROWN_LIGHT = '#A05C2C'
const BROWN_DARK = '#5C3318'
const OFF_WHITE = '#F7F5F2'
const NEAR_BLACK = '#111111'
const GRAY = '#6B6B6B'

const PERIODS = ["תקופת המקרא / ימי האבות", "בית ראשון (ממלכת ישראל ויהודה)", "בית שני", "התקופה הרומית-ביזנטית", "התקופה המוסלמית הקדומה", "תקופת הצלבנים", "התקופה הממלוכית", "התקופה העות'מאנית", "המנדט הבריטי", "מדינת ישראל (1948 ואילך)"]
const REGIONS = ["צפון", "גליל עליון", "גליל מערבי", "גולן", "חיפה", "השרון", "מרכז", "תל אביב", "ירושלים", "שפלה", "יו\"ש", "צפון הנגב", "באר שבע", "נגב", "ערבה", "דרום", "אילת", "ים המלח", "עין גדי", "מצדה"]

const SIGN_TEXTS = ["לא חשבתי שאגיע לכאן", "זה באמת פה?", "מי בכלל נוסע לשם?", "עוד 3 דקות מהבית", "פניה אחת מהשגרה", "שמעתם על המקום הזה?"]

function BrownSign({ text, size = 'md', onClick }) {
  const sizes = {
    sm: { fontSize: 13, padding: '6px 18px 6px 28px', arrowSize: 20 },
    md: { fontSize: 16, padding: '10px 24px 10px 36px', arrowSize: 28 },
    lg: { fontSize: 20, padding: '14px 32px 14px 48px', arrowSize: 36 },
  }
  const s = sizes[size]
  return (
    <div onClick={onClick} style={{
      display: 'inline-flex', alignItems: 'center', gap: 8,
      background: BROWN, color: '#fff',
      padding: s.padding,
      borderRadius: 4,
      fontWeight: 700, fontSize: s.fontSize,
      fontFamily: 'Heebo, Arial, sans-serif',
      cursor: onClick ? 'pointer' : 'default',
      position: 'relative',
      boxShadow: '2px 3px 8px rgba(0,0,0,0.25)',
      userSelect: 'none',
    }}>
      <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: s.arrowSize * 0.6, opacity: 0.9 }}>←</span>
      {text}
    </div>
  )
}

function TourCard({ tour }) {
  const [hovered, setHovered] = useState(false)
  const images = tour.Tour_Images ? tour.Tour_Images.split('|').filter(Boolean) : []
  const thumb = images[0] || null
  const signText = SIGN_TEXTS[Math.abs(tour.Tour_Title.charCodeAt(0)) % SIGN_TEXTS.length]

  return (
    <a href={'/tours/' + tour.id} style={{ textDecoration: 'none', display: 'block', flexShrink: 0, width: 300 }}
      onMouseEnter={function() { setHovered(true) }}
      onMouseLeave={function() { setHovered(false) }}>
      <div style={{
        borderRadius: 12, overflow: 'hidden', position: 'relative', height: 380,
        background: '#222',
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
        transition: 'transform 0.2s ease',
        boxShadow: hovered ? '0 12px 32px rgba(0,0,0,0.18)' : '0 4px 16px rgba(0,0,0,0.1)',
      }}>
        {thumb ? (
          <img src={thumb} alt={tour.Tour_Title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.4s ease', transform: hovered ? 'scale(1.05)' : 'scale(1)' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #2a1a0e, #4a2c14)' }} />
        )}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.3) 50%, transparent 100%)' }} />
        <div style={{ position: 'absolute', top: 14, right: 14 }}>
          <BrownSign text={signText} size="sm" />
        </div>
        <div style={{ position: 'absolute', bottom: 0, right: 0, left: 0, padding: '20px 18px' }}>
          <p style={{ color: '#fff', fontWeight: 800, fontSize: 20, lineHeight: 1.3, marginBottom: 6, fontFamily: 'Heebo, Arial, sans-serif' }}>{tour.Tour_Title}</p>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, marginBottom: 12, fontFamily: 'Heebo, Arial, sans-serif' }}>
            {tour.Guide_Name} · {tour.Cities_Tags}
          </p>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: BROWN, color: '#fff',
            padding: '7px 16px', borderRadius: 4,
            fontSize: 13, fontWeight: 700,
            fontFamily: 'Heebo, Arial, sans-serif',
          }}>
            ← מה יש לעשות שם?
          </div>
        </div>
      </div>
    </a>
  )
}

function Carousel({ tours }) {
  const ref = useRef(null)
  const [canLeft, setCanLeft] = useState(false)
  const [canRight, setCanRight] = useState(true)

  const scroll = function(dir) {
    if (!ref.current) return
    ref.current.scrollBy({ left: dir * 320, behavior: 'smooth' })
  }

  const onScroll = function() {
    if (!ref.current) return
    setCanLeft(ref.current.scrollLeft > 0)
    setCanRight(ref.current.scrollLeft + ref.current.offsetWidth < ref.current.scrollWidth - 10)
  }

  useEffect(function() {
    var el = ref.current
    if (el) el.addEventListener('scroll', onScroll)
    return function() { if (el) el.removeEventListener('scroll', onScroll) }
  }, [])

  const btnStyle = function(enabled) {
    return {
      width: 44, height: 44, borderRadius: '50%',
      border: '1.5px solid ' + (enabled ? NEAR_BLACK : '#ddd'),
      background: '#fff', color: enabled ? NEAR_BLACK : '#ddd',
      fontSize: 18, cursor: enabled ? 'pointer' : 'default',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ fontSize: 28, fontWeight: 800, color: NEAR_BLACK, fontFamily: 'Heebo, Arial, sans-serif' }}>סיורים חדשים</h2>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <a href="/" style={{ fontSize: 14, color: GRAY, textDecoration: 'none', marginLeft: 16, fontFamily: 'Heebo, Arial, sans-serif' }}>לכל הסיורים ←</a>
          <button style={btnStyle(canRight)} onClick={function() { scroll(-1) }}>›</button>
          <button style={btnStyle(canLeft)} onClick={function() { scroll(1) }}>‹</button>
        </div>
      </div>
      <div ref={ref} style={{ display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 8, scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {tours.map(function(t) { return <TourCard key={t.id} tour={t} /> })}
      </div>
    </div>
  )
}

function SearchBar({ guides, onSearch }) {
  const [search, setSearch] = useState('')
  const [region, setRegion] = useState('')
  const [period, setPeriod] = useState('')
  const [guideInput, setGuideInput] = useState('')
  const [guideMatches, setGuideMatches] = useState([])
  const [selectedGuide, setSelectedGuide] = useState('')
  const [notFound, setNotFound] = useState(false)
  const [notFoundText, setNotFoundText] = useState('')
  const [notFoundSent, setNotFoundSent] = useState(false)

  const handleGuideInput = function(val) {
    setGuideInput(val); setSelectedGuide('')
    if (val.length < 2) { setGuideMatches([]); return }
    setGuideMatches(guides.filter(function(g) { return g.includes(val) }).slice(0, 5))
  }

  const handleSearch = function() {
    onSearch({ search, region, period, guide: selectedGuide })
  }

  const handleNotFound = async function(e) {
    e.preventDefault()
    await fetch('/api/send-not-found', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: notFoundText }) })
    setNotFoundSent(true)
  }

  const inputStyle = { padding: '10px 14px', borderRadius: 8, border: '1px solid #e0e0e0', fontSize: 14, fontFamily: 'Heebo, Arial, sans-serif', outline: 'none', width: '100%', boxSizing: 'border-box', background: '#fff' }

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, background: '#fff', borderRadius: 12, padding: 8, boxShadow: '0 4px 24px rgba(0,0,0,0.12)' }}>
        <input type="text" value={search} onChange={function(e) { setSearch(e.target.value) }} onKeyDown={function(e) { if (e.key === 'Enter') handleSearch() }} placeholder="חפשו סיור, מקום, תקופה..." style={Object.assign({}, inputStyle, { flex: 2 })} />
        <select value={region} onChange={function(e) { setRegion(e.target.value) }} style={Object.assign({}, inputStyle, { flex: 1 })}>
          <option value="">כל האזורים</option>
          {REGIONS.map(function(r) { return <option key={r} value={r}>{r}</option> })}
        </select>
        <button onClick={handleSearch} style={{ background: BROWN, color: '#fff', border: 'none', borderRadius: 8, padding: '10px 24px', fontSize: 14, fontWeight: 700, cursor: 'pointer', flexShrink: 0, fontFamily: 'Heebo, Arial, sans-serif' }}>
          חפשו
        </button>
      </div>
      <div style={{ marginTop: 12, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <select value={period} onChange={function(e) { setPeriod(e.target.value) }} style={{ padding: '7px 12px', borderRadius: 6, border: '1px solid #ddd', fontSize: 13, fontFamily: 'Heebo, Arial, sans-serif', background: '#fff', color: '#444' }}>
          <option value="">כל התקופות</option>
          {PERIODS.map(function(p) { return <option key={p} value={p}>{p}</option> })}
        </select>
        <div style={{ position: 'relative' }}>
          <input type="text" value={guideInput} onChange={function(e) { handleGuideInput(e.target.value) }} placeholder="שם מורה דרך..." style={{ padding: '7px 12px', borderRadius: 6, border: '1px solid #ddd', fontSize: 13, fontFamily: 'Heebo, Arial, sans-serif' }} />
          {guideMatches.length > 0 && (
            <div style={{ position: 'absolute', top: '100%', right: 0, background: '#fff', border: '1px solid #ddd', borderRadius: 8, zIndex: 10, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', minWidth: 180 }}>
              {guideMatches.map(function(g) {
                return <div key={g} onClick={function() { setSelectedGuide(g); setGuideInput(g); setGuideMatches([]) }} style={{ padding: '10px 14px', cursor: 'pointer', fontSize: 13, fontFamily: 'Heebo, Arial, sans-serif' }}>{g}</div>
              })}
            </div>
          )}
        </div>
        <button onClick={function() { setNotFound(!notFound) }} style={{ background: 'none', border: 'none', color: BROWN, fontSize: 13, cursor: 'pointer', textDecoration: 'underline', fontFamily: 'Heebo, Arial, sans-serif' }}>
          לא מצאתי — תמצאו לי מדריך שיקח אותי ל...
        </button>
      </div>
      {notFound && !notFoundSent && (
        <form onSubmit={handleNotFound} style={{ marginTop: 12, display: 'flex', gap: 8 }}>
          <input type="text" value={notFoundText} onChange={function(e) { if (e.target.value.length <= 120) setNotFoundText(e.target.value) }} placeholder="לאן תרצו ללכת?" style={Object.assign({}, inputStyle, { flex: 1 })} />
          <button type="submit" style={{ background: BROWN, color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'Heebo, Arial, sans-serif' }}>שלח</button>
        </form>
      )}
      {notFoundSent && <p style={{ marginTop: 8, fontSize: 13, color: '#22c55e', fontFamily: 'Heebo, Arial, sans-serif' }}>✓ נחזור אליכם בהקדם!</p>}
    </div>
  )
}

export default function Home({ tours, guides }) {
  const { user, isLoaded } = useUser()
  const [isGuide, setIsGuide] = useState(false)
  const [userRegions, setUserRegions] = useState([])
  const [searchResults, setSearchResults] = useState(null)

  useEffect(function() {
    if (!isLoaded || !user) return
    fetch('/api/get-guide?clerk_id=' + user.id).then(function(r) { return r.json() }).then(function(d) { if (d.found) setIsGuide(true) })
    fetch('/api/get-signup?clerk_id=' + user.id).then(function(r) { return r.json() }).then(function(d) {
      if (d.found && d.signup.Regions_Interest) setUserRegions(d.signup.Regions_Interest.split(', ').filter(Boolean))
    })
  }, [isLoaded, user])

  const active = tours.filter(function(t) { return t.Tour_Status === 'paid' })
  const recent = active.slice().sort(function(a, b) { return new Date(b.Created_At || 0) - new Date(a.Created_At || 0) }).slice(0, 8)
  const popular = active.slice().sort(function(a, b) { return (Number(b.Lead_Count) || 0) - (Number(a.Lead_Count) || 0) }).slice(0, 8)
  const myRegion = userRegions.length > 0 ? active.filter(function(t) { return userRegions.includes(t.Cities_Tags) }).slice(0, 8) : []

  const handleSearch = function(params) {
    var results = active.filter(function(t) {
      var ms = !params.search || (t.Tour_Title && t.Tour_Title.includes(params.search)) || (t.Tour_Story && t.Tour_Story.includes(params.search))
      var mr = !params.region || t.Cities_Tags === params.region
      var mp = !params.period || (t.Historical_Period && t.Historical_Period.includes(params.period))
      var mg = !params.guide || t.Guide_Name === params.guide
      return ms && mr && mp && mg
    })
    setSearchResults(results)
  }

  return (
    <div dir="rtl" style={{ fontFamily: 'Heebo, Arial, sans-serif', background: '#fff', color: NEAR_BLACK }}>
      <Head>
        <title>מאז ועד היום | אחלה תירוץ לצאת מהבית</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="מקומות שלא חשבתם לנסוע אליהם. אנשים שלא הכרתם. סיפורים שקשה להאמין שנמצאים כל כך קרוב." />
        <style>{`
          * { box-sizing: border-box; margin: 0; padding: 0; }
          ::-webkit-scrollbar { display: none; }
          body { overflow-x: hidden; }
          @media (max-width: 768px) {
            .hero-grid { grid-template-columns: 1fr !important; }
            .hero-image { display: none !important; }
            .two-col { grid-template-columns: 1fr !important; }
          }
        `}</style>
      </Head>

      {/* NAV */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: '#fff', borderBottom: '1px solid #f0f0f0', padding: '0 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/">
            <img src="/logo.png" alt="מאז ועד היום" style={{ height: 36, objectFit: 'contain' }} />
          </Link>
          <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
            <Link href="/#podcast" style={{ fontSize: 14, color: GRAY, textDecoration: 'none' }}>פודקאסט</Link>
            <Link href="/#guides" style={{ fontSize: 14, color: GRAY, textDecoration: 'none' }}>מדריכים</Link>
            {user && (isGuide
              ? <Link href="/dashboard" style={{ fontSize: 14, color: GRAY, textDecoration: 'none' }}>דשבורד</Link>
              : <Link href="/discount" style={{ fontSize: 14, color: GRAY, textDecoration: 'none' }}>ההנחה שלי</Link>
            )}
            <Link href={isGuide ? '/add-tour' : '/join'}>
              <BrownSign text="אני מדריך" size="sm" />
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <div className="hero-grid" style={{ background: NEAR_BLACK, minHeight: '88vh', display: 'grid', gridTemplateColumns: '1fr 1fr', alignItems: 'center' }}>
        <div style={{ padding: '64px 48px 64px 48px' }}>
          <div style={{ marginBottom: 24 }}>
            <BrownSign text="אחלה תירוץ לצאת מהבית" size="md" />
          </div>
          <h1 style={{ fontSize: 'clamp(36px, 5vw, 58px)', fontWeight: 900, color: '#fff', lineHeight: 1.1, marginBottom: 20, letterSpacing: '-0.5px' }}>
            כולם צריכים תירוץ טוב<br />לצאת מהבית.
          </h1>
          <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.6)', lineHeight: 1.9, marginBottom: 40 }}>
            מקומות שלא חשבתם לנסוע אליהם.<br />
            אנשים שלא הכרתם.<br />
            סיפורים שקשה להאמין שנמצאים כל כך קרוב.
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <a href="#tours">
              <BrownSign text="תנו לי אחד" size="md" />
            </a>
            <a href="#podcast" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, border: '1.5px solid rgba(255,255,255,0.25)', color: 'rgba(255,255,255,0.85)', padding: '10px 24px', borderRadius: 4, fontSize: 15, fontWeight: 600, textDecoration: 'none' }}>
              ▶ הפרק החדש בפודקאסט
            </a>
          </div>
        </div>
        <div className="hero-image" style={{ height: '88vh', position: 'relative', overflow: 'hidden' }}>
          <img src="/hero-sofa.png" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }} onError={function(e) { e.target.parentNode.style.background = 'linear-gradient(135deg, #1a0d06, #3a1a0a)' ; e.target.style.display = 'none' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, ' + NEAR_BLACK + ' 0%, transparent 35%)' }} />
        </div>
      </div>

      {/* SEARCH */}
      <div style={{ background: OFF_WHITE, padding: '28px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <SearchBar guides={guides} onSearch={handleSearch} />
        </div>
      </div>

      {/* SEARCH RESULTS */}
      {searchResults !== null && (
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '48px 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <h2 style={{ fontSize: 28, fontWeight: 800 }}>תוצאות ({searchResults.length})</h2>
            <button onClick={function() { setSearchResults(null) }} style={{ background: 'none', border: 'none', fontSize: 13, color: GRAY, cursor: 'pointer', textDecoration: 'underline', fontFamily: 'Heebo, Arial, sans-serif' }}>נקה חיפוש</button>
          </div>
          {searchResults.length === 0
            ? <p style={{ color: GRAY, fontSize: 16 }}>לא נמצאו סיורים. נסו חיפוש אחר.</p>
            : <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
                {searchResults.map(function(t) { return <TourCard key={t.id} tour={t} /> })}
              </div>
          }
        </div>
      )}

      {/* MY REGION */}
      {searchResults === null && myRegion.length > 0 && (
        <div id="tours" style={{ maxWidth: 1200, margin: '0 auto', padding: '56px 24px 0' }}>
          <Carousel tours={myRegion} />
        </div>
      )}

      {/* RECENT TOURS */}
      {searchResults === null && (
        <div id={myRegion.length === 0 ? 'tours' : 'tours-recent'} style={{ maxWidth: 1200, margin: '0 auto', padding: '56px 24px 0' }}>
          <Carousel tours={recent} />
        </div>
      )}

      {/* DISCOVERY — dark section */}
      {searchResults === null && (
        <div style={{ background: NEAR_BLACK, padding: '72px 24px', marginTop: 56 }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <div style={{ marginBottom: 40 }}>
              <h2 style={{ fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: 900, color: '#fff', marginBottom: 8 }}>עזוב, מה יש לעשות שם?</h2>
              <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.45)' }}>מקומות מפתיעים. סיפורים אמיתיים. אנשים טובים.</p>
            </div>
            <div style={{ display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 8, scrollbarWidth: 'none' }}>
              {popular.map(function(t) { return <TourCard key={t.id} tour={t} /> })}
            </div>
          </div>
        </div>
      )}

      {/* PODCAST */}
      {searchResults === null && (
        <div id="podcast" style={{ background: OFF_WHITE, padding: '72px 24px' }}>
          <div className="two-col" style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 56, alignItems: 'center' }}>
            <div style={{ borderRadius: 16, overflow: 'hidden', height: 360, background: '#ccc', position: 'relative' }}>
              <img src="/podcast-hero.jpg" alt="פודקאסט" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} onError={function(e) { e.target.style.display = 'none' }} />
            </div>
            <div>
              <div style={{ marginBottom: 16 }}>
                <BrownSign text="הפודקאסט" size="sm" />
              </div>
              <h2 style={{ fontSize: 'clamp(22px, 3vw, 36px)', fontWeight: 800, marginBottom: 16, lineHeight: 1.3 }}>
                אם אתם במצב בטטות ספה, לפחות תקשיבו לפרק החדש.
              </h2>
              <p style={{ fontSize: 16, color: GRAY, lineHeight: 1.8, marginBottom: 28 }}>
                כי בפעם הבאה שמישהו בעבודה ישאל מה עשיתם בסופ"ש, תזרקו שם של מקום שאף אחד לא שמע עליו.
              </p>
              <a href="#" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, border: '1.5px solid ' + NEAR_BLACK, color: NEAR_BLACK, padding: '12px 24px', borderRadius: 4, fontSize: 15, fontWeight: 600, textDecoration: 'none', fontFamily: 'Heebo, Arial, sans-serif' }}>
                ▶ הפרק החדש
              </a>
            </div>
          </div>
        </div>
      )}

      {/* GUIDE RECRUITMENT */}
      {searchResults === null && (
        <div id="guides" style={{ padding: '72px 24px', background: '#fff' }}>
          <div className="two-col" style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 56, alignItems: 'center' }}>
            <div>
              <div style={{ marginBottom: 16 }}>
                <BrownSign text="מחפשים מדריכים" size="sm" />
              </div>
              <h2 style={{ fontSize: 'clamp(22px, 3vw, 40px)', fontWeight: 800, marginBottom: 16, lineHeight: 1.3 }}>
                מכירים מדריך טוב ב___?<br />
                יש מצב שבקרוב יגידו את השם שלכם.
              </h2>
              <p style={{ fontSize: 16, color: GRAY, lineHeight: 1.8, marginBottom: 28 }}>
                אנחנו מחברים בין מטיילים סקרנים למדריכים שמכירים את הסיפורים מאחורי המקומות.
              </p>
              <Link href="/join">
                <BrownSign text="אני מדריך" size="md" />
              </Link>
            </div>
            <div style={{ borderRadius: 16, overflow: 'hidden', height: 360, background: '#ccc' }}>
              <img src="/guide-hero.jpg" alt="מדריכים" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} onError={function(e) { e.target.style.display = 'none' }} />
            </div>
          </div>
        </div>
      )}

      {/* COMMUNITY CTA */}
      {searchResults === null && (
        <div style={{ background: BROWN, padding: '64px 24px', textAlign: 'center' }}>
          <div style={{ maxWidth: 560, margin: '0 auto' }}>
            <h2 style={{ fontSize: 'clamp(20px, 4vw, 34px)', fontWeight: 800, color: '#fff', marginBottom: 12 }}>
              יש לכם סיפור שמקומות צריכים לשמוע?
            </h2>
            <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.8)', marginBottom: 28, lineHeight: 1.7 }}>
              הצטרפו לקהילת מאז ועד היום והעלו את הסיורים שלכם לאתר.
            </p>
            <Link href="/discount" style={{ display: 'inline-block', background: '#fff', color: BROWN, padding: '14px 36px', borderRadius: 4, fontSize: 16, fontWeight: 700, textDecoration: 'none', fontFamily: 'Heebo, Arial, sans-serif' }}>
              הצטרפו — ההנחה כבר מחכה
            </Link>
          </div>
        </div>
      )}

      <footer style={{ background: NEAR_BLACK, padding: '32px 24px', textAlign: 'center' }}>
        <p style={{ color: '#444', fontSize: 13, fontFamily: 'Heebo, Arial, sans-serif' }}>© 2025 מאז ועד היום</p>
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
