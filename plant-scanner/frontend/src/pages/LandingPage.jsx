import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ThreeHero from '../components/ThreeHero'

/* ─── Particle Leaf ─────────────────────────────────────────────────────────── */
function Particle({ style }) {
    return <div className="particle" style={style} aria-hidden="true">🍃</div>
}

/* ─── Feature Card ──────────────────────────────────────────────────────────── */
function FeatureCard({ icon, title, desc, delay }) {
    const ref = useRef()
    useEffect(() => {
        const el = ref.current
        const obs = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) el.classList.add('visible') },
            { threshold: 0.15 }
        )
        obs.observe(el)
        return () => obs.disconnect()
    }, [])
    return (
        <div ref={ref} className="feature-card" style={{ transitionDelay: `${delay}ms` }}>
            <div className="feature-icon">{icon}</div>
            <h3>{title}</h3>
            <p>{desc}</p>
        </div>
    )
}

/* ─── Scanner Section ────────────────────────────────────────────────────────── */
function ScannerSection() {
    const [mode, setMode] = useState('upload')
    const [preview, setPreview] = useState(null)
    const [scanning, setScanning] = useState(false)
    const [result, setResult] = useState(null)
    const [dragOver, setDragOver] = useState(false)
    const fileRef = useRef()
    const videoRef = useRef()
    const streamRef = useRef(null)

    const MOCK = {
        plant_name: 'Monstera Deliciosa',
        scientific_name: 'Monstera deliciosa',
        confidence: 0.94,
        description: 'A popular tropical houseplant known for its large, glossy, split leaves. Native to tropical forests of Central America.',
        is_toxic: true,
    }

    const startCamera = async () => {
        try {
            const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
            streamRef.current = s
            if (videoRef.current) videoRef.current.srcObject = s
        } catch { /* permission denied */ }
    }
    const stopCamera = () => {
        streamRef.current?.getTracks().forEach(t => t.stop())
        streamRef.current = null
    }

    useEffect(() => {
        if (mode === 'camera') startCamera()
        else stopCamera()
        return stopCamera
    }, [mode])

    const handleFile = (f) => {
        if (!f?.type.startsWith('image/')) return
        setPreview(URL.createObjectURL(f))
        setResult(null)
    }

    const captureFrame = () => {
        if (!videoRef.current) return
        const c = document.createElement('canvas')
        c.width = videoRef.current.videoWidth
        c.height = videoRef.current.videoHeight
        c.getContext('2d').drawImage(videoRef.current, 0, 0)
        c.toBlob(blob => {
            setPreview(URL.createObjectURL(blob))
            setMode('upload')
            stopCamera()
        }, 'image/jpeg', 0.92)
    }

    const handleScan = async () => {
        if (!preview) return
        setScanning(true)
        setResult(null)
        await new Promise(r => setTimeout(r, 2200))
        setResult(MOCK)
        setScanning(false)
    }

    return (
        <section className="scanner-section" id="scanner">
            <div className="section-label">TRY IT NOW</div>
            <h2 className="section-title">Identify Any Plant Instantly</h2>
            <p className="section-sub">Upload a photo or use your camera — our AI returns results in seconds.</p>

            <div className="scanner-card">
                {/* Toggle */}
                <div className="scanner-toggle">
                    <button
                        className={`toggle-btn ${mode === 'upload' ? 'active' : ''}`}
                        onClick={() => { setMode('upload'); setPreview(null); setResult(null) }}
                    >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                        </svg>
                        Upload Image
                    </button>
                    <button
                        className={`toggle-btn ${mode === 'camera' ? 'active' : ''}`}
                        onClick={() => { setMode('camera'); setPreview(null); setResult(null) }}
                    >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                            <circle cx="12" cy="12" r="3" /><path d="M20.94 11A9 9 0 1111 3.06" />
                        </svg>
                        Live Camera
                    </button>
                </div>

                <div className="scanner-body">
                    {/* Preview */}
                    <div className="lp-preview-wrap">
                        <div
                            className={`lp-preview ${dragOver ? 'drag-over' : ''}`}
                            onClick={() => mode === 'upload' && !preview && fileRef.current.click()}
                            onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                            onDragLeave={() => setDragOver(false)}
                            onDrop={e => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]) }}
                        >
                            {/* Camera */}
                            {mode === 'camera' && !preview && (
                                <>
                                    <video ref={videoRef} autoPlay playsInline muted className="lp-video" />
                                    <div className="live-badge"><span className="live-dot" />LIVE</div>
                                </>
                            )}

                            {/* Upload placeholder */}
                            {mode === 'upload' && !preview && (
                                <div className="lp-placeholder">
                                    <div className="lp-upload-icon">
                                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                                        </svg>
                                    </div>
                                    <p className="lp-upload-title">Drop your plant photo here</p>
                                    <p className="lp-upload-sub">JPG · PNG · WEBP · HEIC</p>
                                </div>
                            )}

                            {/* Image preview */}
                            {preview && <img src={preview} alt="Plant" className="lp-img" />}

                            {/* Scanning overlay */}
                            {scanning && (
                                <div className="lp-scan-overlay">
                                    <div className="lp-scan-corners" />
                                    <div className="lp-scan-line" />
                                    <span className="lp-scan-text">Analyzing…</span>
                                </div>
                            )}

                            {/* Result overlay */}
                            {result && !scanning && (
                                <div className="lp-result-overlay">
                                    <div className="lp-result-top">
                                        <div>
                                            <div className="lp-plant-name">{result.plant_name}</div>
                                            <div className="lp-plant-sci">{result.scientific_name}</div>
                                        </div>
                                        <div className="lp-conf-badge">
                                            <span className="lp-conf-val">{Math.round(result.confidence * 100)}%</span>
                                            <span className="lp-conf-lbl">Match</span>
                                        </div>
                                    </div>
                                    <div className="lp-conf-bar-wrap">
                                        <div className="lp-conf-bar" style={{ width: `${result.confidence * 100}%` }} />
                                    </div>
                                    {result.is_toxic && <div className="lp-toxic">⚠️ Toxic — keep away from pets & children</div>}
                                </div>
                            )}

                            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }}
                                onChange={e => handleFile(e.target.files[0])} />
                        </div>

                        {/* Controls */}
                        <div className="lp-controls">
                            {mode === 'camera' && !preview ? (
                                <button className="lp-btn-primary" onClick={captureFrame}>📸 Capture & Identify</button>
                            ) : (
                                <>
                                    <button className="lp-btn-primary" onClick={handleScan} disabled={!preview || scanning}>
                                        {scanning ? '⏳ Scanning…' : '🔍 Identify Plant'}
                                    </button>
                                    {preview && (
                                        <button className="lp-btn-ghost" onClick={() => { setPreview(null); setResult(null) }}>Clear</button>
                                    )}
                                </>
                            )}
                        </div>
                    </div>

                    {/* Result card */}
                    <div className={`lp-result-card ${result ? 'show' : ''}`}>
                        {result ? (
                            <>
                                <div className="lp-result-header">
                                    <div className="lp-result-icon">🌿</div>
                                    <div>
                                        <div className="lp-result-name">{result.plant_name}</div>
                                        <div className="lp-result-sci">{result.scientific_name}</div>
                                    </div>
                                </div>
                                <p className="lp-result-desc">{result.description}</p>
                                <div className="lp-result-tags">
                                    {['Air Purifier', 'Tropical', 'Houseplant'].map(t => (
                                        <span key={t} className="lp-tag">{t}</span>
                                    ))}
                                </div>
                                <div className="lp-care-row">
                                    {[
                                        { icon: '💧', label: 'Water', val: 'Weekly' },
                                        { icon: '☀️', label: 'Light', val: 'Indirect' },
                                        { icon: '🌡️', label: 'Temp', val: '18–30°C' },
                                    ].map(c => (
                                        <div key={c.label} className="lp-care-chip">
                                            <span>{c.icon}</span>
                                            <div>
                                                <div className="lp-care-label">{c.label}</div>
                                                <div className="lp-care-val">{c.val}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div className="lp-result-empty">
                                <div className="lp-result-empty-icon">🌱</div>
                                <p>Plant details will appear here after identification.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    )
}

/* ─── Main Landing Page ──────────────────────────────────────────────────────── */
export default function LandingPage() {
    const navigate = useNavigate()
    const heroRef = useRef()

    // Parallax on scroll
    useEffect(() => {
        const onScroll = () => {
            const y = window.scrollY
            if (heroRef.current) {
                heroRef.current.style.transform = `translateY(${y * 0.35}px)`
                heroRef.current.style.opacity = Math.max(0, 1 - y / 500)
            }
        }
        window.addEventListener('scroll', onScroll, { passive: true })
        return () => window.removeEventListener('scroll', onScroll)
    }, [])

    // Generate particles
    const particles = Array.from({ length: 18 }, (_, i) => ({
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        animationDelay: `${Math.random() * 8}s`,
        animationDuration: `${6 + Math.random() * 8}s`,
        fontSize: `${0.8 + Math.random() * 1.2}rem`,
        opacity: 0.12 + Math.random() * 0.18,
    }))

    return (
        <div className="lp-root">
            {/* ── NAV ── */}
            <nav className="lp-nav">
                <div className="lp-nav-inner">
                    <div className="lp-brand">
                        <div className="lp-brand-icon">🌿</div>
                        <span className="lp-brand-name">Know<span>Your</span>Plant</span>
                    </div>
                    <div className="lp-nav-links">
                        <a href="#features">Features</a>
                        <a href="#scanner">Try It</a>
                    </div>
                    <div className="lp-nav-actions">
                        <button className="lp-nav-login" onClick={() => navigate('/auth')}>Sign In</button>
                        <button className="lp-nav-cta" onClick={() => navigate('/auth')}>Get Started</button>
                    </div>
                </div>
            </nav>

            {/* ── HERO ── */}
            <section className="lp-hero">
                {/* 3D Background - New! */}
                <div className="lp-hero-3d">
                    <ThreeHero />
                </div>

                {/* Particles overlay */}
                <div className="lp-particles" aria-hidden="true">
                    {particles.map((p, i) => <Particle key={i} style={p} />)}
                </div>

                {/* Gradient orbs */}
                <div className="lp-orb lp-orb-1" aria-hidden="true" />
                <div className="lp-orb lp-orb-2" aria-hidden="true" />

                <div className="lp-hero-content" ref={heroRef}>
                    <div className="lp-hero-badge">✨ AI-Powered Plant Recognition</div>
                    <h1 className="lp-hero-title">
                        Know Your Plant<br />
                        <span className="lp-hero-accent">Instantly</span>
                    </h1>
                    <p className="lp-hero-sub">
                        Upload a photo or scan in real-time. Our AI identifies thousands of plant species,
                        delivers care guides, toxicity info, and botanical data — in seconds.
                    </p>

                    <div className="lp-hero-ctas">
                        <button className="lp-cta-primary" onClick={() => navigate('/auth')}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                            </svg>
                            Upload Image
                        </button>
                        <button className="lp-cta-secondary" onClick={() => document.getElementById('scanner').scrollIntoView({ behavior: 'smooth' })}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                                <circle cx="12" cy="12" r="3" /><path d="M20.94 11A9 9 0 1111 3.06" />
                            </svg>
                            Start Live Scan
                        </button>
                    </div>

                    <div className="lp-hero-stats">
                        {[
                            { val: '10K+', label: 'Species' },
                            { val: '98%', label: 'Accuracy' },
                            { val: '<2s', label: 'Response' },
                        ].map(s => (
                            <div key={s.label} className="lp-stat">
                                <span className="lp-stat-val">{s.val}</span>
                                <span className="lp-stat-label">{s.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="lp-hero-scroll" onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}>
                    <div className="lp-scroll-dot" />
                    <span>Scroll to explore</span>
                </div>
            </section>

            {/* ── FEATURES ── */}
            <section className="lp-features" id="features">
                <div className="lp-section-inner">
                    <div className="lp-section-label">CAPABILITIES</div>
                    <h2 className="lp-section-title">Everything You Need to Know Your Plant</h2>
                    <p className="lp-section-sub">
                        From real-time scanning to detailed botanical profiles — all in one platform.
                    </p>
                    <div className="lp-features-grid">
                        <FeatureCard delay={0} icon="📷" title="Real-Time Camera Scanner" desc="Point your camera at any plant and get instant identification without uploading a file." />
                        <FeatureCard delay={100} icon="🤖" title="AI-Powered Identification" desc="Deep learning models trained on millions of plant images deliver 98%+ accuracy." />
                        <FeatureCard delay={200} icon="🔬" title="Detailed Botanical Info" desc="Scientific name, habitat, toxicity, care guide, and uses — all in one result card." />
                        <FeatureCard delay={300} icon="☁️" title="Cloud Scan History" desc="Every scan is saved to your account so you can revisit and track your plant discoveries." />
                        <FeatureCard delay={400} icon="⚠️" title="Toxicity Alerts" desc="Instantly know if a plant is toxic to humans, dogs, or cats — critical for pet owners." />
                        <FeatureCard delay={500} icon="🌍" title="10,000+ Species" desc="Our database covers houseplants, wildflowers, trees, succulents, herbs, and more." />
                    </div>
                </div>
            </section>

            {/* ── SCANNER ── */}
            <div className="lp-section-inner">
                <ScannerSection />
            </div>

            {/* ── FOOTER ── */}
            <footer className="lp-footer">
                <div className="lp-footer-inner">
                    <div className="lp-footer-brand">
                        <div className="lp-brand">
                            <div className="lp-brand-icon">🌿</div>
                            <span className="lp-brand-name">Know<span>Your</span>Plant</span>
                        </div>
                        <p>AI-powered plant identification for everyone.</p>
                    </div>

                    <div className="lp-footer-links">
                        <div className="lp-footer-col">
                            <h4>Product</h4>
                            <a href="#features">Features</a>
                            <a href="#scanner">Try It</a>
                            <a href="/auth" onClick={e => { e.preventDefault(); navigate('/auth') }}>Sign In</a>
                        </div>
                        <div className="lp-footer-col">
                            <h4>Resources</h4>
                            <a href="https://github.com" target="_blank" rel="noreferrer">GitHub</a>
                            <a href="#">API Docs</a>
                            <a href="#">Privacy Policy</a>
                        </div>
                    </div>

                    <div className="lp-footer-right">
                        <div className="lp-social-row">
                            {/* GitHub */}
                            <a href="https://github.com" target="_blank" rel="noreferrer" className="lp-social-btn" title="GitHub">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                                </svg>
                            </a>
                            {/* Twitter/X */}
                            <a href="#" className="lp-social-btn" title="Twitter">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                </svg>
                            </a>
                            {/* Instagram */}
                            <a href="#" className="lp-social-btn" title="Instagram">
                                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                                    <circle cx="12" cy="12" r="4" />
                                    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
                                </svg>
                            </a>
                        </div>
                    </div>
                </div>
                <div className="lp-footer-bottom">
                    <span>© 2026 KnowYourPlant. Built with 🌿 and AI.</span>
                </div>
            </footer>
        </div>
    )
}
