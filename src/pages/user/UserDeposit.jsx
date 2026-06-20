import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'

export default function UserDeposit({ balance, onRefresh }) {
  const { user } = useAuth()
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

  async function submitRequest() {
    if (!amount || parseFloat(amount) <= 0) return
    setLoading(true); setMsg(null)
    const { error } = await supabase.from('fund_requests').insert({
      user_id: user.id, type: tab, amount: parseFloat(amount),
      method, tx_hash: txHash || null, status: 'pending'
    })
    if (error) setMsg({ type: 'error', text: error.message })
    else {
      setMsg({ type: 'success', text: `✅ Solicitud de ${tab === 'deposit' ? 'depósito' : 'retiro'} enviada. El administrador la revisará pronto.` })
      setAmount(''); setTxHash('')
      fetchRequests()
      if (tab === 'deposit') onRefresh()
    }
    setLoading(false)
  }

  const statusColor = { pending: '#f59e0b', approved: '#00d4aa', rejected: '#ff6b6b' }
  const statusLabel = { pending: 'Pendiente', approved: 'Aprobado', rejected: 'Rechazado' }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '420px 1fr', gap: '1.5rem' }}>
      {/* FORM */}
      <div style={{ background: '#0d1a30', border: '1px solid #1e2d4a', borderRadius: 14, padding: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
          {['deposit', 'withdraw'].map(t => (
            <button key={t} onClick={() => setTab(t)}
              style={{ flex: 1, padding: '0.7rem', borderRadius: 8, cursor: 'pointer', fontWeight: 700, border: 'none', background: tab === t ? (t === 'deposit' ? '#00d4aa' : '#ff6b6b') : '#1e2d4a', color: tab === t ? '#000' : '#889' }}>
              {t === 'deposit' ? '↓ Depósito' : '↑ Retiro'}
            </button>
          ))}
        </div>

        <div style={{ background: '#06101e', borderRadius: 10, padding: '1rem', marginBottom: '1.2rem' }}>
          <div style={{ fontSize: '0.75rem', color: '#667', marginBottom: '0.3rem' }}>Balance actual</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#00d4aa' }}>${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.8rem', color: '#889' }}>Monto (USD)</label>
          <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="100.00" min="1"
            style={{ width: '100%', background: '#06101e', border: '1px solid #1e2d4a', borderRadius: 8, padding: '0.75rem', color: '#fff', fontSize: '1rem', boxSizing: 'border-box' }} />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.8rem', color: '#889' }}>Método de pago</label>
          <select value={method} onChange={e => setMethod(e.target.value)}
            style={{ width: '100%', background: '#06101e', border: '1px solid #1e2d4a', borderRadius: 8, padding: '0.75rem', color: '#fff', fontSize: '0.9rem', boxSizing: 'border-box' }}>
            <option>USDT TRC20</option>
            <option>USDT ERC20</option>
            <option>Bitcoin (BTC)</option>
            <option>Transferencia bancaria</option>
            <option>Nequi / Daviplata</option>
            <option>PayPal</option>
          </select>
        </div>

        {tab === 'deposit' && (
          <div style={{ marginBottom: '1.2rem' }}>
            <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.8rem', color: '#889' }}>Hash de transacción (opcional)</label>
            <input value={txHash} onChange={e => setTxHash(e.target.value)} placeholder="0x..."
              style={{ width: '100%', background: '#06101e', border: '1px solid #1e2d4a', borderRadius: 8, padding: '0.75rem', color: '#fff', fontSize: '0.85rem', boxSizing: 'border-box' }} />
          </div>
        )}

        {msg && (
          <div style={{ background: msg.type === 'success' ? '#0a2a1a' : '#2d0a0a', border: `1px solid ${msg.type === 'success' ? '#00d4aa44' : '#5a1a1a'}`, borderRadius: 8, padding: '0.75rem', color: msg.type === 'success' ? '#00d4aa' : '#ff6b6b', fontSize: '0.85rem', marginBottom: '1rem' }}>
            {msg.text}
          </div>
        )}

        <button onClick={submitRequest} disabled={loading || !amount}
          style={{ width: '100%', background: tab === 'deposit' ? 'linear-gradient(135deg,#00d4aa,#0066ff)' : 'linear-gradient(135deg,#ff6b6b,#cc0000)', border: 'none', color: '#fff', padding: '0.9rem', borderRadius: 10, cursor: 'pointer', fontWeight: 700, fontSize: '1rem', opacity: (!amount || loading) ? 0.6 : 1 }}>
          {loading ? 'Enviando...' : `Solicitar ${tab === 'deposit' ? 'depósito' : 'retiro'}`}
        </button>
      </div>

      {/* HISTORY */}
      <div>
        <h3 style={{ margin: '0 0 1rem', fontSize: '1rem', color: '#aab' }}>Historial de solicitudes</h3>
        {requests.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#445', padding: '3rem' }}>No hay solicitudes aún</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            {requests.map(r => (
              <div key={r.id} style={{ background: '#0d1a30', border: '1px solid #1e2d4a', borderRadius: 12, padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 700, marginBottom: '0.2rem' }}>
                    {r.type === 'deposit' ? '↓' : '↑'} ${r.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#667' }}>{r.method} · {new Date(r.created_at).toLocaleDateString('es-CO')}</div>
                  {r.admin_note && <div style={{ fontSize: '0.8rem', color: '#f59e0b', marginTop: '0.3rem' }}>Nota: {r.admin_note}</div>}
                </div>
                <span style={{ background: statusColor[r.status] + '22', color: statusColor[r.status], border: `1px solid ${statusColor[r.status]}44`, padding: '0.3rem 0.9rem', borderRadius: 8, fontSize: '0.82rem', fontWeight: 600 }}>
                  {statusLabel[r.status]}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
