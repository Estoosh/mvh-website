import { useState, useEffect, useRef } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useUser } from '@clerk/nextjs'

const BROWN = '#7E4821'
const BROWN_DARK = '#5A2F13'
const CREAM = '#F7F1EA'
const CARD = '#FBF7F1'
const NEAR_BLACK = '#111111'
const GRAY = '#6B6B6B'

const PERIODS = ["תקופת המקרא / ימי האבות","בית ראשון (ממלכת ישראל ויהודה)","בית שני","התקופה הרומית-ביזנטית","התקופה המוסלמית הקדומה","תקופת הצלבנים","התקופה הממלוכית","התקופה העות'מאנית","המנדט הבריטי","מדינת ישראל (1948 ואילך)"]
const REGIONS = ["צפון","גליל עליון","גליל מערבי","גולן","חיפה","השרון","מרכז","תל אביב","ירושלים","שפלה",'יו"ש',"צפון הנגב","באר שבע","נגב","ערבה","דרום","אילת","ים המלח","עין גדי","מצדה"]
const SIGN_TEXTS = ["מי בנה את המקום הזה?","יש בעיר הזאת הכל","סיפורים מהבראשית","עוד 3 דקות מהבית","פנייה אחת מהשגרה","מה יש לעשות שם?"]

const SOCIAL_LINKS = [
  ['♪', 'TikTok'],
  ['f', 'Facebook'],
  ['▶', 'YouTube'],
  ['◉', 'Spotify'],
  ['▣', 'Apple Podcasts']
]

function Sign({ text, size = 'md', rotate = 0, className }) {
  const s = {
    sm: { fs: 12, py: 6, px: 16, pl: 28, arr: 10, r: 4 },
    md: { fs: 15, py: 10, px: 22, pl: 36, arr: 13, r: 5 },
    lg: { fs: 20, py: 14, px: 30, pl: 48, arr: 16, r: 5 },
  }[size] || { fs: 15, py: 10, px: 22, pl: 36, arr: 13, r: 5 }

  return (
    <span className={className} style={{
      display: 'inline-flex', alignItems: 'center', background: BROWN, color: '#fff',
      paddingTop: s.py, paddingBottom: s.py, paddingRight: s.px, paddingLeft: s.pl,
      borderRadius: s.r, fontWeight: 800, fontSize: s.fs, fontFamily: 'Heebo, Arial, sans-serif',
      position: 'relative', letterSpacing: '0.01em', boxShadow: '0 10px 26px rgba(0,0,0,0.25)',
      whiteSpace: 'nowrap', transform: rotate ? 'rotate(' + rotate + 'deg)' : undefined,
    }}>
      <span style={{ position: 'absolute', left: s.arr, fontSize: s.fs * 0.85, opacity: 0.9 }}>←</span>
      {text}
    </span>
  )
}

function CTAButton({ href, children, variant = 'solid', icon }) {
  const solid = variant === 'solid'
  return (
    <a href={href} style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 10,
      minWidth: 178, padding: '14px 26px', borderRadius: 7,
      background: solid ? BROWN : 'rgba(0,0,0,0.22)', color: '#fff',
      border: solid ? '1px solid ' + BROWN : '1px solid rgba(255,255,255,0.34)',
      textDecoration: 'none', fontSize: 16, fontWeight: 800, boxShadow: solid ? '0 12px 28px rgba(126,72,33,0.3)' : 'none',
      fontFamily: 'Heebo, Arial, sans-serif'
    }}>
      {icon && <span>{icon}</span>}{children}
    </a>
  )
}

