import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import { fmtPrice } from '../../../lib/prices'
import { T, card } from '../../../lib/theme'
import { Empty, Loading } from '../../../components/Shared'

export default function PageHistory({ ctx }) {
  const { user } = ctx
  const [trades, setTrades] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('trades').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(200)
      .then(({ data }) => { setTrades(data || []); setLoading(false) })
  }, [])

  const closed = trades.filter(t => t.action === 'close')
  const totalPnl = closed.reduce((a, t) => a + (t.pnl ?? 0), 0)
  const wins = closed.filter(t => (t.pnl ?? 0) > 0).length

  if (loading) return <Loading />

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          { l: 'Operaciones totales', v: trades.length, c: '#fff' },
          { l: 'P&L realizado', v: `${totalPnl >= 0 ? '+' : ''}$${totalPnl.toFixed(2)}`, c: totalPnl >= 0 ? T.green : T.red },
          { l: 'Ganadas', v: wins, c: T.green },
          { l: 'Perdidas', v: closed.length - wins, c: T.red },
        ].map(s => (
          <div key={s.l} style={card}><div style={{ fontSize: '0.72rem', color: T.textMute, marginBottom: '0.3rem' }}>{s.l}</div><div style={{ fontSize: '1.5rem', fontWeight: 800, color: s.c }}>{s.v}</div></div>
        ))}
      </div>
      {trades.length === 0 ? <Empty icon="🗂" text="No has realizado operaciones aún" /> : (
        <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 720 }}>
              <thead><tr style={{ background: T.input }}>
                {['Fecha', 'Activo', 'Acción', 'Tipo', 'Cantidad', 'Precio', 'Total', 'P&L'].map(h => <th key={h} style={{ padding: '0.7rem 1rem', textAlign: 'left', fontSize: '0.7rem', color: T.textFaint, fontWeight: 700 }}>{h}</th>)}
              </tr></thead>
              <tbody>
                {trades.map(t => (
                  <tr key={t.id} style={{ borderTop: `1px solid ${T.border}` }}>
                    <td style={{ padding: '0.75rem 1rem', fontSize: '0.78rem', color: T.textMute }}>{new Date(t.created_at).toLocaleDateString('es-CO')}</td>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>{t.symbol}</td>
                    <td style={{ padding: '0.75rem 1rem' }}><span style={{ background: t.action === 'open' ? `${T.green}22` : `${T.amber}22`, color: t.action === 'open' ? T.green : T.amber, padding: '0.15rem 0.5rem', borderRadius: 6, fontSize: '0.74rem' }}>{t.action === 'open' ? 'Apertura' : 'Cierre'}</span></td>
                    <td style={{ padding: '0.75rem 1rem', color: t.side === 'buy' ? T.green : T.red, fontSize: '0.85rem', fontWeight: 600 }}>{t.side === 'buy' ? '▲' : '▼'}</td>
                    <td style={{ padding: '0.75rem 1rem' }}>{t.quantity}</td>
                    <td style={{ padding: '0.75rem 1rem' }}>${fmtPrice(t.price)}</td>
                    <td style={{ padding: '0.75rem 1rem' }}>${fmtPrice(t.total)}</td>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: t.pnl == null ? T.textFaint : t.pnl >= 0 ? T.green : T.red }}>{t.pnl != null ? `${t.pnl >= 0 ? '+' : ''}$${t.pnl.toFixed(2)}` : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
