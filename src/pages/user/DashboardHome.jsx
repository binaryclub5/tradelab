import { useState, useEffect } from 'react'
import { ALL_ASSETS } from '../../lib/prices'

const INDICES = [
  { symbol: 'SPY', tv: 'AMEX:SPY', name: 'S&P 500', sub: 'US Large Cap' },
  { symbol: 'QQQ', tv: 'NASDAQ:QQQ', name: 'NASDAQ 100', sub: 'Tech Index' },
  { symbol: 'DIA', tv: 'AMEX:DIA', name: 'DOW JONES', sub: 'US Blue Chip' },
  { symbol: 'IWM', tv: 'AMEX:IWM', name: 'RUSSELL 2000', sub: 'Small Cap' },
]

const SECTORS = [
  { name: 'Tecnología', symbols: ['AAPL','MSFT','NVDA','GOOGL','META','AMD'], color: '#0066ff' },
  { name: 'Crypto', symbols: ['BTCUSDT','ETHUSDT','SOLUSDT'], color: '#f59e0b' },
  { name: 'Finanzas', symbols: ['COIN'], color: '#00d4aa' },
  { name: 'Entretenimiento', symbols: ['NFLX','AMZN'], color: '#a855f7' },
  { name: 'Forex', symbols: ['EURUSD','GBPUSD','USDMXN'], color: '#06b6d4' },
  { name: 'Materias Primas', symbols: ['XAUUSD','USOIL'], color: '#eab308' },
]

function MiniBar({ values = [], positive }) {
  if (!values.length) return null
  const max = Math.max(...values.map(Math.abs))
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 40, marginTop: 8 }}>
      {values.map((v, i) => (
        <div key={i} style={{
          flex: 1, borderRadius: 2,
          height: `${Math.max(10, (Math.abs(v) / max) * 100)}%`,
          background: v >= 0 ? '#00d4aa66' : '#ff6b6b66',
          minHeight: 4
        }} />
      ))}
    </div>
  )
}

function FearGreedGauge({ value }) {
  const angle = -90 + (value / 100) * 180
  const color = value < 25 ? '#ff4444' : value < 45 ? '#ff8800' : value < 55 ? '#f5c518' : value < 75 ? '#88cc00' : '#00d4aa'
  const label = value < 25 ? 'MIEDO EXTREMO' : value < 45 ? 'MIEDO' : value < 55 ? 'NEUTRAL' : value < 75 ? 'CODICIA' : 'CODICIA EXTREMA'
  const r = 70, cx = 100, cy = 90
  const startAngle = -180, endAngle = 0
  const toRad = d => (d * Math.PI) / 180
  const arcPath = (r, start, end) => {
    const s = { x: cx + r * Math.cos(toRad(start)), y: cy + r * Math.sin(toRad(start)) }
    const e = { x: cx + r * Math.cos(toRad(end)), y: cy + r * Math.sin(toRad(end)) }
    return `M ${s.x} ${s.y} A ${r} ${r} 0 0 1 ${e.x} ${e.y}`
  }
  const needleX = cx + r * 0.8 * Math.cos(toRad(angle - 90))
  const needleY = cy + r * 0.8 * Math.sin(toRad(angle - 90))

  return (
    <div style={{ textAlign: 'center' }}>
      <svg width="200" height="110" viewBox="0 0 200 110">
        <path d={arcPath(r, -180, -135)} stroke="#ff4444" strokeWidth="8" fill="none" strokeLinecap="round" />
        <path d={arcPath(r, -135, -90)} stroke="#ff8800" strokeWidth="8" fill="none" strokeLinecap="round" />
        <path d={arcPath(r, -90, -45)} stroke="#f5c518" strokeWidth="8" fill="none" strokeLinecap="round" />
        <path d={arcPath(r, -45, 0)} stroke="#00d4aa" strokeWidth="8" fill="none" strokeLinecap="round" />
        <line x1={cx} y1={cy} x2={needleX} y2={needleY} stroke={color} strokeWidth="3" strokeLinecap="round" />
        <circle cx={cx} cy={cy} r="5" fill={color} />
        <text x={cx} y={cy + 20} textAnchor="middle" fill={color} fontSize="22" fontWeight="800">{value}</text>
      </svg>
      <div style={{ fontSize: '0.85rem', fontWeight: 700, color, letterSpacing: '0.05em', marginTop: -8 }}>{label}</div>
      <div style={{ fontSize: '0.75rem', color: '#556', marginTop: 4 }}>Índice de Miedo y Codicia</div>
    </div>
  )
}

