import { useState } from 'react'
import { T, card } from '../../../lib/theme'
import { Tabs } from '../../../components/Shared'

export default function PageCalculator({ ctx }) {
  const [tab, setTab] = useState('Interés Compuesto')
  const [monthly, setMonthly] = useState(500)
  const [years, setYears] = useState(10)
  const [rate, setRate] = useState(12)
  const [lump, setLump] = useState(10000)

  // Compound (SIP)
  const r = rate / 100 / 12
  const n = years * 12
  const fvSip = monthly * ((Math.pow(1 + r, n) - 1) / r) * (1 + r)
  const investedSip = monthly * n
  const gainsSip = fvSip - investedSip

  // Lumpsum
  const fvLump = lump * Math.pow(1 + rate / 100, years)
  const gainsLump = fvLump - lump

  const slider = { width: '100%', accentColor: T.green }
  const fmt = (v) => `$${v.toLocaleString('en-US', { maximumFractionDigits: 0 })}`

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <Tabs tabs={['Interés Compuesto', 'Inversión Única']} active={tab} onChange={setTab} />
      {tab === 'Interés Compuesto' ? (
        <div style={{ ...card }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.5rem' }}><span style={{ color: T.textMute }}>Inversión mensual</span><span style={{ fontWeight: 700, color: T.green }}>${monthly}</span></label>
            <input type="range" min="50" max="5000" step="50" value={monthly} onChange={e => setMonthly(+e.target.value)} style={slider} />
          </div>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.5rem' }}><span style={{ color: T.textMute }}>Duración (años)</span><span style={{ fontWeight: 700 }}>{years} años</span></label>
            <input type="range" min="1" max="40" value={years} onChange={e => setYears(+e.target.value)} style={slider} />
          </div>
          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.5rem' }}><span style={{ color: T.textMute }}>Retorno anual esperado</span><span style={{ fontWeight: 700 }}>{rate}%</span></label>
            <input type="range" min="1" max="30" value={rate} onChange={e => setRate(+e.target.value)} style={slider} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1rem' }}>
            {[{ l: 'Total invertido', v: investedSip, c: '#aab' }, { l: 'Ganancias', v: gainsSip, c: T.green }, { l: 'Valor final', v: fvSip, c: T.blue }].map(s => (
              <div key={s.l} style={{ background: T.input, borderRadius: 10, padding: '1.1rem', textAlign: 'center' }}>
                <div style={{ fontSize: '0.72rem', color: T.textMute, marginBottom: '0.4rem' }}>{s.l}</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: s.c }}>{fmt(s.v)}</div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div style={{ ...card }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.5rem' }}><span style={{ color: T.textMute }}>Inversión inicial</span><span style={{ fontWeight: 700, color: T.green }}>${lump.toLocaleString()}</span></label>
            <input type="range" min="1000" max="100000" step="1000" value={lump} onChange={e => setLump(+e.target.value)} style={slider} />
          </div>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.5rem' }}><span style={{ color: T.textMute }}>Duración (años)</span><span style={{ fontWeight: 700 }}>{years} años</span></label>
            <input type="range" min="1" max="40" value={years} onChange={e => setYears(+e.target.value)} style={slider} />
          </div>
          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.5rem' }}><span style={{ color: T.textMute }}>Retorno anual esperado</span><span style={{ fontWeight: 700 }}>{rate}%</span></label>
            <input type="range" min="1" max="30" value={rate} onChange={e => setRate(+e.target.value)} style={slider} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1rem' }}>
            {[{ l: 'Monto invertido', v: lump, c: '#aab' }, { l: 'Ganancias', v: gainsLump, c: T.green }, { l: 'Valor final', v: fvLump, c: T.blue }].map(s => (
              <div key={s.l} style={{ background: T.input, borderRadius: 10, padding: '1.1rem', textAlign: 'center' }}>
                <div style={{ fontSize: '0.72rem', color: T.textMute, marginBottom: '0.4rem' }}>{s.l}</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: s.c }}>{fmt(s.v)}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
