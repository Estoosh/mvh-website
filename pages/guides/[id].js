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

function TourRow({ tour }) {
  const thumb = (tour.Tour_Images ? tour.Tour_Images.split('|')[0] : null) || getTourImage(tour)
  const price = Number(tour.Price_Per_Person) || 0
  const isCollab = tour.Tour_Status === 'collab'

  return (
    <a href={'/tours/' + tour.id} style={{ textDecoration: 'none', color: 'inherit', display: 'grid', gridTemplateColumns: '180px 1fr auto', gap: 20, background: '#fff', borderRadius: 14, border: '1px solid #EDE7DF', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', alignItems: 'center' }}>
      <div style={{ height: 140, background: '#1a0d06', flexShrink: 0 }}>
        {thumb
          ? <img src={thumb} alt={tour.Tour_Title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} onError={e => e.target.style.display='none'} />
          : <div style={{ width: '100%', height: '100%', background: 'linear-gradient(150deg,#3a1a08,#1a0d06)' }} />
        }
      </div>
      <div style={{ padding: '4px 0' }}>
        <h3 style={{ fontSize: 18, fontWeight: 900, color: '#111', marginBottom: 6, letterSpacing: '-0.3px', fontFamily: 'Heebo, Arial, sans-serif' }}>{tour.Tour_Title}</h3>
        <div style={{ display: 'flex', gap: 12, fontSize: 13, color: '#6B6B6B', marginBottom: 8, fontFamily: 'Heebo, Arial, sans-serif' }}>
          {tour.Cities_Tags && <span>📍 {tour.Cities_Tags}</span>}
          {tour.Duration_Hours && <span>🕐 {tour.Duration_Hours} שעות</span>}
        </div>
        {tour.Tour_Teaser && <p style={{ fontSize: 14, color: '#666', lineHeight: 1.6, fontFamily: 'Heebo, Arial, sans-serif', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{tour.Tour_Teaser}</p>}
      </div>
      <div style={{ padding: '0 20px 0 0', textAlign: 'center', flexShrink: 0 }}>
        {isCollab ? (
          <span style={{ display: 'block', background: '#dcfce7', color: '#16a34a', fontSize: 13, fontWeight: 800, padding: '6px 14px', borderRadius: 20, fontFamily: 'Heebo, Arial, sans-serif', whiteSpace: 'nowrap' }}>🎙 חינם לחברים</span>
        ) : (
          <span style={{ display: 'block', fontSize: 22, fontWeight: 900, color: BROWN, fontFamily: 'Heebo, Arial, sans-serif' }}>{price} ₪</span>
        )}
        <span style={{ fontSize: 12, color: BROWN, fontWeight: 700, fontFamily: 'Heebo, Arial, sans-serif', marginTop: 4, display: 'block' }}>לפרטים ←</span>
      </div>
    </a>
  )
}

export default function GuidePage({ guide, tours }) {
  if (!guide) return (
    <div style={{ fontFamily: 'Heebo, Arial, sans-serif', background: CREAM, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header /><main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><p style={{ color: '#6B6B6B' }}>המדריך לא נמצא</p></main><Footer />
    </div>
  )

  const tags = guide.Guide_Tags ? guide.Guide_Tags.split(',').map(t => t.trim()).filter(Boolean) : []
  const photo = guide.Guide_Photo || null
  const name = guide.Guide_Name || ''
  const firstName = name.split(' ')[0]

  const socialLinks = [
    guide.Website && { label: 'אתר אישי', href: guide.Website, icon: '🌐' },
    guide.Facebook && { label: 'Facebook', href: guide.Facebook, icon: '📘' },
    guide.Instagram && { label: 'Instagram', href: guide.Instagram, icon: '📷' },
    guide.TikTok && { label: 'TikTok', href: guide.TikTok, icon: '♪' },
  ].filter(Boolean)

  return (
    <div style={{ fontFamily: 'Heebo, Arial, sans-serif', background: CREAM, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Head>
        <title>{name} | מאז ועד היום</title>
        <meta name="description" content={guide.Guide_Bio || ''} />
        <style>{`@media(max-width:768px){.guide-top{grid-template-columns:1fr!important;}.tour-row{grid-template-columns:1fr!important;}}`}</style>
      </Head>
      <Header />

      <main style={{ flex: 1, maxWidth: 900, margin: '0 auto', padding: '36px 24px', width: '100%' }}>

        {/* TOP */}
        <div className="guide-top" style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: 24, marginBottom: 36, alignItems: 'start' }}>
          <div style={{ borderRadius: 16, overflow: 'hidden', height: 280, background: '#1a0d06', boxShadow: '0 8px 28px rgba(0,0,0,0.12)' }}>
            {photo
              ? <img src={photo} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} onError={e => e.target.style.display='none'} />
              : <div style={{ width: '100%', height: '100%', background: 'linear-gradient(150deg,#2a1508,#1a0d06)' }} />
            }
          </div>
          <div style={{ background: '#fff', borderRadius: 16, padding: '28px', border: '1px solid #EDE7DF', boxShadow: '0 4px 16px rgba(0,0,0,0.06)', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: 12, color: '#6B6B6B', marginBottom: 6, letterSpacing: '1px' }}>מורה דרך</p>
              <h1 style={{ fontSize: 'clamp(24px,3.5vw,36px)', fontWeight: 900, color: '#111', marginBottom: 8, letterSpacing: '-0.5px' }}>{name}</h1>
              {guide.Guide_Region && <p style={{ fontSize: 14, color: '#6B6B6B', marginBottom: 14 }}>📍 {guide.Guide_Region}</p>}
              {tags.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
                  {tags.map(t => <span key={t} style={{ background: 'rgba(126,72,33,0.08)', color: BROWN, border: '1px solid rgba(126,72,33,0.18)', fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 20 }}>{t}</span>)}
                </div>
              )}
              {guide.Guide_Bio && <p style={{ fontSize: 15, color: '#444', lineHeight: 1.85 }}>{guide.Guide_Bio}</p>}
            </div>
            {socialLinks.length > 0 && (
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 20, paddingTop: 16, borderTop: '1px solid #EDE7DF' }}>
                {socialLinks.map(s => (
                  <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, color: '#111', textDecoration: 'none', background: CREAM, border: '1px solid #EDE7DF', padding: '6px 14px', borderRadius: 20 }}>
                    <span>{s.icon}</span>{s.label}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* TOURS */}
        <h2 style={{ fontSize: 22, fontWeight: 900, marginBottom: 16, letterSpacing: '-0.5px' }}>הסיורים של {firstName}</h2>
        {tours.length === 0 ? (
          <div style={{ background: '#fff', borderRadius: 14, padding: 40, textAlign: 'center', border: '1px solid #EDE7DF' }}>
            <p style={{ color: '#B0A89E', fontSize: 15 }}>עדיין אין סיורים פעילים</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {tours.map(t => <TourRow key={t.id} tour={t} />)}
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

    const guideRes = await fetch(`https://api.airtable.com/v0/${baseId}/tblsJ5Ok1yPSgtvSj/${params.id}`, { headers: { Authorization: `Bearer ${token}` } })
    if (!guideRes.ok) return { props: { guide: null, tours: [] } }
    const guideRecord = await guideRes.json()
    const guide = Object.assign({ id: guideRecord.id }, guideRecord.fields)

    let tours = []
    if (guide.Guide_Name) {
      const toursRes = await fetch(`https://api.airtable.com/v0/${baseId}/tbltsGvfPLMAmJ764?filterByFormula={Guide_Name}="${guide.Guide_Name}"`, { headers: { Authorization: `Bearer ${token}` } })
      const toursData = await toursRes.json()
      tours = (toursData.records || []).map(r => Object.assign({ id: r.id }, r.fields)).filter(t => t.Tour_Status === 'paid' || t.Tour_Status === 'collab')
    }

    return { props: { guide, tours } }
  } catch(e) {
    return { props: { guide: null, tours: [] } }
  }
}
