import { useState } from 'react'
import { supabase } from '../../../lib/supabase'
import { useAuth } from '../../../context/AuthContext'
import { fmtPrice, ALL_ASSETS } from '../../../lib/prices'
import { T, card, btn } from '../../../lib/theme'

export default function PageSettings({ ctx }) {
  const { balance, positions, watchlist } = ctx
  const { profile, user, signOut } = useAuth()
  const [name, setName] = useState(profile?.full_name || '')
  const [saved, setSaved] = useState(false)

  async function save() {
    await supabase.from('profiles').update({ full_name: name }).eq('id', user.id)
    setSaved(true); setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div style={{ maxWidth: 700, margin: '0 auto' }}>
      <div style={{ ...card, marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
        <div style={{ width: 64, height: 64, background: `linear-gradient(135deg,${T.green},${T.blue})`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.8rem' }}>
          {(name || 'T')[0].toUpperCase()}
        </div>
        <div>
          <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>{name || 'Trader'}</div>
          <div style={{ fontSize: '0.85rem', color: T.textMute }}>{user?.email}</div>
          <div style={{ fontSize: '0.78rem', color: T.green, marginTop: '0.3rem' }}>Cuenta de Trading Virtual · Premium</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1rem', marginBottom: '1.2rem' }}>
        {[{ l: 'Balance', v: `$${fmtPrice(balance)}` }, { l: 'Posiciones', v: positions.length }, { l: 'Watchlist', v: watchlist.length }].map(s => (
          <div key={s.l} style={{ ...card, textAlign: 'center' }}><div style={{ fontSize: '0.72rem', color: T.textMute }}>{s.l}</div><div style={{ fontSize: '1.4rem', fontWeight: 800, color: T.green }}>{s.v}</div></div>
        ))}
      </div>

      <div style={{ ...card, marginBottom: '1.2rem' }}>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: T.textFaint, letterSpacing: '0.08em', marginBottom: '1rem' }}>PERFIL</div>
        <label style={{ display: 'block', fontSize: '0.8rem', color: T.textMute, marginBottom: '0.4rem' }}>Nombre para mostrar</label>
        <div style={{ display: 'flex', gap: '0.7rem' }}>
          <input value={name} onChange={e => setName(e.target.value)} style={{ flex: 1, background: T.input, border: `1px solid ${T.border}`, borderRadius: 8, padding: '0.65rem', color: '#fff', fontSize: '0.9rem' }} />
          <button onClick={save} style={btn('primary')}>{saved ? '✓ Guardado' : 'Guardar'}</button>
        </div>
      </div>

      <div style={{ ...card, marginBottom: '1.2rem' }}>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: T.textFaint, letterSpacing: '0.08em', marginBottom: '1rem' }}>ACERCA DE TRADELAB</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', fontSize: '0.85rem' }}><span style={{ color: T.textMute }}>Versión</span><span>2.0.0</span></div>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', fontSize: '0.85rem', borderTop: `1px solid ${T.border}` }}><span style={{ color: T.textMute }}>Fuente de datos</span><span>TradingView</span></div>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', fontSize: '0.85rem', borderTop: `1px solid ${T.border}` }}><span style={{ color: T.textMute }}>Activos disponibles</span><span>{ALL_ASSETS.length}+</span></div>
        <div style={{ fontSize: '0.76rem', color: T.textFaint, marginTop: '1rem', lineHeight: 1.5 }}>⚠️ Solo para simulación. No constituye asesoría de inversión real.</div>
      </div>

      <button onClick={signOut} style={{ ...btn('ghost'), width: '100%', color: T.red }}>Cerrar sesión</button>
    </div>
  )
}
