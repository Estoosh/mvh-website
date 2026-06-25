import Link from 'next/link'
import { useUser } from '@clerk/nextjs'
import { useState, useEffect } from 'react'

export default function Header() {
  const { user, isLoaded } = useUser()
  const [isGuide, setIsGuide] = useState(false)
  const [isMember, setIsMember] = useState(false)

  useEffect(function() {
    if (!isLoaded || !user) return
    fetch('/api/get-guide?clerk_id=' + user.id + '&email=' + encodeURIComponent(user.emailAddresses?.[0]?.emailAddress || ''))
      .then(r => r.json())
      .then(d => { if (d.found) setIsGuide(true) })
    fetch('/api/get-signup?clerk_id=' + user.id)
      .then(r => r.json())
      .then(d => { if (d.found) setIsMember(true) })
  }, [isLoaded, user])

  const showCta = !isGuide && !isMember

  return (
    <header style={{ background: '#fff', borderBottom: '1px solid #EDE7DF', position: 'sticky', top: 0, zIndex: 200 }}>
      <nav style={{ maxWidth: 1180, margin: '0 auto', padding: '0 28px', height: 72, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24 }}>
        {showCta ? (
          <Link href="/join" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#555', color: '#fff', padding: '8px 14px', borderRadius: 8, fontSize: 12, fontWeight: 700, textDecoration: 'none', fontFamily: 'Heebo, Arial, sans-serif', whiteSpace: 'nowrap' }}>
            ← אני מדריך
          </Link>
        ) : isGuide ? (
          <Link href="/add-tour" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#111', color: '#fff', padding: '8px 14px', borderRadius: 8, fontSize: 12, fontWeight: 700, textDecoration: 'none', fontFamily: 'Heebo, Arial, sans-serif', whiteSpace: 'nowrap' }}>
            + הוסף סיור
          </Link>
        ) : <div style={{ width: 1 }} />}

        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }} className="hide-mobile">
          <a href="/#podcast" style={ls}>פודקאסט</a>
          <span style={{ color: '#D5CAC0' }}>|</span>
          <a href="/#community" style={ls}>קהילה</a>
          <span style={{ color: '#D5CAC0' }}>|</span>
          <a href="/#guides" style={ls}>מדריכים</a>
          <span style={{ color: '#D5CAC0' }}>|</span>
          <a href="/#tours" style={ls}>גלו מקומות</a>
          {user && (<><span style={{ color: '#D5CAC0' }}>|</span>
            <Link href={isGuide ? '/dashboard' : '/discount'} style={ls}>{isGuide ? 'דשבורד' : 'ההנחה שלי'}</Link></>)}
        </div>

        <Link href="/">
          <img src="/Logo-black.png" alt="מאז ועד היום" style={{ height: 56, width: 'auto', objectFit: 'contain', display: 'block' }} />
        </Link>
      </nav>
    </header>
  )
}
const ls = { color: '#555', textDecoration: 'none', fontWeight: 600, fontSize: 14, fontFamily: 'Heebo, Arial, sans-serif' }
