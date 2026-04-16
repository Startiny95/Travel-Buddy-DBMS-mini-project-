"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

const stats = [
  { label: "Trips Taken", value: "0", icon: "✈️" },
  { label: "Cities Visited", value: "0", icon: "🏙️" },
  { label: "Km Travelled", value: "0", icon: "🛣️" },
  { label: "Photos Saved", value: "0", icon: "📷" },
];

const quickActions = [
  {
    icon: "🗺️",
    label: "Plan a Trip",
    desc: "Routes, transport & safety",
    href: "/plan",
    color: "#3b82f6",
    glow: "rgba(59,130,246,0.3)",
  },
  {
    icon: "📍",
    label: "My Trips",
    desc: "View past journeys & memories",
    href: "/trips",
    color: "#10b981",
    glow: "rgba(16,185,129,0.3)",
  },
  {
    icon: "📅",
    label: "Timeline",
    desc: "Your year at a glance",
    href: "/timeline",
    color: "#f59e0b",
    glow: "rgba(245,158,11,0.3)",
  },
  {
  icon: "📍",
  label: "Places Near Me",
  desc: "Explore within 5km radius",
  href: "/nearby",
  color: "#10b981",
  glow: "rgba(16,185,129,0.3)",
 },
];

export default function HomePage() {
  const [userName, setUserName] = useState("Traveller");
  const [greeting, setGreeting] = useState("Good day");
  const [recentTrips, setRecentTrips] = useState([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const name = localStorage.getItem("userName");
    if (name) setUserName(name);

    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 17) setGreeting("Good afternoon");
    else setGreeting("Good evening");

    // Fetch recent trips from API (will return empty until trips are added)
    fetch("/api/trips/recent")
      .then((r) => r.json())
      .then((data) => setRecentTrips(data.trips || []))
      .catch(() => setRecentTrips([]));
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Clash+Display:wght@600;700&family=Cabinet+Grotesk:wght@700;800;900&family=Outfit:wght@300;400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          background: #080b12;
          font-family: 'Outfit', sans-serif;
          color: #e2e8f0;
          min-height: 100vh;
        }

        .dashboard {
          min-height: 100vh;
          background: #080b12;
          position: relative;
          overflow-x: hidden;
        }

        /* Ambient background blobs */
        .bg-blob {
          position: fixed;
          border-radius: 50%;
          filter: blur(120px);
          pointer-events: none;
          z-index: 0;
        }
        .blob-1 {
          width: 500px; height: 500px;
          background: rgba(59,130,246,0.07);
          top: -100px; left: -100px;
        }
        .blob-2 {
          width: 400px; height: 400px;
          background: rgba(16,185,129,0.06);
          bottom: 100px; right: -50px;
        }

        /* Navbar */
        .navbar {
          position: sticky;
          top: 0;
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 40px;
          background: rgba(8,11,18,0.85);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }

        .nav-brand {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .nav-logo {
          width: 36px; height: 36px;
          background: linear-gradient(135deg, #3b82f6, #10b981);
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          font-size: 18px;
        }

        .nav-title {
          font-family: 'Syne', sans-serif;
          font-size: 18px;
          font-weight: 700;
          color: #f1f5f9;
          letter-spacing: -0.3px;
        }

        .nav-right {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .nav-user {
          font-size: 13px;
          color: rgba(200,210,230,0.5);
          font-weight: 300;
        }

        .nav-user strong {
          color: #93c5fd;
          font-weight: 500;
        }

        .signout-btn {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 8px;
          color: rgba(200,210,230,0.5);
          padding: 7px 14px;
          font-size: 12px;
          font-family: 'Outfit', sans-serif;
          cursor: pointer;
          transition: all 0.2s;
        }

        .signout-btn:hover {
          background: rgba(255,255,255,0.08);
          color: #e2e8f0;
        }

        /* Main content */
        .main {
          position: relative;
          z-index: 1;
          max-width: 1100px;
          margin: 0 auto;
          padding: 48px 32px 80px;
        }

        /* Hero greeting */
        .hero {
          margin-bottom: 48px;
          animation: fadeUp 0.6s ease both;
        }

        .hero-greeting {
          font-size: 13px;
          color: rgba(147,197,253,0.7);
          letter-spacing: 0.1em;
          text-transform: uppercase;
          font-weight: 500;
          margin-bottom: 8px;
        }

        .hero-title {
        font-family: 'Cabinet Grotesk', sans-serif;
        font-size: clamp(28px, 4vw, 44px);
        font-weight: 900;
        color: #f1f5f9;
        line-height: 1.15;
        letter-spacing: -0.5px;
        }

        .hero-title span {
          background: linear-gradient(135deg, #3b82f6, #10b981);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        .hero-sub {
          margin-top: 12px;
          font-size: 15px;
          color: rgba(200,210,230,0.4);
          font-weight: 300;
        }

        /* Stats row */
        .stats-row {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-bottom: 48px;
          animation: fadeUp 0.6s ease 0.1s both;
        }

        .stat-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 14px;
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 14px;
          transition: border-color 0.2s;
        }

        .stat-card:hover {
          border-color: rgba(255,255,255,0.12);
        }

        .stat-icon {
          font-size: 24px;
          width: 44px; height: 44px;
          background: rgba(255,255,255,0.04);
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }

        .stat-info {}

        .stat-value {
          font-family: 'Syne', sans-serif;
          font-size: 24px;
          font-weight: 700;
          color: #f1f5f9;
          line-height: 1;
          margin-bottom: 4px;
        }

        .stat-label {
          font-size: 11px;
          color: rgba(200,210,230,0.35);
          text-transform: uppercase;
          letter-spacing: 0.06em;
          font-weight: 500;
        }

        /* Section label */
        .section-label {
          font-family: 'Syne', sans-serif;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: rgba(200,210,230,0.3);
          margin-bottom: 16px;
        }

        /* Quick actions */
        .actions-section {
          margin-bottom: 52px;
          animation: fadeUp 0.6s ease 0.2s both;
        }

        .actions-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
        }

        .action-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 16px;
          padding: 24px 20px;
          cursor: pointer;
          transition: all 0.25s;
          text-decoration: none;
          display: block;
          position: relative;
          overflow: hidden;
        }

        .action-card::before {
          content: '';
          position: absolute;
          inset: 0;
          opacity: 0;
          transition: opacity 0.25s;
          border-radius: 16px;
        }

        .action-card:hover {
          transform: translateY(-3px);
          border-color: rgba(255,255,255,0.12);
        }

        .action-card:hover::before {
          opacity: 1;
        }

        .action-icon-wrap {
          width: 48px; height: 48px;
          border-radius: 13px;
          display: flex; align-items: center; justify-content: center;
          font-size: 22px;
          margin-bottom: 16px;
          position: relative;
          z-index: 1;
        }

        .action-label {
          font-family: 'Syne', sans-serif;
          font-size: 15px;
          font-weight: 700;
          color: #f1f5f9;
          margin-bottom: 5px;
          position: relative;
          z-index: 1;
        }

        .action-desc {
          font-size: 12px;
          color: rgba(200,210,230,0.35);
          font-weight: 300;
          line-height: 1.5;
          position: relative;
          z-index: 1;
        }

        .action-arrow {
          position: absolute;
          bottom: 20px;
          right: 20px;
          font-size: 16px;
          opacity: 0;
          transform: translateX(-6px);
          transition: all 0.2s;
          z-index: 1;
        }

        .action-card:hover .action-arrow {
          opacity: 0.6;
          transform: translateX(0);
        }

        /* Recent trips */
        .trips-section {
          animation: fadeUp 0.6s ease 0.3s both;
        }

        .trips-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        }

        .view-all {
          font-size: 12px;
          color: #3b82f6;
          text-decoration: none;
          font-weight: 500;
          transition: opacity 0.2s;
        }

        .view-all:hover { opacity: 0.7; }

        .trips-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }

        .trip-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 16px;
          overflow: hidden;
          transition: all 0.25s;
          cursor: pointer;
        }

        .trip-card:hover {
          transform: translateY(-3px);
          border-color: rgba(255,255,255,0.1);
        }

        .trip-photo {
          width: 100%;
          height: 140px;
          background: linear-gradient(135deg, #1e293b, #0f172a);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 40px;
          position: relative;
          overflow: hidden;
        }

        .trip-photo img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .trip-info {
          padding: 16px;
        }

        .trip-destination {
          font-family: 'Syne', sans-serif;
          font-size: 15px;
          font-weight: 700;
          color: #f1f5f9;
          margin-bottom: 4px;
        }

        .trip-meta {
          font-size: 11px;
          color: rgba(200,210,230,0.35);
          display: flex;
          gap: 10px;
        }

        .trip-purpose-tag {
          display: inline-block;
          margin-top: 10px;
          padding: 3px 10px;
          border-radius: 20px;
          font-size: 10px;
          font-weight: 500;
          background: rgba(59,130,246,0.12);
          color: #93c5fd;
          border: 1px solid rgba(59,130,246,0.2);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        /* Empty state */
        .empty-state {
          grid-column: 1 / -1;
          text-align: center;
          padding: 52px 20px;
          background: rgba(255,255,255,0.02);
          border: 1px dashed rgba(255,255,255,0.07);
          border-radius: 16px;
        }

        .empty-icon {
          font-size: 40px;
          margin-bottom: 14px;
          opacity: 0.5;
        }

        .empty-title {
          font-family: 'Syne', sans-serif;
          font-size: 16px;
          font-weight: 600;
          color: rgba(200,210,230,0.4);
          margin-bottom: 6px;
        }

        .empty-sub {
          font-size: 13px;
          color: rgba(200,210,230,0.2);
          margin-bottom: 20px;
          font-weight: 300;
        }

        .empty-cta {
          display: inline-block;
          padding: 10px 22px;
          background: linear-gradient(135deg, #3b82f6, #10b981);
          border-radius: 10px;
          color: #fff;
          font-size: 13px;
          font-weight: 500;
          text-decoration: none;
          font-family: 'Outfit', sans-serif;
          transition: opacity 0.2s;
        }

        .empty-cta:hover { opacity: 0.85; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 900px) {
          .stats-row { grid-template-columns: repeat(2, 1fr); }
          .actions-grid { grid-template-columns: repeat(2, 1fr); }
          .trips-grid { grid-template-columns: repeat(2, 1fr); }
          .navbar { padding: 14px 20px; }
          .main { padding: 32px 20px 60px; }
        }

        @media (max-width: 540px) {
          .stats-row { grid-template-columns: repeat(2, 1fr); }
          .actions-grid { grid-template-columns: repeat(2, 1fr); }
          .trips-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="dashboard">
        <div className="bg-blob blob-1" />
        <div className="bg-blob blob-2" />

        {/* Navbar */}
        <nav className="navbar">
          <div className="nav-brand">
            <div className="nav-logo">🧭</div>
            <span className="nav-title">Wandr</span>
          </div>
          <div className="nav-right">
            <span className="nav-user">
              Hey, <strong>{userName}</strong>
            </span>
            <button
              className="signout-btn"
              onClick={() => {
                localStorage.clear();
                window.location.href = "/login";
              }}
            >
              Sign out
            </button>
          </div>
        </nav>

        <main className="main">
          {/* Hero */}
          <div className="hero">
            <p className="hero-greeting">{greeting} ✦</p>
            <h1 className="hero-title">
              Where are you
              <br />
              <span>headed next?</span>
            </h1>
            <p className="hero-sub">
              Your travel memories, routes and stories — all in one place.
            </p>
          </div>

          {/* Stats */}
          <div className="stats-row">
            {stats.map((s) => (
              <div className="stat-card" key={s.label}>
                <div className="stat-icon">{s.icon}</div>
                <div className="stat-info">
                  <div className="stat-value">{s.value}</div>
                  <div className="stat-label">{s.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="actions-section">
            <p className="section-label">Quick Actions</p>
            <div className="actions-grid">
              {quickActions.map((a) => (
                <Link
                  href={a.href}
                  key={a.label}
                  className="action-card"
                  style={{
                    boxShadow: `0 0 0 0 ${a.glow}`,
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.boxShadow = `0 8px 32px ${a.glow}`)
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.boxShadow = `0 0 0 0 ${a.glow}`)
                  }
                >
                  <div
                    className="action-icon-wrap"
                    style={{ background: `${a.color}18` }}
                  >
                    {a.icon}
                  </div>
                  <div className="action-label">{a.label}</div>
                  <div className="action-desc">{a.desc}</div>
                  <span className="action-arrow">→</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Recent Trips */}
          <div className="trips-section">
            <div className="trips-header">
              <p className="section-label" style={{ marginBottom: 0 }}>
                Recent Trips
              </p>
              <Link href="/trips" className="view-all">
                View all →
              </Link>
            </div>

            <div className="trips-grid">
              {recentTrips.length > 0 ? (
                recentTrips.map((trip) => (
                  <div className="trip-card" key={trip.id}>
                    <div className="trip-photo">
                      {trip.photo_url ? (
                        <img src={trip.photo_url} alt={trip.destination} />
                      ) : (
                        "🗺️"
                      )}
                    </div>
                    <div className="trip-info">
                      <div className="trip-destination">{trip.destination}</div>
                      <div className="trip-meta">
                        <span>📍 {trip.source}</span>
                        <span>
                          🗓 {new Date(trip.date).toLocaleDateString()}
                        </span>
                      </div>
                      {trip.purpose && (
                        <span className="trip-purpose-tag">{trip.purpose}</span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <div className="empty-icon">🧳</div>
                  <div className="empty-title">No trips yet</div>
                  <div className="empty-sub">
                    Start by planning your first trip or adding a past one.
                  </div>
                  <Link href="/plan" className="empty-cta">
                    Plan a Trip
                  </Link>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
