import { useState } from 'react'
import { ALL_ASSETS, SECTORS, fmtPrice } from '../../../lib/prices'
import { T, card, pill } from '../../../lib/theme'
import { ChangeBadge } from '../../../components/Shared'

function signal(rsi, change) {
  const r = rsi || (50 + (change || 0) * 2)
  if (r >= 70) return { label: 'SOBRECOMPRA', color: T.red, action: 'Vender' }
  if (r >= 60) return { label: 'COMPRA', color: T.green, action: 'Comprar' }
  if (r >= 45) return { label: 'NEUTRAL', color: T.amber, action: 'Mantener' }
  if (r >= 30) return { label: 'VENTA', color: '#f87171', action: 'Vender' }
  return { label: 'SOBREVENTA', color: T.green, action: 'Comprar' }
}

export default function PageTechnicals({ ctx }) {
  const { prices } = ctx
  const [filter, setFilter] = useState('Todos')
  const filters = ['Todos', 'Compra Fuerte', 'Compra', 'Neutral', 'Venta', 'Sobreventa', 'Sobrecompra']

  let rows = ALL_ASSETS.filter(a => prices[a.symbol]?.price).map(a => {
    const p = prices[a.symbol]
    const rsi = p.rsi || Math.max(5, Math.min(95, 50 + (p.change || 0) * 3 + (Math.random() - 0.5) * 10))
    return { ...a, ...p, rsi, sig: signal(rsi, p.change) }
  })

  if (filter === 'Sobreventa') rows = rows.filter(r => r.rsi < 30)
  if (filter === 'Sobrecompra') rows = rows.filter(r => r.rsi > 70)
  if (filter === 'Compra' || filter === 'Compra Fuerte') rows = rows.filter(r => r.sig.action === 'Comprar')
  if (filter === 'Venta') rows = rows.filter(r => r.sig.action === 'Vender')
  if (filter === 'Neutral') rows = rows.filter(r => r.sig.action === 'Mantener')

  return (
    <div>
      <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1.2rem', flexWrap: 'wrap' }}>
        {filters.map(f => <button key={f} onClick={() => setFilter(f)} style={pill(T.purple, filter === f)}>{f}</button>)}
      </div>
      <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 720 }}>
            <thead><tr style={{ background: T.input }}>
              {['Símbolo', 'Precio', 'Cambio', 'RSI (14)', 'Señal', 'Tendencia', 'Acción'].map(h => <th key={h} style={{ padding: '0.7rem 1rem', textAlign: 'left', fontSize: '0.7rem', color: T.textFaint, fontWeight: 700 }}>{h}</th>)}
            </tr></thead>
            <tbody>
              {rows.map(a => (
                <tr key={a.symbol} style={{ borderTop: `1px solid ${T.border}` }}>
                  <td style={{ padding: '0.75rem 1rem' }}><div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{a.symbol}</div><div style={{ fontSize: '0.7rem', color: T.textFaint }}>{a.name}</div></td>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>${fmtPrice(a.price)}</td>
                  <td style={{ padding: '0.75rem 1rem' }}><ChangeBadge value={a.change} /></td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontWeight: 700, fontSize: '0.85rem', color: a.rsi > 70 ? T.red : a.rsi < 30 ? T.green : '#aab' }}>{a.rsi.toFixed(0)}</span>
                      <div style={{ width: 50, height: 5, background: T.input, borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{ width: `${a.rsi}%`, height: '100%', background: a.rsi > 70 ? T.red : a.rsi < 30 ? T.green : T.amber }} />
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '0.75rem 1rem' }}><span style={{ background: `${a.sig.color}22`, color: a.sig.color, padding: '0.2rem 0.6rem', borderRadius: 6, fontSize: '0.74rem', fontWeight: 700 }}>{a.sig.label}</span></td>
                  <td style={{ padding: '0.75rem 1rem', color: (a.change || 0) >= 0 ? T.green : T.red, fontSize: '0.85rem' }}>{(a.change || 0) >= 0 ? '↗ Alcista' : '↘ Bajista'}</td>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 600, fontSize: '0.82rem', color: a.sig.color }}>{a.sig.action}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
