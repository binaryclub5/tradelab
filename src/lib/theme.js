// Tema centralizado TradeLab
export const T = {
  bg: '#060d1a',
  panel: '#0d1a30',
  panel2: '#0a1628',
  input: '#06101e',
  border: '#1a2a42',
  border2: '#1e2d4a',
  green: '#00d4aa',
  blue: '#0066ff',
  red: '#ff6b6b',
  amber: '#f59e0b',
  purple: '#a855f7',
  cyan: '#06b6d4',
  text: '#ffffff',
  textDim: '#8899bb',
  textMute: '#556680',
  textFaint: '#445',
}

export const card = {
  background: T.panel,
  border: `1px solid ${T.border}`,
  borderRadius: 14,
  padding: '1.3rem',
}

export const sectionTitle = {
  fontSize: '0.7rem',
  fontWeight: 700,
  color: T.textFaint,
  letterSpacing: '0.08em',
  marginBottom: '1rem',
  textTransform: 'uppercase',
}

export const pill = (color, active) => ({
  background: active ? `${color}22` : T.panel,
  border: `1px solid ${active ? color : T.border}`,
  color: active ? color : T.textMute,
  padding: '0.4rem 0.9rem',
  borderRadius: 8,
  cursor: 'pointer',
  fontSize: '0.82rem',
  fontWeight: active ? 600 : 400,
  transition: 'all .15s',
  whiteSpace: 'nowrap',
})

export const btn = (variant = 'primary') => {
  const base = { border: 'none', borderRadius: 9, cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem', padding: '0.6rem 1.2rem', transition: 'all .15s' }
  if (variant === 'primary') return { ...base, background: `linear-gradient(135deg,${T.green},${T.blue})`, color: '#000' }
  if (variant === 'ghost') return { ...base, background: T.border, color: T.textDim }
  if (variant === 'buy') return { ...base, background: T.green, color: '#000' }
  if (variant === 'sell') return { ...base, background: T.red, color: '#fff' }
  return base
}