function TourCard({ tour }) {
  const [hov, setHov] = useState(false)
  const images = tour.Tour_Images ? tour.Tour_Images.split('|').filter(Boolean) : []
  const thumb = images[0] || null
  const sign = SIGN_TEXTS[Math.abs((tour.Tour_Title || 'x').charCodeAt(0)) % SIGN_TEXTS.length]

  return (
    <a href={'/tours/' + tour.id} className="tour-card" onMouseEnter={function() { setHov(true) }} onMouseLeave={function() { setHov(false) }}>
      <div className="tour-card-inner" style={{ transform: hov ? 'translateY(-5px)' : 'none', boxShadow: hov ? '0 22px 48px rgba(0,0,0,0.18)' : '0 10px 28px rgba(0,0,0,0.08)' }}>
        {thumb
          ? <img src={thumb} alt={tour.Tour_Title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transform: hov ? 'scale(1.05)' : 'scale(1)', transition: 'transform .45s ease' }} />
          : <div style={{ width: '100%', height: '100%', background: 'linear-gradient(150deg,#8A4B20,#1a0d06)' }} />
        }
        <div className="tour-card-fade" />
        <div className="tour-sign"><Sign text={sign} size="sm" /></div>
        <div className="tour-content">
          <p className="tour-title">{tour.Tour_Title || 'סיור חדש בדרך'}</p>
          <p className="tour-meta">{tour.Guide_Name || 'מדריך מקומי'} · {tour.Cities_Tags || 'ישראל'}</p>
          <span className="mini-cta">מה יש לעשות שם? ←</span>
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
    <div className="section-wrap">
      <div className="section-head">
        <a href="/" className="all-link">כל הסיורים ←</a>
        <h2>{title}</h2>
        <div className="nav-arrows">
          <button onClick={function() { ref.current && ref.current.scrollBy({ left: -340, behavior: 'smooth' }) }} className="round-btn" style={{ opacity: canR ? 1 : .35 }}>›</button>
          <button onClick={function() { ref.current && ref.current.scrollBy({ left: 340, behavior: 'smooth' }) }} className="round-btn" style={{ opacity: canL ? 1 : .35 }}>‹</button>
        </div>
      </div>
      <div ref={ref} className="tour-row">
        {tours.map(function(t) { return <TourCard key={t.id} tour={t} /> })}
      </div>
    </div>
  )
}

function JourneyCard({ icon, title, text, cta, href }) {
  return (
    <a href={href} className="journey-card">
      <div className="journey-icon">{icon}</div>
      <div>
        <h3>{title}</h3>
        <p>{text}</p>
        <span>{cta} ←</span>
      </div>
    </a>
  )
}

function VideoCard({ title, img, duration }) {
  return (
    <a href="https://mvh.co.il" target="_blank" rel="noopener noreferrer" className="video-card">
      <div className="video-thumb">
        <img src={img} alt="" />
        <div className="video-platform">♪</div>
        <div className="play">▶</div>
        <div className="duration">{duration}</div>
      </div>
      <h3>{title}</h3>
      <span>לצפייה עכשיו ←</span>
    </a>
  )
}

