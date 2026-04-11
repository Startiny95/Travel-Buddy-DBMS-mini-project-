"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";

const TRANSPORT_OPTIONS = [
    {
        id: "train",
        icon: "🚆",
        label: "Train",
        color: "#3b82f6",
        glow: "rgba(59,130,246,0.2)",
        getUrl: (from, to) =>
            `https://www.irctc.co.in/nget/train-search?fromStation=${encodeURIComponent(from)}&toStation=${encodeURIComponent(to)}`,
        desc: "Book on IRCTC",
    },
    {
        id: "bus",
        icon: "🚌",
        label: "Bus",
        color: "#10b981",
        glow: "rgba(16,185,129,0.2)",
        getUrl: (from, to) =>
            `https://www.redbus.in/bus-tickets/${encodeURIComponent(from.toLowerCase())}-to-${encodeURIComponent(to.toLowerCase())}`,
        desc: "Book on RedBus",
    },
    {
        id: "chalo",
        icon: "🚍",
        label: "City Bus",
        color: "#f59e0b",
        glow: "rgba(245,158,11,0.2)",
        getUrl: (from, to) =>
            `https://chalo.com/`,
        desc: "Track on Chalo",
    },
    {
        id: "drive",
        icon: "🚗",
        label: "Drive",
        color: "#8b5cf6",
        glow: "rgba(139,92,246,0.2)",
        getUrl: (from, to) =>
            `https://www.google.com/maps/dir/${encodeURIComponent(from)}/${encodeURIComponent(to)}`,
        desc: "View on Google Maps",
    },
    {
        id: "ola",
        icon: "🛺",
        label: "Ola Cab",
        color: "#ec4899",
        glow: "rgba(236,72,153,0.2)",
        getUrl: (from, to) =>
            `https://book.olacabs.com/?utm_source=widget&serviceType=p2p&pickup_name=${encodeURIComponent(from)}&drop_name=${encodeURIComponent(to)}`,
        desc: "Book on Ola",
    },
    {
        id: "uber",
        icon: "🚖",
        label: "Uber",
        color: "#06b6d4",
        glow: "rgba(6,182,212,0.2)",
        getUrl: (from, to) =>
            `https://m.uber.com/ul/?action=setPickup&pickup=my_location&dropoff[formatted_address]=${encodeURIComponent(to)}`,
        desc: "Book on Uber",
    },
];

// Decide which transport options make sense based on distance
function getRelevantTransport(distanceKm) {
    if (distanceKm > 150) {
        // Long distance — train, bus, drive
        return ["train", "bus", "drive"];
    } else if (distanceKm > 30) {
        // Medium — bus, drive, ola, uber
        return ["bus", "drive", "ola", "uber"];
    } else {
        // Short/city — city bus, drive, ola, uber
        return ["chalo", "drive", "ola", "uber"];
    }
}

function formatDuration(seconds) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h > 0) return `${h}h ${m}m`;
    return `${m} mins`;
}

function formatDistance(meters) {
    const km = (meters / 1000).toFixed(1);
    return `${km} km`;
}

