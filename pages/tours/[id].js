import Head from 'next/head'
import Header from '../../components/Header'
import { tours } from '../../data/tours'

export default function TourPage({ tour }) {
  if (!tour) return (
    <>
      <Header />
      <div style={{ textAlign: 'center', padding: '120px 24px' }}>
        <p style={{ fontSize: 24 }}>הסיור לא נמצא</p>
      </div>
    </>
  )

  const isCollab = tour.Tour_Status === 'שת"פ'
  const waMessage = encodeURIComponent(
    `היי ${tour.guide.Guide_Name}, הגעתי אליך דרך הפודקאסט MvH ואני מתעניין בסיור "${tour.Tour_Title}". אשמח לממש את קופון ההנחה של 10% (קוד: MVH10)!`
  )
  const waLink = `https://wa.me/972${tour.guide.Phone_Number.replace(/[-\s]/g, '').replace(/^0/, '')}?text=${waMessage}`

  return (
    <>
      <Head>
        <title>{tour.Tour_Title} | מאז ועד היום</title>
        <meta name="description" content={tour.Tour_Teaser} />
      </Head>

      <Header />

      <div style={{ background: 'linear-gradient(160deg, #0f0f0f 0%, #1a1a1a 100%)', padding: '56px 24px 48px', borderBottom: '1px solid #222' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <div style={{ marginBottom: 20, fontSize: 13, color: '#555' }}>
            <a href="/" style={{ color: 'var(--bronze)' }}>סיורים</a>
            {' › '}
            <span style={{ color: '#888' }}>{tour.Cities_Tags[0]}</span>
          </div>

          {isCollab && (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(196,146,42,0.15)', border: '1px solid var(--bronze)', borderRadius: 4, padding: '4px 12px', marginBottom: 16 }}>
              <span style={{ fontSize: 13 }}>🎙</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--bronze)' }}>פרק MvH — סיור שותפות תוכן</span>
            </div>
          )}

          <h1 style={{ fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: 800, color: 'var(--white)', lineHeight: 1.15, marginBottom: 16 }}>
            {tour.Tour_Title}
          </h1>
          <p style={{ fontSize: 18, color: '#999', lineHeight: 1.6, marginBottom: 32 }}>
            {tour.Tour_Teaser}
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {tour.Cities_Tags.map(c => (
              <span key={c} style={{ background: '#1a1a1a', border: '1px solid #333', color: '#ccc', fontSize: 13, padding: '4px 12px', borderRadius: 20 }}>
                📍 {c}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '48px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 48, alignItems: 'start' }}>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>על הסיור</h2>
            <p style={{ fontSize: 16, lineHeight: 1.8, color: '#444', marginBottom: 40 }}>{tour.Tour_Story}</p>

            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>פרטי הסיור</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 40 }}>
              {[
                { label: 'משך', value: `${tour.Duration_Hours} שעות` },
                { label: 'גיל מינימום', value: `${tour.Min_Age}+` },
                { label: 'שעות סיור', value: tour.Tour_Schedule.join(' | ') },
                { label: 'ימים', value: tour.Tour_Days.join(' | ') },
                { label: 'חיות מחמד', value:
