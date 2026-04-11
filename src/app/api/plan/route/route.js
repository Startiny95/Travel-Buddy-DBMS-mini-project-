import { NextResponse } from "next/server";

const ORS_KEY = process.env.ORS_API_KEY;

// Convert a place name to [lng, lat] coordinates
async function geocode(place) {
  const res = await fetch(
    `https://api.openrouteservice.org/geocode/search?api_key=${ORS_KEY}&text=${encodeURIComponent(place)}&size=1`,
    { headers: { Accept: "application/json" } }
  );

  if (!res.ok) {
    const text = await res.text();
    console.error("Geocode error:", text);
    throw new Error(`Geocoding failed for "${place}"`);
  }

  const data = await res.json();

  if (!data.features || data.features.length === 0) {
    throw new Error(`Could not find location: "${place}"`);
  }

  const coords = data.features[0].geometry.coordinates; // [lng, lat]
  const label = data.features[0].properties.label;
  console.log(`Geocoded "${place}" → ${label} [${coords}]`);
  return coords;
}

// Get driving distance and duration between two coordinate pairs
async function getRoute(coordA, coordB) {
  const body = {
    coordinates: [coordA, coordB],
  };

  const res = await fetch(
    `https://api.openrouteservice.org/v2/directions/driving-car`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: ORS_KEY,
        Accept: "application/json, application/geo+json",
      },
      body: JSON.stringify(body),
    }
  );

  if (!res.ok) {
    const text = await res.text();
    console.error("Route API error:", text);
    throw new Error("Could not calculate route between these locations.");
  }

  const data = await res.json();

  if (!data.routes || data.routes.length === 0) {
    throw new Error("No route found between these locations.");
  }

  const summary = data.routes[0].summary;
  return {
    distanceMeters: summary.distance,
    durationSeconds: summary.duration,
  };
}

export async function POST(request) {
  try {
    const { source, destination, midpoint } = await request.json();

    if (!source || !destination) {
      return NextResponse.json(
        { error: "Source and destination are required." },
        { status: 400 }
      );
    }

    const legs = [];

    if (midpoint) {
      // Multi-leg: source → midpoint → destination
      const [coordA, coordB, coordC] = await Promise.all([
        geocode(source),
        geocode(midpoint),
        geocode(destination),
      ]);

      const [leg1, leg2] = await Promise.all([
        getRoute(coordA, coordB),
        getRoute(coordB, coordC),
      ]);

      legs.push({ from: source, to: midpoint, ...leg1 });
      legs.push({ from: midpoint, to: destination, ...leg2 });
    } else {
      // Single leg: source → destination
      const [coordA, coordB] = await Promise.all([
        geocode(source),
        geocode(destination),
      ]);

      const leg = await getRoute(coordA, coordB);
      legs.push({ from: source, to: destination, ...leg });
    }

    return NextResponse.json({ legs });
  } catch (err) {
    console.error("Route error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}