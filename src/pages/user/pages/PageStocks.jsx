import { useState } from 'react'
import { supabase } from '../../../lib/supabase'
import { ALL_ASSETS, SECTORS, fmtPrice, fmtMcap, fmtVolume } from '../../../lib/prices'
import { T, card, pill, btn } from '../../../lib/theme'
import { ChangeBadge } from '../../../components/Shared'

export default function PageStocks({ ctx }) {
  const { prices, balance, watchlist, toggleWatch, refresh, user, setPage } = ctx
  const [sector, setSector] = useState('Todos')
  const [selected, setSelected] = useState(null)
  const [side, setSide] = useState('buy')
  const [qty, setQty] = useState('')
  const [msg, setMsg] = useState(null)
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')

  const filtered = ALL_ASSETS.filter(a =>
    (sector === 'Todos' || a.sector === sector) &&
    (!search || a.symbol.toLowerCase().includes(search.toLowerCase()) || a.name.toLowerCase().includes(search.toLowerCase()))
  )

  const asset = selected ? ALL_ASSETS.find(a => a.symbol === selected) : null
  const curPrice = selected ? (prices[selected]?.price ?? 0) : 0
  const total = curPrice * parseFloat(qty || 0)

  async function execute() {
    if (!selected || !qty || parseFloat(qty) <= 0) return
    if (side === 'buy' && total > balance) { setMsg({ t: 'error', m: 'Balance insuficiente' }); return }
    setLoading(true); setMsg(null)
    try {
      const q = parseFloat(qty), price = curPrice, cost = side === 'buy' ? total : 0
      await supabase.from('positions').insert({ user_id: user.id, symbol: selected, asset_name: asset.name, asset_type: asset.sector, side, quantity: q, entry_price: price, total_cost: cost, status: 'open' })
      await supabase.from('profiles').update({ balance: side === 'buy' ? balance - cost : balance }).eq('id', user.id)
      await supabase.from('trades').insert({ user_id: user.id, symbol: selected, asset_name: asset.name, side, quantity: q, price, total, action: 'open' })
      setMsg({ t: 'ok', m: `✅ ${side === 'buy' ? 'Compra' : 'Venta'}: ${q} ${selected} @ $${fmtPrice(price)}` })
      setQty(''); refresh()
    } catch (e) { setMsg({ t: 'error', m: e.message }) }
    setLoading(false)
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '1.3rem' }}>
      <div>
        {/* SEARCH + FILTERS */}
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Buscar acción, crypto, forex..."
          style={{ width: '100%', background: T.input, border: `1px solid ${T.border}`, borderRadius: 10, padding: '0.7rem 1rem', color: '#fff', fontSize: '0.9rem', marginBottom: '1rem', boxSizing: 'border-box' }} />
        <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
          {['Todos', ...SECTORS].map(s => (
            <button key={s} onClick={() => setSector(s)} style={pill(T.green, sector === s)}>{s}</button>
          ))}
        </div>

        {/* TABLE */}
        <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 640 }}>
              <thead>
                <tr style={{ background: T.input }}>
                  {['Activo', 'Precio', 'Cambio 24h', 'Volumen', 'Sector', ''].map(h => (
                    <th key={h} style={{ padding: '0.7rem 1rem', textAlign: 'left', fontSize: '0.7rem', color: T.textFaint, fontWeight: 700, textTransform: 'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(a => {
                  const p = prices[a.symbol]
                  return (
                    <tr key={a.symbol} onClick={() => setSelected(a.symbol)} style={{ borderTop: `1px solid ${T.border}`, cursor: 'pointer', background: selected === a.symbol ? `${T.green}11` : 'transparent' }}>
                      <td style={{ padding: '0.8rem 1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span onClick={e => { e.stopPropagation(); toggleWatch(a.symbol) }} style={{ cursor: 'pointer', color: watchlist.includes(a.symbol) ? T.amber : T.textFaint, fontSize: '0.9rem' }}>
                            {watchlist.includes(a.symbol) ? '★' : '☆'}
                          </span>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: '0.88rem' }}>{a.symbol}</div>
                            <div style={{ fontSize: '0.72rem', color: T.textFaint }}>{a.name}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '0.8rem 1rem', fontWeight: 700 }}>{p ? `$${fmtPrice(p.price)}` : '—'}</td>
                      <td style={{ padding: '0.8rem 1rem' }}>{p ? <ChangeBadge value={p.change} /> : '—'}</td>
                      <td style={{ padding: '0.8rem 1rem', fontSize: '0.82rem', color: T.textMute }}>{p ? fmtVolume(p.volume) : '—'}</td>
                      <td style={{ padding: '0.8rem 1rem' }}><span style={{ background: T.border, padding: '0.15rem 0.55rem', borderRadius: 6, fontSize: '0.72rem', color: T.textMute }}>{a.sector}</span></td>
                      <td style={{ padding: '0.8rem 1rem' }}>
                        <button onClick={e => { e.stopPropagation(); setSelected(a.symbol) }} style={{ ...btn('primary'), padding: '0.3rem 0.8rem', fontSize: '0.78rem' }}>Operar</button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* TRADE PANEL */}
      <div>
        <div style={{ ...card, position: 'sticky', top: '1rem' }}>
          <h3 style={{ margin: '0 0 1rem', fontSize: '1rem', color: '#aab' }}>Panel de Operación</h3>
          {!selected ? (
            <div style={{ textAlign: 'center', color: T.textFaint, padding: '2.5rem 0' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📊</div>
              <div style={{ fontSize: '0.88rem' }}>Selecciona un activo para operar</div>
            </div>
          ) : (
            <>
              <div style={{ background: T.input, borderRadius: 10, padding: '1rem', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>{selected}</div>
                    <div style={{ color: T.textFaint, fontSize: '0.76rem' }}>{asset?.name}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: T.green }}>${fmtPrice(curPrice)}</div>
                    {prices[selected] && <ChangeBadge value={prices[selected].change} />}
                  </div>
                </div>
                {/* Mini stats */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '0.8rem', paddingTop: '0.8rem', borderTop: `1px solid ${T.border}` }}>
                  {[['Apertura', prices[selected]?.open], ['Máx día', prices[selected]?.high], ['Mín día', prices[selected]?.low], ['Cierre ant.', prices[selected]?.close]].map(([l, v]) => (
                    <div key={l} style={{ fontSize: '0.72rem' }}>
                      <span style={{ color: T.textFaint }}>{l}: </span>
                      <span style={{ fontWeight: 600 }}>{v ? `$${fmtPrice(v)}` : '—'}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                {['buy', 'sell'].map(s => (
                  <button key={s} onClick={() => setSide(s)} style={{ flex: 1, padding: '0.65rem', borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontSize: '0.88rem', border: 'none', background: side === s ? (s === 'buy' ? T.green : T.red) : T.border, color: side === s ? '#000' : T.textMute }}>
                    {s === 'buy' ? '▲ Comprar' : '▼ Vender'}
                  </button>
                ))}
              </div>

              <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.78rem', color: T.textMute }}>Cantidad</label>
              <input type="number" value={qty} onChange={e => setQty(e.target.value)} placeholder="0.00" min="0"
                style={{ width: '100%', background: T.input, border: `1px solid ${T.border}`, borderRadius: 8, padding: '0.7rem', color: '#fff', fontSize: '1rem', boxSizing: 'border-box', marginBottom: '0.7rem' }} />
              <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1rem' }}>
                {[0.1, 0.5, 1, 5, 10].map(q => (
                  <button key={q} onClick={() => setQty(String(q))} style={{ flex: 1, background: T.border, border: 'none', color: T.textMute, padding: '0.35rem', borderRadius: 6, cursor: 'pointer', fontSize: '0.75rem' }}>{q}</button>
                ))}
              </div>

              <div style={{ background: T.input, borderRadius: 10, padding: '0.9rem', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.82rem' }}>
                  <span style={{ color: T.textFaint }}>Precio entrada</span><span style={{ fontWeight: 600 }}>${fmtPrice(curPrice)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.4rem', borderTop: `1px solid ${T.border}` }}>
                  <span style={{ color: '#aab', fontWeight: 600, fontSize: '0.85rem' }}>Total</span>
                  <span style={{ fontWeight: 800, color: T.green, fontSize: '1.05rem' }}>${total.toFixed(2)}</span>
                </div>
              </div>

              {msg && <div style={{ background: msg.t === 'ok' ? '#0a2a1a' : '#2d0a0a', border: `1px solid ${msg.t === 'ok' ? T.green + '44' : '#5a1a1a'}`, borderRadius: 8, padding: '0.7rem', color: msg.t === 'ok' ? T.green : T.red, fontSize: '0.82rem', marginBottom: '1rem' }}>{msg.m}</div>}

              <button onClick={execute} disabled={loading || !qty} style={{ width: '100%', background: side === 'buy' ? `linear-gradient(135deg,${T.green},${T.blue})` : `linear-gradient(135deg,${T.red},#cc0000)`, border: 'none', color: '#fff', padding: '0.85rem', borderRadius: 10, cursor: 'pointer', fontWeight: 700, fontSize: '0.95rem', opacity: (!qty || loading) ? 0.6 : 1 }}>
                {loading ? 'Procesando...' : `${side === 'buy' ? 'Comprar' : 'Vender'} ${selected}`}
              </button>
              <div style={{ textAlign: 'center', marginTop: '0.7rem', fontSize: '0.74rem', color: T.textFaint }}>Balance: ${fmtPrice(balance)}</div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
