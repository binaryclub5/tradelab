import { T } from '../lib/theme'
import { fmtPrice, fmtChange } from '../lib/prices'

// Sparkline SVG
export function Sparkline({ data = [], color, width = 120, height = 36 }) {
  if (!data.length) return <div style={{ width, height }} />
  const min = Math.min(...data), max = Math.max(...data)
  const range = max - min || 1
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width
    const y = height - ((v - min) / range) * height
    return `${x},${y}`
  }).join(' ')
  const up = data[data.length - 1] >= data[0]
  const c = color || (up ? T.green : T.red)
  return (
    <svg width={width} height={height} style={{ display: 'block' }}>
      <polyline points={pts} fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// Mini barras
export function MiniBars({ values = [], height = 40 }) {
  if (!values.length) return null
  const max = Math.max(...values.map(Math.abs)) || 1
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height }}>
      {values.map((v, i) => (
        <div key={i} style={{
          flex: 1, borderRadius: 1,
          height: `${Math.max(8, (Math.abs(v) / max) * 100)}%`,
          background: v >= 0 ? `${T.green}66` : `${T.red}66`, minHeight: 3,
        }} />
      ))}
    </div>
  )
}

// Badge de cambio %
export function ChangeBadge({ value, size = 'sm' }) {
  const pos = (value ?? 0) >= 0
  const pad = size === 'lg' ? '0.3rem 0.7rem' : '0.15rem 0.5rem'
  const fs = size === 'lg' ? '0.85rem' : '0.78rem'
  return (
    <span style={{ background: pos ? `${T.green}22` : `${T.red}22`, color: pos ? T.green : T.red, padding: pad, borderRadius: 6, fontSize: fs, fontWeight: 700, whiteSpace: 'nowrap' }}>
      {fmtChange(value)}
    </span>
  )
}

// Loading
export function Loading({ text = 'Cargando...' }) {
  return (
    <div style={{ textAlign: 'center', padding: '3rem', color: T.textMute }}>
      <div style={{ display: 'inline-block', width: 28, height: 28, border: `3px solid ${T.border}`, borderTopColor: T.green, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <div style={{ marginTop: '1rem', fontSize: '0.9rem' }}>{text}</div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

// Empty state
export function Empty({ icon = '📭', text, sub }) {
  return (
    <div style={{ textAlign: 'center', padding: '4rem 2rem', color: T.textFaint }}>
      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{icon}</div>
      <div style={{ fontSize: '1.1rem', color: T.textMute }}>{text}</div>
      {sub && <div style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>{sub}</div>}
    </div>
  )
}

// Tab bar
export function Tabs({ tabs, active, onChange }) {
  return (
    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1.2rem' }}>
      {tabs.map(t => {
        const val = typeof t === 'string' ? t : t.value
        const label = typeof t === 'string' ? t : t.label
        return (
          <button key={val} onClick={() => onChange(val)}
            style={{ background: active === val ? `${T.green}22` : T.panel2, border: `1px solid ${active === val ? T.green : T.border}`, color: active === val ? T.green : T.textMute, padding: '0.45rem 1rem', borderRadius: 8, cursor: 'pointer', fontSize: '0.83rem', fontWeight: active === val ? 600 : 400 }}>
            {label}
          </button>
        )
      })}
    </div>
  )
}