export default function PlanTripPage() {
    const [source, setSource] = useState("");
    const [destination, setDestination] = useState("");
    const [midpoint, setMidpoint] = useState("");
    const [useMultiLeg, setUseMultiLeg] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [results, setResults] = useState(null);

    // Autocomplete state
    const [sourceSuggestions, setSourceSuggestions] = useState([]);
    const [destSuggestions, setDestSuggestions] = useState([]);
    const [midSuggestions, setMidSuggestions] = useState([]);
    const sourceTimer = useRef(null);
    const destTimer = useRef(null);
    const midTimer = useRef(null);

    const fetchSuggestions = async (query, setter) => {
        if (query.length < 3) { setter([]); return; }
        try {
            const res = await fetch(`/api/plan/autocomplete?q=${encodeURIComponent(query)}`);
            const data = await res.json();
            setter(data.suggestions || []);
        } catch { setter([]); }
    };

    const handleSourceInput = (val) => {
        setSource(val);
        clearTimeout(sourceTimer.current);
        sourceTimer.current = setTimeout(() => fetchSuggestions(val, setSourceSuggestions), 400);
    };

    const handleDestInput = (val) => {
        setDestination(val);
        clearTimeout(destTimer.current);
        destTimer.current = setTimeout(() => fetchSuggestions(val, setDestSuggestions), 400);
    };

    const handleMidInput = (val) => {
        setMidpoint(val);
        clearTimeout(midTimer.current);
        midTimer.current = setTimeout(() => fetchSuggestions(val, setMidSuggestions), 400);
    };

    const handleSearch = async () => {
        if (!source.trim() || !destination.trim()) {
            setError("Please enter both source and destination.");
            return;
        }
        setError("");
        setLoading(true);
        setResults(null);

        try {
            const body = { source, destination };
            if (useMultiLeg && midpoint.trim()) body.midpoint = midpoint;

            const res = await fetch("/api/plan/route", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to get route.");
            setResults(data);
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cabinet+Grotesk:wght@700;800;900&family=Outfit:wght@300;400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #080b12; font-family: 'Outfit', sans-serif; color: #e2e8f0; }

        .page { min-height: 100vh; background: #080b12; }

        .navbar {
          display: flex; align-items: center; justify-content: space-between;
          padding: 16px 40px;
          background: rgba(8,11,18,0.9);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(255,255,255,0.05);
          position: sticky; top: 0; z-index: 100;
        }

        .nav-brand { display: flex; align-items: center; gap: 10px; text-decoration: none; }
        .nav-logo {
          width: 34px; height: 34px;
          background: linear-gradient(135deg, #3b82f6, #10b981);
          border-radius: 9px;
          display: flex; align-items: center; justify-content: center;
          font-size: 16px;
        }
        .nav-title { font-family: 'Cabinet Grotesk', sans-serif; font-size: 17px; font-weight: 800; color: #f1f5f9; }

        .back-btn {
          display: flex; align-items: center; gap: 6px;
          font-size: 13px; color: rgba(200,210,230,0.45);
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 8px; padding: 7px 14px;
          text-decoration: none; cursor: pointer;
          transition: all 0.2s; font-family: 'Outfit', sans-serif;
        }
        .back-btn:hover { color: #e2e8f0; background: rgba(255,255,255,0.07); }

        .main {
          max-width: 780px; margin: 0 auto;
          padding: 52px 32px 80px;
        }

        .page-header { margin-bottom: 40px; animation: fadeUp 0.5s ease both; }
        .page-tag {
          font-size: 11px; font-weight: 500; letter-spacing: 0.12em;
          text-transform: uppercase; color: rgba(59,130,246,0.7);
          margin-bottom: 10px;
        }
        .page-title {
          font-family: 'Cabinet Grotesk', sans-serif;
          font-size: clamp(28px, 4vw, 42px);
          font-weight: 900; color: #f1f5f9;
          line-height: 1.1; letter-spacing: -0.5px;
          margin-bottom: 10px;
        }
        .page-sub { font-size: 14px; color: rgba(200,210,230,0.35); font-weight: 300; }

        /* Search card */
        .search-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 20px;
          padding: 32px;
          margin-bottom: 32px;
          animation: fadeUp 0.5s ease 0.1s both;
        }

        .input-row {
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          gap: 12px;
          align-items: center;
          margin-bottom: 16px;
        }

        .swap-icon {
          width: 36px; height: 36px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 14px; cursor: pointer;
          transition: all 0.2s; flex-shrink: 0;
        }
        .swap-icon:hover { background: rgba(255,255,255,0.1); transform: rotate(180deg); }

        .input-wrap { position: relative; }

        .input-label {
          font-size: 10px; font-weight: 500; letter-spacing: 0.1em;
          text-transform: uppercase; color: rgba(200,210,230,0.3);
          margin-bottom: 7px;
        }

        .input-field {
          width: 100%;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px;
          padding: 13px 16px;
          color: #e8e0ff;
          font-family: 'Outfit', sans-serif;
          font-size: 14px; font-weight: 400;
          outline: none;
          transition: border-color 0.2s, background 0.2s;
        }
        .input-field::placeholder { color: rgba(200,190,230,0.2); }
        .input-field:focus {
          border-color: rgba(59,130,246,0.45);
          background: rgba(59,130,246,0.05);
        }

        .suggestions {
          position: absolute; top: calc(100% + 6px); left: 0; right: 0;
          background: #12151f;
          border: 1px solid rgba(255,255,255,0.09);
          border-radius: 12px;
          overflow: hidden;
          z-index: 50;
          box-shadow: 0 12px 32px rgba(0,0,0,0.4);
        }

        .suggestion-item {
          padding: 11px 16px;
          font-size: 13px; color: rgba(220,215,240,0.7);
          cursor: pointer;
          transition: background 0.15s;
          display: flex; align-items: center; gap: 8px;
        }
        .suggestion-item:hover { background: rgba(59,130,246,0.1); color: #e2e8f0; }

        .multileg-toggle {
          display: flex; align-items: center; gap: 10px;
          margin-bottom: 16px;
          cursor: pointer;
          width: fit-content;
        }

        .toggle-switch {
          width: 36px; height: 20px;
          background: rgba(255,255,255,0.08);
          border-radius: 20px;
          position: relative;
          transition: background 0.2s;
          flex-shrink: 0;
        }
        .toggle-switch.on { background: #3b82f6; }
        .toggle-switch::after {
          content: '';
          position: absolute;
          width: 14px; height: 14px;
          background: #fff;
          border-radius: 50%;
          top: 3px; left: 3px;
          transition: transform 0.2s;
        }
        .toggle-switch.on::after { transform: translateX(16px); }
        .toggle-label { font-size: 13px; color: rgba(200,210,230,0.45); }

        .midpoint-row { margin-bottom: 16px; animation: fadeUp 0.3s ease both; }

        .search-btn {
          width: 100%;
          padding: 15px;
          background: linear-gradient(135deg, #3b82f6, #10b981);
          border: none; border-radius: 12px;
          color: #fff;
          font-family: 'Cabinet Grotesk', sans-serif;
          font-size: 16px; font-weight: 800;
          cursor: pointer;
          transition: opacity 0.2s, transform 0.15s;
          letter-spacing: 0.2px;
        }
        .search-btn:hover:not(:disabled) { opacity: 0.88; transform: translateY(-1px); }
        .search-btn:disabled { opacity: 0.45; cursor: not-allowed; }

        .error-msg {
          margin-top: 12px;
          padding: 10px 14px;
          background: rgba(239,68,68,0.1);
          border: 1px solid rgba(239,68,68,0.2);
          border-radius: 8px;
          font-size: 13px; color: #fca5a5;
          text-align: center;
        }

        /* Results */
        .results { animation: fadeUp 0.5s ease both; }

        .leg {
          margin-bottom: 28px;
        }

        .leg-header {
          display: flex; align-items: center; gap: 12px;
          margin-bottom: 16px;
        }

        .leg-badge {
          width: 28px; height: 28px;
          background: linear-gradient(135deg, #3b82f6, #10b981);
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 11px; font-weight: 700; color: #fff;
          flex-shrink: 0;
        }

        .leg-route {
          font-family: 'Cabinet Grotesk', sans-serif;
          font-size: 17px; font-weight: 800; color: #f1f5f9;
        }

        .leg-meta {
          margin-left: auto;
          display: flex; gap: 12px;
          font-size: 12px; color: rgba(200,210,230,0.35);
        }

        .leg-meta span {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 6px;
          padding: 3px 10px;
        }

        .transport-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 12px;
        }

        .transport-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 14px;
          padding: 18px;
          text-decoration: none;
          display: block;
          transition: all 0.22s;
          cursor: pointer;
          position: relative;
          overflow: hidden;
        }

        .transport-card:hover {
          transform: translateY(-3px);
        }

        .t-icon {
          font-size: 26px; margin-bottom: 12px;
          display: block;
        }

        .t-label {
          font-family: 'Cabinet Grotesk', sans-serif;
          font-size: 15px; font-weight: 800; color: #f1f5f9;
          margin-bottom: 3px;
        }

        .t-desc {
          font-size: 11px; color: rgba(200,210,230,0.35);
          margin-bottom: 10px;
        }

        .t-cta {
          font-size: 11px; font-weight: 500;
          display: inline-flex; align-items: center; gap: 4px;
          padding: 4px 10px;
          border-radius: 6px;
          transition: opacity 0.2s;
        }

        .divider {
          height: 1px;
          background: rgba(255,255,255,0.05);
          margin: 24px 0;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 600px) {
          .input-row { grid-template-columns: 1fr; }
          .swap-icon { display: none; }
          .navbar { padding: 14px 20px; }
          .main { padding: 32px 20px 60px; }
        }
      `}</style>

            <div className="page">
                <nav className="navbar">
                    <Link href="/home" className="nav-brand">
                        <div className="nav-logo">🧭</div>
                        <span className="nav-title">Wandr</span>
                    </Link>
                    <Link href="/home" className="back-btn">← Back to Dashboard</Link>
                </nav>

                <main className="main">
                    <div className="page-header">
                        <p className="page-tag">✦ Trip Planner</p>
                        <h1 className="page-title">Plan your journey.</h1>
                        <p className="page-sub">Enter your source and destination — we'll show you every way to get there.</p>
                    </div>

                    <div className="search-card">
                        <div className="input-row">
                            {/* Source */}
                            <div>
                                <div className="input-label">From</div>
                                <div className="input-wrap">
                                    <input
                                        className="input-field"
                                        placeholder="e.g. Mumbai"
                                        value={source}
                                        onChange={e => handleSourceInput(e.target.value)}
                                    />
                                    {sourceSuggestions.length > 0 && (
                                        <div className="suggestions">
                                            {sourceSuggestions.map((s, i) => (
                                                <div key={i} className="suggestion-item" onClick={() => { setSource(s); setSourceSuggestions([]); }}>
                                                    📍 {s}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Swap */}
                            <div>
                                <div style={{ height: "22px" }} />
                                <div className="swap-icon" onClick={() => { const t = source; setSource(destination); setDestination(t); }}>⇄</div>
                            </div>

                            {/* Destination */}
                            <div>
                                <div className="input-label">To</div>
                                <div className="input-wrap">
                                    <input
                                        className="input-field"
                                        placeholder="e.g. Pune"
                                        value={destination}
                                        onChange={e => handleDestInput(e.target.value)}
                                    />
                                    {destSuggestions.length > 0 && (
                                        <div className="suggestions">
                                            {destSuggestions.map((s, i) => (
                                                <div key={i} className="suggestion-item" onClick={() => { setDestination(s); setDestSuggestions([]); }}>
                                                    📍 {s}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Multi-leg toggle */}
                        <div className="multileg-toggle" onClick={() => setUseMultiLeg(!useMultiLeg)}>
                            <div className={`toggle-switch ${useMultiLeg ? "on" : ""}`} />
                            <span className="toggle-label">Add a stop in between (multi-leg journey)</span>
                        </div>

                        {/* Midpoint input */}
                        {useMultiLeg && (
                            <div className="midpoint-row">
                                <div className="input-label">Stop / Midpoint</div>
                                <div className="input-wrap">
                                    <input
                                        className="input-field"
                                        placeholder="e.g. Pune station, then final destination"
                                        value={midpoint}
                                        onChange={e => handleMidInput(e.target.value)}
                                    />
                                    {midSuggestions.length > 0 && (
                                        <div className="suggestions">
                                            {midSuggestions.map((s, i) => (
                                                <div key={i} className="suggestion-item" onClick={() => { setMidpoint(s); setMidSuggestions([]); }}>
                                                    📍 {s}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        <button className="search-btn" onClick={handleSearch} disabled={loading}>
                            {loading ? "Finding routes..." : "Find Routes →"}
                        </button>

                        {error && <div className="error-msg">{error}</div>}
                    </div>

                    {/* Results */}
                    {results && (
                        <div className="results">
                            {results.legs.map((leg, i) => {
                                const relevant = getRelevantTransport(leg.distanceMeters / 1000);
                                const options = TRANSPORT_OPTIONS.filter(t => relevant.includes(t.id));
                                return (
                                    <div key={i} className="leg">
                                        <div className="leg-header">
                                            <div className="leg-badge">{i + 1}</div>
                                            <div className="leg-route">{leg.from} → {leg.to}</div>
                                            <div className="leg-meta">
                                                <span>📏 {formatDistance(leg.distanceMeters)}</span>
                                                <span>⏱ {formatDuration(leg.durationSeconds)}</span>
                                            </div>
                                        </div>

                                        <div className="transport-grid">
                                            {options.map((t) => (
                                                <a
                                                    key={t.id}
                                                    href={t.getUrl(leg.from, leg.to)}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="transport-card"
                                                    style={{ borderColor: `${t.color}22` }}
                                                    onMouseEnter={e => {
                                                        e.currentTarget.style.borderColor = `${t.color}55`;
                                                        e.currentTarget.style.boxShadow = `0 8px 28px ${t.glow}`;
                                                    }}
                                                    onMouseLeave={e => {
                                                        e.currentTarget.style.borderColor = `${t.color}22`;
                                                        e.currentTarget.style.boxShadow = "none";
                                                    }}
                                                >
                                                    <span className="t-icon">{t.icon}</span>
                                                    <div className="t-label">{t.label}</div>
                                                    <div className="t-desc">{t.desc}</div>
                                                    <span className="t-cta" style={{ background: `${t.color}18`, color: t.color }}>
                                                        Open ↗
                                                    </span>
                                                </a>
                                            ))}
                                        </div>

                                        {i < results.legs.length - 1 && <div className="divider" />}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </main>
            </div>
        </>
    );
}