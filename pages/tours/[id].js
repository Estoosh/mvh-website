תוכן להעתקה:

```js
import { useRouter } from 'next/router'
import Head from 'next/head'
import Header from '../../components/Header'
import { tours } from '../../data/tours'

export default function TourPage() {
  const router = useRouter()
  const { id } = router.query
  const tour = tours.find(t => t.id === id)

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
            <p style={{ fontSize: 16, lineHeight: 1.8, color: '#444', marginBottom: 40 }}>
              {tour.Tour_Story}
            </p>

            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>פרטי הסיור</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 40 }}>
              {[
                { label: 'משך', value: `${tour.Duration_Hours} שעות` },
                { label: 'גיל מינימום', value: `${tour.Min_Age}+` },
                { label: 'שעות סיור', value: tour.Tour_Schedule.join(' | ') },
                { label: 'ימים', value: tour.Tour_Days.join(' | ') },
                { label: 'חיות מחמד', value: tour.Pets_Allowed ? '✓ מותר' : '✗ לא מותר' },
                { label: 'מחיר', value: `₪${tour.Price_Per_Person} למשתתף` },
              ].map(item => (
                <div key={item.label} style={{ background: 'var(--gray-100)', borderRadius: 8, padding: '16px' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--gray-400)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '1px' }}>{item.label}</div>
                  <div style={{ fontSize: 16, fontWeight: 600 }}>{item.value}</div>
                </div>
              ))}
            </div>

            <a href={tour.Meeting_Point_Waze} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#f5f5f5', border: '1px solid #e0e0e0', borderRadius: 8, padding: '12px 18px', fontSize: 14, fontWeight: 600, color: 'var(--black)' }}>
              <span>📍</span>
              <span>נווטו לנקודת המפגש</span>
            </a>
          </div>

          <div style={{ position: 'sticky', top: 84 }}>
            <div style={{ border: '1px solid var(--gray-200)', borderRadius: 12, padding: '28px', marginBottom: 16 }}>
              <div style={{ fontSize: 36, fontWeight: 800, marginBottom: 4 }}>₪{tour.Price_Per_Person}</div>
              <div style={{ fontSize: 13, color: 'var(--gray-400)', marginBottom: 24 }}>למשתתף</div>

              <a href={waLink} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, background: '#25D366', color: 'var(--white)', borderRadius: 8, padding: '16px', fontSize: 16, fontWeight: 700, textDecoration: 'none', marginBottom: 12 }}>
                <span>💬</span>
                פנו למדריך + 10% הנחה
              </a>

              <p style={{ fontSize: 11, color: 'var(--gray-400)', textAlign: 'center' }}>הציגו קוד MVH10 למדריך בתחילת הסיור</p>
            </div>

            <div style={{ border: '1px solid var(--gray-200)', borderRadius: 12, padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--black)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--bronze)', fontWeight: 800, fontSize: 16 }}>
                  {tour.guide.Guide_Name.charAt(0)}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{tour.guide.Guide_Name}</div>
                  <div style={{ fontSize: 12, color: 'var(--gray-400)' }}>מורה דרך</div>
                </div>
              </div>
              <div style={{ fontSize: 12, color: 'var(--gray-400)' }}>{tour.Lead_Count} גולשים פנו למדריך דרך האתר</div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export async function getStaticPaths() {
  return {
    paths: tours.map(t => ({ params: { id: t.id } })),
    fallback: false,
  }
}

export async function getStaticProps() {
  return { props: {} }
}
```

אחרי Commit — עוברים ל-Vercel לפרסום!
