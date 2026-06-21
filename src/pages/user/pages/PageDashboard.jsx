import { useState, useEffect } from 'react'
import { INDICES, ALL_ASSETS, SECTORS, fmtPrice, fetchTradingViewPrices } from '../../../lib/prices'
import { T, card } from '../../../lib/theme'
import { MiniBars, ChangeBadge } from '../../../components/Shared'

function Gauge({ value }) {
  const color = value < 25 ? '#ff4444' : value < 45 ? '#ff8800' : value < 55 ? '#f5c518' : value < 75 ? '#88cc00' : T.green
  const label = value < 25 ? 'MIEDO EXTREMO' : value < 45 ? 'MIEDO' : value < 55 ? 'NEUTRAL' : value < 75 ? 'CODICIA' : 'CODICIA EXTREMA'
  const angle = -180 + (value / 100) * 180
  const r = 72, cx = 100, cy = 92
  const toRad = d => (d * Math.PI) / 180
  const arc = (start, end) => {
    const s = { x: cx + r * Math.cos(toRad(start)), y: cy + r * Math.sin(toRad(start)) }
    const e = { x: cx + r * Math.cos(toRad(end)), y: cy + r * Math.sin(toRad(end)) }
    return `M ${s.x} ${s.y} A ${r} ${r} 0 0 1 ${e.x} ${e.y}`
  }
  const nx = cx + r * 0.82 * Math.cos(toRad(angle))
  const ny = cy + r * 0.82 * Math.sin(toRad(angle))
  return (
    <div style={{ textAlign: 'center' }}>
      <svg width="200" height="120" viewBox="0 0 200 120">
        <path d={arc(-180, -135)} stroke="#ff4444" strokeWidth="10" fill="none" strokeLinecap="round" />
        <path d={arc(-133, -92)} stroke="#ff8800" strokeWidth="10" fill="none" strokeLinecap="round" />
        <path d={arc(-90, -50)} stroke="#f5c518" strokeWidth="10" fill="none" strokeLinecap="round" />
        <path d={arc(-48, 0)} stroke={T.green} strokeWidth="10" fill="none" strokeLinecap="round" />
        <line x1={cx} y1={cy} x2={nx} y2={ny} stroke={color} strokeWidth="3.5" strokeLinecap="round" />
        <circle cx={cx} cy={cy} r="6" fill={color} />
      </svg>
      <div style={{ fontSize: '2.2rem', fontWeight: 800, color, marginTop: '-0.5rem' }}>{value}</div>
      <div style={{ fontSize: '0.9rem', fontWeight: 700, color, letterSpacing: '0.05em' }}>{label}</div>
    </div>
  )
}