function StatCard({ icon, num, label }) {
  return (
    <div className="stat-card">
      <div>{icon}</div>
      <strong>{num}</strong>
      <span>{label}</span>
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
  const shownTours = recent.length ? recent : active.slice(0, 10)
  const myRegion = userRegions.length > 0 ? active.filter(function(t) { return userRegions.includes(t.Cities_Tags) }).slice(0, 10) : []
  const videoImages = shownTours.slice(0, 4).map(function(t) {
    const imgs = t.Tour_Images ? t.Tour_Images.split('|').filter(Boolean) : []
    return imgs[0] || '/podcast-hero.png'
  })

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
    <div dir="rtl" style={{ fontFamily: 'Heebo, Arial, sans-serif', background: CREAM, color: NEAR_BLACK, overflowX: 'hidden' }}>
      <Head>
        <title>מאז ועד היום | אחלה תירוץ לצאת מהבית</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="מגלים סיפורים דרך סיורים, סרטונים קצרים ופודקאסטים." />
        <style>{`
          *{box-sizing:border-box;margin:0;padding:0;}
          body{overflow-x:hidden;background:${CREAM};}
          ::-webkit-scrollbar{display:none;}
          .top-nav{height:66px;background:#090909;color:#fff;position:sticky;top:0;z-index:200;border-bottom:1px solid rgba(255,255,255,.08);}
          .nav-inner{max-width:1180px;margin:0 auto;height:66px;padding:0 26px;display:flex;align-items:center;justify-content:space-between;}
          .nav-logo{height:42px;object-fit:contain;display:block;filter:brightness(0) invert(1);}
          .nav-links{display:flex;gap:28px;align-items:center;}
          .nav-links a{color:rgba(255,255,255,.82);text-decoration:none;font-weight:700;font-size:14px;}
          .hamb{font-size:28px;color:#fff;line-height:1;}
          .hero-section{position:relative;min-height:520px;height:calc(100vh - 66px);max-height:680px;background:#080808;overflow:hidden;}
          .hero-bg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center center;display:block;}
          .hero-shade{position:absolute;inset:0;background:linear-gradient(to left,rgba(0,0,0,.08) 0%,rgba(0,0,0,.10) 25%,rgba(0,0,0,.62) 44%,rgba(0,0,0,.58) 59%,rgba(0,0,0,.12) 100%);}
          .hero-bottom{position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,.34) 0%,transparent 35%);}
          .hero-copy{position:absolute;top:50%;right:43.2vw;transform:translateY(-50%);width:min(30vw,500px);min-width:390px;text-align:center;z-index:3;}
          .hero-copy h1{font-size:clamp(38px,4.55vw,65px);font-weight:900;color:#fff;line-height:1.02;letter-spacing:-1.8px;margin:24px 0 22px;text-shadow:0 5px 22px rgba(0,0,0,.6);}
          .hero-copy p{max-width:420px;margin:0 auto 28px;color:rgba(255,255,255,.86);font-size:18px;line-height:1.75;text-shadow:0 2px 12px rgba(0,0,0,.55);}
          .hero-actions{display:flex;gap:14px;justify-content:center;align-items:center;flex-wrap:wrap;}
          .page-section{background:${CREAM};padding:42px 24px;}
          .section-wrap{max-width:1120px;margin:0 auto;}
          .section-head{display:grid;grid-template-columns:1fr auto 1fr;align-items:center;margin-bottom:24px;}
          .section-head h2{text-align:center;font-size:clamp(25px,3vw,34px);font-weight:900;color:${NEAR_BLACK};letter-spacing:-.7px;}
          .all-link{justify-self:start;color:${BROWN};text-decoration:none;font-weight:700;font-size:14px;}
          .nav-arrows{justify-self:end;display:flex;gap:10px;}
          .round-btn{width:42px;height:42px;border-radius:50%;border:1px solid rgba(126,72,33,.24);background:#fff;color:${BROWN};font-size:26px;line-height:1;cursor:pointer;display:flex;align-items:center;justify-content:center;}
          .journey-title{font-size:clamp(26px,3vw,36px);font-weight:900;text-align:center;margin-bottom:24px;letter-spacing:-.5px;}
          .journey-grid{max-width:1120px;margin:0 auto;display:grid;grid-template-columns:repeat(3,1fr);gap:24px;}
          .journey-card{background:rgba(255,255,255,.72);border:1px solid rgba(126,72,33,.16);border-radius:18px;padding:28px 26px;display:flex;align-items:center;gap:22px;color:${NEAR_BLACK};text-decoration:none;box-shadow:0 10px 28px rgba(126,72,33,.05);}
          .journey-icon{width:78px;height:78px;display:flex;align-items:center;justify-content:center;border-radius:50%;background:linear-gradient(135deg,#9A5A2A,#6A3516);color:#fff;font-size:34px;flex-shrink:0;}
          .journey-card h3{font-size:24px;font-weight:900;margin-bottom:8px;}
          .journey-card p{font-size:15px;line-height:1.65;color:#555;margin-bottom:10px;}
          .journey-card span{font-size:14px;color:${BROWN};font-weight:800;}
          .tour-row{display:flex;gap:22px;overflow-x:auto;padding:4px 0 18px;scrollbar-width:none;}
          .tour-card{text-decoration:none;display:block;flex-shrink:0;width:344px;color:#fff;}
          .tour-card-inner{height:270px;border-radius:16px;overflow:hidden;position:relative;background:#1a0d06;transition:transform .25s ease, box-shadow .25s ease;}
          .tour-card-fade{position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,.82) 0%,rgba(0,0,0,.34) 48%,rgba(0,0,0,.02) 100%);}
          .tour-sign{position:absolute;top:16px;right:16px;}
          .tour-content{position:absolute;right:22px;left:22px;bottom:18px;text-align:right;}
          .tour-title{font-size:22px;font-weight:900;line-height:1.2;margin-bottom:6px;text-shadow:0 3px 12px rgba(0,0,0,.5);}
          .tour-meta{font-size:13px;color:rgba(255,255,255,.72);margin-bottom:14px;}
          .mini-cta{display:inline-flex;background:${BROWN};color:#fff;padding:8px 14px;border-radius:5px;font-size:13px;font-weight:800;}
          .videos-grid{max-width:1120px;margin:0 auto;display:grid;grid-template-columns:repeat(4,1fr);gap:22px;}
          .video-card{text-decoration:none;color:${NEAR_BLACK};}
          .video-thumb{position:relative;border-radius:12px;overflow:hidden;height:150px;background:#1a0d06;box-shadow:0 10px 26px rgba(0,0,0,.08);}
          .video-thumb img{width:100%;height:100%;object-fit:cover;display:block;}
          .video-platform{position:absolute;top:10px;right:10px;width:30px;height:30px;border-radius:50%;background:#050505;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:900;}
          .play{position:absolute;inset:0;margin:auto;width:48px;height:48px;border-radius:50%;background:rgba(0,0,0,.55);color:#fff;display:flex;align-items:center;justify-content:center;font-size:18px;}
          .duration{position:absolute;left:8px;bottom:8px;background:rgba(0,0,0,.72);color:#fff;border-radius:4px;padding:3px 6px;font-size:11px;font-weight:700;}
          .video-card h3{font-size:16px;font-weight:900;margin:10px 0 4px;text-align:center;}
          .video-card span{display:block;text-align:center;color:${BROWN};font-size:13px;font-weight:800;}
          .stats-grid{max-width:1120px;margin:0 auto;display:grid;grid-template-columns:repeat(4,1fr);gap:22px;}
          .stat-card{background:rgba(255,255,255,.72);border-radius:14px;padding:18px;text-align:center;border:1px solid rgba(126,72,33,.12);}
          .stat-card div{font-size:32px;color:${BROWN};margin-bottom:8px;}
          .stat-card strong{display:block;font-size:30px;color:${BROWN};font-weight:900;line-height:1;}
          .stat-card span{display:block;margin-top:8px;font-size:13px;color:#4A4139;line-height:1.35;font-weight:700;}
          .guide-banner{max-width:1120px;margin:10px auto 0;border-radius:18px;overflow:hidden;background:#0d0b08;display:grid;grid-template-columns:1fr 1fr;min-height:210px;color:#fff;box-shadow:0 18px 46px rgba(0,0,0,.16);}
          .guide-photo{position:relative;min-height:210px;background:#1a0d06;}
          .guide-photo img{width:100%;height:100%;object-fit:cover;display:block;opacity:.86;}
          .guide-copy{padding:34px 40px;display:flex;flex-direction:column;justify-content:center;position:relative;}
          .guide-copy h2{font-size:clamp(28px,3vw,42px);font-weight:900;margin-bottom:12px;}
          .guide-copy p{font-size:17px;color:rgba(255,255,255,.78);line-height:1.7;max-width:420px;margin-bottom:20px;}
          .route-doodle{position:absolute;left:36px;top:38px;color:${BROWN};font-size:80px;opacity:.85;}
          .footer{background:#090909;color:#fff;padding:34px 24px 28px;}
          .footer-inner{max-width:1120px;margin:0 auto;display:grid;grid-template-columns:1fr 2fr 1fr;gap:28px;align-items:center;}
          .footer-logo img{height:42px;filter:brightness(0) invert(1);display:block;margin-bottom:8px;}
          .footer-logo p{font-size:13px;color:rgba(255,255,255,.7);line-height:1.5;}
          .footer-social{display:flex;gap:20px;align-items:center;justify-content:center;flex-wrap:wrap;}
          .footer-social a{color:#fff;text-decoration:none;display:flex;align-items:center;gap:7px;font-size:13px;font-weight:700;}
          .footer-social span{width:30px;height:30px;border-radius:50%;background:${BROWN};display:flex;align-items:center;justify-content:center;color:#fff;font-weight:900;}
          .footer-links{display:flex;flex-direction:column;gap:8px;text-align:left;}
          .footer-links a{color:rgba(255,255,255,.75);text-decoration:none;font-size:13px;}
          .footer-copy{text-align:center;margin-top:22px;color:rgba(255,255,255,.55);font-size:12px;}
          .search-box{max-width:1100px;margin:0 auto 8px;display:flex;gap:8px;background:#fff;border-radius:14px;padding:8px;box-shadow:0 12px 40px rgba(17,17,17,0.06);border:1px solid #F0ECE7;}
          @media(max-width:980px){
            .hero-section{height:auto;min-height:680px;}
            .hero-bg{object-position:38% center;}
            .hero-shade{background:linear-gradient(to top,rgba(0,0,0,.75) 0%,rgba(0,0,0,.15) 100%);}
            .hero-copy{right:24px;left:24px;top:auto;bottom:46px;transform:none;width:auto;min-width:0;}
            .hero-copy h1{font-size:clamp(38px,10vw,58px);}
            .journey-grid,.stats-grid{grid-template-columns:1fr 1fr;}
            .videos-grid{grid-template-columns:1fr 1fr;}
            .guide-banner{grid-template-columns:1fr;}
            .footer-inner{grid-template-columns:1fr;text-align:center;}
            .footer-logo img{margin:0 auto 8px;}
            .footer-links{text-align:center;}
          }
          @media(max-width:700px){
            .top-nav{height:58px;}
            .nav-inner{height:58px;padding:0 16px;}
            .nav-links a:not(:first-child){display:none;}
            .nav-logo{height:34px;}
            .hero-section{min-height:620px;}
            .hero-bg{object-position:32% center;}
            .hero-copy p{font-size:15px;line-height:1.6;max-width:320px;}
            .hero-actions a{min-width:150px;font-size:14px;padding:12px 18px;}
            .journey-grid,.stats-grid,.videos-grid{grid-template-columns:1fr;}
            .journey-card{padding:22px;}
            .tour-card{width:300px;}
            .tour-card-inner{height:250px;}
            .section-head{grid-template-columns:1fr;gap:12px;text-align:center;}
            .all-link,.nav-arrows{justify-self:center;}
            .search-box{flex-direction:column;}
          }
        `}</style>
      </Head>

      <nav className="top-nav">
        <div className="nav-inner">
          <div className="hamb">☰</div>
          <Link href="/"><img src="/New_Logo.png" alt="מאז ועד היום" className="nav-logo" /></Link>
          <div className="nav-links">
            <a href="#tours">סיורים</a>
            <a href="#podcast">פודקאסט</a>
            <a href="#guides">מדריכים</a>
            {user && (isGuide
              ? <Link href="/dashboard">דשבורד</Link>
              : <Link href="/discount">ההנחה שלי</Link>
            )}
            <Link href={isGuide ? '/add-tour' : '/join'} style={{ textDecoration: 'none' }}>
              <Sign text={isGuide ? 'הוסף סיור' : 'אני מדריך'} size="sm" />
            </Link>
          </div>
        </div>
      </nav>

      <section className="hero-section">
        <img src="/hero-sofa.png" alt="" className="hero-bg" onError={function(e) { e.target.src = '/sofa-hero.png' }} />
        <div className="hero-shade" />
        <div className="hero-bottom" />
        <div className="hero-copy">
          <div style={{ display: 'inline-block', transform: 'rotate(-2deg)' }}><Sign text="אחלה תירוץ לצאת מהבית" size="lg" /></div>
          <h1>כולם צריכים<br />תירוץ טוב<br />לצאת מהבית.</h1>
          <p>מגלים סיפורים דרך סיורים, סרטונים קצרים ופודקאסטים.</p>
          <div className="hero-actions">
            <CTAButton href="#tours" icon="📍">גלו סיורים</CTAButton>
            <CTAButton href="#podcast" variant="ghost" icon="🎧">הפרק החדש</CTAButton>
            <CTAButton href="#guides" variant="ghost" icon="👤">אני מדריך</CTAButton>
          </div>
        </div>
      </section>

      <section className="page-section" style={{ paddingTop: 32 }}>
        <h2 className="journey-title">איך בא לכם לצאת מהבית היום?</h2>
        <div className="journey-grid">
          <JourneyCard icon="🎙️" title="להאזין לסיפור" text="פודקאסטים קצרים על מקומות ואנשים." cta="להאזין עכשיו" href="#podcast" />
          <JourneyCard icon="📍" title="למצוא סיור" text="מדריכים וסיורים מיוחדים בכל רחבי הארץ." cta="לגלות סיורים" href="#tours" />
          <JourneyCard icon="👥" title="אני מדריך" text="הפכו את הידע שלכם לקהילה וללקוחות." cta="לפרטים נוספים" href="#guides" />
        </div>
      </section>

      {searchResults !== null && (
        <section id="sr" className="page-section">
          <div className="section-wrap">
            <div className="section-head">
              <span />
              <h2>תוצאות ({searchResults.length})</h2>
              <button onClick={function() { setSearchResults(null) }} style={{ justifySelf: 'end', background: 'none', border: 'none', fontSize: 13, color: GRAY, cursor: 'pointer', textDecoration: 'underline', fontFamily: 'Heebo, Arial, sans-serif' }}>נקה חיפוש</button>
            </div>
            {searchResults.length === 0
              ? <p style={{ color: GRAY, fontSize: 16, textAlign: 'center' }}>לא נמצאו סיורים. נסו חיפוש אחר.</p>
              : <div className="tour-row">{searchResults.map(function(t) { return <TourCard key={t.id} tour={t} /> })}</div>
            }
          </div>
        </section>
      )}

      {searchResults === null && myRegion.length > 0 && (
        <section id="tours" className="page-section"><Carousel tours={myRegion} title="סיורים באזור שלך" /></section>
      )}

      {searchResults === null && (
        <section id={myRegion.length === 0 ? 'tours' : 'recent'} className="page-section" style={{ paddingTop: 18 }}>
          <Carousel tours={shownTours} title="סיורים מומלצים" />
        </section>
      )}

      {searchResults === null && (
        <section className="page-section" id="social-videos" style={{ paddingTop: 18 }}>
          <div className="section-wrap">
            <h2 className="journey-title" style={{ marginBottom: 24 }}>מה ראיתם אצלנו ברשת?</h2>
            <div className="videos-grid">
              <VideoCard title="איך עשו את אשדוד?" img={videoImages[0] || '/podcast-hero.png'} duration="01:12" />
              <VideoCard title="איך עשו את טבריה?" img={videoImages[1] || '/podcast-hero.png'} duration="01:05" />
              <VideoCard title="למה עכו נראית ככה?" img={videoImages[2] || '/podcast-hero.png'} duration="01:18" />
              <VideoCard title="מי בנה את יפו?" img={videoImages[3] || '/podcast-hero.png'} duration="00:59" />
            </div>
          </div>
        </section>
      )}

      {searchResults === null && (
        <section className="page-section" style={{ paddingTop: 18 }}>
          <h2 className="journey-title">למה אנשים אוהבים את MVH?</h2>
          <div className="stats-grid">
            <StatCard icon="⭐" num="4.9" label="דירוג ממוצע מחוויות קודמות" />
            <StatCard icon="🎧" num="30K+" label="האזנות לפודקאסט והולך וגדל" />
            <StatCard icon="👥" num="100+" label="מדריכים מצטרפים לקהילה שלנו" />
            <StatCard icon="📍" num="600+" label="סיורים בכל הארץ ועוד רבים בדרך" />
          </div>
        </section>
      )}

      {searchResults === null && (
        <section className="page-section" id="guides" style={{ paddingTop: 18 }}>
          <div className="guide-banner">
            <div className="guide-copy">
              <div className="route-doodle">⌁</div>
              <h2>מדריכי טיולים?</h2>
              <p>הסיפורים שלכם כבר קיימים. אנחנו עוזרים לאנשים למצוא אותם.</p>
              <Link href="/join" style={{ textDecoration: 'none', alignSelf: 'flex-start' }}><Sign text="הצטרפו כמדריכים" size="md" /></Link>
            </div>
            <div className="guide-photo">
              <img src="/guide-hero.png" alt="" onError={function(e) { e.target.style.display = 'none' }} />
            </div>
          </div>
        </section>
      )}

      <section className="page-section" style={{ paddingTop: 18 }}>
        <div className="search-box">
          <input type="text" value={search} onChange={function(e) { setSearch(e.target.value) }} onKeyDown={function(e) { if (e.key === 'Enter') handleSearch() }} placeholder="חפשו מקום, מדריך, תקופה..." style={Object.assign({}, inp, { flex: 2, border: 'none', padding: '12px 16px' })} />
          <select value={region} onChange={function(e) { setRegion(e.target.value) }} style={Object.assign({}, inp, { flex: 1, border: 'none' })}>
            <option value="">כל האזורים</option>
            {REGIONS.map(function(r) { return <option key={r} value={r}>{r}</option> })}
          </select>
          <select value={period} onChange={function(e) { setPeriod(e.target.value) }} style={Object.assign({}, inp, { flex: 1.4, border: 'none' })}>
            <option value="">כל התקופות</option>
            {PERIODS.map(function(p) { return <option key={p} value={p}>{p}</option> })}
          </select>
          <button onClick={handleSearch} style={{ background: BROWN, color: '#fff', border: 'none', borderRadius: 10, padding: '12px 28px', fontSize: 14, fontWeight: 800, cursor: 'pointer', flexShrink: 0, fontFamily: 'Heebo, Arial, sans-serif' }}>חפשו</button>
        </div>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', gap: 12, alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative' }}>
            <input type="text" value={guideInput} onChange={function(e) { handleGuideInput(e.target.value) }} placeholder="שם מורה דרך..." style={{ padding: '7px 12px', borderRadius: 6, border: '1px solid #e5e5e5', fontSize: 13, fontFamily: 'Heebo, Arial, sans-serif', outline: 'none' }} />
            {guideMatches.length > 0 && (
              <div style={{ position: 'absolute', top: '100%', right: 0, background: '#fff', border: '1px solid #ddd', borderRadius: 8, zIndex: 10, boxShadow: '0 4px 16px rgba(0,0,0,0.1)', minWidth: 180 }}>
                {guideMatches.map(function(g) { return <div key={g} onClick={function() { setSelectedGuide(g); setGuideInput(g); setGuideMatches([]) }} style={{ padding: '10px 14px', cursor: 'pointer', fontSize: 13, fontFamily: 'Heebo, Arial, sans-serif' }}>{g}</div> })}
              </div>
            )}
          </div>
          <button onClick={function() { setNotFound(!notFound) }} style={{ background: 'none', border: 'none', color: BROWN, fontSize: 13, cursor: 'pointer', textDecoration: 'underline', fontFamily: 'Heebo, Arial, sans-serif' }}>
            לא מצאתי, תמצאו לי מדריך שיקח אותי ל...
          </button>
        </div>
        {notFound && !notFoundSent && (
          <form onSubmit={handleNotFound} style={{ maxWidth: 720, margin: '12px auto 0', display: 'flex', gap: 8 }}>
            <input type="text" value={notFoundText} onChange={function(e) { if (e.target.value.length <= 120) setNotFoundText(e.target.value) }} placeholder="לאן תרצו ללכת?" style={Object.assign({}, inp, { flex: 1 })} />
            <button type="submit" style={{ background: BROWN, color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', fontSize: 13, fontWeight: 800, cursor: 'pointer', fontFamily: 'Heebo, Arial, sans-serif' }}>שלח</button>
          </form>
        )}
        {notFoundSent && <p style={{ marginTop: 8, fontSize: 13, color: '#22c55e', textAlign: 'center' }}>✓ נחזור אליכם בהקדם!</p>}
      </section>

      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-logo">
            <img src="/New_Logo.png" alt="מאז ועד היום" />
            <p>סיפורים שגורמים<br />לאנשים לצאת מהבית.</p>
          </div>
          <div className="footer-social">
            {SOCIAL_LINKS.map(function(item) {
              return <a key={item[1]} href="https://mvh.co.il" target="_blank" rel="noopener noreferrer"><span>{item[0]}</span>{item[1]}</a>
            })}
          </div>
          <div className="footer-links">
            <a href="https://mvh.co.il">אודות</a>
            <a href="https://mvh.co.il">צור קשר</a>
            <a href="https://mvh.co.il">מדיניות פרטיות</a>
            <a href="https://mvh.co.il">תנאי שימוש</a>
          </div>
        </div>
        <p className="footer-copy">© כל הזכויות שמורות ל-MVH</p>
      </footer>
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
