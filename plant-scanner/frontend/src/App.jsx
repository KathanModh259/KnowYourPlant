import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import LandingPage from './pages/LandingPage'
import AuthPage from './pages/AuthPage'
import ScanPage from './pages/ScanPage'
import DashboardPage from './pages/DashboardPage'
import './landing.css'
import './dashboard.css'
import './scanner.css'
import './auth.css'

function PrivateRoute({ children }) {
    const { user, loading } = useAuth()
    if (loading) return (
        <div className="loading-screen">
            <div className="loading-spinner" />
            <p>Loading…</p>
        </div>
    )
    return user ? children : <Navigate to="/auth" replace />
}

function AppRoutes() {
    const { user, loading } = useAuth()
    if (loading) return (
        <div className="loading-screen">
            <div className="loading-spinner" />
            <p>Loading…</p>
        </div>
    )
    return (
        <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth" element={user ? <Navigate to="/dashboard" replace /> : <AuthPage />} />
            <Route path="/scan" element={<PrivateRoute><ScanPage /></PrivateRoute>} />
            <Route path="/dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
            <Route path="*" element={<Navigate to="/" replace />} />
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
