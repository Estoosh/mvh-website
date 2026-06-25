import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import Head from 'next/head'
import Link from 'next/link'
import Header from '../../components/Header'
import Footer from '../../components/Footer'

const BROWN = '#7E4821'
const CREAM = '#F7F1EA'

const TOUR_IMAGES = {
  'אפולוניה': '/Tours-Apolonia.jpg',
  'עיר דוד': '/Tours-DavidCity.jpg',
  'עין גדי': '/Tours-EinGedi.jpg',
  'ירושלים': '/Tours-Churches.jpg',
  'כנסיות': '/Tours-JLM-Church.jpg',
  'צפת': '/Tours-Safed.jpg',
}

function getTourImage(tour) {
  const title = tour.Tour_Title || ''
  const city = tour.Cities_Tags || ''
  for (const [key, val] of Object.entries(TOUR_IMAGES)) {
    if (title.includes(key) || city.includes(key)) return val
  }
  return null
}

const GUIDE_IMAGES = {
  'חגי': '/guide-hagai.jpg',
  'דניאל': '/guide-daniel.jpg',
  'אביתר': '/guide-avyatar.jpg',
  'יונתן': '/guide-yonatan.jpg',
  'יוסי': '/guide-yossi.jpg',
}

function getGuideImage(name) {
  if (!name) return null
  for (const [key, val] of Object.entries(GUIDE_IMAGES)) {
    if (name.includes(key)) return val
  }
  return null
}

function InfoBox({ label, value }) {
  return (
    <div style={{ background: '#FBF7F1', border: '1px solid #EDE7DF', borderRadius: 14, padding: 16 }}>
      <p style={{ fontSize: 12, color: '#6B6B6B', fontWeight: 700, margin: '0 0 6px' }}>{label}</p>
      <p style={{ fontSize: 15, color: '#2a2a2a', fontWeight: 600, margin: 0, lineHeight: 1.5 }}>{value}</p>
    </div>
  )
}

