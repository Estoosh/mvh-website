import { SignIn } from '@clerk/nextjs'
import Header from '../../components/Header'
import Footer from '../../components/Footer'

export default function SignInPage() {
  return (
    <div style={{ fontFamily: 'Heebo, Arial, sans-serif', background: '#F7F1EA', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <main style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '64px 24px' }}>
        <SignIn />
      </main>
      <Footer />
    </div>
  )
}
