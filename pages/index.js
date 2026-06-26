import Head from 'next/head'
import Link from 'next/link'

const BROWN = '#7E4821'
const CREAM = '#F7F1EA'

export default function PreLaunch() {
  return (
    <div dir="rtl" style={{ fontFamily: 'Heebo, Arial, sans-serif', background: CREAM, minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 24px' }}>
      <Head>
        <title>מאז ועד היום | בקרוב</title>
        <meta name="description" content="פלטפורמה שמחברת בין אנשים שמחפשים סיבה טובה לצאת מהבית לבין מורי דרך שיודעים להפוך מקום לסיפור." />
        <link href="https://fonts.googleapis.com/css2?family=Heebo:wght@300;400;700;900&display=swap" rel="stylesheet" />
      </Head>

      <div style={{ maxWidth: 560, width: '100%', textAlign: 'center' }}>

        {/* logo */}
        <img src="/Logo-black.png" alt="מאז ועד היום" style={{ height: 80, width: 'auto', marginBottom: 48, display: 'block', margin: '0 auto 48px' }} onError={e => e.target.style.display='none'} />

        {/* timeline mark */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0, marginBottom: 36 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: BROWN }} />
          <div style={{ width: 40, height: 2, background: BROWN }} />
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: BROWN }} />
          <div style={{ width: 40, height: 2, background: BROWN }} />
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: BROWN }} />
        </div>

        {/* copy */}
        <h1 style={{ fontSize: 'clamp(22px,4vw,32px)', fontWeight: 800, color: '#1a1a1a', marginBottom: 16, letterSpacing: '-0.3px', lineHeight: 1.3 }}>
          מאז ועד היום
        </h1>

        <p style={{ fontSize: 17, color: '#555', lineHeight: 1.85, marginBottom: 48 }}>
          אנחנו בונים פלטפורמה שמחברת בין אנשים שמחפשים סיבה טובה לצאת מהבית לבין מורי דרך שיודעים להפוך מקום לסיפור.
          <br /><br />
          בקרוב נעלה לאוויר.
        </p>

        {/* divider */}
        <div style={{ borderTop: '1px solid #EDE7DF', marginBottom: 36 }} />

        {/* founder CTA */}
        <p style={{ fontSize: 14, color: '#6B6B6B', marginBottom: 16 }}>
          אם קיבלתם הזמנה לקהילת המייסדים, תוכלו להיכנס מכאן:
        </p>

        <Link href="/founders" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: '#111', color: '#fff', padding: '14px 28px', borderRadius: 10, fontSize: 15, fontWeight: 800, textDecoration: 'none', fontFamily: 'Heebo, Arial, sans-serif' }}>
          כניסה למייסדים ←
        </Link>

      </div>
    </div>
  )
}