export default function TourPage({ tour, guideRecord, mapUrl }) {
  const { user, isLoaded } = useUser()
  const [guideName, setGuideName] = useState(null)
  const [isSignedUpForDiscount, setIsSignedUpForDiscount] = useState(false)
  const [isGuide, setIsGuide] = useState(false)
  const [relatedTours, setRelatedTours] = useState([])
  const [copied, setCopied] = useState(false)
  const [interested, setInterested] = useState(false)

  useEffect(function() {
    if (!tour) return
    fetch('/api/track-view', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tour_id: tour.id, current_count: tour.View_Count || 0 })
    })
    var periodsParam = Array.isArray(tour.Historical_Period) ? tour.Historical_Period.join('|') : ''
    fetch('/api/related-tours?exclude_id=' + tour.id + '&cities=' + encodeURIComponent(tour.Cities_Tags || '') + '&guide_name=' + encodeURIComponent(tour.Guide_Name || '') + '&periods=' + encodeURIComponent(periodsParam))
      .then(r => r.json())
      .then(function(data) { setRelatedTours(data.tours || []) })
    try {
      const saved = JSON.parse(localStorage.getItem('mvh_interested_tours') || '[]')
      if (saved.find(function(t) { return t.id === tour.id })) setInterested(true)
    } catch(e) {}
  }, [tour])

  useEffect(function() {
    if (!isLoaded || !user) return
    fetch('/api/get-guide?clerk_id=' + user.id + '&email=' + encodeURIComponent(user.emailAddresses?.[0]?.emailAddress || ''))
      .then(r => r.json())
      .then(function(data) {
        if (data.found) { setGuideName(data.guide.Guide_Name); setIsGuide(true) }
      })
    fetch('/api/get-signup?clerk_id=' + user.id)
      .then(r => r.json())
      .then(function(data) { if (data.found) setIsSignedUpForDiscount(true) })
  }, [isLoaded, user])

  if (!tour) return (
    <div style={{ fontFamily: 'Heebo, Arial, sans-serif', background: CREAM, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#6B6B6B' }}>הסיור לא נמצא</p>
      </main>
      <Footer />
    </div>
  )

  const phone = tour.WhatsApp_Number ? tour.WhatsApp_Number.replace(/\D/g, '').replace(/^0/, '') : ''
  const guideFirstName = tour.Guide_Name ? tour.Guide_Name.split(' ')[0] : ''
  const fullPrice = Number(tour.Price_Per_Person) || 0
  const discountedPrice = Math.round(fullPrice * 0.9)
  const isOwnTour = guideName && guideName === tour.Guide_Name
  const hasDiscount = (isSignedUpForDiscount || isGuide) && !isOwnTour
  const isCollab = tour.Tour_Status === 'collab'
  const tourImage = getTourImage(tour)
  const guidePhoto = guideRecord?.Guide_Photo || getGuideImage(tour.Guide_Name)

  const waText = hasDiscount
    ? 'היי ' + guideFirstName + '! ראיתי את הסיור "' + tour.Tour_Title + '" באתר מאז ועד היום. אשמח להצטרף במחיר לחברי קהילה — ' + discountedPrice + ' ש"ח. שנבדוק מועדים?'
    : 'היי ' + guideFirstName + '! ראיתי את הסיור "' + tour.Tour_Title + '" באתר מאז ועד היום. אשמח לשמוע פרטים ולבדוק מועדים.'
  const waLink = phone ? 'https://wa.me/972' + phone + '?text=' + encodeURIComponent(waText) : null
  const mapsLink = mapUrl
    ? 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent((tour.Meeting_Point_Waze || tour.Cities_Tags || '') + ', ישראל')
    : null
  const storyParagraphs = tour.Tour_Story
    ? tour.Tour_Story.split('\n').map(p => p.trim()).filter(Boolean)
    : []

  const shareTour = async function() {
    const url = typeof window !== 'undefined' ? window.location.href : ''
    const text = tour.Tour_Title + ' | מאז ועד היום'
    try {
      if (navigator.share) {
        await navigator.share({ title: text, text: tour.Tour_Teaser || text, url })
      } else {
        await navigator.clipboard.writeText(url)
        setCopied(true)
        setTimeout(() => setCopied(false), 1800)
      }
    } catch(e) {}
  }

  const saveTour = function() {
    try {
      const saved = JSON.parse(localStorage.getItem('mvh_interested_tours') || '[]')
      if (!saved.find(function(t) { return t.id === tour.id })) {
        saved.push({
          id: tour.id,
          Tour_Title: tour.Tour_Title,
          Tour_Teaser: tour.Tour_Teaser,
          Cities_Tags: tour.Cities_Tags,
          Guide_Name: tour.Guide_Name,
          tourImage: tourImage,
          savedAt: new Date().toISOString()
        })
        localStorage.setItem('mvh_interested_tours', JSON.stringify(saved))
      }
      setInterested(true)
    } catch(e) {}
  }

  return (
    <div style={{ fontFamily: 'Heebo, Arial, sans-serif', background: CREAM, minHeight: '100vh', display: 'flex', flexDirection: 'column', color: '#111' }}>
      <Head>
        <title>{tour.Tour_Title} | מאז ועד היום</title>
        <meta name="description" content={tour.Tour_Teaser || ''} />
        <style>{`
          @media(max-width:900px){
            .tour-shell{padding:24px 18px!important}
            .tour-hero{grid-template-columns:1fr!important}
            .tour-main{grid-template-columns:1fr!important}
            .guide-section{grid-template-columns:1fr!important}
            .sticky-card{position:static!important}
          }
        `}</style>
      </Head>

      <Header />

      <main className="tour-shell" style={{ flex: 1, maxWidth: 1180, margin: '0 auto', padding: '40px 24px 56px', width: '100%' }}>
        <Link href="/" style={{ display: 'inline-flex', color: BROWN, fontSize: 13, fontWeight: 700, textDecoration: 'none', marginBottom: 22 }}>
          ← כל הסיורים
        </Link>

        {/* HERO */}
        <section className="tour-hero" style={{ display: 'grid', gridTemplateColumns: '1.08fr 0.92fr', gap: 34, alignItems: 'center', marginBottom: 34 }}>
          <div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
              {tour.Cities_Tags && <span style={{ background: '#fff', border: '1px solid #EDE7DF', fontSize: 12, fontWeight: 700, padding: '5px 12px', borderRadius: 20, color: '#555' }}>📍 {tour.Cities_Tags}</span>}
              {tour.Duration_Hours && <span style={{ background: '#fff', border: '1px solid #EDE7DF', fontSize: 12, fontWeight: 700, padding: '5px 12px', borderRadius: 20, color: '#555' }}>{tour.Duration_Hours} שעות</span>}
              {Array.isArray(tour.Historical_Period) && tour.Historical_Period.slice(0, 2).map(p => (
                <span key={p} style={{ background: '#fff', border: '1px solid #EDE7DF', fontSize: 12, fontWeight: 700, padding: '5px 12px', borderRadius: 20, color: '#555' }}>{p}</span>
              ))}
              {isCollab && <span style={{ background: BROWN, color: '#fff', fontSize: 12, fontWeight: 700, padding: '5px 12px', borderRadius: 20 }}>🎙 פרק מאז ועד היום</span>}
            </div>

            <h1 style={{ fontSize: 'clamp(20px,2.8vw,30px)', fontWeight: 700, color: '#1a1a1a', margin: '0 0 14px', letterSpacing: '-0.3px', lineHeight: 1.25 }}>
              {tour.Tour_Title}
            </h1>

            {tour.Tour_Teaser && (
              <p style={{ fontSize: 17, color: '#555', lineHeight: 1.75, margin: '0 0 22px' }}>
                {tour.Tour_Teaser}
              </p>
            )}

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
              {!isOwnTour && waLink && (
                <a href={waLink} target="_blank" rel="noopener noreferrer"
                  onClick={() => fetch('/api/increment-lead', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ tour_id: tour.id, current_count: tour.Lead_Count || 0 })
                  })}
                  style={{ background: '#25D366', color: '#fff', padding: '12px 20px', borderRadius: 999, fontSize: 15, fontWeight: 800, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8, fontFamily: 'Heebo, Arial, sans-serif' }}>
                  שלחו וואטסאפ למדריך
                </a>
              )}
              <button onClick={shareTour} style={{ background: '#fff', color: BROWN, border: '1px solid #EDE7DF', padding: '12px 18px', borderRadius: 999, fontSize: 14, fontWeight: 700, fontFamily: 'Heebo, Arial, sans-serif', cursor: 'pointer' }}>
                {copied ? 'הקישור הועתק ✓' : 'שלחו למי שיבוא איתכם'}
              </button>
              <button onClick={saveTour} style={{ background: interested ? '#FBF7F1' : '#fff', color: interested ? BROWN : BROWN, border: '1px solid #EDE7DF', padding: '12px 18px', borderRadius: 999, fontSize: 14, fontWeight: 700, fontFamily: 'Heebo, Arial, sans-serif', cursor: 'pointer' }}>
                {interested ? '✓ נשמר' : '❤️ זה מעניין אותי'}
              </button>
            </div>
          </div>

          <div style={{ borderRadius: 20, overflow: 'hidden', height: 400, background: '#e8e0d8', boxShadow: '0 12px 40px rgba(0,0,0,0.12)' }}>
            {tourImage
              ? <img src={tourImage} alt={tour.Tour_Title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} onError={e => e.target.style.display='none'} />
              : <div style={{ width: '100%', height: '100%', background: 'linear-gradient(150deg,#d4c5b0,#c2b09a)' }} />
            }
          </div>
        </section>

        {/* MAIN GRID */}
        <section className="tour-main" style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 28, alignItems: 'start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* why go */}
            <div style={{ background: '#fff', border: '1px solid #EDE7DF', borderRadius: 18, padding: '24px 26px' }}>
              <p style={{ color: BROWN, fontSize: 12, fontWeight: 700, marginBottom: 8, letterSpacing: '0.5px', textTransform: 'uppercase' }}>למה לצאת דווקא לשם</p>
              <p style={{ fontSize: 16, color: '#555', lineHeight: 1.85, margin: 0 }}>
                אפשר להגיע לבד, להסתכל ימינה ושמאלה ולהמשיך הלאה. אפשר גם להגיע עם אדם שמכיר את המקום, יודע איפה לעצור, מה לחבר למה, ואיך להפוך כמה שעות לסיפור שיישאר איתכם אחרי שתחזרו הביתה.
              </p>
            </div>

            {/* story */}
            {storyParagraphs.length > 0 && (
              <div style={{ background: '#fff', border: '1px solid #EDE7DF', borderRadius: 18, padding: '24px 26px' }}>
                <p style={{ color: BROWN, fontSize: 12, fontWeight: 700, marginBottom: 14, letterSpacing: '0.5px', textTransform: 'uppercase' }}>הסיפור של הסיור</p>
                {storyParagraphs.map((p, i) => (
                  <p key={i} style={{ fontSize: 16, color: '#555', lineHeight: 1.9, margin: i === storyParagraphs.length - 1 ? 0 : '0 0 14px' }}>{p}</p>
                ))}
              </div>
            )}

            {/* guide */}
            {tour.Guide_Name && (
              <div style={{ background: '#fff', border: '1px solid #EDE7DF', borderRadius: 18, overflow: 'hidden' }}>
                <div className="guide-section" style={{ display: 'grid', gridTemplateColumns: '150px 1fr', minHeight: 190 }}>
                  <div style={{ background: '#e8e0d8' }}>
                    {guidePhoto && <img src={guidePhoto} alt={tour.Guide_Name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} onError={e => e.target.style.display='none'} />}
                  </div>
                  <div style={{ padding: '22px 22px' }}>
                    <p style={{ color: BROWN, fontSize: 12, fontWeight: 700, marginBottom: 6, letterSpacing: '0.5px', textTransform: 'uppercase' }}>מי יוביל אתכם</p>
                    <p style={{ fontSize: 18, fontWeight: 700, color: '#1a1a1a', margin: '0 0 4px' }}>{tour.Guide_Name}</p>
                    {guideRecord?.Guide_Title && <p style={{ fontSize: 13, color: '#6B6B6B', margin: '0 0 10px', fontWeight: 600 }}>{guideRecord.Guide_Title}</p>}
                    {guideRecord?.Guide_Bio && <p style={{ fontSize: 14, color: '#555', lineHeight: 1.75, margin: '0 0 14px' }}>{guideRecord.Guide_Bio}</p>}
                    {guideRecord?.id && (
                      <Link href={'/guides/' + guideRecord.id} style={{ color: BROWN, fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>
                        הכירו את המדריך ←
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* details */}
            <div style={{ background: '#fff', border: '1px solid #EDE7DF', borderRadius: 18, padding: '24px 26px' }}>
              <p style={{ color: BROWN, fontSize: 12, fontWeight: 700, marginBottom: 16, letterSpacing: '0.5px', textTransform: 'uppercase' }}>פרטי הסיור</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
                {tour.Duration_Hours && <InfoBox label="משך" value={tour.Duration_Hours + ' שעות'} />}
                {tour.Cities_Tags && <InfoBox label="אזור" value={tour.Cities_Tags} />}
                {tour.Meeting_Point_Waze && <InfoBox label="נקודת מפגש" value={tour.Meeting_Point_Waze} />}
                {Array.isArray(tour.Historical_Period) && tour.Historical_Period.length > 0 && <InfoBox label="תקופה" value={tour.Historical_Period.join(', ')} />}
              </div>
            </div>
          </div>

          {/* SIDEBAR */}
          <aside className="sticky-card" style={{ position: 'sticky', top: 88, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ background: '#fff', borderRadius: 18, padding: 22, border: '1px solid #EDE7DF', boxShadow: '0 8px 28px rgba(0,0,0,0.07)' }}>
              <p style={{ fontSize: 12, color: '#6B6B6B', marginBottom: 6, fontWeight: 600 }}>מחיר לאדם</p>

              {hasDiscount ? (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 2 }}>
                    <s style={{ color: '#C0B8AE', fontSize: 14 }}>{fullPrice} ₪</s>
                    <span style={{ fontSize: 26, fontWeight: 800, color: BROWN }}>{discountedPrice} ₪</span>
                    <span style={{ fontSize: 11, color: '#22c55e', fontWeight: 700, background: '#f0fdf4', padding: '2px 7px', borderRadius: 16 }}>10% הנחה</span>
                  </div>
                  <p style={{ fontSize: 12, color: '#6B6B6B' }}>מחיר לחברי קהילה</p>
                </div>
              ) : (
                <div style={{ marginBottom: 16 }}>
                  <span style={{ fontSize: 26, fontWeight: 800, color: '#1a1a1a' }}>{fullPrice} ₪</span>
                </div>
              )}

              {!isOwnTour && waLink && (
                <a href={waLink} target="_blank" rel="noopener noreferrer"
                  onClick={() => fetch('/api/increment-lead', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ tour_id: tour.id, current_count: tour.Lead_Count || 0 })
                  })}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#25D366', color: '#fff', padding: '13px', borderRadius: 10, fontSize: 15, fontWeight: 800, textDecoration: 'none', fontFamily: 'Heebo, Arial, sans-serif', marginBottom: 10 }}>
                  דברו עם המדריך בוואטסאפ
                </a>
              )}

              {!hasDiscount && !isOwnTour && (
                <Link href="/discount" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: CREAM, color: BROWN, border: '1.5px solid #EDE7DF', padding: '11px', borderRadius: 10, fontSize: 13, fontWeight: 700, textDecoration: 'none', fontFamily: 'Heebo, Arial, sans-serif', marginBottom: 10 }}>
                  הצטרפו לקהילה וקבלו 10% הנחה
                </Link>
              )}

              {isOwnTour && (
                <Link href={'/edit-tour/' + tour.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#111', color: '#fff', padding: '12px', borderRadius: 10, fontSize: 14, fontWeight: 700, textDecoration: 'none', fontFamily: 'Heebo, Arial, sans-serif' }}>
                  ✏️ ערוך סיור
                </Link>
              )}

              <p style={{ fontSize: 12, color: '#6B6B6B', lineHeight: 1.6, margin: '12px 0 0' }}>
                אין צורך להחליט לבד על כל הפרטים. שלחו הודעה, בדקו זמינות, ותנו למדריך לעזור לכם.
              </p>
            </div>

            {mapUrl && mapsLink && (
              <a href={mapsLink} target="_blank" rel="noopener noreferrer" style={{ display: 'block', borderRadius: 14, overflow: 'hidden', border: '1px solid #EDE7DF', position: 'relative', cursor: 'pointer', textDecoration: 'none' }}>
                <img src={mapUrl} alt="מפה" style={{ width: '100%', display: 'block' }} />
                <div style={{ position: 'absolute', bottom: 8, left: 8, background: 'rgba(255,255,255,0.93)', borderRadius: 6, padding: '4px 10px', fontSize: 11, fontWeight: 700, color: BROWN, fontFamily: 'Heebo, Arial, sans-serif' }}>
                  פתחו ב-Google Maps
                </div>
              </a>
            )}
          </aside>
        </section>

        {/* RELATED */}
        {relatedTours.length > 0 && (
          <section style={{ paddingTop: 40, marginTop: 40, borderTop: '1px solid #EDE7DF' }}>
            <p style={{ color: BROWN, fontSize: 12, fontWeight: 700, marginBottom: 6, letterSpacing: '0.5px', textTransform: 'uppercase' }}>עוד רעיונות להמשך</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16, marginTop: 16 }}>
              {relatedTours.map(function(t) {
                var thumb = (t.Tour_Images ? t.Tour_Images.split('|')[0] : null) || getTourImage(t)
                return (
                  <a key={t.id} href={'/tours/' + t.id} style={{ textDecoration: 'none', background: '#fff', borderRadius: 14, overflow: 'hidden', border: '1px solid #EDE7DF', display: 'block' }}>
                    <div style={{ height: 140, background: '#F0EAE2' }}>
                      {thumb && <img src={thumb} alt={t.Tour_Title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} onError={e => e.target.style.display='none'} />}
                    </div>
                    <div style={{ padding: 14 }}>
                      <p style={{ fontWeight: 700, fontSize: 15, marginBottom: 4, color: '#1a1a1a' }}>{t.Tour_Title}</p>
                      <p style={{ fontSize: 12, color: '#6B6B6B', margin: 0 }}>{t.Cities_Tags} · {t.Guide_Name}</p>
                    </div>
                  </a>
                )
              })}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  )
}

