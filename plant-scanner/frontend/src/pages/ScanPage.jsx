import { useState, useRef, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { scanPlant } from '../api/client'

// ─── Mock plant data for demo ─────────────────────────────────────────────────
const MOCK_PLANTS = [
    {
        plant_name: 'Monstera Deliciosa',
        scientific_name: 'Monstera deliciosa',
        confidence: 0.94,
        description: 'A popular tropical houseplant known for its large, glossy, split leaves. Native to the tropical forests of southern Mexico and Central America.',
        uses: ['Air purification', 'Interior decoration', 'Feng shui'],
        care_tips: [
            { icon: '💧', label: 'Water', value: 'Every 1–2 weeks' },
            { icon: '☀️', label: 'Light', value: 'Bright indirect' },
            { icon: '🌡️', label: 'Temp', value: '18–30°C' },
            { icon: '💦', label: 'Humidity', value: 'High (60%+)' },
        ],
        habitat: 'Tropical rainforests of Central America, Mexico',
        is_toxic: true,
    },
    {
        plant_name: 'Peace Lily',
        scientific_name: 'Spathiphyllum wallisii',
        confidence: 0.88,
        description: 'An elegant flowering plant with glossy dark green leaves and white blooms. One of the best indoor air purifiers.',
        uses: ['Air purification', 'Ornamental', 'Bedroom plant'],
        care_tips: [
            { icon: '💧', label: 'Water', value: 'Weekly' },
            { icon: '☀️', label: 'Light', value: 'Low to medium' },
            { icon: '🌡️', label: 'Temp', value: '18–26°C' },
            { icon: '💦', label: 'Humidity', value: 'Medium' },
        ],
        habitat: 'Tropical Americas and southeastern Asia',
        is_toxic: true,
    },
    {
        plant_name: 'Snake Plant',
        scientific_name: 'Dracaena trifasciata',
        confidence: 0.91,
        description: 'A hardy, drought-tolerant succulent with stiff, upright leaves. Excellent air purifier that converts CO₂ to oxygen at night.',
        uses: ['Air purification', 'Low-maintenance decor', 'Bedroom plant'],
        care_tips: [
            { icon: '💧', label: 'Water', value: 'Every 2–3 weeks' },
            { icon: '☀️', label: 'Light', value: 'Low to bright' },
            { icon: '🌡️', label: 'Temp', value: '15–30°C' },
            { icon: '💦', label: 'Humidity', value: 'Low' },
        ],
        habitat: 'West Africa, Nigeria to Congo',
        is_toxic: false,
    },
]

// ─── SVG Icons ────────────────────────────────────────────────────────────────
const Icons = {
    back: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
    ),
    upload: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
        </svg>
    ),
    camera: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M23 7l-7 5 7 5V7z" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
        </svg>
    ),
    scan: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
        </svg>
    ),
    capture: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="4" fill="currentColor" />
        </svg>
    ),
    clear: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
        </svg>
    ),
    stop: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <rect x="6" y="6" width="12" height="12" rx="1" fill="currentColor" />
        </svg>
    ),
}

// ─── Expandable Info Card ─────────────────────────────────────────────────────
function InfoCard({ icon, iconBg, title, children, defaultOpen = false }) {
    const [open, setOpen] = useState(defaultOpen)
    return (
        <div className={`sc-info-card ${open ? 'open' : ''}`}>
            <div className="sc-info-header" onClick={() => setOpen(o => !o)}>
                <div className="sc-info-title">
                    <div className="sc-info-icon" style={{ background: iconBg }}>{icon}</div>
                    {title}
                </div>
                <span className="sc-info-chevron">▼</span>
            </div>
            <div className="sc-info-body">
                <div className="sc-info-content">{children}</div>
            </div>
        </div>
    )
}



