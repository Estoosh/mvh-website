import { useState, useEffect, useRef } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useUser } from '@clerk/nextjs'

const BROWN = '#7E4821'
const OFF_WHITE = '#F7F5F2'
const NEAR_BLACK = '#111111'
const GRAY = '#6B6B6B'

const PERIODS = ["תקופת המקרא / ימי האבות","בית ראשון (ממלכת ישראל ויהודה)","בית שני","התקופה הרומית-ביזנטית","התקופה המוסלמית הקדומה","תקופת הצלבנים","התקופה הממלוכית","התקופה העות'מאנית","המנדט הבריטי","מדינת ישראל (1948 ואילך)"]
const REGIONS = ["צפון","גליל עליון","גליל מערבי","גולן","חיפה","השרון","מרכז","תל אביב","ירושלים","שפלה",'יו"ש',"צפון הנגב","באר שבע","נגב","ערבה","דרום","אילת","ים המלח","עין גדי","מצדה"]
const SIGN_TEXTS = ["לא חשבתי שאגיע לכאן","זה באמת פה?","מי בכלל נוסע לשם?","עוד 3 דקות מהבית","פניה אחת מהשגרה","שמעתם על המקום הזה?"]

function Sign({ text, size = 'md', rotate = 0, className }) {
  const s = {
    sm:  { fs: 12, py: 6,  px: 18, pl: 28, arr: 10, r: 3 },
    md:  { fs: 15, py: 10, px: 22, pl: 36, arr: 13, r: 3 },
    lg:  { fs: 20, py: 14, px: 30, pl: 48, arr: 16, r: 4 },
    xl:  { fs: 26, py: 18, px: 38, pl: 60, arr: 20, r: 4 },
  }[size] || { fs: 15, py: 10, px: 22, pl: 36, arr: 13, r: 3 }

  return (
    <span className={className} style={{
      display: 'inline-flex', alignItems: 'center',
      background: BROWN, color: '#fff',
      paddingTop: s.py, paddingBottom: s.py,
      paddingRight: s.px, paddingLeft: s.pl,
      borderRadius: s.r, fontWeight: 700, fontSize: s.fs,
      fontFamily: 'Heebo, Arial, sans-serif',
      position: 'relative', letterSpacing: '0.01em',
      boxShadow: '3px 4px 14px rgba(0,0,0,0.28)',
      whiteSpace: 'nowrap',
      transform: rotate ? 'rotate(' + rotate + 'deg)' : undefined,
    }}>
      <span style={{ position: 'absolute', left: s.arr, fontSize: s.fs * 0.85, opacity: 0.9 }}>←</span>
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
        borderRadius: 14, overflow: 'hidden', position: 'relative', height: 380,
        background: '#1a0d06',
        transform: hov ? 'translateY(-6px)' : 'none',
        transition: 'transform 0.25s ease, box-shadow 0.25s ease',
        boxShadow: hov ? '0 20px 48px rgba(0,0,0,0.2)' : '0 4px 20px rgba(0,0,0,0.1)',
      }}>
        {thumb
          ? <img src={thumb} alt={tour.Tour_Title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.45s ease', transform: hov ? 'scale(1.07)' : 'scale(1)' }} />
          : <div style={{ width: '100%', height: '100%', background: 'linear-gradient(160deg,#2a1508,#4a2c14 60%,#1a0d06)' }} />
        }
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.93) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.05) 100%)' }} />
        <div style={{ position: 'absolute', top: 14, right: 14 }}>
          <Sign text={sign} size="sm" />
        </div>
        <div style={{ position: 'absolute', bottom: 0, right: 0, left: 0, padding: '22px 18px' }}>
          <p style={{ color: '#fff', fontWeight: 800, fontSize: 19, lineHeight: 1.25, marginBottom: 5, fontFamily: 'Heebo, Arial, sans-serif' }}>{tour.Tour_Title}</p>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13, marginBottom: 14 }}>{tour.Guide_Name} · {tour.Cities_Tags}</p>
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

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ fontSize: 'clamp(22px,3vw,30px)', fontWeight: 800, color: NEAR_BLACK, fontFamily: 'Heebo, Arial, sans-serif' }}>{title}</h2>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <a href="/" style={{ fontSize: 13, color: GRAY, textDecoration: 'none', marginLeft: 10 }}>כל הסיורים ←</a>
          <button onClick={function() { ref.current && ref.current.scrollBy({ left: -316, behavior: 'smooth' }) }}
            style={{ width: 40, height: 40, borderRadius: '50%', border: '1.5px solid ' + (canR ? NEAR_BLACK : '#ddd'), background: '#fff', color: canR ? NEAR_BLACK : '#ccc', fontSize: 18, cursor: canR ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>›</button>
          <button onClick={function() { ref.current && ref.current.scrollBy({ left: 316, behavior: 'smooth' }) }}
            style={{ width: 40, height: 40, borderRadius: '50%', border: '1.5px solid ' + (canL ? NEAR_BLACK : '#ddd'), background: '#fff', color: canL ? NEAR_BLACK : '#ccc', fontSize: 18, cursor: canL ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>‹</button>
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
      return (!search || (t.Tour_Title || '').includes(search) || (t.Tour_Story || '').includes(search))
          && (!region || t.Cities_Tags === region)
          && (!period || (t.Historical_Period || []).includes(period))
          && (!selectedGuide || t.Guide_Name === selectedGuide)
    })
    setSearchResults(results)
    setTimeout(function() { var el = document.getElementById('sr'); if (el) el.scrollIntoView({ behavior: 'smooth' }) }, 80)
  }

  const handleGuideInput = function(v) {
    setGuideInput(v); setSelectedGuide('')
    setGuideMatches(v.length < 2 ? [] : guides.filter(function(g) { return g.includes(v) }).slice(0, 5))
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
            .tc{grid-template-columns:1fr!important;}
            .sb{flex-direction:column!important;}
          }
        `}</style>
      </Head>

      {/* NAV */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 200, background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(10px)', borderBottom: '1px solid #efefef' }}>
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

      {/* HERO — full cinematic */}
      <section style={{ background: NEAR_BLACK, minHeight: '95vh', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center' }}>
        <div style={{ position: 'absolute', inset: 0 }}>
          <img src="/hero-sofa.png" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', opacity: 0.75 }}
            onError={function(e) { e.target.parentNode.style.background = 'linear-gradient(160deg,#0d0603,#2a1508)'; e.target.style.display = 'none' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 70% 40%, transparent 20%, rgba(0,0,0,0.7) 80%)' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to left, transparent 30%, rgba(0,0,0,0.85) 80%)' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, ' + NEAR_BLACK + ' 0%, transparent 40%)' }} />
        </div>
        <div style={{ position: 'relative', zIndex: 2, maxWidth: 580, padding: '80px 48px 80px 60px', marginRight: 'auto' }}>
          <div style={{ marginBottom: 40, display: 'inline-block', transform: 'rotate(-3deg)', filter: 'drop-shadow(6px 8px 24px rgba(0,0,0,0.7))' }}>
            <Sign text="אחלה תירוץ לצאת מהבית" size="xl" />
          </div>
          <h1 style={{ fontSize: 'clamp(44px,6vw,72px)', fontWeight: 900, color: '#fff', lineHeight: 1.05, marginBottom: 40, letterSpacing: '-1.5px' }}>
            כולם צריכים<br />תירוץ טוב<br />לצאת מהבית.
          </h1>
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center' }}>
            <a href="#tours" style={{ textDecoration: 'none' }}><Sign text="תנו לי אחד" size="md" /></a>
            <a href="#podcast" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, border: '1.5px solid rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.7)', padding: '10px 22px', borderRadius: 4, fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>
              ▶ הפרק החדש
            </a>
          </div>
        </div>
      </section>

      {/* DOOR OPENS — white, airy */}
      <section style={{ background: '#fff', padding: '64px 24px 0' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div className="sb" style={{ display: 'flex', gap: 8, background: '#fff', borderRadius: 14, padding: 8, boxShadow: '0 4px 32px rgba(0,0,0,0.08)', border: '1px solid #f0f0f0', marginBottom: 12 }}>
            <input type="text" value={search} onChange={function(e) { setSearch(e.target.value) }} onKeyDown={function(e) { if (e.key === 'Enter') handleSearch() }} placeholder="חפשו מקום, מדריך, תקופה..." style={Object.assign({}, inp, { flex: 2, border: 'none', padding: '12px 16px' })} />
            <select value={region} onChange={function(e) { setRegion(e.target.value) }} style={Object.assign({}, inp, { flex: 1, border: 'none' })}>
              <option value="">כל האזורים</option>
              {REGIONS.map(function(r) { return <option key={r} value={r}>{r}</option> })}
            </select>
            <select value={period} onChange={function(e) { setPeriod(e.target.value) }} style={Object.assign({}, inp, { flex: 1.5, border: 'none' })}>
              <option value="">כל התקופות</option>
              {PERIODS.map(function(p) { return <option key={p} value={p}>{p}</option> })}
            </select>
            <button onClick={handleSearch} style={{ background: BROWN, color: '#fff', border: 'none', borderRadius: 10, padding: '12px 28px', fontSize: 14, fontWeight: 700, cursor: 'pointer', flexShrink: 0, fontFamily: 'Heebo, Arial, sans-serif' }}>חפשו</button>
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative' }}>
              <input type="text" value={guideInput} onChange={function(e) { handleGuideInput(e.target.value) }} placeholder="שם מורה דרך..." style={{ padding: '7px 12px', borderRadius: 6, border: '1px solid #e5e5e5', fontSize: 13, fontFamily: 'Heebo, Arial, sans-serif', outline: 'none' }} />
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
          {notFoundSent && <p style={{ marginTop: 8, fontSize: 13, color: '#22c55e' }}>✓ נחזור אליכם בהקדם!</p>}
        </div>
      </section>

      {/* SEARCH RESULTS */}
      {searchResults !== null && (
        <section id="sr" style={{ maxWidth: 1200, margin: '0 auto', padding: '48px 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <h2 style={{ fontSize: 26, fontWeight: 800 }}>תוצאות ({searchResults.length})</h2>
            <button onClick={function() { setSearchResults(null) }} style={{ background: 'none', border: 'none', fontSize: 13, color: GRAY, cursor: 'pointer', textDecoration: 'underline', fontFamily: 'Heebo, Arial, sans-serif' }}>נקה חיפוש</button>
          </div>
          {searchResults.length === 0
            ? <p style={{ color: GRAY, fontSize: 16 }}>לא נמצאו סיורים. נסו חיפוש אחר.</p>
            : <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 20 }}>
                {searchResults.map(function(t) { return <TourCard key={t.id} tour={t} /> })}
              </div>
          }
        </section>
      )}

      {/* MY REGION */}
      {searchResults === null && myRegion.length > 0 && (
        <section id="tours" style={{ maxWidth: 1200, margin: '0 auto', padding: '64px 24px 0' }}>
          <Carousel tours={myRegion} title="סיורים באזור שלך" />
        </section>
      )}

      {/* RECENT */}
      {searchResults === null && (
        <section id={myRegion.length === 0 ? 'tours' : 'recent'} style={{ maxWidth: 1200, margin: '0 auto', padding: '64px 24px 0' }}>
          <Carousel tours={recent} title="סיורים חדשים" />
        </section>
      )}

      {/* DISCOVERY — dark */}
      {searchResults === null && (
        <section style={{ background: NEAR_BLACK, padding: '80px 24px', marginTop: 80 }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <div style={{ marginBottom: 40 }}>
              <div style={{ marginBottom: 16, display: 'inline-block', transform: 'rotate(-1.5deg)' }}>
                <Sign text="עזוב, מה יש לעשות שם?" size="lg" />
              </div>
              <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.38)', marginTop: 12 }}>מקומות מפתיעים. סיפורים אמיתיים. אנשים שיפילו אתכם מהרגליים.</p>
            </div>
            <div style={{ display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 8, scrollbarWidth: 'none' }}>
              {popular.map(function(t) { return <TourCard key={t.id} tour={t} /> })}
            </div>
          </div>
        </section>
      )}

      {/* PODCAST */}
      {searchResults === null && (
        <section id="podcast" style={{ background: '#fff', padding: '88px 24px' }}>
          <div className="tc" style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }}>
            <div style={{ borderRadius: 18, overflow: 'hidden', height: 400, background: '#1a0d06', position: 'relative', boxShadow: '0 8px 40px rgba(0,0,0,0.12)' }}>
              <img src="/podcast-hero.png" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} onError={function(e) { e.target.style.display = 'none' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top,rgba(0,0,0,0.4) 0%,transparent 55%)' }} />
            </div>
            <div>
              <div style={{ marginBottom: 20 }}><Sign text="הפודקאסט" size="sm" /></div>
              <h2 style={{ fontSize: 'clamp(24px,3vw,40px)', fontWeight: 800, marginBottom: 16, lineHeight: 1.2, color: NEAR_BLACK }}>
                אם אתם במצב בטטות ספה, לפחות תקשיבו לפרק החדש.
              </h2>
              <p style={{ fontSize: 16, color: GRAY, lineHeight: 1.9, marginBottom: 32 }}>
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
        <section id="guides" style={{ background: OFF_WHITE, padding: '88px 24px' }}>
          <div className="tc" style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }}>
            <div>
              <div style={{ marginBottom: 20 }}><Sign text="מחפשים מדריכים" size="sm" /></div>
              <h2 style={{ fontSize: 'clamp(24px,3vw,44px)', fontWeight: 800, marginBottom: 16, lineHeight: 1.18, color: NEAR_BLACK }}>
                מכירים מדריך טוב ב___?<br />יש מצב שבקרוב יגידו את השם שלכם.
              </h2>
              <p style={{ fontSize: 16, color: GRAY, lineHeight: 1.9, marginBottom: 32 }}>
                אנחנו מחברים בין מטיילים סקרנים למדריכים שמכירים את הסיפורים מאחורי המקומות.
              </p>
              <Link href="/join" style={{ textDecoration: 'none' }}><Sign text="אני מדריך" size="md" /></Link>
            </div>
            <div style={{ borderRadius: 18, overflow: 'hidden', height: 400, background: '#1a0d06', boxShadow: '0 8px 40px rgba(0,0,0,0.1)' }}>
              <img src="/guide-hero.png" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} onError={function(e) { e.target.style.display = 'none' }} />
            </div>
          </div>
        </section>
      )}

      {/* FOOTER — poster */}
      {searchResults === null && (
        <footer style={{ background: '#0A0A0A', padding: '100px 24px 56px' }}>
          <div style={{ maxWidth: 1000, margin: '0 auto', textAlign: 'center' }}>
            <h2 style={{ fontSize: 'clamp(40px,7vw,88px)', fontWeight: 900, color: '#fff', lineHeight: 1.05, marginBottom: 24, letterSpacing: '-2px' }}>
              לא הצלחנו<br />להוציא אתכם<br />מהבית?
            </h2>
            <p style={{ fontSize: 'clamp(16px,2vw,22px)', color: 'rgba(255,255,255,0.35)', marginBottom: 20, lineHeight: 1.7 }}>
              גם זה קורה.
            </p>
            <p style={{ fontSize: 'clamp(15px,1.8vw,19px)', color: 'rgba(255,255,255,0.25)', lineHeight: 1.7, maxWidth: 560, margin: '0 auto 56px' }}>
              לפחות תשלחו את האתר למישהו שצריך תירוץ טוב יותר מכם.
            </p>
            <Link href="/discount" style={{ display: 'inline-block', background: BROWN, color: '#fff', padding: '18px 48px', borderRadius: 4, fontSize: 17, fontWeight: 700, textDecoration: 'none', fontFamily: 'Heebo, Arial, sans-serif', boxShadow: '0 6px 28px rgba(126,72,33,0.4)', marginBottom: 96 }}>
              הצטרפו — ההנחה כבר מחכה
            </Link>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 0, borderTop: '1px solid #1a1a1a', paddingTop: 64, marginBottom: 64 }}>
              {[['80+','פרקי פודקאסט'],['150+','מדריכים'],['900+','מקומות']].map(function(s) {
                return (
                  <div key={s[0]} style={{ padding: '0 32px', borderRight: '1px solid #1a1a1a' }}>
                    <p style={{ fontSize: 'clamp(48px,6vw,72px)', fontWeight: 900, color: '#fff', lineHeight: 1, marginBottom: 10, fontFamily: 'Heebo, Arial, sans-serif', letterSpacing: '-2px' }}>{s[0]}</p>
                    <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.28)', fontFamily: 'Heebo, Arial, sans-serif' }}>{s[1]}</p>
                  </div>
                )
              })}
            </div>
            <div style={{ borderTop: '1px solid #1a1a1a', paddingTop: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
              <img src="/logo-light.png" alt="מאז ועד היום" style={{ height: 28, opacity: 0.45 }} onError={function(e) { e.target.style.display = 'none' }} />
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {['לא חשבתי שאגיע לכאן', 'זה באמת פה?', 'מי בכלל נוסע לשם?'].map(function(t) {
                  return <span key={t} style={{ display: 'inline-block', background: 'rgba(126,72,33,0.12)', color: 'rgba(255,255,255,0.3)', border: '1px solid rgba(126,72,33,0.2)', padding: '4px 12px 4px 22px', borderRadius: 3, fontSize: 11, position: 'relative', fontFamily: 'Heebo, Arial, sans-serif' }}>
                    <span style={{ position: 'absolute', left: 7, fontSize: 10 }}>←</span>{t}
                  </span>
                })}
              </div>
              <p style={{ color: '#222', fontSize: 12, fontFamily: 'Heebo, Arial, sans-serif' }}>© 2025 מאז ועד היום</p>
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
    const res = await fetch(`https://api.airtable.com/v0/${baseId}/tbltsGvfPLMAmJ764?pageSize=100`, { headers: { Authorization: `Bearer ${token}` } })
    const data = await res.json()
    const tours = (data.records || []).map(function(r) { return Object.assign({ id: r.id }, r.fields) })
    const guides = [...new Set(tours.map(function(t) { return t.Guide_Name }).filter(Boolean))].sort()
    return { props: { tours, guides } }
  } catch(e) { return { props: { tours: [], guides: [] } } }
}
