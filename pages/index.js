import { useState, useEffect, useRef } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useUser } from '@clerk/nextjs'
import styles from '../styles/Home.module.css'

const STATIC_TOURS = [
  { id: 'apolonia', title: 'אפולוניה', city: 'הרצליה', img: '/Tours-Apolonia.png', price: 120, duration: 3, isNew: true },
  { id: 'safed',    title: 'צפת',      city: 'צפת',     img: '/Tours-Safed.png',    price: 120, duration: 5, isNew: true },
  { id: 'david',   title: 'עיר דוד',  city: 'ירושלים', img: '/Tours-DavidCity.png', price: 120, duration: 3, isNew: true },
  { id: 'church',  title: 'כנסיות ירושלים', city: 'ירושלים', img: '/Tours-JLM-Church.png', price: 120, duration: 4, isNew: true },
]

const STATIC_GUIDES = [
  { id: 'daniel', name: 'דניאל כהן', region: 'צפון והגליל', img: '/Hero-Guide-M.png', desc: 'מדריך בן 8 שנות ניסיון. מתמחה בסיורי לילה וגליל, מספר ומחבר סיפורים שאוהבים ומחברים אנשים למקומות.', tags: ['אנשים', 'טבע', 'גבו'], tours: 12, episodes: 9 },
  { id: 'michal', name: 'מיכל לוי',  region: 'ירושלים והרי יהודה', img: '/Hero-Guide-F.png', desc: 'אני מחברת בין אנשים, היסטוריה וסיפורים. מאז ועד היום היא בשבילי הדרך לספר את הסיפורים שמחברים כל מקום.', tags: ['סיפורים', 'חברותא', 'היסטוריה'], tours: 12, episodes: 2 },
]

const HOW_STEPS = [
  { num: 1, icon: '/ICON-Location.png', text: 'אנחנו לוקחים את המקומות הכי מסקרנים' },
  { num: 2, icon: '/ICON-Guide.png',    text: 'מחפשים מורה דרך שמכיר את הסיפור שלהם הכי טוב' },
  { num: 3, icon: '/ICON-Mic.png',      text: 'מקליטים אותם פרק פודקאסט שמספר את הסיפור של המקום מאז ועד היום' },
  { num: 4, icon: '/ICON-Location.png', text: 'משייכים לכם מחיר מיוחד מהסיור על הסיור אתם' },
]

function TourCard({ tour }) {
  const discounted = Math.round((tour.price || 120) * 0.9)
  return (
    <a href={'/tours/' + tour.id} className={styles.tourCard}>
      <div className={styles.tourImg}>
        <img src={tour.img} alt={tour.title} onError={e => e.target.style.display='none'} />
        <div className={styles.tourImgFade} />
        {tour.isNew && <span className={styles.tourBadge}>🎧 פרק חדש</span>}
        <div className={styles.tourBottom}>
          <h3 className={styles.tourTitle}>{tour.title}</h3>
          <div className={styles.tourMeta}>
            <span>📍 {tour.city}</span>
            <span>🕐 {tour.duration} שעות</span>
          </div>
          <div className={styles.tourPriceRow}>
            <span className={styles.tourPrice}>
              <s>{tour.price} ₪</s> <strong>{discounted} ₪</strong>
              <span className={styles.forMembers}>לחברי קהילה</span>
            </span>
            <span className={styles.tourCta}>גלו את {tour.title} ←</span>
          </div>
        </div>
      </div>
    </a>
  )
}

function GuideCard({ guide }) {
  return (
    <article className={styles.guideCard}>
      <div className={styles.guideImg}>
        <img src={guide.img} alt={guide.name} onError={e => e.target.style.display='none'} />
      </div>
      <div className={styles.guideBody}>
        <h3 className={styles.guideName}>{guide.name}</h3>
        <p className={styles.guideRegion}>📍 {guide.region}</p>
        <p className={styles.guideDesc}>{guide.desc}</p>
        <div className={styles.guideTags}>
          {guide.tags.map(t => <span key={t} className={styles.guideTag}>{t}</span>)}
        </div>
        <div className={styles.guideStats}>
          <span>🎧 {guide.episodes} פרקים</span>
          <span>🗺 {guide.tours} סיורים</span>
        </div>
        <a href={'/guides/' + guide.id} className={styles.guideBtn}>לפרופיל המלא ←</a>
      </div>
    </article>
  )
}

export default function Home({ tours }) {
  const { user, isLoaded } = useUser()
  const [isGuide, setIsGuide] = useState(false)
  const guidesRef = useRef(null)
  const [guideIdx, setGuideIdx] = useState(0)

  useEffect(function() {
    if (!isLoaded || !user) return
    fetch('/api/get-guide?clerk_id=' + user.id).then(r => r.json()).then(d => { if (d.found) setIsGuide(true) })
  }, [isLoaded, user])

  function scrollGuide(dir) {
    if (!guidesRef.current) return
    const w = guidesRef.current.offsetWidth
    guidesRef.current.scrollBy({ left: dir * w, behavior: 'smooth' })
    setGuideIdx(prev => Math.max(0, Math.min(STATIC_GUIDES.length - 1, prev + dir)))
  }

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
              {STATIC_TOURS.map(t => <TourCard key={t.id} tour={t} />)}
            </div>
          </div>
        </section>

        <section className={styles.guidesSection} id="guides">
          <div className={styles.container}>
            <h2 className={styles.sectionTitle}>פגשו את האנשים שמספרים את הסיפורים</h2>
            <div className={styles.guidesSliderWrap}>
              <button className={styles.guideArrow} onClick={() => scrollGuide(1)} aria-label="הקודם">›</button>
              <div className={styles.guidesSlider} ref={guidesRef}>
                {STATIC_GUIDES.map(g => <GuideCard key={g.id} guide={g} />)}
              </div>
              <button className={styles.guideArrow} onClick={() => scrollGuide(-1)} aria-label="הבא">‹</button>
            </div>
            <div className={styles.guidesDots}>
              {STATIC_GUIDES.map((_, i) => (
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
    const res = await fetch(`https://api.airtable.com/v0/${baseId}/tbltsGvfPLMAmJ764?pageSize=100`, { headers: { Authorization: `Bearer ${token}` } })
    const data = await res.json()
    const tours = (data.records || []).map(r => Object.assign({ id: r.id }, r.fields))
    const guides = [...new Set(tours.map(t => t.Guide_Name).filter(Boolean))].sort()
    return { props: { tours, guides } }
  } catch(e) { return { props: { tours: [], guides: [] } } }
}
