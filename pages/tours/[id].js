import Head from 'next/head'
import Header from '../../components/Header'
import { tours } from '../../data/tours'

export default function TourPage({ tour }) {
  if (!tour) {
    return (
      <div>
        <Header />
        <div style={{ textAlign: 'center', padding: '120px 24px' }}>
          <p>הסיור לא נמצא</p>
        </div>
      </div>
    )
  }

  const phone = tour.guide.Phone_Number.replace(/[-\s]/g, '').replace(/^0/, '')
  const waLink = 'https://wa.me/972' + phone

  return (
    <div>
      <Head>
        <title>{tour.Tour_Title}</title>
      </Head>

      <Header />

      <div style={{ background: '#0f0f0f', padding: '56px 24px', borderBottom: '1px solid #222' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <h1 style={{ fontSize: 40, fontWeight: 800, color: '#ffffff', marginBottom: 16 }}>
            {tour.Tour_Title}
          </h1>
          <p style={{ fontSize: 18, color: '#999999', lineHeight: 1.6 }}>
            {tour.Tour_Teaser}
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '48px 24px' }}>
        <p style={{ fontSize: 16, lineHeight: 1.8, color: '#444444', marginBottom: 40 }}>
          {tour.Tour_Story}
        </p>

        <div style={{ marginBottom: 32 }}>
          <p style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>מחיר: {tour.Price_Per_Person} ש"ח למשתתף</p>
          <p style={{ fontSize: 16, color: '#555555', marginBottom: 8 }}>משך: {tour.Duration_Hours} שעות</p>
          <p style={{ fontSize: 16, color: '#555555', marginBottom: 8 }}>אזורים: {tour.Cities_Tags.join(', ')}</p>
          <p style={{ fontSize: 16, color: '#555555', marginBottom: 8 }}>מדריך: {tour.guide.Guide_Name}</p>
        </div>

        
          href={waLink}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-block',
            background: '#25D366',
            color: '#ffffff',
            padding: '16px 32px',
            borderRadius: 8,
            fontSize: 18,
            fontWeight: 700,
            textDecoration: 'none',
          }}
        >
          פנו למדריך בוואטסאפ
        </a>
      </div>
    </div>
  )
}

export async function getStaticPaths() {
  return {
    paths: tours.map(function(t) { return { params: { id: t.id } } }),
    fallback: false,
  }
}

export async function getStaticProps(context) {
  var id = context.params.id
  var tour = null
  for (var i = 0; i < tours.length; i++) {
    if (tours[i].id === id) {
      tour = tours[i]
      break
    }
  }
  return { props: { tour: tour } }
}
