import { useState, useEffect, useRef } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useUser } from '@clerk/nextjs'
import styles from '../styles/Home.module.css'

const FALLBACK_TOURS = [
  { id: 'apolonia', Tour_Title: 'אפולוניה', Cities_Tags: 'הרצליה', Tour_Images: '/Tours-Apolonia.png', Price_Per_Person: 120, Duration_Hours: 3, Tour_Status: 'paid' },
  { id: 'safed',    Tour_Title: 'צפת',      Cities_Tags: 'צפת',     Tour_Images: '/Tours-Safed.png',    Price_Per_Person: 120, Duration_Hours: 5, Tour_Status: 'paid' },
  { id: 'david',   Tour_Title: 'עיר דוד',  Cities_Tags: 'ירושלים', Tour_Images: '/Tours-DavidCity.png', Price_Per_Person: 120, Duration_Hours: 3, Tour_Status: 'paid' },
  { id: 'church',  Tour_Title: 'כנסיות ירושלים', Cities_Tags: 'ירושלים', Tour_Images: '/Tours-JLM-Church.png', Price_Per_Person: 120, Duration_Hours: 4, Tour_Status: 'paid' },
]

const FALLBACK_GUIDES = [
  { id: 'daniel', Guide_Name: 'דניאל כהן', Guide_Region: 'צפון והגליל', Guide_Photo: '/Hero-Guide-M.png', Guide_Bio: 'מדריך בן 8 שנות ניסיון.', Guide_Tags: 'אנשים,טבע,גבו', Tour_Count: 12, Episode_Count: 9 },
  { id: 'michal', Guide_Name: 'מיכל לוי',  Guide_Region: 'ירושלים והרי יהודה', Guide_Photo: '/Hero-Guide-F.png', Guide_Bio: 'אני מחברת בין אנשים, היסטוריה וסיפורים.', Guide_Tags: 'סיפורים,חברותא,היסטוריה', Tour_Count: 12, Episode_Count: 2 },
]

const HOW_STEPS = [
  { num: 1, icon: '/ICON-Location.png', text: 'אנחנו לוקחים את המקומות הכי מסקרנים' },
  { num: 2, icon: '/ICON-Guide.png',    text: 'מחפשים מורה דרך שמכיר את הסיפור שלהם הכי טוב' },
  { num: 3, icon: '/ICON-Mic.png',      text: 'מקליטים אותם פרק פודקאסט שמספר את הסיפור של המקום מאז ועד היום' },
  { num: 4, icon: '/ICON-Location.png', text: 'משייכים לכם מחיר מיוחד על הסיור' },
]

function TourCard({ tour }) {
  const images = tour.Tour_Images ? tour.Tour_Images.split('|').filter(Boolean) : []
  const thumb = images[0] || null
  const price = Number(tour.Price_Per_Person) || 120
  const discounted = Math.round(price * 0.9)
  const city = tour.Cities_Tags || ''
  const duration = tour.Duration_Hours || ''
  const title = tour.Tour_Title || 'סיור חדש'

  return (
    <a href={'/tours/' + tour.id} className={styles.tourCard}>
      <div className={styles.tourImg}>
        {thumb
          ? <img src={thumb} alt={title} onError={e => e.target.style.display='none'} />
          : <div style={{ width: '100%', height: '100%', background: 'linear-gradient(150deg,#3a1a08,#1a0d06)' }} />
        }
        <div className={styles.tourImgFade} />
        <span className={styles.tourBadge}>🎧 פרק חדש</span>
        <div className={styles.tourBottom}>
          <h3 className={styles.tourTitle}>{title}</h3>
          <div className={styles.tourMeta}>
            {city && <span>📍 {city}</span>}
            {duration && <span>🕐 {duration} שעות</span>}
          </div>
          <div className={styles.tourPriceRow}>
            <span className={styles.tourPrice}>
              <s>{price} ₪</s> <strong>{discounted} ₪</strong>
              <span className={styles.forMembers}>לחברי קהילה</span>
            </span>
            <span className={styles.tourCta}>גלו את {title} ←</span>
          </div>
        </div>
      </div>
    </a>
  )
}

