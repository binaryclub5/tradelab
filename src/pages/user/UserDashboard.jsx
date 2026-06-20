import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import { usePrices, ALL_ASSETS } from '../../lib/prices'
import UserTrade from './UserTrade'
import UserPortfolio from './UserPortfolio'
import UserDeposit from './UserDeposit'
import UserHistory from './UserHistory'

const tabs = ['Mercado', 'Mi Portafolio', 'Depósitos', 'Historial']

export default function UserDashboard() {
  const { user, profile, signOut } = useAuth()
  const [tab, setTab] = useState('Mercado')
  const [balance, setBalance] = useState(0)
  const [positions, setPositions] = useState([])
  const [selectedAsset, setSelectedAsset] = useState(null)
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

  const portfolioValue = positions.reduce((acc, pos) => {
    const p = prices[pos.symbol]?.price ?? pos.entry_price
    return acc + (pos.side === 'buy' ? (p - pos.entry_price) * pos.quantity : (pos.entry_price - p) * pos.quantity)
  }, 0)

  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'Trader'

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: '#080e1c', minHeight: '100vh', color: '#fff' }}>
      {/* TOPBAR */}
      <div style={{ background: '#0d1a30', borderBottom: '1px solid #1e2d4a', padding: '0 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 60 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{ width: 32, height: 32, background: 'linear-gradient(135deg,#00d4aa,#0066ff)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 16 }}>T</div>
          <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>Trade<span style={{ color: '#00d4aa' }}>Lab</span></span>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {tabs.map(t => (
            <button key={t} onClick={() => setTab(t)}
              style={{ background: tab === t ? '#00d4aa22' : 'transparent', border: tab === t ? '1px solid #00d4aa' : '1px solid transparent', color: tab === t ? '#00d4aa' : '#889', padding: '0.4rem 0.9rem', borderRadius: 8, cursor: 'pointer', fontSize: '0.85rem' }}>
              {t}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.7rem', color: '#667' }}>Balance</div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#00d4aa' }}>${balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          </div>
          <div style={{ width: 34, height: 34, background: '#1e2d4a', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.9rem' }}>
            {displayName[0].toUpperCase()}
          </div>
          <button onClick={signOut} style={{ background: 'none', border: '1px solid #1e2d4a', color: '#667', padding: '0.4rem 0.8rem', borderRadius: 8, cursor: 'pointer', fontSize: '0.8rem' }}>Salir</button>
        </div>
      </div>

      {/* SUMMARY BAR */}
      <div style={{ background: '#0a1428', borderBottom: '1px solid #1e2d4a', padding: '0.8rem 1.5rem', display: 'flex', gap: '2.5rem', overflowX: 'auto' }}>
        {[
          { label: 'Balance disponible', value: `$${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, color: '#00d4aa' },
          { label: 'P&L no realizado', value: `${portfolioValue >= 0 ? '+' : ''}$${portfolioValue.toFixed(2)}`, color: portfolioValue >= 0 ? '#00d4aa' : '#ff6b6b' },
          { label: 'Posiciones abiertas', value: positions.length, color: '#fff' },
          { label: 'Usuario', value: displayName, color: '#aab' },
        ].map(item => (
          <div key={item.label} style={{ whiteSpace: 'nowrap' }}>
            <div style={{ fontSize: '0.7rem', color: '#556', marginBottom: 2 }}>{item.label}</div>
            <div style={{ fontWeight: 700, color: item.color }}>{item.value}</div>
          </div>
        ))}
      </div>

      {/* CONTENT */}
      <div style={{ padding: '1.5rem' }}>
        {tab === 'Mercado' && (
          <UserTrade prices={prices} balance={balance} onTradeSuccess={() => { fetchBalance(); fetchPositions() }} selectedAsset={selectedAsset} setSelectedAsset={setSelectedAsset} />
        )}
        {tab === 'Mi Portafolio' && (
          <UserPortfolio positions={positions} prices={prices} onClose={() => { fetchBalance(); fetchPositions() }} />
        )}
        {tab === 'Depósitos' && (
          <UserDeposit balance={balance} onRefresh={fetchBalance} />
        )}
        {tab === 'Historial' && (
          <UserHistory />
        )}
      </div>
    </div>
  )
}
