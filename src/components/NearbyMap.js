"use client";
import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix default Leaflet icon paths broken by webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Glowing user location pin
const userIcon = L.divIcon({
  className: "",
  html: `
    <div style="position:relative;width:24px;height:24px;">
      <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);
        width:52px;height:52px;border-radius:50%;
        background:rgba(59,130,246,0.15);
        animation:userPulse 2s ease-out infinite;"></div>
      <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);
        width:20px;height:20px;border-radius:50%;
        background:linear-gradient(135deg,#3b82f6,#10b981);
        border:3px solid white;
        box-shadow:0 0 14px rgba(59,130,246,0.7);"></div>
    </div>
    <style>
      @keyframes userPulse {
        0%{transform:translate(-50%,-50%) scale(1);opacity:0.8;}
        100%{transform:translate(-50%,-50%) scale(2.8);opacity:0;}
      }
    </style>
  `,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
  popupAnchor: [0, -16],
});

// Place pin icon with color
const makePlaceIcon = (selected) => L.divIcon({
  className: "",
  html: `
    <div style="
      width:${selected ? "16px" : "12px"};
      height:${selected ? "16px" : "12px"};
      border-radius:50%;
      background:${selected ? "#f59e0b" : "#10b981"};
      border:2px solid white;
      box-shadow:0 0 ${selected ? "12px rgba(245,158,11,0.8)" : "6px rgba(16,185,129,0.5)"};
      transition:all 0.2s;
    "></div>
  `,
  iconSize: [selected ? 16 : 12, selected ? 16 : 12],
  iconAnchor: [selected ? 8 : 6, selected ? 8 : 6],
  popupAnchor: [0, -10],
});

// Fly to user location when coords change
function FlyTo({ coords }) {
  const map = useMap();
  useEffect(() => {
    if (coords) map.flyTo([coords.lat, coords.lng], 14, { duration: 1.8 });
  }, [coords, map]);
  return null;
}

// Pan to selected place
function PanToSelected({ place }) {
  const map = useMap();
  useEffect(() => {
    if (place) map.panTo([place.lat, place.lng], { animate: true, duration: 0.8 });
  }, [place]);
  return null;
}

export default function NearbyMap({ userCoords, places, selectedPlace, onPlaceSelect, radius }) {
  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      {/* Empty state overlay */}
      {!userCoords && (
        <div style={{
          position: "absolute", inset: 0, zIndex: 500,
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          background: "rgba(8,11,18,0.75)",
          backdropFilter: "blur(4px)",
          fontFamily: "sans-serif", textAlign: "center",
          pointerEvents: "none",
        }}>
          <div style={{ fontSize: "48px", marginBottom: "14px", opacity: 0.4 }}>📍</div>
          <div style={{ fontSize: "15px", color: "rgba(200,210,230,0.5)", fontWeight: 300 }}>
            Click "Find Places Near Me" to start
          </div>
        </div>
      )}

      <MapContainer
        center={[20.5937, 78.9629]}
        zoom={5}
        style={{ width: "100%", height: "100%" }}
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {userCoords && (
          <>
            <FlyTo coords={userCoords} />

            {/* User location marker */}
            <Marker position={[userCoords.lat, userCoords.lng]} icon={userIcon}>
              <Popup>
                <div style={{ fontFamily: "sans-serif", fontSize: "13px" }}>
                  <strong style={{ color: "#3b82f6" }}>📍 You are here</strong>
                </div>
              </Popup>
            </Marker>

            {/* Radius circle */}
            <Circle
              center={[userCoords.lat, userCoords.lng]}
              radius={radius}
              pathOptions={{
                color: "rgba(59,130,246,0.5)",
                fillColor: "rgba(59,130,246,0.05)",
                fillOpacity: 1,
                weight: 1.5,
                dashArray: "6 4",
              }}
            />
          </>
        )}

        {/* Place markers */}
        {places.map((place, i) => {
          const isSelected = selectedPlace?.id === place.id;
          return (
            <Marker
              key={i}
              position={[place.lat, place.lng]}
              icon={makePlaceIcon(isSelected)}
              eventHandlers={{ click: () => onPlaceSelect(place) }}
            >
              <Popup>
                <div style={{ fontFamily: "sans-serif", fontSize: "13px", minWidth: "160px" }}>
                  <strong style={{ color: "#0f172a", fontSize: "14px" }}>{place.name}</strong>
                  <div style={{ color: "#64748b", fontSize: "12px", marginTop: "3px", textTransform: "capitalize" }}>
                    {place.type}
                  </div>
                  {place.distance && (
                    <div style={{ marginTop: "6px", color: "#3b82f6", fontSize: "12px", fontWeight: 600 }}>
                      📏 {place.distance} away
                    </div>
                  )}
                  {place.address && (
                    <div style={{ marginTop: "4px", color: "#94a3b8", fontSize: "11px" }}>
                      {place.address}
                    </div>
                  )}
                  {place.opening_hours && (
                    <div style={{
                      marginTop: "6px", fontSize: "11px", fontWeight: 600,
                      color: place.opening_hours === "Open" ? "#10b981" : "#ef4444"
                    }}>
                      {place.opening_hours === "Open" ? "✓ Open now" : "✗ Closed"}
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}

        {selectedPlace && <PanToSelected place={selectedPlace} />}
      </MapContainer>
    </div>
  );
}