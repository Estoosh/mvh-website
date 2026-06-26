import Head from 'next/head'
import Link from 'next/link'

const BROWN = '#B97A45'

export default function PreLaunch() {
  return (
    <div dir="rtl" style={{ fontFamily: 'Heebo, Arial, sans-serif', minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
      <Head>
        <title>מאז ועד היום | בקרוב</title>
        <meta name="description" content="פלטפורמה שמחברת בין אנשים שמחפשים סיבה טובה לצאת מהבית לבין מורי דרך שיודעים להפוך מקום לסיפור." />
        <link href="https://fonts.googleapis.com/css2?family=Heebo:wght@300;400;600;700;900&display=swap" rel="stylesheet" />
        <style>{`
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { overflow-x: hidden; }
          @media (max-width: 768px) {
            .hero-text { left: 0 !important; right: 0 !important; padding: 0 24px !important; align-items: center !important; text-align: center !important; }
            .hero-h1 { font-size: 34px !important; }
            .hero-cta { width: 100% !important; max-width: 300px !important; }
          }
        `}</style>
      </Head>

      {/* BG IMAGE */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 0,
        backgroundImage: "url('/Hero-Prelaunch.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center center',
        backgroundRepeat: 'no-repeat',
      }} />

      {/* OVERLAY — רק בצד שמאל */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 1,
        background: 'linear-gradient(270deg, rgba(248,244,238,0.00) 0%, rgba(248,244,238,0.10) 35%, rgba(248,244,238,0.80) 58%, rgba(248,244,238,0.96) 75%, rgba(248,244,238,1.00) 100%)',
      }} />

      {/* CONTENT */}
      <div style={{ position: 'relative', zIndex: 2, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

        {/* LOGO — שמאל עליון */}
        <div style={{ padding: '28px 40px' }}>
          <img src="/Logo-black.png" alt="מאז ועד היום" style={{ height: 64, width: 'auto' }} onError={e => e.target.style.display='none'} />
        </div>

        {/* HERO TEXT — שמאל, מעל האזור הלבן */}
        <div className="hero-text" style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'center',
          position: 'absolute',
          top: 0, bottom: 0,
          left: 0,
          width: '42%',
          padding: '100px 40px 60px 40px',
          textAlign: 'right',
        }}>

          <h1 className="hero-h1" style={{
            fontSize: 'clamp(24px,2.8vw,40px)',
            fontWeight: 900, color: '#1a1a1a',
            lineHeight: 1.2, marginBottom: 14,
            letterSpacing: '-0.3px',
          }}>
            אנחנו בונים פלטפורמה<br />
            שמחברת בין אנשים<br />
            שמחפשים סיבה טובה<br />
            לצאת מהבית.
          </h1>

          <p style={{
            fontSize: 'clamp(14px,1.4vw,17px)',
            color: '#3a3a3a', lineHeight: 1.7,
            marginBottom: 18, fontWeight: 400,
          }}>
            לבין מורי דרך שיודעים להפוך מקום לסיפור.
          </p>

          {/* TIMELINE DIVIDER */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 14 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#C98A52' }} />
            <div style={{ width: 32, height: 2, background: '#C98A52' }} />
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#C98A52' }} />
            <div style={{ width: 32, height: 2, background: '#C98A52' }} />
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#C98A52' }} />
          </div>

          <p style={{ fontSize: 15, color: BROWN, fontWeight: 600, marginBottom: 14 }}>
            נעלה לאוויר בקרוב.
          </p>

          <p style={{ fontSize: 14, color: '#555', lineHeight: 1.7, marginBottom: 18 }}>
            אם קיבלתם הזמנה לקהילת המייסדים,<br />תוכלו להיכנס מכאן:
          </p>

          <Link href="/founders" className="hero-cta" style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            background: BROWN, color: '#fff',
            padding: '0 28px', height: 52,
            borderRadius: 14, fontSize: 15, fontWeight: 800,
            textDecoration: 'none', fontFamily: 'Heebo, Arial, sans-serif',
            boxShadow: '0 8px 24px rgba(185,122,69,0.22)',
          }}
            onMouseEnter={e => e.currentTarget.style.background='#9B6538'}
            onMouseLeave={e => e.currentTarget.style.background=BROWN}
          >
            כניסה למייסדים ←
          </Link>
        </div>
      </div>
    </div>
  )
}
