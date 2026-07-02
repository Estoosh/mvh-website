import Link from 'next/link'

export default function Footer() {
  return (
    <footer style={{ background: '#fff', borderTop: '1px solid #EDE7DF', padding: '40px 24px 24px', fontFamily: 'Heebo, Arial, sans-serif' }}>
      <div style={{ maxWidth: 1120, margin: '0 auto', display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 48, alignItems: 'start', marginBottom: 28 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Link href="/"><img src="/Logo-black.png" alt="מאז ועד היום" style={{ height: 72, width: 'auto', objectFit: 'contain' }} /></Link>
          <p style={{ fontSize: 13, color: '#6B6B6B', lineHeight: 1.6, maxWidth: 200 }}>סיפורים שגורמים לאנשים לצאת מהבית.</p>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {[0,1,2].map(i => <span key={i} style={{ display: 'inline-flex', alignItems: 'center' }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#7E4821', display: 'inline-block' }} />
              {i < 2 && <span style={{ width: 28, height: 1.5, background: '#7E4821', display: 'inline-block' }} />}
            </span>)}
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 40px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <strong style={{ fontSize: 13, fontWeight: 900, marginBottom: 4 }}>עקבו אחרינו</strong>
            {['TikTok','YouTube','Spotify','Apple Podcasts','Facebook'].map(s => (
              <a key={s} href="https://mvh.co.il" target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: '#6B6B6B', textDecoration: 'none', fontWeight: 600 }}>{s}</a>
            ))}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <strong style={{ fontSize: 13, fontWeight: 900, marginBottom: 4 }}>ניווט מהיר</strong>
            {[['גלו מקומות','/#tours'],['מדריכים','/#guides'],['קהילה','/#community'],['פודקאסט','/#podcast'],['אני מדריך','/join'],['אודות','/why-mvh']].map(s => (
              <a key={s[0]} href={s[1]} style={{ fontSize: 13, color: '#6B6B6B', textDecoration: 'none', fontWeight: 600 }}>{s[0]}</a>
            ))}
          </div>
        </div>
      </div>
      <div style={{ maxWidth: 1120, margin: '0 auto', paddingTop: 20, borderTop: '1px solid #EDE7DF', textAlign: 'center' }}>
        <p style={{ fontSize: 12, color: '#B0A89E' }}>© כל הזכויות שמורות ל-מאז ועד היום | MvH.co.il</p>
      </div>
    </footer>
  )
}
