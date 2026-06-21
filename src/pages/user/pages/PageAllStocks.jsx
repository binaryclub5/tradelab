import { useState } from 'react'
import { ALL_ASSETS, SECTORS, fmtPrice, fmtMcap, fmtVolume } from '../../../lib/prices'
import { T, card, pill } from '../../../lib/theme'
import { ChangeBadge } from '../../../components/Shared'

export default function PageAllStocks({ ctx }) {
  const { prices, setPage } = ctx
  const [sector, setSector] = useState('Todos')
  const [sort, setSort] = useState('mcap')
  const [search, setSearch] = useState('')

  let rows = ALL_ASSETS.filter(a =>
    (sector === 'Todos' || a.sector === sector) &&
    (!search || a.symbol.toLowerCase().includes(search.toLowerCase()) || a.name.toLowerCase().includes(search.toLowerCase()))
  ).map(a => ({ ...a, ...(prices[a.symbol] || {}) }))

  if (sort === 'mcap') rows.sort((a, b) => (b.mcap || 0) - (a.mcap || 0))
  if (sort === 'price') rows.sort((a, b) => (b.price || 0) - (a.price || 0))
  if (sort === 'change') rows.sort((a, b) => (b.change || 0) - (a.change || 0))
  if (sort === 'name') rows.sort((a, b) => a.symbol.localeCompare(b.symbol))

  return (
    <div>
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Buscar..."
          style={{ flex: 1, minWidth: 200, background: T.input, border: `1px solid ${T.border}`, borderRadius: 10, padding: '0.65rem 1rem', color: '#fff', fontSize: '0.9rem' }} />
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          {[['mcap', 'Market Cap'], ['price', 'Precio'], ['change', '% Cambio'], ['name', 'A-Z']].map(([v, l]) => (
            <button key={v} onClick={() => setSort(v)} style={pill(T.blue, sort === v)}>{l}</button>
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        {['Todos', ...SECTORS].map(s => <button key={s} onClick={() => setSector(s)} style={pill(T.green, sector === s)}>{s}</button>)}
      </div>
      <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 760 }}>
            <thead><tr style={{ background: T.input }}>
              {['#', 'Compañía', 'Precio', 'Cambio', 'Market Cap', 'P/E', 'Volumen', 'Sector', ''].map(h => (
                <th key={h} style={{ padding: '0.7rem 1rem', textAlign: 'left', fontSize: '0.7rem', color: T.textFaint, fontWeight: 700, textTransform: 'uppercase' }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {rows.map((a, i) => (
                <tr key={a.symbol} style={{ borderTop: `1px solid ${T.border}` }}>
                  <td style={{ padding: '0.75rem 1rem', color: T.textFaint, fontSize: '0.82rem' }}>{i + 1}</td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.86rem' }}>{a.symbol}</div>
                    <div style={{ fontSize: '0.72rem', color: T.textFaint }}>{a.name}</div>
                  </td>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>{a.price ? `$${fmtPrice(a.price)}` : '—'}</td>
                  <td style={{ padding: '0.75rem 1rem' }}>{a.change != null ? <ChangeBadge value={a.change} /> : '—'}</td>
                  <td style={{ padding: '0.75rem 1rem', fontSize: '0.82rem' }}>{fmtMcap(a.mcap)}</td>
                  <td style={{ padding: '0.75rem 1rem', fontSize: '0.82rem', color: T.textMute }}>{a.pe ? a.pe.toFixed(1) : '—'}</td>
                  <td style={{ padding: '0.75rem 1rem', fontSize: '0.82rem', color: T.textMute }}>{fmtVolume(a.volume)}</td>
                  <td style={{ padding: '0.75rem 1rem' }}><span style={{ background: T.border, padding: '0.15rem 0.55rem', borderRadius: 6, fontSize: '0.72rem', color: T.textMute }}>{a.sector}</span></td>
                  <td style={{ padding: '0.75rem 1rem' }}><button onClick={() => setPage('stocks')} style={{ background: `${T.green}22`, border: `1px solid ${T.green}44`, color: T.green, padding: '0.3rem 0.7rem', borderRadius: 6, cursor: 'pointer', fontSize: '0.76rem' }}>Operar</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
