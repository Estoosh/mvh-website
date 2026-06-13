import { useState } from 'react'
import Head from 'next/head'
import Header from '../components/Header'
import TourCard from '../components/TourCard'
import { tours, getAllCities } from '../data/tours'

export default function Home() {
  const [search, setSearch] = useState('')
  const [selectedCity, setSelectedCity] = useState('')
  const [email, setEmail] = useState('')
  const [emailSent, setEmailSent] = useState(false)

  const cities = getAllCities()

  const filtered = tours.filter(t => {
    const matchSearch = !search ||
      t.Tour_Title.includes(search) ||
      t.Tour_Teaser.includes(search) ||
      t.Cities_Tags.some(c => c.includes(search))
    const matchCity = !selectedCity ||
      t.Cities_Tags.includes(selectedCity)
    return matchSearch && matchCity
  })

  const handleEmailSubmit = (e) => {
    e.preventDefault()
    if (email) setEmailSent(true)
  }

  return (
    <>
      <Head>
        <title>מאז ועד היום | סיורים היסטוריים בישראל</title>
        <meta name="description" content="פודקאסט היסטורי-עכשווי עם אודי עמרני. צאו לסיור עם המדריכים שמספרים את הסיפורים." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <Header />

      <section style={{
        background: 'var(--black)',
        padding: '72px 24px 64px',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <p style={{
            fontSize: 13,
            fontWeight: 600,
            color: 'var(--bronze)',
            letterSpacing: '3px',
            textTransform: 'uppercase',
            marginBottom: 20,
          }}>
            פודקאסט היסטורי-עכשווי עם אודי עמרני
          </p>
          <h1 style={{
            fontSize: 'clamp(36px, 6vw, 64px)',
            fontWeight: 800,
            color: 'var(--white)',
            lineHeight: 1.1,
            marginBottom: 20,
            letterSpacing: '-1px',
          }}>
            הסיפורים שמאחורי
            <br />
            <span style={{ color: 'var(--bronze)' }}>המקומות שאתם מכירים</span>
          </h1>
          <p style={{
            fontSize: 18,
            color: '#888',
            lineHeight: 1.7,
            marginBottom: 40,
            maxWidth: 540,
            margin: '0 auto 40px',
          }}>
            האזינו לפרק, התאהבו במקום — ואז צאו לסיור עם המדריך שסיפר את הסיפור.
          </p>

          <div style={{
            display: 'flex',
            gap: 12,
            maxWidth: 560,
            margin: '0 auto',
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}>
            <input
              type="text"
              placeholder="חפשו סיור, מקום, או אזור..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                flex: 1,
                minWidth: 200,
                padding: '14px 18px',
                borderRadius: 6,
                border: '1px solid #333',
                background: '#111',
                color: 'var(--white)',
                fontSize: 15,
                fontFamily: 'Heebo, Arial, sans-serif',
                outline: 'none',
                direction: 'rtl',
              }}
            />
            <select
              value={selectedCity}
              onChange={e => setSelectedCity(e.target.value)}
              style={{
                padding: '14px 18px',
                borderRadius: 6,
                border: '1px solid #333',
                background: '#111',
                color: selectedCity ? 'var(--white)' : '#666',
                fontSize: 15,
                fontFamily: 'Heebo, Arial, sans-serif',
                outline: 'none',
                direction: 'rtl',
                cursor: 'pointer',
              }}
            >
              <option value="">כל האזורים</option>
              {cities.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <section style={{
        maxWidth: 1200,
        margin: '0 auto',
        padding: '56px 24px',
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 32,
        }}>
          <h2 style={{ fontSize: 22, fontWeight: 700 }}>
            {filtered.length > 0 ? `${filtered.length} סיורים` : 'לא נמצאו סיורים'}
          </h2>
          {(search || selectedCity) && (
            <button
              onClick={() => { setSearch(''); setSelectedCity('') }}
              style={{
                background: 'none',
                color: 'var(--bronze)',
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              נקה סינון ✕
            </button>
          )}
        </div>

        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--gray-400)' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
            <p style={{ fontSize: 18 }}>לא נמצאו סיורים התואמים את החיפוש</p>
            <p style={{ fontSize: 14, marginTop: 8 }}>נסו יישוב אחר או הרחבו את הסינון</p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: 24,
          }}>
            {filtered.map(tour => (
              <TourCard key={tour.id} tour={tour} />
            ))}
          </div>
        )}
      </section>

      <section style={{ background: 'var(--black)', padding: '64px 24px' }}>
        <div style={{ maxWidth: 560, margin: '0 auto', textAlign: 'center' }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--bronze)', letterSpacing: '3px', marginBottom: 16 }}>
            מועדון המטיילים
          </p>
          <h2 style={{ fontSize: 28, fontWeight: 800, color: 'var(--white)', marginBottom: 12 }}>
            10% הנחה לכל הסיורים
          </h2>
          <p style={{ color: '#888', fontSize: 15, lineHeight: 1.6, marginBottom: 32 }}>
            הירשמו לעדכונים ותקבלו קוד הנחה אישי לכל הסיורים באתר.
          </p>
          {!emailSent ? (
            <form onSubmit={handleEmailSubmit} style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <input
                type="email"
                placeholder="כתובת המייל שלכם"
                value={email}
