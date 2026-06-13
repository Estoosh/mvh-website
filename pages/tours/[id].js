import { tours } from '../../data/tours'
import Header from '../../components/Header'

export default function TourPage({ tour }) {
  if (!tour) return null

  const p = tour.guide.Phone_Number.replace(/\D/g, '').replace(/^0/, '')
  const w = 'https://wa.me/972' + p

  return (
    <div>
      <Header />
      <div style={{background:'#111',padding:'60px 24px'}}>
        <div style={{maxWidth:800,margin:'0 auto'}}>
          <h1 style={{color:'#fff',fontSize:40,fontWeight:800,marginBottom:16}}>{tour.Tour_Title}</h1>
          <p style={{color:'#999',fontSize:18}}>{tour.Tour_Teaser}</p>
        </div>
      </div>
      <div style={{maxWidth:800,margin:'0 auto',padding:'48px 24px'}}>
        <p style={{fontSize:16,lineHeight:1.8,color:'#444',marginBottom:32}}>{tour.Tour_Story}</p>
        <p style={{fontSize:20,fontWeight:700,marginBottom:8}}>{tour.Price_Per_Person} ILS</p>
        <p style={{marginBottom:8,color:'#555'}}>{tour.Cities_Tags.join(', ')}</p>
        <p style={{marginBottom:32,color:'#555'}}>{tour.guide.Guide_Name}</p>
        <a href={w} target="_blank" rel="noopener noreferrer"
          style={{background:'#25D366',color:'#fff',padding:'16px 32px',borderRadius:8,fontSize:18,fontWeight:700,textDecoration:'none'}}>
          WhatsApp
        </a>
      </div>
    </div>
  )
}

export async function getStaticPaths() {
  return { paths: tours.map(t => ({ params: { id: t.id } })), fallback: false }
}

export async function getStaticProps({ params }) {
  return { props: { tour: tours.find(t => t.id === params.id) || null } }
}