function GuideCard({ guide }) {
  const tags = guide.Guide_Tags ? guide.Guide_Tags.split(',').map(t => t.trim()).filter(Boolean) : []
  const photo = guide.Guide_Photo || null
  const name = guide.Guide_Name || 'מדריך'
  const region = guide.Guide_Region || ''
  const bio = guide.Guide_Bio || ''
  const tours = guide.Tour_Count || 0
  const episodes = guide.Episode_Count || 0

  return (
    <article className={styles.guideCard}>
      <div className={styles.guideImg}>
        {photo
          ? <img src={photo} alt={name} onError={e => e.target.style.display='none'} />
          : <div style={{ width: '100%', height: '100%', background: '#1a0d06' }} />
        }
      </div>
      <div className={styles.guideBody}>
        <h3 className={styles.guideName}>{name}</h3>
        {region && <p className={styles.guideRegion}>📍 {region}</p>}
        {bio && <p className={styles.guideDesc}>{bio}</p>}
        {tags.length > 0 && (
          <div className={styles.guideTags}>
            {tags.map(t => <span key={t} className={styles.guideTag}>{t}</span>)}
          </div>
        )}
        <div className={styles.guideStats}>
          {episodes > 0 && <span>🎧 {episodes} פרקים</span>}
          {tours > 0 && <span>🗺 {tours} סיורים</span>}
        </div>
        <a href={'/guides/' + guide.id} className={styles.guideBtn}>לפרופיל המלא ←</a>
      </div>
    </article>
  )
}

