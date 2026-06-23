import { useState } from 'react'

const SIGN_TEXTS = ['לא חשבתי שאגיע לכאן','זה באמת פה?','מי בכלל נוסע לשם?','עוד 3 דקות מהבית','פנייה אחת מהשגרה','שמעתם על המקום הזה?']

export default function TourCard({ tour }) {
  const [hov, setHov] = useState(false)
  const isCollab = tour.Tour_Status === 'collab'
  const images = tour.Tour_Images ? tour.Tour_Images.split('|').filter(Boolean) : []
  const thumb = images[0] || null
  const price = Number(tour.Price_Per_Person) || 0
  const discounted = Math.round(price * 0.9)
  const sign = SIGN_TEXTS[Math.abs((tour.Tour_Title||'x').charCodeAt(0)) % SIGN_TEXTS.length]
  const title = tour.Tour_Title || 'סיור חדש'

  return (
    <a href={'/tours/'+tour.id} style={{ textDecoration:'none', color:'#fff', display:'block', borderRadius:14, overflow:'hidden', position:'relative', height:280, background:'#1a0d06', flexShrink:0, boxShadow: hov?'0 20px 48px rgba(0,0,0,0.2)':'0 8px 24px rgba(0,0,0,0.1)', transform: hov?'translateY(-5px)':'none', transition:'transform 0.25s ease, box-shadow 0.25s ease' }}
      onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}>
      {thumb
        ? <img src={thumb} alt={title} style={{ width:'100%', height:'100%', objectFit:'cover', display:'block', transition:'transform 0.4s ease', transform: hov?'scale(1.06)':'scale(1)', position:'absolute', inset:0 }} onError={e=>e.target.style.display='none'} />
        : <div style={{ position:'absolute', inset:0, background:'linear-gradient(150deg,#3a1a08,#1a0d06)' }} />
      }
      <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top,rgba(0,0,0,0.85) 0%,rgba(0,0,0,0.3) 50%,rgba(0,0,0,0.05) 100%)' }} />
      <div style={{ position:'absolute', top:12, right:12 }}>
        <span style={{ background: isCollab?'#7E4821':'rgba(0,0,0,0.7)', color:'#fff', fontSize:11, fontWeight:800, padding:'4px 10px', borderRadius:4, fontFamily:'Heebo,Arial,sans-serif' }}>
          {isCollab ? '🎙 פרק MvH' : sign}
        </span>
      </div>
      <div style={{ position:'absolute', bottom:0, right:0, left:0, padding:'18px 16px' }}>
        <h3 style={{ fontFamily:'Heebo,Arial,sans-serif', fontSize:19, fontWeight:900, marginBottom:4, lineHeight:1.2 }}>{title}</h3>
        <div style={{ fontSize:12, color:'rgba(255,255,255,0.65)', marginBottom:10, display:'flex', gap:10, fontFamily:'Heebo,Arial,sans-serif' }}>
          {tour.Cities_Tags && <span>📍 {tour.Cities_Tags}</span>}
          {tour.Duration_Hours && <span>🕐 {tour.Duration_Hours} שעות</span>}
          {tour.Guide_Name && <span>· {tour.Guide_Name}</span>}
        </div>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:8 }}>
          {price > 0 && <span style={{ fontSize:13, color:'rgba(255,255,255,0.8)', fontFamily:'Heebo,Arial,sans-serif' }}>
            <s style={{ color:'rgba(255,255,255,0.45)', fontSize:12 }}>{price} ₪</s>{' '}
            <strong style={{ fontSize:16 }}>{discounted} ₪</strong>
            <span style={{ fontSize:10, color:'rgba(255,255,255,0.45)', marginRight:4 }}>לחברי קהילה</span>
          </span>}
          <span style={{ background:'rgba(255,255,255,0.12)', border:'1px solid rgba(255,255,255,0.2)', color:'#fff', padding:'6px 12px', borderRadius:6, fontSize:12, fontWeight:700, fontFamily:'Heebo,Arial,sans-serif' }}>מה יש לעשות שם? ←</span>
        </div>
      </div>
    </a>
  )
}
