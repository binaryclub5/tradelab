import { useState } from 'react'
import { ALL_ASSETS, fmtPrice, fmtMcap } from '../../../lib/prices'
import { T, card, btn } from '../../../lib/theme'
import { ChangeBadge } from '../../../components/Shared'

export default function PageCompare({ ctx }) {
  const { prices } = ctx
  const [a, setA] = useState('AAPL')
  const [b, setB] = useState('MSFT')
  const da = { ...ALL_ASSETS.find(x => x.symbol === a), ...(prices[a] || {}) }
  const db = { ...ALL_ASSETS.find(x => x.symbol === b), ...(prices[b] || {}) }

  const rows = [
    ['Precio', da.price ? `$${fmtPrice(da.price)}` : '—', db.price ? `$${fmtPrice(db.price)}` : '—'],
    ['Cambio 24h', da.change, db.change, true],
    ['Market Cap', fmtMcap(da.mcap), fmtMcap(db.mcap)],
    ['P/E Ratio', da.pe ? da.pe.toFixed(1) : '—', db.pe ? db.pe.toFixed(1) : '—'],
    ['Máx día', da.high ? `$${fmtPrice(da.high)}` : '—', db.high ? `$${fmtPrice(db.high)}` : '—'],
    ['Mín día', da.low ? `$${fmtPrice(da.low)}` : '—', db.low ? `$${fmtPrice(db.low)}` : '—'],
    ['Sector', da.sector, db.sector],
  ]
  const sel = { background: T.input, border: `1px solid ${T.border}`, borderRadius: 8, padding: '0.6rem', color: '#fff', fontSize: '0.9rem', width: '100%' }

  return (
    <div style={{ maxWidth: 700, margin: '0 auto' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
        <select value={a} onChange={e => setA(e.target.value)} style={sel}>{ALL_ASSETS.map(x => <option key={x.symbol} value={x.symbol}>{x.symbol} — {x.name}</option>)}</select>
        <select value={b} onChange={e => setB(e.target.value)} style={sel}>{ALL_ASSETS.map(x => <option key={x.symbol} value={x.symbol}>{x.symbol} — {x.name}</option>)}</select>
      </div>
      <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', background: T.input, padding: '1rem', textAlign: 'center', fontWeight: 700 }}>
          <div style={{ color: T.textFaint, fontSize: '0.78rem', textAlign: 'left' }}>MÉTRICA</div>
          <div style={{ color: T.green }}>{a}</div>
          <div style={{ color: T.blue }}>{b}</div>
        </div>
        {rows.map(([label, va, vb, isChange]) => (
          <div key={label} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', padding: '0.85rem 1rem', borderTop: `1px solid ${T.border}`, textAlign: 'center', alignItems: 'center' }}>
            <div style={{ color: T.textMute, fontSize: '0.82rem', textAlign: 'left' }}>{label}</div>
            <div>{isChange ? <ChangeBadge value={va} /> : <span style={{ fontWeight: 600 }}>{va}</span>}</div>
            <div>{isChange ? <ChangeBadge value={vb} /> : <span style={{ fontWeight: 600 }}>{vb}</span>}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
