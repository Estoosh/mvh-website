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
    <a href={'/tours/' + tour.id} style={{ textDecoration: 'none', color: 'inherit', display: 'grid', gridTemplateColumns: '160px 1fr auto', gap: 0, background: '#fff', borderRadius: 14, border: '1px solid #EDE7DF', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', alignItems: 'stretch' }}>
      <div style={{ height: 130, background: '#1a0d06' }}>
        {thumb
          ? <img src={thumb} alt={tour.Tour_Title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} onError={e => e.target.style.display='none'} />
          : <div style={{ width: '100%', height: '100%', background: 'linear-gradient(150deg,#3a1a08,#1a0d06)' }} />
        }
      </div>
      <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <p style={{ fontSize: 16, fontWeight: 800, color: '#111', marginBottom: 6, fontFamily: 'Heebo, Arial, sans-serif' }}>{tour.Tour_Title}</p>
        <div style={{ display: 'flex', gap: 14, fontSize: 13, color: '#6B6B6B', marginBottom: 8, fontFamily: 'Heebo, Arial, sans-serif' }}>
          {tour.Cities_Tags && <span>📍 {tour.Cities_Tags}</span>}
          {tour.Duration_Hours && <span>🕐 {tour.Duration_Hours} שעות</span>}
        </div>
        {tour.Tour_Teaser && <p style={{ fontSize: 13, color: '#888', lineHeight: 1.55, fontFamily: 'Heebo, Arial, sans-serif', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{tour.Tour_Teaser}</p>}
      </div>
      <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderRight: '1px solid #EDE7DF', minWidth: 120 }}>
        {isCollab
          ? <span style={{ background: '#dcfce7', color: '#16a34a', fontSize: 12, fontWeight: 800, padding: '5px 12px', borderRadius: 20, fontFamily: 'Heebo, Arial, sans-serif', whiteSpace: 'nowrap' }}>🎙 חינם לחברים</span>
          : <span style={{ fontSize: 20, fontWeight: 900, color: BROWN, fontFamily: 'Heebo, Arial, sans-serif' }}>{price} ₪</span>
        }
        <span style={{ fontSize: 12, color: BROWN, fontWeight: 700, fontFamily: 'Heebo, Arial, sans-serif', marginTop: 6 }}>לפרטים ←</span>
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
  const title = guide.Guide_Title || guide.Guide_title || ''
  const bio = guide.Guide_Bio || guide.Guide_bio || ''
  const region = guide.Guide_Region || ''

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
        <meta name="description" content={bio || ''} />
      </Head>
      <Header />

      <main style={{ flex: 1, maxWidth: 860, margin: '0 auto', padding: '36px 24px', width: '100%' }}>

        {/* TOP — photo + info */}
        <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 24, marginBottom: 36, alignItems: 'start' }}>

          {/* photo */}
          <div style={{ borderRadius: 14, overflow: 'hidden', aspectRatio: '3/4', background: '#1a0d06', boxShadow: '0 6px 20px rgba(0,0,0,0.10)' }}>
            {photo
              ? <img src={photo} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} onError={e => e.target.style.display='none'} />
              : <div style={{ width: '100%', height: '100%', background: 'linear-gradient(150deg,#2a1508,#1a0d06)' }} />
            }
          </div>

          {/* info */}
          <div style={{ background: '#fff', borderRadius: 14, padding: '28px 28px', border: '1px solid #EDE7DF', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', gap: 14 }}>

            {/* name + title */}
            <div>
              <p style={{ fontSize: 11, color: '#B0A89E', marginBottom: 6, letterSpacing: '1.5px', textTransform: 'uppercase', fontWeight: 600 }}>מורה דרך</p>
              <h1 style={{ fontSize: 26, fontWeight: 900, color: '#111', marginBottom: 4, letterSpacing: '-0.3px', lineHeight: 1.2 }}>{name}</h1>
              {title && <p style={{ fontSize: 14, color: BROWN, fontWeight: 700, marginBottom: 0 }}>{title}</p>}
            </div>

            {/* region + tags */}
            {(region || tags.length > 0) && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {region && <p style={{ fontSize: 13, color: '#6B6B6B' }}>📍 {region}</p>}
                {tags.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {tags.map(t => (
                      <span key={t} style={{ background: 'rgba(126,72,33,0.07)', color: BROWN, border: '1px solid rgba(126,72,33,0.15)', fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 20 }}>{t}</span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* bio */}
            {bio && (
              <p style={{ fontSize: 14, color: '#444', lineHeight: 1.85, borderTop: '1px solid #F0EAE2', paddingTop: 14 }}>{bio}</p>
            )}

            {/* timeline mark */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: BROWN, display: 'inline-block' }} />
              <span style={{ width: 32, height: 1.5, background: BROWN, display: 'inline-block' }} />
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: BROWN, display: 'inline-block' }} />
              <span style={{ width: 32, height: 1.5, background: BROWN, display: 'inline-block' }} />
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: BROWN, display: 'inline-block' }} />
            </div>

            {/* social links */}
            {socialLinks.length > 0 && (
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {socialLinks.map(s => (
                  <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: '#555', textDecoration: 'none', background: CREAM, border: '1px solid #EDE7DF', padding: '5px 12px', borderRadius: 20 }}>
                    {s.icon} {s.label}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* TOURS */}
        <div>
          <p style={{ fontSize: 13, fontWeight: 700, color: '#6B6B6B', marginBottom: 14, letterSpacing: '0.5px', textTransform: 'uppercase' }}>הסיורים של {firstName}</p>
          {tours.length === 0 ? (
            <div style={{ background: '#fff', borderRadius: 14, padding: 40, textAlign: 'center', border: '1px solid #EDE7DF' }}>
              <p style={{ color: '#B0A89E', fontSize: 14 }}>עדיין אין סיורים פעילים</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {tours.map(t => <TourRow key={t.id} tour={t} />)}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}

export async function getServerSideProps({ params }) {
  try {
    const token = process.env.AIRTABLE_TOKEN
    const baseId = process.env.AIRTABLE_BASE_ID

    const guideRes = await fetch(
      `https://api.airtable.com/v0/${baseId}/tblsJ5Ok1yPSgtvSj/${params.id}`,
      { headers: { Authorization: `Bearer ${token}` } }
    )
    if (!guideRes.ok) return { props: { guide: null, tours: [] } }
    const guideRecord = await guideRes.json()
    const guide = Object.assign({ id: guideRecord.id }, guideRecord.fields)

    let tours = []
    if (guide.Guide_Name) {
      const toursRes = await fetch(
        `https://api.airtable.com/v0/${baseId}/tbltsGvfPLMAmJ764?filterByFormula={Guide_Name}="${guide.Guide_Name}"`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      const toursData = await toursRes.json()
      tours = (toursData.records || [])
        .map(r => Object.assign({ id: r.id }, r.fields))
        .filter(t => t.Tour_Status === 'paid' || t.Tour_Status === 'collab')
    }

    return { props: { guide, tours } }
  } catch(e) {
    return { props: { guide: null, tours: [] } }
  }
}