export default function PageDashboard({ ctx }) {
  const { prices, setPage } = ctx
  const [indices, setIndices] = useState({})
  const [hist, setHist] = useState({})
  const [fg, setFg] = useState(50)

  useEffect(() => {
    loadIndices()
    const i = setInterval(loadIndices, 20000)
    return () => clearInterval(i)
  }, [])

  async function loadIndices() {
    try {
      const data = await fetchTradingViewPrices(INDICES.map(i => i.symbol))
      setIndices(data)
      const h = {}
      Object.entries(data).forEach(([sym, d]) => {
        h[sym] = Array.from({ length: 22 }, (_, k) => d.price * (1 + (Math.random() - 0.5) * 0.015 * (1 - k / 30)))
      })
      setHist(h)
      const avg = Object.values(data).reduce((a, b) => a + (b.change || 0), 0) / (Object.values(data).length || 1)
      setFg(Math.max(8, Math.min(92, Math.round(50 + avg * 9))))
    } catch (e) { console.error(e) }
  }

  const withP = ALL_ASSETS.filter(a => prices[a.symbol]?.price).map(a => ({ ...a, ...prices[a.symbol] }))
  const gainers = [...withP].sort((a, b) => (b.change || 0) - (a.change || 0)).slice(0, 6)
  const losers = [...withP].sort((a, b) => (a.change || 0) - (b.change || 0)).slice(0, 6)
  const sectorPerf = SECTORS.map(s => {
    const ch = withP.filter(a => a.sector === s).map(a => a.change || 0)
    return { name: s, avg: ch.length ? ch.reduce((a, b) => a + b, 0) / ch.length : 0 }
  }).sort((a, b) => b.avg - a.avg)
  const maxSec = Math.max(...sectorPerf.map(s => Math.abs(s.avg)), 0.5)

  return (
    <div>
      {/* TICKER STRIP */}
      <div style={{ background: T.panel2, border: `1px solid ${T.border}`, borderRadius: 10, padding: '0.6rem 1rem', marginBottom: '1.3rem', overflow: 'hidden', whiteSpace: 'nowrap' }}>
        <div style={{ display: 'inline-flex', gap: '2rem', animation: 'scroll 40s linear infinite' }}>
          {[...withP, ...withP].slice(0, 30).map((a, i) => (
            <span key={i} style={{ fontSize: '0.8rem', display: 'inline-flex', gap: 6, alignItems: 'center' }}>
              <strong style={{ color: '#aab' }}>{a.symbol}</strong>
              <span>${fmtPrice(a.price)}</span>
              <span style={{ color: (a.change || 0) >= 0 ? T.green : T.red }}>{(a.change || 0) >= 0 ? '▲' : '▼'} {Math.abs(a.change || 0).toFixed(2)}%</span>
            </span>
          ))}
        </div>
        <style>{`@keyframes scroll { from { transform: translateX(0); } to { transform: translateX(-50%); } }`}</style>
      </div>

      {/* INDICES */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>Resumen de Mercado</h2>
        <span style={{ background: `${T.green}18`, color: T.green, fontSize: '0.68rem', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: 5 }}>● LIVE</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        {INDICES.map(idx => {
          const d = indices[idx.symbol]
          const pos = (d?.change ?? 0) >= 0
          return (
            <div key={idx.symbol} style={{ ...card, border: `1px solid ${pos ? T.green + '33' : T.red + '33'}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                <div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#aab' }}>{idx.name}</div>
                  <div style={{ fontSize: '0.68rem', color: T.textFaint }}>{idx.sub}</div>
                </div>
                {d && <ChangeBadge value={d.change} />}
              </div>
              <div style={{ fontSize: '1.7rem', fontWeight: 800, color: pos ? T.green : T.red, marginBottom: 8 }}>
                {d ? fmtPrice(d.price) : '—'}
              </div>
              <MiniBars values={hist[idx.symbol] ? hist[idx.symbol].map((v, k, arr) => k === 0 ? 0 : v - arr[k - 1]) : []} height={38} />
            </div>
          )
        })}
      </div>

      {/* FEAR GREED + GAINERS + LOSERS */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ ...card, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: T.textFaint, letterSpacing: '0.08em', marginBottom: '0.5rem' }}>ÍNDICE DE MIEDO Y CODICIA</div>
          <Gauge value={fg} />
          <div style={{ fontSize: '0.78rem', color: T.textMute, marginTop: '0.8rem', textAlign: 'center' }}>El mercado está {fg < 45 ? 'cauteloso' : fg > 55 ? 'optimista' : 'indeciso'}</div>
        </div>

        <div style={card}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: '0.9rem' }}>
            <span style={{ color: T.green }}>↑</span><span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#aab' }}>Top Ganadoras</span>
          </div>
          {gainers.length === 0 && <div style={{ color: T.textFaint, fontSize: '0.8rem', textAlign: 'center', padding: '2rem 0' }}>Cargando precios...</div>}
          {gainers.map(a => (
            <div key={a.symbol} onClick={() => setPage('stocks')} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.45rem 0', borderBottom: `1px solid #0f1e33`, cursor: 'pointer' }}>
              <div><div style={{ fontWeight: 700, fontSize: '0.84rem' }}>{a.symbol}</div></div>
              <div style={{ fontSize: '0.84rem' }}>${fmtPrice(a.price)}</div>
              <ChangeBadge value={a.change} />
            </div>
          ))}
        </div>

        <div style={card}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: '0.9rem' }}>
            <span style={{ color: T.red }}>↓</span><span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#aab' }}>Top Perdedoras</span>
          </div>
          {losers.length === 0 && <div style={{ color: T.textFaint, fontSize: '0.8rem', textAlign: 'center', padding: '2rem 0' }}>Cargando precios...</div>}
          {losers.map(a => (
            <div key={a.symbol} onClick={() => setPage('stocks')} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.45rem 0', borderBottom: `1px solid #0f1e33`, cursor: 'pointer' }}>
              <div><div style={{ fontWeight: 700, fontSize: '0.84rem' }}>{a.symbol}</div></div>
              <div style={{ fontSize: '0.84rem' }}>${fmtPrice(a.price)}</div>
              <ChangeBadge value={a.change} />
            </div>
          ))}
        </div>
      </div>

      {/* SECTOR PERFORMANCE */}
      <div style={card}>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: T.textFaint, letterSpacing: '0.08em', marginBottom: '1.2rem' }}>RENDIMIENTO POR SECTOR</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '0.8rem 2rem' }}>
          {sectorPerf.map(sec => (
            <div key={sec.name}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                <span style={{ fontSize: '0.82rem', color: '#aab' }}>{sec.name}</span>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: sec.avg >= 0 ? T.green : T.red }}>{sec.avg >= 0 ? '+' : ''}{sec.avg.toFixed(2)}%</span>
              </div>
              <div style={{ background: T.panel2, borderRadius: 4, height: 6, overflow: 'hidden' }}>
                <div style={{ height: '100%', borderRadius: 4, width: `${(Math.abs(sec.avg) / maxSec) * 100}%`, background: sec.avg >= 0 ? T.green : T.red, transition: 'width .5s' }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
