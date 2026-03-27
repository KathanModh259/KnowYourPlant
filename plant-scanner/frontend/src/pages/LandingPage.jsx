import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

/* ─── SVG Icons ───────────────────────────────────────────────────────────── */
const Icons = {
    Camera: () => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter">
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
            <circle cx="12" cy="13" r="4"></circle>
        </svg>
    ),
    Brain: () => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter">
            <path d="M12 2v2M8 3l1 2M16 3l-1 2M4 10h2M18 10h2M6.5 6.5l1.5 1.5M17.5 6.5l-1.5 1.5"></path>
            <path d="M12 11a4 4 0 0 0-4 4v7h8v-7a4 4 0 0 0-4-4z"></path>
        </svg>
    ),
    Microscope: () => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter">
            <path d="M14 4h6v6"></path>
            <path d="M10 20v-4H6"></path>
            <path d="M12 12A3 3 0 0 0 9 9l-3 3 5 5a3 3 0 0 0 4-2L12 12z"></path>
            <path d="M20 4L9 15"></path>
        </svg>
    ),
    Cloud: () => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter">
            <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"></path>
        </svg>
    ),
    Warning: () => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
        </svg>
    ),
    Globe: () => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="2" y1="12" x2="22" y2="12"></line>
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
        </svg>
    ),
    Leaf: () => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter">
            <path d="M11 20A7 7 0 0 1 4 13V4h9a7 7 0 0 1 7 7v9h-9Z"></path>
            <path d="M4 20L11 13"></path>
        </svg>
    )
}

/* ─── Feature Card ──────────────────────────────────────────────────────────── */
function FeatureCard({ icon: Icon, title, desc }) {
    return (
        <div className="feature-card hover-animate">
            <div className="feature-icon animate"><Icon /></div>
            <h3>{title}</h3>
            <p>{desc}</p>
        </div>
    )
}

/* ─── Scanner Section ────────────────────────────────────────────────────────── */
function ScannerSection() {
    const [mode, setMode] = useState('upload')
    const [preview, setPreview] = useState(null)
    const fileRef = useRef()

    const handleFile = (f) => {
        if (!f?.type.startsWith('image/')) return
        setPreview(URL.createObjectURL(f))
    }

    const handleScan = () => {
        if (!preview) return
        window.alert("Please sign in or create an account to view AI identification results.")
        window.location.href = '/auth'
    }

    return (
        <section className="scanner-section" id="scanner">
            <div className="scanner-header">
                <div className="scanner-badge">Interactive Demo</div>
                <h2 className="scanner-title">Identify Your Plant</h2>
                <p className="scanner-sub">Experience the power of our structured botanical database.</p>
            </div>

            <div className="scanner-container">
                <div className="scanner-tabs">
                    <button className={`sc-tab ${mode === 'upload' ? 'active' : ''}`} onClick={() => { setMode('upload'); setPreview(null); }}>
                        File Upload
                    </button>
                    <button className={`sc-tab ${mode === 'camera' ? 'active' : ''}`} onClick={() => { setMode('camera'); setPreview(null); }}>
                        Live Camera
                    </button>
                </div>

                <div className="scanner-box">
                    {mode === 'camera' && (
                        <div className="sc-empty-state">
                            <Icons.Camera />
                            <p>Camera access requires sign in.</p>
                            <a href="/auth" className="sc-link-btn">Sign In to use Camera</a>
                        </div>
                    )}

                    {mode === 'upload' && !preview && (
                        <div className="sc-drop-zone" onClick={() => fileRef.current.click()}>
                            <div className="sc-upload-icon"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg></div>
                            <span className="sc-drop-title">Select an Image</span>
                            <span className="sc-drop-sub">JPG, PNG, WEBP max 5MB</span>
                        </div>
                    )}

                    {preview && (
                        <div className="sc-preview-wrap">
                            <img src={preview} alt="Plant Preview" className="sc-preview-img" />
                        </div>
                    )}
                    <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleFile(e.target.files[0])} />
                </div>

                <div className="scanner-footer">
                    <button className="sc-action-btn" onClick={handleScan} disabled={!preview}>
                        Analyze Specimen
                    </button>
                    {preview && (
                        <button className="sc-clear-btn" onClick={() => setPreview(null)}>Clear</button>
                    )}
                </div>
            </div>
        </section>
    )
}

