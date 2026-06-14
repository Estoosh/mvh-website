import Link from 'next/link'

export default function TourCard({ tour }) {
  const isCollab = tour.Tour_Status === 'collab'

  return (
    <Link href={`/tours/${tour.id}`} style={{ display: 'block', textDecoration: 'none' }}>
      <div style={{ background: '#ffffff', border: '1px solid #E8E8E8', borderRadius: 8, overflow: 'hidden', cursor: 'pointer', height: '100%' }}>
        <div style={{ background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)', height: 180, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ fontSize: 48, opacity: 0.15, userSelect: 'none', color: '#ffffff' }}>M▶H</div>
          {isCollab && (
            <div style={{ position: 'absolute', top: 12, right: 12 }}>
              <span style={{ background: '#C4922A', color: '#ffffff', fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 4 }}>
                🎙 פרק MvH
              </span>
            </div>
          )}
        </div>

        <div style={{ padding: '16px 18px 20px' }}>
          <div style={{ marginBottom: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: '#C4922A', background: '#FDF6EA', padding: '2px 8px', borderRadius: 20 }}>
              {tour.Cities_Tags}
            </span>
          </div>

          <h3 style={{ fontSize: 17, fontWeight: 700, color: '#0A0A0A', marginBottom: 6, lineHeight: 1.3 }}>
            {tour.Tour_Title}
          </h3>

          <p style={{ fontSize: 13, color: '#555555', lineHeight: 1.5, marginBottom: 16 }}>
            {tour.Tour_Teaser}
          </p>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #E8E8E8', paddingTop: 12 }}>
            <span style={{ fontSize: 12, color: '#999999' }}>
              {tour.Duration_Hours} שעות
            </span>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#0A0A0A' }}>
              ₪{tour.Price_Per_Person}
              <span style={{ fontSize: 11, fontWeight: 400, color: '#999999', marginRight: 2 }}>/משתתף</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
