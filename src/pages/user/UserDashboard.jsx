import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import { usePrices, ALL_ASSETS } from '../../lib/prices'
import UserTrade from './UserTrade'
import UserPortfolio from './UserPortfolio'
import UserDeposit from './UserDeposit'
import UserHistory from './UserHistory'
import DashboardHome from './DashboardHome'

const NAV = [
  { section: 'MERCADOS', items: [
    { id: 'home', label: 'Dashboard', icon: '⊞' },
    { id: 'market', label: 'Mercado', icon: '📈' },
    { id: 'portfolio', label: 'Mi Portafolio', icon: '💼' },
    { id: 'watchlist', label: 'Watchlist', icon: '👁' },
  ]},
  { section: 'FINANZAS', items: [
    { id: 'deposits', label: 'Depósitos', icon: '💰' },
    { id: 'history', label: 'Historial', icon: '📋' },
  ]},
]

export default function UserDashboard() {
  const { user, profile, signOut } = useAuth()
  const [page, setPage] = useState('home')
  const [balance, setBalance] = useState(0)
  const [positions, setPositions] = useState([])
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const allSymbols = ALL_ASSETS.map(a => a.symbol)
  const { prices } = usePrices(allSymbols)

  useEffect(() => { if (user) { fetchBalance(); fetchPositions() } }, [user])

  async function fetchBalance() {
    const { data } = await supabase.from('profiles').select('balance').eq('id', user.id).single()
    if (data) setBalance(data.balance ?? 0)
  }
  async function fetchPositions() {
    const { data } = await supabase.from('positions').select('*').eq('user_id', user.id).eq('status', 'open')
    setPositions(data || [])
  }

  const pnl = positions.reduce((acc, pos) => {
    const p = prices[pos.symbol]?.price ?? pos.entry_price
    return acc + (pos.side === 'buy' ? (p - pos.entry_price) * pos.quantity : (pos.entry_price - p) * pos.quantity)
  }, 0)

  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'Trader'

  const S = {
    wrap: { display: 'flex', fontFamily: "'Inter',sans-serif", background: '#060d1a', minHeight: '100vh', color: '#fff' },
    sidebar: { width: sidebarOpen ? 220 : 64, background: '#0a1628', borderRight: '1px solid #1a2a42', transition: 'width .2s', flexShrink: 0, display: 'flex', flexDirection: 'column' },
    logo: { display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '1.2rem 1rem', borderBottom: '1px solid #1a2a42', cursor: 'pointer' },
    logoIcon: { width: 34, height: 34, background: 'linear-gradient(135deg,#00d4aa,#0066ff)', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 16, flexShrink: 0 },
    nav: { flex: 1, padding: '1rem 0', overflowY: 'auto' },
    section: { fontSize: '0.65rem', fontWeight: 700, color: '#445', letterSpacing: '0.08em', padding: '0.8rem 1rem 0.4rem', display: sidebarOpen ? 'block' : 'none' },
    navItem: (active) => ({ display: 'flex', alignItems: 'center', gap: '0.7rem', padding: '0.65rem 1rem', cursor: 'pointer', borderRadius: '0 8px 8px 0', margin: '0 0.5rem 0.1rem 0', background: active ? '#00d4aa18' : 'transparent', borderLeft: active ? '2px solid #00d4aa' : '2px solid transparent', color: active ? '#00d4aa' : '#778', transition: 'all .15s', fontSize: '0.88rem', fontWeight: active ? 600 : 400 }),
    main: { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' },
    topbar: { background: '#0a1628', borderBottom: '1px solid #1a2a42', padding: '0 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 56, flexShrink: 0 },
    content: { flex: 1, overflow: 'auto', padding: '1.5rem' },
  }

  return (
    <div style={S.wrap}>
      {/* SIDEBAR */}
      <div style={S.sidebar}>
        <div style={S.logo} onClick={() => setSidebarOpen(!sidebarOpen)}>
          <div style={S.logoIcon}>T</div>
          {sidebarOpen && <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>Trade<span style={{ color: '#00d4aa' }}>Lab</span></span>}
        </div>
        <nav style={S.nav}>
          {NAV.map(({ section, items }) => (
            <div key={section}>
              <div style={S.section}>{section}</div>
              {items.map(item => (
                <div key={item.id} style={S.navItem(page === item.id)} onClick={() => setPage(item.id)}>
                  <span style={{ fontSize: '1rem', flexShrink: 0 }}>{item.icon}</span>
                  {sidebarOpen && <span>{item.label}</span>}
                </div>
              ))}
            </div>
          ))}
        </nav>
        {/* Market status */}
        <div style={{ padding: '1rem', borderTop: '1px solid #1a2a42' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#00d4aa', boxShadow: '0 0 6px #00d4aa' }} />
            {sidebarOpen && <span style={{ fontSize: '0.78rem', color: '#00d4aa' }}>Mercado Activo</span>}
          </div>
        </div>
      </div>

      {/* MAIN */}
      <div style={S.main}>
        {/* TOPBAR */}
        <div style={S.topbar}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#ccd' }}>
              {NAV.flatMap(n => n.items).find(i => i.id === page)?.label || 'Dashboard'}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
            {/* Balance */}
            <div style={{ background: '#06101e', border: '1px solid #1a2a42', borderRadius: 8, padding: '0.4rem 1rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
              <div>
                <div style={{ fontSize: '0.65rem', color: '#556' }}>BALANCE</div>
                <div style={{ fontWeight: 700, color: '#00d4aa', fontSize: '0.95rem' }}>${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
              </div>
              <div style={{ borderLeft: '1px solid #1a2a42', paddingLeft: '0.8rem' }}>
                <div style={{ fontSize: '0.65rem', color: '#556' }}>P&L</div>
                <div style={{ fontWeight: 700, color: pnl >= 0 ? '#00d4aa' : '#ff6b6b', fontSize: '0.95rem' }}>{pnl >= 0 ? '+' : ''}${pnl.toFixed(2)}</div>
              </div>
            </div>
            {/* User */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div style={{ width: 32, height: 32, background: 'linear-gradient(135deg,#00d4aa,#0066ff)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem' }}>
                {displayName[0].toUpperCase()}
              </div>
              <span style={{ fontSize: '0.85rem', color: '#aab' }}>{displayName}</span>
            </div>
            <button onClick={signOut} style={{ background: 'none', border: '1px solid #1a2a42', color: '#556', padding: '0.35rem 0.8rem', borderRadius: 7, cursor: 'pointer', fontSize: '0.78rem' }}>Salir</button>
          </div>
        </div>

        {/* PAGE CONTENT */}
        <div style={S.content}>
          {page === 'home' && <DashboardHome prices={prices} balance={balance} pnl={pnl} positions={positions} setPage={setPage} />}
          {page === 'market' && <UserTrade prices={prices} balance={balance} onTradeSuccess={() => { fetchBalance(); fetchPositions() }} />}
          {page === 'portfolio' && <UserPortfolio positions={positions} prices={prices} onClose={() => { fetchBalance(); fetchPositions() }} />}
          {page === 'deposits' && <UserDeposit balance={balance} onRefresh={fetchBalance} />}
          {page === 'history' && <UserHistory />}
          {page === 'watchlist' && (
            <div style={{ textAlign: 'center', color: '#445', padding: '5rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👁</div>
              <div style={{ fontSize: '1.1rem', color: '#667' }}>Watchlist próximamente</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
