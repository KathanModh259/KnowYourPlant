import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login, register, getMe } from '../api/client'
import { useAuth } from '../context/AuthContext'

// ─── SVG Icons ────────────────────────────────────────────────────────────────
const Icons = {
    email: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="2" y="4" width="20" height="16" rx="2" /><path d="M22 7l-10 7L2 7" />
        </svg>
    ),
    user: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
        </svg>
    ),
    lock: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0110 0v4" />
        </svg>
    ),
    eyeOpen: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
        </svg>
    ),
    eyeClosed: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
            <line x1="1" y1="1" x2="23" y2="23" />
        </svg>
    ),
    check: (
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
            <polyline points="20 6 9 17 4 12" />
        </svg>
    ),
    arrow: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
    ),
}

export default function AuthPage() {
    const [mode, setMode] = useState('login')
    const [form, setForm] = useState({ username: '', email: '', password: '', confirmPassword: '' })
    const [showPw, setShowPw] = useState(false)
    const [showConfirmPw, setShowConfirmPw] = useState(false)
    const [remember, setRemember] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [fieldErrors, setFieldErrors] = useState({})
    const [loading, setLoading] = useState(false)

    const { setUser } = useAuth()
    const navigate = useNavigate()

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value })
        // Clear field error on change
        if (fieldErrors[e.target.name]) {
            setFieldErrors(prev => ({ ...prev, [e.target.name]: '' }))
        }
    }

    // Client-side validation
    const validate = () => {
        const errs = {}
        if (!form.email) errs.email = 'Email is required'
        else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Enter a valid email'

        if (!form.password) errs.password = 'Password is required'
        else if (form.password.length < 6) errs.password = 'Minimum 6 characters'

        if (mode === 'register') {
            if (!form.username) errs.username = 'Username is required'
            if (!form.confirmPassword) errs.confirmPassword = 'Please confirm your password'
            else if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match'
        }

        setFieldErrors(errs)
        return Object.keys(errs).length === 0
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setSuccess('')

        if (!validate()) return

        setLoading(true)
        try {
            if (mode === 'register') {
                await register({ username: form.username, email: form.email, password: form.password })
                setSuccess('Account created! You can now sign in.')
                setMode('login')
                setForm(prev => ({ ...prev, password: '', confirmPassword: '' }))
                setLoading(false)
                return
            }
            const res = await login(form.email, form.password)
            localStorage.setItem('token', res.data.access_token)
            const me = await getMe()
            setUser(me.data)
            navigate('/dashboard')
        } catch (err) {
            setError(err.response?.data?.detail || 'Something went wrong. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const switchMode = () => {
        setMode(mode === 'login' ? 'register' : 'login')
        setError('')
        setSuccess('')
        setFieldErrors({})
    }

    // Generate particles
    const particles = Array.from({ length: 12 }, (_, i) => ({
        left: `${Math.random() * 100}%`,
        bottom: `-${Math.random() * 20}px`,
        animationDelay: `${Math.random() * 10}s`,
        animationDuration: `${8 + Math.random() * 12}s`,
        fontSize: `${0.6 + Math.random() * 1}rem`,
    }))

    return (
        <div className="auth-root">
            {/* Ambient particles */}
            <div className="auth-particles" aria-hidden="true">
                {particles.map((p, i) => (
                    <span key={i} className="auth-particle" style={p}>🍃</span>
                ))}
            </div>

            {/* Card */}
            <div className="auth-card-wrap">
                {/* ── Left: Visual Panel ── */}
                <div className="auth-visual-panel">
                    <div className="auth-plant-graphic">
                        <div className="auth-ring auth-ring-1" />
                        <div className="auth-ring auth-ring-2" />
                        <div className="auth-plant-orb">🌿</div>
                    </div>

                    <div className="auth-visual-text">
                        <h2>Know Your<br /><span>Plant</span></h2>
                        <p>Identify any plant instantly using AI-powered image recognition.</p>
                    </div>

                    <div className="auth-feature-list">
                        {[
                            { icon: '🔬', text: 'Botanical classification' },
                            { icon: '🪴', text: 'Personalized care guides' },
                            { icon: '📷', text: 'Real-time camera scanning' },
                            { icon: '📋', text: 'Cloud scan history' },
                        ].map((f, i) => (
                            <div key={i} className="auth-feat">
                                <div className="auth-feat-icon">{f.icon}</div>
                                {f.text}
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── Right: Form Panel ── */}
                <div className="auth-form-panel">
                    <div className="auth-form-inner">
                        <div className="auth-form-header">
                            <h1>{mode === 'login' ? 'Welcome back' : 'Create account'}</h1>
                            <p>{mode === 'login'
                                ? 'Sign in to continue identifying plants'
                                : 'Join thousands of plant enthusiasts'
                            }</p>
                        </div>

                        <form className="auth-form-fields" onSubmit={handleSubmit} noValidate>
                            {/* Username (signup only) */}
                            {mode === 'register' && (
                                <div className="auth-input-group">
                                    <label className="auth-label">Username</label>
                                    <div className={`auth-input-wrap ${fieldErrors.username ? 'error' : ''}`}>
                                        <span className="auth-input-icon">{Icons.user}</span>
                                        <input
                                            className="auth-input"
                                            name="username"
                                            placeholder="e.g. plant_lover"
                                            value={form.username}
                                            onChange={handleChange}
                                            autoComplete="username"
                                        />
                                    </div>
                                    {fieldErrors.username && <span className="auth-field-error">⚠ {fieldErrors.username}</span>}
                                </div>
                            )}

                            {/* Email */}
                            <div className="auth-input-group">
                                <label className="auth-label">Email address</label>
                                <div className={`auth-input-wrap ${fieldErrors.email ? 'error' : ''}`}>
                                    <span className="auth-input-icon">{Icons.email}</span>
                                    <input
                                        className="auth-input"
                                        name="email"
                                        type="email"
                                        placeholder="you@example.com"
                                        value={form.email}
                                        onChange={handleChange}
                                        autoComplete="email"
                                    />
                                </div>
                                {fieldErrors.email && <span className="auth-field-error">⚠ {fieldErrors.email}</span>}
                            </div>

                            {/* Password */}
                            <div className="auth-input-group">
                                <label className="auth-label">Password</label>
                                <div className={`auth-input-wrap ${fieldErrors.password ? 'error' : ''}`}>
                                    <span className="auth-input-icon">{Icons.lock}</span>
                                    <input
                                        className="auth-input"
                                        name="password"
                                        type={showPw ? 'text' : 'password'}
                                        placeholder="••••••••"
                                        value={form.password}
                                        onChange={handleChange}
                                        autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                                    />
                                    <button type="button" className="auth-eye-btn" onClick={() => setShowPw(v => !v)} tabIndex={-1}>
                                        {showPw ? Icons.eyeClosed : Icons.eyeOpen}
                                    </button>
                                </div>
                                {fieldErrors.password && <span className="auth-field-error">⚠ {fieldErrors.password}</span>}
                            </div>

                            {/* Confirm Password (signup only) */}
                            {mode === 'register' && (
                                <div className="auth-input-group">
                                    <label className="auth-label">Confirm Password</label>
                                    <div className={`auth-input-wrap ${fieldErrors.confirmPassword ? 'error' : ''}`}>
                                        <span className="auth-input-icon">{Icons.lock}</span>
                                        <input
                                            className="auth-input"
                                            name="confirmPassword"
                                            type={showConfirmPw ? 'text' : 'password'}
                                            placeholder="••••••••"
                                            value={form.confirmPassword}
                                            onChange={handleChange}
                                            autoComplete="new-password"
                                        />
                                        <button type="button" className="auth-eye-btn" onClick={() => setShowConfirmPw(v => !v)} tabIndex={-1}>
                                            {showConfirmPw ? Icons.eyeClosed : Icons.eyeOpen}
                                        </button>
                                    </div>
                                    {fieldErrors.confirmPassword && <span className="auth-field-error">⚠ {fieldErrors.confirmPassword}</span>}
                                </div>
                            )}

                            {/* Remember me / Forgot */}
                            {mode === 'login' && (
                                <div className="auth-extras-row">
                                    <label className="auth-remember" onClick={() => setRemember(r => !r)}>
                                        <div className={`auth-checkbox ${remember ? 'checked' : ''}`}>
                                            {Icons.check}
                                        </div>
                                        Remember me
                                    </label>
                                    <button type="button" className="auth-forgot">Forgot password?</button>
                                </div>
                            )}

                            {/* Error / Success banners */}
                            {error && (
                                <div className="auth-error-banner">
                                    <span>⚠️</span> {error}
                                </div>
                            )}
                            {success && (
                                <div className="auth-success-banner">
                                    <span>✅</span> {success}
                                </div>
                            )}

                            {/* Submit */}
                            <button type="submit" className="auth-submit" disabled={loading}>
                                {loading ? (
                                    <>
                                        <div className="auth-spinner" />
                                        Please wait…
                                    </>
                                ) : (
                                    <>
                                        {mode === 'login' ? 'Sign In' : 'Create Account'}
                                        {Icons.arrow}
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="auth-or-divider">or</div>

                        <div className="auth-switch-row">
                            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
                            <button className="auth-switch-btn" onClick={switchMode}>
                                {mode === 'login' ? 'Register for free' : 'Sign in'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
