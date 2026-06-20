import { useState } from 'react'

const BROWN = '#7E4821'
const SIGN_TEXTS = ["לא חשבתי שאגיע לכאן", "זה באמת פה?", "מי בכלל נוסע לשם?", "עוד 3 דקות מהבית", "פניה אחת מהשגרה", "שמעתם על המקום הזה?"]

export default function TourCard({ tour }) {
  const [hovered, setHovered] = useState(false)
  const images = tour.Tour_Images ? tour.Tour_Images.split('|').filter(Boolean) : []
  const thumb = images[0] || null
  const signText = SIGN_TEXTS[Math.abs((tour.Tour_Title || '').charCodeAt(0)) % SIGN_TEXTS.length]

  return (
    <a href={'/tours/' + tour.id} style={{ textDecoration: 'none', display: 'block' }}
      onMouseEnter={function() { setHovered(true) }}
      onMouseLeave={function() { setHovered(false) }}>
      <div style={{
        borderRadius: 12, overflow: 'hidden', position: 'relative', height: 340,
        background: '#222',
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
        transition: 'transform 0.2s ease',
        boxShadow: hovered ? '0 12px 32px rgba(0,0,0,0.18)' : '0 4px 16px rgba(0,0,0,0.08)',
      }}>
        {thumb ? (
          <img src={thumb} alt={tour.Tour_Title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.4s ease', transform: hovered ? 'scale(1.05)' : 'scale(1)' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #2a1a0e, #4a2c14)' }} />
        )}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.2) 55%, transparent 100%)' }} />
        <div style={{ position: 'absolute', top: 14, right: 14 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', background: BROWN, color: '#fff', padding: '5px 14px 5px 22px', borderRadius: 3, fontSize: 12, fontWeight: 700, fontFamily: 'Heebo, Arial, sans-serif', position: 'relative', boxShadow: '1px 2px 6px rgba(0,0,0,0.3)' }}>
            <span style={{ position: 'absolute', left: 8, fontSize: 11 }}>←</span>
            {signText}
          </div>
        </div>
        <div style={{ position: 'absolute', bottom: 0, right: 0, left: 0, padding: '20px 18px' }}>
          <p style={{ color: '#fff', fontWeight: 800, fontSize: 19, lineHeight: 1.3, marginBottom: 4, fontFamily: 'Heebo, Arial, sans-serif' }}>{tour.Tour_Title}</p>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 13, marginBottom: 12, fontFamily: 'Heebo, Arial, sans-serif' }}>
            {tour.Guide_Name} · {tour.Cities_Tags}
          </p>
          <div style={{ display: 'inline-flex', alignItems: 'center', background: BROWN, color: '#fff', padding: '7px 14px 7px 22px', borderRadius: 3, fontSize: 13, fontWeight: 700, fontFamily: 'Heebo, Arial, sans-serif', position: 'relative' }}>
            <span style={{ position: 'absolute', left: 8 }}>←</span>
            מה יש לעשות שם?
          </div>
        </div>
      </div>
    </a>
  )
}
