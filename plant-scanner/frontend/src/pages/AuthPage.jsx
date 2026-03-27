import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login, register, getMe } from '../api/client'
import { useAuth } from '../context/AuthContext'
import { GoogleLogin } from '@react-oauth/google'

// ─── SVG Icons ────────────────────────────────────────────────────────────────
const Icons = {
    email: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter">
            <rect x="2" y="4" width="20" height="16" /><path d="M22 7l-10 7L2 7" />
        </svg>
    ),
    user: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter">
            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
        </svg>
    ),
    lock: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter">
            <rect x="3" y="11" width="18" height="11" /><path d="M7 11V7a5 5 0 0110 0v4" />
        </svg>
    ),
    eyeOpen: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
        </svg>
    ),
    eyeClosed: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter">
            <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
            <line x1="1" y1="1" x2="23" y2="23" />
        </svg>
    ),
    check: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="square" strokeLinejoin="miter">
            <polyline points="20 6 9 17 4 12" />
        </svg>
    ),
    arrow: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square" strokeLinejoin="miter">
            <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
    ),
    leaf: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter">
            <path d="M11 20A7 7 0 0 1 4 13V4h9a7 7 0 0 1 7 7v9h-9Z"></path>
            <path d="M4 20L11 13"></path>
        </svg>
    ),
    microscope: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter">
            <path d="M14 4h6v6"></path><path d="M10 20v-4H6"></path><path d="M12 12A3 3 0 0 0 9 9l-3 3 5 5a3 3 0 0 0 4-2L12 12z"></path><path d="M20 4L9 15"></path>
        </svg>
    ),
    document: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter">
            <path d="M14 2H6a2 2 0 0 0-2 2v16h16V8l-6-6z" /><path d="M14 2v6h6" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" />
        </svg>
    ),
    camera: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter">
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" />
        </svg>
    ),
    cloud: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter">
            <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
        </svg>
    )
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
        if (fieldErrors[e.target.name]) {
            setFieldErrors(prev => ({ ...prev, [e.target.name]: '' }))
        }
    }

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
            setError(err.response?.data?.detail || 'System error. Please verify credentials.')
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

    return (
        <div className="auth-root">
            {/* Ambient Background Structure */}
            <div className="auth-background-grid" aria-hidden="true" />
            <div className="auth-top-nav" onClick={() => navigate('/')}>
                <div className="lp-brand">
                    <div className="lp-brand-icon">{Icons.leaf}</div>
                    <span className="lp-brand-name" style={{ color: 'var(--text-primary)'}}>KnowYourPlant.</span>
                </div>
            </div>

            <div className="auth-card-wrap">
                {/* ── Left: Visual Panel ── */}
                <div className="auth-visual-panel">
                    <div className="auth-visual-text">
                        <h2>Identify Plant Specimens</h2>
                        <p>Authenticate to access the most robust botanical identification protocol available.</p>
                    </div>

                    <div className="auth-feature-list">
                        {[
                            { icon: Icons.microscope, text: 'Taxonomic identification engine' },
                            { icon: Icons.document, text: 'Custom care directives' },
                            { icon: Icons.camera, text: 'Live optical scanning' },
                            { icon: Icons.cloud, text: 'Synchronized specimen logs' },
                        ].map((f, i) => (
                            <div key={i} className="auth-feat hover-animate">
                                <div className="auth-feat-icon animate-small">{f.icon}</div>
                                {f.text}
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── Right: Form Panel ── */}
                <div className="auth-form-panel">
                    <div className="auth-form-inner">
                        <div className="auth-form-header">
                            <h1>{mode === 'login' ? 'Welcome Back' : 'Create Account'}</h1>
                            <p>{mode === 'login'
                                ? 'Sign in to your botanical dashboard'
                                : 'Join our community of plant lovers'
                            }</p>
                        </div>

                        <form className="auth-form-fields" onSubmit={handleSubmit} noValidate>
                            {/* Username (signup only) */}
                            {mode === 'register' && (
                                <div className="auth-input-group">
                                    <label className="auth-label">Identification Handle</label>
                                    <div className={`auth-input-wrap ${fieldErrors.username ? 'error' : ''}`}>
                                        <span className="auth-input-icon">{Icons.user}</span>
                                        <input
                                            className="auth-input"
                                            name="username"
                                            placeholder="e.g. botanicus"
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
                                <label className="auth-label">Email Designation</label>
                                <div className={`auth-input-wrap ${fieldErrors.email ? 'error' : ''}`}>
                                    <span className="auth-input-icon">{Icons.email}</span>
                                    <input
                                        className="auth-input"
                                        name="email"
                                        type="email"
                                        placeholder="user@example.com"
                                        value={form.email}
                                        onChange={handleChange}
                                        autoComplete="email"
                                    />
                                </div>
                                {fieldErrors.email && <span className="auth-field-error">⚠ {fieldErrors.email}</span>}
                            </div>

                            {/* Password */}
                            <div className="auth-input-group">
                                <label className="auth-label">Security Key</label>
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
                                    <label className="auth-label">Verify Security Key</label>
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
                                        Persist Session
                                    </label>
                                    <button type="button" className="auth-forgot">Lost Security Key?</button>
                                </div>
                            )}

                            {/* Error / Success banners */}
                            {error && (
                                <div className="auth-error-banner">
                                    {Icons.lock} {error}
                                </div>
                            )}
                            {success && (
                                <div className="auth-success-banner">
                                    {Icons.check} {success}
                                </div>
                            )}

                            {/* Submit */}
                            <button type="submit" className="auth-submit hover-animate" disabled={loading}>
                                {loading ? (
                                    <>
                                        <div className="auth-spinner" />
                                        Processing…
                                    </>
                                ) : (
                                    <span className="animate-small" style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                                        {mode === 'login' ? 'Sign In' : 'Sign Up'}
                                        {Icons.arrow}
                                    </span>
                                )}
                            </button>
                        </form>

                        <div className="auth-or-divider">External Authentication</div>

                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                            <GoogleLogin
                                onSuccess={async (credentialResponse) => {
                                    setLoading(true)
                                    setError('')
                                    try {
                                        const { loginWithGoogle, getMe } = await import('../api/client')
                                        const res = await loginWithGoogle(credentialResponse.credential)
                                        localStorage.setItem('token', res.data.access_token)
                                        const me = await getMe()
                                        setUser(me.data)
                                        navigate('/dashboard')
                                    } catch (err) {
                                        setError(err.response?.data?.detail || 'Google Authentication failed.')
                                    } finally {
                                        setLoading(false)
                                    }
                                }}
                                onError={() => {
                                    setError('Google Sign In was unsuccessful.')
                                }}
                                useOneTap
                            />
                        </div>

                        <div className="auth-switch-row">
                            {mode === 'login' ? "Require an account? " : 'Possess an account? '}
                            <button className="auth-switch-btn" onClick={switchMode}>
                                {mode === 'login' ? 'Create one now' : 'Authenticate here'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
