import { useState, useEffect, useRef } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useUser } from '@clerk/nextjs'

const BROWN = '#7E4821'
const CREAM = '#F7F1EA'
const NEAR_BLACK = '#111111'
const GRAY = '#6B6B6B'

const PERIODS = ["תקופת המקרא / ימי האבות","בית ראשון (ממלכת ישראל ויהודה)","בית שני","התקופה הרומית-ביזנטית","התקופה המוסלמית הקדומה","תקופת הצלבנים","התקופה הממלוכית","התקופה העות'מאנית","המנדט הבריטי","מדינת ישראל (1948 ואילך)"]
const REGIONS = ["צפון","גליל עליון","גליל מערבי","גולן","חיפה","השרון","מרכז","תל אביב","ירושלים","שפלה",'יו"ש',"צפון הנגב","באר שבע","נגב","ערבה","דרום","אילת","ים המלח","עין גדי","מצדה"]

const STATIC_TOURS = [
  { id: 'apolonia', title: 'אפולוניה', sub: 'המצודה הצלבנית שהפכה למתחם יוקרה', img: '/Tours-Apolonia.png', city: 'הרצליה', price: 108, duration: 3 },
  { id: 'safed', title: 'צפת', sub: 'הסיפור של צפת', img: '/Tours-Safed.png', city: 'צפת', price: 108, duration: 5 },
  { id: 'david', title: 'עיר דוד', sub: 'מתחת לסילואן', img: '/Tours-DavidCity.png', city: 'ירושלים', price: 108, duration: 3 },
  { id: 'church', title: 'כנסיות ירושלים', sub: 'סיור ייחודי בעיר העתיקה', img: '/Tours-JLM-Church.png', city: 'ירושלים', price: 108, duration: 4 },
]

const GUIDES = [
  { name: 'דניאל כהן', region: 'צפון והגליל', img: '/Hero-Guide-M.png', desc: 'מדריך בן 8 שנות ניסיון. מתמחה בסיורי לילה וגליל, מספר ומחבר סיפורים שאוהבים ומחברים אנשים למקומות.', tags: ['אנשים', 'טבע', 'גבו'], tours: 12, episodes: 9 },
  { name: 'מיכל לוי', region: 'ירושלים והרי יהודה', img: '/Hero-Guide-F.png', desc: 'אני מחברת בין אנשים, היסטוריה וסיפורים. מאז ועד היום היא בשבילי הדרך לספר את הסיפורים שמחברים כל מקום.', tags: ['סיפורים', 'חברותא', 'היסטוריה'], tours: 12, episodes: 2 },
]

function Sign({ text, size = 'md', rotate = 0 }) {
  const s = {
    sm: { fs: 12, py: 6, px: 16, pl: 28, arr: 10, r: 4 },
    md: { fs: 15, py: 10, px: 22, pl: 36, arr: 13, r: 5 },
    lg: { fs: 20, py: 14, px: 30, pl: 48, arr: 16, r: 5 },
  }[size] || { fs: 15, py: 10, px: 22, pl: 36, arr: 13, r: 5 }
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', background: BROWN, color: '#fff', paddingTop: s.py, paddingBottom: s.py, paddingRight: s.px, paddingLeft: s.pl, borderRadius: s.r, fontWeight: 800, fontSize: s.fs, fontFamily: 'Heebo, Arial, sans-serif', position: 'relative', letterSpacing: '0.01em', boxShadow: '0 10px 26px rgba(0,0,0,0.22)', whiteSpace: 'nowrap', transform: rotate ? 'rotate(' + rotate + 'deg)' : undefined }}>
      <span style={{ position: 'absolute', left: s.arr, fontSize: s.fs * 0.85, opacity: 0.9 }}>←</span>
      {text}
    </span>
  )
}

