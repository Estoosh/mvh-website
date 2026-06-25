
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
<p style={{ fontSize: 12, color: '#6B6B6B', fontWeight: 800, margin: '0 0 6px' }}>{label}</p>
<p style={{ fontSize: 15, color: '#111', fontWeight: 900, margin: 0, lineHeight: 1.5 }}>{value}</p> </div>
)
}

export default function TourPage({ tour, guideRecord, mapUrl }) {
const { user, isLoaded } = useUser()
const [guideName, setGuideName] = useState(null)
const [isSignedUpForDiscount, setIsSignedUpForDiscount] = useState(false)
const [isGuide, setIsGuide] = useState(false)
const [relatedTours, setRelatedTours] = useState([])
const [copied, setCopied] = useState(false)

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
  .then(function(data) {
    setRelatedTours(data.tours || [])
  })


}, [tour])

useEffect(function() {
if (!isLoaded || !user) return


fetch('/api/get-guide?clerk_id=' + user.id + '&email=' + encodeURIComponent(user.emailAddresses?.[0]?.emailAddress || ''))
  .then(r => r.json())
  .then(function(data) {
    if (data.found) {
      setGuideName(data.guide.Guide_Name)
      setIsGuide(true)
    }
  })

fetch('/api/get-signup?clerk_id=' + user.id)
  .then(r => r.json())
  .then(function(data) {
    if (data.found) setIsSignedUpForDiscount(true)
  })


}, [isLoaded, user])

