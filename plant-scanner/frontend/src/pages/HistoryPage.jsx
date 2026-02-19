import { useEffect, useState } from 'react'
import { getHistory } from '../api/client'
import { useNavigate } from 'react-router-dom'

export default function HistoryPage() {
    const [history, setHistory] = useState([])
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()

    useEffect(() => {
        getHistory()
            .then((res) => setHistory(res.data))
            .catch(console.error)
            .finally(() => setLoading(false))
    }, [])

    return (
        <div className="history-page">
            <header className="app-header">
                <span className="logo">🌿 KnowYourPlant</span>
                <button onClick={() => navigate('/scan')} className="btn-ghost">← Back to Scanner</button>
            </header>

            <main className="history-main">
                <h2>Your Scan History</h2>

                {loading && <p className="loading-text">Loading…</p>}

                {!loading && history.length === 0 && (
                    <div className="empty-state">
                        <span>🌱</span>
                        <p>No scans yet. Go identify a plant!</p>
                        <button onClick={() => navigate('/scan')} className="btn-primary">
                            Scan a Plant
                        </button>
                    </div>
                )}

                <div className="history-grid">
                    {history.map((item) => (
                        <div key={item.id} className="history-card">
                            <div className="history-card-header">
                                <h3>{item.plant_name}</h3>
                                <span className={`confidence ${item.confidence > 0.9 ? 'high' : 'medium'}`}>
                                    {Math.round(item.confidence * 100)}%
                                </span>
                            </div>
                            <p className="history-date">
                                {new Date(item.scanned_at).toLocaleDateString('en-IN', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                })}
                            </p>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    )
}
