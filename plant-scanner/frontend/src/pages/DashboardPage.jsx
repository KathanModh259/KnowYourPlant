import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/* ─── Mock Data ──────────────────────────────────────────────────────────────── */
const MOCK_SCANS = [
    { id: 1, name: 'Monstera Deliciosa', sci: 'Monstera deliciosa', conf: 94, date: '2026-02-18', type: 'Image', toxic: true, emoji: '🌿', tags: ['Tropical', 'Houseplant'] },
    { id: 2, name: 'Peace Lily', sci: 'Spathiphyllum wallisii', conf: 88, date: '2026-02-17', type: 'Live', toxic: true, emoji: '🌸', tags: ['Flowering', 'Indoor'] },
    { id: 3, name: 'Snake Plant', sci: 'Sansevieria trifasciata', conf: 97, date: '2026-02-17', type: 'Image', toxic: false, emoji: '🪴', tags: ['Succulent', 'Air Purifier'] },
    { id: 4, name: 'Fiddle Leaf Fig', sci: 'Ficus lyrata', conf: 82, date: '2026-02-16', type: 'Image', toxic: true, emoji: '🌳', tags: ['Tropical', 'Statement'] },
    { id: 5, name: 'Pothos', sci: 'Epipremnum aureum', conf: 91, date: '2026-02-15', type: 'Live', toxic: true, emoji: '🍃', tags: ['Trailing', 'Easy Care'] },
    { id: 6, name: 'Aloe Vera', sci: 'Aloe barbadensis miller', conf: 99, date: '2026-02-14', type: 'Image', toxic: false, emoji: '🌵', tags: ['Succulent', 'Medicinal'] },
    { id: 7, name: 'ZZ Plant', sci: 'Zamioculcas zamiifolia', conf: 85, date: '2026-02-13', type: 'Image', toxic: true, emoji: '🌱', tags: ['Low Light', 'Drought Tolerant'] },
    { id: 8, name: 'Bird of Paradise', sci: 'Strelitzia reginae', conf: 78, date: '2026-02-12', type: 'Live', toxic: false, emoji: '🌺', tags: ['Tropical', 'Flowering'] },
    { id: 9, name: 'Rubber Plant', sci: 'Ficus elastica', conf: 90, date: '2026-02-11', type: 'Image', toxic: true, emoji: '🌿', tags: ['Tropical', 'Bold Leaves'] },
]

/* ─── Sidebar Nav ────────────────────────────────────────────────────────────── */
const NAV_ITEMS = [
    { id: 'dashboard', icon: GridIcon, label: 'Dashboard' },
    { id: 'history', icon: ClockIcon, label: 'Scan History' },
    { id: 'favorites', icon: HeartIcon, label: 'Favorites' },
    { id: 'settings', icon: SettingsIcon, label: 'Settings' },
]

