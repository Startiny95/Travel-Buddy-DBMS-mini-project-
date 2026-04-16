"use client";
import { useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";

const NearbyMap = dynamic(() => import("@/components/NearbyMap"), {
  ssr: false,
  loading: () => (
    <div style={{
      height: "100%", display: "flex", alignItems: "center",
      justifyContent: "center", background: "#0d0d14",
      color: "#93c5fd", fontFamily: "sans-serif", fontSize: "14px",
      flexDirection: "column", gap: "10px"
    }}>
      <span style={{ fontSize: "28px" }}>🗺️</span>
      Loading map...
    </div>
  ),
});

const CATEGORIES = [
  { id: "all", label: "All", icon: "✦" },
  { id: "restaurant", label: "Food", icon: "🍽️" },
  { id: "cafe", label: "Cafes", icon: "☕" },
  { id: "tourism", label: "Tourist Spots", icon: "🏛️" },
  { id: "park", label: "Parks", icon: "🌿" },
  { id: "hotel", label: "Hotels", icon: "🏨" },
  { id: "hospital", label: "Hospitals", icon: "🏥" },
  { id: "fuel", label: "Petrol", icon: "⛽" },
];

export default function NearbyPage() {
  const [places, setPlaces] = useState([]);
  const [userCoords, setUserCoords] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [radius, setRadius] = useState(5000); // meters

  const fetchPlaces = async (coords, category, rad) => {
    setLoading(true);
    setStatus("Fetching nearby places...");
    setPlaces([]);
    setSelectedPlace(null);

    try {
      const res = await fetch("/api/nearby", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lat: coords.lat, lng: coords.lng, category, radius: rad }),
      });
      const data = await res.json();
      setPlaces(data.places || []);
      setStatus(data.places?.length ? "" : "No places found nearby. Try a different category.");
    } catch {
      setStatus("Failed to fetch places. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLocate = () => {
    setStatus("Requesting your location...");
    setLoading(true);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserCoords(coords);
        fetchPlaces(coords, activeCategory, radius);
      },
      () => {
        setStatus("Location access denied. Please allow location in your browser.");
        setLoading(false);
      },
      { enableHighAccuracy: true }
    );
  };

  const handleCategoryChange = (cat) => {
    setActiveCategory(cat);
    if (userCoords) fetchPlaces(userCoords, cat, radius);
  };

  const handleRadiusChange = (r) => {
    setRadius(r);
    if (userCoords) fetchPlaces(userCoords, activeCategory, r);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cabinet+Grotesk:wght@500;700;800;900&family=Outfit:wght@300;400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #080b12; font-family: 'Outfit', sans-serif; color: #e2e8f0; }

        .page { height: 100vh; display: flex; flex-direction: column; background: #080b12; overflow: hidden; }

        .navbar {
          display: flex; align-items: center; justify-content: space-between;
          padding: 14px 32px;
          background: rgba(8,11,18,0.95);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(255,255,255,0.05);
          flex-shrink: 0;
          z-index: 200;
        }

        .nav-brand { display: flex; align-items: center; gap: 10px; text-decoration: none; }
        .nav-logo {
          width: 32px; height: 32px;
          background: linear-gradient(135deg, #3b82f6, #10b981);
          border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          font-size: 15px;
        }
        .nav-title { font-family: 'Cabinet Grotesk', sans-serif; font-size: 16px; font-weight: 800; color: #f1f5f9; }

        .back-btn {
          font-size: 12px; color: rgba(200,210,230,0.4);
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 8px; padding: 6px 13px;
          text-decoration: none; cursor: pointer;
          transition: all 0.2s; font-family: 'Outfit', sans-serif;
        }
        .back-btn:hover { color: #e2e8f0; background: rgba(255,255,255,0.07); }

        /* Controls bar */
        .controls {
          flex-shrink: 0;
          padding: 14px 32px;
          background: rgba(8,11,18,0.9);
          border-bottom: 1px solid rgba(255,255,255,0.04);
          display: flex;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
          z-index: 100;
        }

        .locate-btn {
          display: flex; align-items: center; gap: 8px;
          padding: 10px 20px;
          background: linear-gradient(135deg, #3b82f6, #10b981);
          border: none; border-radius: 10px;
          color: #fff;
          font-family: 'Cabinet Grotesk', sans-serif;
          font-size: 13px; font-weight: 800;
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
          flex-shrink: 0;
        }
        .locate-btn:hover:not(:disabled) { opacity: 0.85; transform: translateY(-1px); }
        .locate-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .categories {
          display: flex; gap: 8px; flex-wrap: wrap; flex: 1;
        }

        .cat-btn {
          display: flex; align-items: center; gap: 5px;
          padding: 7px 13px;
          border-radius: 20px;
          font-size: 12px; font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          border: 1px solid rgba(255,255,255,0.07);
          background: rgba(255,255,255,0.03);
          color: rgba(200,210,230,0.4);
          font-family: 'Outfit', sans-serif;
          white-space: nowrap;
        }
        .cat-btn.active {
          background: rgba(59,130,246,0.15);
          border-color: rgba(59,130,246,0.4);
          color: #93c5fd;
        }
        .cat-btn:hover:not(.active) {
          background: rgba(255,255,255,0.06);
          color: rgba(200,210,230,0.7);
        }

        .radius-select {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 8px;
          padding: 8px 12px;
          color: rgba(200,210,230,0.5);
          font-family: 'Outfit', sans-serif;
          font-size: 12px;
          outline: none;
          cursor: pointer;
          flex-shrink: 0;
        }
        .radius-select option { background: #1a1825; }

        /* Main layout */
        .main-layout {
          flex: 1;
          display: grid;
          grid-template-columns: 340px 1fr;
          overflow: hidden;
        }

        /* Sidebar */
        .sidebar {
          overflow-y: auto;
          border-right: 1px solid rgba(255,255,255,0.05);
          background: #0a0d14;
        }

        .sidebar::-webkit-scrollbar { width: 4px; }
        .sidebar::-webkit-scrollbar-track { background: transparent; }
        .sidebar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 4px; }

        .sidebar-header {
          padding: 20px 20px 12px;
          position: sticky; top: 0;
          background: #0a0d14;
          border-bottom: 1px solid rgba(255,255,255,0.04);
          z-index: 10;
        }

        .sidebar-title {
          font-family: 'Cabinet Grotesk', sans-serif;
          font-size: 13px; font-weight: 800; color: #f1f5f9;
          margin-bottom: 3px;
        }
        .sidebar-count { font-size: 11px; color: rgba(200,210,230,0.3); }

        .status-msg {
          padding: 40px 20px;
          text-align: center;
          font-size: 13px;
          color: rgba(200,210,230,0.3);
          font-weight: 300;
          line-height: 1.6;
        }

        .status-icon { font-size: 32px; margin-bottom: 12px; display: block; opacity: 0.4; }

        .place-item {
          padding: 14px 20px;
          border-bottom: 1px solid rgba(255,255,255,0.03);
          cursor: pointer;
          transition: background 0.15s;
        }
        .place-item:hover { background: rgba(255,255,255,0.03); }
        .place-item.selected { background: rgba(59,130,246,0.08); border-left: 2px solid #3b82f6; }

        .place-name {
          font-family: 'Cabinet Grotesk', sans-serif;
          font-size: 14px; font-weight: 700; color: #f1f5f9;
          margin-bottom: 4px;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }

        .place-type {
          font-size: 11px; color: rgba(200,210,230,0.3);
          text-transform: capitalize; margin-bottom: 6px;
        }

        .place-meta {
          display: flex; align-items: center; gap: 10px;
        }

        .place-dist {
          font-size: 11px; color: #93c5fd;
          background: rgba(59,130,246,0.1);
          border-radius: 4px; padding: 2px 7px;
        }

        .place-open {
          font-size: 11px;
          padding: 2px 7px;
          border-radius: 4px;
        }
        .place-open.open { color: #6ee7b7; background: rgba(16,185,129,0.1); }
        .place-open.closed { color: #fca5a5; background: rgba(239,68,68,0.1); }

        /* Map container */
        .map-container { position: relative; }

        @media (max-width: 768px) {
          .main-layout { grid-template-columns: 1fr; grid-template-rows: 1fr 300px; }
          .sidebar { border-right: none; border-bottom: 1px solid rgba(255,255,255,0.05); }
          .controls { padding: 10px 16px; }
          .navbar { padding: 12px 16px; }
        }
      `}</style>

      <div className="page">
        {/* Navbar */}
        <nav className="navbar">
          <Link href="/home" className="nav-brand">
            <div className="nav-logo">🧭</div>
            <span className="nav-title">Wandr</span>
          </Link>
          <Link href="/home" className="back-btn">← Dashboard</Link>
        </nav>

        {/* Controls */}
        <div className="controls">
          <button className="locate-btn" onClick={handleLocate} disabled={loading}>
            {loading ? "⏳ Loading..." : "📍 Find Places Near Me"}
          </button>

          <div className="categories">
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                className={`cat-btn ${activeCategory === c.id ? "active" : ""}`}
                onClick={() => handleCategoryChange(c.id)}
              >
                {c.icon} {c.label}
              </button>
            ))}
          </div>

          <select
            className="radius-select"
            value={radius}
            onChange={(e) => handleRadiusChange(Number(e.target.value))}
          >
            <option value={1000}>1 km</option>
            <option value={2000}>2 km</option>
            <option value={5000}>5 km</option>
            <option value={10000}>10 km</option>
          </select>
        </div>

        {/* Main layout */}
        <div className="main-layout">
          {/* Sidebar */}
          <div className="sidebar">
            <div className="sidebar-header">
              <div className="sidebar-title">Nearby Places</div>
              <div className="sidebar-count">
                {places.length > 0 ? `${places.length} places found` : "No results yet"}
              </div>
            </div>

            {status && (
              <div className="status-msg">
                <span className="status-icon">
                  {status.includes("denied") ? "🚫" : status.includes("Failed") ? "⚠️" : "📍"}
                </span>
                {status}
              </div>
            )}

            {!status && places.length === 0 && !loading && (
              <div className="status-msg">
                <span className="status-icon">🗺️</span>
                Click "Find Places Near Me" to discover what's around you.
              </div>
            )}

            {places.map((place, i) => (
              <div
                key={i}
                className={`place-item ${selectedPlace?.id === place.id ? "selected" : ""}`}
                onClick={() => setSelectedPlace(place)}
              >
                <div className="place-name">{place.name}</div>
                <div className="place-type">{place.type}</div>
                <div className="place-meta">
                  {place.distance && (
                    <span className="place-dist">{place.distance}</span>
                  )}
                  {place.opening_hours && (
                    <span className={`place-open ${place.opening_hours === "Open" ? "open" : "closed"}`}>
                      {place.opening_hours}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Map */}
          <div className="map-container">
            <NearbyMap
              userCoords={userCoords}
              places={places}
              selectedPlace={selectedPlace}
              onPlaceSelect={setSelectedPlace}
              radius={radius}
            />
          </div>
        </div>
      </div>
    </>
  );
}