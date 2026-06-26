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
            .hero-text { text-align: center !important; align-items: center !important; padding: 0 24px !important; }
            .hero-h1 { font-size: 38px !important; }
            .hero-sub { font-size: 20px !important; }
            .hero-cta { width: 100% !important; max-width: 320px !important; }
            .hero-overlay { background: linear-gradient(180deg, rgba(248,244,238,0.88) 0%, rgba(248,244,238,0.72) 50%, rgba(248,244,238,0.55) 100%) !important; }
            .hero-bg { background-position: 72% center !important; }
            .hero-logo { padding: 24px 24px !important; }
          }
        `}</style>
      </Head>

      {/* BG IMAGE */}
      <div className="hero-bg" style={{
        position: 'fixed', inset: 0, zIndex: 0,
        backgroundImage: 'url(/Hero-Prelaunch.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center center',
        backgroundRepeat: 'no-repeat',
      }} />

      {/* OVERLAY — עדין */}
      <div className="hero-overlay" style={{
        position: 'fixed', inset: 0, zIndex: 1,
        background: 'linear-gradient(90deg, rgba(248,244,238,0.72) 0%, rgba(248,244,238,0.55) 28%, rgba(248,244,238,0.25) 48%, rgba(248,244,238,0.05) 72%, rgba(248,244,238,0.00) 100%)',
      }} />

      {/* CONTENT */}
      <div style={{ position: 'relative', zIndex: 2, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

        {/* LOGO — שמאל עליון */}
        <div className="hero-logo" style={{ padding: '28px 40px' }}>
          <img src="/Logo-black.png" alt="מאז ועד היום" style={{ height: 64, width: 'auto' }} onError={e => e.target.style.display='none'} />
        </div>

        {/* HERO TEXT */}
        <div className="hero-text" style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          alignItems: 'flex-start', justifyContent: 'center',
          maxWidth: 480, padding: '0 40px 64px',
        }}>

          <h1 className="hero-h1" style={{
            fontSize: 'clamp(28px,3.2vw,44px)',
            fontWeight: 900, color: '#1a1a1a',
            lineHeight: 1.2, marginBottom: 16,
            letterSpacing: '-0.3px',
          }}>
            אנחנו בונים פלטפורמה<br />
            שמחברת בין אנשים<br />
            שמחפשים סיבה טובה<br />
            לצאת מהבית.
          </h1>

          <p className="hero-sub" style={{
            fontSize: 'clamp(15px,1.6vw,19px)',
            color: '#3a3a3a', lineHeight: 1.7,
            marginBottom: 20, fontWeight: 400,
          }}>
            לבין מורי דרך שיודעים להפוך<br />מקום לסיפור.
          </p>

          {/* TIMELINE DIVIDER */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 16 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#C98A52' }} />
            <div style={{ width: 32, height: 2, background: '#C98A52' }} />
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#C98A52' }} />
            <div style={{ width: 32, height: 2, background: '#C98A52' }} />
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#C98A52' }} />
          </div>

          <p style={{ fontSize: 15, color: BROWN, fontWeight: 600, marginBottom: 16 }}>
            נעלה לאוויר בקרוב.
          </p>

          <p style={{ fontSize: 14, color: '#555', lineHeight: 1.7, marginBottom: 18 }}>
            אם קיבלתם הזמנה לקהילת המייסדים,<br />תוכלו להיכנס מכאן:
          </p>

          <Link href="/founders" className="hero-cta" style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            background: BROWN, color: '#fff',
            padding: '0 28px', height: 56,
            borderRadius: 16, fontSize: 16, fontWeight: 800,
            textDecoration: 'none', fontFamily: 'Heebo, Arial, sans-serif',
            boxShadow: '0 8px 24px rgba(185,122,69,0.20)',
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
