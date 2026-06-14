import { useState } from 'react'
import Head from 'next/head'
import Header from '../components/Header'
import TourCard from '../components/TourCard'

export default function Home({ tours, cities }) {
  const [search, setSearch] = useState('')
  const [city, setCity] = useState('')
  const [email, setEmail] = useState('')
  const [done, setDone] = useState(false)

  const filtered = tours.filter(function(t) {
    var s = !search || t.Tour_Title.includes(search) || (t.Cities_Tags && t.Cities_Tags.includes(search))
    var c = !city || t.Cities_Tags === city
    return s && c
  })

  return (
    <div>
      <Head>
        <title>מאז ועד היום</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <Header />

      <div style={{ background: '#0A0A0A', padding: '72px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: '#C4922A', letterSpacing: '3px', marginBottom: 20 }}>
            פודקאסט היסטורי-עכשווי עם אודי עמרני
          </p>
          <h1 style={{ fontSize: 'clamp(36px, 6vw, 64px)', fontWeight: 800, color: '#ffffff', lineHeight: 1.1, marginBottom: 20 }}>
            הסיפורים שמאחורי
            <br />
            <span style={{ color: '#C4922A' }}>המקומות שאתם מכירים</span>
          </h1>
          <p style={{ fontSize: 18, color: '#888', lineHeight: 1.7, marginBottom: 40, maxWidth: 540, margin: '0 auto 40px' }}>
            האזינו לפרק, התאהבו במקום - ואז צאו לסיור עם המדריך שסיפר את הסיפור.
          </p>
          <div style={{ display: 'flex', gap: 12, maxWidth: 560, margin: '0 auto', flexWrap: 'wrap', justifyContent: 'center' }}>
            <input
              type="text"
              placeholder="חפשו סיור, מקום, או אזור..."
              value={search}
              onChange={function(e) { setSearch(e.target.value) }}
              style={{ flex: 1, minWidth: 200, padding: '14px 18px', borderRadius: 6, border: '1px solid #333', background: '#111', color: '#ffffff', fontSize: 15, outline: 'none', fontFamily: 'Heebo, Arial, sans-serif' }}
            />
            <select
              value={city}
              onChange={function(e) { setCity(e.target.value) }}
              style={{ padding: '14px 18px', borderRadius: 6, border: '1px solid #333', background: '#111', color: city ? '#ffffff' : '#666', fontSize: 15, outline: 'none', cursor: 'pointer', fontFamily: 'Heebo, Arial, sans-serif' }}
            >
              <option value="">כל האזורים</option>
              {cities.map(function(c) { return <option key={c} value={c}>{c}</option> })}
            </select>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '56px 24px' }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 32 }}>{filtered.length} סיורים</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24 }}>
          {filtered.map(function(tour) { return <TourCard key={tour.id} tour={tour} /> })}
        </div>
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 0', color: '#999' }}>
            <p style={{ fontSize: 18 }}>לא נמצאו סיורים</p>
          </div>
        )}
      </div>

      <div style={{ background: '#0A0A0A', padding: '64px 24px' }}>
        <div style={{ maxWidth: 500, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: 28, fontWeight: 800, color: '#ffffff', marginBottom: 12 }}>10% הנחה לכל הסיורים</h2>
          <p style={{ color: '#888', marginBottom: 32 }}>הירשמו לעדכונים ותקבלו קוד הנחה אישי</p>
          {!done ? (
            <form onSubmit={function(e) { e.preventDefault(); if (email) setDone(true) }}
              style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <input
                type="email"
                placeholder="המייל שלכם"
                value={email}
                onChange={function(e) { setEmail(e.target.value) }}
                required
                style={{ flex: 1, minWidth: 200, padding: '14px
