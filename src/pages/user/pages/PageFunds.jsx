import { fmtPrice } from '../../../lib/prices'
import { T, card, btn } from '../../../lib/theme'

export default function PageFunds({ ctx }) {
  const { balance, positions, prices, pnl, setPage } = ctx
  const invested = positions.reduce((a, p) => a + p.total_cost, 0)
  const equity = balance + invested + pnl

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <div style={{ ...card, marginBottom: '1.5rem' }}>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: T.textFaint, letterSpacing: '0.08em', marginBottom: '1.2rem' }}>RESUMEN DE CUENTA</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '1rem' }}>
          {[
            { l: 'Balance disponible', v: balance, c: T.green },
            { l: 'Capital invertido', v: invested, c: T.blue },
            { l: 'P&L flotante', v: pnl, c: pnl >= 0 ? T.green : T.red, sign: true },
            { l: 'Equity total', v: equity, c: '#fff' },
          ].map(s => (
            <div key={s.l} style={{ background: T.input, borderRadius: 10, padding: '1.1rem' }}>
              <div style={{ fontSize: '0.74rem', color: T.textMute, marginBottom: '0.4rem' }}>{s.l}</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: s.c }}>{s.sign && s.v >= 0 ? '+' : ''}${fmtPrice(s.v)}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ ...card }}>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: T.textFaint, letterSpacing: '0.08em', marginBottom: '1rem' }}>MARGEN</div>
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
            <span style={{ fontSize: '0.85rem', color: '#aab' }}>Margen utilizado</span>
            <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>{equity > 0 ? ((invested / equity) * 100).toFixed(1) : 0}%</span>
          </div>
          <div style={{ background: T.input, borderRadius: 4, height: 8, overflow: 'hidden' }}>
            <div style={{ width: `${equity > 0 ? Math.min(100, (invested / equity) * 100) : 0}%`, height: '100%', background: `linear-gradient(90deg,${T.green},${T.amber})` }} />
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.8rem', marginTop: '1.5rem' }}>
          <button onClick={() => setPage('deposits')} style={{ ...btn('primary'), flex: 1 }}>💰 Depositar fondos</button>
          <button onClick={() => setPage('stocks')} style={{ ...btn('ghost'), flex: 1 }}>📈 Ir a operar</button>
        </div>
      </div>
    </div>
  )
}
