import Link from "next/link";

export default function Home() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cabinet+Grotesk:wght@400;500;700;800;900&family=Outfit:wght@300;400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          background: #080b12;
          font-family: 'Outfit', sans-serif;
          color: #e2e8f0;
          overflow-x: hidden;
        }

        .landing {
          min-height: 100vh;
          background: #080b12;
          position: relative;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        /* Animated background */
        .bg-layer {
          position: fixed;
          inset: 0;
          z-index: 0;
          pointer-events: none;
        }

        .orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(100px);
          animation: float 12s ease-in-out infinite;
        }

        .orb-1 {
          width: 600px; height: 600px;
          background: radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%);
          top: -150px; left: -100px;
          animation-delay: 0s;
        }

        .orb-2 {
          width: 500px; height: 500px;
          background: radial-gradient(circle, rgba(16,185,129,0.09) 0%, transparent 70%);
          bottom: -100px; right: -80px;
          animation-delay: -4s;
        }

        .orb-3 {
          width: 350px; height: 350px;
          background: radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%);
          top: 40%; left: 50%;
          transform: translate(-50%, -50%);
          animation-delay: -8s;
        }

        @keyframes float {
          0%, 100% { transform: translate(0, 0); }
          33% { transform: translate(20px, -30px); }
          66% { transform: translate(-15px, 20px); }
        }

        /* Grid texture */
        .grid-texture {
          position: fixed;
          inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
          background-size: 56px 56px;
          z-index: 0;
          pointer-events: none;
        }

        /* Navbar */
        .navbar {
          position: relative;
          z-index: 10;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 24px 52px;
        }

        .nav-brand {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .nav-logo {
          width: 38px; height: 38px;
          background: linear-gradient(135deg, #3b82f6, #10b981);
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          font-size: 18px;
          box-shadow: 0 0 20px rgba(59,130,246,0.3);
        }

        .nav-name {
          font-family: 'Cabinet Grotesk', sans-serif;
          font-size: 20px;
          font-weight: 800;
          color: #f1f5f9;
          letter-spacing: -0.3px;
        }

        .nav-tag {
          font-size: 11px;
          color: rgba(200,210,230,0.3);
          font-weight: 300;
          letter-spacing: 0.05em;
        }

        /* Hero */
        .hero {
          position: relative;
          z-index: 5;
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 60px 32px 100px;
        }

        .hero-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 16px;
          border-radius: 30px;
          background: rgba(59,130,246,0.08);
          border: 1px solid rgba(59,130,246,0.2);
          font-size: 12px;
          font-weight: 500;
          color: rgba(147,197,253,0.8);
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin-bottom: 32px;
          animation: fadeUp 0.6s ease both;
        }

        .dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: #3b82f6;
          animation: pulse-dot 2s ease-in-out infinite;
        }

        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.7); }
        }

        .hero-title {
          font-family: 'Cabinet Grotesk', sans-serif;
          font-size: clamp(48px, 8vw, 96px);
          font-weight: 900;
          line-height: 0.95;
          letter-spacing: -3px;
          color: #f1f5f9;
          margin-bottom: 28px;
          animation: fadeUp 0.6s ease 0.1s both;
        }

        .hero-title .line-2 {
          display: block;
          background: linear-gradient(135deg, #3b82f6 0%, #10b981 100%);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        .hero-title .line-3 {
          display: block;
          color: rgba(241,245,249,0.25);
          font-size: 0.7em;
          letter-spacing: -1px;
        }

        .hero-sub {
          max-width: 460px;
          font-size: 16px;
          color: rgba(200,210,230,0.4);
          font-weight: 300;
          line-height: 1.7;
          margin-bottom: 52px;
          animation: fadeUp 0.6s ease 0.2s both;
        }

        .hero-actions {
          animation: fadeUp 0.6s ease 0.3s both;
        }

        /* The original button — preserved exactly, just wrapped nicely */
        .btn-login {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 2px;
          overflow: hidden;
          font-size: 15px;
          font-weight: 600;
          font-family: 'Cabinet Grotesk', sans-serif;
          border-radius: 12px;
          background: linear-gradient(135deg, #06b6d4, #3b82f6);
          border: none;
          cursor: pointer;
          transition: all 0.25s;
          box-shadow: 0 0 32px rgba(59,130,246,0.25);
          letter-spacing: 0.2px;
        }

        .btn-login:hover {
          box-shadow: 0 0 48px rgba(59,130,246,0.45);
          transform: translateY(-2px);
        }

        .btn-login-inner {
          position: relative;
          padding: 14px 40px;
          background: #0d1117;
          border-radius: 10px;
          color: #f1f5f9;
          transition: all 0.2s ease-in;
          font-family: 'Cabinet Grotesk', sans-serif;
          font-size: 15px;
          font-weight: 700;
          letter-spacing: 0.2px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .btn-login:hover .btn-login-inner {
          background: transparent;
          color: #fff;
        }

        /* Feature pills */
        .features {
          position: relative;
          z-index: 5;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          flex-wrap: wrap;
          padding: 0 32px 60px;
          animation: fadeUp 0.6s ease 0.4s both;
        }

        .feature-pill {
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 8px 16px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 30px;
          font-size: 12px;
          color: rgba(200,210,230,0.4);
          font-weight: 400;
          transition: all 0.2s;
        }

        .feature-pill:hover {
          background: rgba(255,255,255,0.06);
          color: rgba(200,210,230,0.7);
          border-color: rgba(255,255,255,0.1);
        }

        .pill-icon { font-size: 13px; }

        /* Floating cards */
        .float-cards {
          position: fixed;
          inset: 0;
          z-index: 2;
          pointer-events: none;
        }

        .float-card {
          position: absolute;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 14px;
          padding: 14px 18px;
          backdrop-filter: blur(10px);
          animation: floatCard 6s ease-in-out infinite;
        }

        .float-card-1 {
          top: 22%; left: 6%;
          animation-delay: 0s;
        }

        .float-card-2 {
          top: 55%; right: 5%;
          animation-delay: -2s;
        }

        .float-card-3 {
          bottom: 20%; left: 8%;
          animation-delay: -4s;
        }

        @keyframes floatCard {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
        }

        .fc-label {
          font-size: 10px;
          color: rgba(200,210,230,0.25);
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin-bottom: 4px;
          font-weight: 500;
        }

        .fc-value {
          font-family: 'Cabinet Grotesk', sans-serif;
          font-size: 18px;
          font-weight: 800;
          color: #f1f5f9;
        }

        .fc-sub {
          font-size: 11px;
          color: rgba(200,210,230,0.3);
          margin-top: 2px;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 768px) {
          .navbar { padding: 20px 24px; }
          .float-cards { display: none; }
          .hero-title { letter-spacing: -1.5px; }
        }
      `}</style>

      <div className="landing">
        <div className="bg-layer">
          <div className="orb orb-1" />
          <div className="orb orb-2" />
          <div className="orb orb-3" />
        </div>
        <div className="grid-texture" />

        {/* Floating ambient cards */}
        <div className="float-cards">
          <div className="float-card float-card-1">
            <div className="fc-label">Last Trip</div>
            <div className="fc-value">Mumbai → Goa</div>
            <div className="fc-sub">3 days · 12 photos</div>
          </div>
          <div className="float-card float-card-2">
            <div className="fc-label">Distance Travelled</div>
            <div className="fc-value">2,480 km</div>
            <div className="fc-sub">across 8 cities</div>
          </div>
          <div className="float-card float-card-3">
            <div className="fc-label">Next Trip</div>
            <div className="fc-value">Pune → Lonavala</div>
            <div className="fc-sub">Weekend getaway</div>
          </div>
        </div>

        {/* Navbar */}
        <nav className="navbar">
          <div className="nav-brand">
            <div className="nav-logo">🧭</div>
            <div>
              <div className="nav-name">Wandr</div>
            </div>
          </div>
          <span className="nav-tag">Your travel diary</span>
        </nav>

        {/* Hero */}
        <section className="hero">
          <div className="hero-eyebrow">
            <span className="dot" />
            Your personal travel diary
          </div>

          <h1 className="hero-title">
            Every journey
            <span className="line-2">tells a story.</span>
            <span className="line-3">start writing yours.</span>
          </h1>

          <p className="hero-sub">
            Plan trips, relive memories, and track every route you've ever taken — all in one beautifully simple place.
          </p>

          <div className="hero-actions">
            <Link href="/login">
              <button className="btn-login">
                <span className="btn-login-inner">
                  Get Started →
                </span>
              </button>
            </Link>
          </div>
        </section>

        {/* Feature pills */}
        <div className="features">
          {[
            { icon: "🗺️", label: "Trip Planner" },
            { icon: "📍", label: "Memory Timeline" },
            { icon: "🚆", label: "Transport Options" },
            { icon: "📷", label: "Photo Memories" },
            { icon: "📅", label: "Year in Review" },
          ].map((f) => (
            <div className="feature-pill" key={f.label}>
              <span className="pill-icon">{f.icon}</span>
              {f.label}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}