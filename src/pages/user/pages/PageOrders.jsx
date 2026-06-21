import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import { fmtPrice } from '../../../lib/prices'
import { T, card } from '../../../lib/theme'
import { Empty, Loading } from '../../../components/Shared'

export default function PageOrders({ ctx }) {
  const { user } = ctx
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('trades').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(100)
      .then(({ data }) => { setOrders(data || []); setLoading(false) })
  }, [])

  if (loading) return <Loading />
  if (!orders.length) return <Empty icon="📝" text="No tienes órdenes" sub="Tus operaciones aparecerán aquí" />

  return (
    <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
          <thead><tr style={{ background: T.input }}>
            {['Fecha', 'Símbolo', 'Tipo', 'Acción', 'Cantidad', 'Precio', 'Total', 'Estado'].map(h => <th key={h} style={{ padding: '0.7rem 1rem', textAlign: 'left', fontSize: '0.7rem', color: T.textFaint, fontWeight: 700 }}>{h}</th>)}
          </tr></thead>
          <tbody>
            {orders.map(o => (
              <tr key={o.id} style={{ borderTop: `1px solid ${T.border}` }}>
                <td style={{ padding: '0.75rem 1rem', fontSize: '0.78rem', color: T.textMute }}>{new Date(o.created_at).toLocaleString('es-CO')}</td>
                <td style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>{o.symbol}</td>
                <td style={{ padding: '0.75rem 1rem', color: o.side === 'buy' ? T.green : T.red, fontWeight: 600, fontSize: '0.85rem' }}>{o.side === 'buy' ? 'Compra' : 'Venta'}</td>
                <td style={{ padding: '0.75rem 1rem' }}><span style={{ background: o.action === 'open' ? `${T.green}22` : `${T.amber}22`, color: o.action === 'open' ? T.green : T.amber, padding: '0.15rem 0.5rem', borderRadius: 6, fontSize: '0.74rem' }}>{o.action === 'open' ? 'Apertura' : 'Cierre'}</span></td>
                <td style={{ padding: '0.75rem 1rem' }}>{o.quantity}</td>
                <td style={{ padding: '0.75rem 1rem' }}>${fmtPrice(o.price)}</td>
                <td style={{ padding: '0.75rem 1rem' }}>${fmtPrice(o.total)}</td>
                <td style={{ padding: '0.75rem 1rem' }}><span style={{ color: T.green, fontSize: '0.8rem' }}>✓ Ejecutada</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
