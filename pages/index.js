import { useState, useEffect, useRef } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useUser } from '@clerk/nextjs'

const BROWN = '#7E4821'
const OFF_WHITE = '#F7F5F2'
const NEAR_BLACK = '#111111'
const GRAY = '#6B6B6B'

const PERIODS = ["תקופת המקרא / ימי האבות", "בית ראשון (ממלכת ישראל ויהודה)", "בית שני", "התקופה הרומית-ביזנטית", "התקופה המוסלמית הקדומה", "תקופת הצלבנים", "התקופה הממלוכית", "התקופה העות'מאנית", "המנדט הבריטי", "מדינת ישראל (1948 ואילך)"]
const REGIONS = ["צפון", "גליל עליון", "גליל מערבי", "גולן", "חיפה", "השרון", "מרכז", "תל אביב", "ירושלים", "שפלה", "יו\"ש", "צפון הנגב", "באר שבע", "נגב", "ערבה", "דרום", "אילת", "ים המלח", "עין גדי", "מצדה"]
const SIGN_TEXTS = ["לא חשבתי שאגיע לכאן", "זה באמת פה?", "מי בכלל נוסע לשם?", "עוד 3 דקות מהבית", "פניה אחת מהשגרה", "שמעתם על המקום הזה?"]

function Sign({ text, size = 'md' }) {
  const s = size === 'sm' ? { fs: 12, py: 6, px: 16, pl: 26, arrow: 10 }
           : size === 'lg' ? { fs: 20, py: 14, px: 32, pl: 48, arrow: 16 }
           : { fs: 15, py: 10, px: 22, pl: 36, arrow: 13 }
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      background: BROWN, color: '#fff',
      paddingTop: s.py, paddingBottom: s.py,
      paddingRight: s.px, paddingLeft: s.pl,
      borderRadius: 3, fontWeight: 700, fontSize: s.fs,
      fontFamily: 'Heebo, Arial, sans-serif',
      position: 'relative', letterSpacing: '0.01em',
      boxShadow: '2px 3px 10px rgba(0,0,0,0.22)',
      whiteSpace: 'nowrap',
    }}>
      <span style={{ position: 'absolute', left: s.arrow, fontSize: s.fs * 0.85 }}>←</span>
      {text}
    </span>
  )
}

function TourCard({ tour }) {
  const [hov, setHov] = useState(false)
  const images = tour.Tour_Images ? tour.Tour_Images.split('|').filter(Boolean) : []
  const thumb = images[0] || null
  const sign = SIGN_TEXTS[Math.abs((tour.Tour_Title || 'x').charCodeAt(0)) % SIGN_TEXTS.length]

  return (
    <a href={'/tours/' + tour.id}
      style={{ textDecoration: 'none', display: 'block', flexShrink: 0, width: 300 }}
      onMouseEnter={function() { setHov(true) }}
      onMouseLeave={function() { setHov(false) }}>
      <div style={{
        borderRadius: 12, overflow: 'hidden', position: 'relative', height: 380,
        background: '#1a0d06',
        transform: hov ? 'translateY(-5px)' : 'none',
        transition: 'transform 0.22s ease, box-shadow 0.22s ease',
        boxShadow: hov ? '0 16px 40px rgba(0,0,0,0.25)' : '0 4px 16px rgba(0,0,0,0.1)',
      }}>
        {thumb
          ? <img src={thumb} alt={tour.Tour_Title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.4s ease', transform: hov ? 'scale(1.06)' : 'scale(1)' }} />
          : <div style={{ width: '100%', height: '100%', background: 'linear-gradient(160deg, #2a1508 0%, #4a2c14 60%, #1a0d06 100%)' }} />
        }
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.35) 50%, rgba(0,0,0,0.08) 100%)' }} />
        <div style={{ position: 'absolute', top: 14, right: 14 }}>
          <Sign text={sign} size="sm" />
        </div>
        <div style={{ position: 'absolute', bottom: 0, right: 0, left: 0, padding: '22px 18px' }}>
          <p style={{ color: '#fff', fontWeight: 800, fontSize: 19, lineHeight: 1.25, marginBottom: 5, fontFamily: 'Heebo, Arial, sans-serif' }}>{tour.Tour_Title}</p>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, marginBottom: 14, fontFamily: 'Heebo, Arial, sans-serif' }}>{tour.Guide_Name} · {tour.Cities_Tags}</p>
          <Sign text="מה יש לעשות שם?" size="sm" />
        </div>
      </div>
    </a>
  )
}

