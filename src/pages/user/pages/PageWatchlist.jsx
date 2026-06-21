import { ALL_ASSETS, fmtPrice } from '../../../lib/prices'
import { T, card } from '../../../lib/theme'
import { Empty, ChangeBadge } from '../../../components/Shared'

export default function PageWatchlist({ ctx }) {
  const { watchlist, prices, toggleWatch, setPage } = ctx
  const items = ALL_ASSETS.filter(a => watchlist.includes(a.symbol)).map(a => ({ ...a, ...(prices[a.symbol] || {}) }))

  if (!items.length) return <Empty icon="👁" text="Tu watchlist está vacía" sub="Marca activos con ★ desde el mercado para seguirlos aquí" />

  return (
    <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 600 }}>
          <thead><tr style={{ background: T.input }}>
            {['Activo', 'Precio', 'Cambio 24h', 'Sector', ''].map(h => <th key={h} style={{ padding: '0.7rem 1rem', textAlign: 'left', fontSize: '0.7rem', color: T.textFaint, fontWeight: 700 }}>{h}</th>)}
          </tr></thead>
          <tbody>
            {items.map(a => (
              <tr key={a.symbol} style={{ borderTop: `1px solid ${T.border}` }}>
                <td style={{ padding: '0.85rem 1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span onClick={() => toggleWatch(a.symbol)} style={{ cursor: 'pointer', color: T.amber }}>★</span>
                    <div><div style={{ fontWeight: 700 }}>{a.symbol}</div><div style={{ fontSize: '0.72rem', color: T.textFaint }}>{a.name}</div></div>
                  </div>
                </td>
                <td style={{ padding: '0.85rem 1rem', fontWeight: 700 }}>{a.price ? `$${fmtPrice(a.price)}` : '—'}</td>
                <td style={{ padding: '0.85rem 1rem' }}>{a.change != null ? <ChangeBadge value={a.change} /> : '—'}</td>
                <td style={{ padding: '0.85rem 1rem' }}><span style={{ background: T.border, padding: '0.15rem 0.55rem', borderRadius: 6, fontSize: '0.72rem', color: T.textMute }}>{a.sector}</span></td>
                <td style={{ padding: '0.85rem 1rem' }}><button onClick={() => setPage('stocks')} style={{ background: `${T.green}22`, border: `1px solid ${T.green}44`, color: T.green, padding: '0.3rem 0.7rem', borderRadius: 6, cursor: 'pointer', fontSize: '0.76rem' }}>Operar</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
