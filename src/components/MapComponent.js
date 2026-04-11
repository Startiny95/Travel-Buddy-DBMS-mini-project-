"use client";
import { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix default marker icons broken by webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Custom glowing pin icon
const glowIcon = L.divIcon({
  className: "",
  html: `
    <div style="
      position: relative;
      width: 24px; height: 24px;
    ">
      <div style="
        position: absolute;
        top: 50%; left: 50%;
        transform: translate(-50%, -50%);
        width: 48px; height: 48px;
        border-radius: 50%;
        background: rgba(124, 58, 237, 0.2);
        animation: pulse 2s ease-out infinite;
      "></div>
      <div style="
        position: absolute;
        top: 50%; left: 50%;
        transform: translate(-50%, -50%);
        width: 20px; height: 20px;
        border-radius: 50%;
        background: linear-gradient(135deg, #7c3aed, #3b82f6);
        border: 3px solid white;
        box-shadow: 0 0 12px rgba(124,58,237,0.7);
      "></div>
    </div>
    <style>
      @keyframes pulse {
        0% { transform: translate(-50%,-50%) scale(1); opacity: 0.8; }
        100% { transform: translate(-50%,-50%) scale(2.5); opacity: 0; }
      }
    </style>
  `,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
  popupAnchor: [0, -16],
});

// Component to fly to location once found
function FlyToLocation({ coords }) {
  const map = useMap();
  useEffect(() => {
    if (coords) {
      map.flyTo([coords.lat, coords.lng], 16, { duration: 2 });
    }
  }, [coords, map]);
  return null;
}

export default function MapComponent() {
  const [userCoords, setUserCoords] = useState(null);
  const [locationStatus, setLocationStatus] = useState("Requesting location...");
  const [address, setAddress] = useState("");

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationStatus("Geolocation not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserCoords(coords);
        setLocationStatus("Location found!");

        // Reverse geocode to get address (free, no API key)
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${coords.lat}&lon=${coords.lng}&format=json`
          );
          const data = await res.json();
          setAddress(data.display_name || "Your location");
        } catch {
          setAddress("Your location");
        }
      },
      (err) => {
        setLocationStatus("Location access denied. Please allow location access.");
      },
      { enableHighAccuracy: true }
    );
  }, []);

  return (
    <div style={{ width: "100vw", height: "100vh", position: "relative" }}>
      <MapContainer
        center={[20, 0]}
        zoom={2}
        style={{ width: "100%", height: "100%" }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {userCoords && (
          <>
            <FlyToLocation coords={userCoords} />
            <Marker position={[userCoords.lat, userCoords.lng]} icon={glowIcon}>
              <Popup>
                <div style={{ fontFamily: "sans-serif", fontSize: "13px", maxWidth: "200px" }}>
                  <strong style={{ color: "#7c3aed" }}>📍 You are here</strong>
                  <br />
                  <span style={{ color: "#555", fontSize: "12px" }}>{address}</span>
                </div>
              </Popup>
            </Marker>
          </>
        )}
      </MapContainer>

      {/* Status toast */}
      {locationStatus && (
        <div style={{
          position: "absolute",
          bottom: "28px",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 1000,
          background: "rgba(10,10,20,0.88)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(167,139,250,0.25)",
          borderRadius: "10px",
          padding: "10px 20px",
          color: "#c4b5fd",
          fontFamily: "sans-serif",
          fontSize: "13px",
          whiteSpace: "nowrap",
        }}>
          {locationStatus === "Location found!"
            ? `📍 ${address || "Pinned your location"}`
            : locationStatus}
        </div>
      )}
    </div>
  );
}