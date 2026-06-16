import { useUser } from '@clerk/nextjs'
import Header from '../components/Header'
import Link from 'next/link'

export default function Dashboard() {
  const { user, isLoaded } = useUser()

  if (!isLoaded) return <div style={{ padding: 40, textAlign: 'center' }}>טוען...</div>

  if (!user) return (
    <div style={{ padding: 40, textAlign: 'center' }}>
      <p>צריך להתחבר כדי לראות את הדשבורד</p>
      <Link href="/sign-in" style={{ color: '#C4922A' }}>כניסה</Link>
    </div>
  )

  return (
    <div>
      <Header />
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '48px 24px' }}>
        <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 8 }}>שלום, {user.firstName || user.emailAddresses[0].emailAddress}</h1>
        <p style={{ color: '#666', marginBottom: 40 }}>ברוך הבא לדשבורד מורה הדרך</p>
        <div style={{ background: '#F5F5F5', borderRadius: 8, padding: 24 }}>
          <p style={{ color: '#999' }}>עדיין אין סיורים. הוסף סיור ראשון.</p>
        </div>
      </div>
    </div>
  )
}