function SocialIcon({ name }) {
  if (name === 'TikTok') return <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.26 8.26 0 004.84 1.56V6.82a4.85 4.85 0 01-1.07-.13z"/></svg>
  if (name === 'Facebook') return <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg>
  if (name === 'YouTube') return <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M22.54 6.42a2.78 2.78 0 00-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 00-1.95 1.96A29 29 0 001 12a29 29 0 00.46 5.58A2.78 2.78 0 003.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 001.95-1.95A29 29 0 0023 12a29 29 0 00-.46-5.58zM9.75 15.02V8.98L15.5 12l-5.75 3.02z"/></svg>
  if (name === 'Spotify') return <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 14.36a.62.62 0 01-.86.21c-2.35-1.43-5.3-1.76-8.78-.96a.62.62 0 01-.28-1.21c3.81-.87 7.09-.5 9.71 1.1a.63.63 0 01.21.86zm1.24-2.76a.78.78 0 01-1.07.26C14.06 12.12 10.37 11.7 7.5 12.54a.78.78 0 01-.43-1.5c3.27-.94 7.33-.48 10.13 1.19.37.23.48.7.24 1.07zm.1-2.86c-3.29-1.95-8.72-2.13-11.86-1.18a.94.94 0 01-.52-1.81c3.61-1.1 9.61-.89 13.4 1.36a.94.94 0 01-.94 1.63z"/></svg>
  if (name === 'Apple Podcasts') return <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 100 20A10 10 0 0012 2zm0 4a6 6 0 110 12A6 6 0 0112 6zm0 2a4 4 0 100 8 4 4 0 000-8zm0 2a2 2 0 110 4 2 2 0 010-4zm-1 6h2v4h-2z"/></svg>
  return null
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
  const [email, setEmail] = useState('')

  useEffect(function() {
    if (!isLoaded || !user) return
    fetch('/api/get-guide?clerk_id=' + user.id).then(r => r.json()).then(d => { if (d.found) setIsGuide(true) })
    fetch('/api/get-signup?clerk_id=' + user.id).then(r => r.json()).then(d => {
      if (d.found && d.signup && d.signup.Regions_Interest) setUserRegions(d.signup.Regions_Interest.split(', ').filter(Boolean))
    })
  }, [isLoaded, user])

  const active = tours.filter(t => t.Tour_Status === 'paid')

  const handleSearch = function() {
    var results = active.filter(t =>
      (!search || (t.Tour_Title||'').includes(search) || (t.Tour_Story||'').includes(search))
      && (!region || t.Cities_Tags === region)
      && (!period || (t.Historical_Period||[]).includes(period))
      && (!selectedGuide || t.Guide_Name === selectedGuide)
    )
    setSearchResults(results)
    setTimeout(() => { document.getElementById('sr')?.scrollIntoView({ behavior: 'smooth' }) }, 80)
  }

  const handleGuideInput = v => {
    setGuideInput(v); setSelectedGuide('')
    setGuideMatches(v.length < 2 ? [] : guides.filter(g => g.includes(v)).slice(0,5))
  }

  const handleNotFound = async e => {
    e.preventDefault()
    await fetch('/api/send-not-found', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ message: notFoundText }) })
    setNotFoundSent(true)
  }

  const inp = { padding: '11px 16px', borderRadius: 8, border: '1px solid #e5e5e5', fontSize: 14, fontFamily: 'Heebo, Arial, sans-serif', outline: 'none', background: '#fff', width: '100%', boxSizing: 'border-box' }

  return (
    <div dir="rtl" style={{ fontFamily: 'Heebo, Arial, sans-serif', background: CREAM, color: NEAR_BLACK, overflowX: 'hidden' }}>
      <Head>
        <title>מאז ועד היום | אחלה תירוץ לצאת מהבית</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="מגלים סיפורים דרך סיורים, סרטונים קצרים ופודקאסטים." />
        <link href="https://fonts.googleapis.com/css2?family=Heebo:wght@300;400;700;900&display=swap" rel="stylesheet" />
        <style>{`
          *{box-sizing:border-box;margin:0;padding:0;}
          body{overflow-x:hidden;background:${CREAM};}
          ::-webkit-scrollbar{display:none;}
          .nav{height:72px;background:#fff;border-bottom:1px solid #efe9e1;position:sticky;top:0;z-index:200;}
          .nav-inner{max-width:1180px;margin:0 auto;height:72px;padding:0 28px;display:flex;align-items:center;justify-content:space-between;}
          .nav-logo{height:56px;width:auto;object-fit:contain;display:block;}
          .nav-links{display:flex;gap:24px;align-items:center;}
          .nav-links a{color:${NEAR_BLACK};text-decoration:none;font-weight:700;font-size:14px;}
          .nav-sep{color:#ddd;font-size:18px;}
          .hero{position:relative;height:calc(100vh - 72px);min-height:520px;max-height:700px;background:#080808;overflow:hidden;}
          .hero img.bg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center;}
          .hero-shade{position:absolute;inset:0;background:linear-gradient(to left,rgba(0,0,0,0.04) 0%,rgba(0,0,0,0.55) 45%,rgba(0,0,0,0.6) 65%,rgba(0,0,0,0.1) 100%);}
          .hero-bottom{position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,0.32) 0%,transparent 38%);}
          .hero-copy{position:absolute;top:50%;right:44vw;transform:translateY(-50%);width:min(28vw,480px);min-width:360px;text-align:center;z-index:3;}
          .hero-copy h1{font-size:clamp(36px,4.2vw,62px);font-weight:900;color:#fff;line-height:1.03;letter-spacing:-1.5px;margin:20px 0 18px;text-shadow:0 4px 18px rgba(0,0,0,0.55);}
          .hero-timeline{display:flex;align-items:center;justify-content:center;gap:0;margin-bottom:18px;}
          .hero-tl-dot{width:10px;height:10px;border-radius:50%;background:${BROWN};}
          .hero-tl-line{width:48px;height:2px;background:${BROWN};}
          .hero-bullets{list-style:none;margin:0 0 26px;padding:0;text-align:right;}
          .hero-bullets li{color:rgba(255,255,255,0.88);font-size:16px;line-height:1.9;padding-right:14px;position:relative;}
          .hero-bullets li::before{content:"•";position:absolute;right:0;color:${BROWN};}
          .hero-actions{display:flex;gap:12px;justify-content:center;flex-wrap:wrap;}
          .btn-solid{display:inline-flex;align-items:center;gap:8px;padding:13px 22px;border-radius:7px;background:${NEAR_BLACK};color:#fff;font-size:15px;font-weight:800;text-decoration:none;font-family:Heebo,Arial,sans-serif;}
          .btn-ghost{display:inline-flex;align-items:center;gap:8px;padding:13px 22px;border-radius:7px;background:transparent;color:#fff;border:1.5px solid rgba(255,255,255,0.35);font-size:15px;font-weight:700;text-decoration:none;font-family:Heebo,Arial,sans-serif;}
          .how{background:#fff;padding:56px 24px;}
          .how-inner{max-width:1000px;margin:0 auto;}
          .how h2{text-align:center;font-size:clamp(24px,3vw,34px);font-weight:900;margin-bottom:48px;letter-spacing:-.5px;}
          .how-steps{display:grid;grid-template-columns:repeat(4,1fr);gap:0;align-items:start;position:relative;}
          .how-step{text-align:center;padding:0 12px;position:relative;}
          .how-step-num{width:52px;height:52px;border-radius:50%;border:2px solid #E8E0D5;background:#fff;display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:900;color:${NEAR_BLACK};margin:0 auto 12px;position:relative;z-index:2;}
          .how-step-icon{width:52px;height:52px;border-radius:50%;background:#F7F1EA;display:flex;align-items:center;justify-content:center;margin:0 auto 10px;font-size:22px;}
          .how-step h3{font-size:14px;font-weight:800;color:${NEAR_BLACK};line-height:1.5;}
          .how-arrow{position:absolute;top:26px;left:-14px;font-size:20px;color:#C8B89A;z-index:3;}
          .tours-section{background:${CREAM};padding:48px 24px;}
          .tours-inner{max-width:1120px;margin:0 auto;}
          .tours-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:28px;}
          .tours-head h2{font-size:clamp(22px,3vw,32px);font-weight:900;letter-spacing:-.5px;}
          .tours-head a{color:${BROWN};font-size:14px;font-weight:800;text-decoration:none;}
          .tours-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:20px;}
          .tour-card-static{border-radius:16px;overflow:hidden;background:#1a0d06;text-decoration:none;color:#fff;display:block;box-shadow:0 8px 24px rgba(0,0,0,0.1);}
          .tour-card-img{height:200px;position:relative;overflow:hidden;}
          .tour-card-img img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .4s ease;}
          .tour-card-static:hover .tour-card-img img{transform:scale(1.06);}
          .tour-card-fade{position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,0.6) 0%,transparent 55%);}
          .tour-card-body{padding:16px;}
          .tour-card-body h3{font-size:17px;font-weight:900;margin-bottom:4px;}
          .tour-meta{font-size:12px;color:rgba(255,255,255,0.6);margin-bottom:12px;display:flex;gap:8px;}
          .price-row{display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;}
          .price-info{font-size:13px;color:rgba(255,255,255,0.7);}
          .price-info s{color:rgba(255,255,255,0.4);font-size:12px;}
          .price-info strong{color:#fff;font-size:16px;}
          .tour-cta-btn{display:inline-flex;align-items:center;gap:5px;background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2);color:#fff;padding:7px 12px;border-radius:6px;font-size:12px;font-weight:700;}
          .tour-badge{position:absolute;top:12px;right:12px;background:${NEAR_BLACK};color:#fff;font-size:11px;font-weight:800;padding:4px 10px;border-radius:4px;display:flex;align-items:center;gap:4px;}
          .guides-section{background:#fff;padding:56px 24px;}
          .guides-inner{max-width:1120px;margin:0 auto;}
          .guides-section h2{text-align:center;font-size:clamp(22px,3vw,32px);font-weight:900;margin-bottom:36px;letter-spacing:-.5px;}
          .guides-layout{display:grid;grid-template-columns:1fr 1fr;gap:28px;}
          .guide-card{background:${CREAM};border-radius:18px;overflow:hidden;display:grid;grid-template-columns:170px 1fr;border:1px solid #EDE7DF;}
          .guide-card-img{background:#1a0d06;min-height:240px;}
          .guide-card-img img{width:100%;height:100%;object-fit:cover;display:block;}
          .guide-card-body{padding:22px 20px;}
          .guide-card-body h3{font-size:20px;font-weight:900;margin-bottom:3px;}
          .guide-region{font-size:13px;color:${GRAY};margin-bottom:10px;display:flex;align-items:center;gap:4px;}
          .guide-card-body p{font-size:14px;color:#555;line-height:1.65;margin-bottom:12px;}
          .guide-tags{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:12px;}
          .guide-tag{background:rgba(126,72,33,0.08);color:${BROWN};border:1px solid rgba(126,72,33,0.18);border-radius:20px;font-size:12px;font-weight:700;padding:3px 10px;}
          .guide-stats{display:flex;gap:14px;margin-bottom:14px;}
          .guide-stat{font-size:13px;color:${GRAY};}
          .guide-profile-btn{display:flex;align-items:center;justify-content:center;gap:8px;width:100%;background:${NEAR_BLACK};color:#fff;border:none;border-radius:8px;padding:11px;font-size:14px;font-weight:800;cursor:pointer;text-decoration:none;font-family:Heebo,Arial,sans-serif;}
          .guides-dots{display:flex;gap:8px;justify-content:center;margin-top:20px;}
          .guides-dot{width:8px;height:8px;border-radius:50%;background:#E0D5C8;cursor:pointer;}
          .guides-dot.act{background:${BROWN};width:20px;border-radius:4px;}
          .community{position:relative;overflow:hidden;padding:72px 24px;}
          .community-bg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center top;display:block;}
          .community-overlay{position:absolute;inset:0;background:rgba(12,8,4,0.68);}
          .community-inner{position:relative;z-index:2;max-width:860px;margin:0 auto;text-align:center;color:#fff;}
          .community-inner h2{font-size:clamp(26px,4vw,44px);font-weight:900;margin-bottom:10px;letter-spacing:-.5px;}
          .community-inner>p{font-size:17px;color:rgba(255,255,255,0.75);margin-bottom:36px;line-height:1.7;}
          .community-perks{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:32px;}
          .perk{background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.12);border-radius:14px;padding:18px 14px;text-align:center;}
          .perk-icon{font-size:24px;margin-bottom:8px;}
          .perk h4{font-size:13px;font-weight:800;margin-bottom:3px;}
          .perk p{font-size:12px;color:rgba(255,255,255,0.55);line-height:1.5;}
          .email-row{display:flex;gap:10px;max-width:460px;margin:0 auto;}
          .email-row input{flex:1;padding:13px 16px;border-radius:8px;border:none;font-size:15px;font-family:Heebo,Arial,sans-serif;outline:none;}
          .email-row .join-btn{padding:13px 22px;border-radius:8px;background:${BROWN};color:#fff;border:none;font-size:15px;font-weight:800;cursor:pointer;font-family:Heebo,Arial,sans-serif;white-space:nowrap;}
          .search-wrap{background:${CREAM};padding:32px 24px;}
          .search-box{max-width:1100px;margin:0 auto 10px;display:flex;gap:8px;background:#fff;border-radius:14px;padding:8px;box-shadow:0 8px 32px rgba(0,0,0,0.06);border:1px solid #EDE7DF;}
          .footer{background:#fff;border-top:1px solid #EDE7DF;padding:40px 24px 24px;}
          .footer-inner{max-width:1120px;margin:0 auto;display:grid;grid-template-columns:auto 1fr auto;gap:40px;align-items:start;}
          .footer-brand img{height:68px;width:auto;display:block;margin-bottom:10px;}
          .footer-brand p{font-size:13px;color:${GRAY};line-height:1.6;max-width:210px;}
          .footer-nav-grid{display:grid;grid-template-columns:1fr 1fr;gap:6px 32px;padding:4px 0;}
          .footer-nav-grid a{color:${GRAY};text-decoration:none;font-size:13px;font-weight:600;}
          .footer-social-col{display:flex;flex-direction:column;gap:11px;}
          .footer-social-col a{display:flex;align-items:center;gap:10px;color:${NEAR_BLACK};text-decoration:none;font-size:13px;font-weight:700;}
          .social-icon{width:32px;height:32px;border-radius:50%;background:${CREAM};display:flex;align-items:center;justify-content:center;color:${BROWN};}
          .footer-copy{max-width:1120px;margin:24px auto 0;padding-top:18px;border-top:1px solid #EDE7DF;text-align:center;font-size:12px;color:#B0A89E;}
          @media(max-width:980px){
            .how-steps{grid-template-columns:1fr 1fr;gap:24px;}
            .tours-grid{grid-template-columns:1fr 1fr;}
            .guides-layout{grid-template-columns:1fr;}
            .community-perks{grid-template-columns:1fr 1fr;}
            .footer-inner{grid-template-columns:1fr;gap:24px;}
            .hero-copy{right:24px;left:24px;top:auto;bottom:40px;transform:none;width:auto;min-width:0;text-align:right;}
            .hero-timeline{justify-content:flex-start;}
          }
          @media(max-width:640px){
            .nav-links a:not(:last-child){display:none;}
            .tours-grid{grid-template-columns:1fr;}
            .how-steps{grid-template-columns:1fr;}
            .community-perks{grid-template-columns:1fr 1fr;}
            .email-row{flex-direction:column;}
            .guide-card{grid-template-columns:1fr;}
            .search-box{flex-direction:column;}
          }
        `}</style>
      </Head>

      {/* NAV */}
      <nav className="nav">
        <div className="nav-inner">
          <div className="nav-links">
            <a href="#tours">גלו מקומות</a>
            <span className="nav-sep">|</span>
            <a href="#guides">מדריכים</a>
            <span className="nav-sep">|</span>
            <a href="#community">קהילה</a>
            <span className="nav-sep">|</span>
            <a href="#podcast">פודקאסט</a>
          </div>
          <Link href="/"><img src="/Logo-black.png" alt="מאז ועד היום" className="nav-logo" /></Link>
          <Link href={isGuide ? '/add-tour' : '/join'} style={{ textDecoration: 'none' }}>
            <Sign text="אני מדריך" size="sm" />
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <img src="/hero-sofa.png" alt="" className="bg" onError={e => { e.target.style.display='none' }} />
        <div className="hero-shade" />
        <div className="hero-bottom" />
        <div className="hero-copy">
          <div style={{ display: 'inline-block', transform: 'rotate(-2deg)', marginBottom: 20 }}>
            <Sign text="אחלה תירוץ לצאת מהבית" size="lg" />
          </div>
          <h1>כולם צריכים<br />תירוץ טוב<br />לצאת מהבית.</h1>
          <div className="hero-timeline">
            <div className="hero-tl-dot" />
            <div className="hero-tl-line" />
            <div className="hero-tl-dot" />
            <div className="hero-tl-line" />
            <div className="hero-tl-dot" />
          </div>
          <ul className="hero-bullets">
            <li>המקומות הכי מסקרנים</li>
            <li>האנשים שמכירים אותם הכי טוב</li>
            <li>החוויות שלא תשכחו</li>
          </ul>
          <div className="hero-actions">
            <a href="#tours" className="btn-solid">📍 גלו סיורים</a>
            <a href="#community" className="btn-ghost">👤 הצטרפו לקהילה</a>
            <a href="#podcast" className="btn-ghost">🎧 הפודקאסט החדש</a>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="how" id="how">
        <div className="how-inner">
          <h2>איך זה עובד?</h2>
          <div className="how-steps">
            {[
              { num: 1, icon: '📍', title: 'אנחנו לוקחים את המקומות הכי מסקרנים' },
              { num: 2, icon: '👤', title: 'מחפשים מורה דרך שמכיר את הסיפור שלהם הכי טוב' },
              { num: 3, icon: '🎙', title: 'מקליטים פרק פודקאסט שמספר את הסיפור של המקום' },
              { num: 4, icon: '🏷', title: 'משייכים לכם מחיר מיוחד על הסיור' },
            ].map(function(step, i) {
              return (
                <div key={step.num} className="how-step">
                  {i > 0 && <div className="how-arrow">←</div>}
                  <div className="how-step-num">{step.num}</div>
                  <div className="how-step-icon">{step.icon}</div>
                  <h3>{step.title}</h3>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* TOURS */}
      <section className="tours-section" id="tours">
        <div className="tours-inner">
          <div className="tours-head">
            <h2>גלו מקומות דרך הסיפורים שלהם</h2>
            <a href="/tours">כל הסיורים ←</a>
          </div>
          <div className="tours-grid">
            {STATIC_TOURS.map(function(tour) {
              return (
                <a key={tour.id} href={'/tours/' + tour.id} className="tour-card-static">
                  <div className="tour-card-img">
                    <img src={tour.img} alt={tour.title} onError={e => e.target.style.display='none'} />
                    <div className="tour-card-fade" />
                    <div className="tour-badge">🎧 פרק חדש</div>
                  </div>
                  <div className="tour-card-body">
                    <h3>{tour.title}</h3>
                    <div className="tour-meta">
                      <span>📍 {tour.city}</span>
                      <span>🕐 {tour.duration} שעות</span>
                    </div>
                    <div className="price-row">
                      <div className="price-info">
                        <s>{tour.price + 20} ₪</s>{'  '}
                        <strong>{tour.price} ₪</strong>
                        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', marginRight: 4 }}>לחברי קהילה</span>
                      </div>
                      <span className="tour-cta-btn">גלו ←</span>
                    </div>
                  </div>
                </a>
              )
            })}
          </div>
        </div>
      </section>

      {/* GUIDES */}
      <section className="guides-section" id="guides">
        <div className="guides-inner">
          <h2>פגשו את האנשים שמספרים את הסיפורים</h2>
          <div className="guides-layout">
            {GUIDES.map(function(g) {
              return (
                <div key={g.name} className="guide-card">
                  <div className="guide-card-img">
                    <img src={g.img} alt={g.name} onError={e => e.target.style.display='none'} />
                  </div>
                  <div className="guide-card-body">
                    <h3>{g.name}</h3>
                    <div className="guide-region">📍 {g.region}</div>
                    <p>{g.desc}</p>
                    <div className="guide-tags">
                      {g.tags.map(t => <span key={t} className="guide-tag">{t}</span>)}
                    </div>
                    <div className="guide-stats">
                      <span className="guide-stat">🎧 {g.episodes} פרקים</span>
                      <span className="guide-stat">🗺 {g.tours} סיורים</span>
                    </div>
                    <a href="/join" className="guide-profile-btn">לפרופיל המלא ←</a>
                  </div>
                </div>
              )
            })}
          </div>
          <div className="guides-dots">
            {[0,1,2,3].map(i => <div key={i} className={'guides-dot' + (i===2?' act':'')} />)}
          </div>
        </div>
      </section>

      {/* COMMUNITY */}
      <section className="community" id="community">
        <img src="/CTA-Community.png" alt="" className="community-bg" onError={e => e.target.style.display='none'} />
        <div className="community-overlay" />
        <div className="community-inner">
          <h2>חברי הקהילה משלמים פחות</h2>
          <p>הצטרפו לקהילה וקבלו 10% הנחה על כל הסיורים באתר.</p>
          <div className="community-perks">
            {[
              { icon: '🏷', title: '10% הנחה קבועה', text: 'על כל הסיורים' },
              { icon: '📍', title: 'סיורים חדשים', text: 'ליידוע לפני כולם' },
              { icon: '📅', title: 'עדכונים לסופ"ש', text: 'והמלצות מקומיות' },
              { icon: '🎧', title: 'פרקים חדשים', text: 'לפני כולם' },
            ].map(function(p) {
              return (
                <div key={p.title} className="perk">
                  <div className="perk-icon">{p.icon}</div>
                  <h4>{p.title}</h4>
                  <p>{p.text}</p>
                </div>
              )
            })}
          </div>
          <div className="email-row">
            <input type="email" placeholder="הכניסו את האימייל שלכם" value={email} onChange={e => setEmail(e.target.value)} />
            <Link href="/discount" style={{ textDecoration: 'none' }}>
              <button type="button" className="join-btn">הצטרפו לקהילה ←</button>
            </Link>
          </div>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 10 }}>ללא ספאם. רק סיורים חדשים ותכנים מיוחדים.</p>
        </div>
      </section>

      {/* SEARCH */}
      <section className="search-wrap" id="search">
        <div className="search-box">
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => { if (e.key==='Enter') handleSearch() }} placeholder="חפשו מקום, מדריך, תקופה..." style={Object.assign({}, inp, { flex: 2, border: 'none', padding: '12px 16px' })} />
          <select value={region} onChange={e => setRegion(e.target.value)} style={Object.assign({}, inp, { flex: 1, border: 'none' })}>
            <option value="">כל האזורים</option>
            {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          <select value={period} onChange={e => setPeriod(e.target.value)} style={Object.assign({}, inp, { flex: 1.4, border: 'none' })}>
            <option value="">כל התקופות</option>
            {PERIODS.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          <button onClick={handleSearch} style={{ background: BROWN, color: '#fff', border: 'none', borderRadius: 10, padding: '12px 28px', fontSize: 14, fontWeight: 800, cursor: 'pointer', flexShrink: 0, fontFamily: 'Heebo, Arial, sans-serif' }}>חפשו</button>
        </div>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', paddingRight: 8 }}>
          <div style={{ position: 'relative' }}>
            <input type="text" value={guideInput} onChange={e => handleGuideInput(e.target.value)} placeholder="שם מורה דרך..." style={{ padding: '7px 12px', borderRadius: 6, border: '1px solid #e5e5e5', fontSize: 13, fontFamily: 'Heebo, Arial, sans-serif', outline: 'none' }} />
            {guideMatches.length > 0 && (
              <div style={{ position: 'absolute', top: '100%', right: 0, background: '#fff', border: '1px solid #ddd', borderRadius: 8, zIndex: 10, boxShadow: '0 4px 16px rgba(0,0,0,0.1)', minWidth: 180 }}>
                {guideMatches.map(g => <div key={g} onClick={() => { setSelectedGuide(g); setGuideInput(g); setGuideMatches([]) }} style={{ padding: '10px 14px', cursor: 'pointer', fontSize: 13, fontFamily: 'Heebo, Arial, sans-serif' }}>{g}</div>)}
              </div>
            )}
          </div>
          <button onClick={() => setNotFound(!notFound)} style={{ background: 'none', border: 'none', color: BROWN, fontSize: 13, cursor: 'pointer', textDecoration: 'underline', fontFamily: 'Heebo, Arial, sans-serif' }}>לא מצאתי, תמצאו לי מדריך שיקח אותי ל...</button>
        </div>
        {notFound && !notFoundSent && (
          <form onSubmit={handleNotFound} style={{ maxWidth: 720, margin: '12px auto 0', display: 'flex', gap: 8 }}>
            <input type="text" value={notFoundText} onChange={e => { if (e.target.value.length<=120) setNotFoundText(e.target.value) }} placeholder="לאן תרצו ללכת?" style={Object.assign({}, inp, { flex: 1 })} />
            <button type="submit" style={{ background: BROWN, color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', fontSize: 13, fontWeight: 800, cursor: 'pointer', fontFamily: 'Heebo, Arial, sans-serif' }}>שלח</button>
          </form>
        )}
        {notFoundSent && <p style={{ marginTop: 8, fontSize: 13, color: '#22c55e', textAlign: 'center' }}>✓ נחזור אליכם בהקדם!</p>}
        {searchResults !== null && (
          <div id="sr" style={{ maxWidth: 1120, margin: '24px auto 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <h2 style={{ fontSize: 22, fontWeight: 900 }}>תוצאות ({searchResults.length})</h2>
              <button onClick={() => setSearchResults(null)} style={{ background: 'none', border: 'none', color: GRAY, cursor: 'pointer', textDecoration: 'underline', fontFamily: 'Heebo, Arial, sans-serif', fontSize: 13 }}>נקה חיפוש</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 16 }}>
              {searchResults.map(t => (
                <a key={t.id} href={'/tours/'+t.id} className="tour-card-static">
                  <div className="tour-card-img" style={{ height: 160 }}>
                    {t.Tour_Images && <img src={t.Tour_Images.split('|')[0]} alt={t.Tour_Title} />}
                    <div className="tour-card-fade" />
                  </div>
                  <div className="tour-card-body">
                    <h3>{t.Tour_Title}</h3>
                    <div className="tour-meta"><span>📍 {t.Cities_Tags}</span><span>· {t.Guide_Name}</span></div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* FOOTER */}
      <footer className="footer" id="podcast">
        <div className="footer-inner">
          <div className="footer-brand">
            <img src="/Logo-black.png" alt="מאז ועד היום" />
            <p>סיפורים שגורמים לאנשים לצאת מהבית.</p>
          </div>
          <div className="footer-nav-grid">
            <a href="#tours">גלו מקומות</a>
            <a href="/join">אני מדריך</a>
            <a href="#guides">מדריכים</a>
            <a href="#community">קהילה</a>
            <a href="#podcast">פודקאסט</a>
            <a href="https://mvh.co.il">אודות</a>
            <a href="https://mvh.co.il">צור קשר</a>
            <a href="https://mvh.co.il">מדיניות פרטיות</a>
            <a href="https://mvh.co.il">תנאי שימוש</a>
          </div>
          <div className="footer-social-col">
            {[['TikTok','https://mvh.co.il'],['Facebook','https://mvh.co.il'],['YouTube','https://mvh.co.il'],['Spotify','https://mvh.co.il'],['Apple Podcasts','https://mvh.co.il']].map(function(s) {
              return (
                <a key={s[0]} href={s[1]} target="_blank" rel="noopener noreferrer">
                  <span className="social-icon"><SocialIcon name={s[0]} /></span>
                  {s[0]}
                </a>
              )
            })}
          </div>
        </div>
        <p className="footer-copy">© כל הזכויות שמורות ל-מאז ועד היום | מחבר בין מטיילים סקרנים למדריכים שמכירים את הסיפורים מאחורי המקומות.</p>
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
    const tours = (data.records || []).map(r => Object.assign({ id: r.id }, r.fields))
    const guides = [...new Set(tours.map(t => t.Guide_Name).filter(Boolean))].sort()
    return { props: { tours, guides } }
  } catch(e) { return { props: { tours: [], guides: [] } } }
}
