import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import Header from '../components/Header'
import Link from 'next/link'

export default function Dashboard() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const [guide, setGuide] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(function() {
    if (!isLoaded) return
    if (!user) { router.push('/sign-in'); return }
    
    fetch('/api/get-guide?clerk_id=' + user.id)
      .then(function(r) { return r.json() })
      .then(function(data) {
        if (!data.found) { router.push('/join'); return }
        setGuide(data.guide)
        setLoading(false)
      })
  }, [isLoaded, user])

  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>טוען...</div>

  return (
    <div>
      <Header />
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '48px 24px' }}>
        <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 8 }}>שלום, {guide.Guide_Name}</h1>
        <p style={{ color: '#666', marginBottom: 40 }}>ברוך הבא לדשבורד שלך</p>
        <div style={{ background: '#F5F5F5', borderRadius: 8, padding: 24, marginBottom: 24 }}>
          <p style={{ color: '#999' }}>עדיין אין סיורים פעילים.</p>
          <Link href="/add-tour" style={{ display: 'inline-block', marginTop: 16, background: '#0A0A0A', color: '#fff', padding: '10px 20px', borderRadius: 6, fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>
            הוסף סיור ראשון
          </Link>
        </div>
      </div>
    </div>
  )
}
