import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'

const tabs = ['Resumen', 'Usuarios', 'Depósitos', 'CRM', 'Trades']

export default function AdminDashboard() {
  const { signOut } = useAuth()
  const [tab, setTab] = useState('Resumen')
  const [stats, setStats] = useState({ users: 0, pending: 0, totalDeposits: 0, totalTrades: 0 })
  const [users, setUsers] = useState([])
  const [requests, setRequests] = useState([])
  const [trades, setTrades] = useState([])
  const [leads, setLeads] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [adminNote, setAdminNote] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => { fetchAll() }, [])

  async function fetchAll() {
    const [u, r, t, l] = await Promise.all([
      supabase.from('profiles').select('*').order('created_at', { ascending: false }),
      supabase.from('fund_requests').select('*, profiles(full_name, email)').order('created_at', { ascending: false }),
      supabase.from('trades').select('*').order('created_at', { ascending: false }).limit(200),
      supabase.from('leads').select('*').order('created_at', { ascending: false }),
    ])
    setUsers(u.data || [])
    setRequests(r.data || [])
    setTrades(t.data || [])
    setLeads(l.data || [])
    setStats({
      users: u.data?.length ?? 0,
      pending: r.data?.filter(x => x.status === 'pending').length ?? 0,
      totalDeposits: r.data?.filter(x => x.status === 'approved' && x.type === 'deposit').reduce((a, x) => a + x.amount, 0) ?? 0,
      totalTrades: t.data?.length ?? 0,
    })
  }

  async function handleRequest(id, status) {
    setLoading(true)
    const req = requests.find(r => r.id === id)
    await supabase.from('fund_requests').update({ status, admin_note: adminNote || null, reviewed_at: new Date().toISOString() }).eq('id', id)
    // Si se aprueba depósito, acreditar al usuario
    if (status === 'approved' && req?.type === 'deposit') {
      const { data: prof } = await supabase.from('profiles').select('balance').eq('id', req.user_id).single()
      await supabase.from('profiles').update({ balance: (prof?.balance ?? 0) + req.amount }).eq('id', req.user_id)
    }
    // Si se aprueba retiro, debitar
    if (status === 'approved' && req?.type === 'withdraw') {
      const { data: prof } = await supabase.from('profiles').select('balance').eq('id', req.user_id).single()
      await supabase.from('profiles').update({ balance: Math.max(0, (prof?.balance ?? 0) - req.amount) }).eq('id', req.user_id)
    }
    setAdminNote('')
    fetchAll()
    setLoading(false)
  }

  async function adjustBalance(userId, newBalance) {
    await supabase.from('profiles').update({ balance: parseFloat(newBalance) }).eq('id', userId)
    fetchAll()
  }

  async function updateLeadStatus(id, crm_status) {
    await supabase.from('leads').update({ crm_status }).eq('id', id)
    fetchAll()
  }

  const statusColor = { pending: '#f59e0b', approved: '#00d4aa', rejected: '#ff6b6b' }
  const crmColors = { nuevo: '#0066ff', contactado: '#f59e0b', negociando: '#a855f7', convertido: '#00d4aa', perdido: '#ff6b6b' }

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: '#080e1c', minHeight: '100vh', color: '#fff' }}>
      {/* TOPBAR */}
      <div style={{ background: '#0d1a30', borderBottom: '1px solid #1e2d4a', padding: '0 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 60 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{ width: 32, height: 32, background: 'linear-gradient(135deg,#00d4aa,#0066ff)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 16 }}>T</div>
          <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>Trade<span style={{ color: '#00d4aa' }}>Lab</span></span>
          <span style={{ background: '#f59e0b22', color: '#f59e0b', border: '1px solid #f59e0b44', padding: '0.1rem 0.5rem', borderRadius: 6, fontSize: '0.7rem', marginLeft: '0.5rem' }}>ADMIN</span>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {tabs.map(t => (
            <button key={t} onClick={() => setTab(t)}
              style={{ background: tab === t ? '#00d4aa22' : 'transparent', border: tab === t ? '1px solid #00d4aa' : '1px solid transparent', color: tab === t ? '#00d4aa' : '#889', padding: '0.4rem 0.9rem', borderRadius: 8, cursor: 'pointer', fontSize: '0.85rem', position: 'relative' }}>
              {t}
              {t === 'Depósitos' && stats.pending > 0 && (
                <span style={{ position: 'absolute', top: -6, right: -6, background: '#ff6b6b', color: '#fff', borderRadius: '50%', width: 16, height: 16, fontSize: '0.65rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>{stats.pending}</span>
              )}
            </button>
          ))}
        </div>
        <button onClick={signOut} style={{ background: 'none', border: '1px solid #1e2d4a', color: '#667', padding: '0.4rem 0.8rem', borderRadius: 8, cursor: 'pointer', fontSize: '0.8rem' }}>Salir</button>
      </div>

      <div style={{ padding: '1.5rem' }}>
        {/* RESUMEN */}
        {tab === 'Resumen' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
              {[
                { label: 'Usuarios registrados', value: stats.users, icon: '👥', color: '#0066ff' },
                { label: 'Solicitudes pendientes', value: stats.pending, icon: '⏳', color: '#f59e0b' },
                { label: 'Total depósitos aprobados', value: `$${stats.totalDeposits.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, icon: '💰', color: '#00d4aa' },
                { label: 'Total operaciones', value: stats.totalTrades, icon: '📊', color: '#a855f7' },
              ].map(s => (
                <div key={s.label} style={{ background: '#0d1a30', border: `1px solid ${s.color}33`, borderRadius: 14, padding: '1.5rem' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{s.icon}</div>
                  <div style={{ fontSize: '0.8rem', color: '#667', marginBottom: '0.3rem' }}>{s.label}</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: s.color }}>{s.value}</div>
                </div>
              ))}
            </div>
            <div style={{ background: '#0d1a30', border: '1px solid #1e2d4a', borderRadius: 14, padding: '1.5rem' }}>
              <h3 style={{ margin: '0 0 1rem', color: '#aab' }}>Solicitudes pendientes de revisión</h3>
              {requests.filter(r => r.status === 'pending').length === 0
                ? <div style={{ color: '#445', textAlign: 'center', padding: '2rem' }}>No hay solicitudes pendientes 🎉</div>
                : requests.filter(r => r.status === 'pending').slice(0, 5).map(r => (
                  <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.8rem 0', borderBottom: '1px solid #1e2d4a' }}>
                    <div>
                      <span style={{ fontWeight: 700 }}>{r.profiles?.full_name || r.profiles?.email}</span>
                      <span style={{ color: '#667', fontSize: '0.85rem', marginLeft: '0.8rem' }}>{r.type === 'deposit' ? 'Depósito' : 'Retiro'} ${r.amount}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={() => handleRequest(r.id, 'approved')} style={{ background: '#00d4aa', border: 'none', color: '#000', padding: '0.3rem 0.8rem', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem' }}>Aprobar</button>
                      <button onClick={() => handleRequest(r.id, 'rejected')} style={{ background: '#ff6b6b22', border: '1px solid #ff6b6b44', color: '#ff6b6b', padding: '0.3rem 0.8rem', borderRadius: 6, cursor: 'pointer', fontSize: '0.8rem' }}>Rechazar</button>
                    </div>
                  </div>
                ))
              }
            </div>
          </div>
        )}

        {/* USUARIOS */}
        {tab === 'Usuarios' && (
          <div>
            <h2 style={{ margin: '0 0 1.5rem', fontSize: '1.3rem' }}>Gestión de usuarios</h2>
            <div style={{ background: '#0d1a30', border: '1px solid #1e2d4a', borderRadius: 14, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#06101e' }}>
                    {['Usuario', 'Email', 'Balance', 'Rol', 'Registro', 'Acciones'].map(h => (
                      <th key={h} style={{ padding: '0.8rem 1rem', textAlign: 'left', fontSize: '0.75rem', color: '#556', fontWeight: 600, textTransform: 'uppercase' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id} style={{ borderTop: '1px solid #1e2d4a' }}>
                      <td style={{ padding: '1rem', fontWeight: 700 }}>{u.full_name || '—'}</td>
                      <td style={{ padding: '1rem', color: '#889', fontSize: '0.85rem' }}>{u.email}</td>
                      <td style={{ padding: '1rem' }}>
                        <input type="number" defaultValue={u.balance ?? 0} onBlur={e => adjustBalance(u.id, e.target.value)}
                          style={{ background: '#06101e', border: '1px solid #1e2d4a', borderRadius: 6, padding: '0.3rem 0.6rem', color: '#00d4aa', fontWeight: 700, width: 100 }} />
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{ background: u.role === 'admin' ? '#f59e0b22' : '#1e2d4a', color: u.role === 'admin' ? '#f59e0b' : '#889', padding: '0.2rem 0.7rem', borderRadius: 6, fontSize: '0.78rem' }}>
                          {u.role || 'user'}
                        </span>
                      </td>
                      <td style={{ padding: '1rem', color: '#667', fontSize: '0.8rem' }}>{new Date(u.created_at).toLocaleDateString('es-CO')}</td>
                      <td style={{ padding: '1rem' }}>
                        <button onClick={() => setSelectedUser(selectedUser?.id === u.id ? null : u)}
                          style={{ background: '#1e2d4a', border: 'none', color: '#aab', padding: '0.3rem 0.8rem', borderRadius: 6, cursor: 'pointer', fontSize: '0.8rem' }}>
                          Ver detalle
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {selectedUser && (
              <div style={{ marginTop: '1.5rem', background: '#0d1a30', border: '1px solid #1e2d4a', borderRadius: 14, padding: '1.5rem' }}>
                <h3 style={{ margin: '0 0 1rem' }}>Detalle: {selectedUser.full_name || selectedUser.email}</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                  {[
                    { label: 'Trades totales', value: trades.filter(t => t.user_id === selectedUser.id).length },
                    { label: 'Depósitos aprobados', value: requests.filter(r => r.user_id === selectedUser.id && r.type === 'deposit' && r.status === 'approved').length },
                    { label: 'P&L realizado', value: `$${trades.filter(t => t.user_id === selectedUser.id && t.action === 'close').reduce((a, t) => a + (t.pnl ?? 0), 0).toFixed(2)}` },
                  ].map(s => (
                    <div key={s.label} style={{ background: '#06101e', borderRadius: 10, padding: '1rem' }}>
                      <div style={{ fontSize: '0.75rem', color: '#667' }}>{s.label}</div>
                      <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#00d4aa' }}>{s.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* DEPÓSITOS */}
        {tab === 'Depósitos' && (
          <div>
            <h2 style={{ margin: '0 0 1.5rem', fontSize: '1.3rem' }}>Solicitudes de fondos</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              {requests.map(r => (
                <div key={r.id} style={{ background: '#0d1a30', border: `1px solid ${r.status === 'pending' ? '#f59e0b44' : '#1e2d4a'}`, borderRadius: 12, padding: '1.2rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontWeight: 700, marginBottom: '0.3rem' }}>
                        {r.type === 'deposit' ? '↓ Depósito' : '↑ Retiro'} — <span style={{ color: '#00d4aa' }}>${r.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD</span>
                      </div>
                      <div style={{ fontSize: '0.85rem', color: '#889' }}>{r.profiles?.full_name || '—'} · {r.profiles?.email}</div>
                      <div style={{ fontSize: '0.8rem', color: '#667', marginTop: '0.3rem' }}>{r.method} · {new Date(r.created_at).toLocaleString('es-CO')}</div>
                      {r.tx_hash && <div style={{ fontSize: '0.75rem', color: '#557', marginTop: '0.2rem', fontFamily: 'monospace' }}>TX: {r.tx_hash}</div>}
                    </div>
                    <span style={{ background: statusColor[r.status] + '22', color: statusColor[r.status], border: `1px solid ${statusColor[r.status]}44`, padding: '0.3rem 0.9rem', borderRadius: 8, fontSize: '0.82rem', fontWeight: 600 }}>
                      {r.status === 'pending' ? 'Pendiente' : r.status === 'approved' ? 'Aprobado' : 'Rechazado'}
                    </span>
                  </div>
                  {r.status === 'pending' && (
                    <div style={{ marginTop: '1rem', display: 'flex', gap: '0.7rem', alignItems: 'center' }}>
                      <input value={adminNote} onChange={e => setAdminNote(e.target.value)} placeholder="Nota para el usuario (opcional)"
                        style={{ flex: 1, background: '#06101e', border: '1px solid #1e2d4a', borderRadius: 8, padding: '0.5rem 0.8rem', color: '#fff', fontSize: '0.85rem' }} />
                      <button onClick={() => handleRequest(r.id, 'approved')} disabled={loading}
                        style={{ background: '#00d4aa', border: 'none', color: '#000', padding: '0.5rem 1.2rem', borderRadius: 8, cursor: 'pointer', fontWeight: 700 }}>Aprobar</button>
                      <button onClick={() => handleRequest(r.id, 'rejected')} disabled={loading}
                        style={{ background: '#ff6b6b22', border: '1px solid #ff6b6b44', color: '#ff6b6b', padding: '0.5rem 1.2rem', borderRadius: 8, cursor: 'pointer' }}>Rechazar</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CRM */}
        {tab === 'CRM' && (
          <div>
            <h2 style={{ margin: '0 0 1.5rem', fontSize: '1.3rem' }}>CRM — Gestión de leads</h2>
            {leads.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#445', padding: '4rem' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📋</div>
                <div>No hay leads aún. Los formularios de la landing alimentarán este panel.</div>
              </div>
            ) : (
              <div style={{ background: '#0d1a30', border: '1px solid #1e2d4a', borderRadius: 14, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#06101e' }}>
                      {['Nombre', 'Email', 'Teléfono', 'Origen', 'Estado', 'Fecha', 'Acciones'].map(h => (
                        <th key={h} style={{ padding: '0.8rem 1rem', textAlign: 'left', fontSize: '0.75rem', color: '#556', fontWeight: 600, textTransform: 'uppercase' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {leads.map(l => (
                      <tr key={l.id} style={{ borderTop: '1px solid #1e2d4a' }}>
                        <td style={{ padding: '1rem', fontWeight: 700 }}>{l.name}</td>
                        <td style={{ padding: '1rem', color: '#889', fontSize: '0.85rem' }}>{l.email}</td>
                        <td style={{ padding: '1rem', color: '#889', fontSize: '0.85rem' }}>{l.phone || '—'}</td>
                        <td style={{ padding: '1rem' }}>
                          <span style={{ background: '#1e2d4a', padding: '0.2rem 0.6rem', borderRadius: 6, fontSize: '0.75rem', color: '#889' }}>{l.source || 'landing'}</span>
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <select value={l.crm_status || 'nuevo'} onChange={e => updateLeadStatus(l.id, e.target.value)}
                            style={{ background: '#06101e', border: `1px solid ${crmColors[l.crm_status || 'nuevo']}44`, borderRadius: 6, padding: '0.3rem 0.6rem', color: crmColors[l.crm_status || 'nuevo'], fontSize: '0.82rem', cursor: 'pointer' }}>
                            <option value="nuevo">Nuevo</option>
                            <option value="contactado">Contactado</option>
                            <option value="negociando">Negociando</option>
                            <option value="convertido">Convertido</option>
                            <option value="perdido">Perdido</option>
                          </select>
                        </td>
                        <td style={{ padding: '1rem', color: '#667', fontSize: '0.8rem' }}>{new Date(l.created_at).toLocaleDateString('es-CO')}</td>
                        <td style={{ padding: '1rem' }}>
                          {l.email && <a href={`mailto:${l.email}`} style={{ color: '#00d4aa', fontSize: '0.8rem', textDecoration: 'none' }}>✉ Escribir</a>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TRADES */}
        {tab === 'Trades' && (
          <div>
            <h2 style={{ margin: '0 0 1.5rem', fontSize: '1.3rem' }}>Todas las operaciones</h2>
            <div style={{ background: '#0d1a30', border: '1px solid #1e2d4a', borderRadius: 14, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#06101e' }}>
                    {['Fecha', 'Usuario', 'Activo', 'Tipo', 'Cantidad', 'Precio', 'P&L'].map(h => (
                      <th key={h} style={{ padding: '0.8rem 1rem', textAlign: 'left', fontSize: '0.75rem', color: '#556', fontWeight: 600 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {trades.slice(0, 100).map(t => (
                    <tr key={t.id} style={{ borderTop: '1px solid #1e2d4a' }}>
                      <td style={{ padding: '0.8rem 1rem', fontSize: '0.78rem', color: '#778' }}>{new Date(t.created_at).toLocaleDateString('es-CO')}</td>
                      <td style={{ padding: '0.8rem 1rem', fontSize: '0.82rem', color: '#889' }}>{t.user_id?.slice(0, 8)}...</td>
                      <td style={{ padding: '0.8rem 1rem', fontWeight: 700 }}>{t.symbol}</td>
                      <td style={{ padding: '0.8rem 1rem', color: t.side === 'buy' ? '#00d4aa' : '#ff6b6b', fontSize: '0.85rem', fontWeight: 600 }}>{t.side === 'buy' ? '▲' : '▼'} {t.action === 'open' ? 'Apertura' : 'Cierre'}</td>
                      <td style={{ padding: '0.8rem 1rem' }}>{t.quantity}</td>
                      <td style={{ padding: '0.8rem 1rem' }}>${t.price?.toFixed(4)}</td>
                      <td style={{ padding: '0.8rem 1rem', color: t.pnl == null ? '#556' : t.pnl >= 0 ? '#00d4aa' : '#ff6b6b', fontWeight: 600 }}>
                        {t.pnl != null ? `${t.pnl >= 0 ? '+' : ''}$${t.pnl.toFixed(2)}` : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
