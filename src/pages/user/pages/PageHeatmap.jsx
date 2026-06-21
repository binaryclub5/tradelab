import { useState } from 'react'
import { ALL_ASSETS, SECTORS, fmtPrice } from '../../../lib/prices'
import { T, pill } from '../../../lib/theme'

export default function PageHeatmap({ ctx }) {
  const { prices } = ctx
  const [sector, setSector] = useState('Todos')

  const items = ALL_ASSETS.filter(a => (sector === 'Todos' || a.sector === sector) && prices[a.symbol]?.price)
    .map(a => ({ ...a, ...prices[a.symbol] }))
    .sort((a, b) => (b.mcap || 1) - (a.mcap || 1))

  const color = (ch) => {
    if (ch == null) return '#1a2a42'
    if (ch >= 3) return '#00a878'
    if (ch >= 1.5) return '#10b981'
    if (ch >= 0.3) return '#34d399'
    if (ch > -0.3) return '#475569'
    if (ch > -1.5) return '#f87171'
    if (ch > -3) return '#ef4444'
    return '#dc2626'
  }
  const size = (mcap) => {
    if (mcap >= 2000) return { gridColumn: 'span 3', gridRow: 'span 3', minHeight: 140 }
    if (mcap >= 500) return { gridColumn: 'span 2', gridRow: 'span 2', minHeight: 100 }
    if (mcap >= 100) return { gridColumn: 'span 2', minHeight: 80 }
    return { minHeight: 70 }
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1.2rem', flexWrap: 'wrap' }}>
        {['Todos', ...SECTORS].map(s => <button key={s} onClick={() => setSector(s)} style={pill(T.green, sector === s)}>{s}</button>)}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 6, gridAutoRows: 'minmax(70px, auto)' }}>
        {items.map(a => (
          <div key={a.symbol} style={{ ...size(a.mcap || 50), background: color(a.change), borderRadius: 8, padding: '0.7rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', cursor: 'pointer', transition: 'transform .15s' }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.03)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
            <div style={{ fontWeight: 800, fontSize: a.mcap >= 500 ? '1rem' : '0.8rem', color: '#fff' }}>{a.symbol}</div>
            <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.9)' }}>${fmtPrice(a.price)}</div>
            <div style={{ fontSize: '0.78rem', color: '#fff', fontWeight: 700 }}>{a.change >= 0 ? '+' : ''}{a.change?.toFixed(2)}%</div>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 4, marginTop: '1.5rem', alignItems: 'center' }}>
        <span style={{ fontSize: '0.7rem', color: T.textMute, marginRight: 8 }}>▼ -3%</span>
        {['#dc2626', '#ef4444', '#f87171', '#475569', '#34d399', '#10b981', '#00a878'].map(c => <div key={c} style={{ width: 28, height: 14, background: c, borderRadius: 3 }} />)}
        <span style={{ fontSize: '0.7rem', color: T.textMute, marginLeft: 8 }}>+3% ▲</span>
      </div>
    </div>
  )
}
