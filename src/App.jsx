import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Landing from './pages/Landing'
import UserDashboard from './pages/user/UserDashboard'
import AdminDashboard from './pages/admin/AdminDashboard'

function ProtectedRoute({ children, adminOnly = false }) {
  const { user, profile, loading } = useAuth()
  if (loading) return (
    <div style={{ background: '#080e1c', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00d4aa', fontFamily: 'Inter, sans-serif', fontSize: '1.1rem' }}>
      Cargando TradeLab...
    </div>
  )
  if (!user) return <Navigate to="/" />
  if (adminOnly && profile?.role !== 'admin') return <Navigate to="/dashboard" />
  return children
}

function AppRoutes() {
  const { user, profile, loading } = useAuth()
  return (
    <Routes>
      <Route path="/" element={
        loading ? <div style={{ background: '#080e1c', minHeight: '100vh' }} /> :
        user ? <Navigate to={profile?.role === 'admin' ? '/admin' : '/dashboard'} /> : <Landing />
      } />
      <Route path="/dashboard" element={
        <ProtectedRoute><UserDashboard /></ProtectedRoute>
      } />
      <Route path="/admin" element={
        <ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>
      } />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
