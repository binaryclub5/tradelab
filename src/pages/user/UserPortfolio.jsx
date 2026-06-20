import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'

export default function UserPortfolio({ positions, prices, onClose }) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(null)
  const [msg, setMsg] = useState(null)

  async function closePosition(pos) {
    setLoading(pos.id); setMsg(null)
    const currentPrice = prices[pos.symbol]?.price ?? pos.entry_price
    const pnl = pos.side === 'buy'
      ? (currentPrice - pos.entry_price) * pos.quantity
      : (pos.entry_price - currentPrice) * pos.quantity

    const { data: profile } = await supabase.from('profiles').select('balance').eq('id', user.id).single()
    const newBalance = (profile?.balance ?? 0) + pos.total_cost + pnl

    await supabase.from('positions').update({ status: 'closed', close_price: currentPrice, pnl, closed_at: new Date().toISOString() }).eq('id', pos.id)
    await supabase.from('profiles').update({ balance: newBalance }).eq('id', user.id)
    await supabase.from('trades').insert({
      user_id: user.id, symbol: pos.symbol, asset_name: pos.asset_name,
      side: pos.side, quantity: pos.quantity, price: currentPrice, total: currentPrice * pos.quantity, pnl, action: 'close'
    })
    setMsg({ id: pos.id, pnl })
    setLoading(null)
    onClose()
  }

  if (!positions.length) return (
    <div style={{ textAlign: 'center', padding: '4rem', color: '#445' }}>
      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📂</div>
      <div style={{ fontSize: '1.1rem' }}>No tienes posiciones abiertas</div>
      <div style={{ fontSize: '0.85rem', marginTop: '0.5rem', color: '#334' }}>Ve al mercado y ejecuta tu primera operación</div>
    </div>
  )

  return (
    <div>
      <h2 style={{ margin: '0 0 1.5rem', fontSize: '1.3rem' }}>Posiciones abiertas</h2>
      <div style={{ background: '#0d1a30', border: '1px solid #1e2d4a', borderRadius: 14, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#06101e' }}>
              {['Activo', 'Tipo', 'Cantidad', 'Precio entrada', 'Precio actual', 'P&L', 'Valor total', ''].map(h => (
                <th key={h} style={{ padding: '0.8rem 1rem', textAlign: 'left', fontSize: '0.75rem', color: '#556', fontWeight: 600, textTransform: 'uppercase' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {positions.map(pos => {
              const currentPrice = prices[pos.symbol]?.price ?? pos.entry_price
              const pnl = pos.side === 'buy'
                ? (currentPrice - pos.entry_price) * pos.quantity
                : (pos.entry_price - currentPrice) * pos.quantity
              const pnlPct = (pnl / pos.total_cost) * 100
              return (
                <tr key={pos.id} style={{ borderTop: '1px solid #1e2d4a' }}>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ fontWeight: 700 }}>{pos.symbol}</div>
                    <div style={{ fontSize: '0.75rem', color: '#667' }}>{pos.asset_name}</div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ background: pos.side === 'buy' ? '#00d4aa22' : '#ff6b6b22', color: pos.side === 'buy' ? '#00d4aa' : '#ff6b6b', padding: '0.2rem 0.7rem', borderRadius: 6, fontSize: '0.8rem', fontWeight: 600 }}>
                      {pos.side === 'buy' ? '▲ Compra' : '▼ Venta'}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', fontWeight: 600 }}>{pos.quantity}</td>
                  <td style={{ padding: '1rem' }}>${pos.entry_price.toFixed(4)}</td>
                  <td style={{ padding: '1rem', fontWeight: 700 }}>${currentPrice.toFixed(4)}</td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ color: pnl >= 0 ? '#00d4aa' : '#ff6b6b', fontWeight: 700 }}>
                      {pnl >= 0 ? '+' : ''}${pnl.toFixed(2)}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: pnl >= 0 ? '#00d4aa88' : '#ff6b6b88' }}>
                      {pnlPct >= 0 ? '+' : ''}{pnlPct.toFixed(2)}%
                    </div>
                  </td>
                  <td style={{ padding: '1rem', fontWeight: 600 }}>${(currentPrice * pos.quantity).toFixed(2)}</td>
                  <td style={{ padding: '1rem' }}>
                    <button onClick={() => closePosition(pos)} disabled={loading === pos.id}
                      style={{ background: '#ff6b6b22', border: '1px solid #ff6b6b44', color: '#ff6b6b', padding: '0.4rem 0.9rem', borderRadius: 8, cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600 }}>
                      {loading === pos.id ? '...' : 'Cerrar'}
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
