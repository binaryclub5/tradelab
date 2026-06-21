import { ALL_ASSETS, SECTORS } from '../../../lib/prices'
import { T, card } from '../../../lib/theme'

export default function PageMarketPulse({ ctx }) {
  const { prices } = ctx
  const withP = ALL_ASSETS.filter(a => prices[a.symbol]?.price).map(a => ({ ...a, ...prices[a.symbol] }))
  const up = withP.filter(a => a.change > 0).length
  const down = withP.filter(a => a.change < 0).length
  const flat = withP.length - up - down
  const total = withP.length || 1
  const sentiment = Math.round((up / total) * 100)

  const sectorFlow = SECTORS.map(s => {
    const ch = withP.filter(a => a.sector === s).map(a => a.change || 0)
    return { name: s, avg: ch.length ? ch.reduce((a, b) => a + b, 0) / ch.length : 0, count: ch.length }
  }).sort((a, b) => b.avg - a.avg)

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
      {/* BREADTH */}
      <div style={card}>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: T.textFaint, letterSpacing: '0.08em', marginBottom: '1.2rem' }}>AMPLITUD DEL MERCADO</div>
        <div style={{ display: 'flex', height: 30, borderRadius: 8, overflow: 'hidden', marginBottom: '1rem' }}>
          <div style={{ width: `${(up / total) * 100}%`, background: T.green, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.78rem', fontWeight: 700, color: '#000' }}>{up}</div>
          <div style={{ width: `${(flat / total) * 100}%`, background: T.textFaint }} />
          <div style={{ width: `${(down / total) * 100}%`, background: T.red, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.78rem', fontWeight: 700, color: '#fff' }}>{down}</div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
          <div><div style={{ color: T.green, fontWeight: 800, fontSize: '1.4rem' }}>{up}</div><div style={{ fontSize: '0.75rem', color: T.textMute }}>Subiendo</div></div>
          <div><div style={{ color: T.textMute, fontWeight: 800, fontSize: '1.4rem' }}>{flat}</div><div style={{ fontSize: '0.75rem', color: T.textMute }}>Sin cambio</div></div>
          <div><div style={{ color: T.red, fontWeight: 800, fontSize: '1.4rem' }}>{down}</div><div style={{ fontSize: '0.75rem', color: T.textMute }}>Bajando</div></div>
        </div>
      </div>

      {/* SENTIMENT */}
      <div style={card}>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: T.textFaint, letterSpacing: '0.08em', marginBottom: '1.2rem' }}>SENTIMIENTO</div>
        <div style={{ textAlign: 'center', padding: '1rem 0' }}>
          <div style={{ fontSize: '3rem', fontWeight: 800, color: sentiment > 55 ? T.green : sentiment < 45 ? T.red : T.amber }}>{sentiment}%</div>
          <div style={{ fontSize: '0.9rem', color: T.textMute }}>{sentiment > 55 ? '🟢 Alcista' : sentiment < 45 ? '🔴 Bajista' : '🟡 Neutral'}</div>
        </div>
      </div>

      {/* SECTOR FLOW */}
      <div style={{ ...card, gridColumn: 'span 2' }}>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: T.textFaint, letterSpacing: '0.08em', marginBottom: '1.2rem' }}>FLUJO POR SECTOR</div>
        {sectorFlow.map(s => {
          const max = Math.max(...sectorFlow.map(x => Math.abs(x.avg)), 0.5)
          return (
            <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.7rem' }}>
              <div style={{ width: 130, fontSize: '0.82rem', color: '#aab' }}>{s.name}</div>
              <div style={{ flex: 1, height: 8, background: T.input, borderRadius: 4, position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', left: '50%', width: `${(Math.abs(s.avg) / max) * 50}%`, height: '100%', background: s.avg >= 0 ? T.green : T.red, transform: s.avg >= 0 ? 'none' : 'translateX(-100%)', borderRadius: 4 }} />
              </div>
              <div style={{ width: 60, textAlign: 'right', fontSize: '0.82rem', fontWeight: 700, color: s.avg >= 0 ? T.green : T.red }}>{s.avg >= 0 ? '+' : ''}{s.avg.toFixed(2)}%</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
