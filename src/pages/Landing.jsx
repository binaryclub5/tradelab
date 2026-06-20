import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Landing() {
  const { signIn, signUp } = useAuth()
  const navigate = useNavigate()
  const [mode, setMode] = useState(null)
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  async function submit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (mode === 'login') {
        const { data, error } = await signIn(form.email, form.password)
        if (error) {
          if (error.message?.includes('Email not confirmed')) setError('Debes confirmar tu email primero. Revisa tu bandeja de entrada.')
          else if (error.message?.includes('Invalid login') || error.message?.includes('invalid_credentials')) setError('Email o contraseña incorrectos.')
          else setError(error.message || 'Error al iniciar sesión.')
        } else {
          navigate('/dashboard')
        }
      } else {
        const { data, error } = await signUp(form.email, form.password, form.name)
        if (error) {
          if (error.message?.includes('already registered') || error.message?.includes('already been registered')) setError('Este email ya está registrado. Inicia sesión.')
          else setError(error.message || 'Error al crear la cuenta.')
        } else if (data?.session) {
          navigate('/dashboard')
        } else {
          // Email confirmation required
          setEmailSent(true)
        }
      }
    } catch (err) {
      setError('Error inesperado. Intenta de nuevo.')
    }
    setLoading(false)
  }

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: '#0a0f1e', minHeight: '100vh', color: '#fff' }}>
      {/* NAV */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.2rem 2.5rem', borderBottom: '1px solid #1e2d4a' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg,#00d4aa,#0066ff)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 18 }}>T</div>
          <span style={{ fontWeight: 700, fontSize: '1.3rem', letterSpacing: '-0.5px' }}>Trade<span style={{ color: '#00d4aa' }}>Lab</span></span>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={() => { setMode('login'); setEmailSent(false); setError('') }} style={{ background: 'transparent', border: '1px solid #1e2d4a', color: '#aab', padding: '0.5rem 1.2rem', borderRadius: 8, cursor: 'pointer', fontSize: '0.9rem' }}>Iniciar sesión</button>
          <button onClick={() => { setMode('register'); setEmailSent(false); setError('') }} style={{ background: 'linear-gradient(135deg,#00d4aa,#0066ff)', border: 'none', color: '#fff', padding: '0.5rem 1.4rem', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem' }}>Comenzar gratis</button>
        </div>
      </nav>

      {/* HERO */}
      <div style={{ textAlign: 'center', padding: '5rem 2rem 3rem' }}>
        <div style={{ display: 'inline-block', background: '#0d2040', border: '1px solid #1a3a6a', borderRadius: 20, padding: '0.4rem 1rem', fontSize: '0.8rem', color: '#00d4aa', marginBottom: '1.5rem' }}>
          🚀 Plataforma de simulación bursátil para LatAm
        </div>
        <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 3.8rem)', fontWeight: 800, lineHeight: 1.1, margin: '0 0 1.5rem', letterSpacing: '-1px' }}>
          Aprende a invertir<br />
          <span style={{ background: 'linear-gradient(90deg,#00d4aa,#0066ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>sin arriesgar dinero real</span>
        </h1>
        <p style={{ fontSize: '1.15rem', color: '#8899bb', maxWidth: 560, margin: '0 auto 2.5rem', lineHeight: 1.7 }}>
          Opera acciones, crypto, forex y materias primas en tiempo real con dinero virtual. La misma experiencia del mercado real, sin el riesgo.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => { setMode('register'); setEmailSent(false); setError('') }} style={{ background: 'linear-gradient(135deg,#00d4aa,#0066ff)', border: 'none', color: '#fff', padding: '0.9rem 2.5rem', borderRadius: 10, cursor: 'pointer', fontWeight: 700, fontSize: '1.05rem' }}>
            Crear cuenta gratis →
          </button>
          <button onClick={() => { setMode('login'); setEmailSent(false); setError('') }} style={{ background: '#0d2040', border: '1px solid #1a3a6a', color: '#ccd', padding: '0.9rem 2rem', borderRadius: 10, cursor: 'pointer', fontSize: '1.05rem' }}>
            Ya tengo cuenta
          </button>
        </div>
      </div>

      {/* STATS */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '3rem', padding: '2rem', flexWrap: 'wrap', borderTop: '1px solid #1e2d4a', borderBottom: '1px solid #1e2d4a', margin: '2rem 0' }}>
        {[['$10,000', 'Capital virtual de inicio'], ['22+', 'Activos disponibles'], ['15 seg', 'Actualización de precios'], ['100%', 'Sin riesgo real']].map(([v, l]) => (
          <div key={l} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#00d4aa' }}>{v}</div>
            <div style={{ color: '#667', fontSize: '0.85rem', marginTop: '0.3rem' }}>{l}</div>
          </div>
        ))}
      </div>

      {/* FEATURES */}
      <div style={{ maxWidth: 1100, margin: '3rem auto', padding: '0 2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
        {[
          ['📈', 'Acciones NYSE/NASDAQ', 'Opera Apple, Tesla, NVIDIA, Amazon y más en tiempo real.'],
          ['₿', 'Criptomonedas', 'Bitcoin, Ethereum, Solana, XRP y más del mercado crypto.'],
          ['💱', 'Forex LatAm', 'EUR/USD, GBP/USD, USD/MXN, USD/COP y pares principales.'],
          ['🥇', 'Materias primas', 'Oro y petróleo WTI con precios en vivo.'],
          ['📊', 'Panel de control', 'Visualiza tu portafolio, P&L y rendimiento histórico.'],
          ['💰', 'Gestión de fondos', 'Solicita depósitos y retiros gestionados por el admin.'],
        ].map(([icon, title, desc]) => (
          <div key={title} style={{ background: '#0d1a30', border: '1px solid #1e2d4a', borderRadius: 14, padding: '1.5rem' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.8rem' }}>{icon}</div>
            <div style={{ fontWeight: 700, marginBottom: '0.5rem', fontSize: '1.05rem' }}>{title}</div>
            <div style={{ color: '#667', fontSize: '0.9rem', lineHeight: 1.6 }}>{desc}</div>
          </div>
        ))}
      </div>

      {/* CTA FINAL */}
      <div style={{ textAlign: 'center', padding: '4rem 2rem', background: '#060d1a' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '1rem' }}>Listo para comenzar</h2>
        <p style={{ color: '#667', marginBottom: '2rem' }}>Crea tu cuenta gratis y empieza a operar hoy mismo.</p>
        <button onClick={() => { setMode('register'); setEmailSent(false); setError('') }} style={{ background: 'linear-gradient(135deg,#00d4aa,#0066ff)', border: 'none', color: '#fff', padding: '1rem 3rem', borderRadius: 10, cursor: 'pointer', fontWeight: 700, fontSize: '1.1rem' }}>
          Crear cuenta gratis
        </button>
      </div>

      {/* MODAL AUTH */}
      {mode && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ background: '#0d1a30', border: '1px solid #1e2d4a', borderRadius: 16, padding: '2.5rem', width: '100%', maxWidth: 420 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.4rem' }}>
                {emailSent ? '✉️ Revisa tu email' : mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
              </h2>
              <button onClick={() => { setMode(null); setEmailSent(false); setError('') }} style={{ background: 'none', border: 'none', color: '#aab', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
            </div>

            {emailSent ? (
              <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                <p style={{ color: '#889', lineHeight: 1.8, marginBottom: '1.5rem' }}>
                  Enviamos un link de confirmación a<br />
                  <strong style={{ color: '#fff' }}>{form.email}</strong><br /><br />
                  Revisa tu bandeja de entrada (y la carpeta spam) y haz clic en el link para activar tu cuenta.
                </p>
                <button onClick={() => { setEmailSent(false); setMode('login') }}
                  style={{ width: '100%', background: 'linear-gradient(135deg,#00d4aa,#0066ff)', border: 'none', color: '#fff', padding: '0.9rem', borderRadius: 10, cursor: 'pointer', fontWeight: 700, fontSize: '1rem' }}>
                  Ya confirmé → Iniciar sesión
                </button>
              </div>
            ) : (
              <form onSubmit={submit}>
                {mode === 'register' && (
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', color: '#889' }}>Nombre completo</label>
                    <input name="name" value={form.name} onChange={handle} required placeholder="Juan Pérez"
                      style={{ width: '100%', background: '#06101e', border: '1px solid #1e2d4a', borderRadius: 8, padding: '0.75rem', color: '#fff', fontSize: '0.95rem', boxSizing: 'border-box' }} />
                  </div>
                )}
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', color: '#889' }}>Email</label>
                  <input name="email" type="email" value={form.email} onChange={handle} required placeholder="correo@ejemplo.com"
                    style={{ width: '100%', background: '#06101e', border: '1px solid #1e2d4a', borderRadius: 8, padding: '0.75rem', color: '#fff', fontSize: '0.95rem', boxSizing: 'border-box' }} />
                </div>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', color: '#889' }}>Contraseña</label>
                  <input name="password" type="password" value={form.password} onChange={handle} required placeholder="Mínimo 6 caracteres" minLength={6}
                    style={{ width: '100%', background: '#06101e', border: '1px solid #1e2d4a', borderRadius: 8, padding: '0.75rem', color: '#fff', fontSize: '0.95rem', boxSizing: 'border-box' }} />
                </div>
                {error && (
                  <div style={{ background: '#2d0a0a', border: '1px solid #5a1a1a', borderRadius: 8, padding: '0.75rem', color: '#ff6b6b', fontSize: '0.85rem', marginBottom: '1rem', lineHeight: 1.5 }}>
                    ⚠️ {error}
                  </div>
                )}
                <button type="submit" disabled={loading}
                  style={{ width: '100%', background: 'linear-gradient(135deg,#00d4aa,#0066ff)', border: 'none', color: '#fff', padding: '0.9rem', borderRadius: 10, cursor: 'pointer', fontWeight: 700, fontSize: '1rem', opacity: loading ? 0.7 : 1 }}>
                  {loading ? 'Procesando...' : mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
                </button>
                <div style={{ textAlign: 'center', marginTop: '1.2rem', color: '#667', fontSize: '0.85rem' }}>
                  {mode === 'login' ? '¿No tienes cuenta? ' : '¿Ya tienes cuenta? '}
                  <button type="button" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError('') }}
                    style={{ background: 'none', border: 'none', color: '#00d4aa', cursor: 'pointer', fontSize: '0.85rem' }}>
                    {mode === 'login' ? 'Regístrate' : 'Inicia sesión'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
