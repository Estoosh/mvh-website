import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import Header from '../components/Header'
import Link from 'next/link'

export default function Dashboard() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const [guide, setGuide] = useState(null)
  const [tours, setTours] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(function() {
    if (!isLoaded) return
    if (!user) { router.push('/sign-in'); return }
    
    fetch('/api/get-guide?clerk_id=' + user.id)
      .then(function(r) { return r.json() })
      .then(function(data) {
        if (!data.found) { router.push('/join'); return }
        setGuide(data.guide)
        return fetch('/api/get-guide-tours?guide_name=' + encodeURIComponent(data.guide.Guide_Name))
      })
      .then(function(r) { return r.json() })
      .then(function(data) {
        setTours(data.tours || [])
        setLoading(false)
      })
  }, [isLoaded, user])

  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>טוען...</div>

  const totalDue = tours.filter(function(t) { return t.Tour_Status === 'paid' })
    .reduce(function(sum, t) { return sum + (t.Price_Per_Person || 0) }, 0)

  return (
    <div>
      <Header />
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '48px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 }}>
          <div>
            <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 4 }}>שלום, {guide.Guide_Name}</h1>
            <p style={{ color: '#666' }}>{guide.Business_Name}</p>
          </div>
          <Link href="/add-tour" style={{ background: '#0A0A0A', color: '#fff', padding: '12px 24px', borderRadius: 8, fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>
            + הוסף סיור
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 40 }}>
          <div style={{ background: '#F5F5F5', borderRadius: 8, padding: 20 }}>
            <div style={{ fontSize: 28, fontWeight: 800 }}>{tours.length}</div>
            <div style={{ fontSize: 13, color: '#666' }}>סיורים פעילים</div>
          </div>
          <div style={{ background: '#F5F5F5', borderRadius: 8, padding: 20 }}>
            <div style={{ fontSize: 28, fontWeight: 800 }}>{tours.reduce(function(s, t) { return s + (t.Lead_Count || 0) }, 0)}</div>
            <div style={{ fontSize: 13, color: '#666' }}>פניות השבוע</div>
          </div>
          <div style={{ background: '#F5F5F5', borderRadius: 8, padding: 20 }}>
            <div style={{ fontSize: 28, fontWeight: 800 }}>₪{totalDue}</div>
            <div style={{ fontSize: 13, color: '#666' }}>חיוב חודשי צפוי</div>
          </div>
        </div>

        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>הסיורים שלי</h2>
        {tours.length === 0 ? (
