export default function Button({ children, variant='primary', size='md', href, onClick, type='button', disabled, style }) {
  const base = { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 8, border: 'none', cursor: disabled ? 'not-allowed' : 'pointer', fontFamily: 'Heebo, Arial, sans-serif', fontWeight: 800, textDecoration: 'none', whiteSpace: 'nowrap', transition: 'opacity 0.15s ease', opacity: disabled ? 0.6 : 1 }
  const sizes = { sm: { padding: '8px 16px', fontSize: 13 }, md: { padding: '12px 24px', fontSize: 15 }, lg: { padding: '15px 32px', fontSize: 17 } }
  const variants = {
    primary:   { background: '#111111', color: '#fff' },
    brown:     { background: '#7E4821', color: '#fff', boxShadow: '0 8px 24px rgba(126,72,33,0.22)' },
    secondary: { background: '#FBF7F1', color: '#111', border: '1.5px solid #EDE7DF' },
    ghost:     { background: 'transparent', color: '#fff', border: '1.5px solid rgba(255,255,255,0.32)' },
    outline:   { background: 'transparent', color: '#7E4821', border: '1.5px solid #7E4821' },
    danger:    { background: '#ef4444', color: '#fff' },
  }
  const s = Object.assign({}, base, sizes[size]||sizes.md, variants[variant]||variants.primary, style)
  if (href) return <a href={href} style={s}>{children}</a>
  return <button type={type} onClick={onClick} disabled={disabled} style={s}>{children}</button>
}
