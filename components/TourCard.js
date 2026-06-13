import Link from 'next/link'

export default function TourCard({ tour }) {
  const isCollab = tour.Tour_Status === 'שת"פ'

  return (
    <Link href={`/tours/${tour.id}`} style={{ display: 'block', textDecoration: 'none' }}>
      <div style={{
        background: 'var(--white)',
        border: '1px solid var(--gray-200)',
        borderRadius: 8,
        overflow: 'hidden',
        transition: 'transform 0.2s, box-shadow 0.2s',
        cursor: 'pointer',
        height: '100%',
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
          height: 180,
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <div style={{ fontSize: 48, opacity: 0.15, userSelect: 'none' }}>M▶H</div>

          {isCollab && (
            <div style={{ position: 'absolute', top: 12, right: 12 }}>
              <span style={{
                background: 'var(--bronze)',
                color: 'var(--white)',
                fontSize: 11,
                fontWeight: 700,
                padding: '3px 8px',
                borderRadius: 4,
              }}>
                🎙 פרק MvH
              </span>
            </div>
          )}

          <div style={{ position: 'absolute', bottom: 12, left: 12 }}>
            {tour.Tour_Schedule.map(s => (
              <span key={s} style={{ marginLeft: 4, fontSize: 16 }}>
                {s === 'בוקר' ? '🌅' : s === 'ערב' ? '🌙' : '☀️'}
              </span>
            ))}
          </div>
        </div>

        <div style={{ padding: '16px 18px 20px' }}>
          <div style={{ marginBottom: 8, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {tour.Cities_Tags.map(city => (
              <span key={city} style={{
                fontSize: 11,
                fontWeight: 600,
                color: 'var(--bronze)',
                background: '#FDF6EA',
                padding: '2px 8px',
                borderRadius: 20,
              }}>
                {city}
              </span>
            ))}
          </div>

          <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--black)', marginBottom: 6, lineHeight: 1.3 }}>
            {tour.Tour_Title}
          </h3>

          <p style={{ fontSize: 13, color: 'var(--gray-600)', lineHeight: 1.5, marginBottom: 16 }}>
            {tour.Tour_Teaser}
          </p>

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderTop: '1px solid var(--gray-200)',
            paddingTop: 12,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 12, color: 'var(--gray-400)' }}>⏱ {tour.Duration_Hours} שעות</span>
              {tour.Pets_Allowed && <span style={{ fontSize: 12 }}>🐕</span>}
            </div>
            <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--black)' }}>
              ₪{tour.Price_Per_Person}
              <span style={{ fontSize: 11, fontWeight: 400, color: 'var(--gray-400)', marginRight: 2 }}>/משתתף</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
