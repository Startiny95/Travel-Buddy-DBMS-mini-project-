"use client";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";

const TripSimulationMap = dynamic(() => import("@/components/TripSimulationMap"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#0a0d14", color: "#93c5fd", fontSize: "14px" }}>
      Loading map...
    </div>
  ),
});

const TRANSPORT_ICONS = { train: "🚆", bus: "🚌", car: "🚗", bike: "🏍️", walk: "🚶", flight: "✈️", cab: "🚖", default: "🗺️" };

export default function TripsPage() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [simulating, setSimulating] = useState(false);
  const [view, setView] = useState("list"); // list | map
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState({ title: "", start_place: "", end_place: "", date: "", distance_km: "", transport: "car" });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => { fetchTrips(); }, []);

  const fetchTrips = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/trips");
      const data = await res.json();
      setTrips(data.trips || []);
    } catch { setTrips([]); }
    finally { setLoading(false); }
  };

  const handleAddTrip = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg("");
    try {
      const res = await fetch("/api/trips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        setMsg("Trip added!");
        setForm({ title: "", start_place: "", end_place: "", date: "", distance_km: "", transport: "car" });
        setShowAddForm(false);
        fetchTrips();
      } else { setMsg(data.error || "Failed to save."); }
    } catch { setMsg("Network error."); }
    finally { setSaving(false); }
  };

  const openSimulation = (trip) => {
    setSelectedTrip(trip);
    setSimulating(true);
    setView("map");
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cabinet+Grotesk:wght@500;700;800;900&family=Outfit:wght@300;400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #080b12; font-family: 'Outfit', sans-serif; color: #e2e8f0; }

        .page { min-height: 100vh; background: #080b12; }

        .navbar {
          display: flex; align-items: center; justify-content: space-between;
          padding: 16px 40px;
          background: rgba(8,11,18,0.95); backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(255,255,255,0.05);
          position: sticky; top: 0; z-index: 200;
        }
        .nav-brand { display: flex; align-items: center; gap: 10px; text-decoration: none; }
        .nav-logo { width: 34px; height: 34px; background: linear-gradient(135deg,#3b82f6,#10b981); border-radius: 9px; display: flex; align-items: center; justify-content: center; font-size: 16px; }
        .nav-title { font-family: 'Cabinet Grotesk', sans-serif; font-size: 17px; font-weight: 800; color: #f1f5f9; }
        .nav-right { display: flex; gap: 10px; align-items: center; }
        .back-btn { font-size: 12px; color: rgba(200,210,230,0.4); background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.07); border-radius: 8px; padding: 7px 14px; text-decoration: none; transition: all 0.2s; font-family: 'Outfit', sans-serif; }
        .back-btn:hover { color: #e2e8f0; background: rgba(255,255,255,0.08); }

        .main { max-width: 1100px; margin: 0 auto; padding: 48px 32px 80px; }

        .page-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 40px; animation: fadeUp 0.5s ease both; }
        .page-tag { font-size: 11px; font-weight: 500; letter-spacing: 0.12em; text-transform: uppercase; color: rgba(59,130,246,0.7); margin-bottom: 8px; }
        .page-title { font-family: 'Cabinet Grotesk', sans-serif; font-size: clamp(28px,4vw,42px); font-weight: 900; color: #f1f5f9; line-height: 1.1; letter-spacing: -0.5px; }
        .page-sub { font-size: 14px; color: rgba(200,210,230,0.35); font-weight: 300; margin-top: 8px; }

        .header-actions { display: flex; gap: 10px; flex-shrink: 0; margin-top: 8px; }

        .view-toggle { display: flex; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.07); border-radius: 10px; padding: 3px; }
        .vt-btn { padding: 7px 14px; border-radius: 7px; border: none; background: transparent; color: rgba(200,210,230,0.4); font-family: 'Outfit', sans-serif; font-size: 12px; cursor: pointer; transition: all 0.2s; }
        .vt-btn.active { background: rgba(59,130,246,0.15); color: #93c5fd; border: 1px solid rgba(59,130,246,0.25); }

        .add-btn { display: flex; align-items: center; gap: 6px; padding: 9px 18px; background: linear-gradient(135deg,#3b82f6,#10b981); border: none; border-radius: 10px; color: #fff; font-family: 'Cabinet Grotesk', sans-serif; font-size: 13px; font-weight: 800; cursor: pointer; transition: all 0.2s; }
        .add-btn:hover { opacity: 0.85; transform: translateY(-1px); }

        /* Add form */
        .add-form-card {
          background: rgba(255,255,255,0.03); border: 1px solid rgba(59,130,246,0.2);
          border-radius: 18px; padding: 28px; margin-bottom: 32px;
          animation: fadeUp 0.3s ease both;
        }
        .form-title { font-family: 'Cabinet Grotesk', sans-serif; font-size: 16px; font-weight: 800; color: #f1f5f9; margin-bottom: 20px; }
        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 16px; }
        .field label { display: block; font-size: 10px; font-weight: 500; letter-spacing: 0.1em; text-transform: uppercase; color: rgba(200,210,230,0.3); margin-bottom: 6px; }
        .field input, .field select {
          width: 100%; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px; padding: 11px 14px; color: #e8e0ff;
          font-family: 'Outfit', sans-serif; font-size: 13px; outline: none;
          transition: border-color 0.2s;
        }
        .field input:focus, .field select:focus { border-color: rgba(59,130,246,0.4); }
        .field input::placeholder { color: rgba(200,190,230,0.2); }
        .field select option { background: #1a1825; }
        .form-actions { display: flex; gap: 10px; }
        .save-btn { padding: 10px 22px; background: linear-gradient(135deg,#3b82f6,#10b981); border: none; border-radius: 9px; color: #fff; font-family: 'Cabinet Grotesk', sans-serif; font-size: 13px; font-weight: 800; cursor: pointer; transition: opacity 0.2s; }
        .save-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .cancel-btn { padding: 10px 18px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 9px; color: rgba(200,210,230,0.4); font-family: 'Outfit', sans-serif; font-size: 13px; cursor: pointer; transition: all 0.2s; }
        .form-msg { margin-top: 10px; font-size: 12px; color: #6ee7b7; }

        /* Trips grid */
        .trips-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 18px; animation: fadeUp 0.5s ease 0.1s both; }

        .trip-card {
          background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06);
          border-radius: 18px; overflow: hidden; transition: all 0.25s; cursor: pointer;
        }
        .trip-card:hover { transform: translateY(-3px); border-color: rgba(255,255,255,0.1); box-shadow: 0 12px 32px rgba(0,0,0,0.3); }
        .trip-card.active { border-color: rgba(59,130,246,0.4); box-shadow: 0 0 24px rgba(59,130,246,0.1); }

        .trip-card-top { padding: 22px 22px 16px; }
        .trip-transport-icon { font-size: 28px; margin-bottom: 12px; display: block; }
        .trip-title { font-family: 'Cabinet Grotesk', sans-serif; font-size: 17px; font-weight: 800; color: #f1f5f9; margin-bottom: 6px; }
        .trip-route { font-size: 13px; color: rgba(200,210,230,0.4); margin-bottom: 12px; display: flex; align-items: center; gap: 6px; }
        .route-arrow { color: rgba(200,210,230,0.2); }
        .trip-tags { display: flex; gap: 8px; flex-wrap: wrap; }
        .tag { font-size: 10px; font-weight: 500; padding: 3px 9px; border-radius: 20px; text-transform: uppercase; letter-spacing: 0.05em; }
        .tag-date { background: rgba(255,255,255,0.05); color: rgba(200,210,230,0.4); }
        .tag-dist { background: rgba(59,130,246,0.1); color: #93c5fd; border: 1px solid rgba(59,130,246,0.2); }
        .tag-transport { background: rgba(16,185,129,0.1); color: #6ee7b7; border: 1px solid rgba(16,185,129,0.2); }
        .tag-google { background: rgba(234,67,53,0.1); color: #fca5a5; border: 1px solid rgba(234,67,53,0.2); }

        .trip-card-bottom { padding: 14px 22px; border-top: 1px solid rgba(255,255,255,0.04); display: flex; gap: 8px; }
        .sim-btn { flex: 1; padding: 9px; background: rgba(59,130,246,0.1); border: 1px solid rgba(59,130,246,0.2); border-radius: 9px; color: #93c5fd; font-family: 'Outfit', sans-serif; font-size: 12px; font-weight: 500; cursor: pointer; transition: all 0.2s; }
        .sim-btn:hover { background: rgba(59,130,246,0.2); }
        .del-btn { padding: 9px 12px; background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.15); border-radius: 9px; color: rgba(252,165,165,0.6); font-size: 12px; cursor: pointer; transition: all 0.2s; }
        .del-btn:hover { background: rgba(239,68,68,0.15); color: #fca5a5; }

        /* Empty state */
        .empty { grid-column: 1/-1; text-align: center; padding: 64px 20px; background: rgba(255,255,255,0.02); border: 1px dashed rgba(255,255,255,0.06); border-radius: 18px; }
        .empty-icon { font-size: 48px; opacity: 0.3; margin-bottom: 16px; }
        .empty-title { font-family: 'Cabinet Grotesk', sans-serif; font-size: 18px; font-weight: 800; color: rgba(200,210,230,0.3); margin-bottom: 8px; }
        .empty-sub { font-size: 13px; color: rgba(200,210,230,0.2); font-weight: 300; }

        /* Map view */
        .map-view { height: calc(100vh - 80px); display: flex; flex-direction: column; }
        .map-header { padding: 16px 32px; display: flex; align-items: center; gap: 14px; border-bottom: 1px solid rgba(255,255,255,0.05); flex-shrink: 0; }
        .map-trip-title { font-family: 'Cabinet Grotesk', sans-serif; font-size: 16px; font-weight: 800; color: #f1f5f9; }
        .map-trip-sub { font-size: 12px; color: rgba(200,210,230,0.3); margin-top: 2px; }
        .back-to-list { padding: 7px 14px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; color: rgba(200,210,230,0.4); font-size: 12px; cursor: pointer; font-family: 'Outfit', sans-serif; transition: all 0.2s; }
        .back-to-list:hover { color: #e2e8f0; }
        .map-body { flex: 1; }

        .loading-state { text-align: center; padding: 80px 20px; color: rgba(200,210,230,0.3); font-size: 14px; }
        .loading-icon { font-size: 36px; margin-bottom: 14px; display: block; animation: spin 2s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

        @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }

        @media (max-width: 600px) {
          .main { padding: 28px 16px 60px; }
          .navbar { padding: 14px 16px; }
          .page-header { flex-direction: column; gap: 16px; }
          .form-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="page">
        <nav className="navbar">
          <Link href="/home" className="nav-brand">
            <div className="nav-logo">🧭</div>
            <span className="nav-title">Wandr</span>
          </Link>
          <div className="nav-right">
            <Link href="/home" className="back-btn">← Dashboard</Link>
          </div>
        </nav>

        {/* Map simulation view */}
        {view === "map" && selectedTrip && (
          <div className="map-view">
            <div className="map-header">
              <button className="back-to-list" onClick={() => { setView("list"); setSimulating(false); }}>← Back to list</button>
              <div>
                <div className="map-trip-title">🗺️ {selectedTrip.title}</div>
                <div className="map-trip-sub">{selectedTrip.start_place} → {selectedTrip.end_place}</div>
              </div>
            </div>
            <div className="map-body">
              <TripSimulationMap trip={selectedTrip} simulating={simulating} />
            </div>
          </div>
        )}

        {/* List view */}
        {view === "list" && (
          <main className="main">
            <div className="page-header">
              <div>
                <p className="page-tag">✦ My Journeys</p>
                <h1 className="page-title">My Trips</h1>
                <p className="page-sub">Every road you've ever taken, in one place.</p>
              </div>
              <div className="header-actions">
                <div className="view-toggle">
                  <button className={`vt-btn ${view === "list" ? "active" : ""}`} onClick={() => setView("list")}>≡ List</button>
                  <button className={`vt-btn ${view === "map" && !selectedTrip ? "active" : ""}`} onClick={() => { if (trips.length > 0) { setSelectedTrip(trips[0]); setSimulating(false); setView("map"); } }}>🗺 Map</button>
                </div>
                <button className="add-btn" onClick={() => setShowAddForm(!showAddForm)}>
                  + Add Trip
                </button>
              </div>
            </div>

            {/* Add trip form */}
            {showAddForm && (
              <div className="add-form-card">
                <div className="form-title">Add a Past Trip</div>
                <form onSubmit={handleAddTrip}>
                  <div className="form-grid">
                    <div className="field" style={{ gridColumn: "1/-1" }}>
                      <label>Trip Title</label>
                      <input placeholder="e.g. Mumbai to Goa Trip" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
                    </div>
                    <div className="field">
                      <label>From</label>
                      <input placeholder="e.g. Mumbai" value={form.start_place} onChange={e => setForm({ ...form, start_place: e.target.value })} required />
                    </div>
                    <div className="field">
                      <label>To</label>
                      <input placeholder="e.g. Goa" value={form.end_place} onChange={e => setForm({ ...form, end_place: e.target.value })} required />
                    </div>
                    <div className="field">
                      <label>Date</label>
                      <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required />
                    </div>
                    <div className="field">
                      <label>Distance (km)</label>
                      <input type="number" placeholder="e.g. 580" value={form.distance_km} onChange={e => setForm({ ...form, distance_km: e.target.value })} />
                    </div>
                    <div className="field">
                      <label>Transport</label>
                      <select value={form.transport} onChange={e => setForm({ ...form, transport: e.target.value })}>
                        <option value="car">🚗 Car</option>
                        <option value="train">🚆 Train</option>
                        <option value="bus">🚌 Bus</option>
                        <option value="flight">✈️ Flight</option>
                        <option value="bike">🏍️ Bike</option>
                        <option value="cab">🚖 Cab</option>
                        <option value="walk">🚶 Walk</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-actions">
                    <button type="submit" className="save-btn" disabled={saving}>{saving ? "Saving..." : "Save Trip"}</button>
                    <button type="button" className="cancel-btn" onClick={() => setShowAddForm(false)}>Cancel</button>
                  </div>
                  {msg && <div className="form-msg">{msg}</div>}
                </form>
              </div>
            )}

            {loading ? (
              <div className="loading-state">
                <span className="loading-icon">🧭</span>
                Loading your trips...
              </div>
            ) : (
              <div className="trips-grid">
                {trips.length === 0 ? (
                  <div className="empty">
                    <div className="empty-icon">🧳</div>
                    <div className="empty-title">No trips yet</div>
                    <div className="empty-sub">Add a past trip or import your Google Timeline to get started.</div>
                  </div>
                ) : trips.map((trip) => (
                  <div key={trip.id} className={`trip-card ${selectedTrip?.id === trip.id ? "active" : ""}`}>
                    <div className="trip-card-top" onClick={() => setSelectedTrip(trip)}>
                      <span className="trip-transport-icon">
                        {TRANSPORT_ICONS[trip.transport] || TRANSPORT_ICONS.default}
                      </span>
                      <div className="trip-title">{trip.title}</div>
                      <div className="trip-route">
                        <span>{trip.start_place}</span>
                        <span className="route-arrow">→</span>
                        <span>{trip.end_place}</span>
                      </div>
                      <div className="trip-tags">
                        {trip.date && <span className="tag tag-date">📅 {new Date(trip.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>}
                        {trip.distance_km && <span className="tag tag-dist">📏 {trip.distance_km} km</span>}
                        {trip.transport && <span className="tag tag-transport">{trip.transport}</span>}
                        {trip.is_imported_from_google ? <span className="tag tag-google">🇬 Google Timeline</span> : null}
                      </div>
                    </div>
                    <div className="trip-card-bottom">
                      <button className="sim-btn" onClick={() => openSimulation(trip)}>
                        ▶ Show Simulation
                      </button>
                      <button className="del-btn" onClick={async () => {
                        await fetch(`/api/trips/${trip.id}`, { method: "DELETE" });
                        fetchTrips();
                      }}>🗑</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </main>
        )}
      </div>
    </>
  );
}