export default function DashboardHome({ prices, balance, pnl, positions, setPage }) {
  const [indices, setIndices] = useState({})
  const [fearGreed, setFearGreed] = useState(50)
  const [history, setHistory] = useState({})

  useEffect(() => { fetchIndices() }, [])

  async function fetchIndices() {
    try {
      const tickers = INDICES.map(i => i.tv)
      const res = await fetch('https://scanner.tradingview.com/global/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbols: { tickers }, columns: ['lp', 'close', 'change', 'High.1M', 'Low.1M'] })
      })
      const json = await res.json()
      const updated = {}
      const hist = {}
      json.data?.forEach((item, i) => {
        const sym = INDICES[i].symbol
        const lp = item.d[0], close = item.d[1], change = item.d[2] ?? 0
        updated[sym] = { price: lp, change, close }
        // Simular mini barras con variaciones del precio
        hist[sym] = Array.from({ length: 20 }, (_, k) => {
          const noise = (Math.random() - 0.5) * 0.02
          return lp * (1 + noise * (k / 20))
        })
      })
      setIndices(updated)
      setHistory(hist)
      // Fear & Greed basado en cambios del mercado
      const avgChange = Object.values(updated).reduce((a, b) => a + (b.change || 0), 0) / Object.values(updated).length
      const fg = Math.max(5, Math.min(95, 50 + avgChange * 8))
      setFearGreed(Math.round(fg))
    } catch (e) { console.error(e) }
  }

  // Gainers y losers de ALL_ASSETS
  const withPrices = ALL_ASSETS
    .filter(a => prices[a.symbol]?.price)
    .map(a => ({ ...a, price: prices[a.symbol].price, change: prices[a.symbol].change ?? 0 }))
    .sort((a, b) => b.change - a.change)

  const gainers = withPrices.slice(0, 5)
  const losers = [...withPrices].sort((a, b) => a.change - b.change).slice(0, 5)

  // Sector performance
  const sectorPerf = SECTORS.map(sec => {
    const changes = sec.symbols.map(s => prices[s]?.change ?? 0).filter(Boolean)
    const avg = changes.length ? changes.reduce((a, b) => a + b, 0) / changes.length : 0
    return { ...sec, avg }
  }).sort((a, b) => b.avg - a.avg)

  const maxSector = Math.max(...sectorPerf.map(s => Math.abs(s.avg)), 1)

  const fmtPrice = (p) => p >= 1000 ? p.toLocaleString('en-US', { maximumFractionDigits: 2 }) : p?.toFixed(p > 10 ? 2 : 4) || '—'
  const fmtChange = (c) => `${c >= 0 ? '+' : ''}${c?.toFixed(2)}%`

  return (
    <div>
      {/* TOP SUMMARY */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        {INDICES.map(idx => {
          const d = indices[idx.symbol]
          const pos = d?.change >= 0
          return (
            <div key={idx.symbol} style={{ background: '#0d1a30', border: `1px solid ${pos ? '#00d4aa33' : '#ff6b6b33'}`, borderRadius: 14, padding: '1.2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#aab' }}>{idx.name}</div>
                  <div style={{ fontSize: '0.7rem', color: '#556' }}>{idx.sub}</div>
                </div>
                <span style={{ background: pos ? '#00d4aa22' : '#ff6b6b22', color: pos ? '#00d4aa' : '#ff6b6b', fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.5rem', borderRadius: 6 }}>
                  {d ? fmtChange(d.change) : '—'}
                </span>
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: pos ? '#00d4aa' : '#ff6b6b' }}>
                ${d ? fmtPrice(d.price) : '—'}
              </div>
              <MiniBar values={history[idx.symbol] || []} positive={pos} />
            </div>
          )
        })}
      </div>

      {/* MIDDLE ROW */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
        {/* FEAR & GREED */}
        <div style={{ background: '#0d1a30', border: '1px solid #1a2a42', borderRadius: 14, padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#445', letterSpacing: '0.08em', marginBottom: '1rem' }}>ÍNDICE DE SENTIMIENTO</div>
          <FearGreedGauge value={fearGreed} />
          <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1rem' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.65rem', color: '#556' }}>Ayer</div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>{Math.max(5, fearGreed - Math.round(Math.random() * 8 + 2))}</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.65rem', color: '#556' }}>Semana</div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>{Math.max(5, fearGreed - Math.round(Math.random() * 15 + 5))}</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.65rem', color: '#556' }}>Mes</div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>{Math.max(5, fearGreed + Math.round(Math.random() * 10 - 5))}</div>
            </div>
          </div>
        </div>

        {/* TOP GAINERS */}
        <div style={{ background: '#0d1a30', border: '1px solid #1a2a42', borderRadius: 14, padding: '1.2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <span style={{ color: '#00d4aa' }}>↑</span>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#aab' }}>Top Gainers</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: '#445', fontWeight: 700, marginBottom: '0.5rem', letterSpacing: '0.05em' }}>
            <span>SÍMBOLO</span><span>PRECIO</span><span>CAMBIO</span>
          </div>
          {gainers.map(a => (
            <div key={a.symbol} onClick={() => setPage('market')} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid #0f1e33', cursor: 'pointer' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{a.symbol}</div>
                <div style={{ fontSize: '0.7rem', color: '#556' }}>{a.name.split(' ')[0]}</div>
              </div>
              <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>${fmtPrice(a.price)}</div>
              <span style={{ background: '#00d4aa22', color: '#00d4aa', padding: '0.15rem 0.5rem', borderRadius: 6, fontSize: '0.78rem', fontWeight: 700 }}>
                +{a.change.toFixed(2)}%
              </span>
            </div>
          ))}
        </div>

        {/* TOP LOSERS */}
        <div style={{ background: '#0d1a30', border: '1px solid #1a2a42', borderRadius: 14, padding: '1.2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <span style={{ color: '#ff6b6b' }}>↓</span>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#aab' }}>Top Losers</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: '#445', fontWeight: 700, marginBottom: '0.5rem', letterSpacing: '0.05em' }}>
            <span>SÍMBOLO</span><span>PRECIO</span><span>CAMBIO</span>
          </div>
          {losers.map(a => (
            <div key={a.symbol} onClick={() => setPage('market')} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid #0f1e33', cursor: 'pointer' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{a.symbol}</div>
                <div style={{ fontSize: '0.7rem', color: '#556' }}>{a.name.split(' ')[0]}</div>
              </div>
              <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>${fmtPrice(a.price)}</div>
              <span style={{ background: '#ff6b6b22', color: '#ff6b6b', padding: '0.15rem 0.5rem', borderRadius: 6, fontSize: '0.78rem', fontWeight: 700 }}>
                {a.change.toFixed(2)}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* BOTTOM ROW */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        {/* SECTOR PERFORMANCE */}
        <div style={{ background: '#0d1a30', border: '1px solid #1a2a42', borderRadius: 14, padding: '1.5rem' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#445', letterSpacing: '0.08em', marginBottom: '1.2rem' }}>RENDIMIENTO POR SECTOR</div>
          {sectorPerf.map(sec => (
            <div key={sec.name} style={{ marginBottom: '0.9rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                <span style={{ fontSize: '0.82rem', color: '#aab' }}>{sec.name}</span>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: sec.avg >= 0 ? '#00d4aa' : '#ff6b6b' }}>
                  {sec.avg >= 0 ? '+' : ''}{sec.avg.toFixed(2)}%
                </span>
              </div>
              <div style={{ background: '#0a1628', borderRadius: 4, height: 6, overflow: 'hidden' }}>
                <div style={{
                  height: '100%', borderRadius: 4, transition: 'width .5s',
                  width: `${(Math.abs(sec.avg) / maxSector) * 100}%`,
                  background: sec.avg >= 0 ? `linear-gradient(90deg, ${sec.color}88, ${sec.color})` : '#ff6b6b'
                }} />
              </div>
            </div>
          ))}
        </div>

        {/* MI CUENTA */}
        <div style={{ background: '#0d1a30', border: '1px solid #1a2a42', borderRadius: 14, padding: '1.5rem' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#445', letterSpacing: '0.08em', marginBottom: '1.2rem' }}>MI CUENTA</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.2rem' }}>
            {[
              { label: 'Balance disponible', value: `$${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, color: '#00d4aa' },
              { label: 'P&L no realizado', value: `${pnl >= 0 ? '+' : ''}$${pnl.toFixed(2)}`, color: pnl >= 0 ? '#00d4aa' : '#ff6b6b' },
              { label: 'Posiciones abiertas', value: positions.length, color: '#fff' },
              { label: 'Activos disponibles', value: ALL_ASSETS.length, color: '#aab' },
            ].map(item => (
              <div key={item.label} style={{ background: '#06101e', borderRadius: 10, padding: '0.9rem' }}>
                <div style={{ fontSize: '0.7rem', color: '#556', marginBottom: '0.3rem' }}>{item.label}</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: item.color }}>{item.value}</div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '0.7rem' }}>
            <button onClick={() => setPage('market')}
              style={{ flex: 1, background: 'linear-gradient(135deg,#00d4aa,#0066ff)', border: 'none', color: '#000', padding: '0.7rem', borderRadius: 9, cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem' }}>
              📈 Operar
            </button>
            <button onClick={() => setPage('deposits')}
              style={{ flex: 1, background: '#1a2a42', border: 'none', color: '#aab', padding: '0.7rem', borderRadius: 9, cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}>
              💰 Depositar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
