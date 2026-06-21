import { useState } from 'react'
import { ALL_ASSETS, SECTORS, fmtPrice, fmtMcap } from '../../../lib/prices'
import { T, card, pill, btn } from '../../../lib/theme'
import { ChangeBadge } from '../../../components/Shared'

export default function PageScreener({ ctx }) {
  const { prices, setPage } = ctx
  const [f, setF] = useState({ sector: 'Todos', minPrice: '', maxPrice: '', minPE: '', maxPE: '', minChange: '', sort: 'change_desc' })
  const [applied, setApplied] = useState(null)

  function apply() { setApplied({ ...f }) }

  let rows = []
  if (applied) {
    rows = ALL_ASSETS.map(a => ({ ...a, ...(prices[a.symbol] || {}) })).filter(a => {
      if (applied.sector !== 'Todos' && a.sector !== applied.sector) return false
      if (applied.minPrice && a.price < parseFloat(applied.minPrice)) return false
      if (applied.maxPrice && a.price > parseFloat(applied.maxPrice)) return false
      if (applied.minPE && (a.pe || 0) < parseFloat(applied.minPE)) return false
      if (applied.maxPE && (a.pe || 999) > parseFloat(applied.maxPE)) return false
      if (applied.minChange && (a.change || 0) < parseFloat(applied.minChange)) return false
      return true
    })
    if (applied.sort === 'change_desc') rows.sort((a, b) => (b.change || 0) - (a.change || 0))
    if (applied.sort === 'change_asc') rows.sort((a, b) => (a.change || 0) - (b.change || 0))
    if (applied.sort === 'price_desc') rows.sort((a, b) => (b.price || 0) - (a.price || 0))
    if (applied.sort === 'mcap') rows.sort((a, b) => (b.mcap || 0) - (a.mcap || 0))
  }

  const inp = { width: '100%', background: T.input, border: `1px solid ${T.border}`, borderRadius: 8, padding: '0.55rem 0.7rem', color: '#fff', fontSize: '0.85rem', boxSizing: 'border-box' }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '1.3rem' }}>
      <div style={{ ...card, alignSelf: 'start' }}>
        <h3 style={{ fontSize: '0.95rem', margin: '0 0 1.2rem' }}>🔎 Filtros</h3>
        <label style={{ fontSize: '0.76rem', color: T.textMute, display: 'block', marginBottom: '0.3rem' }}>Sector</label>
        <select value={f.sector} onChange={e => setF({ ...f, sector: e.target.value })} style={{ ...inp, marginBottom: '1rem' }}>
          {['Todos', ...SECTORS].map(s => <option key={s}>{s}</option>)}
        </select>
        {[['minPrice', 'Precio mínimo ($)'], ['maxPrice', 'Precio máximo ($)'], ['minPE', 'P/E mínimo'], ['maxPE', 'P/E máximo'], ['minChange', 'Cambio % mínimo']].map(([k, l]) => (
          <div key={k} style={{ marginBottom: '0.8rem' }}>
            <label style={{ fontSize: '0.76rem', color: T.textMute, display: 'block', marginBottom: '0.3rem' }}>{l}</label>
            <input type="number" value={f[k]} onChange={e => setF({ ...f, [k]: e.target.value })} style={inp} />
          </div>
        ))}
        <label style={{ fontSize: '0.76rem', color: T.textMute, display: 'block', marginBottom: '0.3rem' }}>Ordenar por</label>
        <select value={f.sort} onChange={e => setF({ ...f, sort: e.target.value })} style={{ ...inp, marginBottom: '1.2rem' }}>
          <option value="change_desc">Cambio % (mayor)</option>
          <option value="change_asc">Cambio % (menor)</option>
          <option value="price_desc">Precio (mayor)</option>
          <option value="mcap">Market Cap</option>
        </select>
        <button onClick={apply} style={{ ...btn('primary'), width: '100%' }}>Aplicar Filtros</button>
      </div>

      <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
        {!applied ? (
          <div style={{ textAlign: 'center', color: T.textFaint, padding: '5rem 2rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔎</div>
            <div>Configura los filtros y presiona "Aplicar"</div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <div style={{ padding: '1rem 1.2rem', borderBottom: `1px solid ${T.border}`, fontSize: '0.85rem', color: T.textMute }}>{rows.length} resultados encontrados</div>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 600 }}>
              <thead><tr style={{ background: T.input }}>
                {['Símbolo', 'Precio', 'Cambio', 'P/E', 'Market Cap', 'Sector', ''].map(h => <th key={h} style={{ padding: '0.7rem 1rem', textAlign: 'left', fontSize: '0.7rem', color: T.textFaint, fontWeight: 700 }}>{h}</th>)}
              </tr></thead>
              <tbody>
                {rows.map(a => (
                  <tr key={a.symbol} style={{ borderTop: `1px solid ${T.border}` }}>
                    <td style={{ padding: '0.75rem 1rem' }}><div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{a.symbol}</div><div style={{ fontSize: '0.7rem', color: T.textFaint }}>{a.name}</div></td>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>${fmtPrice(a.price)}</td>
                    <td style={{ padding: '0.75rem 1rem' }}><ChangeBadge value={a.change} /></td>
                    <td style={{ padding: '0.75rem 1rem', fontSize: '0.82rem', color: T.textMute }}>{a.pe ? a.pe.toFixed(1) : '—'}</td>
                    <td style={{ padding: '0.75rem 1rem', fontSize: '0.82rem' }}>{fmtMcap(a.mcap)}</td>
                    <td style={{ padding: '0.75rem 1rem' }}><span style={{ background: T.border, padding: '0.15rem 0.5rem', borderRadius: 6, fontSize: '0.72rem', color: T.textMute }}>{a.sector}</span></td>
                    <td style={{ padding: '0.75rem 1rem' }}><button onClick={() => setPage('stocks')} style={{ background: `${T.green}22`, border: `1px solid ${T.green}44`, color: T.green, padding: '0.25rem 0.65rem', borderRadius: 6, cursor: 'pointer', fontSize: '0.74rem' }}>Operar</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