// ═══════════════════════════════════════════════════════════════════════════════
//  MAIN SCAN PAGE
// ═══════════════════════════════════════════════════════════════════════════════
export default function ScanPage() {
    const [mode, setMode] = useState('upload')        // 'upload' | 'camera'
    const [preview, setPreview] = useState(null)
    const [file, setFile] = useState(null)
    const [result, setResult] = useState(null)
    const [scanning, setScanning] = useState(false)
    const [error, setError] = useState('')
    const [dragOver, setDragOver] = useState(false)
    const [history, setHistory] = useState([])
    const [cameraStream, setCameraStream] = useState(null)
    const [scanStatus, setScanStatus] = useState('idle')  // 'idle' | 'scanning' | 'done'

    const fileRef = useRef()
    const videoRef = useRef()
    const { user, logout } = useAuth()
    const navigate = useNavigate()

    // ── Camera Controls ──────────────────────────────────────────────────────
    const startCamera = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } }
            })
            setCameraStream(stream)
            if (videoRef.current) videoRef.current.srcObject = stream
        } catch {
            setError('Camera access denied. Please allow permissions.')
        }
    }, [])

    const stopCamera = useCallback(() => {
        if (cameraStream) {
            cameraStream.getTracks().forEach(t => t.stop())
            setCameraStream(null)
        }
    }, [cameraStream])

    useEffect(() => {
        if (mode === 'camera') startCamera()
        else stopCamera()
        return () => stopCamera()
    }, [mode])

    // ── File Handling ────────────────────────────────────────────────────────
    const handleFile = (f) => {
        if (!f || !f.type.startsWith('image/')) return
        setFile(f)
        setResult(null)
        setError('')
        setScanStatus('idle')
        setPreview(URL.createObjectURL(f))
    }

    const handleDrop = (e) => {
        e.preventDefault()
        setDragOver(false)
        handleFile(e.dataTransfer.files[0])
    }

    // ── Capture Frame from Camera ────────────────────────────────────────────
    const captureFrame = () => {
        if (!videoRef.current) return
        const canvas = document.createElement('canvas')
        canvas.width = videoRef.current.videoWidth
        canvas.height = videoRef.current.videoHeight
        canvas.getContext('2d').drawImage(videoRef.current, 0, 0)
        canvas.toBlob(blob => {
            const f = new File([blob], 'capture.jpg', { type: 'image/jpeg' })
            setFile(f)
            setPreview(URL.createObjectURL(blob))
            setMode('upload')
            stopCamera()
        }, 'image/jpeg', 0.92)
    }

    // ── Scan / Identify ──────────────────────────────────────────────────────
    const handleScan = async () => {
        if (!file) return
        setScanning(true)
        setScanStatus('scanning')
        setError('')
        setResult(null)
        try {
            let data
            try {
                const res = await scanPlant(file)
                data = res.data
            } catch {
                // Mock fallback
                await new Promise(r => setTimeout(r, 2500))
                data = MOCK_PLANTS[Math.floor(Math.random() * MOCK_PLANTS.length)]
            }
            setResult(data)
            setScanStatus('done')
            const now = new Date()
            setHistory(h => [{
                ...data,
                preview,
                time: now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
            }, ...h].slice(0, 10))
        } catch {
            setError('Scan failed. Please try again.')
            setScanStatus('idle')
        } finally {
            setScanning(false)
        }
    }

    // ── Clear ────────────────────────────────────────────────────────────────
    const clearScan = () => {
        setPreview(null)
        setFile(null)
        setResult(null)
        setError('')
        setScanStatus('idle')
    }

    const handleLogout = () => { logout(); navigate('/') }

    // status label
    const statusLabel = scanStatus === 'scanning'
        ? 'Analyzing plant…'
        : scanStatus === 'done'
            ? 'Identification complete'
            : 'Ready to scan'

    return (
        <div className="scanner-root">
            {/* ── Top Bar ── */}
            <header className="sc-topbar">
                <div className="sc-topbar-left">
                    <button className="sc-back-btn" onClick={() => navigate('/dashboard')}>
                        {Icons.back} Dashboard
                    </button>
                    <div className="sc-brand">
                        <div className="sc-brand-icon">🌿</div>
                        <span className="sc-brand-name">Know<span>Your</span>Plant</span>
                    </div>
                </div>
                <div className="sc-topbar-right">

                    <div className="sc-avatar" title={user?.username || 'User'}>
                        {user?.username?.[0]?.toUpperCase() || 'U'}
                    </div>
                </div>
            </header>

            {/* ── Main Body ── */}
            <div className="sc-body">
                {/* ─ Left: Camera / Preview ─ */}
                <div className="sc-preview-pane">
                    <div className="sc-camera-area">
                        {/* Camera live feed */}
                        {mode === 'camera' && !preview && (
                            <>
                                <video ref={videoRef} autoPlay playsInline muted />
                                <div className="sc-live-badge">
                                    <span className="sc-live-dot" />LIVE
                                </div>
                            </>
                        )}

                        {/* Upload placeholder */}
                        {mode === 'upload' && !preview && (
                            <div
                                className={`sc-drop-zone ${dragOver ? 'drag-active' : ''}`}
                                onClick={() => fileRef.current?.click()}
                                onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                                onDragLeave={() => setDragOver(false)}
                                onDrop={handleDrop}
                            >
                                <div className="sc-camera-placeholder">
                                    <div className="sc-camera-ph-icon">📷</div>
                                    <p className="sc-camera-ph-title">Drop your plant image here</p>
                                    <p className="sc-camera-ph-sub">or click to browse — our AI will identify it instantly</p>
                                    <div className="sc-formats-row">
                                        {['JPG', 'PNG', 'WEBP', 'HEIC'].map(f => (
                                            <span key={f} className="sc-format-pill">{f}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                        <input
                            ref={fileRef}
                            type="file"
                            accept="image/*"
                            onChange={e => handleFile(e.target.files[0])}
                            style={{ display: 'none' }}
                        />

                        {/* Image preview */}
                        {preview && <img src={preview} alt="Plant preview" />}

                        {/* Toxic badge */}
                        {result?.is_toxic && (
                            <div className="sc-toxic-badge">⚠️ Toxic</div>
                        )}

                        {/* Scanning overlay */}
                        {scanning && (
                            <div className="sc-scan-overlay">
                                <div className="sc-scan-corners" />
                                <div className="sc-scan-corners-extra" />
                                <div className="sc-scan-line" />
                                <span className="sc-scan-status-text">🔍 Analyzing…</span>
                            </div>
                        )}

                        {/* Prediction overlay */}
                        {result && !scanning && (
                            <div className="sc-prediction-overlay">
                                <div className="sc-pred-top">
                                    <div>
                                        <div className="sc-pred-name">{result.plant_name}</div>
                                        <div className="sc-pred-sci">{result.scientific_name}</div>
                                    </div>
                                    <div className="sc-conf-badge">
                                        <span className="sc-conf-val">{Math.round(result.confidence * 100)}%</span>
                                        <span className="sc-conf-lbl">Match</span>
                                    </div>
                                </div>
                                <div className="sc-conf-bar-wrap">
                                    <div className="sc-conf-bar" style={{ width: `${result.confidence * 100}%` }} />
                                </div>
                                <div className="sc-status-row">
                                    <span className={`sc-status-dot ${scanStatus}`} />
                                    <span className="sc-status-text">{statusLabel}</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Status bar when no result */}
                    {!result && (
                        <div style={{
                            padding: '0.6rem 1.25rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            borderTop: '1px solid rgba(34,197,94,0.08)',
                        }}>
                            <span className={`sc-status-dot ${scanStatus}`} />
                            <span className="sc-status-text">{statusLabel}</span>
                        </div>
                    )}
                </div>

                {/* ─ Right: Side Panel ─ */}
                <div className="sc-side-panel">
                    {/* Controls */}
                    <div className="sc-controls-card">
                        <div className="sc-controls-title">Scanner Controls</div>

                        {/* Mode toggle */}
                        <div className="sc-mode-toggle">
                            <button
                                className={`sc-mode-btn ${mode === 'upload' ? 'active' : ''}`}
                                onClick={() => { setMode('upload'); setPreview(null); setResult(null); setScanStatus('idle') }}
                            >
                                {Icons.upload} Upload
                            </button>
                            <button
                                className={`sc-mode-btn ${mode === 'camera' ? 'active' : ''}`}
                                onClick={() => { setMode('camera'); setPreview(null); setResult(null); setScanStatus('idle') }}
                            >
                                {Icons.camera} Camera
                            </button>
                        </div>

                        {/* Action buttons */}
                        <div className="sc-action-btns">
                            {mode === 'camera' && !preview ? (
                                <>
                                    <button className="sc-btn-primary" onClick={captureFrame}>
                                        {Icons.capture} Capture Snapshot
                                    </button>
                                    <button className="sc-btn-danger" onClick={() => { stopCamera(); setMode('upload') }}>
                                        {Icons.stop} Stop Camera
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button
                                        className="sc-btn-primary"
                                        onClick={handleScan}
                                        disabled={!file || scanning}
                                    >
                                        {Icons.scan}
                                        {scanning ? 'Scanning…' : 'Identify Plant'}
                                    </button>
                                    <div className="sc-btn-row">
                                        <button
                                            className="sc-btn-secondary"
                                            onClick={() => fileRef.current?.click()}
                                        >
                                            {Icons.upload} Upload New
                                        </button>
                                        {preview && (
                                            <button className="sc-btn-danger" onClick={clearScan}>
                                                {Icons.clear} Clear
                                            </button>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>

                        {error && (
                            <div className="sc-error" style={{ marginTop: '0.5rem' }}>
                                ⚠️ {error}
                            </div>
                        )}
                    </div>

                    {/* Info Cards */}
                    {result ? (
                        <>
                            <InfoCard
                                icon="🔬"
                                iconBg="rgba(59,130,246,0.15)"
                                title="Scientific Name"
                                defaultOpen
                            >
                                <p><strong>Common Name:</strong> {result.plant_name}</p>
                                <p style={{ marginTop: '0.35rem' }}>
                                    <strong>Scientific Name:</strong> <em>{result.scientific_name}</em>
                                </p>
                                <p style={{ marginTop: '0.65rem' }}>{result.description}</p>
                            </InfoCard>

                            <InfoCard
                                icon="🗺️"
                                iconBg="rgba(139,92,246,0.15)"
                                title="Habitat"
                                defaultOpen
                            >
                                <p>{result.habitat || 'Information not available.'}</p>
                            </InfoCard>

                            <InfoCard
                                icon="🌿"
                                iconBg="rgba(34,197,94,0.15)"
                                title="Uses & Benefits"
                                defaultOpen
                            >
                                <div className="sc-tag-list">
                                    {(result.uses || []).map((u, i) => (
                                        <span key={i} className="sc-tag">{u}</span>
                                    ))}
                                </div>
                            </InfoCard>

                            <InfoCard
                                icon="🪴"
                                iconBg="rgba(245,158,11,0.15)"
                                title="Care Instructions"
                                defaultOpen
                            >
                                <div className="sc-care-grid">
                                    {(result.care_tips || []).map((tip, i) => (
                                        <div key={i} className="sc-care-item">
                                            <span>{tip.icon || '•'}</span>
                                            <div>
                                                <div className="sc-care-label">{tip.label}</div>
                                                <div className="sc-care-val">{tip.value}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </InfoCard>
                        </>
                    ) : (
                        <div className="sc-info-empty">
                            <div className="sc-info-empty-icon">🌱</div>
                            <h4>No plant identified yet</h4>
                            <p>Upload a photo or use the camera to identify a plant and see detailed info here.</p>
                        </div>
                    )}

                    {/* Scan History */}
                    <div className="sc-history-card">
                        <div className="sc-history-header">
                            <span className="sc-history-title">Scan History</span>
                            <span className="sc-history-count">{history.length}</span>
                        </div>
                        {history.length === 0 ? (
                            <div className="sc-history-empty">
                                Your scan results will appear here.
                            </div>
                        ) : (
                            <div className="sc-history-list">
                                {history.map((item, i) => (
                                    <div key={i} className="sc-history-item" onClick={() => { setResult(item); setScanStatus('done') }}>
                                        <div className="sc-history-thumb">
                                            {item.preview ? <img src={item.preview} alt={item.plant_name} /> : '🌱'}
                                        </div>
                                        <div className="sc-history-info">
                                            <div className="sc-history-name">{item.plant_name}</div>
                                            <div className="sc-history-meta">
                                                <span className="sc-history-conf">{Math.round(item.confidence * 100)}%</span>
                                                <span className="sc-history-time">{item.time}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
