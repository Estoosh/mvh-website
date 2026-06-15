import Head from 'next/head'
import Header from '../../components/Header'

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

  const phone = tour.Guide_Phone ? tour.Guide_Phone.replace(/\D/g, '').replace(/^0/, '') : ''
  const waLink = 'https://wa.me/972' + phone

  return (
    <div>
      <Head>
        <title>{tour.Tour_Title} | MvH</title>
      </Head>
      <Header />
      <div style={{ background: '#0f0f0f', padding: '56px 24px', borderBottom: '1px solid #222' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <h1 style={{ fontSize: 40, fontWeight: 800, color: '#ffffff', marginBottom: 16 }}>{tour.Tour_Title}</h1>
          <p style={{ fontSize: 18, color: '#999999' }}>{tour.Tour_Teaser}</p>
        </div>
      </div>
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '48px 24px' }}>
        <p style={{ fontSize: 16, lineHeight: 1.8, color: '#444444', marginBottom: 32 }}>{tour.Tour_Story}</p>
        <p style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>{tour.Price_Per_Person} ILS</p>
        <p style={{ marginBottom: 8, color: '#555555' }}>{tour.Cities_Tags}</p>
        <p style={{ marginBottom: 32, color: '#555555' }}>{tour.Guide_Name}</p>
        <a href={waLink} target="_blank" rel="noopener noreferrer"
          style={{ background: '#25D366', color: '#ffffff', padding: '16px 32px', borderRadius: 8, fontSize: 18, fontWeight: 700, textDecoration: 'none' }}>
          WhatsApp
        </a>
      </div>
    </div>
  )
}

export async function getServerSideProps({ params }) {
  try {
    const token = process.env.AIRTABLE_TOKEN
    const baseId = process.env.AIRTABLE_BASE_ID
    const response = await fetch(
      `https://api.airtable.com/v0/${baseId}/tbltsGvfPLMAmJ764/${params.id}`,
      { headers: { Authorization: `Bearer ${token}` } }
    )
    if (!response.ok) return { props: { tour: null } }
    const record = await response.json()
    const tour = Object.assign({ id: record.id }, record.fields)
    return { props: { tour } }
  } catch(e) {
    return { props: { tour: null } }
  }
}
