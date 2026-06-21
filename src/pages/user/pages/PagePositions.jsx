import { useState } from 'react'
import { fmtPrice } from '../../../lib/prices'
import { T, card } from '../../../lib/theme'
import { Empty, Tabs } from '../../../components/Shared'

export default function PagePositions({ ctx }) {
  const { positions, prices } = ctx
  const [tab, setTab] = useState('Hoy')

  const totalPnl = positions.reduce((acc, p) => {
    const cur = prices[p.symbol]?.price ?? p.entry_price
    return acc + (p.side === 'buy' ? (cur - p.entry_price) * p.quantity : (p.entry_price - cur) * p.quantity)
  }, 0)

  return (
    <div>
      <Tabs tabs={['Hoy', 'Holdings', 'Resumen P&L']} active={tab} onChange={setTab} />
      {tab === 'Resumen P&L' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1rem' }}>
          {[
            { l: 'P&L Total no realizado', v: `${totalPnl >= 0 ? '+' : ''}$${totalPnl.toFixed(2)}`, c: totalPnl >= 0 ? T.green : T.red },
            { l: 'Posiciones abiertas', v: positions.length, c: '#fff' },
            { l: 'Posiciones ganadoras', v: positions.filter(p => { const cur = prices[p.symbol]?.price ?? p.entry_price; const pnl = p.side === 'buy' ? cur - p.entry_price : p.entry_price - cur; return pnl > 0 }).length, c: T.green },
          ].map(s => (
            <div key={s.l} style={card}><div style={{ fontSize: '0.72rem', color: T.textMute, marginBottom: '0.3rem' }}>{s.l}</div><div style={{ fontSize: '1.6rem', fontWeight: 800, color: s.c }}>{s.v}</div></div>
          ))}
        </div>
      ) : !positions.length ? (
        <Empty icon="📍" text="No hay posiciones abiertas" />
      ) : (
        <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 640 }}>
              <thead><tr style={{ background: T.input }}>
                {['Activo', 'Lado', 'Cantidad', 'Entrada', 'Actual', 'P&L'].map(h => <th key={h} style={{ padding: '0.7rem 1rem', textAlign: 'left', fontSize: '0.7rem', color: T.textFaint, fontWeight: 700 }}>{h}</th>)}
              </tr></thead>
              <tbody>
                {positions.map(pos => {
                  const cur = prices[pos.symbol]?.price ?? pos.entry_price
                  const pnl = pos.side === 'buy' ? (cur - pos.entry_price) * pos.quantity : (pos.entry_price - cur) * pos.quantity
                  return (
                    <tr key={pos.id} style={{ borderTop: `1px solid ${T.border}` }}>
                      <td style={{ padding: '0.85rem 1rem', fontWeight: 700 }}>{pos.symbol}</td>
                      <td style={{ padding: '0.85rem 1rem', color: pos.side === 'buy' ? T.green : T.red, fontSize: '0.85rem' }}>{pos.side === 'buy' ? 'Long' : 'Short'}</td>
                      <td style={{ padding: '0.85rem 1rem' }}>{pos.quantity}</td>
                      <td style={{ padding: '0.85rem 1rem' }}>${fmtPrice(pos.entry_price)}</td>
                      <td style={{ padding: '0.85rem 1rem', fontWeight: 700 }}>${fmtPrice(cur)}</td>
                      <td style={{ padding: '0.85rem 1rem', color: pnl >= 0 ? T.green : T.red, fontWeight: 700 }}>{pnl >= 0 ? '+' : ''}${pnl.toFixed(2)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