function Sidebar({ active, onNav, collapsed, onToggle, onLogout }) {
    return (
        <aside className={`db-sidebar ${collapsed ? 'collapsed' : ''}`}>
            <div className="db-sidebar-top">
                <div className="db-brand">
                    <div className="db-brand-icon">🌿</div>
                    {!collapsed && <span className="db-brand-name">Know<span>Your</span>Plant</span>}
                </div>
                <button className="db-collapse-btn" onClick={onToggle} title="Toggle sidebar">
                    {collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
                </button>
            </div>

            <nav className="db-nav">
                {NAV_ITEMS.map(({ id, icon: Icon, label }) => (
                    <button
                        key={id}
                        className={`db-nav-item ${active === id ? 'active' : ''}`}
                        onClick={() => onNav(id)}
                        title={collapsed ? label : undefined}
                    >
                        <Icon />
                        {!collapsed && <span>{label}</span>}
                        {active === id && !collapsed && <div className="db-nav-indicator" />}
                    </button>
                ))}
            </nav>

            <div className="db-sidebar-bottom">
                <button className="db-nav-item db-logout" onClick={onLogout} title={collapsed ? 'Logout' : undefined}>
                    <LogoutIcon />
                    {!collapsed && <span>Logout</span>}
                </button>
            </div>
        </aside>
    )
}

/* ─── Scan Card ──────────────────────────────────────────────────────────────── */
function ScanCard({ scan, onFav, isFav }) {
    const confColor = scan.conf >= 90 ? 'high' : scan.conf >= 75 ? 'med' : 'low'
    return (
        <div className="db-card">
            {/* Thumbnail */}
            <div className="db-card-thumb">
                <div className="db-card-emoji">{scan.emoji}</div>
                <div className={`db-scan-type ${scan.type === 'Live' ? 'live' : ''}`}>
                    {scan.type === 'Live' ? <><span className="db-live-dot" />Live</> : <>📷 Image</>}
                </div>
                {scan.toxic && <div className="db-toxic-badge">⚠️ Toxic</div>}
                <button
                    className={`db-fav-btn ${isFav ? 'active' : ''}`}
                    onClick={() => onFav(scan.id)}
                    title={isFav ? 'Remove favourite' : 'Add to favourites'}
                >
                    <HeartIcon filled={isFav} />
                </button>
            </div>

            {/* Info */}
            <div className="db-card-body">
                <div className="db-card-header-row">
                    <div>
                        <h3 className="db-card-name">{scan.name}</h3>
                        <p className="db-card-sci">{scan.sci}</p>
                    </div>
                    <div className={`db-conf-pill ${confColor}`}>{scan.conf}%</div>
                </div>

                <div className="db-conf-bar-wrap">
                    <div className="db-conf-bar" style={{ width: `${scan.conf}%` }} />
                </div>

                <div className="db-card-tags">
                    {scan.tags.map(t => <span key={t} className="db-tag">{t}</span>)}
                </div>

                <div className="db-card-footer">
                    <span className="db-card-date">
                        <CalendarIcon />
                        {new Date(scan.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                    <button className="db-view-btn">View Details →</button>
                </div>
            </div>
        </div>
    )
}

/* ─── Stats Bar ──────────────────────────────────────────────────────────────── */
function StatsBar({ scans }) {
    const total = scans.length
    const avgConf = Math.round(scans.reduce((a, s) => a + s.conf, 0) / total)
    const live = scans.filter(s => s.type === 'Live').length
    const toxic = scans.filter(s => s.toxic).length
    return (
        <div className="db-stats">
            {[
                { icon: '🌿', val: total, label: 'Total Scans' },
                { icon: '🎯', val: `${avgConf}%`, label: 'Avg Confidence' },
                { icon: '📷', val: live, label: 'Live Scans' },
                { icon: '⚠️', val: toxic, label: 'Toxic Found' },
            ].map(s => (
                <div key={s.label} className="db-stat-card">
                    <span className="db-stat-icon">{s.icon}</span>
                    <div>
                        <div className="db-stat-val">{s.val}</div>
                        <div className="db-stat-label">{s.label}</div>
                    </div>
                </div>
            ))}
        </div>
    )
}

/* ─── Main Dashboard ─────────────────────────────────────────────────────────── */
export default function DashboardPage() {
    const [activeNav, setActiveNav] = useState('dashboard')
    const [collapsed, setCollapsed] = useState(false)

    const [search, setSearch] = useState('')
    const [filter, setFilter] = useState('all')   // all | image | live
    const [sortBy, setSortBy] = useState('date')  // date | conf | name
    const [favs, setFavs] = useState(new Set())
    const [mobileNav, setMobileNav] = useState(false)
    const { user, logout } = useAuth()
    const navigate = useNavigate()

    const toggleFav = (id) => setFavs(prev => {
        const next = new Set(prev)
        next.has(id) ? next.delete(id) : next.add(id)
        return next
    })

    const handleLogout = () => { logout(); navigate('/') }

    // Filtered + sorted scans
    const displayScans = useMemo(() => {
        let list = activeNav === 'favorites'
            ? MOCK_SCANS.filter(s => favs.has(s.id))
            : MOCK_SCANS

        if (filter === 'image') list = list.filter(s => s.type === 'Image')
        if (filter === 'live') list = list.filter(s => s.type === 'Live')
        if (search) list = list.filter(s =>
            s.name.toLowerCase().includes(search.toLowerCase()) ||
            s.sci.toLowerCase().includes(search.toLowerCase())
        )
        if (sortBy === 'conf') list = [...list].sort((a, b) => b.conf - a.conf)
        if (sortBy === 'name') list = [...list].sort((a, b) => a.name.localeCompare(b.name))
        if (sortBy === 'date') list = [...list].sort((a, b) => new Date(b.date) - new Date(a.date))
        return list
    }, [search, filter, sortBy, activeNav, favs])

    const pageTitle = { dashboard: 'Dashboard', history: 'Scan History', favorites: 'Favourites', settings: 'Settings' }[activeNav]

    return (
        <div className={`db-root ${mobileNav ? 'mobile-nav-open' : ''}`}>
            {/* Mobile overlay */}
            {mobileNav && <div className="db-mobile-overlay" onClick={() => setMobileNav(false)} />}

            {/* Sidebar */}
            <Sidebar
                active={activeNav}
                onNav={id => { setActiveNav(id); setMobileNav(false) }}
                collapsed={collapsed}
                onToggle={() => setCollapsed(c => !c)}
                onLogout={handleLogout}
            />

            {/* Main */}
            <div className="db-main">
                {/* Top bar */}
                <header className="db-topbar">
                    <div className="db-topbar-left">
                        <button className="db-mobile-menu-btn" onClick={() => setMobileNav(m => !m)}>
                            <MenuIcon />
                        </button>
                        <div>
                            <h1 className="db-page-title">{pageTitle}</h1>
                            <p className="db-page-sub">
                                {activeNav === 'dashboard' && `Welcome back, ${user?.username || 'Plant Lover'} 👋`}
                                {activeNav === 'history' && `${displayScans.length} scans found`}
                                {activeNav === 'favorites' && `${favs.size} saved plants`}
                                {activeNav === 'settings' && 'Manage your account'}
                            </p>
                        </div>
                    </div>

                    <div className="db-topbar-right">
                        {/* Search */}
                        <div className="db-search-wrap">
                            <SearchIcon />
                            <input
                                className="db-search"
                                placeholder="Search plants…"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                            {search && (
                                <button className="db-search-clear" onClick={() => setSearch('')}>✕</button>
                            )}
                        </div>



                        {/* New Scan */}
                        <button className="db-new-scan-btn" onClick={() => navigate('/scan')}>
                            <PlusIcon /> New Scan
                        </button>

                        {/* Avatar */}
                        <div className="db-avatar" title={user?.username}>
                            {user?.username?.[0]?.toUpperCase() || 'U'}
                        </div>
                    </div>
                </header>

                {/* Content */}
                <div className="db-content">
                    {activeNav === 'settings' ? (
                        <SettingsPanel user={user} />
                    ) : (
                        <>
                            {/* Stats */}
                            {activeNav === 'dashboard' && <StatsBar scans={MOCK_SCANS} />}

                            {/* Filters */}
                            <div className="db-toolbar">
                                <div className="db-filter-tabs">
                                    {['all', 'image', 'live'].map(f => (
                                        <button
                                            key={f}
                                            className={`db-filter-tab ${filter === f ? 'active' : ''}`}
                                            onClick={() => setFilter(f)}
                                        >
                                            {f === 'all' ? 'All Scans' : f === 'image' ? '📷 Image' : '🎥 Live'}
                                        </button>
                                    ))}
                                </div>
                                <div className="db-sort-wrap">
                                    <label className="db-sort-label">Sort by</label>
                                    <select className="db-sort-select" value={sortBy} onChange={e => setSortBy(e.target.value)}>
                                        <option value="date">Date</option>
                                        <option value="conf">Confidence</option>
                                        <option value="name">Name</option>
                                    </select>
                                </div>
                            </div>

                            {/* Grid */}
                            {displayScans.length > 0 ? (
                                <div className="db-grid">
                                    {displayScans.map(scan => (
                                        <ScanCard
                                            key={scan.id}
                                            scan={scan}
                                            onFav={toggleFav}
                                            isFav={favs.has(scan.id)}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="db-empty">
                                    <div className="db-empty-icon">🌱</div>
                                    <h3>No plants found</h3>
                                    <p>{search ? `No results for "${search}"` : 'Start scanning to build your collection.'}</p>
                                    <button className="db-empty-cta" onClick={() => navigate('/scan')}>
                                        + Scan a Plant
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}

/* ─── Settings Panel ─────────────────────────────────────────────────────────── */
function SettingsPanel({ user }) {
    return (
        <div className="db-settings">
            <div className="db-settings-card">
                <h3>Profile</h3>
                <div className="db-settings-row">
                    <div className="db-settings-avatar">{user?.username?.[0]?.toUpperCase() || 'U'}</div>
                    <div>
                        <div className="db-settings-name">{user?.username || 'Plant Lover'}</div>
                        <div className="db-settings-email">{user?.email || 'user@example.com'}</div>
                    </div>
                </div>
            </div>
            <div className="db-settings-card">
                <h3>Preferences</h3>
                <div className="db-settings-item">
                    <span>Email notifications</span>
                    <div className="db-toggle-pill active"><div className="db-toggle-thumb" /></div>
                </div>
                <div className="db-settings-item">
                    <span>Save scan history</span>
                    <div className="db-toggle-pill active"><div className="db-toggle-thumb" /></div>
                </div>
                <div className="db-settings-item">
                    <span>Auto-detect toxic plants</span>
                    <div className="db-toggle-pill"><div className="db-toggle-thumb" /></div>
                </div>
            </div>
        </div>
    )
}

/* ─── Icons ──────────────────────────────────────────────────────────────────── */
function GridIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></svg> }
function ClockIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg> }
function HeartIcon({ filled }) { return <svg width="16" height="16" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" /></svg> }
function SettingsIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" /></svg> }
function LogoutIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" /></svg> }
function SearchIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg> }
function PlusIcon() { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg> }
function CalendarIcon() { return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg> }
function ChevronLeftIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6" /></svg> }
function ChevronRightIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6" /></svg> }
function MenuIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></svg> }
