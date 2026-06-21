import { useState } from 'react'
import { supabase } from '../../../lib/supabase'
import { fmtPrice } from '../../../lib/prices'
import { T, card } from '../../../lib/theme'
import { Empty, ChangeBadge } from '../../../components/Shared'

export default function PagePortfolio({ ctx }) {
  const { positions, prices, refresh, user, balance } = ctx
  const [loading, setLoading] = useState(null)

  async function close(pos) {
    setLoading(pos.id)
    const cur = prices[pos.symbol]?.price ?? pos.entry_price
    const pnl = pos.side === 'buy' ? (cur - pos.entry_price) * pos.quantity : (pos.entry_price - cur) * pos.quantity
    const { data: prof } = await supabase.from('profiles').select('balance').eq('id', user.id).single()
    await supabase.from('positions').update({ status: 'closed', close_price: cur, pnl, closed_at: new Date().toISOString() }).eq('id', pos.id)
    await supabase.from('profiles').update({ balance: (prof?.balance ?? 0) + pos.total_cost + pnl }).eq('id', user.id)
    await supabase.from('trades').insert({ user_id: user.id, symbol: pos.symbol, asset_name: pos.asset_name, side: pos.side, quantity: pos.quantity, price: cur, total: cur * pos.quantity, pnl, action: 'close' })
    setLoading(null); refresh()
  }

  const totalValue = positions.reduce((acc, p) => {
    const cur = prices[p.symbol]?.price ?? p.entry_price
    return acc + cur * p.quantity
  }, 0)
  const totalPnl = positions.reduce((acc, p) => {
    const cur = prices[p.symbol]?.price ?? p.entry_price
    return acc + (p.side === 'buy' ? (cur - p.entry_price) * p.quantity : (p.entry_price - cur) * p.quantity)
  }, 0)
  const invested = positions.reduce((acc, p) => acc + p.total_cost, 0)

  if (!positions.length) return <Empty icon="💼" text="No tienes posiciones abiertas" sub="Ve al mercado y ejecuta tu primera operación" />

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          { l: 'Balance disponible', v: `$${fmtPrice(balance)}`, c: T.green },
          { l: 'Valor invertido', v: `$${fmtPrice(invested)}`, c: '#fff' },
          { l: 'Valor actual', v: `$${fmtPrice(totalValue)}`, c: T.blue },
          { l: 'P&L no realizado', v: `${totalPnl >= 0 ? '+' : ''}$${totalPnl.toFixed(2)}`, c: totalPnl >= 0 ? T.green : T.red },
        ].map(s => (
          <div key={s.l} style={card}>
            <div style={{ fontSize: '0.72rem', color: T.textMute, marginBottom: '0.3rem' }}>{s.l}</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: s.c }}>{s.v}</div>
          </div>
        ))}
      </div>
      <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 800 }}>
            <thead><tr style={{ background: T.input }}>
              {['Activo', 'Tipo', 'Cantidad', 'P. Entrada', 'P. Actual', 'P&L', 'Valor', ''].map(h => <th key={h} style={{ padding: '0.7rem 1rem', textAlign: 'left', fontSize: '0.7rem', color: T.textFaint, fontWeight: 700 }}>{h}</th>)}
            </tr></thead>
            <tbody>
              {positions.map(pos => {
                const cur = prices[pos.symbol]?.price ?? pos.entry_price
                const pnl = pos.side === 'buy' ? (cur - pos.entry_price) * pos.quantity : (pos.entry_price - cur) * pos.quantity
                const pct = (pnl / pos.total_cost) * 100
                return (
                  <tr key={pos.id} style={{ borderTop: `1px solid ${T.border}` }}>
                    <td style={{ padding: '0.85rem 1rem' }}><div style={{ fontWeight: 700 }}>{pos.symbol}</div><div style={{ fontSize: '0.72rem', color: T.textFaint }}>{pos.asset_name}</div></td>
                    <td style={{ padding: '0.85rem 1rem' }}><span style={{ background: pos.side === 'buy' ? `${T.green}22` : `${T.red}22`, color: pos.side === 'buy' ? T.green : T.red, padding: '0.2rem 0.6rem', borderRadius: 6, fontSize: '0.76rem', fontWeight: 600 }}>{pos.side === 'buy' ? '▲ Compra' : '▼ Venta'}</span></td>
                    <td style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>{pos.quantity}</td>
                    <td style={{ padding: '0.85rem 1rem' }}>${fmtPrice(pos.entry_price)}</td>
                    <td style={{ padding: '0.85rem 1rem', fontWeight: 700 }}>${fmtPrice(cur)}</td>
                    <td style={{ padding: '0.85rem 1rem' }}><div style={{ color: pnl >= 0 ? T.green : T.red, fontWeight: 700 }}>{pnl >= 0 ? '+' : ''}${pnl.toFixed(2)}</div><div style={{ fontSize: '0.72rem', color: pnl >= 0 ? T.green + '99' : T.red + '99' }}>{pct >= 0 ? '+' : ''}{pct.toFixed(2)}%</div></td>
                    <td style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>${fmtPrice(cur * pos.quantity)}</td>
                    <td style={{ padding: '0.85rem 1rem' }}><button onClick={() => close(pos)} disabled={loading === pos.id} style={{ background: `${T.red}22`, border: `1px solid ${T.red}44`, color: T.red, padding: '0.35rem 0.8rem', borderRadius: 7, cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}>{loading === pos.id ? '...' : 'Cerrar'}</button></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
