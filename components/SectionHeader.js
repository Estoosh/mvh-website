export default function SectionHeader({ title, linkText, linkHref, center }) {
  return (
    <div style={{ display:'flex', justifyContent: center?'center':'space-between', alignItems:'center', marginBottom:24, fontFamily:'Heebo,Arial,sans-serif' }}>
      <h2 style={{ fontSize:'clamp(20px,2.8vw,28px)', fontWeight:900, letterSpacing:'-0.5px', color:'#111' }}>{title}</h2>
      {linkText && linkHref && !center && (
        <a href={linkHref} style={{ color:'#7E4821', fontSize:14, fontWeight:800, textDecoration:'none' }}>{linkText} ←</a>
      )}
    </div>
  )
}