/* ─── Main Landing Page ──────────────────────────────────────────────────────── */
export default function LandingPage() {
    const navigate = useNavigate()

    return (
        <div className="lp-root">
            {/* ── NAV ── */}
            <nav className="lp-nav">
                <div className="lp-brand">
                    <div className="lp-brand-icon"><Icons.Leaf /></div>
                    <span className="lp-brand-name">KnowYourPlant.</span>
                </div>
                <div className="lp-nav-links">
                    <a href="#features" className="lp-nav-link">Capabilities</a>
                    <a href="#scanner" className="lp-nav-link">Scanner</a>
                </div>
                <div className="lp-nav-actions">
                    <button className="lp-nav-login" onClick={() => navigate('/auth')}>Sign In</button>
                    <button className="lp-nav-cta" onClick={() => navigate('/auth')}>Get Started</button>
                </div>
            </nav>

            {/* ── HERO ── */}
            <section className="lp-hero">
                <div className="lp-hero-grid">
                    <div className="lp-hero-content">
                        <div className="lp-hero-badge">The Ultimate Plant Companion</div>
                        <h1 className="lp-hero-title">
                            Identify Any Plant,<br />
                            Instantly.
                        </h1>
                        <p className="lp-hero-sub">
                            Access the world's most comprehensive botanical database. Upload a photograph or stream directly from your camera to instantly classify species, uncover toxicity warnings, and receive structured care protocols.
                        </p>
                        <div className="lp-hero-ctas">
                            <button className="lp-cta-primary hover-animate" onClick={() => navigate('/auth')}>
                                <span className="animate-small" style={{display: 'inline-block'}}>Start Exploring</span>
                            </button>
                            <button className="lp-cta-secondary hover-animate" onClick={() => document.getElementById('scanner').scrollIntoView({ behavior: 'smooth' })}>
                                <span className="animate-small" style={{display: 'inline-block'}}>Try The Scanner</span>
                            </button>
                        </div>
                        <div className="lp-hero-stats">
                            <div className="lp-stat-box">
                                <span className="lp-stat-val">10K+</span>
                                <span className="lp-stat-label">Species Indexed</span>
                            </div>
                            <div className="lp-stat-box">
                                <span className="lp-stat-val">98%</span>
                                <span className="lp-stat-label">Classification Accuracy</span>
                            </div>
                            <div className="lp-stat-box">
                                <span className="lp-stat-val">&lt;2s</span>
                                <span className="lp-stat-label">Processing Time</span>
                            </div>
                        </div>
                    </div>
                    <div className="lp-hero-visual hover-animate" style={{width: '100%', display: 'flex', justifyContent: 'flex-end'}}>
                        <div className="lp-hero-image-wrap">
                            <div className="monstera-group">
                                <img src="https://assets-global.website-files.com/5f4e8114a9640d4aa2c637c4/5fc5ab27b60ec7f9b563bd02_monstera%20adansonii-pot-export.png" alt="monstera adansonii pot" className="plant-pot" />
                                <img src="https://assets-global.website-files.com/5f4e8114a9640d4aa2c637c4/5fc5ab2cd088cd080fadb1f8_monstera%20adansonii-plant-export.png" alt="monstera adansonii" className="plant-leaves animate" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── DIVIDER ── */}
            <div className="lp-marquee">
                <div className="lp-marquee-content">
                    <span>BOTANICAL RECOGNITION API</span> • <span>LIVE CAMERA SCANNING</span> • <span>REAL-TIME ANALYSIS</span> • <span>SCIENTIFIC TAXONOMY</span> • <span>BOTANICAL RECOGNITION API</span> • <span>LIVE CAMERA SCANNING</span> • <span>REAL-TIME ANALYSIS</span> • <span>SCIENTIFIC TAXONOMY</span> •
                </div>
            </div>

            {/* ── FEATURES ── */}
            <section className="lp-features" id="features">
                <div className="lp-section-header">
                    <h2 className="lp-section-title">System Capabilities</h2>
                    <p className="lp-section-sub">
                        A robust, structured approach to plant taxonomy and care management.
                    </p>
                </div>
                <div className="lp-features-grid">
                    <FeatureCard icon={Icons.Camera} title="Real-Time Processing" desc="Access the camera stream for instantaneous species classification without manual uploads." />
                    <FeatureCard icon={Icons.Brain} title="Neural Architecture" desc="Driven by deep learning models trained on millions of verified botanical specimens." />
                    <FeatureCard icon={Icons.Microscope} title="Scientific Taxonomy" desc="Returns exact scientific names, genus data, and detailed habitat distributions." />
                    <FeatureCard icon={Icons.Cloud} title="Cloud Synchronization" desc="All captured records are permanently archived to your secure user dashboard." />
                    <FeatureCard icon={Icons.Warning} title="Toxicity Protocols" desc="Immediate safety flags identifying threats to households and dependent animals." />
                    <FeatureCard icon={Icons.Globe} title="Global Database" desc="Comprehensive coverage spanning tropical houseplants, arid succulents, and native flora." />
                </div>
            </section>

            {/* ── SCANNER ── */}
            <ScannerSection />

            {/* ── FOOTER ── */}
            <footer className="lp-footer">
                <div className="lp-footer-grid">
                    <div className="lp-footer-left">
                        <div className="lp-brand">
                            <div className="lp-brand-icon"><Icons.Leaf /></div>
                            <span className="lp-brand-name">KnowYourPlant.</span>
                        </div>
                        <p className="lp-footer-desc">The standard in automated botanical classification. Built for accuracy, speed, and reliability.</p>
                    </div>
                    <div className="lp-footer-links">
                        <div className="lp-footer-col">
                            <h4>Platform</h4>
                            <a href="#features">Capabilities</a>
                            <a href="#scanner">Demo System</a>
                            <a href="/auth" onClick={e => { e.preventDefault(); navigate('/auth') }}>Authentication</a>
                        </div>
                        <div className="lp-footer-col">
                            <h4>System</h4>
                            <a href="https://github.com" target="_blank" rel="noreferrer">Source Code</a>
                            <a href="#">Architecture</a>
                            <a href="#">Privacy Protocol</a>
                        </div>
                    </div>
                </div>
                <div className="lp-footer-bottom">
                    <div className="lp-copy">© 2026 KnowYourPlant System.</div>
                    <div className="lp-status">STATUS: ONLINE v2.1.0</div>
                </div>
            </footer>
        </div>
    )
}
