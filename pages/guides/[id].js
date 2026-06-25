import Head from 'next/head'
import Link from 'next/link'
import Header from '../../components/Header'
import Footer from '../../components/Footer'

const BROWN = '#7E4821'

function TourCard({ tour }) {
  const images = tour.Tour_Images ? tour.Tour_Images.split('|').filter(Boolean) : []
  const thumb = images[0] || null
  const price = Number(tour.Price_Per_Person) || 0
  const isCollab = tour.Tour_Status === 'collab'
  const title = tour.Tour_Title || 'סיור חדש'

  return (
    <a href={'/tours/' + tour.id} style={{ textDecoration: 'none', color: '#fff', display: 'block', borderRadius: 14, overflow: 'hidden', position: 'relative', height: 260, background: '#1a0d06', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}>
      {thumb
        ? <img src={thumb} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', position: 'absolute', inset: 0 }} onError={e => e.target.style.display='none'} />
        : <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(150deg,#3a1a08,#1a0d06)' }} />
      }
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 55%, transparent 100%)' }} />
      <div style={{ position: 'absolute', bottom: 0, right: 0, left: 0, padding: '18px 16px' }}>
        <h3 style={{ fontFamily: 'Heebo, Arial, sans-serif', fontSize: 18, fontWeight: 900, marginBottom: 4, lineHeight: 1.2 }}>{title}</h3>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', marginBottom: 10, display: 'flex', gap: 10, fontFamily: 'Heebo, Arial, sans-serif' }}>
          {tour.Cities_Tags && <span>📍 {tour.Cities_Tags}</span>}
          {tour.Duration_Hours && <span>🕐 {tour.Duration_Hours} שעות</span>}
        </div>
        <span style={{ background: isCollab ? BROWN : 'rgba(255,255,255,0.15)', color: '#fff', padding: '5px 12px', borderRadius: 6, fontSize: 12, fontWeight: 700, fontFamily: 'Heebo, Arial, sans-serif' }}>
          {isCollab ? '🎙 פרק MvH — חינם לחברי קהילה' : price + ' ₪ לאדם'}
        </span>
      </div>
    </a>
  )
}

export default function GuidePage({ guide, tours }) {
  if (!guide) return (
    <div style={{ fontFamily: 'Heebo, Arial, sans-serif', background: '#F7F1EA', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#6B6B6B' }}>המדריך לא נמצא</p>
      </main>
      <Footer />
    </div>
  )

  const tags = guide.Guide_Tags ? guide.Guide_Tags.split(',').map(t => t.trim()).filter(Boolean) : []
  const photo = guide.Guide_Photo || null
  const name = guide.Guide_Name || ''
  const firstName = name.split(' ')[0]

  const socialLinks = [
    guide.Website && { label: 'אתר', href: guide.Website, icon: '🌐' },
    guide.Facebook && { label: 'Facebook', href: guide.Facebook, icon: '📘' },
    guide.Instagram && { label: 'Instagram', href: guide.Instagram, icon: '📷' },
    guide.TikTok && { label: 'TikTok', href: guide.TikTok, icon: '♪' },
  ].filter(Boolean)

  return (
    <div style={{ fontFamily: 'Heebo, Arial, sans-serif', background: '#F7F1EA', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Head>
        <title>{name} | מאז ועד היום</title>
        <meta name="description" content={guide.Guide_Bio || ''} />
      </Head>
      <Header />

      <div style={{ background: '#111', padding: '48px 24px 40px' }}>
        <div style={{ maxWidth: 860, margin: '0 auto', display: 'grid', gridTemplateColumns: '200px 1fr', gap: 36, alignItems: 'center' }}>
          <div style={{ width: 200, height: 200, borderRadius: '50%', overflow: 'hidden', border: '4px solid rgba(126,72,33,0.5)', background: '#1a0d06', flexShrink: 0 }}>
            {photo && <img src={photo} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} onError={e => e.target.style.display='none'} />}
          </div>
          <div>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 8, letterSpacing: '2px' }}>מורה דרך</p>
            <h1 style={{ fontSize: 'clamp(28px,4vw,44px)', fontWeight: 900, color: '#fff', marginBottom: 10, letterSpacing: '-1px' }}>{name}</h1>
            {guide.Guide_Region && <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', marginBottom: 14 }}>📍 {guide.Guide_Region}</p>}
            {tags.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {tags.map(t => (
                  <span key={t} style={{ background: 'rgba(126,72,33,0.25)', color: '#D4956A', fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 20 }}>{t}</span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <main style={{ flex: 1, maxWidth: 860, margin: '0 auto', padding: '36px 24px', width: '100%' }}>
        <div style={{ display: 'grid', gridTemplateColumns: socialLinks.length > 0 ? '1fr 180px' : '1fr', gap: 24, marginBottom: 36 }}>
          {guide.Guide_Bio && (
            <div style={{ background: '#fff', borderRadius: 16, padding: '24px 28px', border: '1px solid #EDE7DF', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
              <p style={{ fontSize: 16, lineHeight: 1.9, color: '#444' }}>{guide.Guide_Bio}</p>
            </div>
          )}
          {socialLinks.length > 0 && (
            <div style={{ background: '#fff', borderRadius: 16, padding: '20px', border: '1px solid #EDE7DF', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: '#6B6B6B', marginBottom: 4 }}>קישורים</p>
              {socialLinks.map(s => (
                <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 700, color: '#111', textDecoration: 'none' }}>
                  <span>{s.icon}</span>{s.label}
                </a>
              ))}
            </div>
          )}
        </div>

        <h2 style={{ fontSize: 22, fontWeight: 900, marginBottom: 20, letterSpacing: '-0.5px' }}>הסיורים של {firstName}</h2>
        {tours.length === 0 ? (
          <div style={{ background: '#fff', borderRadius: 14, padding: 40, textAlign: 'center', border: '1px solid #EDE7DF' }}>
            <p style={{ color: '#B0A89E', fontSize: 15 }}>עדיין אין סיורים פעילים</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
            {tours.map(t => <TourCard key={t.id} tour={t} />)}
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
