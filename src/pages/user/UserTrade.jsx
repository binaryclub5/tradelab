import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { ALL_ASSETS } from '../../lib/prices'

const CATEGORIES = ['Todos', 'Tecnología', 'Crypto', 'Forex', 'Materias Primas']

export default function UserTrade({ prices, balance, onTradeSuccess }) {
  const { user } = useAuth()
  const [category, setCategory] = useState('Todos')
  const [selected, setSelected] = useState(null)
  const [side, setSide] = useState('buy')
  const [quantity, setQuantity] = useState('')
  const [msg, setMsg] = useState(null)
  const [loading, setLoading] = useState(false)

  const filtered = ALL_ASSETS.filter(a => category === 'Todos' || a.category === category || (category === 'Tecnología' && a.category === 'Tecnología') || (category === 'Finanzas' && a.category === 'Finanzas'))

  const asset = selected ? ALL_ASSETS.find(a => a.symbol === selected) : null
  const currentPrice = selected ? (prices[selected]?.price ?? 0) : 0
  const total = currentPrice * parseFloat(quantity || 0)

  async function executeTrade() {
    if (!selected || !quantity || parseFloat(quantity) <= 0) return
    if (side === 'buy' && total > balance) { setMsg({ type: 'error', text: 'Balance insuficiente' }); return }
    setLoading(true); setMsg(null)
    try {
      const qty = parseFloat(quantity)
      const price = currentPrice
      const cost = side === 'buy' ? total : 0
      // Insertar posición
      const { error: posErr } = await supabase.from('positions').insert({
        user_id: user.id, symbol: selected, asset_name: asset.name,
        asset_type: asset.type, side, quantity: qty, entry_price: price,
        total_cost: cost, status: 'open'
      })
      if (posErr) throw posErr
      // Actualizar balance
      const newBalance = side === 'buy' ? balance - cost : balance
      await supabase.from('profiles').update({ balance: newBalance }).eq('id', user.id)
      // Registrar en historial
      await supabase.from('trades').insert({
        user_id: user.id, symbol: selected, asset_name: asset.name,
        side, quantity: qty, price, total, action: 'open'
      })
      setMsg({ type: 'success', text: `✅ ${side === 'buy' ? 'Compra' : 'Venta'} ejecutada: ${qty} ${selected} @ $${price.toFixed(2)}` })
      setQuantity('')
      onTradeSuccess()
    } catch (e) {
      setMsg({ type: 'error', text: e.message })
    }
    setLoading(false)
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.5rem' }}>
      {/* MARKET TABLE */}
      <div>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setCategory(c)}
              style={{ background: category === c ? '#00d4aa22' : '#0d1a30', border: `1px solid ${category === c ? '#00d4aa' : '#1e2d4a'}`, color: category === c ? '#00d4aa' : '#889', padding: '0.4rem 0.9rem', borderRadius: 8, cursor: 'pointer', fontSize: '0.82rem' }}>
              {c}
            </button>
          ))}
        </div>
        <div style={{ background: '#0d1a30', border: '1px solid #1e2d4a', borderRadius: 14, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#06101e' }}>
                {['Activo', 'Precio', 'Cambio 24h', 'Categoría', ''].map(h => (
                  <th key={h} style={{ padding: '0.8rem 1rem', textAlign: 'left', fontSize: '0.75rem', color: '#556', fontWeight: 600, textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(asset => {
                const p = prices[asset.symbol]
                const change = p?.change ?? 0
                return (
                  <tr key={asset.symbol} onClick={() => setSelected(asset.symbol)}
                    style={{ borderTop: '1px solid #1e2d4a', cursor: 'pointer', background: selected === asset.symbol ? '#00d4aa11' : 'transparent', transition: 'background 0.2s' }}>
                    <td style={{ padding: '0.9rem 1rem' }}>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{asset.symbol}</div>
                      <div style={{ fontSize: '0.75rem', color: '#667' }}>{asset.name}</div>
                    </td>
                    <td style={{ padding: '0.9rem 1rem', fontWeight: 700 }}>
                      {p ? `$${p.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}` : '—'}
                    </td>
                    <td style={{ padding: '0.9rem 1rem', color: change >= 0 ? '#00d4aa' : '#ff6b6b', fontWeight: 600 }}>
                      {p ? `${change >= 0 ? '+' : ''}${change.toFixed(2)}%` : '—'}
                    </td>
                    <td style={{ padding: '0.9rem 1rem' }}>
                      <span style={{ background: '#1e2d4a', padding: '0.2rem 0.6rem', borderRadius: 6, fontSize: '0.75rem', color: '#889' }}>{asset.category}</span>
                    </td>
                    <td style={{ padding: '0.9rem 1rem' }}>
                      <button onClick={() => setSelected(asset.symbol)}
                        style={{ background: '#00d4aa22', border: '1px solid #00d4aa44', color: '#00d4aa', padding: '0.3rem 0.8rem', borderRadius: 6, cursor: 'pointer', fontSize: '0.8rem' }}>
                        Operar
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* TRADE PANEL */}
      <div>
        <div style={{ background: '#0d1a30', border: '1px solid #1e2d4a', borderRadius: 14, padding: '1.5rem', position: 'sticky', top: '1rem' }}>
          <h3 style={{ margin: '0 0 1.2rem', fontSize: '1rem', color: '#aab' }}>Panel de operación</h3>
          {!selected ? (
            <div style={{ textAlign: 'center', color: '#445', padding: '2rem 0' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📊</div>
              <div>Selecciona un activo del mercado para operar</div>
            </div>
          ) : (
            <>
              <div style={{ background: '#06101e', borderRadius: 10, padding: '1rem', marginBottom: '1.2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{selected}</div>
                    <div style={{ color: '#667', fontSize: '0.8rem' }}>{asset?.name}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#00d4aa' }}>
                      ${currentPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: (prices[selected]?.change ?? 0) >= 0 ? '#00d4aa' : '#ff6b6b' }}>
                      {prices[selected] ? `${prices[selected].change >= 0 ? '+' : ''}${prices[selected].change.toFixed(2)}%` : ''}
                    </div>
                  </div>
                </div>
              </div>

              {/* SIDE */}
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.2rem' }}>
                {['buy', 'sell'].map(s => (
                  <button key={s} onClick={() => setSide(s)}
                    style={{ flex: 1, padding: '0.7rem', borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontSize: '0.9rem', border: 'none', background: side === s ? (s === 'buy' ? '#00d4aa' : '#ff6b6b') : '#1e2d4a', color: side === s ? '#000' : '#889' }}>
                    {s === 'buy' ? '▲ Comprar' : '▼ Vender'}
                  </button>
                ))}
              </div>

              {/* QUANTITY */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.8rem', color: '#889' }}>Cantidad</label>
                <input type="number" value={quantity} onChange={e => setQuantity(e.target.value)} placeholder="0.00" min="0"
                  style={{ width: '100%', background: '#06101e', border: '1px solid #1e2d4a', borderRadius: 8, padding: '0.75rem', color: '#fff', fontSize: '1rem', boxSizing: 'border-box' }} />
              </div>

              {/* QUICK AMOUNTS */}
              <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1.2rem' }}>
                {[0.1, 0.5, 1, 5].map(q => (
                  <button key={q} onClick={() => setQuantity(q.toString())}
                    style={{ flex: 1, background: '#1e2d4a', border: 'none', color: '#aab', padding: '0.4rem', borderRadius: 6, cursor: 'pointer', fontSize: '0.75rem' }}>
                    {q}
                  </button>
                ))}
              </div>

              {/* SUMMARY */}
              <div style={{ background: '#06101e', borderRadius: 10, padding: '1rem', marginBottom: '1.2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ color: '#667', fontSize: '0.85rem' }}>Precio entrada</span>
                  <span style={{ fontWeight: 600 }}>${currentPrice.toFixed(4)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ color: '#667', fontSize: '0.85rem' }}>Cantidad</span>
                  <span style={{ fontWeight: 600 }}>{quantity || '0'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #1e2d4a', paddingTop: '0.5rem' }}>
                  <span style={{ color: '#aab', fontSize: '0.9rem', fontWeight: 600 }}>Total</span>
                  <span style={{ fontWeight: 800, color: '#00d4aa', fontSize: '1.05rem' }}>${total.toFixed(2)}</span>
                </div>
              </div>

              {msg && (
                <div style={{ background: msg.type === 'success' ? '#0a2a1a' : '#2d0a0a', border: `1px solid ${msg.type === 'success' ? '#00d4aa44' : '#5a1a1a'}`, borderRadius: 8, padding: '0.75rem', color: msg.type === 'success' ? '#00d4aa' : '#ff6b6b', fontSize: '0.85rem', marginBottom: '1rem' }}>
                  {msg.text}
                </div>
              )}

              <button onClick={executeTrade} disabled={loading || !quantity}
                style={{ width: '100%', background: side === 'buy' ? 'linear-gradient(135deg,#00d4aa,#0066ff)' : 'linear-gradient(135deg,#ff6b6b,#cc0000)', border: 'none', color: '#fff', padding: '0.9rem', borderRadius: 10, cursor: 'pointer', fontWeight: 700, fontSize: '1rem', opacity: (!quantity || loading) ? 0.6 : 1 }}>
                {loading ? 'Procesando...' : `${side === 'buy' ? 'Comprar' : 'Vender'} ${selected}`}
              </button>
              <div style={{ textAlign: 'center', marginTop: '0.8rem', fontSize: '0.75rem', color: '#445' }}>
                Balance disponible: ${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
