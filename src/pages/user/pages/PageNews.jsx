import { useState, useEffect } from 'react'
import { T, card, pill } from '../../../lib/theme'
import { Loading } from '../../../components/Shared'

const STATIC_NEWS = [
  { cat: 'Mercado', title: 'Wall Street abre mixto mientras inversionistas evalúan datos de inflación', time: 'Hace 1h', src: 'MarketWatch' },
  { cat: 'Tecnología', title: 'Acciones tecnológicas lideran avances con NVIDIA en máximos', time: 'Hace 2h', src: 'Reuters' },
  { cat: 'Crypto', title: 'Bitcoin se consolida mientras el mercado espera decisión de la Fed', time: 'Hace 3h', src: 'CoinDesk' },
  { cat: 'Economía', title: 'La Reserva Federal mantiene tasas estables en su última reunión', time: 'Hace 4h', src: 'Bloomberg' },
  { cat: 'Finanzas', title: 'Bancos reportan ganancias por encima de lo esperado en el trimestre', time: 'Hace 5h', src: 'CNBC' },
  { cat: 'Energía', title: 'Petróleo sube ante tensiones geopolíticas en Medio Oriente', time: 'Hace 6h', src: 'Reuters' },
  { cat: 'Tecnología', title: 'Apple anuncia nuevas funciones de IA para su próxima generación', time: 'Hace 7h', src: 'TechCrunch' },
  { cat: 'Mercado', title: 'El S&P 500 cierra cerca de récord histórico impulsado por el sector tech', time: 'Hace 8h', src: 'WSJ' },
]

export default function PageNews({ ctx }) {
  const [cat, setCat] = useState('Todas')
  const cats = ['Todas', 'Mercado', 'Tecnología', 'Finanzas', 'Crypto', 'Economía', 'Energía']
  const filtered = STATIC_NEWS.filter(n => cat === 'Todas' || n.cat === cat)
  const catColor = { Mercado: T.blue, Tecnología: T.purple, Finanzas: T.green, Crypto: T.amber, Economía: T.cyan, Energía: '#eab308' }

  return (
    <div>
      <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1.2rem', flexWrap: 'wrap' }}>
        {cats.map(c => <button key={c} onClick={() => setCat(c)} style={pill(T.blue, cat === c)}>{c}</button>)}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
        {filtered.map((n, i) => (
          <div key={i} style={{ ...card, padding: '1.1rem 1.3rem', cursor: 'pointer', transition: 'border .15s' }}
            onMouseEnter={e => e.currentTarget.style.borderColor = T.green + '44'}
            onMouseLeave={e => e.currentTarget.style.borderColor = T.border}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
              <div style={{ flex: 1 }}>
                <span style={{ background: `${catColor[n.cat]}22`, color: catColor[n.cat], padding: '0.15rem 0.6rem', borderRadius: 6, fontSize: '0.7rem', fontWeight: 700 }}>{n.cat}</span>
                <div style={{ fontWeight: 600, fontSize: '0.95rem', marginTop: '0.6rem', lineHeight: 1.4 }}>{n.title}</div>
                <div style={{ fontSize: '0.76rem', color: T.textFaint, marginTop: '0.5rem' }}>{n.src} · {n.time}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ textAlign: 'center', color: T.textFaint, fontSize: '0.78rem', marginTop: '1.5rem' }}>
        Noticias de muestra · En producción se conecta a un feed de noticias en vivo
      </div>
    </div>
  )
}
