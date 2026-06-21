import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import { usePrices, ALL_ASSETS, fmtPrice } from '../../lib/prices'
import { T } from '../../lib/theme'

// Páginas
import PageDashboard from './pages/PageDashboard'
import PageStocks from './pages/PageStocks'
import PageAllStocks from './pages/PageAllStocks'
import PageGainersLosers from './pages/PageGainersLosers'
import PageGlobalMarkets from './pages/PageGlobalMarkets'
import PageHeatmap from './pages/PageHeatmap'
import PageScreener from './pages/PageScreener'
import PageTechnicals from './pages/PageTechnicals'
import PageMarketPulse from './pages/PageMarketPulse'
import PageCompare from './pages/PageCompare'
import PagePortfolio from './pages/PagePortfolio'
import PageWatchlist from './pages/PageWatchlist'
import PageOrders from './pages/PageOrders'
import PagePositions from './pages/PagePositions'
import PageFunds from './pages/PageFunds'
import PageCalculator from './pages/PageCalculator'
import PageDeposits from './pages/PageDeposits'
import PageHistory from './pages/PageHistory'
import PageSettings from './pages/PageSettings'
import PageNews from './pages/PageNews'

const NAV = [
  { section: 'MERCADOS', items: [
    { id: 'dashboard', label: 'Dashboard', icon: '⊞' },
    { id: 'stocks', label: 'Acciones', icon: '📊' },
    { id: 'allstocks', label: 'Todas las Acciones', icon: '📋', badge: ALL_ASSETS.length + '+' },
    { id: 'gainers', label: 'Ganadoras / Perdedoras', icon: '📈' },
    { id: 'global', label: 'Mercados Globales', icon: '🌐' },
    { id: 'heatmap', label: 'Mapa de Calor', icon: '🔥' },
  ]},
  { section: 'ANÁLISIS', items: [
    { id: 'screener', label: 'Screener Pro', icon: '🔎' },
    { id: 'technicals', label: 'Técnicos', icon: '📉' },
    { id: 'pulse', label: 'Pulso de Mercado', icon: '💓' },
    { id: 'compare', label: 'Comparar', icon: '⚖️' },
    { id: 'news', label: 'Noticias', icon: '📰' },
  ]},
  { section: 'TRADING', items: [
    { id: 'portfolio', label: 'Portafolio', icon: '💼' },
    { id: 'watchlist', label: 'Watchlist', icon: '👁' },
    { id: 'orders', label: 'Órdenes', icon: '📝' },
    { id: 'positions', label: 'Posiciones', icon: '📍' },
    { id: 'funds', label: 'Fondos y Margen', icon: '💵' },
  ]},
  { section: 'HERRAMIENTAS', items: [
    { id: 'calculator', label: 'Calculadora', icon: '🧮' },
    { id: 'deposits', label: 'Depósitos', icon: '💰' },
    { id: 'history', label: 'Historial', icon: '🗂' },
  ]},
]

