import Link from 'next/link'

export default function Header() {
  return (
    <header style={{
      background: 'var(--black)',
      borderBottom: '1px solid #222',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <div style={{
        maxWidth: 1200,
        margin: '0 auto',
        padding: '0 24px',
        height: 64,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 28, fontWeight: 800, color: 'var(--white)', letterSpacing: '-1px' }}>M</span>
          <span style={{ fontSize: 20, color: 'var(--bronze)', fontWeight: 700 }}>▶</span>
          <span style={{ fontSize: 28, fontWeight: 800, color: 'var(--white)', letterSpacing: '-1px' }}>H</span>
        </Link>

        <nav style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
          <Link href="/" style={{ color: 'var(--gray-400)', fontSize: 14, fontWeight: 500 }}>
            סיורים
          </Link>
          
            href="https://open.spotify.com"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              background: 'var(--bronze)',
              color: 'var(--white)',
              padding: '8px 18px',
              borderRadius: 4,
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            האזן עכשיו
          </a>
        </nav>
      </div>
    </header>
  )
}
