import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import { fmtPrice } from '../../../lib/prices'
import { T, card, btn } from '../../../lib/theme'

export default function PageDeposits({ ctx }) {
  const { balance, refresh, user } = ctx
  const [tab, setTab] = useState('deposit')
  const [amount, setAmount] = useState('')
  const [method, setMethod] = useState('USDT TRC20')
  const [txHash, setTxHash] = useState('')
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState(null)

  useEffect(() => { fetchRequests() }, [])
  async function fetchRequests() {
    const { data } = await supabase.from('fund_requests').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
    setRequests(data || [])
  }
  async function submit() {
    if (!amount || parseFloat(amount) <= 0) return
    setLoading(true); setMsg(null)
    const { error } = await supabase.from('fund_requests').insert({ user_id: user.id, type: tab, amount: parseFloat(amount), method, tx_hash: txHash || null, status: 'pending' })
    if (error) setMsg({ t: 'error', m: error.message })
    else { setMsg({ t: 'ok', m: `✅ Solicitud de ${tab === 'deposit' ? 'depósito' : 'retiro'} enviada. El administrador la revisará pronto.` }); setAmount(''); setTxHash(''); fetchRequests() }
    setLoading(false)
  }

  const sc = { pending: T.amber, approved: T.green, rejected: T.red }
  const sl = { pending: 'Pendiente', approved: 'Aprobado', rejected: 'Rechazado' }
  const inp = { width: '100%', background: T.input, border: `1px solid ${T.border}`, borderRadius: 8, padding: '0.7rem', color: '#fff', fontSize: '0.9rem', boxSizing: 'border-box' }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '420px 1fr', gap: '1.3rem' }}>
      <div style={card}>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.3rem' }}>
          {['deposit', 'withdraw'].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ flex: 1, padding: '0.65rem', borderRadius: 8, cursor: 'pointer', fontWeight: 700, border: 'none', background: tab === t ? (t === 'deposit' ? T.green : T.red) : T.border, color: tab === t ? '#000' : T.textMute }}>
              {t === 'deposit' ? '↓ Depósito' : '↑ Retiro'}
            </button>
          ))}
        </div>
        <div style={{ background: T.input, borderRadius: 10, padding: '1rem', marginBottom: '1.2rem' }}>
          <div style={{ fontSize: '0.72rem', color: T.textMute }}>Balance actual</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: T.green }}>${fmtPrice(balance)}</div>
        </div>
        <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.8rem', color: T.textMute }}>Monto (USD)</label>
        <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="100.00" style={{ ...inp, marginBottom: '1rem' }} />
        <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.8rem', color: T.textMute }}>Método</label>
        <select value={method} onChange={e => setMethod(e.target.value)} style={{ ...inp, marginBottom: '1rem' }}>
          <option>USDT TRC20</option><option>USDT ERC20</option><option>Bitcoin (BTC)</option><option>Transferencia bancaria</option><option>Nequi / Daviplata</option><option>PayPal</option>
        </select>
        {tab === 'deposit' && (
          <>
            <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.8rem', color: T.textMute }}>Hash de transacción (opcional)</label>
            <input value={txHash} onChange={e => setTxHash(e.target.value)} placeholder="0x..." style={{ ...inp, marginBottom: '1.2rem', fontSize: '0.82rem' }} />
          </>
        )}
        {msg && <div style={{ background: msg.t === 'ok' ? '#0a2a1a' : '#2d0a0a', border: `1px solid ${msg.t === 'ok' ? T.green + '44' : '#5a1a1a'}`, borderRadius: 8, padding: '0.7rem', color: msg.t === 'ok' ? T.green : T.red, fontSize: '0.82rem', marginBottom: '1rem' }}>{msg.m}</div>}
        <button onClick={submit} disabled={loading || !amount} style={{ width: '100%', background: tab === 'deposit' ? `linear-gradient(135deg,${T.green},${T.blue})` : `linear-gradient(135deg,${T.red},#cc0000)`, border: 'none', color: '#fff', padding: '0.85rem', borderRadius: 10, cursor: 'pointer', fontWeight: 700, opacity: (!amount || loading) ? 0.6 : 1 }}>
          {loading ? 'Enviando...' : `Solicitar ${tab === 'deposit' ? 'depósito' : 'retiro'}`}
        </button>
      </div>
      <div>
        <h3 style={{ fontSize: '0.95rem', color: '#aab', margin: '0 0 1rem' }}>Historial de solicitudes</h3>
        {requests.length === 0 ? <div style={{ textAlign: 'center', color: T.textFaint, padding: '3rem' }}>No hay solicitudes aún</div> : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
            {requests.map(r => (
              <div key={r.id} style={{ ...card, padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 700 }}>{r.type === 'deposit' ? '↓' : '↑'} ${fmtPrice(r.amount)} USD</div>
                  <div style={{ fontSize: '0.78rem', color: T.textMute }}>{r.method} · {new Date(r.created_at).toLocaleDateString('es-CO')}</div>
                  {r.admin_note && <div style={{ fontSize: '0.78rem', color: T.amber, marginTop: '0.3rem' }}>Nota: {r.admin_note}</div>}
                </div>
                <span style={{ background: sc[r.status] + '22', color: sc[r.status], border: `1px solid ${sc[r.status]}44`, padding: '0.3rem 0.9rem', borderRadius: 8, fontSize: '0.8rem', fontWeight: 600 }}>{sl[r.status]}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
