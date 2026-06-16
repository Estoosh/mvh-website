import Link from 'next/link'
import { UserButton, SignedIn, SignedOut, useUser } from '@clerk/nextjs'
import { useEffect, useState } from 'react'

export default function Header() {
  const { user, isLoaded } = useUser()
  const [isGuide, setIsGuide] = useState(false)

  useEffect(function() {
    if (!isLoaded || !user) return
    fetch('/api/get-guide?clerk_id=' + user.id)
      .then(function(r) { return r.json() })
      .then(function(data) {
        if (data.found) setIsGuide(true)
      })
  }, [isLoaded, user])

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
          <SignedIn>
            {isGuide && (
              <Link href="/dashboard" style={{ color: '#999999', fontSize: 14, textDecoration: 'none' }}>דשבורד</Link>
            )}
            <UserButton />
          </SignedIn>
          <SignedOut>
            <Link href="/sign-in" style={{ background: '#C4922A', color: '#ffffff', padding: '8px 18px', borderRadius: 4, fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
              כניסה
            </Link>
          </SignedOut>
        </nav>
      </div>
    </header>
  )
}