if (!tour) return (
<div style={{ fontFamily: 'Heebo, Arial, sans-serif', background: CREAM, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}> <Header />
<main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
<p style={{ color: '#6B6B6B' }}>הסיור לא נמצא</p> </main> <Footer /> </div>
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

const waLink = phone ? '[https://wa.me/972](https://wa.me/972)' + phone + '?text=' + encodeURIComponent(waText) : null

const mapsLink = mapUrl
? '[https://www.google.com/maps/search/?api=1&query=](https://www.google.com/maps/search/?api=1&query=)' + encodeURIComponent((tour.Meeting_Point_Waze || tour.Cities_Tags || '') + ', ישראל')
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

return (
<div style={{ fontFamily: 'Heebo, Arial, sans-serif', background: CREAM, minHeight: '100vh', display: 'flex', flexDirection: 'column', color: '#111' }}> <Head> <title>{tour.Tour_Title} | מאז ועד היום</title>
<meta name="description" content={tour.Tour_Teaser || ''} /> <style>{`           @media(max-width:900px){
            .tour-shell{padding:24px 18px!important}
            .tour-hero{grid-template-columns:1fr!important}
            .tour-main{grid-template-columns:1fr!important}
            .guide-section{grid-template-columns:1fr!important}
            .sticky-card{position:static!important}
          }
        `}</style> </Head>


  <Header />

  <main className="tour-shell" style={{ flex: 1, maxWidth: 1180, margin: '0 auto', padding: '40px 24px 56px', width: '100%' }}>
    <Link href="/tours" style={{ display: 'inline-flex', color: BROWN, fontSize: 14, fontWeight: 800, textDecoration: 'none', marginBottom: 22 }}>
      ← חזרה לכל הסיורים
    </Link>

    <section className="tour-hero" style={{ display: 'grid', gridTemplateColumns: '1.08fr 0.92fr', gap: 34, alignItems: 'center', marginBottom: 34 }}>
      <div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
          {tour.Cities_Tags && <span style={{ background: '#fff', border: '1px solid #EDE7DF', fontSize: 13, fontWeight: 800, padding: '6px 13px', borderRadius: 20, color: '#444' }}>📍 {tour.Cities_Tags}</span>}
          {tour.Duration_Hours && <span style={{ background: '#fff', border: '1px solid #EDE7DF', fontSize: 13, fontWeight: 800, padding: '6px 13px', borderRadius: 20, color: '#444' }}>{tour.Duration_Hours} שעות</span>}
          {Array.isArray(tour.Historical_Period) && tour.Historical_Period.slice(0, 2).map(p => (
            <span key={p} style={{ background: '#fff', border: '1px solid #EDE7DF', fontSize: 13, fontWeight: 800, padding: '6px 13px', borderRadius: 20, color: '#444' }}>{p}</span>
          ))}
          {isCollab && <span style={{ background: BROWN, color: '#fff', fontSize: 13, fontWeight: 800, padding: '6px 13px', borderRadius: 20 }}>🎙 פרק מאז ועד היום</span>}
        </div>

        <h1 style={{ fontSize: 'clamp(20px,2.8vw,28px)', fontWeight: 700, color: '#2a2a2a', margin: '0 0 18px', letterSpacing: '-0.3px', lineHeight: 1.2 }}>
          {tour.Tour_Title}
        </h1>

        {tour.Tour_Teaser && (
          <p style={{ fontSize: 20, color: '#3F3F3F', lineHeight: 1.7, margin: '0 0 24px', maxWidth: 640 }}>
            {tour.Tour_Teaser}
          </p>
        )}

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          {!isOwnTour && waLink && (
            <a href={waLink} target="_blank" rel="noopener noreferrer"
              onClick={() => fetch('/api/increment-lead', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tour_id: tour.id, current_count: tour.Lead_Count || 0 })
              })}
              style={{ background: '#25D366', color: '#fff', padding: '14px 22px', borderRadius: 999, fontSize: 16, fontWeight: 900, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              שלחו וואטסאפ למדריך
            </a>
          )}

          <button onClick={shareTour} style={{ background: '#fff', color: BROWN, border: '1px solid #EDE7DF', padding: '14px 20px', borderRadius: 999, fontSize: 15, fontWeight: 900, fontFamily: 'Heebo, Arial, sans-serif', cursor: 'pointer' }}>
            {copied ? 'הקישור הועתק' : 'שלחו למי שיבוא איתכם'}
          </button>
        </div>
      </div>

      <div style={{ borderRadius: 24, overflow: 'hidden', height: 430, background: '#1a0d06', boxShadow: '0 18px 50px rgba(0,0,0,0.16)' }}>
        {tourImage
          ? <img src={tourImage} alt={tour.Tour_Title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} onError={e => e.target.style.display='none'} />
          : <div style={{ width: '100%', height: '100%', background: 'linear-gradient(150deg,#3a1a08,#1a0d06)' }} />
        }
      </div>
    </section>

    <section className="tour-main" style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 28, alignItems: 'start' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
        <section style={{ background: '#fff', border: '1px solid #EDE7DF', borderRadius: 22, padding: 28, boxShadow: '0 8px 26px rgba(0,0,0,0.05)' }}>
          <p style={{ color: BROWN, fontSize: 13, fontWeight: 900, marginBottom: 8 }}>למה לצאת דווקא לשם</p>
          <h2 style={{ fontSize: 28, fontWeight: 950, margin: '0 0 14px', letterSpacing: '-0.6px' }}>לא עוד ביקור במקום. דרך להבין אותו.</h2>
          <p style={{ fontSize: 17, color: '#555', lineHeight: 1.85, margin: 0 }}>
            אפשר להגיע לבד, להסתכל ימינה ושמאלה ולהמשיך הלאה. אפשר גם להגיע עם אדם שמכיר את המקום, יודע איפה לעצור, מה לחבר למה, ואיך להפוך כמה שעות לסיפור שיישאר איתכם אחרי שתחזרו הביתה.
          </p>
        </section>

        {storyParagraphs.length > 0 && (
          <section style={{ background: '#fff', border: '1px solid #EDE7DF', borderRadius: 22, padding: 28, boxShadow: '0 8px 26px rgba(0,0,0,0.05)' }}>
            <p style={{ color: BROWN, fontSize: 13, fontWeight: 900, marginBottom: 8 }}>הסיפור של הסיור</p>
            <h2 style={{ fontSize: 26, fontWeight: 950, margin: '0 0 18px', letterSpacing: '-0.6px' }}>מה תגלו בדרך</h2>
            {storyParagraphs.map((p, i) => (
              <p key={i} style={{ fontSize: 16.5, color: '#555', lineHeight: 1.95, margin: i === storyParagraphs.length - 1 ? 0 : '0 0 14px' }}>
                {p}
              </p>
            ))}
          </section>
        )}

        {tour.Guide_Name && (
          <section style={{ background: '#fff', border: '1px solid #EDE7DF', borderRadius: 22, overflow: 'hidden', boxShadow: '0 8px 26px rgba(0,0,0,0.05)' }}>
            <div className="guide-section" style={{ display: 'grid', gridTemplateColumns: '170px 1fr', minHeight: 210 }}>
              <div style={{ background: '#1a0d06' }}>
                {guidePhoto && <img src={guidePhoto} alt={tour.Guide_Name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} onError={e => e.target.style.display='none'} />}
              </div>
              <div style={{ padding: 26 }}>
                <p style={{ color: BROWN, fontSize: 13, fontWeight: 900, marginBottom: 8 }}>מי יוביל אתכם</p>
                <h2 style={{ fontSize: 28, fontWeight: 950, margin: '0 0 6px', letterSpacing: '-0.6px' }}>{tour.Guide_Name}</h2>
                {guideRecord?.Guide_Title && <p style={{ fontSize: 15, color: '#6B6B6B', margin: '0 0 10px', fontWeight: 800 }}>{guideRecord.Guide_Title}</p>}
                {guideRecord?.Guide_Bio && <p style={{ fontSize: 15.5, color: '#555', lineHeight: 1.8, margin: '0 0 14px' }}>{guideRecord.Guide_Bio}</p>}
                {guideRecord?.id && (
                  <Link href={'/guides/' + guideRecord.id} style={{ color: BROWN, fontWeight: 900, fontSize: 15, textDecoration: 'none' }}>
                    הכירו את המדריך →
                  </Link>
                )}
              </div>
            </div>
          </section>
        )}

        <section style={{ background: '#fff', border: '1px solid #EDE7DF', borderRadius: 22, padding: 28, boxShadow: '0 8px 26px rgba(0,0,0,0.05)' }}>
          <p style={{ color: BROWN, fontSize: 13, fontWeight: 900, marginBottom: 8 }}>הפרטים הקטנים</p>
          <h2 style={{ fontSize: 26, fontWeight: 950, margin: '0 0 18px', letterSpacing: '-0.6px' }}>כדי שיהיה קל להחליט</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
            {tour.Duration_Hours && <InfoBox label="משך הסיור" value={tour.Duration_Hours + ' שעות'} />}
            {tour.Cities_Tags && <InfoBox label="אזור" value={tour.Cities_Tags} />}
            {tour.Meeting_Point_Waze && <InfoBox label="נקודת מפגש" value={tour.Meeting_Point_Waze} />}
            {Array.isArray(tour.Historical_Period) && tour.Historical_Period.length > 0 && <InfoBox label="תקופה" value={tour.Historical_Period.join(', ')} />}
          </div>
        </section>
      </div>

      <aside className="sticky-card" style={{ position: 'sticky', top: 96, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ background: '#fff', borderRadius: 22, padding: 24, border: '1px solid #EDE7DF', boxShadow: '0 12px 34px rgba(0,0,0,0.08)' }}>
          <p style={{ fontSize: 13, color: '#6B6B6B', marginBottom: 6, fontWeight: 800 }}>החוויה הזו מחכה לכם</p>

          {hasDiscount ? (
            <div style={{ marginBottom: 16 }}>
              <p style={{ fontSize: 13, color: '#6B6B6B', marginBottom: 4 }}>מחיר לחברי קהילה</p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                <s style={{ color: '#B0A89E', fontSize: 15 }}>{fullPrice} ₪</s>
                <span style={{ fontSize: 30, fontWeight: 950, color: BROWN }}>{discountedPrice} ₪</span>
                <span style={{ fontSize: 11, color: '#22c55e', fontWeight: 800, background: '#dcfce7', padding: '2px 8px', borderRadius: 20 }}>10%</span>
              </div>
            </div>
          ) : (
            <div style={{ marginBottom: 16 }}>
              <p style={{ fontSize: 13, color: '#6B6B6B', marginBottom: 4 }}>מחיר לאדם</p>
              <span style={{ fontSize: 30, fontWeight: 950, color: '#111' }}>{fullPrice} ₪</span>
            </div>
          )}

          {!isOwnTour && waLink && (
            <a href={waLink} target="_blank" rel="noopener noreferrer"
              onClick={() => fetch('/api/increment-lead', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tour_id: tour.id, current_count: tour.Lead_Count || 0 })
              })}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#25D366', color: '#fff', padding: '15px', borderRadius: 12, fontSize: 16, fontWeight: 900, textDecoration: 'none' }}>
              דברו עם המדריך בוואטסאפ
            </a>
          )}

          {!hasDiscount && !isOwnTour && !isCollab && (
            <Link href="/discount" style={{ marginTop: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', background: CREAM, color: BROWN, border: '1.5px solid #EDE7DF', padding: '12px', borderRadius: 12, fontSize: 14, fontWeight: 900, textDecoration: 'none' }}>
              הצטרפו לקהילה וקבלו 10% הנחה
            </Link>
          )}

          {isOwnTour && (
            <Link href={'/edit-tour/' + tour.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#111', color: '#fff', padding: '13px', borderRadius: 12, fontSize: 15, fontWeight: 900, textDecoration: 'none' }}>
              ✏️ ערוך סיור
            </Link>
          )}

          <p style={{ fontSize: 12.5, color: '#6B6B6B', lineHeight: 1.6, margin: '14px 0 0' }}>
            אין צורך להחליט לבד על כל הפרטים. שלחו הודעה, בדקו זמינות, ותנו למדריך לעזור לכם להפוך יום פנוי לחוויה.
          </p>
        </div>

        {mapUrl && (
          <a href={mapsLink} target="_blank" rel="noopener noreferrer" style={{ display: 'block', borderRadius: 18, overflow: 'hidden', border: '1px solid #EDE7DF', boxShadow: '0 6px 18px rgba(0,0,0,0.07)', position: 'relative', cursor: 'pointer', textDecoration: 'none', background: '#fff' }}>
            <img src={mapUrl} alt="מפה" style={{ width: '100%', display: 'block' }} />
            <div style={{ position: 'absolute', bottom: 10, left: 10, background: 'rgba(255,255,255,0.94)', borderRadius: 8, padding: '5px 11px', fontSize: 12, fontWeight: 900, color: BROWN }}>
              פתחו ב-Google Maps
            </div>
          </a>
        )}
      </aside>
    </section>

    {relatedTours.length > 0 && (
      <section style={{ paddingTop: 42, marginTop: 42, borderTop: '1px solid #EDE7DF' }}>
        <p style={{ color: BROWN, fontSize: 13, fontWeight: 900, marginBottom: 8 }}>עוד רעיונות להמשך</p>
        <h2 style={{ fontSize: 28, fontWeight: 950, margin: '0 0 22px', letterSpacing: '-0.6px' }}>עוד סיורים שיכולים להתאים לכם</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 18 }}>
          {relatedTours.map(function(t) {
            var thumb = (t.Tour_Images ? t.Tour_Images.split('|')[0] : null) || getTourImage(t)

            return (
              <a key={t.id} href={'/tours/' + t.id} style={{ textDecoration: 'none', background: '#fff', borderRadius: 16, overflow: 'hidden', border: '1px solid #EDE7DF', display: 'block', boxShadow: '0 6px 18px rgba(0,0,0,0.05)' }}>
                <div style={{ height: 150, background: '#F7F1EA' }}>
                  {thumb && <img src={thumb} alt={t.Tour_Title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} onError={e => e.target.style.display='none'} />}
                </div>
                <div style={{ padding: 16 }}>
                  <p style={{ fontWeight: 900, fontSize: 16, marginBottom: 6, color: '#111' }}>{t.Tour_Title}</p>
                  <p style={{ fontSize: 13, color: '#6B6B6B', margin: 0 }}>{t.Cities_Tags} · {t.Guide_Name}</p>
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
