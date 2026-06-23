export default function GuideCard({ guide }) {
  const tags = guide.Guide_Tags ? guide.Guide_Tags.split(',').map(t=>t.trim()).filter(Boolean) : guide.tags||[]
  const photo = guide.Guide_Photo || guide.img || null
  const name = guide.Guide_Name || guide.name || 'מדריך'
  const region = guide.Guide_Region || guide.region || ''
  const bio = guide.Guide_Bio || guide.desc || ''
  const tours = guide.Tour_Count || guide.tours || 0
  const episodes = guide.Episode_Count || guide.episodes || 0

  return (
    <article style={{ display:'grid', gridTemplateColumns:'160px 1fr', borderRadius:18, overflow:'hidden', border:'1px solid #EDE7DF', background:'#FBF7F1', boxShadow:'0 4px 12px rgba(0,0,0,0.07)', fontFamily:'Heebo,Arial,sans-serif', scrollSnapAlign:'start' }}>
      <div style={{ background:'#1a0d06', minHeight:240 }}>
        {photo && <img src={photo} alt={name} style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }} onError={e=>e.target.style.display='none'} />}
      </div>
      <div style={{ padding:'22px 20px', display:'flex', flexDirection:'column', gap:8 }}>
        <h3 style={{ fontSize:20, fontWeight:900 }}>{name}</h3>
        {region && <p style={{ fontSize:13, color:'#6B6B6B' }}>📍 {region}</p>}
        {bio && <p style={{ fontSize:14, color:'#555', lineHeight:1.65 }}>{bio}</p>}
        {tags.length>0 && <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
          {tags.map(t=><span key={t} style={{ background:'rgba(126,72,33,0.08)', color:'#7E4821', border:'1px solid rgba(126,72,33,0.18)', borderRadius:9999, fontSize:12, fontWeight:700, padding:'3px 10px' }}>{t}</span>)}
        </div>}
        <div style={{ display:'flex', gap:14, fontSize:13, color:'#6B6B6B' }}>
          {episodes>0 && <span>🎧 {episodes} פרקים</span>}
          {tours>0 && <span>🗺 {tours} סיורים</span>}
        </div>
        <a href={guide.id ? '/guides/'+guide.id : '/join'} style={{ display:'flex', alignItems:'center', justifyContent:'center', marginTop:'auto', background:'#111', color:'#fff', borderRadius:8, padding:11, fontSize:14, fontWeight:800, textDecoration:'none' }}>לפרופיל המלא ←</a>
      </div>
    </article>
  )
}