function Carousel({ tours, title }) {
  const ref = useRef(null)
  const [canL, setCanL] = useState(false)
  const [canR, setCanR] = useState(true)
  const onScroll = function() {
    if (!ref.current) return
    setCanL(ref.current.scrollLeft > 8)
    setCanR(ref.current.scrollLeft + ref.current.offsetWidth < ref.current.scrollWidth - 8)
  }
  useEffect(function() {
    var el = ref.current
    if (el) el.addEventListener('scroll', onScroll)
    return function() { if (el) el.removeEventListener('scroll', onScroll) }
  }, [])
  const btn = function(active, dir) {
    return (
      <button onClick={function() { ref.current && ref.current.scrollBy({ left: dir * 316, behavior: 'smooth' }) }}
        style={{ width: 42, height: 42, borderRadius: '50%', border: '1.5px solid ' + (active ? NEAR_BLACK : '#e0e0e0'), background: '#fff', color: active ? NEAR_BLACK : '#ccc', fontSize: 20, cursor: active ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, lineHeight: 1 }}>
        {dir === -1 ? '›' : '‹'}
      </button>
    )
  }
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
        <h2 style={{ fontSize: 'clamp(22px, 3vw, 30px)', fontWeight: 800, color: NEAR_BLACK, fontFamily: 'Heebo, Arial, sans-serif' }}>{title}</h2>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <a href="/" style={{ fontSize: 13, color: GRAY, textDecoration: 'none', marginLeft: 12, fontFamily: 'Heebo, Arial, sans-serif' }}>כל הסיורים ←</a>
          {btn(canR, -1)}{btn(canL, 1)}
        </div>
      </div>
      <div ref={ref} style={{ display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 4, scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {tours.map(function(t) { return <TourCard key={t.id} tour={t} /> })}
      </div>
    </div>
  )
}

export default function Home({ tours, guides }) {
  const { user, isLoaded } = useUser()
  const [isGuide, setIsGuide] = useState(false)
  const [userRegions, setUserRegions] = useState([])
  const [searchResults, setSearchResults] = useState(null)
  const [search, setSearch] = useState('')
  const [region, setRegion] = useState('')
  const [period, setPeriod] = useState('')
  const [guideInput, setGuideInput] = useState('')
  const [guideMatches, setGuideMatches] = useState([])
  const [selectedGuide, setSelectedGuide] = useState('')
  const [notFound, setNotFound] = useState(false)
  const [notFoundText, setNotFoundText] = useState('')
  const [notFoundSent, setNotFoundSent] = useState(false)

  useEffect(function() {
    if (!isLoaded || !user) return
    fetch('/api/get-guide?clerk_id=' + user.id).then(function(r) { return r.json() }).then(function(d) { if (d.found) setIsGuide(true) })
    fetch('/api/get-signup?clerk_id=' + user.id).then(function(r) { return r.json() }).then(function(d) {
      if (d.found && d.signup && d.signup.Regions_Interest) setUserRegions(d.signup.Regions_Interest.split(', ').filter(Boolean))
    })
  }, [isLoaded, user])

  const active = tours.filter(function(t) { return t.Tour_Status === 'paid' })
  const recent = active.slice().sort(function(a, b) { return new Date(b.Created_At || 0) - new Date(a.Created_At || 0) }).slice(0, 10)
  const popular = active.slice().sort(function(a, b) { return (Number(b.Lead_Count) || 0) - (Number(a.Lead_Count) || 0) }).slice(0, 10)
  const myRegion = userRegions.length > 0 ? active.filter(function(t) { return userRegions.includes(t.Cities_Tags) }).slice(0, 10) : []

  const handleSearch = function() {
    var results = active.filter(function(t) {
      var ms = !search || (t.Tour_Title && t.Tour_Title.includes(search)) || (t.Tour_Story && t.Tour_Story.includes(search))
      var mr = !region || t.Cities_Tags === region
      var mp = !period || (t.Historical_Period && t.Historical_Period.includes(period))
      var mg = !selectedGuide || t.Guide_Name === selectedGuide
      return ms && mr && mp && mg
    })
    setSearchResults(results)
    setTimeout(function() { var el = document.getElementById('search-results'); if (el) el.scrollIntoView({ behavior: 'smooth' }) }, 100)
  }

  const handleGuideInput = function(val) {
    setGuideInput(val); setSelectedGuide('')
    if (val.length < 2) { setGuideMatches([]); return }
    setGuideMatches(guides.filter(function(g) { return g.includes(val) }).slice(0, 5))
  }

  const handleNotFound = async function(e) {
    e.preventDefault()
    await fetch('/api/send-not-found', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: notFoundText }) })
    setNotFoundSent(true)
  }

  const inp = { padding: '11px 16px', borderRadius: 8, border: '1px solid #e5e5e5', fontSize: 14, fontFamily: 'Heebo, Arial, sans-serif', outline: 'none', background: '#fff', width: '100%', boxSizing: 'border-box' }

  return (
    <div dir="rtl" style={{ fontFamily: 'Heebo, Arial, sans-serif', background: '#fff', color: NEAR_BLACK, overflowX: 'hidden' }}>
      <Head>
        <title>מאז ועד היום | אחלה תירוץ לצאת מהבית</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="מקומות שלא חשבתם לנסוע אליהם. אנשים שלא הכרתם. סיפורים שקשה להאמין שנמצאים כל כך קרוב." />
        <style>{`
          *{box-sizing:border-box;margin:0;padding:0;}
          ::-webkit-scrollbar{display:none;}
          body{overflow-x:hidden;}
          @media(max-width:768px){
            .hg{grid-template-columns:1fr!important;min-height:100svh!important;}
            .hi{display:none!important;}
            .ht{padding:48px 24px!important;}
            .tc{grid-template-columns:1fr!important;}
            .sb{flex-direction:column!important;}
          }
        `}</style>
      </Head>

      {/* NAV */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 200, background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(8px)', borderBottom: '1px solid #f0f0f0' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/"><img src="/logo.png" alt="מאז ועד היום" style={{ height: 34, objectFit: 'contain' }} /></Link>
          <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
            <a href="#podcast" style={{ fontSize: 14, color: GRAY, textDecoration: 'none' }}>פודקאסט</a>
            <a href="#guides" style={{ fontSize: 14, color: GRAY, textDecoration: 'none' }}>מדריכים</a>
            {user && (isGuide
              ? <Link href="/dashboard" style={{ fontSize: 14, color: GRAY, textDecoration: 'none' }}>דשבורד</Link>
              : <Link href="/discount" style={{ fontSize: 14, color: GRAY, textDecoration: 'none' }}>ההנחה שלי</Link>
            )}
            <Link href={isGuide ? '/add-tour' : '/join'} style={{ textDecoration: 'none' }}>
              <Sign text="אני מדריך" size="sm" />
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="hg" style={{ background: NEAR_BLACK, minHeight: '90vh', display: 'grid', gridTemplateColumns: '55% 45%', alignItems: 'center' }}>
        <div className="ht" style={{ padding: '72px 56px 72px 48px' }}>
          <div style={{ marginBottom: 28 }}><Sign text="אחלה תירוץ לצאת מהבית" size="md" /></div>
          <h1 style={{ fontSize: 'clamp(38px, 5.5vw, 62px)', fontWeight: 900, color: '#fff', lineHeight: 1.08, marginBottom: 22, letterSpacing: '-0.5px' }}>
            כולם צריכים<br />תירוץ טוב<br />לצאת מהבית.
          </h1>
          <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.55)', lineHeight: 1.9, marginBottom: 44, maxWidth: 440 }}>
            מקומות שלא חשבתם לנסוע אליהם.<br />
            אנשים שלא הכרתם.<br />
            סיפורים שקשה להאמין שנמצאים כל כך קרוב.
          </p>
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center' }}>
            <a href="#tours" style={{ textDecoration: 'none' }}><Sign text="תנו לי אחד" size="md" /></a>
            <a href="#podcast" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, border: '1.5px solid rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.8)', padding: '10px 22px', borderRadius: 4, fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>
              ▶ הפרק החדש בפודקאסט
            </a>
          </div>
        </div>
        <div className="hi" style={{ height: '90vh', position: 'relative', overflow: 'hidden' }}>
          <img src="/hero-sofa.png" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }}
            onError={function(e) { e.target.parentNode.style.background = 'linear-gradient(160deg,#1a0d06,#3a1a0a)'; e.target.style.display = 'none' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, ' + NEAR_BLACK + ' 0%, rgba(17,17,17,0.1) 50%, transparent 100%)' }} />
          <div style={{ position: 'absolute', bottom: 48, left: 48 }}>
            <Sign text="אחלה תירוץ לצאת מהבית" size="lg" />
          </div>
        </div>
      </section>

      {/* SEARCH */}
      <section style={{ background: OFF_WHITE, padding: '28px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div className="sb" style={{ display: 'flex', gap: 8, background: '#fff', borderRadius: 12, padding: 8, boxShadow: '0 4px 24px rgba(0,0,0,0.09)' }}>
            <input type="text" value={search} onChange={function(e) { setSearch(e.target.value) }} onKeyDown={function(e) { if (e.key === 'Enter') handleSearch() }} placeholder="חפשו מקום, מדריך, תקופה..." style={Object.assign({}, inp, { flex: 2 })} />
            <select value={region} onChange={function(e) { setRegion(e.target.value) }} style={Object.assign({}, inp, { flex: 1 })}>
              <option value="">כל האזורים</option>
              {REGIONS.map(function(r) { return <option key={r} value={r}>{r}</option> })}
            </select>
            <select value={period} onChange={function(e) { setPeriod(e.target.value) }} style={Object.assign({}, inp, { flex: 1.5 })}>
              <option value="">כל התקופות</option>
              {PERIODS.map(function(p) { return <option key={p} value={p}>{p}</option> })}
            </select>
            <button onClick={handleSearch} style={{ background: BROWN, color: '#fff', border: 'none', borderRadius: 8, padding: '11px 28px', fontSize: 14, fontWeight: 700, cursor: 'pointer', flexShrink: 0, fontFamily: 'Heebo, Arial, sans-serif' }}>חפשו</button>
          </div>
          <div style={{ display: 'flex', gap: 12, marginTop: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative' }}>
              <input type="text" value={guideInput} onChange={function(e) { handleGuideInput(e.target.value) }} placeholder="שם מורה דרך..." style={{ padding: '7px 12px', borderRadius: 6, border: '1px solid #ddd', fontSize: 13, fontFamily: 'Heebo, Arial, sans-serif' }} />
              {guideMatches.length > 0 && (
                <div style={{ position: 'absolute', top: '100%', right: 0, background: '#fff', border: '1px solid #ddd', borderRadius: 8, zIndex: 10, boxShadow: '0 4px 16px rgba(0,0,0,0.1)', minWidth: 180 }}>
                  {guideMatches.map(function(g) { return <div key={g} onClick={function() { setSelectedGuide(g); setGuideInput(g); setGuideMatches([]) }} style={{ padding: '10px 14px', cursor: 'pointer', fontSize: 13, fontFamily: 'Heebo, Arial, sans-serif' }}>{g}</div> })}
                </div>
              )}
            </div>
            <button onClick={function() { setNotFound(!notFound) }} style={{ background: 'none', border: 'none', color: BROWN, fontSize: 13, cursor: 'pointer', textDecoration: 'underline', fontFamily: 'Heebo, Arial, sans-serif' }}>
              לא מצאתי — תמצאו לי מדריך שיקח אותי ל...
            </button>
          </div>
          {notFound && !notFoundSent && (
            <form onSubmit={handleNotFound} style={{ marginTop: 12, display: 'flex', gap: 8 }}>
              <input type="text" value={notFoundText} onChange={function(e) { if (e.target.value.length <= 120) setNotFoundText(e.target.value) }} placeholder="לאן תרצו ללכת?" style={Object.assign({}, inp, { flex: 1 })} />
              <button type="submit" style={{ background: BROWN, color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'Heebo, Arial, sans-serif' }}>שלח</button>
            </form>
          )}
          {notFoundSent && <p style={{ marginTop: 8, fontSize: 13, color: '#22c55e', fontFamily: 'Heebo, Arial, sans-serif' }}>✓ נחזור אליכם בהקדם!</p>}
        </div>
      </section>

      {/* SEARCH RESULTS */}
      {searchResults !== null && (
        <section id="search-results" style={{ maxWidth: 1200, margin: '0 auto', padding: '48px 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <h2 style={{ fontSize: 26, fontWeight: 800 }}>תוצאות ({searchResults.length})</h2>
            <button onClick={function() { setSearchResults(null) }} style={{ background: 'none', border: 'none', fontSize: 13, color: GRAY, cursor: 'pointer', textDecoration: 'underline', fontFamily: 'Heebo, Arial, sans-serif' }}>נקה חיפוש</button>
          </div>
          {searchResults.length === 0
            ? <p style={{ color: GRAY, fontSize: 16 }}>לא נמצאו סיורים. נסו חיפוש אחר.</p>
            : <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px,1fr))', gap: 20 }}>
                {searchResults.map(function(t) { return <TourCard key={t.id} tour={t} /> })}
              </div>
          }
        </section>
      )}

      {/* MY REGION */}
      {searchResults === null && myRegion.length > 0 && (
        <section id="tours" style={{ maxWidth: 1200, margin: '0 auto', padding: '60px 24px 0' }}>
          <Carousel tours={myRegion} title="סיורים באזור שלך" />
        </section>
      )}

      {/* RECENT */}
      {searchResults === null && (
        <section id={myRegion.length === 0 ? 'tours' : 'recent'} style={{ maxWidth: 1200, margin: '0 auto', padding: '60px 24px 0' }}>
          <Carousel tours={recent} title="סיורים חדשים" />
        </section>
      )}

      {/* DISCOVERY DARK */}
      {searchResults === null && (
        <section style={{ background: NEAR_BLACK, padding: '72px 24px', marginTop: 64 }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <div style={{ marginBottom: 36 }}>
              <h2 style={{ fontSize: 'clamp(28px,5vw,50px)', fontWeight: 900, color: '#fff', marginBottom: 8 }}>עזוב, מה יש לעשות שם?</h2>
              <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.4)' }}>מקומות מפתיעים. סיפורים אמיתיים. אנשים שיפילו אתכם מהרגליים.</p>
            </div>
            <div style={{ display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 8, scrollbarWidth: 'none' }}>
              {popular.map(function(t) { return <TourCard key={t.id} tour={t} /> })}
            </div>
          </div>
        </section>
      )}

      {/* PODCAST */}
      {searchResults === null && (
        <section id="podcast" style={{ background: OFF_WHITE, padding: '80px 24px' }}>
          <div className="tc" style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 56, alignItems: 'center' }}>
            <div style={{ borderRadius: 16, overflow: 'hidden', height: 380, background: '#2a1508', position: 'relative' }}>
              <img src="/podcast-hero.png" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} onError={function(e) { e.target.style.display = 'none' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 60%)' }} />
            </div>
            <div>
              <div style={{ marginBottom: 20 }}><Sign text="הפודקאסט" size="sm" /></div>
              <h2 style={{ fontSize: 'clamp(22px,3vw,38px)', fontWeight: 800, marginBottom: 16, lineHeight: 1.25 }}>
                אם אתם במצב בטטות ספה, לפחות תקשיבו לפרק החדש.
              </h2>
              <p style={{ fontSize: 16, color: GRAY, lineHeight: 1.85, marginBottom: 32 }}>
                כי בפעם הבאה שמישהו בעבודה ישאל מה עשיתם בסופ"ש, תזרקו שם של מקום שאף אחד לא שמע עליו וכולם יהיו בטוחים שיש לכם חיים מעניינים במיוחד.
              </p>
              <a href="#" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, border: '1.5px solid ' + NEAR_BLACK, color: NEAR_BLACK, padding: '13px 26px', borderRadius: 4, fontSize: 15, fontWeight: 600, textDecoration: 'none', fontFamily: 'Heebo, Arial, sans-serif' }}>
                ▶ הפרק החדש
              </a>
            </div>
          </div>
        </section>
      )}

      {/* GUIDE RECRUITMENT */}
      {searchResults === null && (
        <section id="guides" style={{ background: '#fff', padding: '80px 24px' }}>
          <div className="tc" style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 56, alignItems: 'center' }}>
            <div>
              <div style={{ marginBottom: 20 }}><Sign text="מחפשים מדריכים" size="sm" /></div>
              <h2 style={{ fontSize: 'clamp(22px,3vw,42px)', fontWeight: 800, marginBottom: 16, lineHeight: 1.2 }}>
                מכירים מדריך טוב ב___?<br />
                יש מצב שבקרוב יגידו את השם שלכם.
              </h2>
              <p style={{ fontSize: 16, color: GRAY, lineHeight: 1.85, marginBottom: 32 }}>
                אנחנו מחברים בין מטיילים סקרנים למדריכים שמכירים את הסיפורים מאחורי המקומות. פרסמו סיורים, קבלו לקוחות, ותנו לאנשים סיבה טובה לצאת מהבית.
              </p>
              <Link href="/join" style={{ textDecoration: 'none' }}><Sign text="אני מדריך" size="md" /></Link>
            </div>
            <div style={{ borderRadius: 16, overflow: 'hidden', height: 380, background: '#1a0d06' }}>
              <img src="/guide-hero.png" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} onError={function(e) { e.target.style.display = 'none' }} />
            </div>
          </div>
        </section>
      )}

      {/* FOOTER */}
      {searchResults === null && (
        <footer style={{ background: NEAR_BLACK, padding: '80px 24px 48px' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 64 }}>
              <div style={{ marginBottom: 24 }}><Sign text="יש מקום לסיפור שלכם כאן" size="lg" /></div>
              <h2 style={{ fontSize: 'clamp(26px,5vw,52px)', fontWeight: 900, color: '#fff', lineHeight: 1.1, marginBottom: 16 }}>
                הצטרפו לקהילה שיוצאת מהבית.
              </h2>
              <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.4)', marginBottom: 36, lineHeight: 1.8 }}>
                הרשמה חד פעמית. הנחה גורפת. תירוץ מצוין.
              </p>
              <Link href="/discount" style={{ display: 'inline-block', background: BROWN, color: '#fff', padding: '15px 40px', borderRadius: 4, fontSize: 16, fontWeight: 700, textDecoration: 'none', fontFamily: 'Heebo, Arial, sans-serif' }}>
                הצטרפו — ההנחה כבר מחכה
              </Link>
            </div>
            <div style={{ borderTop: '1px solid #222', paddingTop: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
              <img src="/logo-light.png" alt="מאז ועד היום" style={{ height: 32, opacity: 0.6 }} onError={function(e) { e.target.style.display = 'none' }} />
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {['לא חשבתי שאגיע לכאן', 'זה באמת פה?', 'מי בכלל נוסע לשם?'].map(function(t) {
                  return <span key={t} style={{ display: 'inline-block', background: 'rgba(126,72,33,0.18)', color: 'rgba(255,255,255,0.45)', border: '1px solid rgba(126,72,33,0.28)', padding: '4px 12px 4px 20px', borderRadius: 3, fontSize: 12, position: 'relative', fontFamily: 'Heebo, Arial, sans-serif' }}>
                    <span style={{ position: 'absolute', left: 6, fontSize: 10 }}>←</span>{t}
                  </span>
                })}
              </div>
              <p style={{ color: '#333', fontSize: 12, fontFamily: 'Heebo, Arial, sans-serif' }}>© 2025 מאז ועד היום</p>
            </div>
          </div>
        </footer>
      )}
    </div>
  )
}

export async function getServerSideProps() {
  try {
    const token = process.env.AIRTABLE_TOKEN
    const baseId = process.env.AIRTABLE_BASE_ID
    const response = await fetch(`https://api.airtable.com/v0/${baseId}/tbltsGvfPLMAmJ764?pageSize=100`, { headers: { Authorization: `Bearer ${token}` } })
    const data = await response.json()
    const tours = (data.records || []).map(function(r) { return Object.assign({ id: r.id }, r.fields) })
    const guides = [...new Set(tours.map(function(t) { return t.Guide_Name }).filter(Boolean))].sort()
    return { props: { tours, guides } }
  } catch(e) { return { props: { tours: [], guides: [] } } }
}
