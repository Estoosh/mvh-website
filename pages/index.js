import { useState } from 'react'
import Head from 'next/head'
import Header from '../components/Header'
import TourCard from '../components/TourCard'
import { tours, getAllCities } from '../data/tours'

export default function Home() {
  const [search, setSearch] = useState('')
  const [city, setCity] = useState('')
  const [email, setEmail] = useState('')
  const [done, setDone] = useState(false)

  const cities = getAllCities()

  const filtered = tours.filter(function(t) {
    var s = !search || t.Tour_Title.includes(search) || t.Cities_Tags.some(function(c) { return c.includes(search) })
    var c = !city || t.Cities_Tags.includes(city)
    return s && c
  })

  return (
    <div>
      <Head>
        <title>MvH</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <Header />

      <div style={{ background: '#0A0A0A', padding: '72px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <h1 style={{ fontSize: 56, fontWeight: 800, color: '#ffffff', lineHeight: 1.1, marginBottom: 20 }}>
            MvH
          </h1>
          <p style={{ fontSize: 18, color: '#888888', marginBottom: 40 }}>
            Tours
          </p>
          <div style={{ display: 'flex', gap: 12, maxWidth: 560, margin: '0 auto', flexWrap: 'wrap', justifyContent: 'center' }}>
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={function(e) { setSearch(e.target.value) }}
              style={{ flex: 1, minWidth: 200, padding: '14px 18px', borderRadius: 6, border: '1px solid #333', background: '#111', color: '#ffffff', fontSize: 15, outline: 'none' }}
            />
            <select
              value={city}
              onChange={function(e) { setCity(e.target.value) }}
              style={{ padding: '14px 18px', borderRadius: 6, border: '1px solid #333', background: '#111', color: city ? '#ffffff' : '#666', fontSize: 15, outline: 'none', cursor: 'pointer' }}
            >
              <option value="">All</option>
              {cities.map(function(c) { return <option key={c} value={c}>{c}</option> })}
            </select>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '56px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24 }}>
          {filtered.map(function(tour) { return <TourCard key={tour.id} tour={tour} /> })}
        </div>
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 0', color: '#999' }}>
            <p style={{ fontSize: 18 }}>No tours found</p>
          </div>
        )}
      </div>

      <div style={{ background: '#0A0A0A', padding: '64px 24px' }}>
        <div style={{ maxWidth: 500, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: 28, fontWeight: 800, color: '#ffffff', marginBottom: 12 }}>10% OFF</h2>
          <p style={{ color: '#888', marginBottom: 32 }}>Join our community</p>
          {!done ? (
            <form onSubmit={function(e) { e.preventDefault(); if (email) setDone(true) }}
              style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={function(e) { setEmail(e.target.value) }}
                required
                style={{ flex: 1, minWidth: 200, padding: '14px 18px', borderRadius: 6, border: '1px solid #333', background: '#111', color: '#ffffff', fontSize: 15, outline: 'none' }}
              />
              <button type="submit"
                style={{ background: '#C4922A', color: '#ffffff', padding: '14px 28px', borderRadius: 6, fontSize: 15, fontWeight: 700 }}>
                Get Coupon
              </button>
            </form>
          ) : (
            <div style={{ background: '#111', border: '1px solid #C4922A', borderRadius: 8, padding: 24, color: '#ffffff' }}>
              <p style={{ fontWeight: 700, fontSize: 18 }}>Code: <span style={{ color: '#C4922A' }}>MVH10</span></p>
            </div>
          )}
        </div>
      </div>

      <footer style={{ background: '#050505', borderTop: '1px solid #1a1a1a', padding: '32px 24px', textAlign: 'center' }}>
        <p style={{ color: '#333', fontSize: 13 }}>2025 MvH</p>
      </footer>
    </div>
  )
}