export default function Home({ tours, guides, featuredTours, featuredGuides }) {
  const { user, isLoaded } = useUser()
  const [isGuide, setIsGuide] = useState(false)
  const [userRegions, setUserRegions] = useState([])
  const guidesRef = useRef(null)
  const [guideIdx, setGuideIdx] = useState(0)

  useEffect(function() {
    if (!isLoaded || !user) return
    fetch('/api/get-guide?clerk_id=' + user.id + '&email=' + encodeURIComponent(user.emailAddresses?.[0]?.emailAddress || '')).then(function(r) { return r.json() }).then(function(d) { if (d.found) setIsGuide(true) })
    
    fetch('/api/get-signup?clerk_id=' + user.id).then(r => r.json()).then(d => {
      if (d.found && d.signup && d.signup.Regions_Interest)
        setUserRegions(d.signup.Regions_Interest.split(', ').filter(Boolean))
    })
  }, [isLoaded, user])

  function scrollGuide(dir) {
    if (!guidesRef.current) return
    const w = guidesRef.current.querySelector('article')?.offsetWidth || guidesRef.current.offsetWidth / 2
    guidesRef.current.scrollBy({ left: dir * (w + 20), behavior: 'smooth' })
    setGuideIdx(prev => Math.max(0, Math.min((featuredGuides.length || 1) - 1, prev + dir)))
  }

  const displayTours = featuredTours.length > 0 ? featuredTours : FALLBACK_TOURS
  const displayGuides = featuredGuides.length > 0 ? featuredGuides : FALLBACK_GUIDES

  return (
    <div dir="rtl" className={styles.root}>
      <Head>
        <title>מאז ועד היום | אחלה תירוץ לצאת מהבית</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="מגלים סיפורים דרך סיורים, סרטונים קצרים ופודקאסטים." />
        <link href="https://fonts.googleapis.com/css2?family=Heebo:wght@300;400;700;900&display=swap" rel="stylesheet" />
      </Head>

      <header className={styles.header}>
        <nav className={styles.nav}>
          <Link href={isGuide ? '/add-tour' : '/join'} className={styles.navCta}>
            <span className={styles.navCtaArrow}>←</span> אני מדריך
          </Link>
          <div className={styles.navLinks}>
            <a href="#podcast">פודקאסט</a>
            <span className={styles.navSep}>|</span>
            <a href="#community">קהילה</a>
            <span className={styles.navSep}>|</span>
            <a href="#guides">מדריכים</a>
            <span className={styles.navSep}>|</span>
            <a href="#tours">גלו מקומות</a>
          </div>
          <Link href="/" className={styles.navLogo}>
            <img src="/Logo-black.png" alt="מאז ועד היום" />
          </Link>
        </nav>
      </header>

      <main>
        <section className={styles.hero}>
          <img src="/Hero.png" alt="" className={styles.heroBg} onError={e => { e.target.style.display='none' }} />
          <div className={styles.heroShade} />
          <div className={styles.heroContent}>
            <h1 className={styles.heroH1}>כולם צריכים<br />תירוץ טוב<br />לצאת מהבית.</h1>
            <div className={styles.heroTimeline}>
              <span className={styles.tlDot} />
              <span className={styles.tlLine} />
              <span className={styles.tlDot} />
              <span className={styles.tlLine} />
              <span className={styles.tlDot} />
            </div>
            <ul className={styles.heroBullets}>
              <li>המקומות הכי מסקרנים</li>
              <li>האנשים שמכירים אותם הכי טוב</li>
              <li>החוויות שלא תשכחו</li>
            </ul>
            <div className={styles.heroActions}>
              <a href="#tours" className={styles.btnSolid}>📍 גלו סיורים</a>
              <a href="#community" className={styles.btnGhost}>👤 הצטרפו לקהילה</a>
              <a href="#podcast" className={styles.btnGhost}>🎧 הפודקאסט החדש</a>
            </div>
          </div>
        </section>

        <section className={styles.how} id="how">
          <div className={styles.container}>
            <h2 className={styles.sectionTitle}>איך זה עובד?</h2>
            <div className={styles.howSteps}>
              {HOW_STEPS.map(function(step, i) {
                return (
                  <div key={step.num} className={styles.howStep}>
                    {i < HOW_STEPS.length - 1 && <span className={styles.howArrow}>←</span>}
                    <div className={styles.howCircle}>
                      <img src={step.icon} alt="" onError={e => e.target.style.display='none'} />
                      <span className={styles.howNum}>{step.num}</span>
                    </div>
                    <p className={styles.howText}>{step.text}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        <section className={styles.toursSection} id="tours">
          <div className={styles.container}>
            <div className={styles.sectionHead}>
              <h2>גלו מקומות דרך הסיפורים שלהם</h2>
              <a href="/tours" className={styles.seeAll}>כל הסיורים ←</a>
            </div>
            <div className={styles.toursGrid}>
              {displayTours.map(t => <TourCard key={t.id} tour={t} />)}
            </div>
          </div>
        </section>

        <section className={styles.guidesSection} id="guides">
          <div className={styles.container}>
            <h2 className={styles.sectionTitle}>פגשו את האנשים שמספרים את הסיפורים</h2>
            <div className={styles.guidesSliderWrap}>
              <button className={styles.guideArrow} onClick={() => scrollGuide(1)} aria-label="הקודם">›</button>
              <div className={styles.guidesSlider} ref={guidesRef}>
                {displayGuides.map(g => <GuideCard key={g.id} guide={g} />)}
              </div>
              <button className={styles.guideArrow} onClick={() => scrollGuide(-1)} aria-label="הבא">‹</button>
            </div>
            <div className={styles.guidesDots}>
              {displayGuides.map((_, i) => (
                <span key={i} className={styles.dot + (i === guideIdx ? ' ' + styles.dotActive : '')} />
              ))}
            </div>
          </div>
        </section>

        <section className={styles.community} id="community">
          <img src="/CTA-Community.png" alt="" className={styles.communityBg} onError={e => e.target.style.display='none'} />
          <div className={styles.communityOverlay} />
          <div className={styles.communityContent}>
            <h2>חברי הקהילה משלמים פחות</h2>
            <p>הצטרפו לקהילה וקבלו 10% הנחה על כל הסיורים באתר.</p>
            <div className={styles.communityPerks}>
              {[
                { icon: '🏷', title: '10% הנחה קבועה', sub: 'על כל הסיורים' },
                { icon: '📍', title: 'סיורים חדשים ליידוע', sub: 'לפני כולם' },
                { icon: '📅', title: 'עדכונים לסופ"ש', sub: 'והמלצות מקומיות' },
                { icon: '🎧', title: 'פרקים חדשים', sub: 'לפני כולם' },
              ].map(p => (
                <div key={p.title} className={styles.perk}>
                  <span className={styles.perkIcon}>{p.icon}</span>
                  <strong>{p.title}</strong>
                  <span>{p.sub}</span>
                </div>
              ))}
            </div>
            <div className={styles.communityForm}>
              <input type="email" placeholder="הכניסו את האימייל שלכם" className={styles.emailInput} />
              <Link href="/discount" className={styles.joinBtn}>הצטרפו לקהילה ←</Link>
            </div>
            <p className={styles.communityNote}>ללא ספאם. רק סיורים חדשים ותכנים מיוחדים.</p>
          </div>
        </section>
      </main>

      <footer className={styles.footer} id="podcast">
        <div className={styles.footerInner}>
          <div className={styles.footerBrand}>
            <img src="/Logo-black.png" alt="מאז ועד היום" className={styles.footerLogo} />
            <p>סיפורים שגורמים לאנשים לצאת מהבית.</p>
          </div>
          <nav className={styles.footerNav} aria-label="ניווט עמוד">
            <div>
              <strong>עקבו אחרינו</strong>
              <a href="https://mvh.co.il" target="_blank" rel="noopener noreferrer">TikTok</a>
              <a href="https://mvh.co.il" target="_blank" rel="noopener noreferrer">YouTube</a>
              <a href="https://mvh.co.il" target="_blank" rel="noopener noreferrer">Spotify</a>
              <a href="https://mvh.co.il" target="_blank" rel="noopener noreferrer">Apple Podcasts</a>
              <a href="https://mvh.co.il" target="_blank" rel="noopener noreferrer">Facebook</a>
            </div>
            <div>
              <strong>ניווט מהיר</strong>
              <a href="#tours">גלו מקומות</a>
              <a href="#guides">מדריכים</a>
              <a href="#community">קהילה</a>
              <a href="#podcast">פודקאסט</a>
              <Link href="/join">אני מדריך</Link>
            </div>
          </nav>
        </div>
        <p className={styles.footerCopy}>© כל הזכויות שמורות ל-מאז ועד היום | MvH.co.il</p>
      </footer>
    </div>
  )
}

export async function getServerSideProps() {
  try {
    const token = process.env.AIRTABLE_TOKEN
    const baseId = process.env.AIRTABLE_BASE_ID

    const toursRes = await fetch(
      `https://api.airtable.com/v0/${baseId}/tbltsGvfPLMAmJ764?pageSize=100`,
      { headers: { Authorization: `Bearer ${token}` } }
    )
    const toursData = await toursRes.json()
    const allTours = (toursData.records || []).map(r => Object.assign({ id: r.id }, r.fields))

    const featuredTours = allTours
      .filter(t => t.Tour_Status === 'paid')
      .sort((a, b) => new Date(b.Created_At || 0) - new Date(a.Created_At || 0))
      .slice(0, 4)

    let featuredGuides = []
    try {
      const guidesRes = await fetch(
        `https://api.airtable.com/v0/${baseId}/tblGuides?pageSize=10`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      const guidesData = await guidesRes.json()
      featuredGuides = (guidesData.records || []).map(r => Object.assign({ id: r.id }, r.fields)).slice(0, 4)
    } catch(e) {}

    const guides = [...new Set(allTours.map(t => t.Guide_Name).filter(Boolean))].sort()
    return { props: { tours: allTours, guides, featuredTours, featuredGuides } }
  } catch(e) {
    return { props: { tours: [], guides: [], featuredTours: [], featuredGuides: [] } }
  }
}