export async function getServerSideProps({ params }) {
  try {
    const token = process.env.AIRTABLE_TOKEN
    const baseId = process.env.AIRTABLE_BASE_ID
    const mapsKey = process.env.GOOGLE_MAPS_API_KEY

    const tourRes = await fetch(`https://api.airtable.com/v0/${baseId}/tbltsGvfPLMAmJ764/${params.id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    if (!tourRes.ok) return { props: { tour: null, guideRecord: null, mapUrl: null } }
    const record = await tourRes.json()
    const tour = Object.assign({ id: record.id }, record.fields)

    let guideRecord = null
    if (tour.Guide_Name) {
      const gr = await fetch(`https://api.airtable.com/v0/${baseId}/tblsJ5Ok1yPSgtvSj?filterByFormula={Guide_Name}="${tour.Guide_Name}"`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const gd = await gr.json()
      if (gd.records && gd.records.length > 0) {
        guideRecord = Object.assign({ id: gd.records[0].id }, gd.records[0].fields)
      }
    }

    let mapUrl = null
    const location = tour.Meeting_Point_Waze || tour.Cities_Tags || ''
    if (location && mapsKey) {
      try {
        const geoRes = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(location + ', ישראל')}&key=${mapsKey}&language=he&region=IL`)
        const geoData = await geoRes.json()
        if (geoData.results && geoData.results.length > 0) {
          const { lat, lng } = geoData.results[0].geometry.location
          mapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=8&size=360x240&scale=2&maptype=roadmap&style=element:geometry|color:0xf5f5f5&style=element:labels.icon|visibility:off&style=element:labels.text.fill|color:0x616161&style=feature:poi|element:geometry|color:0xeeeeee&style=feature:road|element:geometry|color:0xffffff&style=feature:road.highway|element:geometry|color:0xdadada&style=feature:water|element:geometry|color:0xc9c9c9&markers=color:0x7E4821|size:mid|${lat},${lng}&key=${mapsKey}`
        }
      } catch(e) {}
    }

    return { props: { tour, guideRecord, mapUrl } }
  } catch(e) {
    return { props: { tour: null, guideRecord: null, mapUrl: null } }
  }
}
