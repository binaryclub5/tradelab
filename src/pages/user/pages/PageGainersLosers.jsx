import { ALL_ASSETS, fmtPrice, fmtVolume } from '../../../lib/prices'
import { T, card } from '../../../lib/theme'
import { ChangeBadge } from '../../../components/Shared'

function Table({ title, rows, color, setPage }) {
  return (
    <div style={card}>
      <h3 style={{ fontSize: '1rem', margin: '0 0 1rem', color }}>{title}</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead><tr style={{ background: T.input }}>
          {['Símbolo', 'Precio', 'Cambio', 'Volumen', ''].map(h => <th key={h} style={{ padding: '0.6rem 0.8rem', textAlign: 'left', fontSize: '0.68rem', color: T.textFaint, fontWeight: 700 }}>{h}</th>)}
        </tr></thead>
        <tbody>
          {rows.map(a => (
            <tr key={a.symbol} style={{ borderTop: `1px solid ${T.border}` }}>
              <td style={{ padding: '0.65rem 0.8rem' }}><div style={{ fontWeight: 700, fontSize: '0.84rem' }}>{a.symbol}</div><div style={{ fontSize: '0.7rem', color: T.textFaint }}>{a.name}</div></td>
              <td style={{ padding: '0.65rem 0.8rem', fontWeight: 700, fontSize: '0.84rem' }}>${fmtPrice(a.price)}</td>
              <td style={{ padding: '0.65rem 0.8rem' }}><ChangeBadge value={a.change} /></td>
              <td style={{ padding: '0.65rem 0.8rem', fontSize: '0.78rem', color: T.textMute }}>{fmtVolume(a.volume)}</td>
              <td style={{ padding: '0.65rem 0.8rem' }}><button onClick={() => setPage('stocks')} style={{ background: `${color}22`, border: `1px solid ${color}44`, color, padding: '0.25rem 0.65rem', borderRadius: 6, cursor: 'pointer', fontSize: '0.74rem' }}>Operar</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function PageGainersLosers({ ctx }) {
  const { prices, setPage } = ctx
  const withP = ALL_ASSETS.filter(a => prices[a.symbol]?.price).map(a => ({ ...a, ...prices[a.symbol] }))
  const gainers = [...withP].sort((a, b) => b.change - a.change).slice(0, 10)
  const losers = [...withP].sort((a, b) => a.change - b.change).slice(0, 10)
  const active = [...withP].sort((a, b) => (b.volume || 0) - (a.volume || 0)).slice(0, 10)

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(320px,1fr))', gap: '1rem' }}>
      <Table title="🟢 Top Ganadoras" rows={gainers} color={T.green} setPage={setPage} />
      <Table title="🔴 Top Perdedoras" rows={losers} color={T.red} setPage={setPage} />
      <Table title="🔥 Más Activas (Volumen)" rows={active} color={T.amber} setPage={setPage} />
    </div>
  )
}