export default function UserDashboard() {
  const { user, profile, signOut } = useAuth()
  const [page, setPage] = useState('dashboard')
  const [balance, setBalance] = useState(0)
  const [positions, setPositions] = useState([])
  const [watchlist, setWatchlist] = useState([])
  const [collapsed, setCollapsed] = useState(false)
  const [clock, setClock] = useState('')
  const [mobileNav, setMobileNav] = useState(false)

  const allSymbols = ALL_ASSETS.map(a => a.symbol)
  const { prices, refresh } = usePrices(allSymbols, 15000)

  useEffect(() => { if (user) { fetchBalance(); fetchPositions(); fetchWatchlist() } }, [user])
  useEffect(() => {
    const t = setInterval(() => {
      const now = new Date()
      setClock(now.toLocaleTimeString('en-US', { timeZone: 'America/New_York', hour12: false }))
    }, 1000)
    return () => clearInterval(t)
  }, [])

  async function fetchBalance() {
    const { data } = await supabase.from('profiles').select('balance').eq('id', user.id).single()
    if (data) setBalance(data.balance ?? 0)
  }
  async function fetchPositions() {
    const { data } = await supabase.from('positions').select('*').eq('user_id', user.id).eq('status', 'open')
    setPositions(data || [])
  }
  async function fetchWatchlist() {
    const { data } = await supabase.from('watchlist').select('symbol').eq('user_id', user.id)
    setWatchlist(data?.map(w => w.symbol) || [])
  }
  async function toggleWatch(symbol) {
    if (watchlist.includes(symbol)) {
      await supabase.from('watchlist').delete().eq('user_id', user.id).eq('symbol', symbol)
    } else {
      await supabase.from('watchlist').insert({ user_id: user.id, symbol })
    }
    fetchWatchlist()
  }

  const pnl = positions.reduce((acc, pos) => {
    const p = prices[pos.symbol]?.price ?? pos.entry_price
    return acc + (pos.side === 'buy' ? (p - pos.entry_price) * pos.quantity : (pos.entry_price - p) * pos.quantity)
  }, 0)

  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'Trader'
  const refresh2 = () => { fetchBalance(); fetchPositions() }
  const ctx = { prices, balance, positions, watchlist, toggleWatch, pnl, setPage, refresh: refresh2, user, refreshPrices: refresh }

  const PAGES = {
    dashboard: PageDashboard, stocks: PageStocks, allstocks: PageAllStocks,
    gainers: PageGainersLosers, global: PageGlobalMarkets, heatmap: PageHeatmap,
    screener: PageScreener, technicals: PageTechnicals, pulse: PageMarketPulse,
    compare: PageCompare, news: PageNews, portfolio: PagePortfolio, watchlist: PageWatchlist,
    orders: PageOrders, positions: PagePositions, funds: PageFunds,
    calculator: PageCalculator, deposits: PageDeposits, history: PageHistory, settings: PageSettings,
  }
  const Active = PAGES[page] || PageDashboard
  const sidebarW = collapsed ? 64 : 240

  return (
    <div style={{ display: 'flex', fontFamily: "'Inter',sans-serif", background: T.bg, minHeight: '100vh', color: T.text }}>
      {/* SIDEBAR */}
      <div style={{ width: sidebarW, background: T.panel2, borderRight: `1px solid ${T.border}`, transition: 'width .2s', flexShrink: 0, display: 'flex', flexDirection: 'column', position: 'sticky', top: 0, height: '100vh', overflowY: 'auto' }}>
        <div onClick={() => setCollapsed(!collapsed)} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '1.1rem 1rem', borderBottom: `1px solid ${T.border}`, cursor: 'pointer', position: 'sticky', top: 0, background: T.panel2, zIndex: 5 }}>
          <div style={{ width: 34, height: 34, background: `linear-gradient(135deg,${T.green},${T.blue})`, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 16, flexShrink: 0 }}>T</div>
          {!collapsed && <span style={{ fontWeight: 700, fontSize: '1.15rem' }}>Trade<span style={{ color: T.green }}>Lab</span></span>}
        </div>
        <nav style={{ flex: 1, padding: '0.8rem 0' }}>
          {NAV.map(({ section, items }) => (
            <div key={section} style={{ marginBottom: '0.5rem' }}>
              {!collapsed && <div style={{ fontSize: '0.62rem', fontWeight: 700, color: T.textFaint, letterSpacing: '0.1em', padding: '0.7rem 1rem 0.3rem' }}>{section}</div>}
              {items.map(item => {
                const active = page === item.id
                return (
                  <div key={item.id} onClick={() => { setPage(item.id); setMobileNav(false) }}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', padding: '0.58rem 1rem', cursor: 'pointer', margin: '0 0.5rem', borderRadius: 8, background: active ? `${T.green}18` : 'transparent', color: active ? T.green : T.textMute, fontSize: '0.85rem', fontWeight: active ? 600 : 400, transition: 'all .12s' }}
                    onMouseEnter={e => { if (!active) e.currentTarget.style.background = '#0f1e33' }}
                    onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}>
                    <span style={{ fontSize: '1rem', flexShrink: 0, width: 20, textAlign: 'center' }}>{item.icon}</span>
                    {!collapsed && <span style={{ flex: 1 }}>{item.label}</span>}
                    {!collapsed && item.badge && <span style={{ background: T.border, color: T.green, fontSize: '0.65rem', padding: '0.1rem 0.4rem', borderRadius: 5, fontWeight: 700 }}>{item.badge}</span>}
                  </div>
                )
              })}
            </div>
          ))}
        </nav>
        <div style={{ padding: '1rem', borderTop: `1px solid ${T.border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: T.green, boxShadow: `0 0 6px ${T.green}` }} />
            {!collapsed && <span style={{ fontSize: '0.76rem', color: T.green }}>Mercado en Vivo</span>}
          </div>
        </div>
      </div>

      {/* MAIN */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* TOPBAR */}
        <div style={{ background: T.panel2, borderBottom: `1px solid ${T.border}`, padding: '0 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 56, position: 'sticky', top: 0, zIndex: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#ccd' }}>
              {NAV.flatMap(n => n.items).find(i => i.id === page)?.label || 'Dashboard'}
            </span>
            <span style={{ background: `${T.green}18`, color: T.green, fontSize: '0.68rem', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: 5, display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: T.green, display: 'inline-block' }} /> LIVE
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '0.78rem', color: T.textMute, fontFamily: 'monospace' }}>NYSE {clock || '--:--:--'}</span>
            <div style={{ background: T.input, border: `1px solid ${T.border}`, borderRadius: 8, padding: '0.35rem 0.9rem', display: 'flex', gap: '0.8rem' }}>
              <div>
                <div style={{ fontSize: '0.6rem', color: T.textFaint }}>BALANCE</div>
                <div style={{ fontWeight: 700, color: T.green, fontSize: '0.9rem' }}>${fmtPrice(balance)}</div>
              </div>
              <div style={{ borderLeft: `1px solid ${T.border}`, paddingLeft: '0.8rem' }}>
                <div style={{ fontSize: '0.6rem', color: T.textFaint }}>P&L</div>
                <div style={{ fontWeight: 700, color: pnl >= 0 ? T.green : T.red, fontSize: '0.9rem' }}>{pnl >= 0 ? '+' : ''}${pnl.toFixed(2)}</div>
              </div>
            </div>
            <div onClick={() => setPage('settings')} style={{ width: 34, height: 34, background: `linear-gradient(135deg,${T.green},${T.blue})`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer' }}>
              {displayName[0].toUpperCase()}
            </div>
            <button onClick={signOut} style={{ background: 'none', border: `1px solid ${T.border}`, color: T.textMute, padding: '0.35rem 0.8rem', borderRadius: 7, cursor: 'pointer', fontSize: '0.78rem' }}>Salir</button>
          </div>
        </div>

        {/* CONTENT */}
        <div style={{ flex: 1, overflow: 'auto', padding: '1.5rem' }}>
          <Active ctx={ctx} />
        </div>
      </div>
    </div>
  )
}
