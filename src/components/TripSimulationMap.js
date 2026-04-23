"use client";
import { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const makeIcon = (color, emoji) => L.divIcon({
  className: "",
  html: `<div style="
    width:36px;height:36px;border-radius:50%;
    background:${color};border:3px solid white;
    display:flex;align-items:center;justify-content:center;
    font-size:16px;box-shadow:0 0 14px ${color}99;
  ">${emoji}</div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
  popupAnchor: [0, -20],
});

const movingIcon = L.divIcon({
  className: "",
  html: `<div style="
    width:28px;height:28px;border-radius:50%;
    background:linear-gradient(135deg,#f59e0b,#ef4444);
    border:3px solid white;
    display:flex;align-items:center;justify-content:center;
    font-size:13px;
    box-shadow:0 0 16px rgba(245,158,11,0.8);
    animation:movePulse 1s ease-in-out infinite;
  ">🚗</div>
  <style>@keyframes movePulse{0%,100%{transform:scale(1);}50%{transform:scale(1.15);}}</style>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

function FitBounds({ coords }) {
  const map = useMap();
  useEffect(() => {
    if (coords && coords.length >= 2) {
      const bounds = L.latLngBounds(coords.map(c => [c.lat, c.lng]));
      map.fitBounds(bounds, { padding: [60, 60] });
    }
  }, [coords, map]);
  return null;
}

export default function TripSimulationMap({ trip, simulating }) {
  const [routeCoords, setRouteCoords] = useState([]);
  const [drawnLine, setDrawnLine] = useState([]);
  const [markerPos, setMarkerPos] = useState(null);
  const [status, setStatus] = useState("Fetching route...");
  const [simDone, setSimDone] = useState(false);
  const animRef = useRef(null);

  // Geocode a place name
  const geocode = async (place) => {
    const res = await fetch(
      `https://api.openrouteservice.org/geocode/search?api_key=${process.env.NEXT_PUBLIC_ORS_API_KEY}&text=${encodeURIComponent(place)}&size=1`
    );
    const data = await res.json();
    if (!data.features?.length) throw new Error(`Can't find: ${place}`);
    const [lng, lat] = data.features[0].geometry.coordinates;
    return { lat, lng };
  };

  // Get route polyline from ORS
  const getRoutePolyline = async (startCoord, endCoord) => {
    const res = await fetch("https://api.openrouteservice.org/v2/directions/driving-car/geojson", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: process.env.NEXT_PUBLIC_ORS_API_KEY },
      body: JSON.stringify({ coordinates: [[startCoord.lng, startCoord.lat], [endCoord.lng, endCoord.lat]] }),
    });
    const data = await res.json();
    if (!data.features?.length) throw new Error("No route found");
    return data.features[0].geometry.coordinates.map(([lng, lat]) => ({ lat, lng }));
  };

  useEffect(() => {
    let cancelled = false;
    const init = async () => {
      try {
        setStatus("Finding locations...");
        const [start, end] = await Promise.all([
          geocode(trip.start_place),
          geocode(trip.end_place),
        ]);

        setStatus("Drawing route...");
        const coords = await getRoutePolyline(start, end);
        if (cancelled) return;
        setRouteCoords(coords);
        setStatus("");

        if (simulating) {
          animateRoute(coords);
        } else {
          setDrawnLine(coords);
          setSimDone(true);
        }
      } catch (e) {
        if (!cancelled) setStatus(`Error: ${e.message}`);
      }
    };
    init();
    return () => { cancelled = true; clearTimeout(animRef.current); };
  }, [trip, simulating]);

  const animateRoute = (coords) => {
    setDrawnLine([]);
    setMarkerPos(coords[0]);
    setSimDone(false);
    let i = 0;
    const step = Math.max(1, Math.floor(coords.length / 200)); // ~200 steps max

    const tick = () => {
      i += step;
      if (i >= coords.length) {
        setDrawnLine(coords);
        setMarkerPos(null);
        setSimDone(true);
        return;
      }
      setDrawnLine(coords.slice(0, i));
      setMarkerPos(coords[i]);
      animRef.current = setTimeout(tick, 30);
    };
    tick();
  };

  const startCoord = routeCoords[0];
  const endCoord = routeCoords[routeCoords.length - 1];

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      {/* Status overlay */}
      {status && (
        <div style={{
          position: "absolute", inset: 0, zIndex: 500,
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          background: "rgba(8,11,18,0.8)", backdropFilter: "blur(4px)",
          fontFamily: "sans-serif", color: "#93c5fd", fontSize: "14px", gap: "12px",
        }}>
          <span style={{ fontSize: "32px" }}>🗺️</span>
          {status}
        </div>
      )}

      {/* Sim done badge */}
      {simDone && (
        <div style={{
          position: "absolute", top: "16px", left: "50%", transform: "translateX(-50%)",
          zIndex: 400, background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.3)",
          borderRadius: "20px", padding: "8px 18px", color: "#6ee7b7",
          fontFamily: "sans-serif", fontSize: "13px", backdropFilter: "blur(8px)",
        }}>
          ✓ Route complete · {trip.start_place} → {trip.end_place}
        </div>
      )}

      {/* Replay button */}
      {simDone && simulating && (
        <button onClick={() => animateRoute(routeCoords)} style={{
          position: "absolute", bottom: "24px", left: "50%", transform: "translateX(-50%)",
          zIndex: 400, padding: "10px 22px",
          background: "linear-gradient(135deg,#3b82f6,#10b981)",
          border: "none", borderRadius: "10px", color: "#fff",
          fontFamily: "sans-serif", fontSize: "13px", fontWeight: 600,
          cursor: "pointer",
        }}>
          ↺ Replay Simulation
        </button>
      )}

      <MapContainer
        center={[20.5937, 78.9629]}
        zoom={5}
        style={{ width: "100%", height: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {routeCoords.length > 0 && <FitBounds coords={routeCoords} />}

        {/* Full ghost route */}
        {routeCoords.length > 0 && (
          <Polyline
            positions={routeCoords.map(c => [c.lat, c.lng])}
            pathOptions={{ color: "rgba(59,130,246,0.15)", weight: 5, dashArray: "6 4" }}
          />
        )}

        {/* Animated drawn line */}
        {drawnLine.length > 1 && (
          <Polyline
            positions={drawnLine.map(c => [c.lat, c.lng])}
            pathOptions={{ color: "#3b82f6", weight: 5, lineCap: "round", lineJoin: "round" }}
          />
        )}

        {/* Start marker */}
        {startCoord && (
          <Marker position={[startCoord.lat, startCoord.lng]} icon={makeIcon("#10b981", "🟢")}>
            <Popup><strong>Start:</strong> {trip.start_place}</Popup>
          </Marker>
        )}

        {/* End marker */}
        {endCoord && simDone && (
          <Marker position={[endCoord.lat, endCoord.lng]} icon={makeIcon("#ef4444", "🏁")}>
            <Popup><strong>End:</strong> {trip.end_place}</Popup>
          </Marker>
        )}

        {/* Moving marker */}
        {markerPos && (
          <Marker position={[markerPos.lat, markerPos.lng]} icon={movingIcon} />
        )}
      </MapContainer>
    </div>
  );
}