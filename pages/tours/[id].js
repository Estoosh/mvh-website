import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import Head from 'next/head'
import Link from 'next/link'
import Header from '../../components/Header'
import Footer from '../../components/Footer'

const BROWN = '#7E4821'
const CREAM = '#F7F1EA'

const TOUR_IMAGES = {
  'אפולוניה': '/Tour-Apolonia.jpg',
  'עיר דוד': '/Tour-Davidcity.jpg',
  'עין גדי': '/Tour-EinGedi.jpg',
  'ירושלים': '/Tour-Churches.jpg',
  'כנסיות': '/Tour-Churches.jpg',
  'צפת': '/Tour-Safed.jpg',
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

export default function TourPage({ tour, guideRecord, mapUrl }) {
  const { user, isLoaded } = useUser()
  const [guideName, setGuideName] = useState(null)
  const [isSignedUpForDiscount, setIsSignedUpForDiscount] = useState(false)
  const [isGuide, setIsGuide] = useState(false)
  const [relatedTours, setRelatedTours] = useState([])

  useEffect(function() {
    if (!tour) return
    fetch('/api/track-view', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ tour_id: tour.id, current_count: tour.View_Count || 0 }) })
    var periodsParam = (tour.Historical_Period || []).join('|')
    fetch('/api/related-tours?exclude_id=' + tour.id + '&cities=' + encodeURIComponent(tour.Cities_Tags || '') + '&guide_name=' + encodeURIComponent(tour.Guide_Name || '') + '&periods=' + encodeURIComponent(periodsParam))
      .then(r => r.json())
      .then(function(data) { setRelatedTours(data.tours || []) })
  }, [tour])

  useEffect(function() {
    if (!isLoaded || !user) return
    fetch('/api/get-guide?clerk_id=' + user.id + '&email=' + encodeURIComponent(user.emailAddresses?.[0]?.emailAddress || ''))
      .then(r => r.json())
      .then(function(data) { if (data.found) { setGuideName(data.guide.Guide_Name); setIsGuide(true) } })
    fetch('/api/get-signup?clerk_id=' + user.id)
      .then(r => r.json())
      .then(function(data) { if (data.found) setIsSignedUpForDiscount(true) })
  }, [isLoaded, user])

  if (!tour) return (
    <div style={{ fontFamily: 'Heebo, Arial, sans-serif', background: CREAM, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header /><main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><p style={{ color: '#6B6B6B' }}>הסיור לא נמצא</p></main><Footer />
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

  return (
    <div style={{ fontFamily: 'Heebo, Arial, sans-serif', background: CREAM, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Head>
        <title>{tour.Tour_Title} | מאז ועד היום</title>
        <meta name="description" content={tour.Tour_Teaser || ''} />
        <style>{`@media(max-width:768px){.tour-grid{grid-template-columns:1fr!important;}}`}</style>
      </Head>
      <Header />

      <main style={{ flex: 1, maxWidth: 1100, margin: '0 auto', padding: '32px 24px', width: '100%' }}>
        <div className="tour-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 24, alignItems: 'start' }}>

          {/* LEFT */}
          <div>
            <div style={{ borderRadius: 16, overflow: 'hidden', height: 360, background: '#1a0d06', marginBottom: 20, boxShadow: '0 8px 28px rgba(0,0,0,0.12)' }}>
              {tourImage
                ? <img src={tourImage} alt={tour.Tour_Title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} onError={e => e.target.style.display='none'} />
                : <div style={{ width: '100%', height: '100%', background: 'linear-gradient(150deg,#3a1a08,#1a0d06)' }} />
              }
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
              {tour.Cities_Tags && <span style={{ background: '#fff', border: '1px solid #EDE7DF', fontSize: 13, fontWeight: 700, padding: '5px 12px', borderRadius: 20, color: '#444' }}>📍 {tour.Cities_Tags}</span>}
              {tour.Duration_Hours && <span style={{ background: '#fff', border: '1px solid #EDE7DF', fontSize: 13, fontWeight: 700, padding: '5px 12px', borderRadius: 20, color: '#444' }}>🕐 {tour.Duration_Hours} שעות</span>}
              {isCollab && <span style={{ background: BROWN, color: '#fff', fontSize: 13, fontWeight: 700, padding: '5px 12px', borderRadius: 20 }}>🎙 פרק מאז ועד היום</span>}
            </div>
            <h1 style={{ fontSize: 'clamp(24px,3.5vw,38px)', fontWeight: 900, color: '#111', marginBottom: 12, letterSpacing: '-0.5px', lineHeight: 1.15 }}>{tour.Tour_Title}</h1>
            {tour.Tour_Teaser && <p style={{ fontSize: 17, color: '#555', lineHeight: 1.8, marginBottom: 18 }}>{tour.Tour_Teaser}</p>}
            {tour.Tour_Story && <p style={{ fontSize: 15, color: '#666', lineHeight: 1.9, whiteSpace: 'pre-line' }}>{tour.Tour_Story}</p>}
          </div>

          {/* RIGHT */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* price + CTA */}
            <div style={{ background: '#fff', borderRadius: 16, padding: 24, border: '1px solid #EDE7DF', boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
              <div style={{ marginBottom: 16 }}>
                {isCollab ? (
                  <><p style={{ fontSize: 13, color: '#6B6B6B', marginBottom: 4 }}>מחיר</p><p style={{ fontSize: 22, fontWeight: 900, color: '#22c55e' }}>ללא תשלום לחברי קהילה</p></>
                ) : hasDiscount ? (
                  <><p style={{ fontSize: 13, color: '#6B6B6B', marginBottom: 4 }}>מחיר לחברי קהילה</p>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                    <s style={{ color: '#B0A89E', fontSize: 15 }}>{fullPrice} ₪</s>
                    <span style={{ fontSize: 28, fontWeight: 900, color: BROWN }}>{discountedPrice} ₪</span>
                    <span style={{ fontSize: 11, color: '#22c55e', fontWeight: 700, background: '#dcfce7', padding: '2px 8px', borderRadius: 20 }}>10% הנחה</span>
                  </div></>
                ) : (
                  <><p style={{ fontSize: 13, color: '#6B6B6B', marginBottom: 4 }}>מחיר לאדם</p><span style={{ fontSize: 28, fontWeight: 900, color: '#111' }}>{fullPrice} ₪</span></>
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {!isOwnTour && waLink && (
                  <a href={waLink} target="_blank" rel="noopener noreferrer"
                    onClick={() => fetch('/api/increment-lead', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ tour_id: tour.id, current_count: tour.Lead_Count || 0 }) })}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, background: '#25D366', color: '#fff', padding: '14px', borderRadius: 10, fontSize: 16, fontWeight: 800, textDecoration: 'none', fontFamily: 'Heebo, Arial, sans-serif' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M3 21l1.65-4.95A8.95 8.95 0 0 1 3 12a9 9 0 1 1 9 9 8.95 8.95 0 0 1-4.05-.96L3 21z"/><path d="M8.5 9.5c0 3.5 2.5 6 6 6 .5 0 1-.4 1-1l-.3-1.2c-.1-.4-.5-.6-.9-.5l-1.3.4c-.7-.5-1.7-1.5-2.2-2.2l.4-1.3c.1-.4-.1-.8-.5-.9L9.5 8.5c-.6 0-1 .5-1 1z"/></svg>
                    שלחו וואטסאפ למדריך
                  </a>
                )}
                {!hasDiscount && !isOwnTour && !isCollab && (
                  <Link href="/discount" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: CREAM, color: BROWN, border: '1.5px solid #EDE7DF', padding: '12px', borderRadius: 10, fontSize: 14, fontWeight: 800, textDecoration: 'none', fontFamily: 'Heebo, Arial, sans-serif' }}>
                    הצטרפו לקהילה וקבלו 10% הנחה ←
                  </Link>
                )}
                {isOwnTour && (
                  <Link href={'/edit-tour/' + tour.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#111', color: '#fff', padding: '13px', borderRadius: 10, fontSize: 15, fontWeight: 800, textDecoration: 'none', fontFamily: 'Heebo, Arial, sans-serif' }}>
                    ✏️ ערוך סיור
                  </Link>
                )}
              </div>
              {hasDiscount && <p style={{ fontSize: 12, color: '#22c55e', fontWeight: 700, marginTop: 10 }}>✓ ההודעה תכלול מחיר עם 10% הנחה</p>}
            </div>

            {/* map */}
            {mapUrl && (
              <a href={mapsLink} target="_blank" rel="noopener noreferrer" style={{ display: 'block', borderRadius: 14, overflow: 'hidden', border: '1px solid #EDE7DF', boxShadow: '0 4px 12px rgba(0,0,0,0.07)', position: 'relative', cursor: 'pointer', textDecoration: 'none' }}>
                <img src={mapUrl} alt="מפה" style={{ width: '100%', display: 'block' }} />
                <div style={{ position: 'absolute', bottom: 8, left: 8, background: 'rgba(255,255,255,0.92)', borderRadius: 6, padding: '4px 10px', fontSize: 12, fontWeight: 700, color: BROWN, fontFamily: 'Heebo, Arial, sans-serif' }}>🗺 פתחו ב-Google Maps</div>
              </a>
            )}

            {/* guide */}
            {tour.Guide_Name && (
              <Link href={'/guides/' + (guideRecord?.id || '')} style={{ textDecoration: 'none' }}>
                <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #EDE7DF', boxShadow: '0 4px 12px rgba(0,0,0,0.06)', overflow: 'hidden', display: 'grid', gridTemplateColumns: '100px 1fr', cursor: 'pointer' }}>
                  <div style={{ background: '#1a0d06', minHeight: 120 }}>
                    {guidePhoto && <img src={guidePhoto} alt={tour.Guide_Name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} onError={e => e.target.style.display='none'} />}
                  </div>
                  <div style={{ padding: '14px' }}>
                    <p style={{ fontSize: 11, color: '#6B6B6B', marginBottom: 3, fontFamily: 'Heebo, Arial, sans-serif' }}>מורה הדרך</p>
                    <p style={{ fontSize: 16, fontWeight: 900, color: '#111', marginBottom: 4, fontFamily: 'Heebo, Arial, sans-serif' }}>{tour.Guide_Name}</p>
                    {guideRecord?.Guide_Region && <p style={{ fontSize: 12, color: '#6B6B6B', marginBottom: 6, fontFamily: 'Heebo, Arial, sans-serif' }}>📍 {guideRecord.Guide_Region}</p>}
                    {guideRecord?.Guide_Bio && <p style={{ fontSize: 12, color: '#555', lineHeight: 1.5, fontFamily: 'Heebo, Arial, sans-serif', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{guideRecord.Guide_Bio}</p>}
                    <p style={{ fontSize: 12, color: BROWN, fontWeight: 700, marginTop: 6, fontFamily: 'Heebo, Arial, sans-serif' }}>לפרופיל המלא ←</p>
                  </div>
                </div>
              </Link>
            )}
          </div>
        </div>

        {relatedTours.length > 0 && (
          <div style={{ paddingTop: 32, marginTop: 32, borderTop: '1px solid #EDE7DF' }}>
            <h2 style={{ fontSize: 22, fontWeight: 900, marginBottom: 20, letterSpacing: '-0.5px' }}>סיורים נוספים</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
              {relatedTours.map(function(t) {
                var thumb = (t.Tour_Images ? t.Tour_Images.split('|')[0] : null) || getTourImage(t)
                return (
                  <a key={t.id} href={'/tours/' + t.id} style={{ textDecoration: 'none', background: '#fff', borderRadius: 12, overflow: 'hidden', border: '1px solid #EDE7DF', display: 'block' }}>
                    <div style={{ height: 140, background: '#F7F1EA' }}>
                      {thumb && <img src={thumb} alt={t.Tour_Title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} onError={e => e.target.style.display='none'} />}
                    </div>
                    <div style={{ padding: 14 }}>
                      <p style={{ fontWeight: 800, fontSize: 15, marginBottom: 4, color: '#111' }}>{t.Tour_Title}</p>
                      <p style={{ fontSize: 12, color: '#6B6B6B' }}>{t.Cities_Tags} · {t.Guide_Name}</p>
                    </div>
                  </a>
                )
              })}
            </div>
          </div>
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

    const tourRes = await fetch(`https://api.airtable.com/v0/${baseId}/tbltsGvfPLMAmJ764/${params.id}`, { headers: { Authorization: `Bearer ${token}` } })
    if (!tourRes.ok) return { props: { tour: null, guideRecord: null, mapUrl: null } }
    const record = await tourRes.json()
    const tour = Object.assign({ id: record.id }, record.fields)

    let guideRecord = null
    if (tour.Guide_Name) {
      const gr = await fetch(`https://api.airtable.com/v0/${baseId}/tblsJ5Ok1yPSgtvSj?filterByFormula={Guide_Name}="${tour.Guide_Name}"`, { headers: { Authorization: `Bearer ${token}` } })
      const gd = await gr.json()
      if (gd.records && gd.records.length > 0) guideRecord = Object.assign({ id: gd.records[0].id }, gd.records[0].fields)
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
