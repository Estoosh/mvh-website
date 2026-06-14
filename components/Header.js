import Link from 'next/link'

export default function Header() {
  return (
    <header style={{ background: '#0A0A0A', borderBottom: '1px solid #222', position: 'sticky', top: 0, zIndex: 100 }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
          <span style={{ fontSize: 28, fontWeight: 800, color: '#ffffff' }}>M</span>
          <span style={{ fontSize: 20, color: '#C4922A', fontWeight: 700 }}>&#9654;</span>
          <span style={{ fontSize: 28, fontWeight: 800, color: '#ffffff' }}>H</span>
        </Link>
        <nav style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
          <Link href="/" style={{ color: '#999999', fontSize: 14, textDecoration: 'none' }}>סיורים</Link>
          <a href="https://open.spotify.com" target="_blank" rel="noopener noreferrer"
            style={{ background: '#C4922A', color: '#ffffff', padding: '8px 18px', borderRadius: 4, fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
            Listen
          </a>
        </nav>
      </div>
    </header>
  )
}
