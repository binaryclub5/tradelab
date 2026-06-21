import { useState } from 'react'
import { ALL_ASSETS, INDICES, fmtPrice } from '../../../lib/prices'
import { T, card, pill } from '../../../lib/theme'
import { ChangeBadge } from '../../../components/Shared'

export default function PageGlobalMarkets({ ctx }) {
  const { prices } = ctx
  const [cat, setCat] = useState('Todos')
  const cats = ['Todos', 'Índices', 'Crypto', 'Forex', 'Materias Primas']

  const items = [
    ...INDICES.map(i => ({ ...i, sector: 'Índices', ...(prices[i.symbol] || {}) })),
    ...ALL_ASSETS.filter(a => ['Crypto', 'Forex', 'Materias Primas'].includes(a.sector)).map(a => ({ ...a, ...(prices[a.symbol] || {}) }))
  ].filter(i => cat === 'Todos' || i.sector === cat)

  return (
    <div>
      <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1.2rem', flexWrap: 'wrap' }}>
        {cats.map(c => <button key={c} onClick={() => setCat(c)} style={pill(T.cyan, cat === c)}>{c}</button>)}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: '1rem' }}>
        {items.map(it => {
          const pos = (it.change ?? 0) >= 0
          return (
            <div key={it.symbol} style={{ ...card, padding: '1.1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{it.name || it.symbol}</div>
                  <div style={{ fontSize: '0.7rem', color: T.textFaint }}>{it.sub || it.sector}</div>
                </div>
                {it.change != null && <ChangeBadge value={it.change} />}
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: pos ? T.green : T.red }}>{it.price ? `$${fmtPrice(it.price)}` : '—'}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
