import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'

export default function UserHistory() {
  const { user } = useAuth()
  const [trades, setTrades] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('trades').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(100)
      .then(({ data }) => { setTrades(data || []); setLoading(false) })
  }, [])

  const totalPnl = trades.filter(t => t.action === 'close').reduce((acc, t) => acc + (t.pnl ?? 0), 0)

  if (loading) return <div style={{ color: '#667', padding: '2rem' }}>Cargando historial...</div>

  return (
    <div>
      <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Total operaciones', value: trades.length },
          { label: 'P&L realizado', value: `${totalPnl >= 0 ? '+' : ''}$${totalPnl.toFixed(2)}`, color: totalPnl >= 0 ? '#00d4aa' : '#ff6b6b' },
          { label: 'Ganadas', value: trades.filter(t => t.action === 'close' && (t.pnl ?? 0) > 0).length },
          { label: 'Perdidas', value: trades.filter(t => t.action === 'close' && (t.pnl ?? 0) < 0).length },
        ].map(item => (
          <div key={item.label} style={{ background: '#0d1a30', border: '1px solid #1e2d4a', borderRadius: 12, padding: '1rem 1.5rem' }}>
            <div style={{ fontSize: '0.75rem', color: '#667', marginBottom: '0.3rem' }}>{item.label}</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: item.color || '#fff' }}>{item.value}</div>
          </div>
        ))}
      </div>

      {trades.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#445', padding: '4rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📋</div>
          <div>No has realizado operaciones aún</div>
        </div>
      ) : (
        <div style={{ background: '#0d1a30', border: '1px solid #1e2d4a', borderRadius: 14, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#06101e' }}>
                {['Fecha', 'Activo', 'Acción', 'Tipo', 'Cantidad', 'Precio', 'Total', 'P&L'].map(h => (
                  <th key={h} style={{ padding: '0.8rem 1rem', textAlign: 'left', fontSize: '0.75rem', color: '#556', fontWeight: 600, textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {trades.map(t => (
                <tr key={t.id} style={{ borderTop: '1px solid #1e2d4a' }}>
                  <td style={{ padding: '0.9rem 1rem', fontSize: '0.8rem', color: '#778' }}>{new Date(t.created_at).toLocaleDateString('es-CO')}</td>
                  <td style={{ padding: '0.9rem 1rem', fontWeight: 700 }}>{t.symbol}</td>
                  <td style={{ padding: '0.9rem 1rem' }}>
                    <span style={{ background: t.action === 'open' ? '#00d4aa22' : '#ff6b6b22', color: t.action === 'open' ? '#00d4aa' : '#ff6b6b', padding: '0.2rem 0.6rem', borderRadius: 6, fontSize: '0.78rem' }}>
                      {t.action === 'open' ? 'Apertura' : 'Cierre'}
                    </span>
                  </td>
                  <td style={{ padding: '0.9rem 1rem', color: t.side === 'buy' ? '#00d4aa' : '#ff6b6b', fontWeight: 600, fontSize: '0.85rem' }}>
                    {t.side === 'buy' ? '▲ Compra' : '▼ Venta'}
                  </td>
                  <td style={{ padding: '0.9rem 1rem' }}>{t.quantity}</td>
                  <td style={{ padding: '0.9rem 1rem' }}>${t.price?.toFixed(4)}</td>
                  <td style={{ padding: '0.9rem 1rem' }}>${t.total?.toFixed(2)}</td>
                  <td style={{ padding: '0.9rem 1rem', fontWeight: 700, color: t.pnl == null ? '#556' : t.pnl >= 0 ? '#00d4aa' : '#ff6b6b' }}>
                    {t.pnl != null ? `${t.pnl >= 0 ? '+' : ''}$${t.pnl.toFixed(2)}` : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
